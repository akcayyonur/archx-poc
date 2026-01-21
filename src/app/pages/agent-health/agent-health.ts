import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ChartConfiguration, ChartData, ScriptableContext } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';
import { DatePickerModule } from 'primeng/datepicker';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorCaretLeft, phosphorLinkSimple } from '@ng-icons/phosphor-icons/regular';
import { Sidebar } from '@shared/components/sidebar/sidebar';
import { IntegrationStateService } from '@shared/services/integration-state.service';
import { DEMO_AGENTS, DEMO_AGENT_HEALTH_METRICS } from '@shared/constants/demo-data.constants';
import { Agent, AgentHealthMetrics } from '@shared/models/demo-data.model';

@Component({
  selector: 'app-agent-health',
  standalone: true,
  imports: [CommonModule, FormsModule, Sidebar, NgChartsModule, DatePickerModule, NgIcon],
  viewProviders: [provideIcons({ phosphorCaretLeft, phosphorLinkSimple })],
  templateUrl: './agent-health.html',
  styleUrl: './agent-health.scss'
})
export class AgentHealth implements OnInit, OnDestroy {
  private integrationsSubscription?: Subscription;

  scoreSegments: number[] = Array.from({ length: 16 }, (_, idx) => idx);
  primaryScorePercent = 0;
  trainingProgressPercent = 0;
  dqsGaugeChartData!: ChartData<'doughnut'>;
  dqsGaugeChartOptions!: ChartConfiguration<'doughnut'>['options'];
  dateRange: { start: Date | null; end: Date | null } = {
    start: AgentHealth.parseDateTime('04.09.2024 12:25'),
    end: AgentHealth.parseDateTime('14.09.2025 12:25')
  };

  agents: Agent[] = [];
  agentId: string = '';
  agentMetrics: AgentHealthMetrics | null = null;
  isAgentIntegrated: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private integrationStateService: IntegrationStateService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.agentId = params['agentId'];
      
      // Subscribe to integrations to check if this agent is integrated
      this.integrationsSubscription = this.integrationStateService.integrations$.subscribe(
        integrations => {
          const activeAgentIds = integrations.map(i => i.agentId);
          this.isAgentIntegrated = activeAgentIds.includes(this.agentId);
          
          // Filter agents list to only show integrated agents
          this.agents = DEMO_AGENTS.filter(a => activeAgentIds.includes(a.id));
          
          // Only load metrics if agent is integrated
          if (this.isAgentIntegrated) {
            this.loadAgentMetrics();
          } else {
            // Redirect to agents overview if agent is not integrated
            console.warn(`Agent ${this.agentId} is not integrated. Redirecting...`);
            this.router.navigate(['/agents-overview']);
          }
        }
      );
    });
  }

  ngOnDestroy(): void {
    if (this.integrationsSubscription) {
      this.integrationsSubscription.unsubscribe();
    }
  }

  loadAgentMetrics(): void {
    this.agentMetrics = DEMO_AGENT_HEALTH_METRICS.find(m => m.agentId === this.agentId) || null;
    
    if (this.agentMetrics) {
      this.initializeCharts();
    } else {
      console.error('Agent metrics not found');
      this.router.navigate(['/agents-overview']);
    }
  }

  initializeCharts(): void {
    if (!this.agentMetrics) return;

    this.initDQSGaugeChart();
    this.primaryScorePercent = this.getPrimaryScorePercent();
    this.trainingProgressPercent = this.getTrainingProgressPercent();
  }

  initDQSGaugeChart(): void {
    if (!this.agentMetrics) return;

    const score = this.agentMetrics.dataQuality.dataQualityScore;
    this.dqsGaugeChartData = {
      labels: ['Score', 'Remaining'],
      datasets: [{
        data: [score, Math.max(0, 100 - score)],
        backgroundColor: (ctx: ScriptableContext<'doughnut'>) => {
          if (ctx.dataIndex === 0) {
            return this.getSuccessGaugeGradient(ctx);
          }
          return 'rgba(255, 255, 255, 0.12)';
        },
        borderWidth: 0
      }]
    };

    this.dqsGaugeChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      circumference: 180,
      rotation: 270,
      cutout: '78%',
      layout: {
        padding: 12
      },
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false }
      }
    };
  }

  getJobStatusLabel(status: string): string {
    switch (status) {
      case 'SUCCESS':
        return 'Running';
      case 'FAILED':
        return 'Stopped';
      case 'WARNING':
        return 'Warning';
      case 'RUNNING':
        return 'Running';
      default:
        return status.charAt(0) + status.slice(1).toLowerCase();
    }
  }

  getStatusBadgeClass(status: string): string {
    return `status-${status.toLowerCase()}`;
  }

  getDataVolumeDescriptor(recordCount: number): string {
    if (recordCount >= 2_000_000) {
      return 'Heavy';
    }
    if (recordCount >= 1_000_000) {
      return 'Moderate';
    }
    return 'Light';
  }

  formatMillions(value: number, decimals: number = 1): string {
    if (value >= 1_000_000) {
      return `${(value / 1_000_000).toFixed(decimals)} M`;
    }
    if (value >= 1_000) {
      return `${(value / 1_000).toFixed(decimals)} K`;
    }
    return value.toString();
  }

  formatBusinessCurrency(value: number): string {
    const formatted = Math.abs(value).toLocaleString('de-DE', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
    const prefix = value >= 0 ? '+' : '-';
    return `${prefix}${formatted}$`;
  }

  getPrimaryScorePercent(): number {
    if (!this.agentMetrics) {
      return 0;
    }

    const { primaryScoreType, primaryScoreValue } = this.agentMetrics.aiModel;
    let normalized = primaryScoreValue;

    if (primaryScoreType === 'F1-Score' || primaryScoreType === 'AUC') {
      normalized = primaryScoreValue * 100;
    } else if (primaryScoreType === 'RMSE' || primaryScoreType === 'MAE') {
      normalized = Math.max(0, 100 - primaryScoreValue * 5);
    }

    return Math.min(100, Math.max(0, normalized));
  }

  private getTrainingProgressPercent(): number {
    if (!this.agentMetrics) {
      return 0;
    }

    const baselineMinutes = 360; // target training duration for visualization
    return Math.min(100, Math.max(0, (this.agentMetrics.aiModel.trainingMinutes / baselineMinutes) * 100));
  }

  private getSuccessGaugeGradient(context: ScriptableContext<'doughnut'>): CanvasGradient | string {
    const { chart } = context;
    const { ctx, chartArea } = chart;

    if (!chartArea) {
      return '#48bb78';
    }

    const gradient = ctx.createLinearGradient(chartArea.left, chartArea.top, chartArea.right, chartArea.top);
    gradient.addColorStop(0, 'rgba(63, 36, 114, 0.25)');
    gradient.addColorStop(1, 'rgba(72, 187, 120, 0.95)');

    return gradient;
  }

  goBack(): void {
    this.router.navigate(['/agents-overview']);
  }

  formatDecimal(num: number, decimals: number = 1): string {
    return num.toFixed(decimals);
  }

  formatDate(dateString: string): string {
    if (!dateString) return '--';
    const parsed = new Date(dateString.replace(' ', 'T'));
    if (isNaN(parsed.getTime())) {
      return dateString;
    }
    return parsed.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric'
    });
  }

  formatTime(dateString: string): string {
    if (!dateString) return '--';
    const parsed = new Date(dateString.replace(' ', 'T'));
    if (isNaN(parsed.getTime())) {
      return dateString;
    }
    return parsed.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getDateTimeParts(dateString: string): { date: string; time: string } {
    if (!dateString) return { date: '--', time: '--' };
    const parsed = new Date(dateString.replace(' ', 'T'));
    if (isNaN(parsed.getTime())) {
      return { date: dateString, time: '' };
    }
    const date = parsed.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
    const time = parsed.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    return { date, time };
  }

  formatRunDuration(minutes: number | null | undefined): string {
    if (minutes === null || minutes === undefined) {
      return '--';
    }
    const hasFraction = minutes % 1 !== 0;
    const formatted = hasFraction ? minutes.toFixed(1) : minutes.toFixed(0);
    return formatted;
  }

  formatPrimaryScoreValue(): string {
    if (!this.agentMetrics) {
      return '--';
    }
    const { primaryScoreType, primaryScoreValue } = this.agentMetrics.aiModel;
    const normalizedType = primaryScoreType.toLowerCase();

    if (normalizedType.includes('accuracy') || normalizedType.includes('precision') || normalizedType.includes('recall')) {
      return `${this.formatDecimal(primaryScoreValue)}%`;
    }

    if (normalizedType.includes('score')) {
      return this.formatDecimal(primaryScoreValue, 2);
    }

    return this.formatDecimal(primaryScoreValue, 2);
  }

  isScoreBlockFilled(index: number): boolean {
    const totalBlocks = this.scoreSegments.length;
    const activeBlocks = (this.primaryScorePercent / 100) * totalBlocks;
    return index < activeBlocks;
  }

  private static parseDateTime(value: string): Date | null {
    const trimmed = value.trim();
    const [datePart, timePart] = trimmed.split(' ');

    if (!datePart || !timePart) {
      return null;
    }

    const [day, month, year] = datePart.split('.').map(Number);
    const [hour, minute] = timePart.split(':').map(Number);
    const parsed = new Date(year, (month ?? 1) - 1, day, hour, minute);

    return isNaN(parsed.getTime()) ? null : parsed;
  }
}


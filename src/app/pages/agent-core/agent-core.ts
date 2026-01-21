import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { 
  phosphorHeart, phosphorArrowClockwise, phosphorMagnifyingGlass, phosphorX, 
  phosphorBrain, phosphorNetwork, phosphorCpu, phosphorHardDrives, 
  phosphorDatabase, phosphorClock, phosphorWarning, phosphorGraph, phosphorPulse,
  phosphorCaretUp, phosphorCaretDown 
} from '@ng-icons/phosphor-icons/regular';
import { Sidebar } from '@shared/components/sidebar/sidebar';
import { IntegrationStateService } from '@shared/services/integration-state.service';
import { Subscription } from 'rxjs';
import { DEMO_AGENTS } from '@shared/constants/demo-data.constants';
import { Agent } from '@shared/models/demo-data.model';

export interface AnomalyDetail {
  id: string;
  anomalyType: string;
  entity: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  timestamp: Date;
  metrics: string[];
  duration: string;
  status: 'active' | 'resolved' | 'investigating';
}

@Component({
  selector: 'app-agent-core',
  standalone: true,
  imports: [CommonModule, FormsModule, NgChartsModule, Sidebar, NgIcon],
  viewProviders: [provideIcons({ 
    phosphorHeart, phosphorArrowClockwise, phosphorMagnifyingGlass, phosphorX, 
    phosphorBrain, phosphorNetwork, phosphorCpu, phosphorHardDrives, 
    phosphorDatabase, phosphorClock, phosphorWarning, phosphorGraph, phosphorPulse,
    phosphorCaretUp, phosphorCaretDown
  })],
  templateUrl: './agent-core.html',
  styleUrl: './agent-core.scss'
})
export class AgentCore implements OnInit, OnDestroy {
  private integrationsSubscription?: Subscription;
  
  agents: Agent[] = [];
  agentId: string = '';
  agent: Agent | null = null;
  isAgentIntegrated: boolean = false;
  
  // Check if this is the Root Cause Analysis agent
  get hasRootCauseAnalysis(): boolean {
    return this.agentId === 'root-cause-analysis';
  }

  // Anomaly data
  anomalies: AnomalyDetail[] = [];
  filteredAnomalies: AnomalyDetail[] = [];
  
  // Filters
  anomalyFilter: string = '';
  entityFilter: string = '';
  
  // Date range
  startDate: Date = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000); // 5 days ago
  endDate: Date = new Date();
  
  // Date strings for datetime-local inputs
  get startDateString(): string {
    return this.formatDateForInput(this.startDate);
  }
  
  set startDateString(value: string) {
    this.startDate = new Date(value);
  }
  
  get endDateString(): string {
    return this.formatDateForInput(this.endDate);
  }
  
  set endDateString(value: string) {
    this.endDate = new Date(value);
  }
  
  // Selected anomaly for detail view
  selectedAnomaly: AnomalyDetail | null = null;
  showDetailPanel: boolean = false;
  
  // Detail panel expanded sections
  expandedDetailSection: string | null = null;
  
  // Chart data for detail panel
  trendChartData!: ChartData<'line'>;
  trendChartOptions!: ChartConfiguration<'line'>['options'];
  correlationChartData!: ChartData<'line'>;
  correlationChartOptions!: ChartConfiguration<'line'>['options'];
  
  // Time range for trend chart
  trendTimeRange: '6h' | '12h' | '24h' = '24h';

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
          
          // Only load agent if it's integrated
          if (this.isAgentIntegrated) {
            this.loadAgent();
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

  loadAgent(): void {
    this.agent = this.agents.find(a => a.id === this.agentId) || null;
    
    if (!this.agent) {
      console.error('Agent not found or not integrated');
      this.router.navigate(['/agents-overview']);
      return;
    }
    
    // Only load anomalies if this agent has Root Cause Analysis
    if (this.hasRootCauseAnalysis) {
      this.loadAnomalies();
    }
  }

  loadAnomalies(): void {
    // Generate demo anomaly data
    this.anomalies = this.generateDemoAnomalies();
    this.applyFilters();
  }

  generateDemoAnomalies(): AnomalyDetail[] {
    const entities = [
      'MOBIL_IVR500 [HOST]',
      'MOBIL_ACME [HOST]',
      'umrlctxnsn05.it-tim.tr [HOST]',
      'yrsmwebapppo5.it-tim.tr [HOST]',
      'umwvdbt00.it-tim.tr [HOST]',
      'wyandotte.msy.justech.infra [HOST]',
      'dwhexa7cbadm02.it-tim.tr [HOST]',
      'mentorapp00.it-tim.tr [HOST]',
      'umrobcrprf01.it-tim.tr [HOST]',
      'hatgal03.justech.infra [HOST]'
    ];

    const metrics = [
      ['4 metrics (opsb_ext_app_performance)'],
      ['1 message cluster', '4 metrics (opsb_ext_app...)'],
      ['3 metrics (opsb_agent_node)'],
      ['3 metrics (opsb_agent_node)'],
      ['4 metrics (opsb_agent_node)'],
      ['4 metrics (opsb_agent_node)'],
      ['3 metrics (opsb_agent_node)'],
      ['4 metrics (opsb_agent_node)'],
      ['3 metrics (opsb_agent_node)'],
      ['4 metrics (opsb_agent_node)', '1 metric (opsb...)']
    ];

    const severities: ('critical' | 'high' | 'medium' | 'low')[] = 
      ['critical', 'critical', 'high', 'high', 'medium', 'high', 'medium', 'high', 'medium', 'high'];

    return entities.map((entity, index) => ({
      id: `anomaly-${index + 1}`,
      anomalyType: metrics[index].join(', '),
      entity: entity,
      severity: severities[index],
      timestamp: new Date(this.startDate.getTime() + Math.random() * (this.endDate.getTime() - this.startDate.getTime())),
      metrics: metrics[index],
      duration: `${Math.floor(Math.random() * 120) + 10}m`,
      status: Math.random() > 0.7 ? 'resolved' : Math.random() > 0.5 ? 'investigating' : 'active'
    }));
  }

  applyFilters(): void {
    this.filteredAnomalies = this.anomalies.filter(anomaly => {
      const matchesAnomaly = !this.anomalyFilter || 
        anomaly.anomalyType.toLowerCase().includes(this.anomalyFilter.toLowerCase()) ||
        anomaly.metrics.some(m => m.toLowerCase().includes(this.anomalyFilter.toLowerCase()));
      
      const matchesEntity = !this.entityFilter || 
        anomaly.entity.toLowerCase().includes(this.entityFilter.toLowerCase());
      
      return matchesAnomaly && matchesEntity;
    });
  }

  onAnomalyFilterChange(): void {
    this.applyFilters();
  }

  onEntityFilterChange(): void {
    this.applyFilters();
  }

  selectAnomaly(anomaly: AnomalyDetail): void {
    this.selectedAnomaly = anomaly;
    this.showDetailPanel = true;
    this.initTrendChart();
    this.initCorrelationChart();
  }

  closeDetailPanel(): void {
    this.showDetailPanel = false;
    setTimeout(() => {
      this.selectedAnomaly = null;
    }, 300);
  }

  getSeverityColor(severity: string): string {
    switch (severity) {
      case 'critical': return '#d73a49';
      case 'high': return '#f97316';
      case 'medium': return '#d4a72c';
      case 'low': return '#0969da';
      default: return '#6c757d';
    }
  }

  getSeverityLabel(severity: string): string {
    return severity.charAt(0).toUpperCase() + severity.slice(1);
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'active': return '#d73a49';
      case 'investigating': return '#d4a72c';
      case 'resolved': return '#22863a';
      default: return '#6c757d';
    }
  }

  getStatusLabel(status: string): string {
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  formatDate(date: Date): string {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  goBack(): void {
    this.router.navigate(['/agents-overview']);
  }
  
  navigateToOverview(): void {
    this.router.navigate(['/agents-overview']);
  }

  navigateToHealth(): void {
    this.router.navigate(['/agent-health', this.agentId]);
  }

  toggleDetailSection(section: string): void {
    this.expandedDetailSection = this.expandedDetailSection === section ? null : section;
  }

  setTrendTimeRange(range: '6h' | '12h' | '24h'): void {
    this.trendTimeRange = range;
    this.initTrendChart();
  }

  initTrendChart(): void {
    // Generate demo trend data
    const dataPoints = this.trendTimeRange === '6h' ? 36 : this.trendTimeRange === '12h' ? 72 : 144;
    const labels: string[] = [];
    const values: number[] = [];
    const baseValue = 2000;
    
    for (let i = 0; i < dataPoints; i++) {
      const time = new Date(Date.now() - (dataPoints - i) * 10 * 60 * 1000);
      labels.push(time.toLocaleTimeString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }));
      
      // Add some variation and a spike
      let value = baseValue + Math.random() * 500 - 250;
      if (i > dataPoints * 0.4 && i < dataPoints * 0.5) {
        value += 1500; // Create spike
      }
      values.push(Math.max(0, value));
    }

    this.trendChartData = {
      labels: labels,
      datasets: [{
        label: 'Response Time (ms)',
        data: values,
        borderColor: '#d4a72c',
        backgroundColor: 'rgba(212, 167, 44, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        borderWidth: 2
      }]
    };

    this.initTrendChartOptions();

    // Initialize correlation chart
    this.initCorrelationChart();
  }

  initTrendChartOptions(): void {
    this.trendChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          backgroundColor: 'rgba(20, 20, 35, 0.95)',
          titleColor: '#EDEAF1',
          bodyColor: '#EDEAF1',
          borderColor: 'rgba(164, 15, 252, 0.3)',
          borderWidth: 1
        }
      },
      scales: {
        x: {
          grid: {
            color: 'rgba(255, 255, 255, 0.05)',
            display: true
          },
          ticks: {
            color: 'rgba(237, 234, 241, 0.6)',
            maxRotation: 45,
            minRotation: 45,
            maxTicksLimit: 12
          }
        },
        y: {
          grid: {
            color: 'rgba(255, 255, 255, 0.05)'
          },
          ticks: {
            color: 'rgba(237, 234, 241, 0.6)'
          },
          title: {
            display: false
          }
        }
      },
      interaction: {
        mode: 'nearest',
        axis: 'x',
        intersect: false
      }
    };
  }

  initCorrelationChart(): void {
    // Generate demo correlation data for 2 metrics
    const dataPoints = 50;
    const labels: string[] = [];
    const cpuValues: number[] = [];
    const memoryValues: number[] = [];
    
    for (let i = 0; i < dataPoints; i++) {
      const time = new Date(Date.now() - (dataPoints - i) * 10 * 60 * 1000);
      labels.push(time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
      
      // Correlated metrics - when CPU goes up, memory follows
      const baseCPUFactor = Math.sin(i / dataPoints * Math.PI * 2) * 0.3;
      const cpuValue = 50 + baseCPUFactor * 30 + Math.random() * 10;
      const memoryValue = cpuValue * 0.8 + 20 + Math.random() * 5;
      
      cpuValues.push(Math.max(0, Math.min(100, cpuValue)));
      memoryValues.push(Math.max(0, Math.min(100, memoryValue)));
    }

    this.correlationChartData = {
      labels: labels,
      datasets: [{
        label: 'CPU Usage (%)',
        data: cpuValues,
        borderColor: '#dc3545',
        backgroundColor: 'rgba(220, 53, 69, 0.1)',
        fill: true,
        tension: 0.4,
        yAxisID: 'y'
      }, {
        label: 'Memory Usage (%)',
        data: memoryValues,
        borderColor: '#0969da',
        backgroundColor: 'rgba(9, 105, 218, 0.1)',
        fill: true,
        tension: 0.4,
        yAxisID: 'y'
      }]
    };

    this.initCorrelationChartOptions();
  }

  initCorrelationChartOptions(): void {
    this.correlationChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index' as const,
        intersect: false,
      },
      plugins: {
        legend: { 
          display: true, 
          position: 'top' as const,
          labels: { 
            color: '#EDEAF1', 
            font: { size: 11 },
            usePointStyle: true,
            padding: 12
          } 
        },
        tooltip: {
          mode: 'index' as const,
          intersect: false,
          backgroundColor: 'rgba(20, 20, 35, 0.95)',
          titleColor: '#EDEAF1',
          bodyColor: '#EDEAF1',
          borderColor: 'rgba(164, 15, 252, 0.3)',
          borderWidth: 1,
          callbacks: {
            label: (context) => {
              const label = context.dataset.label || '';
              const value = context.parsed.y;
              return `${label}: ${value ? value.toFixed(1) : 'n/a'}%`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: { 
            color: 'rgba(255, 255, 255, 0.05)',
            display: true
          },
          ticks: { 
            color: '#EDEAF1', 
            maxTicksLimit: 10,
            maxRotation: 45,
            minRotation: 0
          }
        },
        y: {
          grid: { color: 'rgba(255, 255, 255, 0.05)' },
          ticks: { color: '#EDEAF1' },
          min: 0,
          max: 100
        }
      }
    };
  }
}


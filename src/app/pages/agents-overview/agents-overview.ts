import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NgChartsModule } from 'ng2-charts';
import { Chart, ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { 
  phosphorCaretLeft, 
  phosphorCaretRight, 
  phosphorArrowsClockwise, 
  phosphorChartBar, 
  phosphorWarning, 
  phosphorFileText, 
  phosphorShieldCheck, 
  phosphorDetective,
  phosphorFingerprint, 
  phosphorCoin, 
  phosphorFileDoc, 
  phosphorGraph 
} from '@ng-icons/phosphor-icons/regular';
import { Sidebar } from '@shared/components/sidebar/sidebar';
import { IntegrationStateService } from '@shared/services/integration-state.service';
import { Subscription } from 'rxjs';
import {
  DEMO_AGENTS,
  DEMO_AGENT_VERSIONS,
  DEMO_AGENT_UPTIME,
  DEMO_AGENT_HEALTH,
  DEMO_AGENT_MTTR,
  DEMO_AGENT_USAGE,
  DEMO_AGENT_DATA_VOLUME,
  DEMO_AGENT_ANOMALIES,
  DEMO_AGENT_PERFORMANCE,
  DEMO_SYSTEM_OVERVIEW,
  DEMO_UPTIME_DATA,
  DEMO_MTTR_DATA,
  DEMO_HEALTH_CHECK_DATA,
} from '@shared/constants/demo-data.constants';
import {
  Agent,
  AgentVersion,
  AgentUptime,
  AgentHealthCheck,
  AgentMTTR,
  AgentDataVolume,
  AgentAnomaly,
  AgentPerformanceMetrics,
  SystemOverviewMetrics,
  AgentUsageIntensity,
  UptimeData,
  MttrData,
  HealthCheckData,
} from '@shared/models/demo-data.model';

@Component({
  selector: 'app-agents-overview',
  standalone: true,
  imports: [CommonModule, NgChartsModule, Sidebar, NgIcon],
  viewProviders: [provideIcons({ 
    phosphorCaretLeft, 
    phosphorCaretRight, 
    phosphorArrowsClockwise, 
    phosphorChartBar, 
    phosphorWarning, 
    phosphorFileText, 
    phosphorShieldCheck, 
    phosphorDetective,
    phosphorFingerprint, 
    phosphorCoin, 
    phosphorFileDoc, 
    phosphorGraph 
  })],
  templateUrl: './agents-overview.html',
  styleUrl: './agents-overview.scss'
})
export class AgentsOverview implements OnInit, OnDestroy {
  private integrationsSubscription?: Subscription;
  
  // Expose Math to template
  Math = Math;
  
  agents: Agent[] = [];
  agentVersions: AgentVersion[] = [];
  agentUptime: AgentUptime[] = [];
  agentHealth: AgentHealthCheck[] = [];
  agentMTTR: AgentMTTR[] = [];
  agentUsage: AgentUsageIntensity[] = [];
  agentDataVolume: AgentDataVolume[] = [];
  agentAnomalies: AgentAnomaly[] = [];
  agentPerformance: AgentPerformanceMetrics[] = [];
  systemOverview: SystemOverviewMetrics = DEMO_SYSTEM_OVERVIEW;

  // Data for new charts
  uptimeData: UptimeData[] = [];
  newMttrChartData!: ChartData<'bar'>;
  newMttrChartOptions!: ChartConfiguration<'bar'>['options'];
  healthCheckChartData!: ChartData<'doughnut'>;
  healthCheckChartOptions!: ChartConfiguration<'doughnut'>['options'];

  // Carousel properties
  currentIndex = 0;
  pageSize = 4;
  paginatedAgents: Agent[] = [];
  private resizeListener?: () => void;

  // Expanded states
  expandedSection: string | null = null;
  selectedAgentForDetail: string | null = null;
  selectedTimeFilter: string = '1d';
  selectedUsageTimeFilter: string = '1d';

  // Chart data
  versionChartData!: ChartData<'bar'>;
  versionChartOptions!: ChartConfiguration<'bar'>['options'];

  uptimeChartData!: ChartData<'bar'>;
  uptimeChartOptions!: ChartConfiguration<'bar'>['options'];

  healthChartData!: ChartData<'pie'>;
  healthChartOptions!: ChartConfiguration<'pie'>['options'];

  mttrChartData!: ChartData<'bar'>;
  mttrChartOptions!: ChartConfiguration<'bar'>['options'];

  mttrTimeSeriesData!: ChartData<'line'>;
  mttrTimeSeriesOptions!: ChartConfiguration<'line'>['options'];

  usageHeatmapData: any[] = [];

  dataVolumeChartData!: ChartData<'bubble'>;
  dataVolumeChartOptions!: ChartConfiguration<'bubble'>['options'];

  usageIntensityChartData!: ChartData<'bar'>;
  usageIntensityChartOptions!: ChartConfiguration<'bar'>['options'];

  dataVolumeHistogramData!: ChartData<'bar'>;
  dataVolumeHistogramOptions!: ChartConfiguration<'bar'>['options'];

  anomalyChartData!: ChartData<'pie'>;
  anomalyChartOptions!: ChartConfiguration<'pie'>['options'];

  requestRateChartData!: ChartData<'bar'>;
  requestRateChartOptions!: ChartConfiguration<'bar'>['options'];

  totalAnomalies: number = 0;

  constructor(
    private router: Router,
    private integrationStateService: IntegrationStateService
  ) {}

  ngOnInit(): void {
    // Calculate initial page size
    this.calculatePageSize();
    
    // Listen to window resize events
    this.resizeListener = () => {
      this.calculatePageSize();
      this.updatePaginatedAgents();
      // Re-initialize charts on resize to update scaling
      this.initDataVolumeChart();
      this.initUsageIntensityChart();
    };
    window.addEventListener('resize', this.resizeListener);
    
    // Subscribe to integrations and filter data based on active integrations
    this.integrationsSubscription = this.integrationStateService.integrations$.subscribe(
      integrations => {
        const activeAgentIds = integrations.map(i => i.agentId);
        
        // Show all enabled agents on overview page with all their data
        this.agents = DEMO_AGENTS.filter(a => a.isEnabled);
        const enabledAgentIds = this.agents.map(a => a.id);
        // Show all data for enabled agents
        this.agentVersions = DEMO_AGENT_VERSIONS.filter(a => enabledAgentIds.includes(a.agentId));
        this.agentUptime = DEMO_AGENT_UPTIME.filter(a => enabledAgentIds.includes(a.agentId));
        this.agentHealth = DEMO_AGENT_HEALTH.filter(a => enabledAgentIds.includes(a.agentId));
        this.agentMTTR = DEMO_AGENT_MTTR.filter(a => enabledAgentIds.includes(a.agentId));
        this.agentUsage = DEMO_AGENT_USAGE.filter(a => enabledAgentIds.includes(a.agentId));
        this.agentDataVolume = DEMO_AGENT_DATA_VOLUME.filter(a => enabledAgentIds.includes(a.agentId));
        this.agentAnomalies = DEMO_AGENT_ANOMALIES.filter(a => enabledAgentIds.includes(a.agentId));
        this.agentPerformance = DEMO_AGENT_PERFORMANCE.filter(p => enabledAgentIds.includes(p.agentId));
        
        // Reset pagination when agents change
        this.currentIndex = 0;
        
        // Recalculate system overview based on filtered agents
        this.recalculateSystemOverview();
        
        // Re-initialize charts with filtered data
        this.initializeCharts();
        this.calculateTotalAnomalies();

        this.updatePaginatedAgents();
      }
    );
  }

  ngOnDestroy(): void {
    if (this.integrationsSubscription) {
      this.integrationsSubscription.unsubscribe();
    }
    if (this.resizeListener) {
      window.removeEventListener('resize', this.resizeListener);
    }
  }

  calculatePageSize(): void {
    // Card width: 270px, gap: 6px, chevron: 40px + gap: 8px (0.5rem) on each side
    // Account for content-wrapper padding: 18px left
    // Account for sidebar: 74px
    const cardWidth = 270;
    const gap = 6;
    const chevronWidth = 40;
    const chevronGap = 8;
    const sidebarWidth = 74;
    const contentPadding = 18;
    
    const availableWidth = window.innerWidth - sidebarWidth - contentPadding - (chevronWidth * 2) - (chevronGap * 2);
    
    // Calculate how many cards fit: (availableWidth + gap) / (cardWidth + gap)
    const cardsPerRow = Math.floor((availableWidth + gap) / (cardWidth + gap));
    
    // Ensure at least 1 card is shown
    this.pageSize = Math.max(1, cardsPerRow);
  }

  updatePaginatedAgents(): void {
    // Reset to first page if current index is out of bounds
    const maxIndex = Math.max(0, Math.ceil(this.agents.length / this.pageSize) - 1);
    if (this.currentIndex > maxIndex) {
      this.currentIndex = 0;
    }
    
    const startIndex = this.currentIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedAgents = this.agents.slice(startIndex, endIndex);
  }

  nextAgents(): void {
    const maxIndex = Math.max(0, Math.ceil(this.agents.length / this.pageSize) - 1);
    if (this.currentIndex < maxIndex) {
      this.currentIndex++;
      this.updatePaginatedAgents();
    }
  }

  prevAgents(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.updatePaginatedAgents();
    }
  }

  canGoNext(): boolean {
    if (this.agents.length === 0) return false;
    const maxIndex = Math.max(0, Math.ceil(this.agents.length / this.pageSize) - 1);
    return this.currentIndex < maxIndex;
  }

  canGoPrev(): boolean {
    return this.currentIndex > 0 && this.agents.length > 0;
  }

  recalculateSystemOverview(): void {
    // Recalculate system metrics based on active agents only
    if (this.agentPerformance.length > 0) {
      const totalRequests = this.agentPerformance.reduce((sum, agent) => 
        sum + (agent.requestsPerMinute * 60), 0);
      const totalErrors = this.agentPerformance.reduce((sum, agent) => 
        sum + agent.errorCount, 0);
      const avgLatency = this.agentPerformance.reduce((sum, agent) => 
        sum + agent.avgResponseTime, 0) / this.agentPerformance.length;
      const totalActiveSessions = this.agentPerformance.reduce((sum, agent) => 
        sum + agent.activeSessions, 0);
      const avgSuccessRate = this.agentPerformance.reduce((sum, agent) => 
        sum + agent.successRate, 0) / this.agentPerformance.length;
      const totalThroughput = this.agentPerformance.reduce((sum, agent) => 
        sum + agent.throughput, 0);

      this.systemOverview = {
        totalRequests,
        totalErrors,
        avgLatency,
        totalActiveSessions,
        overallSuccessRate: avgSuccessRate,
        totalThroughput
      };
    } else {
      // No active agents
      this.systemOverview = {
        totalRequests: 0,
        totalErrors: 0,
        avgLatency: 0,
        totalActiveSessions: 0,
        overallSuccessRate: 0,
        totalThroughput: 0
      };
    }
  }

  initializeCharts(): void {
    this.initUptimeChart();
    this.initHealthChart();
    this.initMTTRChart();
    this.initUsageHeatmap();
    this.initDataVolumeChart();
    this.initUsageIntensityChart();
    this.initAnomalyChart();
    this.initRequestRateChart();
    
    // New charts
    this.initUptimeData();
    this.initNewMttrChart();
    this.initHealthCheckChart();
  }

  initVersionChart(): void {
    this.versionChartData = {
      labels: this.agentVersions.map(v => v.agentName),
      datasets: [{
        data: this.agentVersions.map(v => v.versionNumber || 0),
        backgroundColor: 'rgba(164, 15, 252, 0.6)',
        borderColor: 'rgba(164, 15, 252, 1)',
        borderWidth: 1
      }]
    };

    this.versionChartOptions = {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context) => {
              const version = this.agentVersions[context.dataIndex].version;
              return `Version: ${version}`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(255, 255, 255, 0.1)' },
          border: {
            display: true,
            color: 'rgba(237, 234, 241, 0.6)',
            width: 1
          },
          ticks: { 
            color: '#EDEAF1',
            font: { family: 'Inter, sans-serif' }
          }
        },
        y: {
          grid: { display: false },
          border: {
            display: true,
            color: 'rgba(237, 234, 241, 0.6)',
            width: 1
          },
          ticks: { 
            color: '#EDEAF1',
            font: { family: 'Inter, sans-serif' }
          }
        }
      }
    };
  }

  initUptimeChart(): void {
    this.uptimeChartData = {
      labels: this.agentUptime.map(u => u.agentName),
      datasets: [{
        data: this.agentUptime.map(u => u.uptimePercentage),
        backgroundColor: this.agentUptime.map(u => 
          u.uptimePercentage >= 99 ? 'rgba(34, 134, 58, 0.7)' :
          u.uptimePercentage >= 95 ? 'rgba(212, 167, 44, 0.7)' :
          'rgba(215, 58, 73, 0.7)'
        ),
        borderColor: this.agentUptime.map(u => 
          u.uptimePercentage >= 99 ? 'rgba(34, 134, 58, 1)' :
          u.uptimePercentage >= 95 ? 'rgba(212, 167, 44, 1)' :
          'rgba(215, 58, 73, 1)'
        ),
        borderWidth: 1
      }]
    };

    this.uptimeChartOptions = {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context) => {
              const uptime = this.agentUptime[context.dataIndex];
              return `${uptime.uptimePercentage}% (${uptime.uptimeHours}h)`;
            }
          }
        }
      },
      scales: {
        x: {
          max: 100,
          grid: { color: 'rgba(255, 255, 255, 0.1)' },
          border: {
            display: true,
            color: 'rgba(237, 234, 241, 0.6)',
            width: 1
          },
          ticks: { 
            color: '#EDEAF1',
            font: { family: 'Inter, sans-serif' }
          }
        },
        y: {
          grid: { display: false },
          border: {
            display: true,
            color: 'rgba(237, 234, 241, 0.6)',
            width: 1
          },
          ticks: { 
            color: '#EDEAF1',
            font: { family: 'Inter, sans-serif' }
          }
        }
      }
    };
  }

  initHealthChart(): void {
    const healthCounts = {
      healthy: this.agentHealth.filter(h => h.status === 'healthy').length,
      warning: this.agentHealth.filter(h => h.status === 'warning').length,
      critical: this.agentHealth.filter(h => h.status === 'critical').length
    };

    this.healthChartData = {
      labels: ['Healthy', 'Warning', 'Critical'],
      datasets: [{
        data: [healthCounts.healthy, healthCounts.warning, healthCounts.critical],
        backgroundColor: [
          'rgba(34, 134, 58, 0.85)',
          'rgba(212, 167, 44, 0.85)',
          'rgba(215, 58, 73, 0.85)'
        ],
        borderColor: [
          'rgba(34, 134, 58, 1)',
          'rgba(212, 167, 44, 1)',
          'rgba(215, 58, 73, 1)'
        ],
        borderWidth: 2
      }]
    };

    this.healthChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { 
            color: '#EDEAF1',
            font: { family: 'Inter, sans-serif' }
          }
        }
      }
    };
  }

  initMTTRChart(): void {
    this.mttrChartData = {
      labels: this.agentMTTR.map(m => m.agentName),
      datasets: [{
        data: this.agentMTTR.map(m => m.mttrMinutes),
        backgroundColor: this.agentMTTR.map(m => 
          m.mttrMinutes <= 5 ? 'rgba(34, 197, 94, 0.9)' :
          m.mttrMinutes <= 10 ? 'rgba(245, 158, 11, 0.9)' :
          'rgba(239, 68, 68, 0.9)'
        ),
        borderColor: this.agentMTTR.map(m => 
          m.mttrMinutes <= 5 ? 'rgba(16, 185, 129, 1)' :
          m.mttrMinutes <= 10 ? 'rgba(217, 119, 6, 1)' :
          'rgba(220, 38, 38, 1)'
        ),
        borderWidth: 1
      }]
    };

    this.mttrChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context) => {
              const value = context.parsed?.y;
              if (typeof value === 'number') {
                return `${value.toFixed(1)} minutes`;
              }
              return '';
            }
          }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(255, 255, 255, 0.1)' },
          border: {
            display: true,
            color: 'rgba(237, 234, 241, 0.6)',
            width: 1
          },
          ticks: { 
            color: '#EDEAF1',
            font: { family: 'Inter, sans-serif' }
          }
        },
        y: {
          grid: { color: 'rgba(255, 255, 255, 0.1)' },
          border: {
            display: true,
            color: 'rgba(237, 234, 241, 0.6)',
            width: 1
          },
          ticks: { 
            color: '#EDEAF1',
            font: { family: 'Inter, sans-serif' }
          }
        }
      }
    };
  }

  initUsageHeatmap(): void {
    // Simplified heatmap data representation - using filtered data
    this.usageHeatmapData = this.agentUsage.map(u => ({
      agent: u.agentName,
      avgUsage: u.usageData.reduce((sum, d) => sum + d.value, 0) / u.usageData.length
    }));
  }

  private getChartScale(): number {
    const width = window.innerWidth;
    if (width >= 3840) return 2.67; // 4K
    if (width >= 2560) return 1.78; // 2K
    if (width >= 1920) return 1.33; // 1920px
    return 1; // 1440px base
  }

  initDataVolumeChart(): void {
    const scale = this.getChartScale();
    
    // Use actual agent data volume
    // Calculate bubble sizes based on volume
    const maxVolume = Math.max(...this.agentDataVolume.map(a => a.volumeGB), 1);
    const maxRecords = Math.max(...this.agentDataVolume.map(a => a.recordCount), 1);
    
    // Color palette for bubbles
    const colors = [
      { color: 'rgba(249, 115, 22, 0.7)', borderColor: 'rgba(249, 115, 22, 1)' }, // Orange
      { color: 'rgba(164, 15, 252, 0.7)', borderColor: 'rgba(164, 15, 252, 1)' }, // Purple
      { color: 'rgba(255, 255, 255, 0.8)', borderColor: 'rgba(255, 255, 255, 1)' }, // White
      { color: 'rgba(34, 197, 94, 0.7)', borderColor: 'rgba(34, 197, 94, 1)' }, // Green
      { color: 'rgba(59, 130, 246, 0.7)', borderColor: 'rgba(59, 130, 246, 1)' }, // Blue
      { color: 'rgba(236, 72, 153, 0.7)', borderColor: 'rgba(236, 72, 153, 1)' }, // Pink
      { color: 'rgba(251, 191, 36, 0.7)', borderColor: 'rgba(251, 191, 36, 1)' }, // Yellow
      { color: 'rgba(139, 92, 246, 0.7)', borderColor: 'rgba(139, 92, 246, 1)' }, // Indigo
      { color: 'rgba(20, 184, 166, 0.7)', borderColor: 'rgba(20, 184, 166, 1)' }, // Teal
      { color: 'rgba(239, 68, 68, 0.7)', borderColor: 'rgba(239, 68, 68, 1)' }, // Red
    ];
    
    const baseBubbles = this.agentDataVolume.map((agent, index) => {
      // Calculate bubble radius based on volume (normalized to 8-20px range)
      const volumeRatio = agent.volumeGB / maxVolume;
      const baseRadius = 8 + (volumeRatio * 12); // 8px to 20px
      
      return {
        label: agent.agentName,
        x: agent.recordCount,
        y: agent.volumeGB,
        r: baseRadius,
        color: colors[index % colors.length].color,
        borderColor: colors[index % colors.length].borderColor
      };
    });

    const chartData = baseBubbles.map(bubble => ({
      ...bubble,
      r: Math.round(bubble.r * scale)
    }));

    // Create gradient colors for bubbles - lighter top, darker bottom
    const bubbleGradients = chartData.map(item => {
      const baseColor = item.color;
      const borderColor = item.borderColor;
      
      // Extract RGB from rgba string for lighter version
      const match = baseColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
      if (match) {
        const r = parseInt(match[1]);
        const g = parseInt(match[2]);
        const b = parseInt(match[3]);
        const a = match[4] ? parseFloat(match[4]) : 1;
        
        // Create lighter top color (increase brightness by 30-50)
        const lightR = Math.min(255, r + 50);
        const lightG = Math.min(255, g + 50);
        const lightB = Math.min(255, b + 50);
        const topColor = `rgba(${lightR}, ${lightG}, ${lightB}, ${Math.min(1, a + 0.2)})`;
        
        return { top: topColor, bottom: baseColor, border: borderColor };
      }
      return { top: baseColor, bottom: baseColor, border: borderColor };
    });

    this.dataVolumeChartData = {
      datasets: chartData.map((item, index) => ({
        label: item.label,
        data: [{
          x: item.x,
          y: item.y,
          r: item.r
        }],
        backgroundColor: (context: any) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) {
            return bubbleGradients[index].bottom;
          }
          // Use element position if available, otherwise use chart center
          const element = context.element;
          let centerX = chartArea.left + (chartArea.right - chartArea.left) / 2;
          let centerY = chartArea.top + (chartArea.bottom - chartArea.top) / 2;
          let radius = item.r * 2; // Use bubble radius for gradient
          
          if (element && element.x !== undefined && element.y !== undefined) {
            centerX = element.x;
            centerY = element.y;
            radius = element.width || item.r * 2;
          }
          
          const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
          gradient.addColorStop(0, bubbleGradients[index].top);
          gradient.addColorStop(1, bubbleGradients[index].bottom);
          return gradient;
        },
        borderColor: bubbleGradients[index].border,
        borderWidth: 2
      }))
    };

    // Scale font sizes based on resolution
    const baseFontSizes = {
      legend: 10,
      tooltipTitle: 11,
      tooltipBody: 10,
      axisTitle: 10,
      axisTicks: 9
    };

    const legendMargin = {
      id: 'legendMargin',
      afterInit(chart: any) {
        const legend = chart.legend;
        if (!legend) {
          return;
        }

        const originalFit = legend.fit;

        legend.fit = function fit(this: any) {
          const extraMargin = 40;

          if (originalFit) {
            originalFit.call(this);
          }

          if (legend.options?.position === 'right') {
            this.width += extraMargin;
            this.left -= extraMargin;
          }
        };
      }
    };

    if (!Chart.registry.plugins.get(legendMargin.id)) {
      Chart.register(legendMargin);
    }

    this.dataVolumeChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        autoPadding: true,
      },
      plugins: {
        legend: {
          display: true,
          position: 'right',
          align: 'start',
          labels: { 
            color: '#EDEAF1',
            usePointStyle: true,
            padding: Math.round(10 * scale),
            font: {
              family: 'Inter, sans-serif',
              size: Math.round(baseFontSizes.legend * scale)
            },
            boxWidth: Math.round(8 * scale),
            boxHeight: Math.round(8 * scale)
          }
        },
        tooltip: {
          callbacks: {
            label: (context: any) => {
              const dataset = chartData[context.datasetIndex];
              return [
                `${dataset.label}`,
                `Volume: ${dataset.y} GB`,
                `Records: ${(dataset.x / 1000000).toFixed(2)}M`
              ];
            }
          },
          titleFont: {
            family: 'Inter, sans-serif',
            size: Math.round(baseFontSizes.tooltipTitle * scale)
          },
          bodyFont: {
            family: 'Inter, sans-serif',
            size: Math.round(baseFontSizes.tooltipBody * scale)
          },
          padding: Math.round(8 * scale)
        }
      },
      scales: {
        x: {
          title: { 
            display: true, 
            text: 'Record Count', 
            color: '#EDEAF1',
            font: {
              family: 'Inter, sans-serif',
              size: Math.round(baseFontSizes.axisTitle * scale)
            },
            padding: { top: Math.round(5 * scale), bottom: 0 }
          },
          min: Math.max(0, Math.min(...this.agentDataVolume.map(a => a.recordCount)) - 100000),
          max: Math.max(...this.agentDataVolume.map(a => a.recordCount)) + 300000, // Increased max to prevent overflow
          grid: { 
            color: 'rgba(255, 255, 255, 0.1)',
            lineWidth: 1
          },
          border: {
            display: true,
            color: 'rgba(237, 234, 241, 0.6)',
            width: 1
          },
          ticks: { 
            color: '#EDEAF1',
            stepSize: 200000,
            font: {
              family: 'Inter, sans-serif',
              size: Math.round(baseFontSizes.axisTicks * scale)
            },
            padding: Math.round(8 * scale), // Increased padding to prevent overlap with legend
            maxRotation: 0,
            callback: function(value) {
              return (Number(value) / 1000000).toFixed(1) + 'M';
            }
          }
        },
        y: {
          title: { 
            display: true, 
            text: 'Volume (GB)', 
            color: '#EDEAF1',
            font: {
              family: 'Inter, sans-serif',
              size: Math.round(baseFontSizes.axisTitle * scale)
            },
            padding: { top: 0, bottom: 0 }
          },
          min: Math.max(0, Math.min(...this.agentDataVolume.map(a => a.volumeGB)) - 20),
          max: Math.max(...this.agentDataVolume.map(a => a.volumeGB)) + 40,
          grid: { 
            color: 'rgba(255, 255, 255, 0.1)',
            lineWidth: 1
          },
          border: {
            display: true,
            color: 'rgba(237, 234, 241, 0.6)',
            width: 1
          },
          ticks: { 
            color: '#EDEAF1',
            stepSize: 20,
            font: {
              family: 'Inter, sans-serif',
              size: Math.round(baseFontSizes.axisTicks * scale)
            },
            padding: Math.round(4 * scale)
          }
        }
      }
    };
  }

  selectTimeFilter(filter: string): void {
    this.selectedTimeFilter = filter;
    // In a real app, you would filter the data based on the time filter
    // For now, we'll just update the filter state
    this.initDataVolumeChart();
  }

  initUsageIntensityChart(): void {
    const scale = this.getChartScale();
    
    // Use actual agent usage data
    // Calculate average usage intensity from usageData
    const usageData = this.agentUsage.map(agent => {
      const avgUsage = agent.usageData.length > 0
        ? agent.usageData.reduce((sum, d) => sum + d.value, 0) / agent.usageData.length
        : 0;
      
      // Determine gradient based on usage level
      let gradient;
      if (avgUsage >= 70) {
        gradient = { top: '#BFADD4', bottom: '#FF6F61' }; // high usage - red gradient
      } else if (avgUsage >= 40) {
        gradient = { top: '#BFADD4', bottom: '#D2F65C' }; // medium usage - yellowish gradient
      } else if (avgUsage >= 20) {
        gradient = { top: '#BFADD4', bottom: '#A36EFF' }; // low usage - purple gradient
      } else {
        gradient = { top: '#BFADD4', bottom: '#EDEAF1' }; // idle - light gradient
      }
      
      return {
        label: agent.agentName,
        value: Math.round(avgUsage),
        gradient: gradient
      };
    });

    // Store gradient data
    const gradientData = usageData.map(d => d.gradient);
    const wrapLabel = (label: string): string[] => {
      const maxLineLength = 12;
      const words = label.split(' ');
      const lines: string[] = [];
      let currentLine = '';

      words.forEach(word => {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        if (testLine.length > maxLineLength && currentLine) {
          lines.push(currentLine);
          if (word.length > maxLineLength) {
            const segments = word.match(new RegExp(`.{1,${maxLineLength}}`, 'g')) || [word];
            lines.push(...segments.slice(0, segments.length - 1));
            currentLine = segments[segments.length - 1];
          } else {
            currentLine = word;
          }
        } else if (testLine.length > maxLineLength) {
          // Word itself is longer than max; split it
          const segments = word.match(new RegExp(`.{1,${maxLineLength}}`, 'g')) || [word];
          lines.push(...segments.slice(0, segments.length - 1));
          currentLine = segments[segments.length - 1];
        } else {
          currentLine = testLine;
        }
      });

      if (currentLine) {
        lines.push(currentLine);
      }

      return lines.length > 0 ? lines : [label];
    };
    const originalLabels = usageData.map(d => d.label);
    const wrappedLabels = originalLabels.map(label => wrapLabel(label));

    this.usageIntensityChartData = {
      labels: originalLabels,
      datasets: [{
        label: 'Usage Intensity',
        data: usageData.map(d => d.value),
        backgroundColor: (context: any) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) {
            return 'rgba(164, 15, 252, 0.5)';
          }
          const dataIndex = context.dataIndex;
          const colors = gradientData[dataIndex];
          const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, colors.top);
          gradient.addColorStop(0.6, colors.top);
          gradient.addColorStop(1, colors.bottom);
          return gradient;
        },
        borderColor: 'rgba(0,0,0,0)',
        borderWidth: 1,
        borderRadius: 4
      }]
    };

    const baseFontSizes = {
      legend: 10,
      tooltipTitle: 11,
      tooltipBody: 10,
      axisTitle: 10,
      axisTicks: 8
    };

    this.usageIntensityChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'x',
      layout: {
        padding: {
          right: 20 // Add padding on the right for better scrolling experience
        }
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: (context: any) => {
              const value = context.parsed.y;
              let level = 'Idle';
              if (value >= 70) level = 'High Usage';
              else if (value >= 40) level = 'Moderate Usage';
              else if (value >= 20) level = 'Low Usage';
              return `Usage: ${value}% (${level})`;
            }
          },
          titleFont: {
            family: 'Inter, sans-serif',
            size: Math.round(baseFontSizes.tooltipTitle * scale)
          },
          bodyFont: {
            family: 'Inter, sans-serif',
            size: Math.round(baseFontSizes.tooltipBody * scale)
          },
          padding: Math.round(8 * scale)
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          },
          border: {
            display: true,
            color: 'rgba(237, 234, 241, 0.6)',
            width: 1
          },
          ticks: {
            color: '#EDEAF1',
            font: {
              family: 'Inter, sans-serif',
              size: Math.round(baseFontSizes.axisTicks * scale),
              style: 'normal',
              weight: 'normal'
            },
            autoSkip: false,
            maxRotation: 0,
            minRotation: 0,
            padding: Math.round(4 * scale),
            callback: function(value: any, index: number) {
              return wrappedLabels[index] || value;
            }
          }
        },
        y: {
          title: {
            display: false // Remove y-axis title
          },
          min: 0,
          max: 100,
          grid: {
            color: 'rgba(255, 255, 255, 0.1)',
            lineWidth: 1
          },
          border: {
            display: true,
            color: 'rgba(237, 234, 241, 0.6)',
            width: 1
          },
          ticks: {
            stepSize: 20,
            font: {
              family: 'Inter, sans-serif',
              size: Math.round(baseFontSizes.axisTicks * scale)
            },
            padding: Math.round(4 * scale),
            callback: function(value) {
              if (value === 80) return 'High Usage';
              if (value === 60) return 'Moderate Usage';
              if (value === 40) return 'Low Usage';
              if (value === 20) return 'Idle';
              return '';
            },
            color: function(context: any) {
              const value = context.tick.value;
              // Color labels based on usage level
              if (value === 80) return '#FF6F61'; // High Usage - red
              if (value === 60) return '#D2F65C'; // Moderate Usage - yellowish
              if (value === 40) return '#A36EFF'; // Low Usage - purple
              if (value === 20) return '#EDEAF1'; // Idle - light color (from gradient #BFADD4 → #EDEAF1)
              return '#EDEAF1'; // Default color
            }
          }
        }
      }
    };
  }

  selectUsageTimeFilter(filter: string): void {
    this.selectedUsageTimeFilter = filter;
    // In a real app, you would filter the data based on the time filter
    this.initUsageIntensityChart();
  }

  initAnomalyChart(): void {
    this.anomalyChartData = {
      labels: this.agentAnomalies.map(a => a.agentName),
      datasets: [{
        data: this.agentAnomalies.map(a => a.anomalyCount),
        backgroundColor: this.agentAnomalies.map(a => 
          a.severity === 'critical' ? 'rgba(215, 58, 73, 0.85)' :
          a.severity === 'warning' ? 'rgba(212, 167, 44, 0.85)' :
          'rgba(9, 105, 218, 0.85)'
        ),
        borderColor: this.agentAnomalies.map(a => 
          a.severity === 'critical' ? 'rgba(215, 58, 73, 1)' :
          a.severity === 'warning' ? 'rgba(212, 167, 44, 1)' :
          'rgba(9, 105, 218, 1)'
        ),
        borderWidth: 2
      }]
    };

    this.anomalyChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { 
            color: '#EDEAF1',
            font: { family: 'Inter, sans-serif' }
          }
        }
      }
    };
  }

  calculateTotalAnomalies(): void {
    this.totalAnomalies = this.agentAnomalies.reduce((sum, a) => sum + a.anomalyCount, 0);
  }

  toggleSection(section: string): void {
    this.expandedSection = this.expandedSection === section ? null : section;
  }

  showAgentDetail(agentId: string, section: string): void {
    this.selectedAgentForDetail = agentId;
    
    // Update detail charts based on section
    if (section === 'mttr') {
      const agent = this.agentMTTR.find(m => m.agentId === agentId);
      if (agent && agent.mttrHistory) {
        this.mttrTimeSeriesData = {
          labels: agent.mttrHistory.map(h => h.timestamp),
          datasets: [{
            label: 'MTTR (minutes)',
            data: agent.mttrHistory.map(h => h.value),
            borderColor: 'rgba(164, 15, 252, 1)',
            backgroundColor: 'rgba(164, 15, 252, 0.1)',
            fill: true,
            tension: 0.4
          }]
        };

        this.mttrTimeSeriesOptions = {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            x: {
              grid: { color: 'rgba(255, 255, 255, 0.1)' },
              border: {
                display: true,
                color: 'rgba(237, 234, 241, 0.6)',
                width: 1
              },
              ticks: { 
                color: '#EDEAF1',
                font: { family: 'Inter, sans-serif' }
              }
            },
            y: {
              grid: { color: 'rgba(255, 255, 255, 0.1)' },
              border: {
                display: true,
                color: 'rgba(237, 234, 241, 0.6)',
                width: 1
              },
              ticks: { 
                color: '#EDEAF1',
                font: { family: 'Inter, sans-serif' }
              }
            }
          }
        };
      }
    } else if (section === 'dataVolume') {
      const agent = this.agentDataVolume.find(v => v.agentId === agentId);
      if (agent && agent.volumeHistory) {
        this.dataVolumeHistogramData = {
          labels: agent.volumeHistory.map(h => h.timestamp),
          datasets: [{
            label: 'Volume (GB)',
            data: agent.volumeHistory.map(h => h.value),
            backgroundColor: 'rgba(164, 15, 252, 0.6)',
            borderColor: 'rgba(164, 15, 252, 1)',
            borderWidth: 1
          }]
        };

        this.dataVolumeHistogramOptions = {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            x: {
              grid: { color: 'rgba(255, 255, 255, 0.1)' },
              border: {
                display: true,
                color: 'rgba(237, 234, 241, 0.6)',
                width: 1
              },
              ticks: { 
                color: '#EDEAF1', 
                maxRotation: 45,
                font: { family: 'Inter, sans-serif' }
              }
            },
            y: {
              grid: { color: 'rgba(255, 255, 255, 0.1)' },
              border: {
                display: true,
                color: 'rgba(237, 234, 241, 0.6)',
                width: 1
              },
              ticks: { 
                color: '#EDEAF1',
                font: { family: 'Inter, sans-serif' }
              }
            }
          }
        };
      }
    }
  }

  navigateToAgentHealth(agentId: string): void {
    if (agentId === 'root-cause-analysis') {
      this.router.navigate(['/agent-core', agentId]);
    } else {
      this.router.navigate(['/agent-health', agentId]);
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'healthy': return '#22863a';
      case 'warning': return '#d4a72c';
      case 'critical': return '#d73a49';
      default: return '#6c757d';
    }
  }

  getSuccessRateColor(rate: number): string {
    if (rate >= 98) return '#22863a';
    if (rate >= 95) return '#d4a72c';
    return '#d73a49';
  }

  getLatencyColor(latency: number): string {
    if (latency <= 500) return '#22863a';
    if (latency <= 2000) return '#d4a72c';
    return '#d73a49';
  }

  getResourceUsageColor(usage: number): string {
    if (usage <= 70) return '#22863a';
    if (usage <= 85) return '#d4a72c';
    return '#d73a49';
  }

  getAgentPerformance(agentId: string): AgentPerformanceMetrics | undefined {
    return this.agentPerformance.find(p => p.agentId === agentId);
  }

  getAgentVersion(agentId: string): string {
    const versionData = this.agentVersions.find(v => v.agentId === agentId);
    return versionData ? versionData.version : 'N/A';
  }

  getAverageCpuUsage(): number {
    if (this.agentPerformance.length === 0) return 0;
    const total = this.agentPerformance.reduce((sum, perf) => sum + perf.cpuUsage, 0);
    return total / this.agentPerformance.length;
  }

  getAverageMemoryUsage(): number {
    if (this.agentPerformance.length === 0) return 0;
    const total = this.agentPerformance.reduce((sum, perf) => sum + perf.memoryUsage, 0);
    return total / this.agentPerformance.length;
  }

  getTotalRequestRate(): number {
    if (this.agentPerformance.length === 0) return 0;
    return this.agentPerformance.reduce((sum, perf) => sum + perf.requestRate, 0);
  }

  getAverageRequestRate(): number {
    if (this.agentPerformance.length === 0) return 0;
    const total = this.getTotalRequestRate();
    return Math.round((total / this.agentPerformance.length) * 10) / 10;
  }

  formatNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }

  formatPercentage(num: number): string {
    return Math.round(num).toString();
  }

  formatDecimal(num: number, decimals: number = 1): string {
    return num.toFixed(decimals);
  }

  getMetricColor(value: number, maxValue: number = 100): string {
    // Color intervals:
    // 0% - 50%: static D2F65C (rgb(210, 246, 92))
    // 50% - 75%: transition from D2F65C to FF6F61
    // 75% - 100%: static FF6F61 (rgb(255, 111, 97))

    const percentage = Math.min(Math.max(value / maxValue, 0), 1);
    let r: number, g: number, b: number;

    if (percentage <= 0.5) {
      // Static color D2F65C (0% - 50%)
      r = 210;
      g = 246;
      b = 92;
    } else if (percentage <= 0.75) {
      // Transition from D2F65C to FF6F61 (50% - 75%)
      // D2F65C: rgb(210, 246, 92)   FF6F61: rgb(255, 111, 97)
      const t = (percentage - 0.5) / 0.25;
      r = Math.round(210 + (255 - 210) * t);
      g = Math.round(246 + (111 - 246) * t);
      b = Math.round(92 + (97 - 92) * t);
    } else {
      // Static color FF6F61 (75% - 100%)
      r = 255;
      g = 111;
      b = 97;
    }

    return `rgb(${r}, ${g}, ${b})`;
  }

  initRequestRateChart(): void {
    this.requestRateChartData = {
      labels: this.agentPerformance.map(p => p.agentName),
      datasets: [{
        label: 'Current Rate (req/sec)',
        data: this.agentPerformance.map(p => p.requestRate),
        backgroundColor: 'rgba(139, 92, 246, 0.6)',
        borderColor: 'rgba(139, 92, 246, 1)',
        borderWidth: 1
      }, {
        label: 'Peak Rate (req/sec)',
        data: this.agentPerformance.map(p => p.peakRequestRate),
        backgroundColor: 'rgba(249, 115, 22, 0.6)',
        borderColor: 'rgba(249, 115, 22, 1)',
        borderWidth: 1
      }]
    };

    this.requestRateChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            color: '#fff',
            font: {
              family: 'Inter, sans-serif',
              size: 12
            }
          }
        },
        title: {
          display: true,
          text: 'Request Rate Comparison',
          color: '#fff',
          font: {
            family: 'Inter, sans-serif',
            size: 14,
            weight: 'bold'
          }
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              return `${context.dataset.label}: ${context.parsed.y}/sec`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          },
          border: {
            display: true,
            color: 'rgba(237, 234, 241, 0.6)',
            width: 1
          },
          ticks: {
            color: '#fff',
            font: { family: 'Inter, sans-serif' }
          }
        },
        y: {
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          },
          border: {
            display: true,
            color: 'rgba(237, 234, 241, 0.6)',
            width: 1
          },
          ticks: {
            color: '#fff',
            font: { family: 'Inter, sans-serif' }
          },
          title: {
            display: true,
            text: 'Requests per Second',
            color: '#fff',
            font: { family: 'Inter, sans-serif' }
          }
        }
      }
    };
  }

  // New chart initializations
  initUptimeData(): void {
    this.uptimeData = DEMO_UPTIME_DATA;
  }

  initNewMttrChart(): void {
    const mttrData = DEMO_MTTR_DATA;
    const maxMttr = Math.max(...mttrData.map(d => d.value), 1);
    
    // Create gradual gradients based on MTTR values with brighter colors
    // High MTTR: brighter red-brown gradient
    // Moderate MTTR: brighter purple gradient
    // Low MTTR: green to dark gradient
    const getMttrGradient = (mttrValue: number, maxValue: number, minValue: number) => {
      // Use absolute thresholds instead of normalized for clearer distinction
      // High: >= 20ms, Moderate: 12-19ms, Low: < 12ms
      let gradient;
      if (mttrValue >= 20) {
        // High MTTR - match usage intensity high (warm coral) with slightly darker tones
        gradient = { top: '#9C8DB8', bottom: '#D9473A' };
      } else if (mttrValue >= 12) {
        // Moderate MTTR - match usage intensity medium (vibrant yellow-green) with darker tones
        gradient = { top: '#9C8DB8', bottom: '#A3D12F' };
      } else {
        // Low MTTR - match usage intensity low (violet tones) with darker tones
        gradient = { top: '#9C8DB8', bottom: '#7446BF' };
      }
      
      return gradient;
    };
    
    const minMttr = Math.min(...mttrData.map(d => d.value), 0);
    
    const gradientData = mttrData.map(d => getMttrGradient(d.value, maxMttr, minMttr));
    
    this.newMttrChartData = {
      labels: mttrData.map(d => d.name),
      datasets: [{
        data: mttrData.map(d => d.value),
        backgroundColor: (context: any) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) {
            return gradientData[context.dataIndex].bottom;
          }
          const dataIndex = context.dataIndex;
          const colors = gradientData[dataIndex];
          
          // Create horizontal gradient for the bar (since indexAxis is 'y', bars are horizontal)
          // Gradient goes from left (top color) to right (bottom color)
          const gradient = ctx.createLinearGradient(chartArea.left, 0, chartArea.right, 0);
          gradient.addColorStop(0, colors.top);
          gradient.addColorStop(1, colors.bottom);
          return gradient;
        },
        borderWidth: 0,
        borderRadius: 6,
        barPercentage: 0.7,
        categoryPercentage: 0.8
      }]
    };

    this.newMttrChartOptions = {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          enabled: true,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: '#EDEAF1',
          bodyColor: '#EDEAF1',
          borderColor: 'rgba(255, 255, 255, 0.1)',
          borderWidth: 1,
          padding: 10,
          displayColors: false,
          callbacks: {
            label: (context) => `${context.parsed.x}ms`
          }
        }
      },
      scales: {
        x: {
          grid: { 
            display: true,
            color: 'rgba(255, 255, 255, 0.1)',
            lineWidth: 1
          },
          ticks: { 
            color: '#EDEAF1',
            stepSize: 5,
            font: { family: 'Inter, sans-serif', size: 11 },
            callback: (value) => `${value}ms`
          },
          min: 0,
          max: 35, // Increased to accommodate higher MTTR values
          border: {
            display: true,
            color: 'rgba(237, 234, 241, 0.6)',
            width: 1
          }
        },
        y: {
          grid: { 
            display: false 
          },
          ticks: { 
            color: '#EDEAF1', 
            font: { family: 'Inter, sans-serif', size: 11 },
            padding: 8
          },
          border: {
            display: true,
            color: 'rgba(237, 234, 241, 0.6)',
            width: 1
          }
        }
      }
    };
  }

  initHealthCheckChart(): void {
    this.healthCheckChartData = DEMO_HEALTH_CHECK_DATA;

    this.healthCheckChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '70%',
      plugins: {
        legend: { display: false },
        tooltip: {
          enabled: true,
          callbacks: {
            label: function(context) {
              let label = context.label || '';
              if (label) {
                label += ': ';
              }
              if (context.parsed !== null) {
                label += `${context.parsed}%`;
              }
              return label;
            }
          }
        }
      }
    };
  }
}




import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DatePickerModule } from 'primeng/datepicker';
import { Sidebar } from '@shared/components/sidebar/sidebar';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorCaretLeft, phosphorCaretDown, phosphorFunnel } from '@ng-icons/phosphor-icons/regular';
import { phosphorMagnifyingGlassBold } from '@ng-icons/phosphor-icons/bold';
import * as echarts from 'echarts';

interface AIInsightItem {
  title: string;
  expanded: boolean;
  content?: string;
}

interface CorrelationScore {
  score: number;
  label: string;
}

@Component({
  selector: 'app-anomaly-detail',
  imports: [CommonModule, Sidebar, FormsModule, DatePickerModule, NgIcon],
  viewProviders: [provideIcons({ phosphorCaretLeft, phosphorMagnifyingGlassBold, phosphorCaretDown, phosphorFunnel })],
  templateUrl: './anomaly-detail.html',
  styleUrl: './anomaly-detail.scss'
})
export class AnomalyDetail implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('trendChart') trendChartElement!: ElementRef;
  @ViewChild('topologyChart') topologyChartElement!: ElementRef;

  private route = inject(ActivatedRoute);
  private router = inject(Router);

  private trendChart: echarts.ECharts | null = null;
  private topologyChart: echarts.ECharts | null = null;
  private resizeObserver: ResizeObserver | null = null;

  anomalyId: string = '';
  anomalyData: any = null;

  dateRange: { start: Date | null; end: Date | null } = {
    start: this.parseDateTime('11.11.2025 07:00'),
    end: this.parseDateTime('11.11.2025 14:00')
  };

  // Summary card data - will be populated from route state
  messageClusterInfo = '50 message clusters, 38 me...';
  anomalyName = 'Loading...';
  entityName = 'Loading...';
  anomalyStatus = 'Active';
  anomalySeverity: 'Critical' | 'High' | 'Moderate' | 'Low' = 'Critical';
  timeRangeStart = '08:40';
  timeRangeEnd = '12:00';

  // AI Insights accordion
  aiInsights: AIInsightItem[] = [
    { title: 'Executive Summary', expanded: false, content: 'The system detected a significant latency spike affecting the payment processing service. Response times increased from baseline 230ms to peak 3500ms during the incident window.' },
    { title: 'Anomaly Analysis', expanded: false, content: 'Root cause analysis indicates database connection pool exhaustion triggered by a surge in concurrent requests. The connection limit of 100 was reached at 10:45 AM.' },
    { title: 'Casual Pathway Analysis', expanded: false, content: 'Traffic spike → Connection pool saturation → Query queue buildup → Response time degradation → User-facing latency.' },
    { title: 'Recommendations', expanded: false, content: '1. Increase connection pool size to 200\n2. Implement connection timeout of 30s\n3. Add circuit breaker pattern\n4. Scale horizontally during peak hours' },
    { title: 'Business Impact Assesment', expanded: false, content: 'Estimated 2.3% transaction failure rate during incident. Approximately 1,200 users experienced degraded service. Financial impact estimated at $15,000 in delayed transactions.' }
  ];

  // Correlation Analysis
  correlationStats = {
    totalCorrelations: 9,
    averageCorrelation: 0.932,
    strongCorrelations: 9,
    moderateCorrelations: 0,
    weakCorrelations: 0,
    analysisPeriod: 'May 30, 03:05 PM - May 31, 03:05 AM'
  };

  correlationScores: CorrelationScore[] = [
    { score: 0.932, label: 'STRONG' },
    { score: 0.932, label: 'STRONG' },
    { score: 0.932, label: 'STRONG' }
  ];

  constructor() {
    // Get state from router on construction
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      this.anomalyData = navigation.extras.state['anomalyData'];
    }
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.anomalyId = params['anomalyId'];
      // Use anomalyId as display name if no state data
      if (!this.anomalyData) {
        this.anomalyName = decodeURIComponent(this.anomalyId);
      }
    });

    // Populate from route state if available
    if (this.anomalyData) {
      this.anomalyName = this.anomalyData.anomaly || this.anomalyName;
      this.entityName = this.anomalyData.entity || this.entityName;
      this.anomalyStatus = this.anomalyData.status || this.anomalyStatus;
      this.anomalySeverity = this.anomalyData.severity || this.anomalySeverity;
      
      // Extract time range from the anomaly data
      if (this.anomalyData.timeRange) {
        this.timeRangeStart = this.formatTimeForDisplay(this.anomalyData.timeRange.start);
        this.timeRangeEnd = this.formatTimeForDisplay(this.anomalyData.timeRange.end);
      }
    }
  }

  formatTimeForDisplay(timeStr: string): string {
    if (timeStr.includes(' ')) {
      return timeStr.split(' ')[1];
    }
    return timeStr;
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.initTrendChart();
      this.initTopologyChart();
    }, 100);

    this.resizeObserver = new ResizeObserver(() => {
      this.trendChart?.resize();
      this.topologyChart?.resize();
    });

    if (this.trendChartElement?.nativeElement) {
      this.resizeObserver.observe(this.trendChartElement.nativeElement);
    }
    if (this.topologyChartElement?.nativeElement) {
      this.resizeObserver.observe(this.topologyChartElement.nativeElement);
    }
  }

  ngOnDestroy() {
    this.trendChart?.dispose();
    this.topologyChart?.dispose();
    this.resizeObserver?.disconnect();
  }

  private initTrendChart() {
    if (!this.trendChartElement?.nativeElement) return;

    this.trendChart = echarts.init(this.trendChartElement.nativeElement);

    const xData = ['May 30\n14:00', 'May 30\n20:00', 'May 30\n23:00', 'May 30\n02:00', 'May 30\n03:00', 'May 30\n06:00', 'May 30\n09:00', 'May 30\n11:00'];
    const yData = [1000, 1200, 1500, 3500, 3200, 2500, 1800, 1200];

    const option: echarts.EChartsOption = {
      grid: {
        left: 60,
        right: 20,
        top: 20,
        bottom: 50
      },
      xAxis: {
        type: 'category',
        data: xData,
        axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
        axisLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 10 },
        splitLine: { show: false }
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: 4000,
        axisLine: { show: false },
        axisLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 10 },
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } }
      },
      series: [{
        type: 'line',
        data: yData,
        smooth: true,
        symbol: 'none',
        lineStyle: { color: '#C8E972', width: 2 },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(200, 233, 114, 0.4)' },
            { offset: 1, color: 'rgba(200, 233, 114, 0.05)' }
          ])
        },
        markPoint: {
          symbol: 'circle',
          symbolSize: 10,
          data: [
            { name: 'Peak', type: 'max', itemStyle: { color: '#FF6B6B' } }
          ],
          label: { show: false }
        }
      }]
    };

    this.trendChart.setOption(option);
  }

  private initTopologyChart() {
    if (!this.topologyChartElement?.nativeElement) return;

    this.topologyChart = echarts.init(this.topologyChartElement.nativeElement);

    const nodes = [
      { name: 'API Gateway', x: 200, y: 100, symbolSize: 40, itemStyle: { color: '#9C7FCF' } },
      { name: 'Auth Service', x: 100, y: 200, symbolSize: 30, itemStyle: { color: '#7B68EE' } },
      { name: 'Payment API', x: 300, y: 200, symbolSize: 35, itemStyle: { color: '#FF6B6B' } },
      { name: 'User DB', x: 80, y: 320, symbolSize: 28, itemStyle: { color: '#4A90A4' } },
      { name: 'Redis Cache', x: 200, y: 280, symbolSize: 25, itemStyle: { color: '#C8E972' } },
      { name: 'Payment DB', x: 320, y: 320, symbolSize: 30, itemStyle: { color: '#FFD166' } },
      { name: 'Queue', x: 400, y: 250, symbolSize: 25, itemStyle: { color: '#A78BFA' } }
    ];

    const links = [
      { source: 'API Gateway', target: 'Auth Service' },
      { source: 'API Gateway', target: 'Payment API' },
      { source: 'Auth Service', target: 'User DB' },
      { source: 'Auth Service', target: 'Redis Cache' },
      { source: 'Payment API', target: 'Redis Cache' },
      { source: 'Payment API', target: 'Payment DB' },
      { source: 'Payment API', target: 'Queue' }
    ];

    const option: echarts.EChartsOption = {
      series: [{
        type: 'graph',
        layout: 'none',
        data: nodes,
        links: links,
        roam: true,
        label: {
          show: true,
          position: 'bottom',
          color: 'rgba(255,255,255,0.7)',
          fontSize: 10
        },
        lineStyle: {
          color: 'rgba(255,255,255,0.2)',
          width: 1.5,
          curveness: 0.1
        },
        emphasis: {
          focus: 'adjacency',
          lineStyle: { width: 3 }
        }
      }]
    };

    this.topologyChart.setOption(option);
  }

  toggleInsight(insight: AIInsightItem) {
    insight.expanded = !insight.expanded;
  }

  navigateBack() {
    this.router.navigate(['/anomaly-insights']);
  }

  predictTrend() {
    console.log('Predicting trend...');
  }

  private parseDateTime(value: string): Date | null {
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

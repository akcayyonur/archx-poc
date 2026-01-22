import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DatePickerModule } from 'primeng/datepicker';
import { Sidebar } from '@shared/components/sidebar/sidebar';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorCaretLeft, phosphorCaretDown, phosphorFunnel, phosphorCornersOut, phosphorChartLine, phosphorX } from '@ng-icons/phosphor-icons/regular';
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
  viewProviders: [provideIcons({ phosphorCaretLeft, phosphorMagnifyingGlassBold, phosphorCaretDown, phosphorFunnel, phosphorCornersOut, phosphorChartLine, phosphorX })],
  templateUrl: './anomaly-detail.html',
  styleUrl: './anomaly-detail.scss'
})
export class AnomalyDetail implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('trendChart') trendChartElement!: ElementRef;
  @ViewChild('topologyChart') topologyChartElement!: ElementRef;
  @ViewChild('correlationChart') correlationChartElement!: ElementRef;

  private route = inject(ActivatedRoute);
  private router = inject(Router);

  private trendChart: echarts.ECharts | null = null;
  private topologyChart: echarts.ECharts | null = null;
  private correlationChart: echarts.ECharts | null = null;
  private resizeObserver: ResizeObserver | null = null;
  
  topologyFullscreen = false;

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

      // Generate more complex time series data
    const timePoints: string[] = [];
    const responseTimeData: number[] = [];
    const p95Data: number[] = [];
    const p99Data: number[] = [];
    const baseTime = new Date('2024-05-30T14:00:00');
    
    for (let i = 0; i < 90; i++) {
      const time = new Date(baseTime.getTime() + i * 5 * 60000); // 5-minute intervals
      const hours = time.getHours().toString().padStart(2, '0');
      const minutes = time.getMinutes().toString().padStart(2, '0');
      timePoints.push(`${hours}:${minutes}`);
      
      // Create varied response time data with realistic patterns
      let baseValue = 800 + Math.random() * 400;
      
      // Add some peaks and valleys
      if (i >= 20 && i <= 28) {
        // Major spike
        baseValue = 2800 + Math.random() * 800 + (i - 24) * (i - 24) * -50;
      } else if (i >= 55 && i <= 62) {
        // Secondary spike
        baseValue = 2200 + Math.random() * 400;
      } else if (i >= 40 && i <= 45) {
        // Small elevation
        baseValue = 1600 + Math.random() * 200;
      }
      
      responseTimeData.push(Math.round(baseValue));
      p95Data.push(Math.round(baseValue * 1.3)); // P95 is higher
      p99Data.push(Math.round(baseValue * 1.6)); // P99 is even higher
    }

    const option: echarts.EChartsOption = {
      backgroundColor: 'transparent',
      grid: {
        left: 60,
        right: 40,
        top: 40,
        bottom: 50,
        containLabel: false
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(31, 30, 51, 0.95)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        textStyle: {
          color: '#EDEAF1'
        },
        axisPointer: {
          type: 'cross',
          lineStyle: {
            color: 'rgba(255, 255, 255, 0.3)',
            type: 'dashed'
          }
        }
      },
      legend: {
        data: ['Avg Response Time', 'P95', 'P99'],
        top: 10,
        right: 20,
        textStyle: {
          color: 'rgba(255, 255, 255, 0.7)',
          fontSize: 11
        },
        itemWidth: 20,
        itemHeight: 8
      },
      xAxis: {
        type: 'category',
        data: timePoints,
        boundaryGap: false,
        axisLine: { 
          lineStyle: { color: 'rgba(255,255,255,0.1)' } 
        },
        axisTick: {
          show: false
        },
        axisLabel: { 
          color: 'rgba(255,255,255,0.5)', 
          fontSize: 10,
          interval: 14 // Show every 15th label
        },
        splitLine: { 
          show: true,
          lineStyle: { 
            color: 'rgba(255,255,255,0.05)', 
            type: 'solid' 
          } 
        }
      },
      yAxis: {
        type: 'value',
        name: 'ms',
        nameTextStyle: {
          color: 'rgba(255,255,255,0.5)',
          fontSize: 10,
          align: 'right'
        },
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { 
          color: 'rgba(255,255,255,0.5)', 
          fontSize: 10,
          formatter: '{value}'
        },
        splitLine: { 
          lineStyle: { 
            color: 'rgba(255,255,255,0.05)', 
            type: 'solid' 
          } 
        }
      },
      series: [
        {
          name: 'P99',
          type: 'line',
          data: p99Data,
          smooth: true,
          symbol: 'none',
          lineStyle: { 
            color: '#FF6B6B', 
            width: 1.5,
            opacity: 0.6
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(255, 107, 107, 0.15)' },
              { offset: 1, color: 'rgba(255, 107, 107, 0.02)' }
            ])
          },
          z: 1
        },
        {
          name: 'P95',
          type: 'line',
          data: p95Data,
          smooth: true,
          symbol: 'none',
          lineStyle: { 
            color: '#FFD166', 
            width: 1.5,
            opacity: 0.7
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(255, 209, 102, 0.2)' },
              { offset: 1, color: 'rgba(255, 209, 102, 0.03)' }
            ])
          },
          z: 2
        },
        {
          name: 'Avg Response Time',
          type: 'line',
          data: responseTimeData,
          smooth: true,
          symbol: 'none',
          lineStyle: { 
            color: '#C8E972', 
            width: 2.5
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(200, 233, 114, 0.35)' },
              { offset: 1, color: 'rgba(200, 233, 114, 0.05)' }
            ])
          },
          markPoint: {
            symbol: 'circle',
            symbolSize: 12,
            data: [
              { 
                type: 'max', 
                name: 'Peak',
                itemStyle: { 
                  color: '#FF453A',
                  borderColor: '#fff',
                  borderWidth: 2
                },
                label: {
                  show: true,
                  formatter: '{c}ms',
                  color: '#fff',
                  fontSize: 10,
                  position: 'top'
                }
              }
            ]
          },
          markLine: {
            silent: true,
            symbol: 'none',
            lineStyle: {
              color: '#FF9F0A',
              type: 'dashed',
              width: 1.5,
              opacity: 0.6
            },
            data: [
              {
                yAxis: 2000,
                label: {
                  show: true,
                  formatter: 'SLA',
                  color: '#FF9F0A',
                  fontSize: 10,
                  position: 'insideEndTop'
                }
              }
            ]
          },
          z: 3
        }
      ]
    };

    this.trendChart.setOption(option);
  }

  private initTopologyChart(isFullscreen = false) {
    let element: HTMLElement | null = null;

    if (isFullscreen) {
        element = document.getElementById('fullscreenTopologyChart');
    } else {
        element = this.topologyChartElement?.nativeElement;
    }

    if (!element) return;

    const chart = echarts.init(element);
    if (!isFullscreen) {
        this.topologyChart = chart;
    }

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

    chart.setOption(option);
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

  openTopologyFullscreen(): void {
    this.topologyFullscreen = true;
    
    // Reinitialize chart in fullscreen after view updates
    setTimeout(() => {
        this.initTopologyChart(true);
    }, 100);
  }

  closeTopologyFullscreen() {
    this.topologyFullscreen = false;
  }

  // Correlation Chart Popup
  correlationChartVisible = false;
  selectedCorrelationItem: any = null;

  openCorrelationChart(item: any) {
    this.selectedCorrelationItem = item;
    this.correlationChartVisible = true;
    setTimeout(() => {
        this.initCorrelationChart();
    }, 100);
  }

  closeCorrelationChart() {
    this.correlationChartVisible = false;
    if (this.correlationChart) {
        this.correlationChart.dispose();
        this.correlationChart = null;
    }
  }

  private initCorrelationChart() {
    if (!this.correlationChartElement) return;

    this.correlationChart = echarts.init(this.correlationChartElement.nativeElement);
    
    // Generate mock data for last 24 hours (every 10 minutes)
    const data1 = [];
    const data2 = [];
    const timestamps = [];
    const now = new Date();
    
    for (let i = 0; i < 144; i++) {
        const t = new Date(now.getTime() - (144 - i) * 10 * 60000);
        const timeStr = `${t.getHours().toString().padStart(2, '0')}:${t.getMinutes().toString().padStart(2, '0')}`;
        timestamps.push(timeStr);
        
        let base1 = 20000 + Math.random() * 5000;
        let base2 = 18000 + Math.random() * 5000;
        
        // Add spike
        if (i > 100 && i < 110) {
            base1 += 380000;
            base2 += 300000;
        }
        
        data1.push(base1);
        data2.push(base2);
    }

    const option: echarts.EChartsOption = {
        backgroundColor: 'transparent',
        grid: {
            top: 100,
            right: 20,
            bottom: 30,
            left: 60,
            containLabel: true
        },
        tooltip: {
            trigger: 'axis',
            backgroundColor: 'rgba(20, 19, 38, 0.9)',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            textStyle: { color: '#fff' },
            position: function (pt: any) {
                return [pt[0], '10%'];
            }
        },
        xAxis: {
            type: 'category',
            data: timestamps,
            boundaryGap: false,
            axisLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.1)' } },
            axisLabel: { color: 'rgba(255, 255, 255, 0.5)' },
            splitLine: {
                show: true,
                lineStyle: { color: 'rgba(255, 255, 255, 0.05)' }
            }
        },
        yAxis: {
            type: 'value',
            splitLine: {
                show: true,
                lineStyle: { color: 'rgba(255, 255, 255, 0.05)' }
            },
            axisLabel: { color: 'rgba(255, 255, 255, 0.5)' }
        },
        series: [
            {
                name: 'API_dataSync_primary',
                type: 'line',
                data: data1,
                showSymbol: false,
                lineStyle: { width: 2, color: '#FFFFFF' },
                itemStyle: { color: '#FFFFFF' }
            },
            {
                name: 'API_dataSync_secondary',
                type: 'line',
                data: data2,
                showSymbol: false,
                lineStyle: { width: 2, color: '#FF453A' },
                itemStyle: { color: '#FF453A' }
            }
        ]
    };

    this.correlationChart.setOption(option);
    
    // Handle resize
    new ResizeObserver(() => {
        this.correlationChart?.resize();
    }).observe(this.correlationChartElement.nativeElement);
  }
}

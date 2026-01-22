import { Component, AfterViewInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DatePickerModule } from 'primeng/datepicker';
import { Sidebar } from '@shared/components/sidebar/sidebar';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorTrafficCone, phosphorSortAscending, phosphorSortDescending, phosphorInfo, phosphorCaretLeft, phosphorCaretRight, phosphorPulse, phosphorCornersOut, phosphorCloudArrowDown, phosphorCaretDown, phosphorHandPalm, phosphorCrop, phosphorArrowsLeftRight, phosphorMagnifyingGlassPlus, phosphorMagnifyingGlassMinus, phosphorArrowCounterClockwise, phosphorWarning } from '@ng-icons/phosphor-icons/regular';
import { DEMO_ANOMALY_LIST } from '@shared/constants/demo-data.constants';
import { AnomalyRecord } from '@shared/models/demo-data.model';
import { AnomalyContextMenu, ContextMenuAction } from '@shared/components/anomaly-context-menu/anomaly-context-menu';
import * as echarts from 'echarts';

@Component({
  selector: 'app-anomaly-insights',
  imports: [CommonModule, Sidebar, FormsModule, DatePickerModule, NgIcon, AnomalyContextMenu],
  viewProviders: [provideIcons({ phosphorTrafficCone, phosphorSortAscending, phosphorSortDescending, phosphorInfo, phosphorCaretLeft, phosphorCaretRight, phosphorPulse, phosphorCornersOut, phosphorCloudArrowDown, phosphorCaretDown, phosphorHandPalm, phosphorCrop, phosphorArrowsLeftRight, phosphorMagnifyingGlassPlus, phosphorMagnifyingGlassMinus, phosphorArrowCounterClockwise, phosphorWarning })],
  templateUrl: './anomaly-insights.html',
  styleUrl: './anomaly-insights.scss'
})
export class AnomalyInsights implements AfterViewInit, OnDestroy {
  @ViewChild('serviceModelChart') chartElement!: ElementRef;
  @ViewChild('anomalousDimensionsChart') anomalousChartElement!: ElementRef;
  
  private chart: echarts.ECharts | null = null;
  private anomalousChart: echarts.ECharts | null = null;
  private resizeObserver: ResizeObserver | null = null;

  anomalies: AnomalyRecord[] = DEMO_ANOMALY_LIST.map(a => ({ ...a, timeRange: { ...a.timeRange } }));
  dateRange: { start: Date | null; end: Date | null } = {
    start: AnomalyInsights.parseDateTime('04.09.2024 07:00'),
    end: AnomalyInsights.parseDateTime('04.09.2024 17:00')
  };

  selectedSeverityLevels: string[] = ['critical', 'high', 'moderate'];
  selectedSpecialFilters: string[] = [];
  selectedTimeFilters: string | null = null; // Single select, null means no filter

  // Sorting properties
  sortColumn: string | null = 'timeRange';
  sortDirection: 'asc' | 'desc' = 'desc';

  // Pagination properties
  currentPage = 1;
  itemsPerPage = 5;

  // Context menu properties
  selectedAnomalies: AnomalyRecord[] = [];
  contextMenuVisible = false;
  contextMenuPosition = { x: 0, y: 0 };

  // Event dialog properties
  eventDialogVisible = false;
  eventForm = {
    title: '',
    description: '',
    severity: 'Moderate',
    category: 'Performance',
    status: 'Open',
    assignedTeam: 'DevOps',
    application: ''
  };

  // Chart time range properties
  timeRanges: string[] = ['24H', '5D', '1W', '1M'];
  selectedTimeRange: string = '24H';

  constructor(private router: Router) {
    // Removed randomization to use static demo data with full dates
  }

  navigateToAnomalyDetail(anomaly: AnomalyRecord): void {
    this.router.navigate(['/anomaly-detail', anomaly.anomaly], {
      state: { anomalyData: anomaly }
    });
  }

  navigateToEntityInsights(anomaly: AnomalyRecord): void {
    this.router.navigate(['/entity-insights', anomaly.entity], {
      state: { anomalyData: anomaly }
    });
  }

  ngAfterViewInit(): void {
    this.initChart();
    
    // Initialize new Anomalous Dimensions chart
    this.initAnomalousChart();
    
    // Handle resize
    this.resizeObserver = new ResizeObserver(() => {
        if (this.chart) {
            this.chart.resize();
        }
        if (this.anomalousChart) {
            this.anomalousChart.resize();
        }
    });
    if (this.chartElement?.nativeElement) {
        this.resizeObserver.observe(this.chartElement.nativeElement);
    }
    if (this.anomalousChartElement?.nativeElement) {
        this.resizeObserver.observe(this.anomalousChartElement.nativeElement);
    }
  }

  ngOnDestroy(): void {
    if (this.chart) {
        this.chart.dispose();
        this.chart = null;
    }
    if (this.anomalousChart) {
        this.anomalousChart.dispose();
        this.anomalousChart = null;
    }
    if (this.resizeObserver) {
        this.resizeObserver.disconnect();
    }
  }

  private initChart(): void {
    if (!this.chartElement) return;

    const chartDom = this.chartElement.nativeElement;
    this.chart = echarts.init(chartDom);

    const links = [
        { source: '0', target: '1' },
        { source: '0', target: '2' },
        { source: '0', target: '3' },
        { source: '0', target: '4' },
        { source: '0', target: '10' },
        { source: '1', target: '5' },
        { source: '1', target: '6' },
        { source: '2', target: '7' },
        { source: '3', target: '8' },
        { source: '3', target: '9' },
        { source: '2', target: '10' },
        { source: '10', target: '11' }
    ];

    const option: echarts.EChartsOption = {
        backgroundColor: 'transparent',
        tooltip: {
            trigger: 'item',
            formatter: '{b}: {c}'
        },
        series: [
            {
                type: 'graph',
                layout: 'force',
                data: [],
                links: links,
                roam: true,
                zoom: 0.61,
                label: {
                    show: false
                },
                force: {
                    repulsion: 500,
                    edgeLength: [50, 150]
                },
                lineStyle: {
                    color: 'rgba(255,255,255,0.2)',
                    curveness: 0.1
                }
            }
        ]
    };

    this.chart.setOption(option);
    this.updateGraph();
  }

  private updateGraph(): void {
    if (!this.chart) return;

    const grayColor = '#A9A9B3';
    const severityColors: { [key: string]: string } = {
        'critical': '#FF453A',
        'high': '#FF9F0A',
        'moderate': '#FFD60A',
        'low': '#32ADE6'
    };

    // SVG Paths for Icons
    const icons = {
        cloud: 'path://M18.42,8.22A7,7,0,0,0,5.06,10.11,4,4,0,0,0,6,18a1,1,0,0,0,0-2,2,2,0,0,1,0-4,1,1,0,0,0,1-1,5,5,0,0,1,9.73-1.61,1,1,0,0,0,.78.67,3,3,0,0,1,.24,5.84,1,1,0,1,0,.5,1.94,5,5,0,0,0,.17-9.62Z',
        server: 'path://M208,32H48A16,16,0,0,0,32,48V80a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM176,76a12,12,0,1,1,12-12A12,12,0,0,1,176,76Zm32,68H48a16,16,0,0,0-16,16v32a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V160A16,16,0,0,0,208,144Zm-32,44a12,12,0,1,1,12-12A12,12,0,0,1,176,188Z',
        database: 'path://M128,24C70.56,24,24,38.32,24,56V200c0,17.68,46.56,32,104,32s104-14.32,104-32V56C232,38.32,185.44,24,128,24Zm0,24c51.56,0,88,11.5,88,16s-36.44,16-88,16-88-11.5-88-16S76.44,48,128,48ZM40,92.76c19.39,10.65,51.69,15.24,88,15.24s68.61-4.59,88-15.24V128c-19.39,10.65-51.69,15.24-88,15.24S59.39,138.65,40,128Zm0,72c19.39,10.65,51.69,15.24,88,15.24s68.61-4.59,88-15.24v35.24c-19.39,10.65-51.69,15.24-88,15.24S59.39,210.65,40,200Z',
        network: 'path://M216,152H179.91a48.16,48.16,0,0,0-10.1-23.82l19.61-19.62a8,8,0,1,0-11.32-11.32L158.49,116.86A47.88,47.88,0,0,0,136,112.17V59.89A40,40,0,1,0,120,59.89v52.28a47.88,47.88,0,0,0-22.49,4.69L77.9,97.24a8,8,0,0,0-11.32,11.32l19.61,19.62A48.16,48.16,0,0,0,76.09,152H40a8,8,0,0,0,0,16H76.09a47.88,47.88,0,0,0,103.82,0H216a8,8,0,0,0,0-16Z',
        lock: 'path://M208,80H176V56a48,48,0,0,0-96,0V80H48A16,16,0,0,0,32,96V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V96A16,16,0,0,0,208,80Zm-80,84a12,12,0,1,1,12-12A12,12,0,0,1,128,164Zm32-84H96V56a32,32,0,0,1,64,0Z'
    };

    const nodeStructure = [
        { id: '0', name: 'eCommerce Platform', category: 0, symbolSize: 60, icon: icons.cloud },
        { id: '1', name: 'checkout-cart-service', category: 1, symbolSize: 40, icon: icons.server },
        { id: '2', name: 'inventory-api-gateway', category: 1, symbolSize: 40, icon: icons.server },
        { id: '3', name: 'storage-cluster-02', category: 1, symbolSize: 40, icon: icons.database },
        { id: '4', name: 'payment-service-prod', category: 1, symbolSize: 40, icon: icons.server },
        { id: '5', name: 'user-profile-service', category: 2, symbolSize: 25, icon: icons.server },
        { id: '6', name: 'core-switch-ny-01', category: 2, symbolSize: 25, icon: icons.network },
        { id: '7', name: 'edge-router-01', category: 2, symbolSize: 25, icon: icons.network },
        { id: '8', name: 'db-oracle-primary', category: 2, symbolSize: 25, icon: icons.database },
        { id: '9', name: 'DB-Replica', category: 2, symbolSize: 25, icon: icons.database },
        { id: '10', name: 'Auth Service', category: 1, symbolSize: 30, icon: icons.lock },
        { id: '11', name: 'Redis Cache', category: 2, symbolSize: 25, icon: icons.database }
    ];

    const nodes = nodeStructure.map(node => {
        const anomaly = this.filteredAnomalies.find(a => a.entity === node.name);
        const color = anomaly ? severityColors[anomaly.severity.toLowerCase()] : grayColor;
        const value = anomaly ? anomaly.severity : 'Normal';
        
        return {
            ...node,
            value,
            symbol: node.icon,
            itemStyle: { color }
        };
    });

    this.chart.setOption({
        series: [{
            data: nodes
        }]
    });
  }

  get filteredAnomalies(): AnomalyRecord[] {
    const filtered = this.anomalies.filter(a => {
      // Filter by Severity
      const severityMatch = this.selectedSeverityLevels.map(l => l.toLowerCase()).includes(a.severity.toLowerCase());
      if (!severityMatch) return false;

      // Check if anomaly is within the current time view
      if (this.dateRange.start && this.dateRange.end) {
        const start = this.parseAnomalyTime(a.timeRange.start, this.dateRange.start);
        const end = this.parseAnomalyTime(a.timeRange.end, this.dateRange.start);

        if (start && end) {
          const rangeStart = this.dateRange.start.getTime();
          const rangeEnd = this.dateRange.end.getTime();
          const anomStart = start.getTime();
          const anomEnd = end.getTime();

          // Check for overlap: (StartA <= EndB) and (EndA >= StartB)
          const isOverlapping = anomStart < rangeEnd && anomEnd > rangeStart;
          if (!isOverlapping) return false;

          // Special Filters
          if (this.selectedSpecialFilters.length > 0) {
            // Ongoing: End time is very close to selected end (within 2 minutes)
            if (this.selectedSpecialFilters.includes('ongoing')) {
               const diff = Math.abs(anomEnd - rangeEnd);
               // 2 minutes tolerance
               if (diff > 2 * 60 * 1000) return false;
            }

            // Long Duration: > 1 hour
            if (this.selectedSpecialFilters.includes('long-duration')) {
              const durationHours = (anomEnd - anomStart) / (1000 * 60 * 60);
              if (durationHours <= 1) return false;
            }

            // Recent: In the last 4h (End time is within [rangeEnd - 4h, rangeEnd])
            if (this.selectedSpecialFilters.includes('recent')) {
               const fourHoursMs = 4 * 60 * 60 * 1000;
               if (anomEnd < (rangeEnd - fourHoursMs)) return false;
            }
          }
        }
      }

      return true;
    });

    // Sorting logic
    if (this.sortColumn) {
      filtered.sort((a, b) => {
        let valA: any;
        let valB: any;

        switch (this.sortColumn) {
          case 'anomaly':
            valA = a.anomaly;
            valB = b.anomaly;
            break;
          case 'entity':
            valA = a.entity;
            valB = b.entity;
            break;
          case 'status':
            valA = a.status;
            valB = b.status;
            break;
          case 'severity':
            // Custom severity order
            const severityOrder = { 'critical': 3, 'high': 2, 'moderate': 1, 'low': 0 };
            valA = severityOrder[a.severity.toLowerCase() as keyof typeof severityOrder] ?? 0;
            valB = severityOrder[b.severity.toLowerCase() as keyof typeof severityOrder] ?? 0;
            break;
          case 'timeRange':
            // Use start time for sorting
            if (this.dateRange.start) {
              valA = this.parseAnomalyTime(a.timeRange.start, this.dateRange.start)?.getTime() ?? 0;
              valB = this.parseAnomalyTime(b.timeRange.start, this.dateRange.start)?.getTime() ?? 0;
            } else {
              valA = 0;
              valB = 0;
            }
            break;
          default:
            return 0;
        }

        if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }
    
    return filtered;
  }

  get paginatedAnomalies(): AnomalyRecord[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredAnomalies.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredAnomalies.length / this.itemsPerPage);
  }

  get pages(): number[] {
    // If no pages, return empty array to avoid loop issues
    if (this.totalPages < 1) return [];
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  setPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }


  // Helper to format date back to HH:mm for display if needed (not used in logic anymore)
  private formatTime(date: Date): string {
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  }

  formatTimeForDisplay(timeStr: string): string {
    // Try to extract HH:mm from "DD.MM.YYYY HH:mm"
    if (timeStr.includes(' ')) {
      return timeStr.split(' ')[1];
    }
    // If it's already just HH:mm or another format
    return timeStr;
  }

  toggleSort(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
  }

  toggleSeverityLevel(level: string): void {
    const index = this.selectedSeverityLevels.indexOf(level);
    if (index > -1) {
      this.selectedSeverityLevels.splice(index, 1);
    } else {
      this.selectedSeverityLevels.push(level);
    }
    // Reset to first page when filters change
    this.currentPage = 1;
    this.updateGraph();
  }

  toggleSpecialFilter(filter: string): void {
    const index = this.selectedSpecialFilters.indexOf(filter);
    if (index > -1) {
      this.selectedSpecialFilters.splice(index, 1);
    } else {
      this.selectedSpecialFilters.push(filter);
    }
    this.currentPage = 1;
    this.updateGraph();
  }

  toggleTimeFilter(filter: string): void {
    // Single select behavior: toggle on/off or switch to new
    if (this.selectedTimeFilters === filter) {
      this.selectedTimeFilters = null;
      // Reset to default if deselected? Or leave as is. Assuming reset.
      this.dateRange.start = AnomalyInsights.parseDateTime('04.09.2024 07:00');
      this.dateRange.end = AnomalyInsights.parseDateTime('04.09.2024 17:00');
    } else {
      this.selectedTimeFilters = filter;
      this.updateDateRangeForLast(filter);
    }
    this.currentPage = 1;
    this.updateGraph();
  }

  private updateDateRangeForLast(durationStr: string): void {
    const now = AnomalyInsights.parseDateTime('04.09.2024 17:00')!; // Using the fixed "now" as requested
    let hoursToSubtract = 0;
    
    switch (durationStr) {
      case '1h': hoursToSubtract = 1; break;
      case '4h': hoursToSubtract = 4; break;
      case '12h': hoursToSubtract = 12; break;
    }
    
    const startTime = new Date(now.getTime() - (hoursToSubtract * 60 * 60 * 1000));
    
    this.dateRange = {
      start: startTime,
      end: now
    };
  }

  // Helper to get anomaly duration (still kept if needed for other logic, though filtering logic removed)
  private getAnomalyDurationInHours(anomaly: AnomalyRecord): number {
    if (!this.dateRange.start) return 0;

    const start = this.parseAnomalyTime(anomaly.timeRange.start, this.dateRange.start);
    const end = this.parseAnomalyTime(anomaly.timeRange.end, this.dateRange.start);

    if (!start || !end) return 0;

    const diffMs = end.getTime() - start.getTime();
    return diffMs / (1000 * 60 * 60);
  }


  getAnomalyStyle(anomaly: AnomalyRecord): any {
    if (!this.dateRange.start || !this.dateRange.end) {
      return {};
    }

    const rangeStart = this.dateRange.start.getTime();
    const rangeEnd = this.dateRange.end.getTime();
    const totalDuration = rangeEnd - rangeStart;

    if (totalDuration <= 0) return { display: 'none' };

    const anomalyStart = this.parseAnomalyTime(anomaly.timeRange.start, this.dateRange.start);
    const anomalyEnd = this.parseAnomalyTime(anomaly.timeRange.end, this.dateRange.start);

    if (!anomalyStart || !anomalyEnd) return { display: 'none' };

    const anomStartTime = anomalyStart.getTime();
    const anomEndTime = anomalyEnd.getTime();

    // Calculate intersection with the selected range
    const visibleStart = Math.max(rangeStart, anomStartTime);
    const visibleEnd = Math.min(rangeEnd, anomEndTime);

    if (visibleStart >= visibleEnd) {
      return { display: 'none' };
    }

    const leftPercent = Math.max(0, ((visibleStart - rangeStart) / totalDuration) * 100);
    const widthPercent = Math.max(0, ((visibleEnd - visibleStart) / totalDuration) * 100);

    return {
      'margin-left': `${leftPercent}%`,
      'width': `${widthPercent}%`
    };
  }

  private parseAnomalyTime(timeStr: string, baseDate: Date): Date | null {
    // Try parsing as full date time first
    const fullDate = AnomalyInsights.parseDateTime(timeStr);
    if (fullDate) return fullDate;

    // Fallback to HH:mm format relative to baseDate
    const [hours, minutes] = timeStr.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) return null;
    const date = new Date(baseDate);
    date.setHours(hours, minutes, 0, 0);
    return date;
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

  // Context menu methods
  isAnomalySelected(anomaly: AnomalyRecord): boolean {
    return this.selectedAnomalies.some(a => a.entity === anomaly.entity && a.anomaly === anomaly.anomaly);
  }

  toggleAnomalySelection(anomaly: AnomalyRecord): void {
    const index = this.selectedAnomalies.findIndex(a => a.entity === anomaly.entity && a.anomaly === anomaly.anomaly);
    if (index > -1) {
      this.selectedAnomalies.splice(index, 1);
    } else {
      this.selectedAnomalies.push(anomaly);
    }
  }

  onRowRightClick(event: MouseEvent, anomaly: AnomalyRecord): void {
    event.preventDefault();
    
    // If right-clicked anomaly is not selected, select only it
    if (!this.isAnomalySelected(anomaly)) {
      this.selectedAnomalies = [anomaly];
    }
    
    this.contextMenuPosition = { x: event.clientX, y: event.clientY };
    this.contextMenuVisible = true;
  }

  onContextMenuAction(action: ContextMenuAction): void {
    console.log('Context menu action:', action, 'Selected anomalies:', this.selectedAnomalies);
    
    // Update selected anomalies based on action type
    this.selectedAnomalies.forEach(selectedAnomaly => {
      const anomalyIndex = this.anomalies.findIndex(
        a => a.entity === selectedAnomaly.entity && a.anomaly === selectedAnomaly.anomaly
      );
      
      if (anomalyIndex > -1) {
        switch (action.type) {
          case 'severity':
            if (action.value) {
              this.anomalies[anomalyIndex].severity = action.value as 'Critical' | 'High' | 'Moderate' | 'Low';
            }
            break;
          case 'status':
            if (action.value) {
              this.anomalies[anomalyIndex].status = action.value as 'Active' | 'Resolved' | 'Investigating';
            }
            break;
          case 'priority':
            // Priority is not in the current model, but we can add it as a property
            console.log(`Priority set to ${action.value} for ${this.anomalies[anomalyIndex].entity}`);
            break;
          case 'createAnnotation':
            console.log(`Annotation created: "${action.annotation}" for ${this.anomalies[anomalyIndex].entity}`);
            break;
          case 'assignTo':
            console.log(`Assigned to ${action.value} for ${this.anomalies[anomalyIndex].entity}`);
            break;
          case 'createEvent':
            this.showEventDialog();
            break;
          case 'relateSelected':
            console.log(`Related to ${action.value} for ${this.anomalies[anomalyIndex].entity}`);
            break;
          case 'forwardTo':
            console.log(`Forwarded for ${this.anomalies[anomalyIndex].entity}`);
            break;
        }
      }
    });

    // Refresh the graph to reflect severity changes
    this.updateGraph();
    
    // Clear selection after action
    this.selectedAnomalies = [];
  }

  closeContextMenu(): void {
    this.contextMenuVisible = false;
  }

  // Calculate age time from time range (duration)
  calculateAgeTime(anomaly: AnomalyRecord): string {
    const start = AnomalyInsights.parseDateTime(anomaly.timeRange.start);
    const end = AnomalyInsights.parseDateTime(anomaly.timeRange.end);
    
    if (!start || !end) return '0h 00m';
    
    const diffMs = end.getTime() - start.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
  }

  // Format date time for Event Monitor table
  formatDateTime(dateStr: string): string {
    const date = AnomalyInsights.parseDateTime(dateStr);
    if (!date) return dateStr;
    
    const month = (date.getMonth() + 1).toString();
    const day = date.getDate().toString();
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    const ampm = date.getHours() >= 12 ? 'pm' : 'am';
    
    return `${month}/${day}/${year} ${hours}:${minutes}:${seconds} ${ampm}`;
  }

  // Show event dialog
  showEventDialog(): void {
    this.eventDialogVisible = true;
  }

  // Close event dialog
  closeEventDialog(): void {
    this.eventDialogVisible = false;
    // Reset form
    this.eventForm = {
      title: '',
      description: '',
      severity: 'Moderate',
      category: 'Performance',
      status: 'Open',
      assignedTeam: 'DevOps',
      application: ''
    };
  }

  // Save event and add to tables
  saveEvent(): void {
    if (!this.eventForm.title) {
      return; // Don't save if title is empty
    }

    // Create new anomaly record from event
    let eventTime = new Date();
    // Use visible date range end time if available to ensure visibility
    if (this.dateRange.end) {
        eventTime = new Date(this.dateRange.end.getTime() - 60000); // 1 min before end
    }
    
    const nowStr = `${eventTime.getDate().toString().padStart(2, '0')}.${(eventTime.getMonth() + 1).toString().padStart(2, '0')}.${eventTime.getFullYear()} ${eventTime.getHours().toString().padStart(2, '0')}:${eventTime.getMinutes().toString().padStart(2, '0')}`;
    
    const newAnomaly: AnomalyRecord = {
      id: `manual-${Date.now()}`,
      anomaly: this.eventForm.title,
      entity: this.eventForm.application || 'manual-event',
      severity: this.eventForm.severity as 'Critical' | 'High' | 'Moderate',
      status: 'Active' as const,
      timeRange: {
        start: nowStr,
        end: nowStr
      }
    };

    // Add to the beginning of anomalies array (create new reference for change detection)
    this.anomalies = [newAnomaly, ...this.anomalies];
    
    // Close dialog
    this.closeEventDialog();
  }

  // --- Chart Logic ---

  selectTimeRange(range: string): void {
    this.selectedTimeRange = range;
    this.updateAnomalousChartData();
  }

  initAnomalousChart(): void {
    if (!this.anomalousChartElement) return;

    this.anomalousChart = echarts.init(this.anomalousChartElement.nativeElement);
    this.updateAnomalousChartData();
  }

  updateAnomalousChartData(): void {
    if (!this.anomalousChart) return;

    // Generate realistic anomaly spike data
    let category: string[] = [];
    let seriesData1: number[] = [];
    let seriesData2: number[] = [];
    let seriesData3: number[] = [];
    
    let baseTime: Date = new Date();
    let interval: number = 60;
    let points: number = 24;
    let timeFormat: string = 'HH:mm';

    switch (this.selectedTimeRange!) {
      case '24H':
        baseTime = new Date(2024, 3, 4, 0, 0, 0);
        interval = 60;
        points = 24;
        timeFormat = 'HH:mm';
        break;
      case '5D':
        baseTime = new Date(2024, 3, 1, 0, 0, 0);
        interval = 120;
        points = 60;
        timeFormat = 'MM/DD HH:mm';
        break;
      case '1W':
        baseTime = new Date(2024, 3, 1, 0, 0, 0);
        interval = 120;
        points = 84;
        timeFormat = 'ddd HH:mm';
        break;
      case '1M':
        baseTime = new Date(2024, 3, 1, 0, 0, 0);
        interval = 720;
        points = 60;
        timeFormat = 'MM/DD';
        break;
      default:
        baseTime = new Date(2024, 3, 4, 0, 0, 0);
        interval = 60;
        points = 24;
        timeFormat = 'HH:mm';
    }

    // Generate time labels and spike data
    for (let i = 0; i < points; i++) {
      const currentTime = new Date(baseTime.getTime() + i * interval * 60000);
      
      let timeLabel: string;
      if (timeFormat === 'HH:mm') {
        const hours = String(currentTime.getHours()).padStart(2, '0');
        const minutes = String(currentTime.getMinutes()).padStart(2, '0');
        timeLabel = `${hours}:${minutes}`;
      } else if (timeFormat === 'ddd HH:mm') {
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const dayName = dayNames[currentTime.getDay()];
        const hours = String(currentTime.getHours()).padStart(2, '0');
        const minutes = String(currentTime.getMinutes()).padStart(2, '0');
        timeLabel = `${dayName} ${hours}:${minutes}`;
      } else if (timeFormat === 'MM/DD HH:mm') {
        const month = String(currentTime.getMonth() + 1).padStart(2, '0');
        const day = String(currentTime.getDate()).padStart(2, '0');
        const hours = String(currentTime.getHours()).padStart(2, '0');
        const minutes = String(currentTime.getMinutes()).padStart(2, '0');
        timeLabel = `${month}/${day} ${hours}:${minutes}`;
      } else {
        const month = String(currentTime.getMonth() + 1).padStart(2, '0');
        const day = String(currentTime.getDate()).padStart(2, '0');
        timeLabel = `${month}/${day}`;
      }
      
      category.push(timeLabel);
      
      let spikePositions1: number[] = [];
      let spikePositions2: number[] = [];
      let spikePositions3: number[] = [];
      
      switch (this.selectedTimeRange!) {
        case '24H':
          spikePositions1 = [5, 10, 15];
          spikePositions2 = [8, 18];
          spikePositions3 = [12, 16, 20];
          break;
        case '5D':
          spikePositions1 = [8, 15, 32, 48];
          spikePositions2 = [12, 28, 45];
          spikePositions3 = [20, 35, 52];
          break;
        case '1W':
          spikePositions1 = [12, 25, 40, 60, 75];
          spikePositions2 = [18, 35, 55, 70];
          spikePositions3 = [22, 45, 65, 78];
          break;
        case '1M':
          spikePositions1 = [8, 18, 32, 45];
          spikePositions2 = [12, 25, 40, 52];
          spikePositions3 = [15, 30, 48];
          break;
      }
      
      if (spikePositions1.includes(i)) {
        seriesData1.push(Math.min(Math.floor(Math.random() * 30) + 70, 95));
      } else {
        seriesData1.push(Math.floor(Math.random() * 8) + 2);
      }
      
      if (spikePositions2.includes(i)) {
        seriesData2.push(Math.min(Math.floor(Math.random() * 20) + 25, 45));
      } else {
        seriesData2.push(Math.floor(Math.random() * 6) + 1);
      }
      
      if (spikePositions3.includes(i)) {
        seriesData3.push(Math.min(Math.floor(Math.random() * 25) + 15, 40));
      } else {
        seriesData3.push(Math.floor(Math.random() * 5) + 0.5);
      }
    }

    const option: echarts.EChartsOption = {
        backgroundColor: 'transparent',
        animation: true,
        animationDuration: 1500,
        animationEasing: 'linear',
        tooltip: {
            trigger: 'axis',
            backgroundColor: 'rgba(31, 30, 51, 0.95)',
            borderColor: 'rgba(255, 255, 255, 0.2)',
            borderWidth: 1,
            textStyle: { 
              color: '#EDEAF1',
              fontSize: 12
            },
            axisPointer: {
                type: 'cross',
                lineStyle: { 
                  color: 'rgba(255, 255, 255, 0.3)',
                  type: 'dashed'
                }
            }
        },
        grid: {
            left: '6%',
            right: '3%',
            bottom: '12%',
            top: '8%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: category,
            boundaryGap: false,
            axisLine: { 
              show: true,
              lineStyle: { 
                color: 'rgba(255, 255, 255, 0.15)',
                width: 1
              }
            },
            axisTick: { 
              show: true,
              lineStyle: { 
                color: 'rgba(255, 255, 255, 0.1)',
                width: 1
              },
              length: 4
            },
            axisLabel: { 
                color: 'rgba(255, 255, 255, 0.6)',
                fontSize: 10,
                interval: this.selectedTimeRange === '24H' ? 2 : Math.floor(points / 10),
                rotate: this.selectedTimeRange === '24H' ? 0 : 30,
                margin: 10
            },
            splitLine: { 
              show: true,
              lineStyle: { 
                color: 'rgba(255, 255, 255, 0.08)',
                type: 'solid',
                width: 1
              }
            }
        },
        yAxis: {
            type: 'value',
            min: 0,
            max: 100,
            interval: 10,
            axisLine: {
              show: true,
              lineStyle: { 
                color: 'rgba(255, 255, 255, 0.15)',
                width: 1
              }
            },
            axisTick: {
              show: true,
              lineStyle: { 
                color: 'rgba(255, 255, 255, 0.1)',
                width: 1
              },
              length: 4
            },
            splitLine: {
                show: true,
                lineStyle: { 
                  color: 'rgba(255, 255, 255, 0.08)',
                  type: 'solid',
                  width: 1
                }
            },
            axisLabel: { 
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: 11,
              margin: 10,
              formatter: '{value}.00'
            }
        },
        series: [
            {
                name: 'Type A',
                type: 'line',
                data: seriesData1,
                smooth: true,
                symbol: 'none',
                lineStyle: { 
                  width: 2,
                  color: '#9C7FCF'
                },
                emphasis: {
                  lineStyle: { width: 3 }
                },
                animationDuration: 1500,
                animationEasing: 'linear',
                animationDelay: (idx: number) => idx * 15
            },
            {
                name: 'Type B',
                type: 'line',
                data: seriesData2,
                smooth: true,
                symbol: 'none',
                lineStyle: { 
                  width: 2,
                  color: '#5C92F6'
                },
                emphasis: {
                  lineStyle: { width: 3 }
                },
                animationDuration: 1500,
                animationEasing: 'linear',
                animationDelay: (idx: number) => idx * 15
            },
            {
                name: 'Type C',
                type: 'line',
                data: seriesData3,
                smooth: true,
                symbol: 'none',
                lineStyle: { 
                  width: 2,
                  color: '#FF6F61'
                },
                emphasis: {
                  lineStyle: { width: 3 }
                },
                animationDuration: 1500,
                animationEasing: 'linear',
                animationDelay: (idx: number) => idx * 15
            }
        ],
        // Add vertical dashed lines at the end
        markLine: {
          symbol: 'none',
          data: [
            {
              xAxis: points - 2,
              lineStyle: {
                type: 'dashed',
                color: 'rgba(255, 255, 255, 0.3)',
                width: 1
              }
            }
          ],
          silent: true
        }
    };

    this.anomalousChart.setOption(option, true);
  }
}

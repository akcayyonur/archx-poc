import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgChartsModule } from 'ng2-charts';
import { Chart, ChartConfiguration, ChartData, ChartOptions, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { TimeScale } from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
import { SliderModule } from 'primeng/slider';
import * as d3 from 'd3';
import { DashboardService, DataRange, NodeRelatedCIMapping, AnalysisResult, ServerDataRange, ServerNodes, ServerAnalysisResult, DatasetType, CorrelationResponse, CorrelationStatus, AIInsightsData } from '@shared/services/dashboard.service';
import { AuthService } from '@shared/services/auth.service';
import { Router } from '@angular/router';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

import { marked } from 'marked';

// Register the time scale and zoom plugin
Chart.register(TimeScale, zoomPlugin);

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.html',
    styleUrls: ['./dashboard.scss'],
    standalone: true,
    imports: [CommonModule, FormsModule, NgChartsModule, SliderModule]
})
export class Dashboard implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild(BaseChartDirective) chart?: BaseChartDirective;
    @ViewChild('treeContainer', { static: false }) treeContainer?: ElementRef;

    // Data properties
    allNodes: string[] = [];
    allRelatedCIs: string[] = [];
    nodeRelatedCIMap: { [key: string]: string[] } = {};
    
    // Server data properties
    allServerNodes: string[] = [];
    
    // Dataset selection
    selectedDataset: string = 'transaction';
    availableDatasets: DatasetType[] = [];
    
    // Service Model Tree properties
    serviceModelTree: any = null;
    isLoadingCI: boolean = false;
    configurationItems: any = null;
    private treeRendered: boolean = false;
    
    // Form controls
    selectedNode: string = '';
    selectedRelatedCI: string = '';
    selectedMetric: string = 'calls_per_min';
    startDate: string = '';
    endDate: string = '';
    windowSize: number = 120;
    kMultiplier: number = 3;
    
    // Chart data
    chartData: ChartData<'line'> = {
        labels: [],
        datasets: []
    };
    
    chartOptions: ChartOptions<'line'> = {
        responsive: true,
        maintainAspectRatio: false,
        backgroundColor: '#ffffff',
        plugins: {
            title: {
                display: false
            },
            legend: {
                display: false
            },
            tooltip: {
                enabled: true,
                mode: 'index' as const,
                intersect: false,
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: '#ffffff',
                bodyColor: '#ffffff',
                borderColor: '#007bff',
                borderWidth: 1,
                titleFont: {
                    family: 'Inter, sans-serif',
                    size: 14,
                    weight: 600
                },
                bodyFont: {
                    family: 'Inter, sans-serif',
                    size: 13
                },
                callbacks: {
                    title: (tooltipItems: any[]) => {
                        if (tooltipItems.length > 0) {
                            // Handle both regular time series data and anomaly scatter points
                            const item = tooltipItems[0];
                            if (item.raw && typeof item.raw === 'object' && item.raw.x) {
                                // Scatter point (anomaly)
                                return new Date(item.raw.x).toLocaleString();
                            } else {
                                // Regular time series data - use parsed.x which contains the timestamp
                                const timestamp = item.parsed.x;
                                if (timestamp) {
                                    return new Date(timestamp).toLocaleString();
                                }
                                // Fallback to label if it's already a Date object
                                if (item.label instanceof Date) {
                                    return item.label.toLocaleString();
                                }
                                return '';
                            }
                        }
                        return '';
                    },
                    label: (context: any) => {
                        const label = context.dataset.label || '';
                        let value = context.parsed.y;
                        
                        // Skip threshold area datasets in tooltip
                        if (label === 'Threshold Area') return '';
                        
                        // Format value based on dataset type
                        if (label === 'Anomaly') {
                            return `${label}: ${value.toFixed(2)}`;
                        } else if (label === 'Data') {
                            return `Value: ${value.toFixed(2)}`;
                        } else if (label.includes('Threshold')) {
                            return `${label}: ${value.toFixed(2)}`;
                        }
                        
                        return `${label}: ${value.toFixed(2)}`;
                    }
                }
            },
            zoom: {
                pan: {
                    enabled: true,
                    mode: 'xy',
                    modifierKey: 'ctrl'
                },
                zoom: {
                    wheel: {
                        enabled: true
                    },
                    pinch: {
                        enabled: true
                    },
                    mode: 'xy',
                    drag: {
                        enabled: true,
                        backgroundColor: 'rgba(0, 123, 255, 0.1)',
                        borderColor: 'rgba(0, 123, 255, 0.3)',
                        borderWidth: 1
                    }
                }
            }
        },
        scales: {
            x: {
                type: 'time',
                time: {
                    unit: 'hour',
                    displayFormats: {
                        hour: 'MMM dd, HH:mm'
                    }
                },
                grid: {
                    color: 'rgba(0, 0, 0, 0.1)'
                },
                ticks: {
                    color: '#333333',
                    maxTicksLimit: 10,
                    source: 'auto',
                    font: {
                        family: 'Inter, sans-serif',
                        size: 12,
                        weight: 500
                    }
                }
            },
            y: {
                grid: {
                    color: 'rgba(0, 0, 0, 0.1)'
                },
                ticks: {
                    color: '#333333',
                    font: {
                        family: 'Inter, sans-serif',
                        size: 12,
                        weight: 500
                    }
                },
                suggestedMax: undefined // Will be set dynamically based on data
            }
        },
        interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false
        }
    };

    // Statistics
    stats: {
        totalRecords: number;
        anomalyCount: number;
        anomalyRate: number;
        minValue: number;
        maxValue: number;
        avgValue: number;
    } = {
        totalRecords: 0,
        anomalyCount: 0,
        anomalyRate: 0,
        minValue: 0,
        maxValue: 0,
        avgValue: 0
    };
    
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    // Correlation analysis properties
    correlationResults: CorrelationResponse | null = null;
    correlationStatus: CorrelationStatus | null = null;
    showCorrelationSection: boolean = false;
    isCorrelationLoading: boolean = false;
    
    // Correlation chart properties
    showCorrelationChart: boolean = false;
    correlationChartData: ChartData<'line'> = {
        labels: [],
        datasets: []
    };
    correlationChartOptions: ChartOptions<'line'> = {};
    selectedCorrelation: any = null;
    isCorrelationChartLoading: boolean = false;
    
    // AI Insights properties
    aiInsights: AIInsightsData | null = null;
    isAIInsightsLoading: boolean = false;
    showAIInsights: boolean = false;
    expandedInsightSections: { [key: string]: boolean } = {};
    
    // Analysis results storage
    currentTransactionAnalysis: AnalysisResult | null = null;
    currentServerAnalysis: ServerAnalysisResult | null = null;
    
    // Loading state
    isLoading: boolean = false;
    private isInitializing: boolean = true;
    
    // PrimeNG slider properties
    sliderRange: [number, number] = [0, 100];
    private sliderStartTime: Date = new Date();
    private sliderEndTime: Date = new Date();
    
    // Hierarchical menu states
    expandedNodes: { [key: string]: boolean } = {};
    expandedTransactions: { [key: string]: boolean } = {};
    
    // Server data menu states
    expandedServerNodes: { [key: string]: boolean } = {};
    
    // Available metrics
    availableMetrics = [
        { value: 'calls_per_min', label: 'Calls Per Min' },
        { value: 'avg_response_time', label: 'Avg Response Time' }
    ];
    
    private destroy$ = new Subject<void>();
    private parameterChange$ = new Subject<void>();

    constructor(
        private dashboardService: DashboardService,
        public authService: AuthService,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.setupParameterChangeListener();
        this.loadDatasetTypes();
        this.loadInitialData();
        this.loadConfigurationItems();
    }

    ngAfterViewInit(): void {
        // Tree will be rendered after configuration items are loaded
    }

    toggleNode(node: string): void {
        this.expandedNodes[node] = !this.expandedNodes[node];
    }

    toggleTransaction(node: string, ci: string): void {
        const key = node + '-' + ci;
        this.expandedTransactions[key] = !this.expandedTransactions[key];
    }

    toggleServerNode(node: string): void {
        this.expandedServerNodes[node] = !this.expandedServerNodes[node];
    }

    selectDataset(datasetType: string): void {
        this.selectedDataset = datasetType;
        this.selectedNode = '';
        this.selectedRelatedCI = '';
        this.selectedMetric = '';
        this.refreshAIInsights(); // Refresh AI insights when dataset changes
        
        // Clear chart data to prevent showing stale data
        this.chartData = { labels: [], datasets: [] };
        this.stats = {
            totalRecords: 0,
            anomalyCount: 0,
            anomalyRate: 0,
            minValue: 0,
            maxValue: 0,
            avgValue: 0
        };
        
        // Clear expanded states for the previous dataset
        this.expandedNodes = {};
        this.expandedTransactions = {};
        this.expandedServerNodes = {};
        
        this.loadDataForDataset();
        this.loadCorrelationStatus(); // Refresh correlation status for new dataset
    }

    private resetSelections(): void {
        this.selectedNode = '';
        this.selectedRelatedCI = '';
        this.selectedMetric = '';
        this.chartData = { labels: [], datasets: [] };
    }

    private loadDataForDataset(): void {
        if (this.selectedDataset === 'transaction') {
            this.loadDataRange();
            this.loadNodeRelatedCIMapping();
            // Set default selections for transaction data
            setTimeout(() => {
                if (this.allNodes.length > 0) {
                    this.selectedNode = this.allNodes[0];
                    if (this.nodeRelatedCIMap[this.selectedNode] && this.nodeRelatedCIMap[this.selectedNode].length > 0) {
                        this.selectedRelatedCI = this.nodeRelatedCIMap[this.selectedNode][0];
                        this.selectedMetric = this.getMetricsForDataset('transaction')[0]?.value || 'calls_per_min';
                        // Update time range for the selected node
                        this.updateTimeRangeForNode();
                    }
                }
            }, 100);
        } else if (this.selectedDataset === 'server') {
            this.loadServerDataRange();
            this.loadServerNodes();
            // Set default selections for server data
            setTimeout(() => {
                if (this.allServerNodes.length > 0) {
                    this.selectedNode = this.allServerNodes[0];
                    this.selectedMetric = this.getMetricsForDataset('server')[0]?.value || 'cpu_util_pct';
                    // Update time range for the selected server node (this will trigger analysis)
                    this.updateTimeRangeForServerNode();
                }
            }, 100);
        }
    }

    getRelatedCIsForNode(node: string): string[] {
        return this.nodeRelatedCIMap[node] || [];
    }

    isMetricSelected(node: string, ci: string, metric: string): boolean {
        return this.selectedNode === node && 
               this.selectedRelatedCI === ci && 
               this.selectedMetric === metric;
    }

    isServerMetricSelected(node: string, metric: string): boolean {
        return this.selectedNode === node && this.selectedMetric === metric;
    }

    selectMetric(node: string, ci: string, metric: string): void {
        this.selectedNode = node;
        this.selectedRelatedCI = ci;
        this.selectedMetric = metric;
        this.refreshAIInsights(); // Refresh AI insights when metric changes
        
        // Update tree selection highlighting
        this.updateTreeSelection();
        
        if (this.selectedDataset === 'server') {
            this.analyzeServerData();
        } else {
            // Update time range for the selected transaction node
            this.updateTimeRangeForNode();
            this.analyzeData();
        }
    }

    selectServerMetric(node: string, metric: string): void {
        this.selectedNode = node;
        this.selectedRelatedCI = ''; // Not needed for server data
        this.selectedMetric = metric;
        this.refreshAIInsights(); // Refresh AI insights when server metric changes
        
        // Update tree selection highlighting
        this.updateTreeSelection();
        
        // Update time range for the selected server node
        this.updateTimeRangeForServerNode();
        this.analyzeServerData();
    }

    getMetricsForDataset(datasetType: string): Array<{value: string, label: string}> {
        return this.dashboardService.getMetricsForDataset(datasetType);
    }

    getDatasetLabel(datasetType: string): string {
        const dataset = this.availableDatasets.find(d => d.value === datasetType);
        return dataset ? dataset.label : datasetType;
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private setupParameterChangeListener(): void {
        this.parameterChange$
            .pipe(
                debounceTime(300), // Reduced debounce time for faster response
                takeUntil(this.destroy$)
            )
            .subscribe(() => {
                if (!this.isInitializing) {
                this.analyzeData();
                }
            });
    }

    private loadInitialData(): void {
        this.loadDataRange();
        this.loadNodeRelatedCIMapping();
        this.loadServerData();
        this.loadCorrelationStatus(); // Load correlation status on startup
        
        // Load data for the default dataset (transaction)
        this.loadDataForDataset();
        
        // Complete initialization after a delay to allow all async operations to finish
        setTimeout(() => {
            this.completeInitialization();
        }, 2000); // Increased timeout to ensure tree renders first
    }

    private completeInitialization(): void {
        this.isInitializing = false;
        // Analysis will be triggered by updateTimeRangeForNode() or updateTimeRangeForServerNode() 
        // when time range data is loaded during initialization
    }

    private loadDatasetTypes(): void {
        this.availableDatasets = this.dashboardService.getDatasetTypes();
    }

    private loadServerData(): void {
        this.loadServerDataRange();
        this.loadServerNodes();
    }

    private loadServerDataRange(): void {
        this.dashboardService.getServerDataRange()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (data: ServerDataRange) => {
                    if (data.success) {
                        this.endDate = data.overall_range.end_date;
                        // Set start date to 1 day before end date
                        const endDate = new Date(data.overall_range.end_date);
                        const startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000);
                        
                        // Format as local datetime string (YYYY-MM-DDTHH:mm)
                        this.startDate = this.formatLocalDateTime(startDate);
                    }
                },
                error: (error) => console.error('Error loading server data range:', error)
            });
    }

    private loadServerNodes(): void {
        this.dashboardService.getServerNodes()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (data: ServerNodes) => {
                    if (data.success) {
                        this.allServerNodes = data.nodes.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
                        // Update time range for the first server node if available
                        if (this.allServerNodes.length > 0 && this.selectedDataset === 'server') {
                            // Expand the first server node menu
                            this.expandedServerNodes[this.allServerNodes[0]] = true;
                            this.updateTimeRangeForServerNode();
                        }
                    }
                },
                error: (error) => console.error('Error loading server nodes:', error)
            });
    }

    private loadDataRange(): void {
        this.dashboardService.getDataRange()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (data: DataRange) => {
                    if (data.success) {
                        // Parse timestamps as Turkey timezone (UTC+3)
                        // The backend sends timestamps in Turkey timezone format (YYYY-MM-DDTHH:MM)
                        const startDateStr = data.start_date;
                        const endDateStr = data.end_date;
                        
                        // Create Date objects treating the timestamps as Turkey timezone
                        // We need to add timezone info to make JavaScript interpret them correctly
                        const startDateWithTz = new Date(startDateStr + '+03:00');
                        const endDateWithTz = new Date(endDateStr + '+03:00');
                        
                        // Set the full available time range for the slider
                        this.sliderStartTime = startDateWithTz;
                        this.sliderEndTime = endDateWithTz;
                        
                        // Set end date to the latest available time
                        this.endDate = endDateStr;
                        
                        // Calculate start date as 12 hours before end date (default range)
                        // Since we're working with Turkey timezone, this will be correct
                        const startDate = new Date(endDateWithTz.getTime() - 12 * 60 * 60 * 1000);
                        
                        console.log('Backend timestamps (Turkey time):', startDateStr, 'to', endDateStr);
                        console.log('12h range (Turkey time):', this.formatLocalDateTime(startDate), 'to', endDateStr);
                        console.log('Full range (Turkey time):', this.formatLocalDateTime(this.sliderStartTime), 'to', this.formatLocalDateTime(this.sliderEndTime));
                        
                        // Format as local datetime string (YYYY-MM-DDTHH:mm)
                        this.startDate = this.formatLocalDateTime(startDate);
                        
                        // Now update slider positions to show the 12-hour selection
                        this.updateSliderPositionsFromDates();
                    }
                },
                error: (error) => console.error('Error loading data range:', error)
            });
    }

    private loadNodeRelatedCIMapping(): void {
        this.dashboardService.getNodeRelatedCIMapping()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (data: NodeRelatedCIMapping) => {
                    if (data.success) {
                        this.allNodes = data.nodes.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
                        this.allRelatedCIs = data.relatedcis;
                        this.nodeRelatedCIMap = data.mapping;
                        
                        // Set default selections if available
                        if (this.allNodes.length > 0) {
                            this.selectedNode = this.allNodes[0];
                            // Get the first related CI for the selected node
                            if (this.nodeRelatedCIMap[this.selectedNode] && this.nodeRelatedCIMap[this.selectedNode].length > 0) {
                                this.selectedRelatedCI = this.nodeRelatedCIMap[this.selectedNode][0];
                                
                                // Expand the first node and first transaction menus
                                this.expandedNodes[this.selectedNode] = true;
                                this.expandedTransactions[this.selectedNode + '-' + this.selectedRelatedCI] = true;
                                
                                // Update time range for the selected node
                                this.updateTimeRangeForNode();
                            }
                        }
                    }
                },
                error: (error) => console.error('Error loading mapping:', error)
            });
    }

    onNodeChange(): void {
        this.selectedRelatedCI = '';
        // Get the first related CI for the new selected node
        if (this.nodeRelatedCIMap[this.selectedNode] && this.nodeRelatedCIMap[this.selectedNode].length > 0) {
            this.selectedRelatedCI = this.nodeRelatedCIMap[this.selectedNode][0];
        }
        
        // Update tree selection highlighting
        this.updateTreeSelection();
        
        // Update time range for the selected node (this will trigger analysis)
        this.updateTimeRangeForNode();
    }

    onServerNodeChange(): void {
        // Update tree selection highlighting
        this.updateTreeSelection();
        
        // Update time range for the selected server node (this will trigger analysis)
        this.updateTimeRangeForServerNode();
    }

    private updateTimeRangeForNode(): void {
        if (!this.selectedNode) return;
        
        this.dashboardService.getNodeTimeRange(this.selectedNode)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (data: any) => {
                    if (data.success) {
                        // Update slider time range to show full available range
                        this.sliderStartTime = this.parseTimestampInTurkeyTimezone(data.min_timestamp);
                        this.sliderEndTime = this.parseTimestampInTurkeyTimezone(data.max_timestamp);
                        
                        // Always update the time range for transaction nodes since each node has different data availability
                        // Set end date to end of node data
                        this.endDate = data.end_date;
                        
                        // Set start date to 24 hours before end date, but not before the min_timestamp
                        const endDate = new Date(data.end_date);
                        const minDate = this.parseTimestampInTurkeyTimezone(data.min_timestamp);
                        const startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000);
                        
                        // Use the later of: 24 hours before end date OR the minimum available timestamp
                        const actualStartDate = startDate > minDate ? startDate : minDate;
                        
                        // Format as local datetime string (YYYY-MM-DDTHH:mm)
                        this.startDate = this.formatLocalDateTime(actualStartDate);
                        
                        this.updateSliderPositionsFromDates();
                        
                        
                        // Trigger analysis after time range is updated
                        if (!this.isInitializing) {
                            this.parameterChange$.next();
                        } else {
                            // During initialization, trigger analysis directly if we have all required data
                            if (this.selectedNode && this.selectedRelatedCI && this.selectedMetric) {
                                setTimeout(() => this.analyzeData(), 100);
                            }
                        }
                    }
                },
                error: (error: any) => console.error('Error loading node time range:', error)
            });
    }

    private updateTimeRangeForServerNode(): void {
        if (!this.selectedNode) return;
        
        this.dashboardService.getServerNodeTimeRange(this.selectedNode)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (data: any) => {
                    if (data.success) {
                        // Update slider time range to show full available range
                        this.sliderStartTime = this.parseTimestampInTurkeyTimezone(data.min_timestamp);
                        this.sliderEndTime = this.parseTimestampInTurkeyTimezone(data.max_timestamp);
                        
                        // Always update the time range for server nodes since each node has different data availability
                        // Set end date to end of server node data
                        this.endDate = data.end_date;
                        
                        // Set start date to 24 hours before end date, but not before the min_timestamp
                        const endDate = new Date(data.end_date);
                        const minDate = this.parseTimestampInTurkeyTimezone(data.min_timestamp);
                        const startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000);
                        
                        // Use the later of: 24 hours before end date OR the minimum available timestamp
                        const actualStartDate = startDate > minDate ? startDate : minDate;
                        
                        // Format as local datetime string (YYYY-MM-DDTHH:mm)
                        this.startDate = this.formatLocalDateTime(actualStartDate);
                        
                        this.updateSliderPositionsFromDates();
                        
                        
                        // Trigger analysis after time range is updated
                        this.analyzeServerData();
                    }
                },
                error: (error: any) => console.error('Error loading server node time range:', error)
            });
    }

    onRelatedCIChange(): void {
        this.parameterChange$.next();
    }

    onMetricChange(): void {
        this.parameterChange$.next();
    }

    onDateChange(): void {
        this.parameterChange$.next();
    }

    onWindowChange(): void {
        this.parameterChange$.next();
    }

    onKChange(): void {
        this.parameterChange$.next();
    }

    onSliderChange(event: any) {
        const [startPercent, endPercent] = event.values;
        
        // Calculate new dates based on percentages
        const totalRange = this.sliderEndTime.getTime() - this.sliderStartTime.getTime();
        const newStartTimestamp = this.sliderStartTime.getTime() + (totalRange * startPercent / 100);
        const newEndTimestamp = this.sliderStartTime.getTime() + (totalRange * endPercent / 100);
        
        // Convert to local time (Turkey UTC+3) without applying additional offsets
        const startDate = new Date(newStartTimestamp);
        const endDate = new Date(newEndTimestamp);
        
        // Format as local datetime string (YYYY-MM-DDTHH:mm)
        this.startDate = this.formatLocalDateTime(startDate);
        this.endDate = this.formatLocalDateTime(endDate);
        
        this.refreshAIInsights(); // Refresh AI insights when date range changes
        
        // Trigger analysis with new date range
        this.parameterChange$.next();
    }

    /**
     * Format a Date object to Turkey timezone datetime string (YYYY-MM-DDTHH:mm)
     * This ensures consistent formatting in Turkey timezone (UTC+3)
     */
    private formatLocalDateTime(date: Date): string {
        // Use Intl.DateTimeFormat to get Turkey timezone components
        const formatter = new Intl.DateTimeFormat('en-CA', {
            timeZone: 'Europe/Istanbul',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
        
        const parts = formatter.formatToParts(date);
        const year = parts.find(part => part.type === 'year')?.value;
        const month = parts.find(part => part.type === 'month')?.value;
        const day = parts.find(part => part.type === 'day')?.value;
        const hour = parts.find(part => part.type === 'hour')?.value;
        const minute = parts.find(part => part.type === 'minute')?.value;
        
        return `${year}-${month}-${day}T${hour}:${minute}`;
    }

    /**
     * Convert timestamp string to Date object in Turkey timezone
     * This ensures chart and other components display times correctly
     */
    private parseTimestampInTurkeyTimezone(timestamp: string): Date {
        // If timestamp already has timezone info, use it directly
        if (timestamp.includes('+') || timestamp.includes('Z') || timestamp.includes('T') && timestamp.length > 16) {
            return new Date(timestamp);
        }
        
        // If timestamp is in format "YYYY-MM-DD HH:MM:SS" or "YYYY-MM-DDTHH:MM", treat as Turkey timezone
        // Add Turkey timezone offset (+03:00) to make JavaScript interpret it correctly
        const timestampWithTz = timestamp.includes('T') ? 
            timestamp + '+03:00' : 
            timestamp.replace(' ', 'T') + '+03:00';
            
        return new Date(timestampWithTz);
    }

    private updateTimeRangeFromSlider(startPos: number, endPos: number): void {
        const totalTime = this.sliderEndTime.getTime() - this.sliderStartTime.getTime();
        const startTime = this.sliderStartTime.getTime() + (totalTime * startPos / 100);
        const endTime = this.sliderEndTime.getTime() + (totalTime * endPos / 100);
        
        // Format as local datetime string (YYYY-MM-DDTHH:mm) instead of ISO string
        const startDate = new Date(startTime);
        const endDate = new Date(endTime);
        
        this.startDate = this.formatLocalDateTime(startDate);
        this.endDate = this.formatLocalDateTime(endDate);
        
        // Trigger analysis with new time range
        this.parameterChange$.next();
    }

    private updateSliderPositionsFromDates(): void {
        if (!this.startDate || !this.endDate) return;
        
        // Parse the local datetime strings and convert to timestamps
        // The dates are already in local time (Turkey UTC+3), so we don't need additional offsets
        const startTime = new Date(this.startDate).getTime();
        const endTime = new Date(this.endDate).getTime();
        const totalTime = this.sliderEndTime.getTime() - this.sliderStartTime.getTime();
        
        const startPos = ((startTime - this.sliderStartTime.getTime()) / totalTime) * 100;
        const endPos = ((endTime - this.sliderStartTime.getTime()) / totalTime) * 100;
        
        // Ensure positions are within bounds
        const boundedStartPos = Math.max(0, Math.min(100, startPos));
        const boundedEndPos = Math.max(0, Math.min(100, endPos));
        
        // Update PrimeNG slider range
        this.sliderRange = [boundedStartPos, boundedEndPos];
    }

    private analyzeData(): void {
        if (this.selectedDataset === 'server') {
            this.analyzeServerData();
            return;
        }

        if (!this.selectedNode || !this.selectedRelatedCI || !this.startDate || !this.endDate) {
            console.log('Missing required parameters:', {
                node: this.selectedNode,
                relatedci: this.selectedRelatedCI,
                startDate: this.startDate,
                endDate: this.endDate
            });
            return;
        }

        console.log('Analyzing data with params:', {
            node: this.selectedNode,
            relatedci: this.selectedRelatedCI,
            metric: this.selectedMetric,
            start_date: this.startDate,
            end_date: this.endDate,
            window: this.windowSize,
            k: this.kMultiplier
        });

        this.isLoading = true;

        const params = {
            node: this.selectedNode,
            relatedci: this.selectedRelatedCI,
            metric: this.selectedMetric,
            start_date: this.startDate,
            end_date: this.endDate,
            window: this.windowSize,
            k: this.kMultiplier
        };

        this.dashboardService.analyzeData(params)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (result: AnalysisResult) => {
                    console.log('Analysis result:', result);
                    if (result.success) {
                        this.updateChart(result);
                        this.updateStats(result);
                        this.currentTransactionAnalysis = result; // Store result
                    } else {
                        console.error('Analysis failed:', result.error);
                    }
                },
                error: (error) => {
                    console.error('Error analyzing data:', error);
                },
                complete: () => {
                    this.isLoading = false;
                }
            });
    }

    private analyzeServerData(): void {
        if (!this.selectedNode || !this.startDate || !this.endDate) {
            console.log('Missing required server parameters:', {
                node: this.selectedNode,
                startDate: this.startDate,
                endDate: this.endDate
            });
            return;
        }

        console.log('Analyzing server data with params:', {
            node_name: this.selectedNode,
            metric: this.selectedMetric,
            start_date: this.startDate,
            end_date: this.endDate,
            window: this.windowSize,
            k: this.kMultiplier
        });

        this.isLoading = true;

        this.dashboardService.analyzeServerData({
            node_name: this.selectedNode,
            metric: this.selectedMetric,
            start_date: this.startDate,
            end_date: this.endDate,
            window: this.windowSize,
            k: this.kMultiplier
        })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (result: ServerAnalysisResult) => {
                    console.log('Server analysis result:', result);
                    if (result.success) {
                        this.updateServerChart(result);
                        this.updateServerStats(result);
                        this.currentServerAnalysis = result; // Store result
                    } else {
                        console.error('Server analysis failed:', result.error);
                    }
                },
                error: (error) => {
                    console.error('Error analyzing server data:', error);
                },
                complete: () => {
                    this.isLoading = false;
                }
            });
    }

    private updateChart(result: AnalysisResult): void {
        console.log('Updating chart with data:', {
            timestamps: result.timestamps.length,
            values: result.values.length,
            upper: result.upper.length,
            lower: result.lower.length,
            anomalies: result.anomaly_timestamps ? result.anomaly_timestamps.length : 0
        });

        // Log first few data points for debugging
        if (result.timestamps.length > 0) {
            console.log('First timestamp:', result.timestamps[0]);
            console.log('First value:', result.values[0]);
            console.log('First upper:', result.upper[0]);
            console.log('First lower:', result.lower[0]);
        }



        // Prepare data for Chart.js with proper timezone handling
        const labels = result.timestamps.map(timestamp => this.parseTimestampInTurkeyTimezone(timestamp));
        
        this.chartData = {
            labels: labels,
            datasets: [
                {
                    label: 'Data',
                    data: result.values,
                    borderColor: '#05cdc2',
                    borderWidth: 3,
                    fill: false,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 6,
                    pointHoverBackgroundColor: '#0056b3',
                    order: 1
                },
                {
                    label: 'Upper Threshold',
                    data: result.upper,
                    backgroundColor: 'rgba(0, 86, 179, 0.05)',
                    fill: false,
                    borderWidth: 0,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 4,
                    pointHoverBackgroundColor: '#0056b3',
                    order: 2
                },
                {
                    label: 'Lower Threshold',
                    data: result.lower,
                    backgroundColor: 'rgba(0, 86, 179, 0.05)',
                    fill: false,
                    borderWidth: 0,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 4,
                    pointHoverBackgroundColor: '#0056b3',
                    order: 2
                },
                {
                    label: 'Threshold Area',
                    data: result.upper,
                    borderColor: 'transparent',
                    backgroundColor: 'rgba(0, 123, 255, 0.1)',
                    borderWidth: 0,
                    fill: '+1',
                    tension: 0.4,
                    pointRadius: 0,
                    showLine: true,
                    order: 3
                },
                {
                    label: 'Threshold Area',
                    data: result.lower,
                    borderColor: 'transparent',
                    backgroundColor: 'rgba(0, 123, 255, 0.10)',
                    borderWidth: 0,
                    fill: false,
                    tension: 0.4,
                    pointRadius: 0,
                    showLine: true,
                    order: 3
                }
            ]
        };

        // Add minimum threshold lines if they exist and are greater than 0
        if (result.min_absolute_threshold && result.min_absolute_threshold > 0) {
            // Create horizontal line data for minimum absolute threshold
            const minAbsoluteData = labels.map(() => result.min_absolute_threshold);
            
            this.chartData.datasets.push({
                label: 'Min Absolute Threshold',
                data: minAbsoluteData,
                borderColor: '#ff6b35',
                backgroundColor: 'transparent',
                borderWidth: 2,
                borderDash: [10, 5],
                fill: false,
                tension: 0,
                pointRadius: 0,
                pointHoverRadius: 4,
                pointHoverBackgroundColor: '#ff6b35',
                order: 4
            });
        }


        // Add anomalies dataset if anomalies exist
        if (result.anomaly_timestamps && result.anomaly_timestamps.length > 0) {
            const anomalyData = result.anomaly_timestamps.map((timestamp, index) => ({
                x: this.parseTimestampInTurkeyTimezone(timestamp),
                y: result.anomaly_values[index]
            }));

            // Add anomaly points as crosses
            this.chartData.datasets.push({
                label: 'Anomaly',
                data: anomalyData,
                type: 'scatter',
                backgroundColor: '#dc3545',
                borderColor: '#dc3545',
                borderWidth: 2,
                pointRadius: 8,
                pointHoverRadius: 10,
                pointStyle: 'crossRot',
                showLine: false,
                order: 0
            } as any);
        }

        // Calculate max value from all datasets (including threshold lines) and add 10% margin
        let maxValue = 0;
        this.chartData.datasets.forEach(dataset => {
            if (Array.isArray(dataset.data)) {
                dataset.data.forEach((point: any) => {
                    const value = typeof point === 'object' && point.y !== undefined ? point.y : point;
                    if (typeof value === 'number' && !isNaN(value)) {
                        maxValue = Math.max(maxValue, value);
                    }
                });
            }
        });
        
        let suggestedMax = 0;
        // Add 10% margin to the max value
        if(maxValue > 100) {
            suggestedMax = maxValue * 1.2;
        } else {
            suggestedMax = maxValue * 1.5;
        }
        
        // Update chart options with the calculated suggestedMax
        if (this.chartOptions.scales?.['y']) {
            this.chartOptions.scales['y'].suggestedMax = suggestedMax;
        }

        // Force chart update
        if (this.chart) {
            this.chart.update();
        }

        console.log('Chart updated with Chart.js data');
    
    // Update tree selection highlighting after chart update
    this.updateTreeSelection();
    }

    private updateServerChart(result: ServerAnalysisResult): void {
        console.log('Updating server chart with data:', {
            timestamps: result.timestamps.length,
            values: result.values.length,
            upper: result.upper.length,
            lower: result.lower.length,
            anomalies: result.anomaly_timestamps ? result.anomaly_timestamps.length : 0
        });

        // Prepare data for Chart.js with proper timezone handling
        const labels = result.timestamps.map(timestamp => this.parseTimestampInTurkeyTimezone(timestamp));
        
        this.chartData = {
            labels: labels,
            datasets: [
                {
                    label: 'Data',
                    data: result.values,
                    borderColor: '#05cdc2',
                    borderWidth: 3,
                    fill: false,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 6,
                    pointHoverBackgroundColor: '#0056b3',
                    order: 1
                },
                {
                    label: 'Upper Threshold',
                    data: result.upper,
                    borderColor: '#0056b3',
                    backgroundColor: 'rgba(0, 86, 179, 0.05)',
                    borderWidth: 0,
                    fill: false,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 4,
                    pointHoverBackgroundColor: '#0056b3',
                    order: 2
                },
                {
                    label: 'Lower Threshold',
                    data: result.lower,
                    borderColor: '#0056b3',
                    backgroundColor: 'rgba(0, 86, 179, 0.05)',
                    borderWidth: 0,
                    fill: false,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 4,
                    pointHoverBackgroundColor: '#0056b3',
                    order: 2
                },
                {
                    label: 'Threshold Area',
                    data: result.upper,
                    borderColor: 'transparent',
                    backgroundColor: 'rgba(0, 123, 255, 0.1)',
                    borderWidth: 0,
                    fill: '+1',
                    tension: 0.4,
                    pointRadius: 0,
                    showLine: true,
                    order: 3,
                },
                {
                    label: 'Threshold Area',
                    data: result.lower,
                    borderColor: 'transparent',
                    backgroundColor: 'rgba(0, 123, 255, 0.1)',
                    borderWidth: 0,
                    fill: false,
                    tension: 0.4,
                    pointRadius: 0,
                    showLine: true,
                    order: 3,
                }
            ]
        };

        // Add minimum threshold lines if they exist and are greater than 0
        if (result.min_absolute_threshold && result.min_absolute_threshold > 0) {
            // Create horizontal line data for minimum absolute threshold
            const minAbsoluteData = labels.map(() => result.min_absolute_threshold);
            
            this.chartData.datasets.push({
                label: 'Min Absolute Threshold',
                data: minAbsoluteData,
                borderColor: '#ff6b35',
                backgroundColor: 'transparent',
                borderWidth: 2,
                borderDash: [10, 5],
                fill: false,
                tension: 0,
                pointRadius: 0,
                pointHoverRadius: 4,
                pointHoverBackgroundColor: '#ff6b35',
                order: 4
            });
        }

        // Add anomalies dataset if anomalies exist
        if (result.anomaly_timestamps && result.anomaly_timestamps.length > 0) {
            const anomalyData = result.anomaly_timestamps.map((timestamp, index) => ({
                x: this.parseTimestampInTurkeyTimezone(timestamp),
                y: result.anomaly_values[index]
            }));

            this.chartData.datasets.push({
                label: 'Anomaly Score',
                data: anomalyData,
                type: 'scatter',
                backgroundColor: '#dc3545',
                borderColor: '#dc3545',
                pointRadius: 6,
                pointHoverRadius: 12,
                pointStyle: 'crossRot',
                showLine: false
            } as any);
        }

        // Calculate max value from all datasets (including threshold lines) and add 10% margin
        let maxValue = 0;
        this.chartData.datasets.forEach(dataset => {
            if (Array.isArray(dataset.data)) {
                dataset.data.forEach((point: any) => {
                    const value = typeof point === 'object' && point.y !== undefined ? point.y : point;
                    if (typeof value === 'number' && !isNaN(value)) {
                        maxValue = Math.max(maxValue, value);
                    }
                });
            }
        });
        
        // Add 10% margin to the max value
        let suggestedMax = maxValue > 0 ? maxValue * 1.2 : undefined;
        
        // Update chart options with the calculated suggestedMax
        if (this.chartOptions.scales?.['y']) {
            this.chartOptions.scales['y'].suggestedMax = suggestedMax;
        }

        // Force chart update
        if (this.chart) {
            this.chart.update();
        }

        console.log('Server chart updated with Chart.js data');
        
        // Update tree selection highlighting after server chart update
        this.updateTreeSelection();
    }

    private updateServerStats(result: ServerAnalysisResult): void {
        this.stats = {
            totalRecords: result.total_records,
            anomalyCount: result.anomaly_count,
            anomalyRate: result.anomaly_rate,
            minValue: result.min_value,
            maxValue: result.max_value,
            avgValue: result.avg_value
        };
    }

    private updateStats(result: AnalysisResult): void {
        this.stats = {
            totalRecords: result.total_records,
            anomalyCount: result.anomaly_count,
            anomalyRate: result.anomaly_rate,
            minValue: result.min_value,
            maxValue: result.max_value,
            avgValue: result.avg_value
        };
    }

    private formatMetricName(metric: string): string {
        return metric.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    getChartTitle(): string {
        if (this.selectedDataset === 'transaction' && this.selectedNode && this.selectedRelatedCI && this.selectedMetric) {
            return `${this.formatMetricName(this.selectedMetric)} analysis for ${this.selectedNode} - ${this.selectedRelatedCI}`;
        } else if (this.selectedDataset === 'server' && this.selectedNode && this.selectedMetric) {
            return `${this.formatMetricName(this.selectedMetric)} analysis for Server ${this.selectedNode}`;
        }
        return 'ArchX Anomaly Detection Dashboard';
    }

    get availableRelatedCIs(): string[] {
        if (this.selectedNode && this.nodeRelatedCIMap[this.selectedNode]) {
            return this.nodeRelatedCIMap[this.selectedNode];
        }
        return [];
    }

    // Time range slider methods
    formatTimeDisplay(dateString: string): string {
        if (!dateString) return 'Not set';
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    setQuickTimeRange(range: string): void {
        if (!this.endDate) return;
        
        // Use the last available timestamp from data, not current time
        const lastAvailableTime = new Date(this.endDate);
        let startTime: Date;
        
        switch (range) {
            case '1h':
                startTime = new Date(lastAvailableTime.getTime() - 60 * 60 * 1000);
                break;
            case '6h':
                startTime = new Date(lastAvailableTime.getTime() - 6 * 60 * 60 * 1000);
                break;
            case '12h':
                startTime = new Date(lastAvailableTime.getTime() - 12 * 60 * 60 * 1000);
                break;
            case '1d':
                startTime = new Date(lastAvailableTime.getTime() - 24 * 60 * 60 * 1000);
                break;
            case '1w':
                startTime = new Date(lastAvailableTime.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case '1m':
                startTime = new Date(lastAvailableTime.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
            default:
                return;
        }
        
        // Format as local datetime string (YYYY-MM-DDTHH:mm) instead of ISO string
        this.startDate = this.formatLocalDateTime(startTime);
        
        // Keep the end date as the last available timestamp from data
        // this.endDate remains unchanged
        
        // Update slider positions
        this.updateSliderPositionsFromDates();
        
        // Trigger analysis
        this.parameterChange$.next();
    }

    resetZoom(): void {
        // Reset chart zoom without refreshing data
        if (this.chart && this.chart.chart) {
            this.chart.chart.resetZoom();
        }
    }

    // ============================================================================
    // CORRELATION ANALYSIS METHODS
    // ============================================================================

    /**
     * Toggle the correlation analysis section
     */
    toggleCorrelationSection(): void {
        console.log('toggleCorrelationSection called, current state:', this.showCorrelationSection);
        this.showCorrelationSection = !this.showCorrelationSection;
        console.log('showCorrelationSection set to:', this.showCorrelationSection);
        
        if (this.showCorrelationSection) {
            console.log('Section is now shown, loading correlation status...');
            if (!this.correlationStatus) {
                this.loadCorrelationStatus();
            }
            // Automatically run correlation analysis when showing the section
            console.log('Starting correlation analysis...');
            this.runCorrelationAnalysis();
        }
    }

    /**
     * Load correlation analysis status
     */
    loadCorrelationStatus(): void {
        this.dashboardService.getCorrelationStatus()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (status: CorrelationStatus) => {
                    this.correlationStatus = status;
                    console.log('Correlation status loaded:', status);
                },
                error: (error) => {
                    console.error('Error loading correlation status:', error);
                    // Set a default status to prevent button from being disabled
                    this.correlationStatus = {
                        success: false,
                        status: {
                            transaction_data_available: true,
                            server_data_available: true
                        }
                    };
                }
            });
    }

    /**
     * Run correlation analysis for the current dataset
     */
    runCorrelationAnalysis(): void {
        console.log('runCorrelationAnalysis called');
        console.log('startDate:', this.startDate);
        console.log('endDate:', this.endDate);
        console.log('selectedDataset:', this.selectedDataset);
        
        if (!this.startDate || !this.endDate) {
            console.log('Missing start or end date, showing alert');
            alert('Please set start and end dates before running correlation analysis');
            return;
        }

        console.log('Dates are valid, starting analysis...');
        this.isCorrelationLoading = true;
        this.correlationResults = null;

        if (this.selectedDataset === 'transaction') {
            console.log('Running transaction correlation analysis...');
            this.analyzeTransactionCorrelation();
        } else if (this.selectedDataset === 'server') {
            console.log('Running server correlation analysis...');
            this.analyzeServerCorrelation();
        } else {
            console.log('Unknown dataset type:', this.selectedDataset);
        }
    }

    /**
     * Analyze cross-transaction correlation
     */
    private analyzeTransactionCorrelation(): void {
        this.dashboardService.analyzeTransactionCorrelation(
            this.startDate,
            this.endDate,
            0.6 // Default threshold
        )
        .pipe(takeUntil(this.destroy$))
        .subscribe({
            next: (result: CorrelationResponse) => {
                if (result.success) {
                    this.correlationResults = result;
                    console.log('Transaction correlation results:', result);
                } else {
                    console.error('Transaction correlation failed:', result.error);
                    alert(`Correlation analysis failed: ${result.error}`);
                }
            },
            error: (error) => {
                console.error('Error analyzing transaction correlation:', error);
                alert('Error running correlation analysis');
            },
            complete: () => {
                this.isCorrelationLoading = false;
            }
        });
    }

    /**
     * Analyze cross-node server correlation
     */
    private analyzeServerCorrelation(): void {
        this.dashboardService.analyzeServerCorrelation(
            this.startDate,
            this.endDate,
            0.6 // Default threshold
        )
        .pipe(takeUntil(this.destroy$))
        .subscribe({
            next: (result: CorrelationResponse) => {
                if (result.success) {
                    this.correlationResults = result;
                    console.log('Server correlation results:', result);
                } else {
                    console.error('Server correlation failed:', result.error);
                    alert(`Correlation analysis failed: ${result.error}`);
                }
            },
            error: (error) => {
                console.error('Error analyzing server correlation:', error);
                alert('Error running correlation analysis');
            },
            complete: () => {
                this.isCorrelationLoading = false;
            }
        });
    }

    /**
     * Get correlation strength label and color
     */
    getCorrelationStrengthInfo(correlation: number): { label: string; color: string; class: string } {
        const absCorr = Math.abs(correlation);
        if (absCorr >= 0.8) {
            return { label: 'Strong', color: '#dc3545', class: 'strong-correlation' };
        } else if (absCorr >= 0.6) {
            return { label: 'Moderate', color: '#ffc107', class: 'moderate-correlation' };
        } else {
            return { label: 'Weak', color: '#28a745', class: 'weak-correlation' };
        }
    }

    /**
     * Show correlation chart for selected correlation pair
     */
    showCorrelationChartFor(correlation: any): void {
        this.selectedCorrelation = correlation;
        this.showCorrelationChart = true;
        this.isCorrelationChartLoading = true;
        
        // Fetch data for both metrics
        this.dashboardService.getCorrelationChartData(
            this.startDate,
            this.endDate,
            this.selectedDataset,
            correlation.node1,
            correlation.relatedci1,
            correlation.metric1,
            correlation.node2,
            correlation.relatedci2,
            correlation.metric2
        )
        .pipe(takeUntil(this.destroy$))
        .subscribe({
            next: (result) => {
                if (result.success) {
                    this.prepareCorrelationChartData(result);
                } else {
                    console.error('Failed to fetch correlation chart data:', result.error);
                    alert(`Failed to load correlation chart: ${result.error}`);
                }
            },
            error: (error) => {
                console.error('Error fetching correlation chart data:', error);
                alert('Error loading correlation chart data');
            },
            complete: () => {
                this.isCorrelationChartLoading = false;
            }
        });
    }

    /**
     * Prepare correlation chart data for display
     */
    private prepareCorrelationChartData(result: any): void {
        const metric1Data = result.metric1_data;
        const metric2Data = result.metric2_data;
        const commonTimestamps = result.common_timestamps;
        
        // Get metric labels
        const metric1Label = this.getMetricLabel(this.selectedCorrelation.metric1);
        const metric2Label = this.getMetricLabel(this.selectedCorrelation.metric2);
        
        // Prepare datasets
        const datasets = [
            {
                label: `${this.selectedCorrelation.node1}${this.selectedCorrelation.relatedci1 ? ' - ' + this.selectedCorrelation.relatedci1 : ''} (${metric1Label})`,
                data: metric1Data.values,
                borderColor: '#2563eb',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                borderWidth: 3,
                fill: false,
                tension: 0.4,
                pointRadius: 4,
                pointHoverRadius: 6,
                pointBackgroundColor: '#2563eb',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2
            },
            {
                label: `${this.selectedCorrelation.node2}${this.selectedCorrelation.relatedci2 ? ' - ' + this.selectedCorrelation.relatedci2 : ''} (${metric2Label})`,
                data: metric2Data.values,
                borderColor: '#dc2626',
                backgroundColor: 'rgba(220, 38, 38, 0.1)',
                borderWidth: 3,
                fill: false,
                tension: 0.4,
                pointRadius: 4,
                pointHoverRadius: 6,
                pointBackgroundColor: '#dc2626',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2
            }
        ];
        
        this.correlationChartData = {
            labels: commonTimestamps,
            datasets: datasets
        };
        
        // Set chart options
        this.correlationChartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            backgroundColor: '#ffffff',
            plugins: {
                title: {
                    display: true,
                    text: `Correlation Chart: ${this.formatCorrelation(this.selectedCorrelation.correlation)}`,
                    color: '#333333',
                    font: {
                        family: 'Inter, sans-serif',
                        size: 16,
                        weight: 'bold'
                    }
                },
                legend: {
                    display: true,
                    position: 'top' as const,
                    labels: {
                        color: '#333333',
                        usePointStyle: true,
                        font: {
                            family: 'Inter, sans-serif',
                            size: 12
                        }
                    }
                },
                tooltip: {
                    mode: 'index' as const,
                    intersect: false,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    borderColor: '#007bff',
                    borderWidth: 1,
                    titleFont: {
                        family: 'Inter, sans-serif',
                        size: 14,
                        weight: 600
                    },
                    bodyFont: {
                        family: 'Inter, sans-serif',
                        size: 13
                    }
                }
            },
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'hour',
                        displayFormats: {
                            hour: 'MMM dd, HH:mm'
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        color: '#333333',
                        maxTicksLimit: 10,
                        font: {
                            family: 'Inter, sans-serif',
                            size: 12,
                            weight: 500
                        }
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        color: '#333333',
                        font: {
                            family: 'Inter, sans-serif',
                            size: 12,
                            weight: 500
                        }
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

    /**
     * Get metric label for display
     */
    private getMetricLabel(metric: string): string {
        const metrics = this.getMetricsForDataset(this.selectedDataset);
        const metricObj = metrics.find(m => m.value === metric);
        return metricObj ? metricObj.label : metric;
    }

    /**
     * Close correlation chart
     */
    closeCorrelationChart(): void {
        this.showCorrelationChart = false;
        this.selectedCorrelation = null;
        this.correlationChartData = { labels: [], datasets: [] };
    }

    /**
     * Format correlation value for display
     */
    formatCorrelation(correlation: number): string {
        return correlation.toFixed(4);
    }

    /**
     * Get correlation section title
     */
    getCorrelationSectionTitle(): string {
        if (this.selectedDataset === 'transaction') {
            return 'Cross-Transaction Correlation Analysis';
        } else if (this.selectedDataset === 'server') {
            return 'Cross-Node Correlation Analysis';
        }
        return 'Correlation Analysis';
    }

    /**
     * Check if correlation analysis is available for current dataset
     */
    isCorrelationAvailable(): boolean {
        // If status hasn't been loaded yet, assume it's available
        if (!this.correlationStatus) return true;
        
        if (this.selectedDataset === 'transaction') {
            return this.correlationStatus.status.transaction_data_available;
        } else if (this.selectedDataset === 'server') {
            return this.correlationStatus.status.server_data_available;
        }
        return true; // Default to true if dataset type is unknown
    }

    // AI Insights Methods
    toggleAIInsights() {
        this.showAIInsights = !this.showAIInsights;
        
        // Auto-generate insights when showing the section
        if (this.showAIInsights && this.canGenerateInsights()) {
            this.generateAIInsights();
        } else if (this.showAIInsights && this.aiInsights) {
            // If insights are already available, expand the executive summary
            this.expandedInsightSections['executive_summary'] = true;
        }
    }

    refreshAIInsights() {
        // Close AI insights section and clear previous insights
        this.showAIInsights = false;
        this.aiInsights = null;
        this.isAIInsightsLoading = false;
    }

      canGenerateInsights(): boolean {
    return Boolean(this.selectedDataset && this.selectedNode && this.selectedMetric && 
           this.startDate && this.endDate && this.chartData.datasets.length > 0);
  }

    generateAIInsights() {
        if (!this.canGenerateInsights()) {
            return;
        }

        this.isAIInsightsLoading = true;
        
        // Prepare anomaly data
        const anomalyData = {
            total_records: this.getCurrentAnalysisResult()?.total_records || 0,
            anomaly_count: this.getCurrentAnalysisResult()?.anomaly_count || 0,
            anomaly_rate: this.getCurrentAnalysisResult()?.anomaly_rate || 0,
            min_value: this.getCurrentAnalysisResult()?.min_value || 0,
            max_value: this.getCurrentAnalysisResult()?.max_value || 0,
            avg_value: this.getCurrentAnalysisResult()?.avg_value || 0,
            anomaly_timestamps: this.getCurrentAnalysisResult()?.anomaly_timestamps || [],
            anomaly_values: this.getCurrentAnalysisResult()?.anomaly_values || []
        };

        console.log('Current analysis result:', this.getCurrentAnalysisResult());
        console.log('Prepared anomaly data:', anomalyData);

        // Prepare correlation data if available
        let correlationData = null;
        if (this.correlationResults) {
            correlationData = {
                summary_stats: this.correlationResults.summary_stats
            };
        }

        const request = {
            start_date: this.startDate,
            end_date: this.endDate,
            dataset_type: this.selectedDataset,
            selected_node: this.selectedNode,
            selected_metric: this.selectedMetric,
            selected_relatedci: this.selectedDataset === 'transaction' ? this.selectedRelatedCI : undefined,
            anomaly_data: JSON.stringify(anomalyData),
            correlation_data: correlationData ? JSON.stringify(correlationData) : undefined
        };

        this.dashboardService.getAIInsights(request)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    if (response.success && response.insights) {
                        this.aiInsights = response.insights;
                        // Initialize all sections as collapsed
                        this.initializeInsightSections();
                        // Expand the executive summary section if AI insights are generated
                        this.expandedInsightSections['executive_summary'] = true;
                    } else {
                        this.aiInsights = this.createErrorInsights(`Error: ${response.error || 'Failed to generate insights'}`);
                    }
                },
                error: (error) => {
                    this.aiInsights = this.createErrorInsights(`Error: ${error.message || 'Failed to generate insights'}`);
                },
                complete: () => {
                    this.isAIInsightsLoading = false;
                }
            });
    }

    private createErrorInsights(errorMessage: string): AIInsightsData {
        return {
            executive_summary: {
                title: "Executive Summary",
                content: errorMessage
            },
            anomaly_analysis: {
                title: "Anomaly Analysis",
                content: "Analysis unavailable due to error."
            },
            causal_analysis: {
                title: "Causal Pathway Analysis",
                content: "Causal analysis cannot be performed due to technical issues."
            },
            business_impact: {
                title: "Business Impact Assessment",
                content: "Business impact assessment is unavailable."
            },
            recommendations: {
                title: "Recommendations",
                content: "No recommendations can be provided due to system error."
            },
            risk_mitigation: {
                title: "Risk Mitigation Strategies",
                content: "Risk mitigation strategies cannot be generated."
            }
        };
    }

    private initializeInsightSections(): void {
        if (this.aiInsights) {
            const sections = [
                'executive_summary',
                'anomaly_analysis',
                'causal_analysis',
                'business_impact',
                'recommendations',
                'risk_mitigation'
            ];
            
            sections.forEach(section => {
                this.expandedInsightSections[section] = false;
            });
        }
    }

    toggleInsightSection(section: string): void {
        this.expandedInsightSections[section] = !this.expandedInsightSections[section];
    }

    isInsightSectionExpanded(section: string): boolean {
        return this.expandedInsightSections[section] || false;
    }

    private getCurrentAnalysisResult(): AnalysisResult | ServerAnalysisResult | null {
        // This method should return the current analysis result based on the selected dataset
        // For now, we'll return null and handle this in the actual implementation
        return this.selectedDataset === 'transaction' ? this.currentTransactionAnalysis : this.currentServerAnalysis;
    }

  formatAIInsights(insights: string): string {
    // Use marked library to parse markdown to HTML
    const html = marked.parse(insights) as string;
    
    // Apply custom styling to the parsed HTML
    return html
      // Style headers with custom colors
      .replace(/<h1>/g, '<h1 style="color: #667eea; margin-top: 30px; margin-bottom: 20px; font-weight: 600; font-size: 1.8em;">')
      .replace(/<h2>/g, '<h2 style="color: #667eea; margin-top: 30px; margin-bottom: 20px; font-weight: 600; font-size: 1.6em;">')
      .replace(/<h3>/g, '<h3 style="color: #667eea; margin-top: 30px; margin-bottom: 20px; font-weight: 600; font-size: 1.4em;">')
      .replace(/<h4>/g, '<h4 style="color: #667eea; margin-top: 30px; margin-bottom: 20px; font-weight: 600; font-size: 1.2em;">')
      .replace(/<h5>/g, '<h5 style="color: #A6A6A6; margin-top: 25px; margin-bottom: 15px; font-weight: 500; font-size: 1.1em;">')
      .replace(/<h6>/g, '<h6 style="color: #A6A6A6; margin-top: 25px; margin-bottom: 15px; font-weight: 500; font-size: 1em;">')
      // Style paragraphs
      .replace(/<p>/g, '<p style="margin-bottom: 20px; line-height: 1.6;">')
      // Style strong text
      .replace(/<strong>/g, '<strong style="color: #667eea;">')
      // Style em text
      .replace(/<em>/g, '<em style="color: #A6A6A6;">')
      // Style code blocks
      .replace(/<code>/g, '<code style="background-color: #f8f9fa; padding: 2px 4px; border-radius: 3px; font-family: monospace;">')
      // Style pre blocks
      .replace(/<pre>/g, '<pre style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; overflow-x: auto; margin-bottom: 20px;">')
      // Style lists
      .replace(/<ul>/g, '<ul style="margin-bottom: 20px; padding-left: 20px;">')
      .replace(/<ol>/g, '<ol style="margin-bottom: 20px; padding-left: 20px;">')
      .replace(/<li>/g, '<li style="margin-bottom: 8px; line-height: 1.6;">')
      // Style blockquotes
      .replace(/<blockquote>/g, '<blockquote style="border-left: 4px solid #667eea; padding-left: 15px; margin: 20px 0; font-style: italic; color: #666;">');
  }

  onWindowSizeChange() {
    this.refreshAIInsights(); // Refresh AI insights when window size changes
    this.parameterChange$.next();
  }

  onKMultiplierChange() {
    this.refreshAIInsights(); // Refresh AI insights when k multiplier changes
    this.parameterChange$.next();
  }

  navigateToUserField(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser && currentUser.field) {
      this.router.navigate([`/fields/${currentUser.field}`]);
    } else {
      // Default to tech field if no user field is available
      this.router.navigate(['/fields/tech']);
    }
  }

  // ============================================================================
  // SERVICE MODEL TREE METHODS
  // ============================================================================

  loadConfigurationItems(): void {
    // Only load once - prevent any refreshes
    if (this.configurationItems || this.isLoadingCI) {
      return;
    }
    
    this.isLoadingCI = true;
    this.dashboardService.getConfigurationItems()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.isLoadingCI = false;
          if (response.success) {
            this.configurationItems = response;
            this.buildServiceModelTree();
          } else {
            this.serviceModelTree = null;
          }
        },
        error: (error) => {
          this.isLoadingCI = false;
          this.serviceModelTree = null;
        }
      });
  }

  refreshConfigurationItems(): void {
    // Disabled - service model should never refresh
    return;
  }

  buildServiceModelTree(): void {
    if (!this.configurationItems || !this.configurationItems.configuration_items || this.serviceModelTree) {
      return; // Only build once
    }

    const items = this.configurationItems.configuration_items;
    
    // Create hierarchical data structure for D3.js tree
    const treeData = {
      name: (items.transaction?.[0]?.service_model || items.server?.[0]?.service_model || items.network?.[0]?.service_model || 'Service') + ' Service',
      type: 'root',
      children: [
        {
          name: 'Transactions',
          type: 'category',
          count: items.transaction?.length || 0,
          children: (items.transaction || []).map((item: any) => ({
            name: item.name,
            type: 'node',
            ci_type: 'transaction',
            description: item.description
          }))
        },
        {
          name: 'Servers',
          type: 'category',
          count: items.server?.length || 0,
          children: (items.server || []).map((item: any) => ({
            name: item.name,
            type: 'node',
            ci_type: 'server',
            description: item.description
          }))
        },
        {
          name: 'Network Devices',
          type: 'category',
          count: items.network?.length || 0,
          children: (items.network || []).map((item: any) => ({
            name: item.name,
            type: 'node',
            ci_type: 'network',
            description: item.description
          }))
        }
      ]
    };

    this.serviceModelTree = treeData;
    
    // Use setTimeout to ensure the view is ready - render only once
    setTimeout(() => {
      this.renderTree();
      // Update tree selection after initial render
      setTimeout(() => {
        this.updateTreeSelection();
      }, 200);
    }, 100);
  }


  renderTree(): void {
    if (!this.treeContainer || !this.serviceModelTree || this.treeRendered) {
      return; // Only render once
    }

    this.treeRendered = true;

    // Clear previous tree
    d3.select(this.treeContainer.nativeElement).selectAll("*").remove();

    const container = d3.select(this.treeContainer.nativeElement);
    const width = 600;
    const height = 530;

    const svg = container
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .style("overflow", "visible")
      .style("background", "transparent");

    const g = svg.append("g").attr("transform", "translate(40,20)");

    // Create tree layout
    const tree = d3.tree<any>().size([height - 40, width - 80]);

    // Create hierarchy
    const root = d3.hierarchy(this.serviceModelTree);
    console.log('D3 hierarchy created:', root);
    
    // Generate tree layout
    tree(root);
    console.log('Tree layout generated');

    // Create links (connections between nodes)
    const links = g.selectAll('.link')
      .data(root.links())
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('d', d3.linkHorizontal<any, any>()
        .x((d: any) => d.y)
        .y((d: any) => d.x))
      .style('fill', 'none')
      .style('stroke', '#666')
      .style('stroke-width', 1);

    // Create nodes
    const nodes = g.selectAll('.node')
      .data(root.descendants())
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('data-type', (d: any) => d.data.type)
      .attr('transform', (d: any) => `translate(${d.y},${d.x})`)
      .style('cursor', (d: any) => {
        // Make network devices non-clickable
        if (d.data.type === 'node' && d.data.ci_type === 'network') {
          return 'default';
        }
        return 'pointer';
      })
      .on('click', (event: any, d: any) => this.onNodeClick(d));

    // Add node circles/rectangles
    nodes.append('rect')
      .attr('width', (d: any) => this.getNodeWidth(d))
      .attr('height', 30)
      .attr('x', (d: any) => -this.getNodeWidth(d) / 2)
      .attr('y', -15)
      .attr('rx', 5)
      .style('fill', (d: any) => this.getNodeColor(d))

    // Add node icons
    nodes.append('text')
      .attr('x', (d: any) => -this.getNodeWidth(d) / 2 + 10)
      .attr('y', 5)
      .style('fill', '#EDEAF1')
      .style('font-family', 'FontAwesome')
      .style('font-size', '14px')
      .text((d: any) => this.getNodeIcon(d));

    // Add node labels
    nodes.append('text')
      .attr('x', (d: any) => -this.getNodeWidth(d) / 2 + 30)
      .attr('y', 5)
      .style('fill', '#EDEAF1')
      .style('font-family', 'Inter, sans-serif')
      .style('font-size', '12px')
      .style('font-weight', '500')
      .text((d: any) => {
        const maxLength = 15;
        const name = d.data.name;
        if (name.length > maxLength) {
          return name.substring(0, maxLength) + '...';
        }
        return name;
      });

    // Add count badges for category nodes
    nodes.filter((d: any) => d.data.type === 'category' && d.data.count > 0)
      .append('circle')
      .attr('cx', (d: any) => this.getNodeWidth(d) / 2 - 10)
      .attr('cy', -10)
      .attr('r', 8)
      .style('fill', 'rgba(130, 88, 202, 0.8)')
      .style('stroke', '#EDEAF1')
      .style('stroke-width', 1);

    nodes.filter((d: any) => d.data.type === 'category' && d.data.count > 0)
      .append('text')
      .attr('x', (d: any) => this.getNodeWidth(d) / 2 - 10)
      .attr('y', -6)
      .style('fill', '#EDEAF1')
      .style('font-family', 'Inter, sans-serif')
      .style('font-size', '10px')
      .style('font-weight', 'bold')
      .style('text-anchor', 'middle')
      .text((d: any) => d.data.count);
  }

  getNodeWidth(d: any): number {
    const baseWidth = 120;
    const textLength = d.data.name.length;
    return Math.max(baseWidth, textLength * 8 + 40);
  }

  getNodeColor(d: any): string {
    switch (d.data.type) {
      case 'root':
        return 'rgba(87, 63, 205, 1.0)';
      case 'category':
        switch (d.data.name) {
          case 'Transactions':
            return 'rgba(200, 45, 60, 1.0)'; // Red shade for Transactions category
          case 'Servers':
            return 'rgba(30, 150, 55, 1.0)'; // Green shade for Servers category
          case 'Network Devices':
            return 'rgba(0, 105, 220, 1.0)'; // Blue shade for Network Devices category
          default:
            return 'rgba(87, 63, 205, 1.0)';
        }
      case 'node':
        switch (d.data.ci_type) {
          case 'transaction':
            return 'rgba(235, 100, 115, 1.0)'; // Lighter red shade for transaction nodes
          case 'server':
            return 'rgba(85, 185, 110, 1.0)'; // Lighter green shade for server nodes
          case 'network':
            return 'rgba(70, 155, 255, 1.0)'; // Lighter blue shade for network nodes
          default:
            return 'rgba(97, 97, 97, 1.0)';
        }
      default:
        return 'rgba(97, 97, 97, 1.0)';
    }
  }

  getNodeIcon(d: any): string {
    switch (d.data.type) {
      case 'root':
        return '\uf1ad'; // fa-building
      case 'category':
        switch (d.data.name) {
          case 'Transactions':
            return '\uf362'; // fa-exchange-alt
          case 'Servers':
            return '\uf233'; // fa-server
          case 'Network Devices':
            return '\uf6ff'; // fa-network-wired
          default:
            return '\uf07b'; // fa-folder
        }
      case 'node':
        switch (d.data.ci_type) {
          case 'transaction':
            return '\uf362'; // fa-exchange-alt
          case 'server':
            return '\uf233'; // fa-server
          case 'network':
            return '\uf6ff'; // fa-network-wired
          default:
            return '\uf013'; // fa-cog
        }
      default:
        return '\uf111'; // fa-circle
    }
  }

  onNodeClick(d: any): void {
    if (d.data.type === 'node' && d.data.ci_type !== 'network') {
      // Update selection using the same variable as the chart
      this.selectedNode = d.data.name;
      this.updateTreeSelection();
    }
  }

  // Update tree selection highlighting without re-rendering
  updateTreeSelection(): void {
    console.log('updateTreeSelection called, selectedNode:', this.selectedNode);
    
    if (!this.treeContainer || !this.treeRendered) {
      console.log('Tree container missing or not rendered');
      return;
    }

    const container = d3.select(this.treeContainer.nativeElement);
    
    // Remove all existing selection highlights and reset styles
    container.selectAll('.node')
      .classed('selected', false)
      .classed('parent-selected', false)
      .select('rect')
      .style('stroke', null)
      .style('stroke-width', null)
      .style('filter', null);
    
    container.selectAll('.link')
      .classed('selected-path', false)
      .style('stroke', '#666') // Reset to default gray
      .style('stroke-width', '1px')
      .style('filter', null);

    if (this.selectedNode) {
      console.log('Looking for node:', this.selectedNode);
      
      // Find the selected node using the same selectedNode variable as the chart
      const selectedNodes = container.selectAll('.node')
        .filter((d: any) => d.data.name === this.selectedNode);
      
      console.log('Found nodes:', selectedNodes.size());
      
      selectedNodes
        .classed('selected', true)
        // Apply styles directly to selected node
        .select('rect')
        .style('stroke', '#ffffff')
        .style('stroke-width', '3px')
        .style('filter', 'drop-shadow(0 0 15px rgba(255, 255, 255, 0.8))');
      
      selectedNodes.each(function(d: any) {
          console.log('Processing selected node:', d.data.name);
          // Trace the complete path from selected node to root
          let currentNode = d;
          const pathNodes: any[] = [];
          const pathLinks: any[] = [];
          
          // Collect all nodes in the path to root
          while (currentNode) {
            pathNodes.push(currentNode);
            if (currentNode.parent) {
              pathLinks.push({
                source: currentNode.parent,
                target: currentNode
              });
            }
            currentNode = currentNode.parent;
          }
          
          
          // Highlight all parent nodes in the path
          pathNodes.forEach((node, index) => {
            if (index > 0) { // Skip the selected node itself
              container.selectAll('.node')
                .filter((n: any) => n.data.name === node.data.name)
                .classed('parent-selected', true)
                .select('rect')
                .style('stroke', '#ffffff')
                .style('stroke-width', '2px')
                .style('filter', 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.5))');
            }
          });
          
          // Highlight all links in the path
          console.log('Highlighting', pathLinks.length, 'links');
          pathLinks.forEach(pathLink => {
            console.log('Looking for link:', pathLink.source.data.name, '->', pathLink.target.data.name);
            const matchingLinks = container.selectAll('.link')
              .filter((link: any) => 
                (link.source.data.name === pathLink.source.data.name && link.target.data.name === pathLink.target.data.name) ||
                (link.target.data.name === pathLink.source.data.name && link.source.data.name === pathLink.target.data.name)
              );
            
            console.log('Found matching links:', matchingLinks.size());
            matchingLinks
              .classed('selected-path', true)
              // Apply styles directly to override any inline styles
              .style('stroke', '#eebbbb')
              .style('stroke-width', '4px')
              .style('filter', 'drop-shadow(0 0 12px rgba(155, 55, 155, 0.2))');
          });
        });
    }
  }

  // Test method - can be called from browser console
  testTreeHighlighting(): void {
    console.log('=== TESTING TREE HIGHLIGHTING ===');
    console.log('Current selectedNode:', this.selectedNode);
    console.log('Tree rendered:', this.treeRendered);
    console.log('Tree container exists:', !!this.treeContainer);
    
    if (this.configurationItems?.configuration_items) {
      const transactions = this.configurationItems.configuration_items.transaction || [];
      const servers = this.configurationItems.configuration_items.server || [];
      const networks = this.configurationItems.configuration_items.network || [];
      
      console.log('Available nodes:');
      console.log('Transactions:', transactions.map((t: any) => t.name));
      console.log('Servers:', servers.map((s: any) => s.name));
      console.log('Networks:', networks.map((n: any) => n.name));
      
      // Try to highlight the first transaction
      if (transactions.length > 0) {
        const testNode = transactions[0].name;
        console.log('Testing with transaction node:', testNode);
        this.selectedNode = testNode;
        this.updateTreeSelection();
        
        // Also manually check the DOM
        if (this.treeContainer) {
          const container = d3.select(this.treeContainer.nativeElement);
          const allNodes = container.selectAll('.node');
          const allLinks = container.selectAll('.link');
          console.log('DOM check - Total nodes:', allNodes.size());
          console.log('DOM check - Total links:', allLinks.size());
          
          // Check if any nodes have the selected class
          const selectedNodes = container.selectAll('.node.selected');
          const selectedLinks = container.selectAll('.link.selected-path');
          console.log('DOM check - Selected nodes:', selectedNodes.size());
          console.log('DOM check - Selected links:', selectedLinks.size());
        }
      }
    }
  }

}
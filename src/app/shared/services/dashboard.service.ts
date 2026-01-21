import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DataRange {
  success: boolean;
  start_date: string;
  end_date: string;
  min_timestamp: string;
  max_timestamp: string;
  total_records: number;
  unique_nodes: number;
  unique_relatedcis: number;
}

export interface NodeRelatedCIMapping {
  success: boolean;
  nodes: string[];
  relatedcis: string[];
  mapping: { [key: string]: string[] };
}

export interface AnalysisResult {
  success: boolean;
  error?: string; // Optional error property for failed requests
  timestamps: string[];
  values: number[];
  upper: number[];
  lower: number[];
  anomaly_timestamps: string[];
  anomaly_values: number[];
  total_records: number;
  anomaly_count: number;
  anomaly_rate: number;
  min_value: number;
  max_value: number;
  avg_value: number;
  min_absolute_threshold: number;
}

// Server data interfaces
export interface ServerDataRange {
  success: boolean;
  error?: string;
  overall_range: {
    start_date: string;
    end_date: string;
    min_timestamp: string;
    max_timestamp: string;
  };
  node_ranges: { [key: string]: {
    start_date: string;
    end_date: string;
    total_records: number;
  }};
  total_records: number;
  unique_nodes: number;
}

export interface ServerNodes {
  success: boolean;
  error?: string;
  nodes: string[];
  total_nodes: number;
}

export interface ServerAnalysisResult {
  success: boolean;
  error?: string;
  timestamps: string[];
  values: number[];
  upper: number[];
  lower: number[];
  anomaly_timestamps: string[];
  anomaly_values: number[];
  total_records: number;
  anomaly_count: number;
  anomaly_rate: number;
  min_value: number;
  max_value: number;
  avg_value: number;
  min_absolute_threshold: number;
}

// Additional interfaces
  
export interface AnomalousCombination {
  node: string;
  relatedci: string;
  metric: string;
  metric_label: string;
  anomaly_count: number;
  mean_value: number;
  std_value: number;
  min_value: number;
  max_value: number;
  first_anomaly: string | null;
  last_anomaly: string | null;
}

export interface AnomalySummary {
  total_records: number;
  total_anomalies: number;
  anomaly_rate: number;
  unique_nodes: number;
  unique_related_cis: number;
  time_range: {
    start: string | null;
    end: string | null;
  };
  detection_params: {
    window: number;
    k: number;
  };
}

export interface AnomalousCombinationsResponse {
  success: boolean;
  anomalous_combinations: AnomalousCombination[];
  summary: AnomalySummary;
}

export interface VisualizationResponse {
  success: boolean;
  plot_data: {
    image_base64: string;
    format: string;
  };
  statistics: {
    total_records: number;
    anomaly_count: number;
    anomaly_rate: number;
    min_value: number;
    max_value: number;
    avg_value: number;
  };
  parameters: {
    node: string;
    relatedci: string;
    metric: string;
    time_range: {
      start: string | null;
      end: string | null;
    };
    detection_params: {
      window: number;
      k: number;
    };
  };
}

export interface NodeResponse {
  success: boolean;
  nodes: string[];
  count: number;
}

export interface RelatedCIResponse {
  success: boolean;
  node: string;
  related_cis: string[];
  count: number;
}

export interface MetricResponse {
  success: boolean;
  metrics: Array<{
    value: string;
    label: string;
  }>;
  count: number;
}

export interface DatasetType {
  value: string;
  label: string;
  description: string;
}

// Correlation analysis interfaces
export interface CorrelationResult {
  node1: string;
  relatedci1?: string; // Optional for server data
  metric1: string;
  node2: string;
  relatedci2?: string; // Optional for server data
  metric2: string;
  correlation: number;
  data_points: number;
  common_timestamps: number;
}

export interface CorrelationAnalysisResults {
  success: boolean;
  error?: string;
  total_correlations: number;
  strong_correlations: CorrelationResult[];
  moderate_correlations: CorrelationResult[];
  weak_correlations: CorrelationResult[];
  all_correlations: CorrelationResult[];
  analysis_period: {
    start: string;
    end: string;
  };
  total_node_ci_combinations?: number; // For transaction data
  total_node_metric_combinations?: number; // For server data
  metrics_analyzed: string[];
}

export interface CorrelationSummaryStats {
  success: boolean;
  error?: string;
  total_correlations: number;
  average_correlation: number;
  median_correlation: number;
  max_correlation: number;
  min_correlation: number;
  std_correlation: number;
  strong_correlation_count: number;
  moderate_correlation_count: number;
  weak_correlation_count: number;
}

export interface CorrelationResponse {
  success: boolean;
  error?: string;
  correlation_results: CorrelationAnalysisResults;
  summary_stats: CorrelationSummaryStats;
  analysis_period: {
    start_date: string;
    end_date: string;
  };
}

export interface CorrelationStatus {
  success: boolean;
  status: {
    transaction_data_available: boolean;
    server_data_available: boolean;
    transaction_data_info?: {
      total_records: number;
      unique_nodes: number;
      unique_relatedcis: number;
      date_range: {
        start: string;
        end: string;
      };
    };
    server_data_info?: {
      total_records: number;
      unique_nodes: number;
      date_range: {
        start: string;
        end: string;
      };
    };
  };
}

export interface AIInsightsRequest {
  start_date: string;
  end_date: string;
  dataset_type: string;
  selected_node: string;
  selected_metric: string;
  selected_relatedci?: string;
  anomaly_data: string;
  correlation_data?: string;
}

export interface AIInsightSection {
  title: string;
  content: string;
}

export interface AIInsightsData {
  executive_summary: AIInsightSection;
  anomaly_analysis: AIInsightSection;
  causal_analysis: AIInsightSection;
  business_impact: AIInsightSection;
  recommendations: AIInsightSection;
  risk_mitigation: AIInsightSection;
}

export interface AIInsightsResponse {
  success: boolean;
  error?: string;
  insights?: AIInsightsData;
}

export interface ConfigurationItem {
  id: number;
  name: string;
  ci_type: string;
  service_model: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface ConfigurationItemsResponse {
  success: boolean;
  error?: string;
  configuration_items: {
    [key: string]: ConfigurationItem[];
  };
  summary: {
    total_items: number;
    transaction_count: number;
    server_count: number;
    network_count: number;
    hybrid_count: number;
  };
}

export interface RefreshCIResponse {
  success: boolean;
  error?: string;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private baseUrl = environment.trendUrl ;  // Python FastAPI backend

  constructor(private http: HttpClient) { }

  getDataRange(): Observable<DataRange> {
    return this.http.get<DataRange>(`${this.baseUrl}/data-range`);
  }

  getNodeRelatedCIMapping(): Observable<NodeRelatedCIMapping> {
    return this.http.get<NodeRelatedCIMapping>(`${this.baseUrl}/node-relatedci-mapping`);
  }

  analyzeData(params: {
    node: string;
    relatedci: string;
    metric: string;
    start_date: string;
    end_date: string;
    window: number;
    k: number;
  }): Observable<AnalysisResult> {
    const formData = new FormData();
    formData.append('node', params.node);
    formData.append('relatedci', params.relatedci);
    formData.append('metric', params.metric);
    formData.append('start_date', params.start_date);
    formData.append('end_date', params.end_date);
    formData.append('window', params.window.toString());
    formData.append('k', params.k.toString());

    return this.http.post<AnalysisResult>(`${this.baseUrl}/analyze`, formData);
  }

  // Server data methods
  getServerDataRange(): Observable<ServerDataRange> {
    return this.http.get<ServerDataRange>(`${this.baseUrl}/server/data-range`);
  }

  getServerNodes(): Observable<ServerNodes> {
    return this.http.get<ServerNodes>(`${this.baseUrl}/server/nodes`);
  }

  getNodeTimeRange(node: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/node-time-range/${node}`);
  }

  getServerNodeTimeRange(node: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/server/node-time-range/${node}`);
  }

  analyzeServerData(params: {
    node_name: string;
    metric: string;
    start_date: string;
    end_date: string;
    window: number;
    k: number;
  }): Observable<ServerAnalysisResult> {
    const formData = new FormData();
    formData.append('node_name', params.node_name);
    formData.append('metric', params.metric);
    formData.append('start_date', params.start_date);
    formData.append('end_date', params.end_date);
    formData.append('window', params.window.toString());
    formData.append('k', params.k.toString());

    return this.http.post<ServerAnalysisResult>(`${this.baseUrl}/server/analyze`, formData);
  }

  // Additional methods
  
  /**
   * Get all anomalous node-transaction-metric combinations
   */
  getAnomalousCombinations(
    startDate?: string,
    endDate?: string,
    window: number = 576,
    k: number = 15.0
  ): Observable<AnomalousCombinationsResponse> {
    let params = new HttpParams()
      .set('window', window.toString())
      .set('k', k.toString());

    if (startDate) {
      params = params.set('start_date', startDate);
    }
    if (endDate) {
      params = params.set('end_date', endDate);
    }

    return this.http.get<AnomalousCombinationsResponse>(`${this.baseUrl}/anomalous-combinations`, { params });
  }

  /**
   * Get visualization plot for selected parameters
   */
  getVisualization(
    node: string,
    relatedci: string,
    metric: string,
    startDate?: string,
    endDate?: string,
    window: number = 576,
    k: number = 15.0
  ): Observable<VisualizationResponse> {
    let params = new HttpParams()
      .set('node', node)
      .set('relatedci', relatedci)
      .set('metric', metric)
      .set('window', window.toString())
      .set('k', k.toString());

    if (startDate) {
      params = params.set('start_date', startDate);
    }
    if (endDate) {
      params = params.set('end_date', endDate);
    }

    return this.http.get<VisualizationResponse>(`${this.baseUrl}/visualization`, { params });
  }

  /**
   * Get all available nodes
   */
  getNodes(): Observable<NodeResponse> {
    return this.http.get<NodeResponse>(`${this.baseUrl}/nodes`);
  }

  /**
   * Get all related CIs for a specific node
   */
  getRelatedCIs(node: string): Observable<RelatedCIResponse> {
    return this.http.get<RelatedCIResponse>(`${this.baseUrl}/related-cis/${node}`);
  }

  /**
   * Get all available metrics
   */
  getMetrics(): Observable<MetricResponse> {
    return this.http.get<MetricResponse>(`${this.baseUrl}/metrics`);
  }

  /**
   * Health check endpoint
   */
  healthCheck(): Observable<any> {
    return this.http.get(`${this.baseUrl}/health`);
  }

  /**
   * Get available dataset types
   */
  getDatasetTypes(): DatasetType[] {
    return [
      {
        value: 'transaction',
        label: 'Transaction Data',
        description: 'Application transaction metrics (calls per min, response time)'
      },
      {
        value: 'server',
        label: 'Server Data',
        description: 'Server performance metrics (CPU, memory, network)'
      }
    ];
  }

  /**
   * Get available metrics for selected dataset
   */
  getMetricsForDataset(datasetType: string): Array<{value: string, label: string}> {
    if (datasetType === 'transaction') {
      return [
        { value: 'calls_per_min', label: 'Calls Per Minute' },
        { value: 'avg_response_time', label: 'Average Response Time' }
      ];
    } else if (datasetType === 'server') {
      return [
        { value: 'cpu_util_pct', label: 'CPU Utilization %' },
        { value: 'mem_util_pct', label: 'Memory Utilization %' },
        { value: 'net_packet_count_per_s', label: 'Network Packets/sec' }
      ];
    }
    return [];
  }

  /**
   * Analyze cross-transaction correlation for all node-CI combinations
   */
  analyzeTransactionCorrelation(
    startDate: string,
    endDate: string,
    minCorrelation: number = 0.6
  ): Observable<CorrelationResponse> {
    const formData = new FormData();
    formData.append('start_date', startDate);
    formData.append('end_date', endDate);
    formData.append('min_correlation', minCorrelation.toString());

    return this.http.post<CorrelationResponse>(`${this.baseUrl}/correlation/transaction`, formData);
  }

  /**
   * Analyze cross-node correlation for server metrics
   */
  analyzeServerCorrelation(
    startDate: string,
    endDate: string,
    minCorrelation: number = 0.6
  ): Observable<CorrelationResponse> {
    const formData = new FormData();
    formData.append('start_date', startDate);
    formData.append('end_date', endDate);
    formData.append('min_correlation', minCorrelation.toString());

    return this.http.post<CorrelationResponse>(`${this.baseUrl}/correlation/server`, formData);
  }

  /**
   * Get correlation analysis status
   */
  getCorrelationStatus(): Observable<CorrelationStatus> {
    return this.http.get<CorrelationStatus>(`${this.baseUrl}/correlation/status`);
  }

  getAIInsights(request: AIInsightsRequest): Observable<AIInsightsResponse> {
    const formData = new FormData();
    formData.append('start_date', request.start_date);
    formData.append('end_date', request.end_date);
    formData.append('dataset_type', request.dataset_type);
    formData.append('selected_node', request.selected_node);
    formData.append('selected_metric', request.selected_metric);
    if (request.selected_relatedci) {
      formData.append('selected_relatedci', request.selected_relatedci);
    }
    formData.append('anomaly_data', request.anomaly_data);
    if (request.correlation_data) {
      formData.append('correlation_data', request.correlation_data);
    }
    
    return this.http.post<AIInsightsResponse>(`${this.baseUrl}/ai-insights`, formData);
  }

  /**
   * Get data for two correlated metrics to show correlation chart
   */
  getCorrelationChartData(
    startDate: string,
    endDate: string,
    datasetType: string,
    node1: string,
    relatedci1: string | undefined,
    metric1: string,
    node2: string,
    relatedci2: string | undefined,
    metric2: string
  ): Observable<{
    success: boolean;
    error?: string;
    metric1_data: AnalysisResult | ServerAnalysisResult;
    metric2_data: AnalysisResult | ServerAnalysisResult;
    common_timestamps: string[];
  }> {
    const formData = new FormData();
    formData.append('start_date', startDate);
    formData.append('end_date', endDate);
    formData.append('dataset_type', datasetType);
    formData.append('node1', node1);
    if (relatedci1) {
      formData.append('relatedci1', relatedci1);
    }
    formData.append('metric1', metric1);
    formData.append('node2', node2);
    if (relatedci2) {
      formData.append('relatedci2', relatedci2);
    }
    formData.append('metric2', metric2);
    
    return this.http.post<{
      success: boolean;
      error?: string;
      metric1_data: AnalysisResult | ServerAnalysisResult;
      metric2_data: AnalysisResult | ServerAnalysisResult;
      common_timestamps: string[];
    }>(`${this.baseUrl}/correlation/chart-data`, formData);
  }

  /**
   * Get configuration items for service model visualization
   */
  getConfigurationItems(): Observable<ConfigurationItemsResponse> {
    return this.http.get<ConfigurationItemsResponse>(`${this.baseUrl}/configuration-items`);
  }

  /**
   * Refresh configuration items from current data
   */
  refreshConfigurationItems(): Observable<RefreshCIResponse> {
    return this.http.post<RefreshCIResponse>(`${this.baseUrl}/refresh-configuration-items`, {});
  }
}

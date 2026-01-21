// Agent Models
export interface Agent {
  id: string;
  name: string;
  icon: string;
  isEnabled: boolean;
}

// Agents Overview Metrics
export interface AgentVersion {
  agentId: string;
  agentName: string;
  version: string;
  versionNumber?: number;
}

export interface AgentUptime {
  agentId: string;
  agentName: string;
  uptimeHours: number;
  uptimePercentage: number;
}

export interface AgentHealthCheck {
  agentId: string;
  agentName: string;
  status: 'healthy' | 'warning' | 'critical';
  statusLabel: string;
}

export interface AgentMTTR {
  agentId: string;
  agentName: string;
  mttrMinutes: number;
  mttrHistory?: { timestamp: string; value: number }[];
}

export interface AgentUsageIntensity {
  agentId: string;
  agentName: string;
  usageData: { timestamp: string; value: number }[];
}

export interface UptimeData {
  name: string;
  status: 'Active' | 'Warning' | 'Stopped';
  uptimeDays: boolean[];
  avgUptime: number;
}

export interface MttrData {
  name: string;
  value: number;
}

export interface HealthCheckData {
  labels: string[];
  datasets: {
    data: number[];
    backgroundColor: string[];
    borderColor: string[];
    borderWidth: number;
    circumference: number;
  }[];
}

export interface AgentDataVolume {
  agentId: string;
  agentName: string;
  volumeGB: number;
  recordCount: number;
  volumeHistory?: { timestamp: string; value: number }[];
}

export interface AgentAnomaly {
  agentId: string;
  agentName: string;
  anomalyCount: number;
  severity: 'critical' | 'warning' | 'info';
}

export interface AnomalyRecord {
  id: string;
  anomaly: string;
  entity: string;
  status: 'Active' | 'Resolved' | 'Investigating';
  severity: 'Critical' | 'High' | 'Moderate' | 'Low';
  timeRange: {
    start: string;
    end: string;
  };
}

// Additional KPIs for Overview Dashboard
export interface AgentPerformanceMetrics {
  agentId: string;
  agentName: string;
  avgResponseTime: number; // milliseconds
  requestsPerMinute: number;
  successRate: number; // percentage
  errorCount: number;
  activeSessions: number;
  throughput: number; // requests/sec
  latencyP50: number;
  latencyP95: number;
  latencyP99: number;
  cpuUsage: number; // percentage
  memoryUsage: number; // percentage
  queueDepth: number;
  requestRate: number; // requests/sec
  peakRequestRate: number; // requests/sec
  totalRequestsToday: number;
}

export interface SystemOverviewMetrics {
  totalRequests: number;
  totalErrors: number;
  avgLatency: number;
  totalActiveSessions: number;
  overallSuccessRate: number;
  totalThroughput: number;
}

// Agent Health Check Metrics
export interface DataQualityMetrics {
  dataQualityScore: number;
  completeness: number;
  validity: number;
  duplicateCount: number;
  dataFreshness: string;
  dataLagMinutes: number;
}

export interface DAGTask {
  id: string;
  name: string;
  status: 'SUCCESS' | 'FAILED' | 'RUNNING' | 'PENDING' | 'SKIPPED';
  duration: string;
  durationSeconds: number;
  startTime: string;
  endTime: string;
  recordsProcessed?: number;
  errors?: number;
}

export interface ETLMetrics {
  jobStatus: 'SUCCESS' | 'FAILED' | 'RUNNING' | 'WARNING';
  lastRunMinutes: number;
  totalRecordsProcessed: number;
  recordsRejected: number;
  lastSuccess: string;
  errorRate: number;
  dagRuns: {
    extract: DAGTask;
    transform: DAGTask;
    load: DAGTask;
  };
  dagId: string;
  dagRunId: string;
  nextScheduledRun: string;
  avgDagDuration: string;
  successRate: number;
  totalDagRuns: number;
}

export interface AIModelMetrics {
  productionModelVersion: string;
  trainingStatus: 'TRAINING' | 'COMPLETED' | 'FAILED' | 'IDLE';
  primaryScoreType: string;
  primaryScoreValue: number;
  trainingTime: string;
  trainingMinutes: number;
  accuracy?: number;
  f1Score?: number;
  rmse?: number;
}

export interface BusinessImpactMetrics {
  roiPercentage: number;
  incrementalRevenue: number;
  costSavings: number;
  conversionRateLift: number;
  churnReduction: number;
}

export interface AgentHealthMetrics {
  agentId: string;
  agentName: string;
  dataQuality: DataQualityMetrics;
  etl: ETLMetrics;
  aiModel: AIModelMetrics;
  businessImpact: BusinessImpactMetrics;
}

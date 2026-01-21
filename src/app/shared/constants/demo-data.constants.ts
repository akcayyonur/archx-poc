import {
  Agent,
  AgentVersion,
  AgentUptime,
  AgentHealthCheck,
  AgentMTTR,
  AgentUsageIntensity,
  AgentDataVolume,
  AgentAnomaly,
  AgentHealthMetrics,
  AgentPerformanceMetrics,
  SystemOverviewMetrics,
  AnomalyRecord
} from '../models/demo-data.model';

// 6 Agents (5 enabled by default, Root Cause Analysis starts disabled)
export const DEMO_AGENTS: Agent[] = [
  {
    id: 'request-fulfillment',
    name: 'Request Fulfillment',
    icon: 'phosphorArrowsClockwise',
    isEnabled: true
  },
  {
    id: 'capacity-forecast',
    name: 'Capacity & Forecast',
    icon: 'phosphorChartBar',
    isEnabled: true
  },
  {
    id: 'change-risk',
    name: 'Change Risk',
    icon: 'phosphorWarning',
    isEnabled: true
  },
  {
    id: 'cab-scribe',
    name: 'CAB Scribe',
    icon: 'phosphorFileText',
    isEnabled: true
  },
  {
    id: 'deployment-validator',
    name: 'Deployment Validator',
    icon: 'phosphorShieldCheck',
    isEnabled: true
  },
  {
    id: 'root-cause-analysis',
    name: 'Root Cause Analysis',
    icon: 'phosphorDetective',
    isEnabled: false
  },
  {
    id: 'security-threat-detector',
    name: 'Security Threat Detector',
    icon: 'phosphorFingerprint',
    isEnabled: true
  },
  {
    id: 'cost-optimizer',
    name: 'Cost Optimizer',
    icon: 'phosphorCoin',
    isEnabled: true
  },
  {
    id: 'compliance-auditor',
    name: 'Compliance Auditor',
    icon: 'phosphorFileDoc',
    isEnabled: true
  },
  {
    id: 'data-lineage-tracker',
    name: 'Data Lineage Tracker',
    icon: 'phosphorGraph',
    isEnabled: true
  },
];

// Agent Versions
export const DEMO_AGENT_VERSIONS: AgentVersion[] = [
  { agentId: 'request-fulfillment', agentName: 'Request Fulfillment', version: 'v3.2.1', versionNumber: 3.21 },
  { agentId: 'capacity-forecast', agentName: 'Capacity & Forecast', version: 'v2.8.5', versionNumber: 2.85 },
  { agentId: 'change-risk', agentName: 'Change Risk', version: 'v4.1.0', versionNumber: 4.10 },
  { agentId: 'cab-scribe', agentName: 'CAB Scribe', version: 'v3.5.2', versionNumber: 3.52 },
  { agentId: 'deployment-validator', agentName: 'Deployment Validator', version: 'v2.9.1', versionNumber: 2.91 },
  { agentId: 'root-cause-analysis', agentName: 'Root Cause Analysis', version: 'v1.0.0', versionNumber: 1.00 },
  { agentId: 'security-threat-detector', agentName: 'Security Threat Detector', version: 'v2.1.0', versionNumber: 2.10 },
  { agentId: 'cost-optimizer', agentName: 'Cost Optimizer', version: 'v1.5.3', versionNumber: 1.53 },
  { agentId: 'compliance-auditor', agentName: 'Compliance Auditor', version: 'v1.2.8', versionNumber: 1.28 },
  { agentId: 'data-lineage-tracker', agentName: 'Data Lineage Tracker', version: 'v2.0.0', versionNumber: 2.00 },
];

// Agent Uptime
export const DEMO_AGENT_UPTIME: AgentUptime[] = [
  { agentId: 'request-fulfillment', agentName: 'Request Fulfillment', uptimeHours: 2184, uptimePercentage: 99.8 },
  { agentId: 'capacity-forecast', agentName: 'Capacity & Forecast', uptimeHours: 1896, uptimePercentage: 97.2 },
  { agentId: 'change-risk', agentName: 'Change Risk', uptimeHours: 2208, uptimePercentage: 99.9 },
  { agentId: 'cab-scribe', agentName: 'CAB Scribe', uptimeHours: 1752, uptimePercentage: 95.5 },
  { agentId: 'deployment-validator', agentName: 'Deployment Validator', uptimeHours: 2112, uptimePercentage: 98.6 },
  { agentId: 'root-cause-analysis', agentName: 'Root Cause Analysis', uptimeHours: 720, uptimePercentage: 99.5 },
  { agentId: 'security-threat-detector', agentName: 'Security Threat Detector', uptimeHours: 2300, uptimePercentage: 99.9 },
  { agentId: 'cost-optimizer', agentName: 'Cost Optimizer', uptimeHours: 2250, uptimePercentage: 99.7 },
  { agentId: 'compliance-auditor', agentName: 'Compliance Auditor', uptimeHours: 2100, uptimePercentage: 99.2 },
  { agentId: 'data-lineage-tracker', agentName: 'Data Lineage Tracker', uptimeHours: 2150, uptimePercentage: 99.5 },
];

// Agent Health Check Status
export const DEMO_AGENT_HEALTH: AgentHealthCheck[] = [
  { agentId: 'request-fulfillment', agentName: 'Request Fulfillment', status: 'healthy', statusLabel: 'Healthy' },
  { agentId: 'capacity-forecast', agentName: 'Capacity & Forecast', status: 'healthy', statusLabel: 'Healthy' },
  { agentId: 'change-risk', agentName: 'Change Risk', status: 'warning', statusLabel: 'Warning' },
  { agentId: 'cab-scribe', agentName: 'CAB Scribe', status: 'healthy', statusLabel: 'Healthy' },
  { agentId: 'deployment-validator', agentName: 'Deployment Validator', status: 'critical', statusLabel: 'Critical' },
  { agentId: 'root-cause-analysis', agentName: 'Root Cause Analysis', status: 'healthy', statusLabel: 'Healthy' },
  { agentId: 'security-threat-detector', agentName: 'Security Threat Detector', status: 'healthy', statusLabel: 'Healthy' },
  { agentId: 'cost-optimizer', agentName: 'Cost Optimizer', status: 'warning', statusLabel: 'Warning' },
  { agentId: 'compliance-auditor', agentName: 'Compliance Auditor', status: 'healthy', statusLabel: 'Healthy' },
  { agentId: 'data-lineage-tracker', agentName: 'Data Lineage Tracker', status: 'healthy', statusLabel: 'Healthy' },
];

// Agent MTTR (Mean Time to Respond)
export const DEMO_AGENT_MTTR: AgentMTTR[] = [
  {
    agentId: 'request-fulfillment',
    agentName: 'Request Fulfillment',
    mttrMinutes: 3.5,
    mttrHistory: [
      { timestamp: '2025-10-01', value: 4.2 },
      { timestamp: '2025-10-05', value: 3.8 },
      { timestamp: '2025-10-10', value: 3.5 },
      { timestamp: '2025-10-15', value: 3.2 },
      { timestamp: '2025-10-20', value: 3.5 }
    ]
  },
  {
    agentId: 'capacity-forecast',
    agentName: 'Capacity & Forecast',
    mttrMinutes: 5.2,
    mttrHistory: [
      { timestamp: '2025-10-01', value: 6.1 },
      { timestamp: '2025-10-05', value: 5.8 },
      { timestamp: '2025-10-10', value: 5.5 },
      { timestamp: '2025-10-15', value: 5.0 },
      { timestamp: '2025-10-20', value: 5.2 }
    ]
  },
  {
    agentId: 'change-risk',
    agentName: 'Change Risk',
    mttrMinutes: 8.7,
    mttrHistory: [
      { timestamp: '2025-10-01', value: 7.2 },
      { timestamp: '2025-10-05', value: 8.1 },
      { timestamp: '2025-10-10', value: 8.5 },
      { timestamp: '2025-10-15', value: 9.2 },
      { timestamp: '2025-10-20', value: 8.7 }
    ]
  },
  {
    agentId: 'cab-scribe',
    agentName: 'CAB Scribe',
    mttrMinutes: 4.1,
    mttrHistory: [
      { timestamp: '2025-10-01', value: 4.5 },
      { timestamp: '2025-10-05', value: 4.3 },
      { timestamp: '2025-10-10', value: 4.0 },
      { timestamp: '2025-10-15', value: 3.9 },
      { timestamp: '2025-10-20', value: 4.1 }
    ]
  },
  {
    agentId: 'deployment-validator',
    agentName: 'Deployment Validator',
    mttrMinutes: 12.3,
    mttrHistory: [
      { timestamp: '2025-10-01', value: 8.5 },
      { timestamp: '2025-10-05', value: 10.2 },
      { timestamp: '2025-10-10', value: 11.8 },
      { timestamp: '2025-10-15', value: 13.1 },
      { timestamp: '2025-10-20', value: 12.3 }
    ]
  },
  {
    agentId: 'root-cause-analysis',
    agentName: 'Root Cause Analysis',
    mttrMinutes: 6.5,
    mttrHistory: [
      { timestamp: '2025-10-01', value: 7.8 },
      { timestamp: '2025-10-05', value: 6.9 },
      { timestamp: '2025-10-10', value: 6.2 },
      { timestamp: '2025-10-15', value: 5.8 },
      { timestamp: '2025-10-20', value: 6.5 }
    ]
  },
  {
    agentId: 'security-threat-detector',
    agentName: 'Security Threat Detector',
    mttrMinutes: 2.1,
    mttrHistory: [
      { timestamp: '2025-10-01', value: 2.5 },
      { timestamp: '2025-10-05', value: 2.2 },
      { timestamp: '2025-10-10', value: 2.0 },
      { timestamp: '2025-10-15', value: 2.1 },
      { timestamp: '2025-10-20', value: 2.1 }
    ]
  },
  {
    agentId: 'cost-optimizer',
    agentName: 'Cost Optimizer',
    mttrMinutes: 7.8,
    mttrHistory: [
      { timestamp: '2025-10-01', value: 8.5 },
      { timestamp: '2025-10-05', value: 8.2 },
      { timestamp: '2025-10-10', value: 7.9 },
      { timestamp: '2025-10-15', value: 7.5 },
      { timestamp: '2025-10-20', value: 7.8 }
    ]
  },
  {
    agentId: 'compliance-auditor',
    agentName: 'Compliance Auditor',
    mttrMinutes: 4.5,
    mttrHistory: [
      { timestamp: '2025-10-01', value: 4.8 },
      { timestamp: '2025-10-05', value: 4.6 },
      { timestamp: '2025-10-10', value: 4.5 },
      { timestamp: '2025-10-15', value: 4.4 },
      { timestamp: '2025-10-20', value: 4.5 }
    ]
  },
  {
    agentId: 'data-lineage-tracker',
    agentName: 'Data Lineage Tracker',
    mttrMinutes: 5.0,
    mttrHistory: [
      { timestamp: '2025-10-01', value: 5.5 },
      { timestamp: '2025-10-05', value: 5.2 },
      { timestamp: '2025-10-10', value: 5.0 },
      { timestamp: '2025-10-15', value: 4.9 },
      { timestamp: '2025-10-20', value: 5.0 }
    ]
  },
];

// Agent Usage Intensity (Heatmap data - 24 hours x 7 days)
export const DEMO_AGENT_USAGE: AgentUsageIntensity[] = [
  {
    agentId: 'request-fulfillment',
    agentName: 'Request Fulfillment',
    usageData: generateHeatmapData('high', 92) // Very high usage - red gradient
  },
  {
    agentId: 'capacity-forecast',
    agentName: 'Capacity & Forecast',
    usageData: generateHeatmapData('high', 78) // High usage - red gradient
  },
  {
    agentId: 'change-risk',
    agentName: 'Change Risk',
    usageData: generateHeatmapData('high', 85) // High usage - red gradient
  },
  {
    agentId: 'cab-scribe',
    agentName: 'CAB Scribe',
    usageData: generateHeatmapData('low', 18) // Very low usage - light purple gradient
  },
  {
    agentId: 'deployment-validator',
    agentName: 'Deployment Validator',
    usageData: generateHeatmapData('high', 88) // High usage - red gradient
  },
  {
    agentId: 'root-cause-analysis',
    agentName: 'Root Cause Analysis',
    usageData: generateHeatmapData('medium', 62) // Medium-high usage - purple gradient
  },
  {
    agentId: 'security-threat-detector',
    agentName: 'Security Threat Detector',
    usageData: generateHeatmapData('high', 80) // High usage - red gradient
  },
  {
    agentId: 'cost-optimizer',
    agentName: 'Cost Optimizer',
    usageData: generateHeatmapData('medium', 48) // Medium usage - purple gradient
  },
  {
    agentId: 'compliance-auditor',
    agentName: 'Compliance Auditor',
    usageData: generateHeatmapData('medium', 55) // Medium usage - purple gradient
  },
  {
    agentId: 'data-lineage-tracker',
    agentName: 'Data Lineage Tracker',
    usageData: generateHeatmapData('low', 28) // Low usage - light purple gradient
  },
];

// Agent Data Volume
export const DEMO_AGENT_DATA_VOLUME: AgentDataVolume[] = [
  {
    agentId: 'request-fulfillment',
    agentName: 'Request Fulfillment',
    volumeGB: 145.7,
    recordCount: 1250000,
    volumeHistory: generateVolumeHistory(145.7)
  },
  {
    agentId: 'capacity-forecast',
    agentName: 'Capacity & Forecast',
    volumeGB: 89.3,
    recordCount: 780000,
    volumeHistory: generateVolumeHistory(89.3)
  },
  {
    agentId: 'change-risk',
    agentName: 'Change Risk',
    volumeGB: 67.2,
    recordCount: 520000,
    volumeHistory: generateVolumeHistory(67.2)
  },
  {
    agentId: 'cab-scribe',
    agentName: 'CAB Scribe',
    volumeGB: 34.8,
    recordCount: 290000,
    volumeHistory: generateVolumeHistory(34.8)
  },
  {
    agentId: 'deployment-validator',
    agentName: 'Deployment Validator',
    volumeGB: 198.5,
    recordCount: 1680000,
    volumeHistory: generateVolumeHistory(198.5)
  },
  {
    agentId: 'root-cause-analysis',
    agentName: 'Root Cause Analysis',
    volumeGB: 125.3,
    recordCount: 950000,
    volumeHistory: generateVolumeHistory(125.3)
  },
  {
    agentId: 'security-threat-detector',
    agentName: 'Security Threat Detector',
    volumeGB: 250.0,
    recordCount: 2100000,
    volumeHistory: generateVolumeHistory(250.0)
  },
  {
    agentId: 'cost-optimizer',
    agentName: 'Cost Optimizer',
    volumeGB: 55.5,
    recordCount: 450000,
    volumeHistory: generateVolumeHistory(55.5)
  },
  {
    agentId: 'compliance-auditor',
    agentName: 'Compliance Auditor',
    volumeGB: 75.8,
    recordCount: 620000,
    volumeHistory: generateVolumeHistory(75.8)
  },
  {
    agentId: 'data-lineage-tracker',
    agentName: 'Data Lineage Tracker',
    volumeGB: 180.2,
    recordCount: 1500000,
    volumeHistory: generateVolumeHistory(180.2)
  },
];

// Agent Anomaly Count
export const DEMO_AGENT_ANOMALIES: AgentAnomaly[] = [
  { agentId: 'request-fulfillment', agentName: 'Request Fulfillment', anomalyCount: 3, severity: 'info' },
  { agentId: 'capacity-forecast', agentName: 'Capacity & Forecast', anomalyCount: 5, severity: 'warning' },
  { agentId: 'change-risk', agentName: 'Change Risk', anomalyCount: 8, severity: 'warning' },
  { agentId: 'cab-scribe', agentName: 'CAB Scribe', anomalyCount: 2, severity: 'info' },
  { agentId: 'deployment-validator', agentName: 'Deployment Validator', anomalyCount: 12, severity: 'critical' },
  { agentId: 'root-cause-analysis', agentName: 'Root Cause Analysis', anomalyCount: 10, severity: 'warning' },
  { agentId: 'security-threat-detector', agentName: 'Security Threat Detector', anomalyCount: 15, severity: 'critical' },
  { agentId: 'cost-optimizer', agentName: 'Cost Optimizer', anomalyCount: 4, severity: 'warning' },
  { agentId: 'compliance-auditor', agentName: 'Compliance Auditor', anomalyCount: 1, severity: 'info' },
  { agentId: 'data-lineage-tracker', agentName: 'Data Lineage Tracker', anomalyCount: 6, severity: 'warning' },
];

// Agent Health Metrics (Detailed per-agent metrics)
export const DEMO_AGENT_HEALTH_METRICS: AgentHealthMetrics[] = [
  {
    agentId: 'request-fulfillment',
    agentName: 'Request Fulfillment',
    dataQuality: {
      dataQualityScore: 96.5,
      completeness: 98.5,
      validity: 97.2,
      duplicateCount: 152,
      dataFreshness: '3 min',
      dataLagMinutes: 3
    },
    etl: {
      jobStatus: 'SUCCESS',
      lastRunMinutes: 22.5,
      totalRecordsProcessed: 1200000,
      recordsRejected: 410,
      lastSuccess: '2025-10-24 08:15:00',
      errorRate: 0.034,
      dagRuns: {
        extract: {
          id: 'extract_request_fulfillment',
          name: 'Extract from Source',
          status: 'SUCCESS',
          duration: '8.5 min',
          durationSeconds: 510,
          startTime: '2025-10-24 07:52:30',
          endTime: '2025-10-24 08:01:00',
          recordsProcessed: 1200410,
          errors: 0
        },
        transform: {
          id: 'transform_request_fulfillment',
          name: 'Transform & Validate',
          status: 'SUCCESS',
          duration: '10.2 min',
          durationSeconds: 612,
          startTime: '2025-10-24 08:01:00',
          endTime: '2025-10-24 08:11:12',
          recordsProcessed: 1200000,
          errors: 410
        },
        load: {
          id: 'load_request_fulfillment',
          name: 'Load to Data Warehouse',
          status: 'SUCCESS',
          duration: '3.8 min',
          durationSeconds: 228,
          startTime: '2025-10-24 08:11:12',
          endTime: '2025-10-24 08:15:00',
          recordsProcessed: 1200000,
          errors: 0
        }
      },
      dagId: 'request_fulfillment_etl_dag',
      dagRunId: 'scheduled__2025-10-24T07:52:30',
      nextScheduledRun: '2025-10-24 09:00:00',
      avgDagDuration: '21.8 min',
      successRate: 98.5,
      totalDagRuns: 1247
    },
    aiModel: {
      productionModelVersion: 'v3.1.2-prod',
      trainingStatus: 'COMPLETED',
      primaryScoreType: 'Accuracy',
      primaryScoreValue: 92.1,
      trainingTime: '4h 15m',
      trainingMinutes: 255,
      accuracy: 92.1,
      f1Score: 0.88
    },
    businessImpact: {
      roiPercentage: 245,
      incrementalRevenue: 150000,
      costSavings: 45000,
      conversionRateLift: 2.5,
      churnReduction: 1.8
    }
  },
  {
    agentId: 'capacity-forecast',
    agentName: 'Capacity & Forecast',
    dataQuality: {
      dataQualityScore: 94.2,
      completeness: 96.8,
      validity: 95.5,
      duplicateCount: 89,
      dataFreshness: '5 min',
      dataLagMinutes: 5
    },
    etl: {
      jobStatus: 'SUCCESS',
      lastRunMinutes: 18.2,
      totalRecordsProcessed: 780000,
      recordsRejected: 215,
      lastSuccess: '2025-10-24 08:20:00',
      errorRate: 0.028,
      dagRuns: {
        extract: {
          id: 'extract_capacity_forecast',
          name: 'Extract Capacity Data',
          status: 'SUCCESS',
          duration: '6.8 min',
          durationSeconds: 408,
          startTime: '2025-10-24 08:01:48',
          endTime: '2025-10-24 08:08:36',
          recordsProcessed: 780215,
          errors: 0
        },
        transform: {
          id: 'transform_capacity_forecast',
          name: 'Apply Transformations',
          status: 'SUCCESS',
          duration: '8.5 min',
          durationSeconds: 510,
          startTime: '2025-10-24 08:08:36',
          endTime: '2025-10-24 08:17:06',
          recordsProcessed: 780000,
          errors: 215
        },
        load: {
          id: 'load_capacity_forecast',
          name: 'Load to Analytics DB',
          status: 'SUCCESS',
          duration: '2.9 min',
          durationSeconds: 174,
          startTime: '2025-10-24 08:17:06',
          endTime: '2025-10-24 08:20:00',
          recordsProcessed: 780000,
          errors: 0
        }
      },
      dagId: 'capacity_forecast_etl_dag',
      dagRunId: 'scheduled__2025-10-24T08:01:48',
      nextScheduledRun: '2025-10-24 10:00:00',
      avgDagDuration: '17.5 min',
      successRate: 99.2,
      totalDagRuns: 982
    },
    aiModel: {
      productionModelVersion: 'v2.8.1-prod',
      trainingStatus: 'COMPLETED',
      primaryScoreType: 'RMSE',
      primaryScoreValue: 15.20,
      trainingTime: '3h 42m',
      trainingMinutes: 222,
      rmse: 15.20
    },
    businessImpact: {
      roiPercentage: 187,
      incrementalRevenue: 95000,
      costSavings: 62000,
      conversionRateLift: 1.9,
      churnReduction: 2.3
    }
  },
  {
    agentId: 'change-risk',
    agentName: 'Change Risk',
    dataQuality: {
      dataQualityScore: 88.7,
      completeness: 92.3,
      validity: 89.5,
      duplicateCount: 324,
      dataFreshness: '12 min',
      dataLagMinutes: 12
    },
    etl: {
      jobStatus: 'WARNING',
      lastRunMinutes: 31.7,
      totalRecordsProcessed: 520000,
      recordsRejected: 1820,
      lastSuccess: '2025-10-24 07:45:00',
      errorRate: 0.35,
      dagRuns: {
        extract: {
          id: 'extract_change_risk',
          name: 'Extract Change Data',
          status: 'SUCCESS',
          duration: '12.5 min',
          durationSeconds: 750,
          startTime: '2025-10-24 07:13:18',
          endTime: '2025-10-24 07:25:48',
          recordsProcessed: 521820,
          errors: 0
        },
        transform: {
          id: 'transform_change_risk',
          name: 'Risk Assessment Transform',
          status: 'SUCCESS',
          duration: '15.8 min',
          durationSeconds: 948,
          startTime: '2025-10-24 07:25:48',
          endTime: '2025-10-24 07:41:36',
          recordsProcessed: 520000,
          errors: 1820
        },
        load: {
          id: 'load_change_risk',
          name: 'Load Risk Scores',
          status: 'SUCCESS',
          duration: '3.4 min',
          durationSeconds: 204,
          startTime: '2025-10-24 07:41:36',
          endTime: '2025-10-24 07:45:00',
          recordsProcessed: 520000,
          errors: 0
        }
      },
      dagId: 'change_risk_assessment_dag',
      dagRunId: 'scheduled__2025-10-24T07:13:18',
      nextScheduledRun: '2025-10-24 09:15:00',
      avgDagDuration: '28.3 min',
      successRate: 94.7,
      totalDagRuns: 756
    },
    aiModel: {
      productionModelVersion: 'v4.0.8-prod',
      trainingStatus: 'COMPLETED',
      primaryScoreType: 'F1-Score',
      primaryScoreValue: 0.82,
      trainingTime: '5h 18m',
      trainingMinutes: 318,
      accuracy: 87.5,
      f1Score: 0.82
    },
    businessImpact: {
      roiPercentage: 156,
      incrementalRevenue: 72000,
      costSavings: 38000,
      conversionRateLift: 1.3,
      churnReduction: 0.9
    }
  },
  {
    agentId: 'cab-scribe',
    agentName: 'CAB Scribe',
    dataQuality: {
      dataQualityScore: 97.8,
      completeness: 99.1,
      validity: 98.2,
      duplicateCount: 45,
      dataFreshness: '2 min',
      dataLagMinutes: 2
    },
    etl: {
      jobStatus: 'SUCCESS',
      lastRunMinutes: 14.8,
      totalRecordsProcessed: 290000,
      recordsRejected: 87,
      lastSuccess: '2025-10-24 08:25:00',
      errorRate: 0.03,
      dagRuns: {
        extract: {
          id: 'extract_cab_scribe',
          name: 'Extract Meeting Data',
          status: 'SUCCESS',
          duration: '4.2 min',
          durationSeconds: 252,
          startTime: '2025-10-24 08:10:12',
          endTime: '2025-10-24 08:14:24',
          recordsProcessed: 290087,
          errors: 0
        },
        transform: {
          id: 'transform_cab_scribe',
          name: 'NLP Processing',
          status: 'SUCCESS',
          duration: '8.5 min',
          durationSeconds: 510,
          startTime: '2025-10-24 08:14:24',
          endTime: '2025-10-24 08:22:54',
          recordsProcessed: 290000,
          errors: 87
        },
        load: {
          id: 'load_cab_scribe',
          name: 'Store Transcriptions',
          status: 'SUCCESS',
          duration: '2.1 min',
          durationSeconds: 126,
          startTime: '2025-10-24 08:22:54',
          endTime: '2025-10-24 08:25:00',
          recordsProcessed: 290000,
          errors: 0
        }
      },
      dagId: 'cab_scribe_etl_pipeline',
      dagRunId: 'scheduled__2025-10-24T08:10:12',
      nextScheduledRun: '2025-10-24 10:10:00',
      avgDagDuration: '14.2 min',
      successRate: 99.7,
      totalDagRuns: 1108
    },
    aiModel: {
      productionModelVersion: 'v3.5.0-prod',
      trainingStatus: 'COMPLETED',
      primaryScoreType: 'Accuracy',
      primaryScoreValue: 94.7,
      trainingTime: '2h 55m',
      trainingMinutes: 175,
      accuracy: 94.7,
      f1Score: 0.91
    },
    businessImpact: {
      roiPercentage: 312,
      incrementalRevenue: 128000,
      costSavings: 89000,
      conversionRateLift: 3.2,
      churnReduction: 2.7
    }
  },
  {
    agentId: 'deployment-validator',
    agentName: 'Deployment Validator',
    dataQuality: {
      dataQualityScore: 82.4,
      completeness: 87.2,
      validity: 84.8,
      duplicateCount: 567,
      dataFreshness: '25 min',
      dataLagMinutes: 25
    },
    etl: {
      jobStatus: 'FAILED',
      lastRunMinutes: 45.3,
      totalRecordsProcessed: 1680000,
      recordsRejected: 3250,
      lastSuccess: '2025-10-24 06:30:00',
      errorRate: 0.19,
      dagRuns: {
        extract: {
          id: 'extract_deployment_validator',
          name: 'Extract Deployment Logs',
          status: 'SUCCESS',
          duration: '18.5 min',
          durationSeconds: 1110,
          startTime: '2025-10-24 07:22:12',
          endTime: '2025-10-24 07:40:42',
          recordsProcessed: 1683250,
          errors: 0
        },
        transform: {
          id: 'transform_deployment_validator',
          name: 'Validation Rules Engine',
          status: 'SUCCESS',
          duration: '22.8 min',
          durationSeconds: 1368,
          startTime: '2025-10-24 07:40:42',
          endTime: '2025-10-24 08:03:30',
          recordsProcessed: 1680000,
          errors: 3250
        },
        load: {
          id: 'load_deployment_validator',
          name: 'Load Validation Results',
          status: 'FAILED',
          duration: '4.0 min',
          durationSeconds: 240,
          startTime: '2025-10-24 08:03:30',
          endTime: '2025-10-24 08:07:30',
          recordsProcessed: 1245000,
          errors: 435000
        }
      },
      dagId: 'deployment_validation_dag',
      dagRunId: 'scheduled__2025-10-24T07:22:12',
      nextScheduledRun: '2025-10-24 09:30:00',
      avgDagDuration: '38.2 min',
      successRate: 91.3,
      totalDagRuns: 892
    },
    aiModel: {
      productionModelVersion: 'v2.9.0-prod',
      trainingStatus: 'FAILED',
      primaryScoreType: 'Accuracy',
      primaryScoreValue: 78.3,
      trainingTime: '6h 42m',
      trainingMinutes: 402,
      accuracy: 78.3,
      f1Score: 0.71
    },
    businessImpact: {
      roiPercentage: 98,
      incrementalRevenue: 42000,
      costSavings: 28000,
      conversionRateLift: 0.8,
      churnReduction: 0.5
    }
  },
  {
    agentId: 'root-cause-analysis',
    agentName: 'Root Cause Analysis',
    dataQuality: {
      dataQualityScore: 94.8,
      completeness: 98.2,
      validity: 96.5,
      duplicateCount: 78,
      dataFreshness: '4 min',
      dataLagMinutes: 4
    },
    etl: {
      jobStatus: 'SUCCESS',
      lastRunMinutes: 19.5,
      totalRecordsProcessed: 950000,
      recordsRejected: 285,
      lastSuccess: '2025-10-24 08:18:00',
      errorRate: 0.03,
      dagRuns: {
        extract: {
          id: 'extract_root_cause',
          name: 'Extract Incident Data',
          status: 'SUCCESS',
          duration: '7.8 min',
          durationSeconds: 468,
          startTime: '2025-10-24 07:58:12',
          endTime: '2025-10-24 08:06:00',
          recordsProcessed: 950285,
          errors: 0
        },
        transform: {
          id: 'transform_root_cause',
          name: 'Correlation & Analysis Transform',
          status: 'SUCCESS',
          duration: '9.2 min',
          durationSeconds: 552,
          startTime: '2025-10-24 08:06:00',
          endTime: '2025-10-24 08:15:12',
          recordsProcessed: 950000,
          errors: 285
        },
        load: {
          id: 'load_root_cause',
          name: 'Load to Analysis DB',
          status: 'SUCCESS',
          duration: '2.8 min',
          durationSeconds: 168,
          startTime: '2025-10-24 08:15:12',
          endTime: '2025-10-24 08:18:00',
          recordsProcessed: 950000,
          errors: 0
        }
      },
      dagId: 'root_cause_analysis_dag',
      dagRunId: 'scheduled__2025-10-24T07:58:12',
      nextScheduledRun: '2025-10-24 10:00:00',
      avgDagDuration: '18.9 min',
      successRate: 99.1,
      totalDagRuns: 892
    },
    aiModel: {
      productionModelVersion: 'v1.0.2-prod',
      trainingStatus: 'COMPLETED',
      primaryScoreType: 'Accuracy',
      primaryScoreValue: 89.4,
      trainingTime: '3h 25m',
      trainingMinutes: 205,
      accuracy: 89.4,
      f1Score: 0.85
    },
    businessImpact: {
      roiPercentage: 312,
      incrementalRevenue: 112000,
      costSavings: 76000,
      conversionRateLift: 2.8,
      churnReduction: 2.1
    }
  }
];

// Agent Performance Metrics
export const DEMO_AGENT_PERFORMANCE: AgentPerformanceMetrics[] = [
  {
    agentId: 'request-fulfillment',
    agentName: 'Request Fulfillment',
    avgResponseTime: 150,
    requestsPerMinute: 1000,
    successRate: 99.5,
    errorCount: 5,
    activeSessions: 100,
    throughput: 10.0,
    latencyP50: 100,
    latencyP95: 200,
    latencyP99: 400,
    cpuUsage: 70.0,
    memoryUsage: 65.0,
    queueDepth: 15,
    requestRate: 10.0,
    peakRequestRate: 20.0,
    totalRequestsToday: 120000
  },
  {
    agentId: 'capacity-forecast',
    agentName: 'Capacity & Forecast',
    avgResponseTime: 200,
    requestsPerMinute: 800,
    successRate: 98.5,
    errorCount: 10,
    activeSessions: 80,
    throughput: 8.0,
    latencyP50: 150,
    latencyP95: 300,
    latencyP99: 600,
    cpuUsage: 60.0,
    memoryUsage: 58.0,
    queueDepth: 10,
    requestRate: 8.0,
    peakRequestRate: 15.0,
    totalRequestsToday: 96000
  },
  {
    agentId: 'change-risk',
    agentName: 'Change Risk',
    avgResponseTime: 300,
    requestsPerMinute: 1200,
    successRate: 97.0,
    errorCount: 20,
    activeSessions: 150,
    throughput: 15.0,
    latencyP50: 250,
    latencyP95: 500,
    latencyP99: 1000,
    cpuUsage: 80.0,
    memoryUsage: 75.0,
    queueDepth: 20,
    requestRate: 15.0,
    peakRequestRate: 25.0,
    totalRequestsToday: 144000
  },
  {
    agentId: 'cab-scribe',
    agentName: 'CAB Scribe',
    avgResponseTime: 400,
    requestsPerMinute: 1500,
    successRate: 96.0,
    errorCount: 25,
    activeSessions: 200,
    throughput: 20.0,
    latencyP50: 300,
    latencyP95: 600,
    latencyP99: 1200,
    cpuUsage: 85.0,
    memoryUsage: 80.0,
    queueDepth: 25,
    requestRate: 20.0,
    peakRequestRate: 30.0,
    totalRequestsToday: 180000
  },
  {
    agentId: 'deployment-validator',
    agentName: 'Deployment Validator',
    avgResponseTime: 500,
    requestsPerMinute: 2000,
    successRate: 95.0,
    errorCount: 50,
    activeSessions: 300,
    throughput: 30.0,
    latencyP50: 400,
    latencyP95: 800,
    latencyP99: 1600,
    cpuUsage: 90.0,
    memoryUsage: 85.0,
    queueDepth: 30,
    requestRate: 30.0,
    peakRequestRate: 40.0,
    totalRequestsToday: 240000
  },
  {
    agentId: 'root-cause-analysis',
    agentName: 'Root Cause Analysis',
    avgResponseTime: 600,
    requestsPerMinute: 2500,
    successRate: 94.0,
    errorCount: 60,
    activeSessions: 350,
    throughput: 35.0,
    latencyP50: 450,
    latencyP95: 900,
    latencyP99: 1800,
    cpuUsage: 95.0,
    memoryUsage: 90.0,
    queueDepth: 35,
    requestRate: 35.0,
    peakRequestRate: 45.0,
    totalRequestsToday: 300000
  },
  {
    agentId: 'security-threat-detector',
    agentName: 'Security Threat Detector',
    avgResponseTime: 80,
    requestsPerMinute: 3200,
    successRate: 99.8,
    errorCount: 1,
    activeSessions: 500,
    throughput: 53.3,
    latencyP50: 60,
    latencyP95: 120,
    latencyP99: 250,
    cpuUsage: 75.0,
    memoryUsage: 68.5,
    queueDepth: 10,
    requestRate: 53.3,
    peakRequestRate: 80.0,
    totalRequestsToday: 4608000
  },
  {
    agentId: 'cost-optimizer',
    agentName: 'Cost Optimizer',
    avgResponseTime: 2500,
    requestsPerMinute: 150,
    successRate: 95.0,
    errorCount: 4,
    activeSessions: 50,
    throughput: 2.5,
    latencyP50: 2000,
    latencyP95: 4000,
    latencyP99: 6000,
    cpuUsage: 55.0,
    memoryUsage: 62.3,
    queueDepth: 80,
    requestRate: 2.5,
    peakRequestRate: 5.0,
    totalRequestsToday: 216000
  },
  {
    agentId: 'compliance-auditor',
    agentName: 'Compliance Auditor',
    avgResponseTime: 800,
    requestsPerMinute: 300,
    successRate: 99.9,
    errorCount: 0,
    activeSessions: 75,
    throughput: 5.0,
    latencyP50: 700,
    latencyP95: 1200,
    latencyP99: 2000,
    cpuUsage: 40.0,
    memoryUsage: 55.0,
    queueDepth: 5,
    requestRate: 5.0,
    peakRequestRate: 10.0,
    totalRequestsToday: 432000
  },
  {
    agentId: 'data-lineage-tracker',
    agentName: 'Data Lineage Tracker',
    avgResponseTime: 1200,
    requestsPerMinute: 500,
    successRate: 98.0,
    errorCount: 5,
    activeSessions: 120,
    throughput: 8.3,
    latencyP50: 1000,
    latencyP95: 1800,
    latencyP99: 3000,
    cpuUsage: 68.0,
    memoryUsage: 72.0,
    queueDepth: 35,
    requestRate: 8.3,
    peakRequestRate: 15.0,
    totalRequestsToday: 720000
  },
];

export interface UptimeData {
  name: string;
  status: 'Active' | 'Warning' | 'Stopped';
  uptimeDays: boolean[];
  avgUptime: number;
}

export const DEMO_UPTIME_DATA: UptimeData[] = [
  { name: 'Compliance Checker', status: 'Active', uptimeDays: [true, true, true, true, true, true, true], avgUptime: 98.7 },
  { name: 'Root Cause Analysis', status: 'Active', uptimeDays: [true, true, true, false, true, true, true], avgUptime: 92.1 },
  { name: 'Capacity Analyst', status: 'Warning', uptimeDays: [true, true, false, false, true, true, true], avgUptime: 14.3 },
  { name: 'Cost Analyst', status: 'Stopped', uptimeDays: [false, false, false, false, false, false, false], avgUptime: 100 },
  { name: 'Log Analytics', status: 'Stopped', uptimeDays: [true, true, true, true, true, false, true], avgUptime: 96.4 },
  { name: 'Performance Optimizer', status: 'Active', uptimeDays: [true, true, true, true, true, true, true], avgUptime: 98.7 },
  { name: 'Security Anomaly', status: 'Warning', uptimeDays: [true, true, true, false, true, true, false], avgUptime: 92.1 },
  { name: 'Infrastructure Monitor', status: 'Active', uptimeDays: [true, true, true, true, true, true, true], avgUptime: 100 },
];

export interface MttrData {
  name: string;
  value: number;
}

export const DEMO_MTTR_DATA: MttrData[] = [
  { name: 'Compliance Checker', value: 28 }, // High - red gradient
  { name: 'RCA', value: 25 }, // High - red gradient
  { name: 'Capacity Analysis', value: 19 }, // Moderate - purple gradient
  { name: 'Cost Analysis', value: 8 }, // Low - green gradient
  { name: 'Log Analysis', value: 22 }, // Moderate - purple gradient
  { name: 'Performance Optimizer', value: 30 }, // Very High - red gradient
  { name: 'Security Anomaly', value: 15 }, // Low - green gradient
  { name: 'Infrastructure Monitor', value: 6 }, // Very Low - green gradient
];

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

export const DEMO_HEALTH_CHECK_DATA: HealthCheckData = {
  labels: ['Working', 'Warning', 'Stopped'],
  datasets: [{
    data: [71.5, 20.2, 24.6],
    backgroundColor: [
      '#D2F65C', // working
      '#FF6F61', // warning
      '#A36EFF'  // stopped
    ],
    borderColor: [
      '#D2F65C',
      '#FF6F61',
      '#A36EFF'
    ],
    borderWidth: 0,
    circumference: 360,
  }]
};

// System Overview Metrics
export const DEMO_SYSTEM_OVERVIEW: SystemOverviewMetrics = {
  totalRequests: 3385 * 60, // per hour
  totalErrors: 29,
  avgLatency: 2213,
  totalActiveSessions: 752,
  overallSuccessRate: 93.4,
  totalThroughput: 56.4
};

// Anomaly Records
export const DEMO_ANOMALY_LIST: AnomalyRecord[] = [
  {
    id: 'anom-001',
    anomaly: '50 message clusters, 38 messages',
    entity: 'payment-service-prod',
    status: 'Active',
    severity: 'Critical',
    timeRange: { start: '04.09.2024 08:40', end: '04.09.2024 12:00' }
  },
  {
    id: 'anom-002',
    anomaly: 'High Response Time',
    entity: 'checkout-cart-service',
    status: 'Active',
    severity: 'High',
    timeRange: { start: '04.09.2024 09:15', end: '04.09.2024 12:00' }
  },
  {
    id: 'anom-003',
    anomaly: 'Interface Down',
    entity: 'core-switch-ny-01',
    status: 'Active',
    severity: 'Critical',
    timeRange: { start: '04.09.2024 10:30', end: '04.09.2024 12:00' }
  },
  {
    id: 'anom-004',
    anomaly: 'High CPU Usage',
    entity: 'db-oracle-primary',
    status: 'Active',
    severity: 'Moderate',
    timeRange: { start: '04.09.2024 11:00', end: '04.09.2024 12:00' }
  },
  {
    id: 'anom-005',
    anomaly: '3 metrics (opsb_app_perf...)',
    entity: 'inventory-api-gateway',
    status: 'Active',
    severity: 'Moderate',
    timeRange: { start: '04.09.2024 11:45', end: '04.09.2024 12:00' }
  },
  {
    id: 'anom-006',
    anomaly: 'Memory Leak Detected',
    entity: 'user-profile-service',
    status: 'Active',
    severity: 'High',
    timeRange: { start: '04.09.2024 13:15', end: '04.09.2024 15:30' }
  },
  {
    id: 'anom-007',
    anomaly: 'Disk Space Low',
    entity: 'storage-cluster-02',
    status: 'Investigating',
    severity: 'Moderate',
    timeRange: { start: '04.09.2024 14:00', end: '04.09.2024 16:00' }
  },
  {
    id: 'anom-008',
    anomaly: 'Switch Port Flapping (Network)',
    entity: 'edge-router-01',
    status: 'Resolved',
    severity: 'Low',
    timeRange: { start: '04.09.2024 07:00', end: '04.09.2024 08:30' }
  }
];

// Helper Functions
function generateHeatmapData(intensity: 'low' | 'medium' | 'high', customBase?: number): { timestamp: string; value: number }[] {
  const data: { timestamp: string; value: number }[] = [];
  // Use custom base if provided, otherwise use default based on intensity
  let baseValue: number;
  let varianceRange: number;
  
  if (customBase !== undefined) {
    baseValue = customBase;
    // Set variance based on intensity level for custom values
    if (intensity === 'high') {
      varianceRange = 12; // ±6 variance for more variation
    } else if (intensity === 'medium') {
      varianceRange = 18; // ±9 variance for more variation
    } else {
      varianceRange = 14; // ±7 variance for more variation
    }
  } else {
    // Default values if no custom base provided
    if (intensity === 'high') {
      baseValue = 88;
      varianceRange = 12; // ±6 variance for more variation
    } else if (intensity === 'medium') {
      baseValue = 55;
      varianceRange = 18; // ±9 variance for more variation
    } else {
      baseValue = 25;
      varianceRange = 14; // ±7 variance for more variation
    }
  }
  
  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      const businessHours = hour >= 8 && hour <= 18;
      const variance = Math.random() * varianceRange - (varianceRange / 2);
      // Adjust off-hours multiplier based on intensity to maintain proper averages
      const offHoursMultiplier = intensity === 'high' ? 0.75 : intensity === 'medium' ? 0.5 : 0.4;
      const value = businessHours ? baseValue + variance : (baseValue * offHoursMultiplier) + variance;
      data.push({
        timestamp: `Day ${day} - ${hour}:00`,
        value: Math.max(0, Math.min(100, value)) // Clamp between 0 and 100
      });
    }
  }
  return data;
}

function generateVolumeHistory(currentVolume: number): { timestamp: string; value: number }[] {
  const history: { timestamp: string; value: number }[] = [];
  const baseVolume = currentVolume * 0.7;
  
  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    const growth = (currentVolume - baseVolume) * (i / 29);
    const variance = Math.random() * 10 - 5;
    history.push({
      timestamp: date.toISOString().split('T')[0],
      value: baseVolume + growth + variance
    });
  }
  return history;
}

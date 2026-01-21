import { AgentRequirements, IntegrationDataSource } from '../models/integration-data.model';

// Agent Integration Requirements
export const AGENT_REQUIREMENTS: AgentRequirements[] = [
  {
    agentId: 'request-fulfillment',
    agentName: 'Request Fulfillment',
    requiresDatabase: true,
    requiresExcel: false,
    requiresThirdParty: false
  },
  {
    agentId: 'capacity-forecast',
    agentName: 'Capacity & Forecast',
    requiresDatabase: true,
    requiresExcel: false,
    requiresThirdParty: false
  },
  {
    agentId: 'root-cause-analysis',
    agentName: 'Root Cause Analysis',
    requiresDatabase: true,
    requiresExcel: false,
    requiresThirdParty: true,
    thirdPartyConnections: [
      {
        id: 'cmdb',
        name: 'CMDB Connection',
        description: 'Configuration Management Database connection for asset and dependency mapping',
        required: true
      }
    ]
  },
  {
    agentId: 'change-risk',
    agentName: 'Change Risk',
    requiresDatabase: false,
    requiresExcel: true,
    requiresThirdParty: false
  },
  {
    agentId: 'knowledge-writer',
    agentName: 'Knowledge Writer',
    requiresDatabase: true,
    requiresExcel: false,
    requiresThirdParty: false
  },
  {
    agentId: 'cab-scribe',
    agentName: 'CAB Scribe',
    requiresDatabase: false,
    requiresExcel: true,
    requiresThirdParty: false
  },
  {
    agentId: 'release-orchestrator',
    agentName: 'Release Orchestrator',
    requiresDatabase: true,
    requiresExcel: false,
    requiresThirdParty: true,
    thirdPartyConnections: [
      {
        id: 'jira',
        name: 'Jira Connection',
        description: 'Jira API connection for release tracking and management',
        required: true
      },
      {
        id: 'jenkins',
        name: 'Jenkins Connection',
        description: 'Jenkins CI/CD pipeline integration',
        required: false
      }
    ]
  },
  {
    agentId: 'deployment-validator',
    agentName: 'Deployment Validator',
    requiresDatabase: true,
    requiresExcel: false,
    requiresThirdParty: true,
    thirdPartyConnections: [
      {
        id: 'kubernetes',
        name: 'Kubernetes API',
        description: 'Kubernetes cluster connection for deployment validation',
        required: true
      }
    ]
  }
];

// Demo integrated agents with data sources
export const DEMO_INTEGRATED_AGENTS: IntegrationDataSource[] = [
  {
    integrationId: '1',
    agentId: 'request-fulfillment',
    agentName: 'Request Fulfillment',
    databaseConnection: {
      type: 'postgres',
      host: 'prod-db-01.company.com',
      port: 5432,
      database: 'service_requests',
      username: 'rf_service',
      password: '••••••••',
      ssl: true
    },
    createdAt: new Date('2025-10-15'),
    updatedAt: new Date('2025-10-23'),
    status: 'active'
  },
  {
    integrationId: '2',
    agentId: 'capacity-forecast',
    agentName: 'Capacity & Forecast',
    databaseConnection: {
      type: 'vertica',
      host: 'analytics-cluster.company.com',
      port: 5433,
      database: 'capacity_metrics',
      username: 'capacity_reader',
      password: '••••••••',
      ssl: true
    },
    createdAt: new Date('2025-10-12'),
    updatedAt: new Date('2025-10-22'),
    status: 'active'
  },
  {
    integrationId: '3',
    agentId: 'change-risk',
    agentName: 'Change Risk',
    excelUpload: {
      fileName: 'change_history_2024.xlsx',
      fileSize: 2457600,
      uploadDate: new Date('2025-10-18')
    },
    createdAt: new Date('2025-10-18'),
    updatedAt: new Date('2025-10-18'),
    status: 'active'
  },
  {
    integrationId: '4',
    agentId: 'deployment-validator',
    agentName: 'Deployment Validator',
    databaseConnection: {
      type: 'mysql',
      host: 'deployment-db.company.com',
      port: 3306,
      database: 'deployments',
      username: 'deploy_monitor',
      password: '••••••••',
      ssl: false
    },
    thirdPartyConnections: [
      {
        connectionId: 'kubernetes',
        connectionName: 'Kubernetes API',
        connectionString: 'https://k8s-cluster.company.com:6443',
        apiKey: 'k8s-••••••••••••',
        additionalParams: {
          namespace: 'production',
          context: 'prod-cluster'
        }
      }
    ],
    createdAt: new Date('2025-10-10'),
    updatedAt: new Date('2025-10-24'),
    status: 'error'
  }
];

export function getAgentRequirements(agentId: string): AgentRequirements | undefined {
  return AGENT_REQUIREMENTS.find(req => req.agentId === agentId);
}

export function getIntegratedAgent(integrationId: string): IntegrationDataSource | undefined {
  return DEMO_INTEGRATED_AGENTS.find(agent => agent.integrationId === integrationId);
}


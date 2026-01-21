// Agent Integration Requirements
export interface AgentRequirements {
  agentId: string;
  agentName: string;
  requiresDatabase: boolean;
  requiresExcel: boolean;
  requiresThirdParty: boolean;
  thirdPartyConnections?: ThirdPartyConnection[];
}

export interface ThirdPartyConnection {
  id: string;
  name: string;
  description: string;
  required: boolean;
}

// Database Types
export type DatabaseType = 'postgres' | 'vertica' | 'mysql' | 'oracle' | 'mssql' | 'mongodb' | 'hadoop' | 'cassandra';

export interface DatabaseConnection {
  type: DatabaseType;
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl?: boolean;
  additionalParams?: string;
}

// Excel Upload
export interface ExcelUpload {
  fileName: string;
  fileSize: number;
  uploadDate: Date;
  fileData?: File;
}

// Third Party Connections
export interface ThirdPartyConnectionData {
  connectionId: string;
  connectionName: string;
  connectionString: string;
  apiKey?: string;
  topologyQuery?: string;
  additionalParams?: Record<string, string>;
}

// Integration Data Source (complete integration data)
export interface IntegrationDataSource {
  integrationId: string;
  agentId: string;
  agentName: string;
  databaseConnection?: DatabaseConnection;
  excelUpload?: ExcelUpload;
  thirdPartyConnections?: ThirdPartyConnectionData[];
  createdAt: Date;
  updatedAt: Date;
  status: 'active' | 'inactive' | 'error';
}


import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faChevronLeft, faChevronRight, faUpload, faDatabase, faPlug, faTrash } from '@fortawesome/free-solid-svg-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorLink, phosphorCheck, phosphorFileText, phosphorCube } from '@ng-icons/phosphor-icons/regular';
import { 
  AgentRequirements, 
  DatabaseConnection, 
  DatabaseType, 
  ExcelUpload, 
  ThirdPartyConnectionData 
} from '@shared/models/integration-data.model';
import { 
  AGENT_REQUIREMENTS, 
  getAgentRequirements 
} from '@shared/constants/integration-requirements.constants';
import { IntegrationStateService } from '@shared/services/integration-state.service';
import {
  DEMO_AGENT_VERSIONS,
  DEMO_AGENT_PERFORMANCE,
  DEMO_AGENTS
} from '@shared/constants/demo-data.constants';
import {
  AgentVersion,
  AgentPerformanceMetrics,
  Agent
} from '@shared/models/demo-data.model';

@Component({
  selector: 'app-new-integration',
  imports: [CommonModule, FontAwesomeModule, FormsModule, NgIcon],
  viewProviders: [provideIcons({ phosphorLink, phosphorCheck, phosphorFileText, phosphorCube })],
  templateUrl: './new-integration.html',
  styleUrl: './new-integration.scss'
})
export class NewIntegration implements OnInit, OnDestroy {
  currentStep = 1;
  maxSteps = 3;
  
  // Step 1: License Key Upload
  licenseFile: File | null = null;
  licenseFileName: string = '';
  licenseUploadProgress = 0;
  licenseIsUploading = false;
  private licenseUploadInterval: ReturnType<typeof setInterval> | null = null;
  
  // Step 2: Agent Selection
  selectedAgentId: string = '';
  agentRequirements: AgentRequirements | null = null;
  availableAgents: AgentRequirements[] = [];
  
  // Carousel properties
  currentIndex = 0;
  pageSize = 4;
  paginatedAgents: AgentRequirements[] = [];
  private resizeListener?: () => void;

  // Demo data for cards
  agentVersions: AgentVersion[] = DEMO_AGENT_VERSIONS;
  agentPerformance: AgentPerformanceMetrics[] = DEMO_AGENT_PERFORMANCE;
  demoAgents: Agent[] = DEMO_AGENTS;
  
  // Step 2: Data Source Configuration
  // Database
  selectedDatabaseType: DatabaseType | null = null;
  databaseConnection: DatabaseConnection = {
    type: 'postgres',
    host: '',
    port: 5432,
    database: '',
    username: '',
    password: '',
    ssl: false
  };
  
  // Excel
  selectedFile: File | null = null;
  excelUpload: ExcelUpload | null = null;
  uploadProgress = 0;
  isUploading = false;
  private uploadInterval: ReturnType<typeof setInterval> | null = null;
  
  // Step 3: Third Party Connections
  thirdPartyConnections: ThirdPartyConnectionData[] = [];
  
  // Edit mode
  isEditMode = false;
  editingIntegrationId: string | null = null;

  // UI State
  showConfirmPopup = false;
  loading = false;
  error: string | null = null;
  
  // Icons
  faChevronLeft = faChevronLeft;
  faChevronRight = faChevronRight;
  faUpload = faUpload;
  faDatabase = faDatabase;
  faPlug = faPlug;
  faTrash = faTrash;
  
  // Database types
  databaseTypes: DatabaseType[] = ['postgres', 'vertica', 'mysql', 'oracle', 'mssql', 'mongodb', 'hadoop', 'cassandra'];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private integrationStateService: IntegrationStateService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['edit'] === 'true' && params['integrationId']) {
        this.isEditMode = true;
        this.editingIntegrationId = params['integrationId'];
        this.loadExistingIntegration(params['integrationId']);
      } else {
        // Filter out already integrated agents for new integrations
        const integratedAgentIds = this.integrationStateService.getIntegratedAgentIds();
        this.availableAgents = AGENT_REQUIREMENTS.filter(
          agent => !integratedAgentIds.includes(agent.agentId)
        );
      }
      
      // Initialize carousel
      this.calculatePageSize();
      this.updatePaginatedAgents();
    });

    // Listen to window resize events
    this.resizeListener = () => {
      this.calculatePageSize();
      this.updatePaginatedAgents();
    };
    window.addEventListener('resize', this.resizeListener);
  }

  ngOnDestroy(): void {
    if (this.resizeListener) {
      window.removeEventListener('resize', this.resizeListener);
    }
    this.clearLicenseUploadProgress();
    this.clearUploadProgress();
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
    const maxIndex = Math.max(0, Math.ceil(this.availableAgents.length / this.pageSize) - 1);
    if (this.currentIndex > maxIndex) {
      this.currentIndex = 0;
    }
    
    const startIndex = this.currentIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedAgents = this.availableAgents.slice(startIndex, endIndex);
  }

  nextAgents(): void {
    const maxIndex = Math.max(0, Math.ceil(this.availableAgents.length / this.pageSize) - 1);
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
    if (this.availableAgents.length === 0) return false;
    const maxIndex = Math.max(0, Math.ceil(this.availableAgents.length / this.pageSize) - 1);
    return this.currentIndex < maxIndex;
  }

  canGoPrev(): boolean {
    return this.currentIndex > 0 && this.availableAgents.length > 0;
  }

  getAgentIcon(agentId: string): string {
    const agent = this.demoAgents.find(a => a.id === agentId);
    return agent ? agent.icon : 'phosphorCube';
  }

  getAgentPerformance(agentId: string): AgentPerformanceMetrics | undefined {
    return this.agentPerformance.find(p => p.agentId === agentId);
  }

  getAgentVersion(agentId: string): string {
    const versionData = this.agentVersions.find(v => v.agentId === agentId);
    return versionData ? versionData.version : 'N/A';
  }

  getMetricColor(value: number, maxValue: number = 100): string {
    const percentage = Math.min(Math.max(value / maxValue, 0), 1);
    let r: number, g: number, b: number;

    if (percentage <= 0.5) {
      r = 210; g = 246; b = 92;
    } else if (percentage <= 0.75) {
      const t = (percentage - 0.5) / 0.25;
      r = Math.round(210 + (255 - 210) * t);
      g = Math.round(246 + (111 - 246) * t);
      b = Math.round(92 + (97 - 92) * t);
    } else {
      r = 255; g = 111; b = 97;
    }

    return `rgb(${r}, ${g}, ${b})`;
  }

  formatPercentage(num: number): string {
    return Math.round(num).toString();
  }

  loadExistingIntegration(integrationId: string) {
    const integration = this.integrationStateService.getIntegrationById(integrationId);
    if (integration) {
      this.selectedAgentId = integration.agentId;
      this.agentRequirements = getAgentRequirements(integration.agentId) || null;
      this.availableAgents = [this.agentRequirements!];
      
      if (integration.databaseConnection) {
        this.selectedDatabaseType = integration.databaseConnection.type;
        this.databaseConnection = { ...integration.databaseConnection };
      }
      
      if (integration.excelUpload) {
        this.excelUpload = { ...integration.excelUpload };
      }
      
      if (integration.thirdPartyConnections) {
        this.thirdPartyConnections = [...integration.thirdPartyConnections];
      }
      
      // Start at step 3 in edit mode (skip license and agent selection)
      this.currentStep = 3;
      this.licenseFileName = 'license-key.lic'; // Assume license already uploaded
    }
  }

  onLicenseFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.licenseFile = input.files[0];
      this.licenseFileName = this.licenseFile.name;
      this.startLicenseUploadProgress();
    }
  }

  selectAgent(agentId: string) {
    if (this.isEditMode) return; // Can't change agent in edit mode
    
    this.selectedAgentId = agentId;
    this.agentRequirements = getAgentRequirements(agentId) || null;
    
    // Initialize third party connections if required
    if (this.agentRequirements?.thirdPartyConnections) {
      this.thirdPartyConnections = this.agentRequirements.thirdPartyConnections.map(conn => ({
        connectionId: conn.id,
        connectionName: conn.name,
        connectionString: '',
        apiKey: '',
        topologyQuery: '',
        additionalParams: {}
      }));
    }
  }

  selectDatabaseType(type: DatabaseType) {
    this.selectedDatabaseType = type;
    this.databaseConnection.type = type;
    
    // Set default ports and usernames based on database type
    switch (type) {
      case 'postgres':
        this.databaseConnection.port = 5432;
        this.databaseConnection.username = 'postgres';
        break;
      case 'mysql':
        this.databaseConnection.port = 3306;
        this.databaseConnection.username = 'root';
        break;
      case 'vertica':
        this.databaseConnection.port = 5433;
        this.databaseConnection.username = 'dbadmin';
        break;
      case 'oracle':
        this.databaseConnection.port = 1521;
        this.databaseConnection.username = 'system';
        break;
      case 'mssql':
        this.databaseConnection.port = 1433;
        this.databaseConnection.username = 'sa';
        break;
      case 'mongodb':
        this.databaseConnection.port = 27017;
        this.databaseConnection.username = 'admin';
        break;
      case 'hadoop':
        this.databaseConnection.port = 9000;
        this.databaseConnection.username = 'hdfs';
        break;
      case 'cassandra':
        this.databaseConnection.port = 9042;
        this.databaseConnection.username = 'cassandra';
        break;
    }
  }

  getDatabaseIcon(type: DatabaseType): string {
    switch (type) {
      case 'postgres':
        return 'postgresql';
      case 'mysql':
        return 'mysql';
      case 'oracle':
        return 'oracle';
      case 'mssql':
        return 'microsoft';
      case 'mongodb':
        return 'mongodb';
      case 'hadoop':
        return 'hadoop';
      case 'cassandra':
        return 'cassandra';
      case 'vertica':
        return 'vertica';
      default:
        return 'database';
    }
  }

  getDatabaseImage(type: DatabaseType): string {
    switch (type) {
      case 'postgres':
        return 'postgres.png';
      case 'oracle':
        return 'oracle.png';
      case 'mysql':
        return 'mysql.png';
      case 'mssql':
        return 'mssql.png';
      case 'mongodb':
        return 'mongodb.png';
      case 'hadoop':
        return 'hadoop.png';
      case 'cassandra':
        return 'cassandra.png';
      case 'vertica':
        return 'vertica.png';
      default:
        return 'database.png';
    }
  }

  getDatabaseDisplayName(type: DatabaseType): string {
    switch (type) {
      case 'postgres':
        return 'PostgreSQL';
      case 'mysql':
        return 'MySQL';
      case 'oracle':
        return 'Oracle';
      case 'mssql':
        return 'SQL Server';
      case 'mongodb':
        return 'MongoDB';
      case 'hadoop':
        return 'Hadoop';
      case 'cassandra':
        return 'Cassandra';
      case 'vertica':
        return 'Vertica';
      default:
        return 'Database';
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.excelUpload = {
        fileName: this.selectedFile.name,
        fileSize: this.selectedFile.size,
        uploadDate: new Date(),
        fileData: this.selectedFile
      };
      this.startUploadProgress();
    }
  }

  removeUploadedFile(): void {
    this.selectedFile = null;
    this.excelUpload = null;
    this.uploadProgress = 0;
    this.isUploading = false;
    this.clearUploadProgress();
  }

  removeLicenseFile(): void {
    this.licenseFile = null;
    this.licenseFileName = '';
    this.licenseUploadProgress = 0;
    this.licenseIsUploading = false;
    this.clearLicenseUploadProgress();
  }

  private startUploadProgress(): void {
    this.clearUploadProgress();
    this.uploadProgress = 0;
    this.isUploading = true;

    this.uploadInterval = setInterval(() => {
      const step = Math.floor(Math.random() * 15) + 10;
      this.uploadProgress = Math.min(100, this.uploadProgress + step);

      if (this.uploadProgress >= 100) {
        this.finishUploadProgress();
      }
    }, 220);
  }

  private finishUploadProgress(): void {
    this.uploadProgress = 100;
    this.isUploading = false;
    this.clearUploadProgress();
  }

  private clearUploadProgress(): void {
    if (this.uploadInterval) {
      clearInterval(this.uploadInterval);
      this.uploadInterval = null;
    }
  }

  private startLicenseUploadProgress(): void {
    this.clearLicenseUploadProgress();
    this.licenseUploadProgress = 0;
    this.licenseIsUploading = true;

    this.licenseUploadInterval = setInterval(() => {
      const step = Math.floor(Math.random() * 15) + 10;
      this.licenseUploadProgress = Math.min(100, this.licenseUploadProgress + step);

      if (this.licenseUploadProgress >= 100) {
        this.finishLicenseUploadProgress();
      }
    }, 220);
  }

  private finishLicenseUploadProgress(): void {
    this.licenseUploadProgress = 100;
    this.licenseIsUploading = false;
    this.clearLicenseUploadProgress();
  }

  private clearLicenseUploadProgress(): void {
    if (this.licenseUploadInterval) {
      clearInterval(this.licenseUploadInterval);
      this.licenseUploadInterval = null;
    }
  }

  canProceedFromStep1(): boolean {
    // Step 1: License key upload
    return !!this.licenseFile;
  }

  canProceedFromStep2(): boolean {
    // Step 2: Data source configuration
    if (!this.agentRequirements) return false;
    
    if (this.agentRequirements.requiresDatabase) {
      return !!(
        this.selectedDatabaseType &&
        this.databaseConnection.host &&
        this.databaseConnection.database &&
        this.databaseConnection.username &&
        this.databaseConnection.password
      );
    }
    
    if (this.agentRequirements.requiresExcel) {
      return !!this.excelUpload;
    }
    
    return true;
  }

  canProceedFromStep3(): boolean {
    // Step 3: Third-party integrations
    if (!this.agentRequirements?.requiresThirdParty) return true;

    const requiredConnections = this.agentRequirements.thirdPartyConnections?.filter(c => c.required) || [];

    if (requiredConnections.length === 0) {
      return true;
    }

    return requiredConnections.every(requiredConnection => {
      const connectionData = this.thirdPartyConnections.find(
        connection => connection.connectionId === requiredConnection.id
      );

      if (!connectionData) {
        return false;
      }

      return !!(
        connectionData.connectionString &&
        connectionData.apiKey &&
        connectionData.topologyQuery
      );
    });
  }

  nextStep() {
    if (this.currentStep === 1 && this.canProceedFromStep1()) {
      this.currentStep++;
    } else if (this.currentStep === 2 && this.canProceedFromStep2()) {
      this.currentStep++;
    } else if (this.currentStep === 3 && this.canProceedFromStep3()) {
      this.showConfirmPopup = true;
    }
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    } else {
      this.router.navigate(['/integration']);
    }
  }

  onStep3Save(): void {
    if (!this.canProceedFromStep3()) {
      return;
    }
    this.showConfirmPopup = true;
  }

  confirmAndSave() {
    this.loading = true;
    this.error = null;
    
    // Simulate saving with timeout for better UX
    setTimeout(() => {
    if (this.isEditMode && this.editingIntegrationId) {
      // Update existing integration
        const existingIntegration = this.integrationStateService.getIntegrationById(this.editingIntegrationId);
        const updatedIntegration = {
          integrationId: this.editingIntegrationId,
          agentId: this.selectedAgentId,
          agentName: this.agentRequirements?.agentName || '',
          status: 'active' as const,
          lastSync: new Date(),
          createdAt: existingIntegration?.createdAt || new Date(),
          updatedAt: new Date(),
          databaseConnection: this.agentRequirements?.requiresDatabase ? this.databaseConnection : undefined,
          excelUpload: this.agentRequirements?.requiresExcel && this.excelUpload ? this.excelUpload : undefined,
          thirdPartyConnections: this.agentRequirements?.requiresThirdParty ? this.thirdPartyConnections : undefined
        };
        this.integrationStateService.updateIntegration(this.editingIntegrationId, updatedIntegration);
    } else {
      // Create new integration
        const now = new Date();
        const newIntegration = {
          integrationId: `integration-${Date.now()}`,
          agentId: this.selectedAgentId,
          agentName: this.agentRequirements?.agentName || '',
          status: 'active' as const,
          lastSync: now,
          createdAt: now,
          updatedAt: now,
          databaseConnection: this.agentRequirements?.requiresDatabase ? this.databaseConnection : undefined,
          excelUpload: this.agentRequirements?.requiresExcel && this.excelUpload ? this.excelUpload : undefined,
          thirdPartyConnections: this.agentRequirements?.requiresThirdParty ? this.thirdPartyConnections : undefined
        };
        this.integrationStateService.addIntegration(newIntegration);
      }
      
          this.loading = false;
      this.showConfirmPopup = false;
          this.router.navigate(['/integration']);
    }, 1500);
  }

  closePopup() {
    this.showConfirmPopup = false;
  }

  getStepTitle(): string {
    switch (this.currentStep) {
      case 1: return 'Upload License Key';
      case 2: return 'Select an Agent';
      case 3: return 'Configure Data Source';
      case 4: return 'Third Party Connections';
      default: return '';
    }
  }

  goToFields(): void {
    this.router.navigate(['/fields/tech']);
  }
}

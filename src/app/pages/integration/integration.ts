import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from "@angular/material/icon";
import { RouterModule, Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faChevronDown, faDatabase, faFileExcel, faPlug, faPlus } from '@fortawesome/free-solid-svg-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorLink, phosphorPencilSimpleLine, phosphorTrashSimple } from '@ng-icons/phosphor-icons/regular';
import { IntegrationDataSource } from '@shared/models/integration-data.model';
import { IntegrationStateService } from '@shared/services/integration-state.service';
import { Sidebar } from '@shared/components/sidebar/sidebar';
import { DEMO_AGENTS } from '@shared/constants/demo-data.constants';
import { Agent } from '@shared/models/demo-data.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-integration',
  imports: [CommonModule, MatIconModule, RouterModule, FontAwesomeModule, NgIcon, Sidebar],
  viewProviders: [provideIcons({ phosphorLink, phosphorPencilSimpleLine, phosphorTrashSimple })],
  templateUrl: './integration.html',
  styleUrl: './integration.scss'
})
export class Integration implements OnInit, OnDestroy {
  integrations: IntegrationDataSource[] = [];
  agents: Agent[] = [];
  expandedItems = new Set<string>();
  private integrationsSubscription?: Subscription;
  
  // FontAwesome icons
  faChevronDown = faChevronDown;
  faDatabase = faDatabase;
  faFileExcel = faFileExcel;
  faPlug = faPlug;
  faPlus = faPlus;

  constructor(
    private router: Router,
    private integrationStateService: IntegrationStateService
  ) {}

  ngOnInit() {
    // Subscribe to integrations from the state service
    this.integrationsSubscription = this.integrationStateService.integrations$.subscribe(
      integrations => {
        this.integrations = integrations;
        
        // Update agents list based on integrations
        const activeAgentIds = integrations.map(i => i.agentId);
        this.agents = DEMO_AGENTS.filter(a => activeAgentIds.includes(a.id));
      }
    );
  }

  ngOnDestroy() {
    if (this.integrationsSubscription) {
      this.integrationsSubscription.unsubscribe();
    }
  }

  toggleAccordion(integrationId: string): void {
    if (this.expandedItems.has(integrationId)) {
      this.expandedItems.delete(integrationId);
    } else {
      this.expandedItems.add(integrationId);
    }
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  getStatusClass(status: string): string {
    return `status-${status}`;
  }

  editIntegration(integration: IntegrationDataSource, event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/integration/new'], { 
      queryParams: { 
        edit: 'true', 
        integrationId: integration.integrationId 
      }
    });
  }

  deleteIntegration(integration: IntegrationDataSource, event: Event): void {
    event.stopPropagation();
    if (confirm(`Are you sure you want to delete the ${integration.agentName} integration?`)) {
      this.integrationStateService.deleteIntegration(integration.integrationId);
    }
  }

  goToFields(): void {
    this.router.navigate(['/fields/tech']);
  }
}

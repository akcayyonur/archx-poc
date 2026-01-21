import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, NgFor } from '@angular/common';
import { Router } from '@angular/router';
import { IntegrationStateService } from '@shared/services/integration-state.service';
import { Subscription } from 'rxjs';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { 
  phosphorArrowsClockwise, 
  phosphorChartBar, 
  phosphorDetective, 
  phosphorWarning, 
  phosphorBookOpen, 
  phosphorFileText, 
  phosphorCalendarCheck, 
  phosphorShieldCheck 
} from '@ng-icons/phosphor-icons/regular';

interface AiAgentCard {
  id: string;
  title: string;
  icon: string;
  isEnabled: boolean;
  isExpanded: boolean;
  subtitle: string;
  description: string;
}

@Component({
  selector: 'app-tech',
  imports: [CommonModule, NgIcon],
  viewProviders: [provideIcons({ 
    phosphorArrowsClockwise, 
    phosphorChartBar, 
    phosphorDetective, 
    phosphorWarning, 
    phosphorBookOpen, 
    phosphorFileText, 
    phosphorCalendarCheck, 
    phosphorShieldCheck 
  })],
  templateUrl: './tech.html',
  styleUrl: './tech.scss'
})
export class Tech implements OnInit, OnDestroy {
  private integrationsSubscription?: Subscription;
  
  constructor(
    private router: Router,
    private integrationStateService: IntegrationStateService
  ) {}

  aiAgentCards: AiAgentCard[] = [
    {
      id: 'request-fulfillment',
      title: 'Request Fulfillment',
      icon: 'phosphorArrowsClockwise',
      isEnabled: false,
      isExpanded: false,
      subtitle: 'Streamline service delivery.',
      description: 'Automates service request processing, manages fulfillment workflows, and ensures timely delivery of IT services.'
    },
    {
      id: 'capacity-forecast',
      title: 'Capacity & Forecast Agent',
      icon: 'phosphorChartBar',
      isEnabled: false,
      isExpanded: false,
      subtitle: 'Plan ahead with confidence.',
      description: 'Analyzes capacity trends, forecasts future demands, and provides actionable recommendations to optimize resources.'
    },
    {
      id: 'root-cause-analysis',
      title: 'Root Cause Analysis',
      icon: 'phosphorDetective',
      isEnabled: false,
      isExpanded: false,
      subtitle: 'Uncover the truth.',
      description: 'Investigates incidents systematically, identifies root causes, and provides detailed analysis reports for prevention.'
    },
    {
      id: 'change-risk',
      title: 'Change Risk (CHG-RISK)',
      icon: 'phosphorWarning',
      isEnabled: false,
      isExpanded: false,
      subtitle: 'Mitigate risks with confidence.',
      description: 'Assesses change impact, identifies potential risks, and provides mitigation strategies for safe deployments.'
    },
    {
      id: 'knowledge-writer',
      title: 'Knowledge Writer',
      icon: 'phosphorBookOpen',
      isEnabled: false,
      isExpanded: false,
      subtitle: 'Document with intelligence.',
      description: 'Automatically generates comprehensive documentation, knowledge base articles, and technical guides from your processes.'
    },
    {
      id: 'cab-scribe',
      title: 'CAB Scribe Agent',
      icon: 'phosphorFileText',
      isEnabled: false,
      isExpanded: false,
      subtitle: 'Streamline change management.',
      description: 'Automates Change Advisory Board processes, generates meeting minutes, and tracks approval workflows efficiently.'
    },
    {
      id: 'release-orchestrator',
      title: 'Release Orchestrator',
      icon: 'phosphorCalendarCheck',
      isEnabled: false,
      isExpanded: false,
      subtitle: 'Coordinate releases seamlessly.',
      description: 'Plans and coordinates complex release schedules, manages dependencies, and ensures smooth deployment pipelines.'
    },
    {
      id: 'deployment-validator',
      title: 'Deployment Validator',
      icon: 'phosphorShieldCheck',
      isEnabled: false,
      isExpanded: false,
      subtitle: 'Ensure deployment success.',
      description: 'Validates deployment configurations, runs pre-deployment checks, and monitors post-deployment health.'
    }
  ];

  ngOnInit(): void {
    // Subscribe to integrations and update card enabled status
    this.integrationsSubscription = this.integrationStateService.integrations$.subscribe(
      integrations => {
        const integratedAgentIds = integrations.map(i => i.agentId);
        
        // Update each card's isEnabled status based on whether it's integrated
        this.aiAgentCards.forEach(card => {
          card.isEnabled = integratedAgentIds.includes(card.id);
        });
        
        // Sort cards so enabled ones appear first
        this.aiAgentCards.sort((a, b) => {
          if (a.isEnabled && !b.isEnabled) return -1;
          if (!a.isEnabled && b.isEnabled) return 1;
          return 0;
        });
      }
    );
  }

  ngOnDestroy(): void {
    if (this.integrationsSubscription) {
      this.integrationsSubscription.unsubscribe();
    }
  }

  trackByCardId(index: number, card: AiAgentCard): string {
    return card.id;
  }

  toggleCardExpansion(card: AiAgentCard): void {
    // Close all other cards first
    this.aiAgentCards.forEach(c => {
      if (c.id !== card.id) {
        c.isExpanded = false;
      }
    });
    
    // Toggle the clicked card
    card.isExpanded = !card.isExpanded;
  }

  navigateToDashboard(): void {
    this.router.navigate(['/agents-overview']);
  }

  navigateToIntegration(): void {
    this.router.navigate(['/integration']);
  }

  navigateToPlatformSettings(): void {
    this.router.navigate(['/platform-settings']);
  }

  navigateToAgentHealth(agentId: string): void {
    this.router.navigate(['/agent-health', agentId]);
  }
}

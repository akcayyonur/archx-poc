import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { trigger, style, animate, transition } from '@angular/animations';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { 
  phosphorHouseDuotone, 
  phosphorSignOutDuotone, 
  phosphorCaretDownDuotone,
  phosphorAlignBottomDuotone,
  phosphorCirclesThreePlusDuotone,
  phosphorUserSwitchDuotone,
  phosphorSealWarningDuotone,
  phosphorUserCircleDashedDuotone
} from '@ng-icons/phosphor-icons/duotone';
import { 
  phosphorUser, 
  phosphorChartLineUp,
  phosphorEyeSlash,
  phosphorEye,
  phosphorGearSix,
  phosphorArrowCircleLeft,
  phosphorArrowCircleRight,
  phosphorCalendarBlank
} from '@ng-icons/phosphor-icons/regular';
import { Agent } from '../../models/demo-data.model';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, NgIcon],
  viewProviders: [provideIcons({ 
    phosphorHouse: phosphorHouseDuotone, 
    phosphorUserCircleDashed: phosphorUserCircleDashedDuotone, 
    phosphorUser, 
    phosphorGearSix, 
    phosphorSignOut: phosphorSignOutDuotone, 
    phosphorChartLineUp,
    phosphorCirclesThreePlus: phosphorCirclesThreePlusDuotone,
    phosphorUserSwitch: phosphorUserSwitchDuotone,
    phosphorSealWarning: phosphorSealWarningDuotone,
    phosphorCaretDown: phosphorCaretDownDuotone,
    phosphorArrowCircleLeft,
    phosphorArrowCircleRight,
    phosphorEye,
    phosphorAlignBottom: phosphorAlignBottomDuotone,
    phosphorCalendarBlank
  })],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
  animations: [
    trigger('submenuAnimation', [
      transition(':enter', [
        style({ height: 0, opacity: 0 }),
        animate('250ms cubic-bezier(0.4, 0.0, 0.2, 1)', style({ height: '*', opacity: 1 }))
      ]),
      transition(':leave', [
        style({ height: '*', opacity: 1 }),
        animate('250ms cubic-bezier(0.4, 0.0, 0.2, 1)', style({ height: 0, opacity: 0 }))
      ])
    ])
  ]
})
export class Sidebar {
  @Input() agents: Agent[] = [];
  @Input() activeAgentId: string = '';
  
  isExpanded: boolean = false;
  isManageAgentsExpanded: boolean = false;
  isPlatformManagementExpanded: boolean = false;
  currentUserName: string = 'User';
  currentUserRole: string = 'Admin';

  constructor(private router: Router) {}

  isRouteActive(route: string, exact: boolean = false): boolean {
    return this.router.isActive(route, {
      paths: exact ? 'exact' : 'subset',
      queryParams: 'ignored',
      fragment: 'ignored',
      matrixParams: 'ignored'
    });
  }

  toggleSidebar(): void {
    this.isExpanded = !this.isExpanded;
  }

  toggleManageAgents(): void {
    if (!this.isExpanded) {
      this.navigateToAgentsOverview();
      return;
    }
    this.isManageAgentsExpanded = !this.isManageAgentsExpanded;
  }

  togglePlatformManagement(): void {
    if (!this.isExpanded) {
      this.navigateToPlatformDashboard();
      return;
    }
    this.isPlatformManagementExpanded = !this.isPlatformManagementExpanded;
  }

  private collapseAndNavigate(route: string[]): void {
    this.isExpanded = false;
    this.isManageAgentsExpanded = false;
    this.isPlatformManagementExpanded = false;
    this.router.navigate(route);
  }

  navigateToHome(): void {
    this.collapseAndNavigate(['/fields/tech']);
  }

  navigateToAgentsOverview(): void {
    this.collapseAndNavigate(['/agents-overview']);
  }

  navigateToAgent(agentId: string): void {
    this.isExpanded = false;
    this.isManageAgentsExpanded = false;
    this.isPlatformManagementExpanded = false;
    if (agentId === 'root-cause-analysis') {
      this.router.navigate(['/agent-core', agentId]);
    } else {
      this.router.navigate(['/agent-health', agentId]);
    }
  }

  navigateToIntegration(): void {
    this.collapseAndNavigate(['/integration']);
  }

  navigateToPlatformDashboard(): void {
    this.collapseAndNavigate(['/platform-settings']);
  }

  navigateToUserManagement(): void {
    this.collapseAndNavigate(['/platform-settings']);
  }

  navigateToReporting(): void {
    this.collapseAndNavigate(['/platform-settings']);
  }

  navigateToSecurity(): void {
    this.collapseAndNavigate(['/platform-settings']);
  }

  navigateToCertificates(): void {
    this.collapseAndNavigate(['/platform-settings']);
  }

  navigateToLicence(): void {
    this.collapseAndNavigate(['/platform-settings']);
  }

  navigateToOperationalInsights(): void {
    this.collapseAndNavigate(['/anomaly-insights']);
  }

  navigateToSchedules(): void {
    this.collapseAndNavigate(['/schedules']);
  }

  logout(): void {
    this.router.navigate(['/landing']);
  }
}


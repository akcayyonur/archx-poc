import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { Sidebar } from '@shared/components/sidebar/sidebar';
import { NgIcon, provideIcons } from '@ng-icons/core';

import { phosphorMagnifyingGlassBold } from '@ng-icons/phosphor-icons/bold';
import { phosphorCaretLeft, phosphorCube, phosphorShareFat, phosphorCheck, phosphorEnvelope, phosphorTrendUp, phosphorTrendDown } from '@ng-icons/phosphor-icons/regular';
import { ActivatedRoute, Router } from '@angular/router';

interface Metric {
  name: string;
  value: string;
  subValue: string;
  subLabel?: string;
  lastCollected: string;
}

interface Anomaly {
  name: string;
  status: 'Critical' | 'High' | 'Moderate' | 'Idle';
  team: string;
  application: string;
  date: string;
}

interface RecurringAnomaly {
  name: string;
  trend: 'up' | 'down';
  count: number;
  timeframe: string;
}

@Component({
  selector: 'app-entity-insights',
  imports: [CommonModule, Sidebar, FormsModule, DatePickerModule, NgIcon, DialogModule, SelectModule, TextareaModule],
  viewProviders: [provideIcons({ phosphorCaretLeft, phosphorMagnifyingGlassBold, phosphorCube, phosphorShareFat, phosphorCheck, phosphorEnvelope, phosphorTrendUp, phosphorTrendDown })],
  templateUrl: './entity-insights.html',
  styleUrl: './entity-insights.scss',
})
export class EntityInsights implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  entityId: string = '';
  entityType: 'db' | 'service' | 'queue' | 'unknown' = 'unknown';
  
  // Route State Data
  anomalyData: any = null;

  dateRange: { start: Date | null; end: Date | null } = {
    start: EntityInsights.parseDateTime('04.09.2024 07:00'),
    end: EntityInsights.parseDateTime('04.09.2024 17:00')
  };

  metrics: Metric[] = [];
  anomalies: Anomaly[] = [];
  recurringAnomalies: RecurringAnomaly[] = [];
  chartPoints: any[] = [];

  // Forward Anomaly Popup
  showForwardPopup = false;
  forwardOptions = ['Email', 'Jira', 'Slack', 'Microsoft Teams'];
  selectedForwardOptions: string[] = [];

  toggleForwardPopup() {
    this.showForwardPopup = !this.showForwardPopup;
  }

  toggleForwardOption(option: string) {
    const index = this.selectedForwardOptions.indexOf(option);
    if (index > -1) {
      this.selectedForwardOptions.splice(index, 1);
    } else {
      this.selectedForwardOptions.push(option);
    }
  }

  confirmForward() {
    console.log('Forwarding anomaly via:', this.selectedForwardOptions);
    this.showForwardPopup = false;
    this.selectedForwardOptions = [];
  }



  ngOnInit() {
    // Get entity ID from route params
    this.route.params.subscribe(params => {
      this.entityId = params['entityId'];
      this.determineEntityType(this.entityId);
      this.generateMetrics();
      this.generateAnomalies();
      this.generateChartData();
    });

    // Get passed state data (e.g. specific anomaly that triggered navigation)
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
        this.anomalyData = navigation.extras.state['anomalyData'];
    }
  }

  private determineEntityType(id: string) {
    const lowerId = id.toLowerCase();
    if (lowerId.includes('db') || lowerId.includes('oracle') || lowerId.includes('mongo') || lowerId.includes('redis')) {
        this.entityType = 'db';
    } else if (lowerId.includes('service') || lowerId.includes('api') || lowerId.includes('platform')) {
        this.entityType = 'service';
    } else if (lowerId.includes('queue') || lowerId.includes('kafka') || lowerId.includes('rabbit')) {
        this.entityType = 'queue';
    } else {
        this.entityType = 'service'; // Default
    }
  }

  private generateMetrics() {
    if (this.entityType === 'db') {
        this.metrics = [
            {
                name: 'Connection Pool',
                value: '87%',
                subValue: 'Peak 92%',
                lastCollected: '1 min ago'
            },
            {
                name: 'Cache Hit Ratio',
                value: '94%',
                subValue: '2.4k ops/sec',
                lastCollected: '2 min ago'
            },
            {
                name: 'Disk I/O',
                value: '450',
                subValue: 'MB/s write',
                subLabel: 'Throughput',
                lastCollected: '1 min ago'
            }
        ];
    } else if (this.entityType === 'queue') {
         this.metrics = [
            {
                name: 'Consumer Lag',
                value: '1.2k',
                subValue: '+12% vs avg',
                lastCollected: '30 sec ago'
            },
            {
                name: 'Throughput',
                value: '5.4k',
                subValue: 'msgs/sec',
                lastCollected: '1 min ago'
            },
            {
                name: 'DLQ Depth',
                value: '12',
                subValue: 'Messages',
                subLabel: 'Dead Letter',
                lastCollected: '5 min ago'
            }
        ];
    } else {
        // Default Service Metrics
        this.metrics = [
            {
                name: 'Error Rate',
                value: '2.4%',
                subValue: 'Peak 5.1%',
                lastCollected: '2 min ago'
            },
            {
                name: 'Memory Usage',
                value: '74%',
                subValue: '11.2gb / 16gb',
                subLabel: 'Used',
                lastCollected: '4 min ago'
            },
            {
                name: 'Response Time',
                value: '230',
                subValue: 'ms (p95)',
                subLabel: 'Latency',
                lastCollected: '1 min ago'
            }
        ];
    }
  }

  private generateAnomalies() {
    // If we have incoming anomaly data, use it as the top entry
    const baseDate = '04.09.2024';
    
    this.anomalies = [
        { 
            name: this.anomalyData?.anomaly || 'Latency Spike', 
            status: (this.anomalyData?.severity?.toLowerCase() === 'critical' ? 'Critical' : 'High') as any, 
            team: 'Platform', 
            application: this.entityId, 
            date: baseDate 
        },
        { name: 'Memory Leak', status: 'Moderate', team: 'Platform', application: this.entityId, date: baseDate },
        { name: 'Connection Timeout', status: 'Moderate', team: 'Platform', application: this.entityId, date: baseDate },
        { name: 'High CPU', status: 'Idle', team: 'Platform', application: this.entityId, date: baseDate }
    ];

    this.recurringAnomalies = [
        { name: this.anomalyData?.anomaly || 'Latency Spike', trend: 'up', count: 4, timeframe: 'in the last 24h' },
        { name: 'Memory Leak', trend: 'down', count: 2, timeframe: 'in the last 24h' },
        { name: 'Connection Timeout', trend: 'up', count: 5, timeframe: 'in the last 7 days' },
        { name: 'High CPU', trend: 'up', count: 3, timeframe: 'in the last 24h' }
    ];
  }

  private generateChartData() {
    // Mock data for the chart visualization matching the style
    this.chartPoints = [
        { time: '07:00', level: 'Moderate', color: '#C8E972' }, // Lime/Green
        { time: '10:00', level: 'Moderate', color: '#C8E972' },
        { time: '12:00', level: 'Idle', color: '#EBEBF5' }, // Whiteish
        { time: '14:00', level: 'Critical', color: '#FF6B6B' }, // Red
        { time: '16:00', level: 'Critical', color: '#FF6B6B' },
        { time: '18:00', level: 'High', color: '#FFD166' }, // Orange/Yellow
        { time: '20:00', level: 'Moderate', color: '#C8E972' }
    ];
  }

  // Dialog Properties
  // Dialog Properties
  forwardDialogVisible: boolean = false;
  
  // Data for the dialog form
  dialogData = {
    title: '',
    severity: '',
    assignedTeam: '',
    status: '',
    application: ''
  };

  availableTeams = ['Platform', 'SRE', 'DevOps', 'Product', 'DBA'];
  severityOptions = ['Critical', 'High', 'Moderate'];

  openForwardDialog() {
      // Initialize with default values for a new forward action
      this.dialogData = {
          title: '', // User enters the title
          severity: 'Critical', // Default severity
          assignedTeam: 'Platform',
          status: 'Open',
          application: this.entityId
      };
      this.forwardDialogVisible = true;
  }

  closeForwardDialog() {
      this.forwardDialogVisible = false;
  }

  submitForward() {
      if (!this.dialogData.title) return; // Basic validation

      // Add the new anomaly to the list
      const newAnomaly: Anomaly = {
          name: this.dialogData.title,
          status: this.dialogData.severity as any,
          team: this.dialogData.assignedTeam,
          application: this.dialogData.application,
          date: 'Just now' // Or current date
      };

      // Add to the beginning of the list
      this.anomalies.unshift(newAnomaly);

      console.log('Forwarding anomaly:', this.dialogData);
      this.closeForwardDialog();
  }

  navigateToOperationalInsights() {
    this.router.navigate(['/anomaly-insights']);
  }



  private static parseDateTime(value: string): Date | null {
    const trimmed = value.trim();
    const [datePart, timePart] = trimmed.split(' ');

    if (!datePart || !timePart) {
      return null;
    }

    const [day, month, year] = datePart.split('.').map(Number);
    const [hour, minute] = timePart.split(':').map(Number);
    const parsed = new Date(year, (month ?? 1) - 1, day, hour, minute);

    return isNaN(parsed.getTime()) ? null : parsed;
  }
}

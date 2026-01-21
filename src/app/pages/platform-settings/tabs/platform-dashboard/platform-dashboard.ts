import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorHardDrives, phosphorCpu, phosphorMemory, phosphorGlobe } from '@ng-icons/phosphor-icons/regular';

@Component({
  selector: 'app-platform-dashboard',
  standalone: true,
  imports: [CommonModule, NgIcon],
  viewProviders: [provideIcons({ phosphorHardDrives, phosphorCpu, phosphorMemory, phosphorGlobe })],
  templateUrl: './platform-dashboard.html',
  styleUrl: './platform-dashboard.scss'
})
export class PlatformDashboard {
  metrics = [
    { 
      title: 'System Uptime', 
      value: '99.9%', 
      subtext: '', 
      barColor: '#7B61FF' 
    },
    { 
      title: 'Avg Load Time', 
      value: '1.2 S', 
      subtext: 'Peak: 3.5s', 
      barColor: '#5E4B76' 
    },
    { 
      title: 'Active Users', 
      value: '28/45', 
      subtext: 'Today\nPeak concurrent: 42', 
      barColor: '#5F7338' 
    },
    { 
      title: 'Total Sessions', 
      value: '1250', 
      subtext: 'Avg: 45 min', 
      barColor: '#9C5840' 
    },
    { 
      title: 'Active Integrations', 
      value: '10/12', 
      subtext: '', 
      barColor: '#7B61FF' 
    },
    { 
      title: 'Data Volume', 
      value: '2.5TB', 
      subtext: 'Growth +15%', 
      barColor: '#5E4B76' 
    },
    { 
      title: 'API Calls Today', 
      value: '28/45', 
      subtext: 'Total 1,250,000', 
      barColor: '#5F7338' 
    },
    { 
      title: 'Success Rate', 
      value: '99.2%', 
      subtext: 'Response: 125ms', 
      barColor: '#9C5840' 
    }
  ];

  usageMetrics = [
    {
      title: 'Storage Usage',
      icon: 'phosphorHardDrives',
      subtext: '2.5 TB / 5 TB',
      percent: 50,
      color: '#6B46C1', // Purple
      type: 'progress'
    },
    {
      title: 'CPU Usage',
      icon: 'phosphorCpu',
      subtext: '',
      percent: 45,
      color: '#6B46C1',
      type: 'progress'
    },
    {
      title: 'Memory Usage',
      icon: 'phosphorMemory', 
      subtext: '',
      percent: 62,
      color: '#6B46C1',
      type: 'progress'
    },
    {
      title: 'Network Traffic (24h)',
      icon: 'phosphorGlobe',
      value: '125 gb',
      subtext: '',
      type: 'text'
    }
  ];

  operationsData = [
    {
      title: 'System Operations',
      barGradient: 'linear-gradient(180deg, #7B61FF 0%, rgba(123, 97, 255, 0.2) 100%)', // Purple gradient
      actions: [
        'Restart API Server',
        'Restart ETL Service',
        'Clear System Cache',
        'Database maintenance'
      ]
    },
    {
      title: 'Monitoring & Operations',
      barGradient: 'linear-gradient(180deg, #E2E8F0 0%, rgba(226, 232, 240, 0.2) 100%)', // White/Grey gradient
      actions: [
        'View system logs',
        'Security Audit'
      ]
    }
  ];
}

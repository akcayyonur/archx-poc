import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { Sidebar } from '@shared/components/sidebar/sidebar';
import { 
  phosphorPause, 
  phosphorPlay, 
  phosphorQueue, 
  phosphorCheckCircle, 
  phosphorWarning, 
  phosphorProhibit, 
  phosphorShieldWarning,
  phosphorClockCounterClockwise,
  phosphorPencilSimple,
  phosphorTrash,
  phosphorStar,
  phosphorCalendarBlank
} from '@ng-icons/phosphor-icons/regular';

interface ScheduleTask {
  tag: string;
  script: string;
  timeZone: string;
  startTime: string;
  interval: string;
  duration: string;
  lastRunTime: string;
  status: string;
}

@Component({
  selector: 'app-schedules',
  standalone: true,
  imports: [CommonModule, NgIcon, Sidebar],
  viewProviders: [provideIcons({ 
    phosphorPause, 
    phosphorPlay, 
    phosphorQueue, 
    phosphorCheckCircle, 
    phosphorWarning, 
    phosphorProhibit, 
    phosphorShieldWarning,
    phosphorClockCounterClockwise,
    phosphorPencilSimple,
    phosphorTrash,
    phosphorStar,
    phosphorCalendarBlank
  })],
  templateUrl: './schedules.html',
  styleUrl: './schedules.scss'
})
export class Schedules {
  taskStats = {
    pendingTasks: 3,
    runningTasks: 1,
    batchRunningTasks: 0,
    doneTasks: 134,
    failedTasks: 3,
    upstreamFailure: 1,
    disabledTasks: 0,
    upstreamDisabled: 134
  };

  scheduleData: ScheduleTask[] = [
    {
      tag: "ETL_PROD",
      script: "daily_sales_etl.py",
      timeZone: "Europe/Istanbul",
      startTime: "02:00",
      interval: "daily",
      duration: "45m",
      lastRunTime: "2026-01-22 02:00:15",
      status: "done" // yeşil
    },
    {
      tag: "DATA_SYNC",
      script: "customer_sync.py",
      timeZone: "Europe/Istanbul",
      startTime: "Every 30 min",
      interval: "30min",
      duration: "12m",
      lastRunTime: "2026-01-22 14:30:08",
      status: "running" // turuncu/kırmızı
    },
    {
      tag: "REPORT_GEN",
      script: "weekly_report.py",
      timeZone: "Europe/Istanbul",
      startTime: "08:00",
      interval: "weekly",
      duration: "2h 15m",
      lastRunTime: "2026-01-20 08:00:00",
      status: "pending" // mor
    },
    {
      tag: "DB_BACKUP",
      script: "backup_databases.sh",
      timeZone: "UTC",
      startTime: "01:00",
      interval: "daily",
      duration: "1h 30m",
      lastRunTime: "2026-01-22 01:00:00",
      status: "failed" // kırmızı
    },
    {
      tag: "API_IMPORT",
      script: "import_external_data.py",
      timeZone: "Europe/Istanbul",
      startTime: "Every 15 min",
      interval: "15min",
      duration: "5m",
      lastRunTime: "2026-01-22 14:45:22",
      status: "running"
    },
    {
      tag: "BATCH_PROC",
      script: "process_orders.py",
      timeZone: "Europe/Istanbul",
      startTime: "03:00",
      interval: "daily",
      duration: "3h 20m",
      lastRunTime: "2026-01-22 03:00:00",
      status: "batch_running" // purple
    },
    {
      tag: "ML_TRAIN",
      script: "train_model.py",
      timeZone: "Europe/Istanbul",
      startTime: "22:00",
      interval: "weekly",
      duration: "4h",
      lastRunTime: "2026-01-21 22:00:00",
      status: "done"
    },
    {
      tag: "CLEANUP",
      script: "cleanup_old_logs.sh",
      timeZone: "UTC",
      startTime: "04:00",
      interval: "daily",
      duration: "10m",
      lastRunTime: "2026-01-22 04:00:00",
      status: "upstream_failure" // kırmızı uyarı
    },
    {
      tag: "ANALYTICS",
      script: "update_analytics.py",
      timeZone: "Europe/Istanbul",
      startTime: "Hourly",
      interval: "hourly",
      duration: "8m",
      lastRunTime: "2026-01-22 14:00:00",
      status: "disabled" // gri
    },
    {
      tag: "NOTIFY",
      script: "send_daily_alerts.py",
      timeZone: "Europe/Istanbul",
      startTime: "09:00",
      interval: "daily",
      duration: "2m",
      lastRunTime: "2026-01-22 09:00:00",
      status: "upstream_disabled" // mavi
    },
    {
      tag: "CACHE_REF",
      script: "refresh_cache.py",
      timeZone: "Europe/Istanbul",
      startTime: "Every 5 min",
      interval: "5min",
      duration: "1m",
      lastRunTime: "2026-01-22 14:50:00",
      status: "done"
    }
  ];

  getStatusClass(status: string): string {
    return status.replace('_', '-');
  }
}

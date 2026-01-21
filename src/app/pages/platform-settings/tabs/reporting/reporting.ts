import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { 
  phosphorArrowSquareUp,
  phosphorCaretDown,
  phosphorCalendar
} from '@ng-icons/phosphor-icons/regular';

@Component({
  selector: 'app-reporting',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePickerModule, NgIcon],
  viewProviders: [provideIcons({ 
    phosphorArrowSquareUp,
    phosphorCaretDown,
    phosphorCalendar
  })],
  templateUrl: './reporting.html',
  styleUrl: './reporting.scss'
})
export class Reporting {
  selectedReportType: string = 'system-overview';
  
  reportTypes = [
    { value: 'system-overview', label: 'System Overview Report' },
    { value: 'performance', label: 'Performance Report' },
    { value: 'anomaly', label: 'Anomaly Report' },
    { value: 'usage', label: 'Usage Report' }
  ];

  dateRange: { start: Date | null; end: Date | null } = {
    start: this.parseDate('27.11.2025'),
    end: this.parseDate('04.11.2025')
  };

  private parseDate(value: string): Date | null {
    const trimmed = value.trim();
    if (!trimmed) {
      return null;
    }

    const [day, month, year] = trimmed.split('.').map(Number);
    const parsed = new Date(year, (month ?? 1) - 1, day);
    return isNaN(parsed.getTime()) ? null : parsed;
  }

  exportReport(): void {
    // Export functionality will be implemented here
    console.log('Exporting report:', {
      type: this.selectedReportType,
      dateRange: this.dateRange
    });
  }
}



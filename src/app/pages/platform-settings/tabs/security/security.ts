import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorArrowSquareUp } from '@ng-icons/phosphor-icons/regular';

@Component({
  selector: 'app-security',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIcon],
  viewProviders: [provideIcons({ 
    phosphorArrowSquareUp
  })],
  templateUrl: './security.html',
  styleUrl: './security.scss'
})
export class Security {
  passwordPolicy = {
    minLength: null as number | null,
    expiryDays: null as number | null,
    requireUppercase: false,
    requireUppercase2: false,
    requireUppercase3: false
  };

  sessionAuth = {
    sessionTimeout: null as number | null,
    requireUppercase: false
  };

  kvkkCompliance = {
    dataRetentionPeriod: '',
    enabled: false
  };

  saveSettings(): void {
    console.log('Saving settings:', {
      passwordPolicy: this.passwordPolicy,
      sessionAuth: this.sessionAuth,
      kvkkCompliance: this.kvkkCompliance
    });
  }

  runSecurityAudit(): void {
    console.log('Running security audit...');
  }

  exportKvkkData(): void {
    console.log('Exporting KVKK data...');
  }
}

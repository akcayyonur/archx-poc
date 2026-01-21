import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorAddressBook } from '@ng-icons/phosphor-icons/regular';
import { Sidebar } from '@shared/components/sidebar/sidebar';

@Component({
  selector: 'app-platform-settings',
  imports: [
    CommonModule,
    RouterModule,
    NgIcon,
    Sidebar
  ],
  viewProviders: [provideIcons({ phosphorAddressBook })],
  templateUrl: './platform-settings.html',
  styleUrl: './platform-settings.scss',
})
export class PlatformSettings {
}

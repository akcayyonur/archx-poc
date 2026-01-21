import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-config-navbar',
  imports: [MatIconModule, RouterModule],
  templateUrl: './config-navbar.html',
  styleUrl: './config-navbar.scss'
})
export class ConfigNavbar {
  isDropdownOpen = false;

  constructor(private authService: AuthService, private router: Router) {}

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  onUserSettings(): void {
    // User settings functionality - currently does nothing as requested
    this.isDropdownOpen = false;
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
    this.isDropdownOpen = false;
  }
}

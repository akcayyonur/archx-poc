import { Component, inject, effect, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '@app/shared/services/auth.service';
import { TranslationService } from '@app/shared/services/translation.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faChevronLeft, faChevronDown, faCheck } from '@fortawesome/free-solid-svg-icons';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, FontAwesomeModule, MatDividerModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  private router = inject(Router);
  private authService = inject(AuthService);
  protected translationService = inject(TranslationService);
  
  email: string = '';
  password: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';
  faChevronLeft = faChevronLeft;
  faChevronDown = faChevronDown;

  languages = this.translationService.getAvailableLanguages();
  selectedLanguage: string = this.translationService.getLanguage();
  isDropdownOpen: boolean = false;

  // Make translation reactive by using computed
  currentLanguage = this.translationService.currentLanguage;

  constructor() {
    // Update selectedLanguage when language changes
    effect(() => {
      this.selectedLanguage = this.translationService.currentLanguage();
    });
  }

  // Translation helper method
  t(key: string): string {
    // Access the signal to make it reactive
    this.currentLanguage();
    return this.translationService.translate(key);
  }

  onLanguageChange(languageCode: 'en' | 'tr') {
    this.translationService.setLanguage(languageCode);
    this.selectedLanguage = languageCode;
    this.isDropdownOpen = false;
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  getSelectedLanguage() {
    return this.languages.find(lang => lang.code === this.selectedLanguage) || this.languages[0];
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.language-selector')) {
      this.isDropdownOpen = false;
    }
  }

  onLogin() {
    if (!this.email || !this.password) {
      this.errorMessage = this.t('login.errorRequired');
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login({
      email: this.email,
      password: this.password
    }).subscribe({
      next: (response) => {
        console.log('Login successful:', response);
        // Redirect based on user's field value
        switch (response.field) {
          case 'tech':
            this.router.navigate(['/fields/tech']);
            break;
          case 'business':
            this.router.navigate(['/fields/business']);
            break;
          case 'operations':
            this.router.navigate(['/fields/operations']);
            break;
          case 'security':
            this.router.navigate(['/fields/security']);
            break;
          default:
            // Default to dashboard for other fields or if field is not specified
            this.router.navigate(['/fields/tech']);
            break;
        }
      },
      error: (error) => {
        console.error('Login failed:', error);
        this.errorMessage = this.t('login.errorInvalid');
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  goToLanding() {
    this.router.navigate(['/landing']);
  }

  navigateToSignUp() {
    this.router.navigate(['/signup']);
  }

}

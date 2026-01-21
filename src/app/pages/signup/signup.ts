import { Component, inject, effect, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '@app/shared/services/auth.service';
import { TranslationService } from '@app/shared/services/translation.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faChevronDown, faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [FormsModule, CommonModule, FontAwesomeModule, MatDividerModule],
  templateUrl: './signup.html',
  styleUrl: './signup.scss'
})
export class Signup {
  private router = inject(Router);
  private authService = inject(AuthService);
  protected translationService = inject(TranslationService);
  
  isLoading: boolean = false;
  errorMessage: string = '';
  faChevronLeft = faChevronLeft;
  faChevronDown = faChevronDown;
  
  // Signup fields
  firstName: string = '';
  lastName: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  field: string = '';
  company: string = '';
  country: string = '';
  city: string = '';
  organizationalUnit: string = '';
  phone: string = '';
  notes: string = '';
  role: string = '';
  phoneCountryCode: string = '';
  phoneNumber: string = '';
  selectedCountryCode: string = '';
  private readonly fieldOptionKeys = [
    { value: 'aviation', labelKey: 'landing.aviation' },
    { value: 'energy', labelKey: 'landing.energy' },
    { value: 'banking', labelKey: 'landing.banking' },
    { value: 'technology', labelKey: 'landing.technology' },
    { value: 'retail', labelKey: 'landing.retail' },
    { value: 'telecom', labelKey: 'landing.telecom' },
    { value: 'insurance', labelKey: 'landing.insurance' }
  ];
  countryOptions = [
    { code: 'US', name: 'United States', dialCode: '+1' },
    { code: 'TR', name: 'Turkey', dialCode: '+90' },
    { code: 'GB', name: 'United Kingdom', dialCode: '+44' },
    { code: 'DE', name: 'Germany', dialCode: '+49' },
    { code: 'FR', name: 'France', dialCode: '+33' },
    { code: 'ES', name: 'Spain', dialCode: '+34' },
    { code: 'IT', name: 'Italy', dialCode: '+39' },
    { code: 'CA', name: 'Canada', dialCode: '+1' },
    { code: 'AE', name: 'United Arab Emirates', dialCode: '+971' },
    { code: 'SA', name: 'Saudi Arabia', dialCode: '+966' }
  ];
  
  languages = this.translationService.getAvailableLanguages();
  selectedLanguage: string = this.translationService.getLanguage();
  isDropdownOpen: boolean = false;

  constructor() {
    // Update selectedLanguage when language changes
    effect(() => {
      this.selectedLanguage = this.translationService.currentLanguage();
    });
  }

  // Translation helper method
  t(key: string): string {
    return this.translationService.translate(key);
  }

  get fieldOptions() {
    return this.fieldOptionKeys.map(option => ({
      value: option.value,
      label: this.translationService.translate(option.labelKey)
    }));
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
  goToLanding() {
    this.router.navigate(['/landing']);
  }

  navigateToSignIn() {
    this.router.navigate(['/login']);
  }

  onSignUp() {
    this.updatePhone();

    if (!this.firstName || !this.lastName || !this.email || !this.password || !this.confirmPassword ||
        !this.field || !this.company || !this.country || !this.city || !this.role || !this.organizationalUnit || !this.phone || !this.notes) {
      this.errorMessage = this.t('signup.errorFillAll');
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = this.t('signup.errorPasswordMatch');
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.register({
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      password: this.password,
      field: this.field,
      company: this.company,
      country: this.country,
      city: this.city,
      organizationalUnit: this.organizationalUnit,
      phone: this.phone,
      notes: this.notes,
      role: this.role
    }).subscribe({
      next: (response) => {
        console.log('Signup successful:', response);
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
            this.router.navigate(['/fields/tech']);
            break;
        }
      },
      error: (error) => {
        console.error('Signup failed:', error);
        this.errorMessage = error?.message || this.t('signup.errorSignupFailed');
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  onCountrySelectionChange(countryCode: string) {
    const selected = this.countryOptions.find(option => option.code === countryCode);
    if (selected) {
      this.country = selected.name;
      this.phoneCountryCode = selected.dialCode;
      this.updatePhone();
    } else {
      this.country = '';
    }
  }

  updatePhone() {
    const parts = [this.phoneCountryCode?.trim(), this.phoneNumber?.trim()].filter(part => !!part);
    this.phone = parts.join(' ');
  }
}


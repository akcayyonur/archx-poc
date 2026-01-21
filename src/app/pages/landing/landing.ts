import { Component, ViewChild, inject, effect, computed, HostListener, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslationService } from '@app/shared/services/translation.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { 
  phosphorAirplaneTakeoff, 
  phosphorLightning, 
  phosphorBank, 
  phosphorCpu, 
  phosphorShoppingCart, 
  phosphorPhone, 
  phosphorShieldCheck 
} from '@ng-icons/phosphor-icons/regular';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, FormsModule, FontAwesomeModule, NgIcon],
  viewProviders: [provideIcons({ 
    phosphorAirplaneTakeoff, 
    phosphorLightning, 
    phosphorBank, 
    phosphorCpu, 
    phosphorShoppingCart, 
    phosphorPhone, 
    phosphorShieldCheck 
  })],
  templateUrl: './landing.html',
  styleUrls: ['./landing.scss']
})
export class Landing {
  private router = inject(Router);
  protected translationService = inject(TranslationService);
  
  faChevronDown = faChevronDown;
  currentLanguage = this.translationService.currentLanguage;
  languages = this.translationService.getAvailableLanguages();
  selectedLanguage: string = this.translationService.getLanguage();
  isDropdownOpen: boolean = false;

  // Translation helper method
  t(key: string): string {
    this.currentLanguage();
    return this.translationService.translate(key);
  }

  // Feature cards - computed based on current language
  featureCards = computed(() => {
    const lang = this.currentLanguage();
    return [
      {
        title: this.translationService.translate('landing.aviation'),
        description: this.translationService.translate('landing.aviationDescription'),
        icon: 'phosphorAirplaneTakeoff'
      },
      {
        title: this.translationService.translate('landing.energy'),
        description: this.translationService.translate('landing.energyDescription'),
        icon: 'phosphorLightning'
      },
      {
        title: this.translationService.translate('landing.banking'),
        description: this.translationService.translate('landing.bankingDescription'),
        icon: 'phosphorBank'
      },
      {
        title: this.translationService.translate('landing.technology'),
        description: this.translationService.translate('landing.technologyDescription'),
        icon: 'phosphorCpu'
      },
      {
        title: this.translationService.translate('landing.retail'),
        description: this.translationService.translate('landing.retailDescription'),
        icon: 'phosphorShoppingCart'
      },
      {
        title: this.translationService.translate('landing.telecom'),
        description: this.translationService.translate('landing.telecomDescription'),
        icon: 'phosphorPhone'
      },
      {
        title: this.translationService.translate('landing.insurance'),
        description: this.translationService.translate('landing.insuranceDescription'),
        icon: 'phosphorShieldCheck'
      }
    ];
  });

  // Updates - computed based on current language
  updates = computed(() => {
    const lang = this.currentLanguage();
    return [
      {
        title: this.translationService.translate('landing.ourMissionIs'),
        description: this.translationService.translate('landing.missionDescription')
      },
      {
        title: this.translationService.translate('landing.ourVisionIs'),
        description: this.translationService.translate('landing.visionDescription')
      },
      {
        title: this.translationService.translate('landing.ourValuesAre'),
        description: this.translationService.translate('landing.valuesDescription')
      },
      {
        title: this.translationService.translate('landing.ourApproachIs'),
        description: this.translationService.translate('landing.approachDescription')
      }
    ];
  });

  selectedUpdate = computed(() => this.updates()[this.activeIndex()]);
  activeIndex = signal(0);

  constructor() {
    effect(() => {
      this.selectedLanguage = this.translationService.currentLanguage();
    });
  }

  selectUpdate(index: number): void {
    this.activeIndex.set(index);
  }

  onLanguageChange(languageCode: 'en' | 'tr') {
    this.translationService.setLanguage(languageCode);
    this.selectedLanguage = languageCode;
    this.isDropdownOpen = false;
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  closeDropdown() {
    this.isDropdownOpen = false;
  }

  getSelectedLanguage() {
    return this.languages.find(lang => lang.code === this.selectedLanguage) || this.languages[0];
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.footer-language-dropdown')) {
      this.isDropdownOpen = false;
    }
  }

  navigateToSignIn(): void {
    this.router.navigate(['/login']);
  }

  navigateToSignUp(): void {
    this.router.navigate(['/signup']);
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  trackBySlideId(index: number, slide: any): number {
    return slide.id;
  }

 

}

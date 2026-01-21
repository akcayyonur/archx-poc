import { Injectable, signal } from '@angular/core';
import { en } from '../translations/en';
import { tr } from '../translations/tr';

export type Language = 'en' | 'tr';
export type TranslationKey = string;

export interface Translations {
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private translations: Record<Language, Translations> = {
    en,
    tr
  };

  // Signal for reactive language changes
  currentLanguage = signal<Language>('en');

  constructor() {
    // Load saved language from localStorage if available
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'tr')) {
      this.currentLanguage.set(savedLanguage);
    } else {
      const browserLanguage = typeof window !== 'undefined'
        ? (window.navigator.languages?.[0] || window.navigator.language || '')
        : '';
      const normalized = browserLanguage.slice(0, 2).toLowerCase();
      if (normalized === 'tr') {
        this.currentLanguage.set('tr');
      } else {
        this.currentLanguage.set('en');
      }
    }
  }

  /**
   * Get translation for a given key
   * @param key - Translation key (e.g., 'login.title' or 'common.language')
   * @param params - Optional parameters for string interpolation
   * @returns Translated string
   */
  translate(key: TranslationKey, params?: Record<string, string | number>): string {
    const lang = this.currentLanguage();
    const translation = this.getNestedValue(this.translations[lang], key);

    if (!translation) {
      console.warn(`Translation missing for key: ${key} in language: ${lang}`);
      // Fallback to English if translation is missing
      const fallback = this.getNestedValue(this.translations['en'], key);
      if (fallback) {
        return this.interpolate(fallback, params);
      }
      return key;
    }

    return this.interpolate(translation, params);
  }

  /**
   * Get nested value from object using dot notation
   */
  private getNestedValue(obj: any, path: string): string | undefined {
    return path.split('.').reduce((current, prop) => current?.[prop], obj);
  }

  /**
   * Interpolate parameters in translation string
   * Example: translate('welcome', { name: 'John' }) with "Welcome {{name}}" -> "Welcome John"
   */
  private interpolate(text: string, params?: Record<string, string | number>): string {
    if (!params) return text;

    return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return params[key]?.toString() || match;
    });
  }

  /**
   * Set the current language
   */
  setLanguage(language: Language): void {
    this.currentLanguage.set(language);
    localStorage.setItem('language', language);
  }

  /**
   * Get the current language
   */
  getLanguage(): Language {
    return this.currentLanguage();
  }

  /**
   * Get all available languages
   */
  getAvailableLanguages(): Array<{ code: Language; label: string; flag: string }> {
    return [
      { code: 'en', label: 'English', flag: '🇺🇸' },
      { code: 'tr', label: 'Türkçe', flag: '🇹🇷' }
    ];
  }
}


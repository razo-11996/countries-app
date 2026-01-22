import { RouterLink, RouterOutlet } from '@angular/router';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { ButtonComponent } from './ui/button/button.component';
import { COUNTRIES_GRAPHQL_ENDPOINT } from './core/config/graphql';
import { Component, PLATFORM_ID, effect, inject, signal } from '@angular/core';

type Theme = 'light' | 'dark';

@Component({
  selector: 'app-root',
  imports: [RouterLink, RouterOutlet, ButtonComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly document = inject(DOCUMENT);

  protected readonly theme = signal<Theme>(this.getInitialTheme());
  protected readonly countriesApiUrl = COUNTRIES_GRAPHQL_ENDPOINT;

  constructor() {
    effect(() => {
      const theme = this.theme();
      const root = this.document?.documentElement;
      if (root) root.setAttribute('data-theme', theme);

      this.trySetLocalStorageItem('theme', theme);
    });
  }

  toggleTheme(): void {
    this.theme.update((t) => (t === 'dark' ? 'light' : 'dark'));
  }

  private getInitialTheme(): Theme {
    if (!isPlatformBrowser(this.platformId)) return 'light';

    const saved = this.tryGetLocalStorageItem('theme');
    if (saved === 'dark' || saved === 'light') return saved;

    return window.matchMedia?.('(prefers-color-scheme: dark)')?.matches ? 'dark' : 'light';
  }

  private tryGetLocalStorageItem(key: string): string | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    try {
      const ls: unknown = (globalThis as unknown as { localStorage: Storage }).localStorage;
      if (!ls || typeof (ls as Storage).getItem !== 'function') return null;
      return (ls as Storage).getItem(key);
    } catch {
      return null;
    }
  }

  private trySetLocalStorageItem(key: string, value: string): void {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      const ls: unknown = (globalThis as unknown as { localStorage: Storage }).localStorage;
      if (!ls || typeof (ls as Storage).setItem !== 'function') return;
      (ls as Storage).setItem(key, value);
    } catch {}
  }
}

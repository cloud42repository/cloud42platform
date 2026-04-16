import { Component, signal, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { AuthService } from './services/auth.service';
import { AgentComponent } from './pages/agent/agent.component';
import { ModuleVisibilityService } from './services/module-visibility.service';
import { UserManagementService } from './services/user-management.service';
import { USER_ROLE_LABELS } from './config/user.types';
import { TranslateService, type Lang } from './services/translate.service';
import { TranslatePipe } from './i18n/translate.pipe';
import { ThemeService } from './services/theme.service';

interface ModuleSubViews {
  dashboard?: { route: string; label: string };
  management?: { route: string; label: string };
}

const MODULE_VIEWS: Record<string, ModuleSubViews> = {
  'impossible-cloud': {
    dashboard: { route: 'ic-dashboard', label: 'IC Dashboard' },
    management: { route: 'ic-management', label: 'IC Management' },
  },
  'zoho-invoice': {
    dashboard: { route: 'invoice-dashboard', label: 'Invoice Dashboard' },
    management: { route: 'invoice-management', label: 'Invoice Management' },
  },
  'zoho-books': {
    dashboard: { route: 'books-dashboard', label: 'Books Dashboard' },
    management: { route: 'books-management', label: 'Books Management' },
  },
  'zoho-analytics': {
    dashboard: { route: 'analytics-dashboard', label: 'Analytics Dashboard' },
    management: { route: 'analytics-management', label: 'Analytics Management' },
  },
  'zoho-campaigns': {
    dashboard: { route: 'campaigns-dashboard', label: 'Campaigns Dashboard' },
    management: { route: 'campaigns-management', label: 'Campaigns Management' },
  },
};

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, RouterOutlet, RouterLink, RouterLinkActive,
    MatSidenavModule, MatListModule, MatToolbarModule,
    MatIconModule, MatButtonModule, MatTooltipModule, MatMenuModule, MatDividerModule,
    MatExpansionModule, AgentComponent, TranslatePipe,
  ],
  template: `
    <mat-toolbar color="primary" class="app-toolbar">
      @if (auth.isLoggedIn()) {
        <button mat-icon-button (click)="sidenavOpen.set(!sidenavOpen())" [matTooltip]="'app.toggle-menu' | t" style="color:white">
          <mat-icon>menu</mat-icon>
        </button>
      }
      <span class="app-title">☁️ {{ 'app.title' | t }}</span>
      <span class="toolbar-spacer"></span>
      @if (auth.isLoggedIn()) {
        <button mat-icon-button (click)="theme.toggleMode()" [matTooltip]="'settings.theme-mode' | t" style="color:white">
          <mat-icon>{{ theme.mode() === 'light' ? 'dark_mode' : 'light_mode' }}</mat-icon>
        </button>
        <button mat-icon-button (click)="agentOpen.set(!agentOpen())" [matTooltip]="'app.agent' | t" style="color:white" [class.agent-btn-active]="agentOpen()">
          <mat-icon>smart_toy</mat-icon>
        </button>
      }
      @if (auth.isLoggedIn()) {
        <button mat-button [matMenuTriggerFor]="userMenu" class="user-menu-btn">
          @if (auth.user()?.photoUrl) {
            <img [src]="auth.user()!.photoUrl" class="user-avatar" alt="avatar" />
          } @else {
            <mat-icon>account_circle</mat-icon>
          }
          <span class="user-name">{{ auth.user()?.firstName }}</span>
          <span class="toolbar-role-badge" [class]="'badge-' + userMgmt.currentRole()">{{ roleLabels[userMgmt.currentRole()] }}</span>
          <mat-icon>arrow_drop_down</mat-icon>
        </button>
        <mat-menu #userMenu="matMenu" xPosition="before">
          <div class="user-menu-header">
            @if (auth.user()?.photoUrl) {
              <img [src]="auth.user()!.photoUrl" class="menu-avatar" alt="avatar" />
            }
            <div class="user-menu-info">
              <span class="user-full-name">{{ auth.user()?.name }}</span>
              <span class="user-email">{{ auth.user()?.email }}</span>
            <span class="menu-role-chip" [class]="'chip-' + userMgmt.currentRole()">{{ roleLabels[userMgmt.currentRole()] }}</span>
            </div>
          </div>
          <mat-divider />
          <button mat-menu-item [matMenuTriggerFor]="langMenu">
            <mat-icon>language</mat-icon>
            {{ 'app.language' | t }}
          </button>
          <mat-menu #langMenu="matMenu">
            <button mat-menu-item (click)="setLang('en')" [class.active-lang]="i18n.lang() === 'en'">
              🇬🇧 English
            </button>
            <button mat-menu-item (click)="setLang('fr')" [class.active-lang]="i18n.lang() === 'fr'">
              🇫🇷 Français
            </button>
            <button mat-menu-item (click)="setLang('de')" [class.active-lang]="i18n.lang() === 'de'">
              🇩🇪 Deutsch
            </button>
          </mat-menu>
          <button mat-menu-item (click)="auth.logout()">
            <mat-icon>logout</mat-icon>
            {{ 'app.sign-out' | t }}
          </button>
        </mat-menu>
      }
    </mat-toolbar>

    <mat-sidenav-container class="sidenav-container">
      <mat-sidenav [opened]="sidenavOpen() && auth.isLoggedIn()" mode="side" class="sidenav">
        <mat-nav-list class="nav-top-list">
          <a mat-list-item
             routerLink="/workflows"
             [routerLinkActiveOptions]="{exact: true}"
             routerLinkActive="active-link"
             [matTooltip]="'nav.workflows' | t"
             matTooltipPosition="right">
            <mat-icon matListItemIcon>account_tree</mat-icon>
            <span matListItemTitle>{{ 'nav.workflows' | t }}</span>
          </a>
          <a mat-list-item
             routerLink="/workflows/calendar"
             routerLinkActive="active-link"
             [matTooltip]="'nav.calendar' | t"
             matTooltipPosition="right">
            <mat-icon matListItemIcon>calendar_month</mat-icon>
            <span matListItemTitle>{{ 'nav.calendar' | t }}</span>
          </a>
          <a mat-list-item
             routerLink="/dashboards"
             routerLinkActive="active-link"
             [matTooltip]="'nav.dashboard' | t"
             matTooltipPosition="right">
            <mat-icon matListItemIcon>dashboard</mat-icon>
            <span matListItemTitle>{{ 'nav.dashboard' | t }}</span>
          </a>
          <a mat-list-item
             routerLink="/forms"
             routerLinkActive="active-link"
             [matTooltip]="'nav.forms' | t"
             matTooltipPosition="right">
            <mat-icon matListItemIcon>edit_note</mat-icon>
            <span matListItemTitle>{{ 'nav.forms' | t }}</span>
          </a>
          <a mat-list-item
             routerLink="/api-tester"
             routerLinkActive="active-link"
             [matTooltip]="'nav.api-tester' | t"
             matTooltipPosition="right">
            <mat-icon matListItemIcon>terminal</mat-icon>
            <span matListItemTitle>{{ 'nav.api-tester' | t }}</span>
          </a>
          <a mat-list-item
             routerLink="/settings"
             routerLinkActive="active-link"
             [matTooltip]="'nav.settings' | t"
             matTooltipPosition="right">
            <mat-icon matListItemIcon>settings</mat-icon>
            <span matListItemTitle>{{ 'nav.settings' | t }}</span>
          </a>
          @if (userMgmt.isAdmin()) {
            <a mat-list-item
               routerLink="/users"
               routerLinkActive="active-link"
               [matTooltip]="'nav.users' | t"
               matTooltipPosition="right">
              <mat-icon matListItemIcon>group</mat-icon>
              <span matListItemTitle>{{ 'nav.users' | t }}</span>
            </a>
          }
        </mat-nav-list>
        <mat-divider />
        <div class="nav-modules-label">{{ 'nav.api-modules' | t }}</div>
        <mat-accordion class="nav-accordion" displayMode="flat">
          @for (mod of modules(); track mod.id) {
            <mat-expansion-panel class="nav-expansion-panel">
              <mat-expansion-panel-header collapsedHeight="44px" expandedHeight="44px">
                <mat-panel-title class="nav-panel-title">
                  <mat-icon class="nav-module-icon">{{ mod.icon }}</mat-icon>
                  <span>{{ mod.label }}</span>
                </mat-panel-title>
              </mat-expansion-panel-header>
              <mat-nav-list class="nav-sub-list">
                @if (moduleViews[mod.id]?.dashboard; as dash) {
                  <a mat-list-item
                     [routerLink]="['/', dash.route]"
                     routerLinkActive="active-link"
                     class="nav-sub-item">
                    <mat-icon matListItemIcon>dashboard</mat-icon>
                    <span matListItemTitle>{{ dash.label }}</span>
                  </a>
                }
                @if (moduleViews[mod.id]?.management; as mgmt) {
                  <a mat-list-item
                     [routerLink]="['/', mgmt.route]"
                     routerLinkActive="active-link"
                     class="nav-sub-item">
                    <mat-icon matListItemIcon>manage_accounts</mat-icon>
                    <span matListItemTitle>{{ mgmt.label }}</span>
                  </a>
                }
                <a mat-list-item
                   [routerLink]="['/', mod.id]"
                   routerLinkActive="active-link"
                   class="nav-sub-item">
                  <mat-icon matListItemIcon>api</mat-icon>
                  <span matListItemTitle>{{ 'nav.api-explorer' | t }}</span>
                </a>
              </mat-nav-list>
            </mat-expansion-panel>
          }
        </mat-accordion>
      </mat-sidenav>

      <mat-sidenav position="end" [opened]="agentOpen() && auth.isLoggedIn()" mode="side" class="agent-sidenav">
        <app-agent />
      </mat-sidenav>

      <mat-sidenav-content class="main-content">
        <router-outlet />
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styleUrl: './app.css'
})
export class App {
  private readonly visibilitySvc = inject(ModuleVisibilityService);
  readonly theme = inject(ThemeService);
  readonly userMgmt = inject(UserManagementService);
  readonly i18n = inject(TranslateService);
  readonly modules = this.visibilitySvc.enabledModules;
  readonly moduleViews = MODULE_VIEWS;
  readonly roleLabels = USER_ROLE_LABELS;
  readonly sidenavOpen = signal(true);
  readonly agentOpen = signal(false);
  readonly auth = inject(AuthService);

  setLang(lang: Lang): void {
    this.i18n.setLang(lang);
  }
}

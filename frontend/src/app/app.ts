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
import { MODULES } from './config/endpoints';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, RouterOutlet, RouterLink, RouterLinkActive,
    MatSidenavModule, MatListModule, MatToolbarModule,
    MatIconModule, MatButtonModule, MatTooltipModule, MatMenuModule, MatDividerModule,
  ],
  template: `
    <mat-toolbar color="primary" class="app-toolbar">
      @if (auth.isLoggedIn()) {
        <button mat-icon-button (click)="sidenavOpen.set(!sidenavOpen())" matTooltip="Toggle menu" style="color:white">
          <mat-icon>menu</mat-icon>
        </button>
      }
      <span class="app-title">☁️ Cloud42 Platform Admin</span>
      <span class="toolbar-spacer"></span>
      @if (auth.isLoggedIn()) {
        <button mat-button [matMenuTriggerFor]="userMenu" class="user-menu-btn">
          @if (auth.user()?.photoUrl) {
            <img [src]="auth.user()!.photoUrl" class="user-avatar" alt="avatar" />
          } @else {
            <mat-icon>account_circle</mat-icon>
          }
          <span class="user-name">{{ auth.user()?.firstName }}</span>
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
            </div>
          </div>
          <mat-divider />
          <button mat-menu-item (click)="auth.logout()">
            <mat-icon>logout</mat-icon>
            Sign out
          </button>
        </mat-menu>
      }
    </mat-toolbar>

    <mat-sidenav-container class="sidenav-container">
      <mat-sidenav [opened]="sidenavOpen() && auth.isLoggedIn()" mode="side" class="sidenav">
        <mat-nav-list>
          <a mat-list-item
             routerLink="/workflows"
             [routerLinkActiveOptions]="{exact: true}"
             routerLinkActive="active-link"
             matTooltip="Workflows"
             matTooltipPosition="right">
            <mat-icon matListItemIcon>account_tree</mat-icon>
            <span matListItemTitle>Workflows</span>
          </a>
          <a mat-list-item
             routerLink="/workflows/calendar"
             routerLinkActive="active-link"
             matTooltip="Schedule Calendar"
             matTooltipPosition="right">
            <mat-icon matListItemIcon>calendar_month</mat-icon>
            <span matListItemTitle>Calendar</span>
          </a>
          <a mat-list-item
             routerLink="/invoice-dashboard"
             routerLinkActive="active-link"
             matTooltip="Invoice Dashboard"
             matTooltipPosition="right">
            <mat-icon matListItemIcon>bar_chart</mat-icon>
            <span matListItemTitle>Invoice Dashboard</span>
          </a>
          <a mat-list-item
             routerLink="/ic-dashboard"
             routerLinkActive="active-link"
             matTooltip="IC Dashboard"
             matTooltipPosition="right">
            <mat-icon matListItemIcon>cloud</mat-icon>
            <span matListItemTitle>IC Dashboard</span>
          </a>
          <a mat-list-item
             routerLink="/agent"
             routerLinkActive="active-link"
             matTooltip="Agent"
             matTooltipPosition="right">
            <mat-icon matListItemIcon>smart_toy</mat-icon>
            <span matListItemTitle>Agent</span>
          </a>
          <a mat-list-item
             routerLink="/settings"
             routerLinkActive="active-link"
             matTooltip="Settings"
             matTooltipPosition="right"
             class="settings-link">
            <mat-icon matListItemIcon>settings</mat-icon>
            <span matListItemTitle>Settings</span>
          </a>
          <mat-divider />
          @for (mod of modules; track mod.id) {
            <a mat-list-item
               [routerLink]="['/', mod.id]"
               routerLinkActive="active-link"
               [matTooltip]="mod.label"
               matTooltipPosition="right">
              <mat-icon matListItemIcon>{{ mod.icon }}</mat-icon>
              <span matListItemTitle>{{ mod.label }}</span>
            </a>
          }
        </mat-nav-list>
      </mat-sidenav>

      <mat-sidenav-content class="main-content">
        <router-outlet />
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styleUrl: './app.css'
})
export class App {
  readonly modules = MODULES;
  readonly sidenavOpen = signal(true);
  readonly auth = inject(AuthService);
}

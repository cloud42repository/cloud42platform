import { Routes } from '@angular/router';
import { ModulePageComponent } from './pages/module-page/module-page.component';
import { LoginComponent } from './pages/login/login.component';
import { InvoiceDashboardComponent } from './pages/invoice-dashboard/invoice-dashboard.component';
import { WorkflowListComponent } from './pages/workflow/workflow-list.component';
import { WorkflowBuilderComponent } from './pages/workflow/workflow-builder.component';
import { WorkflowCalendarComponent } from './pages/workflow/workflow-calendar.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { authGuard } from './guards/auth.guard';
import { MODULES } from './config/endpoints';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent, title: 'Sign In' },
  {
    path: 'workflows',
    children: [
      { path: '', component: WorkflowListComponent, canActivate: [authGuard], title: 'Workflows' },
      { path: 'calendar', component: WorkflowCalendarComponent, canActivate: [authGuard], title: 'Schedule Calendar' },
      { path: 'new', component: WorkflowBuilderComponent, canActivate: [authGuard], title: 'New Workflow' },
      { path: ':id/edit', component: WorkflowBuilderComponent, canActivate: [authGuard], title: 'Edit Workflow' },
    ],
  },
  { path: 'settings', component: SettingsComponent, canActivate: [authGuard], title: 'Settings' },
  { path: 'invoice-dashboard', component: InvoiceDashboardComponent, canActivate: [authGuard], title: 'Invoice Dashboard' },
  ...MODULES.map(m => ({
    path: m.id,
    component: ModulePageComponent,
    canActivate: [authGuard],
    data: { moduleId: m.id },
    title: m.label,
  })),
  { path: '**', redirectTo: 'login' },
];

import { Routes } from '@angular/router';
import { ModulePageComponent } from './pages/module-page/module-page.component';
import { LoginComponent } from './pages/login/login.component';
import { InvoiceDashboardComponent } from './pages/invoice-dashboard/invoice-dashboard.component';
import { IcDashboardComponent } from './pages/ic-dashboard/ic-dashboard.component';
import { WorkflowListComponent } from './pages/workflow/workflow-list.component';
import { WorkflowBuilderComponent } from './pages/workflow/workflow-builder.component';
import { WorkflowCalendarComponent } from './pages/workflow/workflow-calendar.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { AgentComponent } from './pages/agent/agent.component';
import { UserManagementComponent } from './pages/user-management/user-management.component';
import { IcManagementComponent } from './pages/ic-management/ic-management.component';
import { BooksDashboardComponent } from './pages/books-dashboard/books-dashboard.component';
import { BooksManagementComponent } from './pages/books-management/books-management.component';
import { AnalyticsDashboardComponent } from './pages/analytics-dashboard/analytics-dashboard.component';
import { AnalyticsManagementComponent } from './pages/analytics-management/analytics-management.component';
import { CampaignsDashboardComponent } from './pages/campaigns-dashboard/campaigns-dashboard.component';
import { CampaignsManagementComponent } from './pages/campaigns-management/campaigns-management.component';
import { InvoiceManagementComponent } from './pages/invoice-management/invoice-management.component';
import { DashboardListComponent } from './pages/dashboard/dashboard-list.component';
import { DashboardBuilderComponent } from './pages/dashboard/dashboard-builder.component';
import { FormListComponent } from './pages/form/form-list.component';
import { FormBuilderComponent } from './pages/form/form-builder.component';
import { ApiTesterComponent } from './pages/api-tester/api-tester.component';
import { SharedViewerComponent } from './pages/shared/shared-viewer.component';
import { SharedListComponent } from './pages/shared/shared-list.component';
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
  {
    path: 'dashboards',
    children: [
      { path: '', component: DashboardListComponent, canActivate: [authGuard], title: 'Dashboards' },
      { path: 'new', component: DashboardBuilderComponent, canActivate: [authGuard], title: 'New Dashboard' },
      { path: ':id/edit', component: DashboardBuilderComponent, canActivate: [authGuard], title: 'Edit Dashboard' },
    ],
  },
  {
    path: 'forms',
    children: [
      { path: '', component: FormListComponent, canActivate: [authGuard], title: 'Forms' },
      { path: 'new', component: FormBuilderComponent, canActivate: [authGuard], title: 'New Form' },
      { path: ':id/edit', component: FormBuilderComponent, canActivate: [authGuard], title: 'Edit Form' },
    ],
  },
  { path: 'settings', component: SettingsComponent, canActivate: [authGuard], title: 'Settings' },
  { path: 'users', component: UserManagementComponent, canActivate: [authGuard], title: 'User Management' },
  { path: 'invoice-dashboard', component: InvoiceDashboardComponent, canActivate: [authGuard], title: 'Invoice Dashboard' },
  { path: 'ic-dashboard', component: IcDashboardComponent, canActivate: [authGuard], title: 'IC Dashboard' },
  { path: 'ic-management', component: IcManagementComponent, canActivate: [authGuard], title: 'IC Management' },
  { path: 'books-dashboard', component: BooksDashboardComponent, canActivate: [authGuard], title: 'Books Dashboard' },
  { path: 'books-management', component: BooksManagementComponent, canActivate: [authGuard], title: 'Books Management' },
  { path: 'analytics-dashboard', component: AnalyticsDashboardComponent, canActivate: [authGuard], title: 'Analytics Dashboard' },
  { path: 'analytics-management', component: AnalyticsManagementComponent, canActivate: [authGuard], title: 'Analytics Management' },
  { path: 'campaigns-dashboard', component: CampaignsDashboardComponent, canActivate: [authGuard], title: 'Campaigns Dashboard' },
  { path: 'campaigns-management', component: CampaignsManagementComponent, canActivate: [authGuard], title: 'Campaigns Management' },
  { path: 'invoice-management', component: InvoiceManagementComponent, canActivate: [authGuard], title: 'Invoice Management' },
  { path: 'agent', component: AgentComponent, canActivate: [authGuard], title: 'Agent' },
  { path: 'api-tester', component: ApiTesterComponent, canActivate: [authGuard], title: 'API Tester' },
  { path: 'shares', component: SharedListComponent, canActivate: [authGuard], title: 'Shared Views' },
  { path: 'shared/:token', component: SharedViewerComponent, title: 'Shared View' },
  ...MODULES.map(m => ({
    path: m.id,
    component: ModulePageComponent,
    canActivate: [authGuard],
    data: { moduleId: m.id },
    title: m.label,
  })),
  { path: '**', redirectTo: 'login' },
];

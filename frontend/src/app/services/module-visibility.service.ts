import { Injectable, computed, inject } from '@angular/core';
import { MODULES } from '../config/endpoints';
import { UserManagementService } from './user-management.service';

@Injectable({ providedIn: 'root' })
export class ModuleVisibilityService {
  private readonly userMgmt = inject(UserManagementService);

  /**
   * Per-user module visibility from the UserManagementService store.
   * - Admin / Manager: modules enabled by default (missing key = true)
   * - User: modules disabled by default (missing key = false)
   */
  readonly enabledModules = computed(() => {
    const user = this.userMgmt.currentUser();
    if (!user) return MODULES;                       // not logged in → show all (guards protect anyway)
    const vis = user.moduleVisibility;
    const defaultEnabled = user.role === 'admin' || user.role === 'manager';
    return MODULES.filter(m => vis[m.id] ?? defaultEnabled);
  });

  isEnabled(moduleId: string): boolean {
    const user = this.userMgmt.currentUser();
    if (!user) return true;
    const defaultEnabled = user.role === 'admin' || user.role === 'manager';
    return user.moduleVisibility[moduleId] ?? defaultEnabled;
  }

  setEnabled(moduleId: string, enabled: boolean): void {
    const email = this.userMgmt.currentUser()?.email;
    if (!email) return;
    this.userMgmt.setModuleEnabled(email, moduleId, enabled);
  }

  enableAll(): void {
    const email = this.userMgmt.currentUser()?.email;
    if (!email) return;
    this.userMgmt.setAllModulesEnabled(email, MODULES.map(m => m.id), true);
  }

  disableAll(): void {
    const email = this.userMgmt.currentUser()?.email;
    if (!email) return;
    this.userMgmt.setAllModulesEnabled(email, MODULES.map(m => m.id), false);
  }
}

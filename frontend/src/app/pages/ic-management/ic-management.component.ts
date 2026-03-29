import { ChangeDetectorRef, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { firstValueFrom } from 'rxjs';
import { ImpossibleCloudService } from '../../services/impossible-cloud.service';
import { TranslatePipe } from '../../i18n/translate.pipe';
import { TranslateService } from '../../services/translate.service';
import {
  ICContract,
  ICPartner,
  ICMember,
  ICStorageAccount,
  ICCreatePartnerDTO,
  ICUpdatePartnerDTO,
  ICCreateMemberDTO,
  ICCreateStorageAccountDTO,
  ICPatchStorageAccountDTO,
  ICStorageAccountClientAccount,
} from '../../services/impossible-cloud.types';

// ─── Form helpers ─────────────────────────────────────────────────────────────
// Flattened version of ICCreateStorageAccountDTO for template binding
interface StorageAccountFormData {
  name: string;
  allocatedCapacity: number;
  allowOverdraft: boolean;
  contactEmail: string;
  password: string;
}

type PanelMode = 'hidden' | 'create' | 'edit';

// ─── Component ────────────────────────────────────────────────────────────────

@Component({
  selector: 'app-ic-management',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatTabsModule, MatTableModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatSnackBarModule, MatProgressSpinnerModule, MatTooltipModule,
    MatCardModule, MatCheckboxModule, MatDividerModule, MatChipsModule,
    TranslatePipe,
  ],
  templateUrl: './ic-management.component.html',
  styleUrl:    './ic-management.component.scss',
})
export class IcManagementComponent implements OnInit {
  private readonly icSvc = inject(ImpossibleCloudService);
  private readonly snack = inject(MatSnackBar);
  private readonly cdr   = inject(ChangeDetectorRef);
  readonly i18n = inject(TranslateService);

  // ── Contracts (used as foreign-key reference) ──────────────────────────────
  contracts = signal<ICContract[]>([]);

  ngOnInit() {
    this.loadContracts();
    this.loadStorageAccounts();
  }

  private async loadContracts() {
    try {
      const res = await firstValueFrom(this.icSvc.listContracts());
      const list: ICContract[] = Array.isArray(res) ? res : (res as any)?.data ?? [];
      this.contracts.set(list);
      if (!this.selectedContractId && list.length > 0 && list[0].id) {
        this.selectedContractId = list[0].id;
      }
    } catch { /* non-blocking */ }
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  TAB 1  Storage Accounts
  // ══════════════════════════════════════════════════════════════════════════

  saLoading     = signal(false);
  saAccounts    = signal<ICStorageAccount[]>([]);
  saPanelMode: PanelMode = 'hidden';
  saEditing: ICStorageAccount | null = null;
  saForm: StorageAccountFormData = { name: '', allocatedCapacity: 100, allowOverdraft: false, contactEmail: '', password: '' };
  saPatch: { pendingDeletedAt: string } = { pendingDeletedAt: '' };
  readonly saColumns = ['name', 'clientAccountId', 'contactEmail', 'allocatedCapacity', 'allowOverdraft', 'status', 'actions'];

  async loadStorageAccounts() {
    this.saLoading.set(true);
    try {
      const res = await firstValueFrom(this.icSvc.listStorageAccounts());
      const list: ICStorageAccount[] = Array.isArray(res) ? res : (res as any)?.data ?? [];
      this.saAccounts.set(list);
    } catch (e: any) {
      this.toast('Failed to load storage accounts: ' + (e?.message ?? e), true);
    } finally { this.saLoading.set(false); }
  }

  openSaCreate() {
    this.saForm = { name: '', allocatedCapacity: 100, allowOverdraft: false, contactEmail: '', password: '' };
    this.saEditing = null;
    this.saPanelMode = 'create';
  }

  openSaEdit(acc: ICStorageAccount) {
    this.saPatch = { pendingDeletedAt: acc.pendingDeletedAt ?? '' };
    this.saEditing = acc;
    this.saPanelMode = 'edit';
  }

  cancelSaPanel() { this.saPanelMode = 'hidden'; this.saEditing = null; }

  async saveSaCreate() {
    if (!this.saForm.name || !this.saForm.contactEmail || !this.saForm.password) {
      this.toast('Name, contact email and password are required.', true); return;
    }
    this.saLoading.set(true);
    try {
      const dto: ICCreateStorageAccountDTO = {
        name: this.saForm.name,
        allocatedCapacity: Number(this.saForm.allocatedCapacity),
        allowOverdraft: this.saForm.allowOverdraft,
        clientAccount: { contactEmail: this.saForm.contactEmail, password: this.saForm.password },
      };
      await firstValueFrom(this.icSvc.createStorageAccount(dto));
      this.toast('Storage account created.');
      this.cancelSaPanel();
      await this.loadStorageAccounts();
    } catch (e: any) {
      this.toast('Error: ' + (e?.error?.message ?? e?.message ?? 'Unknown error'), true);
    } finally { this.saLoading.set(false); }
  }

  async saveSaEdit(acc: ICStorageAccount) {
    this.saLoading.set(true);
    try {
      const patch: ICPatchStorageAccountDTO = {
        pendingDeletedAt: this.saPatch.pendingDeletedAt || null,
      };
      await firstValueFrom(this.icSvc.patchStorageAccount(acc.clientAccountId!, patch));
      this.toast('Storage account updated.');
      this.cancelSaPanel();
      await this.loadStorageAccounts();
    } catch (e: any) {
      this.toast('Error: ' + (e?.error?.message ?? e?.message ?? 'Unknown error'), true);
    } finally { this.saLoading.set(false); }
  }

  async deleteSa(acc: ICStorageAccount) {
    if (!confirm(`Delete storage account "${acc.name}"?`)) return;
    this.saLoading.set(true);
    try {
      await firstValueFrom(this.icSvc.deleteStorageAccount(acc.clientAccountId!));
      this.toast('Storage account deleted.');
      await this.loadStorageAccounts();
    } catch (e: any) {
      this.toast('Error: ' + (e?.error?.message ?? e?.message ?? 'Unknown error'), true);
    } finally { this.saLoading.set(false); }
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  TAB 2  Partners
  // ══════════════════════════════════════════════════════════════════════════

  partLoading    = signal(false);
  partners       = signal<ICPartner[]>([]);
  selectedContractId = '';
  partPanelMode: PanelMode = 'hidden';
  partEditing: ICPartner | null = null;
  partForm: { name: string; allocatedCapacity: number; allowOverdraft: boolean } = { name: '', allocatedCapacity: 100, allowOverdraft: false };
  partPatch: ICUpdatePartnerDTO = { name: '', allocatedCapacity: 0 };
  readonly partColumns = ['id', 'name', 'distributorContractId', 'allocatedCapacity', 'allowOverdraft', 'actions'];

  async loadPartners() {
    if (!this.selectedContractId) { this.toast('Select a contract first.', true); return; }
    this.partLoading.set(true);
    try {
      const res = await firstValueFrom(this.icSvc.listContractPartners(this.selectedContractId));
      this.partners.set(Array.isArray(res) ? res : (res as any)?.data ?? []);
    } catch (e: any) {
      this.toast('Failed to load partners: ' + (e?.message ?? e), true);
    } finally { this.partLoading.set(false); }
  }

  openPartCreate() {
    this.partForm = { name: '', allocatedCapacity: 100, allowOverdraft: false };
    this.partEditing = null;
    this.partPanelMode = 'create';
  }

  openPartEdit(p: ICPartner) {
    this.partPatch = { name: p.name ?? '', allocatedCapacity: p.allocatedCapacity ?? 0 };
    this.partEditing = p;
    this.partPanelMode = 'edit';
  }

  cancelPartPanel() { this.partPanelMode = 'hidden'; this.partEditing = null; }

  async savePartCreate() {
    if (!this.selectedContractId || !this.partForm.name) {
      this.toast('Contract and name are required.', true); return;
    }
    this.partLoading.set(true);
    try {
      const dto: ICCreatePartnerDTO = {
        distributorContractId: this.selectedContractId,
        name: this.partForm.name,
        allocatedCapacity: Number(this.partForm.allocatedCapacity),
        allowOverdraft: this.partForm.allowOverdraft,
      };
      await firstValueFrom(this.icSvc.createPartner(dto));
      this.toast('Partner created.');
      this.cancelPartPanel();
      await this.loadPartners();
    } catch (e: any) {
      this.toast('Error: ' + (e?.error?.message ?? e?.message ?? 'Unknown error'), true);
    } finally { this.partLoading.set(false); }
  }

  async savePartEdit(p: ICPartner) {
    this.partLoading.set(true);
    try {
      const patch: ICUpdatePartnerDTO = {
        name: this.partPatch.name || undefined,
        allocatedCapacity: this.partPatch.allocatedCapacity ? Number(this.partPatch.allocatedCapacity) : undefined,
      };
      await firstValueFrom(this.icSvc.updatePartner(p.id!, patch));
      this.toast('Partner updated.');
      this.cancelPartPanel();
      await this.loadPartners();
    } catch (e: any) {
      this.toast('Error: ' + (e?.error?.message ?? e?.message ?? 'Unknown error'), true);
    } finally { this.partLoading.set(false); }
  }

  async deletePart(p: ICPartner) {
    if (!confirm(`Delete partner "${p.name}"?`)) return;
    this.partLoading.set(true);
    try {
      await firstValueFrom(this.icSvc.deletePartner(p.id!));
      this.toast('Partner deleted.');
      await this.loadPartners();
    } catch (e: any) {
      this.toast('Error: ' + (e?.error?.message ?? e?.message ?? 'Unknown error'), true);
    } finally { this.partLoading.set(false); }
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  TAB 3  Members
  // ══════════════════════════════════════════════════════════════════════════

  membLoading = signal(false);
  members     = signal<ICMember[]>([]);
  membContractId = '';
  membPartners = signal<ICPartner[]>([]);
  membPartnerId = '';
  membPanelMode: PanelMode = 'hidden';
  membForm: { email: string; password: string; name: string; role: string } = { email: '', password: '', name: '', role: 'viewer' };
  readonly membColumns = ['id', 'name', 'email', 'role', 'actions'];
  readonly roles = ['admin', 'staff', 'viewer'];

  async loadMembPartners() {
    if (!this.membContractId) { this.toast('Select a contract first.', true); return; }
    this.membLoading.set(true);
    this.membPartnerId = '';
    this.members.set([]);
    try {
      const res = await firstValueFrom(this.icSvc.listContractPartners(this.membContractId));
      this.membPartners.set(Array.isArray(res) ? res : (res as any)?.data ?? []);
    } catch (e: any) {
      this.toast('Failed to load partners: ' + (e?.message ?? e), true);
    } finally { this.membLoading.set(false); }
  }

  async loadMembers() {
    if (!this.membPartnerId) { this.toast('Select a partner first.', true); return; }
    this.membLoading.set(true);
    try {
      const res = await firstValueFrom(this.icSvc.listMembers(this.membPartnerId));
      this.members.set(Array.isArray(res) ? res : (res as any)?.data ?? []);
    } catch (e: any) {
      this.toast('Failed to load members: ' + (e?.message ?? e), true);
    } finally { this.membLoading.set(false); }
  }

  openMembCreate() {
    this.membForm = { email: '', password: '', name: '', role: 'viewer' };
    this.membPanelMode = 'create';
  }

  cancelMembPanel() { this.membPanelMode = 'hidden'; }

  async saveMembCreate() {
    if (!this.membPartnerId || !this.membForm.email || !this.membForm.password) {
      this.toast('Partner ID, email and password are required.', true); return;
    }
    this.membLoading.set(true);
    try {
      const dto: ICCreateMemberDTO = {
        email: this.membForm.email,
        password: this.membForm.password,
        name: this.membForm.name || undefined,
        role: this.membForm.role,
      };
      await firstValueFrom(this.icSvc.createMember(this.membPartnerId, dto));
      this.toast('Member created.');
      this.cancelMembPanel();
      await this.loadMembers();
    } catch (e: any) {
      this.toast('Error: ' + (e?.error?.message ?? e?.message ?? 'Unknown error'), true);
    } finally { this.membLoading.set(false); }
  }

  async deleteMember(m: ICMember) {
    if (!confirm(`Delete member "${m.email}"?`)) return;
    this.membLoading.set(true);
    try {
      await firstValueFrom(this.icSvc.deleteMember(this.membPartnerId, m.id!));
      this.toast('Member deleted.');
      await this.loadMembers();
    } catch (e: any) {
      this.toast('Error: ' + (e?.error?.message ?? e?.message ?? 'Unknown error'), true);
    } finally { this.membLoading.set(false); }
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  TAB 4  Partner Storage
  // ══════════════════════════════════════════════════════════════════════════

  psLoading    = signal(false);
  psAccounts   = signal<ICStorageAccount[]>([]);
  psContractId = '';
  psPartners   = signal<ICPartner[]>([]);
  psPartnerId  = '';
  psPanelMode: PanelMode = 'hidden';
  psEditing: ICStorageAccount | null = null;
  psForm: StorageAccountFormData  = { name: '', allocatedCapacity: 100, allowOverdraft: false, contactEmail: '', password: '' };
  psPatch: { pendingDeletedAt: string } = { pendingDeletedAt: '' };
  readonly psColumns = ['name', 'clientAccountId', 'contactEmail', 'allocatedCapacity', 'allowOverdraft', 'status', 'actions'];

  async loadPsPartners() {
    if (!this.psContractId) { this.toast('Select a contract first.', true); return; }
    this.psLoading.set(true);
    this.psPartnerId = '';
    this.psAccounts.set([]);
    try {
      const res = await firstValueFrom(this.icSvc.listContractPartners(this.psContractId));
      this.psPartners.set(Array.isArray(res) ? res : (res as any)?.data ?? []);
    } catch (e: any) {
      this.toast('Failed to load partners: ' + (e?.message ?? e), true);
    } finally { this.psLoading.set(false); }
  }

  async loadPartnerStorage() {
    if (!this.psPartnerId) { this.toast('Select a partner first.', true); return; }
    this.psLoading.set(true);
    try {
      const res = await firstValueFrom(this.icSvc.listPartnerStorageAccounts(this.psPartnerId));
      this.psAccounts.set(Array.isArray(res) ? res : (res as any)?.data ?? []);
    } catch (e: any) {
      this.toast('Failed to load partner storage: ' + (e?.message ?? e), true);
    } finally { this.psLoading.set(false); }
  }

  openPsCreate() {
    this.psForm = { name: '', allocatedCapacity: 100, allowOverdraft: false, contactEmail: '', password: '' };
    this.psEditing = null;
    this.psPanelMode = 'create';
  }

  openPsEdit(acc: ICStorageAccount) {
    this.psPatch = { pendingDeletedAt: acc.pendingDeletedAt ?? '' };
    this.psEditing = acc;
    this.psPanelMode = 'edit';
  }

  cancelPsPanel() { this.psPanelMode = 'hidden'; this.psEditing = null; }

  async savePsCreate() {
    if (!this.psPartnerId || !this.psForm.name || !this.psForm.contactEmail || !this.psForm.password) {
      this.toast('All required fields must be filled.', true); return;
    }
    this.psLoading.set(true);
    try {
      const dto: ICCreateStorageAccountDTO = {
        name: this.psForm.name,
        allocatedCapacity: Number(this.psForm.allocatedCapacity),
        allowOverdraft: this.psForm.allowOverdraft,
        clientAccount: { contactEmail: this.psForm.contactEmail, password: this.psForm.password },
      };
      await firstValueFrom(this.icSvc.createPartnerStorageAccount(this.psPartnerId, dto));
      this.toast('Partner storage account created.');
      this.cancelPsPanel();
      await this.loadPartnerStorage();
    } catch (e: any) {
      this.toast('Error: ' + (e?.error?.message ?? e?.message ?? 'Unknown error'), true);
    } finally { this.psLoading.set(false); }
  }

  async savePsEdit(acc: ICStorageAccount) {
    this.psLoading.set(true);
    try {
      const patch: ICPatchStorageAccountDTO = {
        pendingDeletedAt: this.psPatch.pendingDeletedAt || null,
      };
      await firstValueFrom(this.icSvc.patchPartnerStorageAccount(
        this.psPartnerId, acc.clientAccountId!, patch,
      ));
      this.toast('Partner storage account updated.');
      this.cancelPsPanel();
      await this.loadPartnerStorage();
    } catch (e: any) {
      this.toast('Error: ' + (e?.error?.message ?? e?.message ?? 'Unknown error'), true);
    } finally { this.psLoading.set(false); }
  }

  async deletePs(acc: ICStorageAccount) {
    if (!confirm(`Delete partner storage account "${acc.name}"?`)) return;
    this.psLoading.set(true);
    try {
      await firstValueFrom(this.icSvc.deletePartnerStorageAccount(this.psPartnerId, acc.clientAccountId!));
      this.toast('Partner storage account deleted.');
      await this.loadPartnerStorage();
    } catch (e: any) {
      this.toast('Error: ' + (e?.error?.message ?? e?.message ?? 'Unknown error'), true);
    } finally { this.psLoading.set(false); }
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────
  private toast(msg: string, error = false) {
    this.snack.open(msg, 'Close', {
      duration: 4000,
      panelClass: error ? ['snack-error'] : ['snack-ok'],
    });
  }

  formatGB(gb?: number) { return gb != null ? `${gb.toLocaleString()} GB` : '—'; }
  isPendingDelete(acc: ICStorageAccount) { return !!acc.pendingDeletedAt; }
}

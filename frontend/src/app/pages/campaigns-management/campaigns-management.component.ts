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
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { firstValueFrom } from 'rxjs';
import { ZohoCampaignsService } from '../../services/zoho-campaigns.service';

type PanelMode = 'hidden' | 'create';

@Component({
  selector: 'app-campaigns-management',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatTabsModule, MatTableModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatSnackBarModule, MatProgressSpinnerModule, MatTooltipModule,
    MatCardModule, MatDividerModule, MatChipsModule,
  ],
  templateUrl: './campaigns-management.component.html',
  styleUrl:    './campaigns-management.component.scss',
})
export class CampaignsManagementComponent implements OnInit {
  private readonly campaignsSvc = inject(ZohoCampaignsService);
  private readonly snack = inject(MatSnackBar);
  private readonly cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    this.loadLists();
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  TAB 1  Mailing Lists
  // ══════════════════════════════════════════════════════════════════════════

  listLoading = signal(false);
  mailingLists = signal<any[]>([]);
  listPanelMode: PanelMode = 'hidden';
  listForm = { listname: '', signup_form_url: '' };
  readonly listColumns = ['listname', 'listkey', 'subscriber_count', 'actions'];

  async loadLists() {
    this.listLoading.set(true);
    try {
      const res = await firstValueFrom(this.campaignsSvc.listMailingLists()) as any;
      const list = res?.data ?? res?.list_of_details ?? res ?? [];
      this.mailingLists.set(Array.isArray(list) ? list : []);
    } catch (e: any) {
      this.toast('Failed to load mailing lists: ' + (e?.message ?? e), true);
    } finally { this.listLoading.set(false); }
  }

  openListCreate() {
    this.listForm = { listname: '', signup_form_url: '' };
    this.listPanelMode = 'create';
  }

  cancelListPanel() { this.listPanelMode = 'hidden'; }

  async saveListCreate() {
    if (!this.listForm.listname) { this.toast('List name is required.', true); return; }
    this.listLoading.set(true);
    try {
      await firstValueFrom(this.campaignsSvc.createMailingList(this.listForm));
      this.toast('Mailing list created.');
      this.cancelListPanel();
      await this.loadLists();
    } catch (e: any) {
      this.toast('Error: ' + (e?.error?.message ?? e?.message ?? 'Unknown error'), true);
    } finally { this.listLoading.set(false); }
  }

  async deleteList(l: any) {
    if (!confirm(`Delete mailing list "${l.listname ?? l.name}"?`)) return;
    this.listLoading.set(true);
    try {
      await firstValueFrom(this.campaignsSvc.deleteMailingList(l.listkey ?? l.list_key ?? l.id));
      this.toast('Mailing list deleted.');
      await this.loadLists();
    } catch (e: any) {
      this.toast('Error: ' + (e?.error?.message ?? e?.message ?? 'Unknown error'), true);
    } finally { this.listLoading.set(false); }
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  TAB 2  Subscribers
  // ══════════════════════════════════════════════════════════════════════════

  subLoading = signal(false);
  subscribers = signal<any[]>([]);
  selectedListKey = '';
  subPanelMode: PanelMode = 'hidden';
  subForm = { contact_email: '', first_name: '', last_name: '' };
  readonly subColumns = ['contact_email', 'first_name', 'last_name', 'actions'];

  async loadSubscribers() {
    if (!this.selectedListKey) { this.toast('Select a list first.', true); return; }
    this.subLoading.set(true);
    try {
      const res = await firstValueFrom(this.campaignsSvc.listSubscribers(this.selectedListKey)) as any;
      const list = res?.data ?? res?.subscribers ?? res ?? [];
      this.subscribers.set(Array.isArray(list) ? list : []);
    } catch (e: any) {
      this.toast('Failed to load subscribers: ' + (e?.message ?? e), true);
    } finally { this.subLoading.set(false); }
  }

  openSubCreate() {
    this.subForm = { contact_email: '', first_name: '', last_name: '' };
    this.subPanelMode = 'create';
  }

  cancelSubPanel() { this.subPanelMode = 'hidden'; }

  async saveSubCreate() {
    if (!this.selectedListKey || !this.subForm.contact_email) {
      this.toast('List and email are required.', true); return;
    }
    this.subLoading.set(true);
    try {
      await firstValueFrom(this.campaignsSvc.addSubscriber(this.selectedListKey, this.subForm));
      this.toast('Subscriber added.');
      this.cancelSubPanel();
      await this.loadSubscribers();
    } catch (e: any) {
      this.toast('Error: ' + (e?.error?.message ?? e?.message ?? 'Unknown error'), true);
    } finally { this.subLoading.set(false); }
  }

  async removeSub(sub: any) {
    if (!confirm(`Remove subscriber "${sub.contact_email ?? sub.email}"?`)) return;
    this.subLoading.set(true);
    try {
      await firstValueFrom(this.campaignsSvc.removeSubscriber(this.selectedListKey, {
        contact_email: sub.contact_email ?? sub.email,
      }));
      this.toast('Subscriber removed.');
      await this.loadSubscribers();
    } catch (e: any) {
      this.toast('Error: ' + (e?.error?.message ?? e?.message ?? 'Unknown error'), true);
    } finally { this.subLoading.set(false); }
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  TAB 3  Campaigns
  // ══════════════════════════════════════════════════════════════════════════

  campLoading = signal(false);
  campaigns = signal<any[]>([]);
  readonly campColumns = ['campaign_name', 'campaign_type', 'status', 'sent_time', 'actions'];

  async loadCampaigns() {
    this.campLoading.set(true);
    try {
      const res = await firstValueFrom(this.campaignsSvc.listCampaigns()) as any;
      const list = res?.data ?? res?.campaigns ?? res ?? [];
      this.campaigns.set(Array.isArray(list) ? list : []);
    } catch (e: any) {
      this.toast('Failed to load campaigns: ' + (e?.message ?? e), true);
    } finally { this.campLoading.set(false); }
  }

  async sendCampaign(c: any) {
    if (!confirm(`Send campaign "${c.campaign_name ?? c.name}"?`)) return;
    this.campLoading.set(true);
    try {
      await firstValueFrom(this.campaignsSvc.sendCampaign(c.campaign_key ?? c.campaignKey ?? c.id));
      this.toast('Campaign sent.');
      await this.loadCampaigns();
    } catch (e: any) {
      this.toast('Error: ' + (e?.error?.message ?? e?.message ?? 'Unknown error'), true);
    } finally { this.campLoading.set(false); }
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  TAB 4  Topics
  // ══════════════════════════════════════════════════════════════════════════

  topicLoading = signal(false);
  topics = signal<any[]>([]);
  readonly topicColumns = ['topic_name', 'topic_key'];

  async loadTopics() {
    this.topicLoading.set(true);
    try {
      const res = await firstValueFrom(this.campaignsSvc.listTopics()) as any;
      const list = res?.data ?? res?.topics ?? res ?? [];
      this.topics.set(Array.isArray(list) ? list : []);
    } catch (e: any) {
      this.toast('Failed to load topics: ' + (e?.message ?? e), true);
    } finally { this.topicLoading.set(false); }
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────
  private toast(msg: string, error = false) {
    this.snack.open(msg, 'Close', {
      duration: 4000,
      panelClass: error ? ['snack-error'] : ['snack-ok'],
    });
  }
}

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
import { ZohoInvoiceService } from '../../services/zoho-invoice.service';

type PanelMode = 'hidden' | 'create' | 'edit';

@Component({
  selector: 'app-invoice-management',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatTabsModule, MatTableModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatSnackBarModule, MatProgressSpinnerModule, MatTooltipModule,
    MatCardModule, MatDividerModule, MatChipsModule,
  ],
  templateUrl: './invoice-management.component.html',
  styleUrl:    './invoice-management.component.scss',
})
export class InvoiceManagementComponent implements OnInit {
  private readonly invoiceSvc = inject(ZohoInvoiceService);
  private readonly snack = inject(MatSnackBar);
  private readonly cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    this.loadCustomers();
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  TAB 1  Customers
  // ══════════════════════════════════════════════════════════════════════════

  custLoading = signal(false);
  customers = signal<any[]>([]);
  custPanelMode: PanelMode = 'hidden';
  custEditing: any = null;
  custForm = { customer_name: '', email: '', phone: '', company_name: '' };
  readonly custColumns = ['customer_name', 'company_name', 'email', 'phone', 'actions'];

  async loadCustomers() {
    this.custLoading.set(true);
    try {
      const res = await firstValueFrom(this.invoiceSvc.listCustomers()) as any;
      const list = res?.data ?? res?.customers ?? [];
      this.customers.set(Array.isArray(list) ? list : []);
    } catch (e: any) {
      this.toast('Failed to load customers: ' + (e?.message ?? e), true);
    } finally { this.custLoading.set(false); }
  }

  openCustCreate() {
    this.custForm = { customer_name: '', email: '', phone: '', company_name: '' };
    this.custEditing = null;
    this.custPanelMode = 'create';
  }

  openCustEdit(c: any) {
    this.custForm = {
      customer_name: c.customer_name ?? '',
      email: c.email ?? '',
      phone: c.phone ?? '',
      company_name: c.company_name ?? '',
    };
    this.custEditing = c;
    this.custPanelMode = 'edit';
  }

  cancelCustPanel() { this.custPanelMode = 'hidden'; this.custEditing = null; }

  async saveCustCreate() {
    if (!this.custForm.customer_name) { this.toast('Customer name is required.', true); return; }
    this.custLoading.set(true);
    try {
      await firstValueFrom(this.invoiceSvc.createCustomer(this.custForm));
      this.toast('Customer created.');
      this.cancelCustPanel();
      await this.loadCustomers();
    } catch (e: any) {
      this.toast('Error: ' + (e?.error?.message ?? e?.message ?? 'Unknown error'), true);
    } finally { this.custLoading.set(false); }
  }

  async saveCustEdit() {
    this.custLoading.set(true);
    try {
      const id = this.custEditing?.customer_id ?? this.custEditing?.id;
      await firstValueFrom(this.invoiceSvc.updateCustomer(id, this.custForm));
      this.toast('Customer updated.');
      this.cancelCustPanel();
      await this.loadCustomers();
    } catch (e: any) {
      this.toast('Error: ' + (e?.error?.message ?? e?.message ?? 'Unknown error'), true);
    } finally { this.custLoading.set(false); }
  }

  async deleteCust(c: any) {
    if (!confirm(`Delete customer "${c.customer_name}"?`)) return;
    this.custLoading.set(true);
    try {
      await firstValueFrom(this.invoiceSvc.deleteCustomer(c.customer_id ?? c.id));
      this.toast('Customer deleted.');
      await this.loadCustomers();
    } catch (e: any) {
      this.toast('Error: ' + (e?.error?.message ?? e?.message ?? 'Unknown error'), true);
    } finally { this.custLoading.set(false); }
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  TAB 2  Invoices
  // ══════════════════════════════════════════════════════════════════════════

  invLoading = signal(false);
  invoices = signal<any[]>([]);
  invPanelMode: PanelMode = 'hidden';
  invEditing: any = null;
  invForm = { customer_name: '', invoice_number: '', date: '', due_date: '', total: 0 };
  readonly invColumns = ['invoice_number', 'customer_name', 'date', 'due_date', 'total', 'status', 'actions'];

  async loadInvoices() {
    this.invLoading.set(true);
    try {
      const res = await firstValueFrom(this.invoiceSvc.listInvoices()) as any;
      const list = res?.data ?? res?.invoices ?? [];
      this.invoices.set(Array.isArray(list) ? list : []);
    } catch (e: any) {
      this.toast('Failed to load invoices: ' + (e?.message ?? e), true);
    } finally { this.invLoading.set(false); }
  }

  openInvCreate() {
    this.invForm = { customer_name: '', invoice_number: '', date: '', due_date: '', total: 0 };
    this.invEditing = null;
    this.invPanelMode = 'create';
  }

  openInvEdit(inv: any) {
    this.invForm = {
      customer_name: inv.customer_name ?? '',
      invoice_number: inv.invoice_number ?? '',
      date: inv.date ?? '',
      due_date: inv.due_date ?? '',
      total: inv.total ?? 0,
    };
    this.invEditing = inv;
    this.invPanelMode = 'edit';
  }

  cancelInvPanel() { this.invPanelMode = 'hidden'; this.invEditing = null; }

  async saveInvCreate() {
    if (!this.invForm.customer_name) { this.toast('Customer name is required.', true); return; }
    this.invLoading.set(true);
    try {
      await firstValueFrom(this.invoiceSvc.createInvoice(this.invForm));
      this.toast('Invoice created.');
      this.cancelInvPanel();
      await this.loadInvoices();
    } catch (e: any) {
      this.toast('Error: ' + (e?.error?.message ?? e?.message ?? 'Unknown error'), true);
    } finally { this.invLoading.set(false); }
  }

  async saveInvEdit() {
    this.invLoading.set(true);
    try {
      const id = this.invEditing?.invoice_id ?? this.invEditing?.id;
      await firstValueFrom(this.invoiceSvc.updateInvoice(id, this.invForm));
      this.toast('Invoice updated.');
      this.cancelInvPanel();
      await this.loadInvoices();
    } catch (e: any) {
      this.toast('Error: ' + (e?.error?.message ?? e?.message ?? 'Unknown error'), true);
    } finally { this.invLoading.set(false); }
  }

  async deleteInv(inv: any) {
    if (!confirm(`Delete invoice "${inv.invoice_number}"?`)) return;
    this.invLoading.set(true);
    try {
      await firstValueFrom(this.invoiceSvc.deleteInvoice(inv.invoice_id ?? inv.id));
      this.toast('Invoice deleted.');
      await this.loadInvoices();
    } catch (e: any) {
      this.toast('Error: ' + (e?.error?.message ?? e?.message ?? 'Unknown error'), true);
    } finally { this.invLoading.set(false); }
  }

  async sendInv(inv: any) {
    this.invLoading.set(true);
    try {
      await firstValueFrom(this.invoiceSvc.sendInvoice(inv.invoice_id ?? inv.id));
      this.toast('Invoice sent.');
      await this.loadInvoices();
    } catch (e: any) {
      this.toast('Error: ' + (e?.error?.message ?? e?.message ?? 'Unknown error'), true);
    } finally { this.invLoading.set(false); }
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  TAB 3  Estimates
  // ══════════════════════════════════════════════════════════════════════════

  estLoading = signal(false);
  estimates = signal<any[]>([]);
  estPanelMode: PanelMode = 'hidden';
  estEditing: any = null;
  estForm = { customer_name: '', estimate_number: '', date: '', expiry_date: '', total: 0 };
  readonly estColumns = ['estimate_number', 'customer_name', 'date', 'expiry_date', 'total', 'status', 'actions'];

  async loadEstimates() {
    this.estLoading.set(true);
    try {
      const res = await firstValueFrom(this.invoiceSvc.listEstimates()) as any;
      const list = res?.data ?? res?.estimates ?? [];
      this.estimates.set(Array.isArray(list) ? list : []);
    } catch (e: any) {
      this.toast('Failed to load estimates: ' + (e?.message ?? e), true);
    } finally { this.estLoading.set(false); }
  }

  openEstCreate() {
    this.estForm = { customer_name: '', estimate_number: '', date: '', expiry_date: '', total: 0 };
    this.estEditing = null;
    this.estPanelMode = 'create';
  }

  openEstEdit(est: any) {
    this.estForm = {
      customer_name: est.customer_name ?? '',
      estimate_number: est.estimate_number ?? '',
      date: est.date ?? '',
      expiry_date: est.expiry_date ?? '',
      total: est.total ?? 0,
    };
    this.estEditing = est;
    this.estPanelMode = 'edit';
  }

  cancelEstPanel() { this.estPanelMode = 'hidden'; this.estEditing = null; }

  async saveEstCreate() {
    if (!this.estForm.customer_name) { this.toast('Customer name is required.', true); return; }
    this.estLoading.set(true);
    try {
      await firstValueFrom(this.invoiceSvc.createEstimate(this.estForm));
      this.toast('Estimate created.');
      this.cancelEstPanel();
      await this.loadEstimates();
    } catch (e: any) {
      this.toast('Error: ' + (e?.error?.message ?? e?.message ?? 'Unknown error'), true);
    } finally { this.estLoading.set(false); }
  }

  async saveEstEdit() {
    this.estLoading.set(true);
    try {
      const id = this.estEditing?.estimate_id ?? this.estEditing?.id;
      await firstValueFrom(this.invoiceSvc.updateEstimate(id, this.estForm));
      this.toast('Estimate updated.');
      this.cancelEstPanel();
      await this.loadEstimates();
    } catch (e: any) {
      this.toast('Error: ' + (e?.error?.message ?? e?.message ?? 'Unknown error'), true);
    } finally { this.estLoading.set(false); }
  }

  async deleteEst(est: any) {
    if (!confirm(`Delete estimate "${est.estimate_number}"?`)) return;
    this.estLoading.set(true);
    try {
      await firstValueFrom(this.invoiceSvc.deleteEstimate(est.estimate_id ?? est.id));
      this.toast('Estimate deleted.');
      await this.loadEstimates();
    } catch (e: any) {
      this.toast('Error: ' + (e?.error?.message ?? e?.message ?? 'Unknown error'), true);
    } finally { this.estLoading.set(false); }
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  TAB 4  Recurring Invoices
  // ══════════════════════════════════════════════════════════════════════════

  recLoading = signal(false);
  recurringInvoices = signal<any[]>([]);
  recPanelMode: PanelMode = 'hidden';
  recForm = { customer_name: '', recurrence_name: '', total: 0 };
  readonly recColumns = ['recurrence_name', 'customer_name', 'total', 'status', 'actions'];

  async loadRecurring() {
    this.recLoading.set(true);
    try {
      const res = await firstValueFrom(this.invoiceSvc.listRecurringInvoices()) as any;
      const list = res?.data ?? res?.recurring_invoices ?? [];
      this.recurringInvoices.set(Array.isArray(list) ? list : []);
    } catch (e: any) {
      this.toast('Failed to load recurring invoices: ' + (e?.message ?? e), true);
    } finally { this.recLoading.set(false); }
  }

  openRecCreate() {
    this.recForm = { customer_name: '', recurrence_name: '', total: 0 };
    this.recPanelMode = 'create';
  }

  cancelRecPanel() { this.recPanelMode = 'hidden'; }

  async saveRecCreate() {
    if (!this.recForm.customer_name) { this.toast('Customer name is required.', true); return; }
    this.recLoading.set(true);
    try {
      await firstValueFrom(this.invoiceSvc.createRecurringInvoice(this.recForm));
      this.toast('Recurring invoice created.');
      this.cancelRecPanel();
      await this.loadRecurring();
    } catch (e: any) {
      this.toast('Error: ' + (e?.error?.message ?? e?.message ?? 'Unknown error'), true);
    } finally { this.recLoading.set(false); }
  }

  async deleteRec(rec: any) {
    if (!confirm(`Delete recurring invoice "${rec.recurrence_name}"?`)) return;
    this.recLoading.set(true);
    try {
      await firstValueFrom(this.invoiceSvc.deleteRecurringInvoice(rec.recurring_invoice_id ?? rec.id));
      this.toast('Recurring invoice deleted.');
      await this.loadRecurring();
    } catch (e: any) {
      this.toast('Error: ' + (e?.error?.message ?? e?.message ?? 'Unknown error'), true);
    } finally { this.recLoading.set(false); }
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  TAB 5  Payments
  // ══════════════════════════════════════════════════════════════════════════

  payLoading = signal(false);
  payments = signal<any[]>([]);
  payPanelMode: PanelMode = 'hidden';
  payForm = { customer_name: '', amount: 0, date: '', payment_mode: '' };
  readonly payColumns = ['payment_number', 'customer_name', 'date', 'amount', 'payment_mode', 'actions'];

  async loadPayments() {
    this.payLoading.set(true);
    try {
      const res = await firstValueFrom(this.invoiceSvc.listPayments()) as any;
      const list = res?.data ?? res?.payments ?? [];
      this.payments.set(Array.isArray(list) ? list : []);
    } catch (e: any) {
      this.toast('Failed to load payments: ' + (e?.message ?? e), true);
    } finally { this.payLoading.set(false); }
  }

  openPayCreate() {
    this.payForm = { customer_name: '', amount: 0, date: '', payment_mode: '' };
    this.payPanelMode = 'create';
  }

  cancelPayPanel() { this.payPanelMode = 'hidden'; }

  async savePayCreate() {
    if (!this.payForm.customer_name || !this.payForm.amount) {
      this.toast('Customer and amount are required.', true); return;
    }
    this.payLoading.set(true);
    try {
      await firstValueFrom(this.invoiceSvc.createPayment(this.payForm));
      this.toast('Payment created.');
      this.cancelPayPanel();
      await this.loadPayments();
    } catch (e: any) {
      this.toast('Error: ' + (e?.error?.message ?? e?.message ?? 'Unknown error'), true);
    } finally { this.payLoading.set(false); }
  }

  async deletePay(p: any) {
    if (!confirm(`Delete payment "${p.payment_number}"?`)) return;
    this.payLoading.set(true);
    try {
      await firstValueFrom(this.invoiceSvc.deletePayment(p.payment_id ?? p.id));
      this.toast('Payment deleted.');
      await this.loadPayments();
    } catch (e: any) {
      this.toast('Error: ' + (e?.error?.message ?? e?.message ?? 'Unknown error'), true);
    } finally { this.payLoading.set(false); }
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────
  private toast(msg: string, error = false) {
    this.snack.open(msg, 'Close', {
      duration: 4000,
      panelClass: error ? ['snack-error'] : ['snack-ok'],
    });
  }
}

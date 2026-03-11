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
import { ZohoBooksService } from '../../services/zoho-books.service';

type PanelMode = 'hidden' | 'create' | 'edit';

@Component({
  selector: 'app-books-management',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatTabsModule, MatTableModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatSnackBarModule, MatProgressSpinnerModule, MatTooltipModule,
    MatCardModule, MatDividerModule, MatChipsModule,
  ],
  templateUrl: './books-management.component.html',
  styleUrl:    './books-management.component.scss',
})
export class BooksManagementComponent implements OnInit {
  private readonly booksSvc = inject(ZohoBooksService);
  private readonly snack = inject(MatSnackBar);
  private readonly cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    this.loadContacts();
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  TAB 1  Contacts
  // ══════════════════════════════════════════════════════════════════════════

  ctLoading = signal(false);
  contacts = signal<any[]>([]);
  ctPanelMode: PanelMode = 'hidden';
  ctEditing: any = null;
  ctForm = { contact_name: '', company_name: '', email: '', phone: '' };
  readonly ctColumns = ['contact_name', 'company_name', 'email', 'phone', 'actions'];

  async loadContacts() {
    this.ctLoading.set(true);
    try {
      const res = await firstValueFrom(this.booksSvc.listContacts()) as any;
      const list = res?.data ?? res?.contacts ?? [];
      this.contacts.set(Array.isArray(list) ? list : []);
    } catch (e: any) {
      this.toast('Failed to load contacts: ' + (e?.message ?? e), true);
    } finally { this.ctLoading.set(false); }
  }

  openCtCreate() {
    this.ctForm = { contact_name: '', company_name: '', email: '', phone: '' };
    this.ctEditing = null;
    this.ctPanelMode = 'create';
  }

  openCtEdit(c: any) {
    this.ctForm = {
      contact_name: c.contact_name ?? '',
      company_name: c.company_name ?? '',
      email: c.email ?? '',
      phone: c.phone ?? '',
    };
    this.ctEditing = c;
    this.ctPanelMode = 'edit';
  }

  cancelCtPanel() { this.ctPanelMode = 'hidden'; this.ctEditing = null; }

  async saveCtCreate() {
    if (!this.ctForm.contact_name) { this.toast('Contact name is required.', true); return; }
    this.ctLoading.set(true);
    try {
      await firstValueFrom(this.booksSvc.createContact(this.ctForm));
      this.toast('Contact created.');
      this.cancelCtPanel();
      await this.loadContacts();
    } catch (e: any) {
      this.toast('Error: ' + (e?.error?.message ?? e?.message ?? 'Unknown error'), true);
    } finally { this.ctLoading.set(false); }
  }

  async saveCtEdit() {
    this.ctLoading.set(true);
    try {
      const id = this.ctEditing?.contact_id ?? this.ctEditing?.id;
      await firstValueFrom(this.booksSvc.updateContact(id, this.ctForm));
      this.toast('Contact updated.');
      this.cancelCtPanel();
      await this.loadContacts();
    } catch (e: any) {
      this.toast('Error: ' + (e?.error?.message ?? e?.message ?? 'Unknown error'), true);
    } finally { this.ctLoading.set(false); }
  }

  async deleteCt(c: any) {
    if (!confirm(`Delete contact "${c.contact_name}"?`)) return;
    this.ctLoading.set(true);
    try {
      await firstValueFrom(this.booksSvc.deleteContact(c.contact_id ?? c.id));
      this.toast('Contact deleted.');
      await this.loadContacts();
    } catch (e: any) {
      this.toast('Error: ' + (e?.error?.message ?? e?.message ?? 'Unknown error'), true);
    } finally { this.ctLoading.set(false); }
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
      const res = await firstValueFrom(this.booksSvc.listInvoices()) as any;
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
      await firstValueFrom(this.booksSvc.createInvoice(this.invForm));
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
      await firstValueFrom(this.booksSvc.updateInvoice(id, this.invForm));
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
      await firstValueFrom(this.booksSvc.deleteInvoice(inv.invoice_id ?? inv.id));
      this.toast('Invoice deleted.');
      await this.loadInvoices();
    } catch (e: any) {
      this.toast('Error: ' + (e?.error?.message ?? e?.message ?? 'Unknown error'), true);
    } finally { this.invLoading.set(false); }
  }

  async sendInv(inv: any) {
    this.invLoading.set(true);
    try {
      await firstValueFrom(this.booksSvc.sendInvoice(inv.invoice_id ?? inv.id));
      this.toast('Invoice sent.');
      await this.loadInvoices();
    } catch (e: any) {
      this.toast('Error: ' + (e?.error?.message ?? e?.message ?? 'Unknown error'), true);
    } finally { this.invLoading.set(false); }
  }

  async voidInv(inv: any) {
    if (!confirm(`Void invoice "${inv.invoice_number}"?`)) return;
    this.invLoading.set(true);
    try {
      await firstValueFrom(this.booksSvc.voidInvoice(inv.invoice_id ?? inv.id));
      this.toast('Invoice voided.');
      await this.loadInvoices();
    } catch (e: any) {
      this.toast('Error: ' + (e?.error?.message ?? e?.message ?? 'Unknown error'), true);
    } finally { this.invLoading.set(false); }
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  TAB 3  Bills
  // ══════════════════════════════════════════════════════════════════════════

  billLoading = signal(false);
  bills = signal<any[]>([]);
  billPanelMode: PanelMode = 'hidden';
  billEditing: any = null;
  billForm = { vendor_name: '', bill_number: '', date: '', due_date: '', total: 0 };
  readonly billColumns = ['bill_number', 'vendor_name', 'date', 'due_date', 'total', 'status', 'actions'];

  async loadBills() {
    this.billLoading.set(true);
    try {
      const res = await firstValueFrom(this.booksSvc.listBills()) as any;
      const list = res?.data ?? res?.bills ?? [];
      this.bills.set(Array.isArray(list) ? list : []);
    } catch (e: any) {
      this.toast('Failed to load bills: ' + (e?.message ?? e), true);
    } finally { this.billLoading.set(false); }
  }

  openBillCreate() {
    this.billForm = { vendor_name: '', bill_number: '', date: '', due_date: '', total: 0 };
    this.billEditing = null;
    this.billPanelMode = 'create';
  }

  openBillEdit(b: any) {
    this.billForm = {
      vendor_name: b.vendor_name ?? '',
      bill_number: b.bill_number ?? '',
      date: b.date ?? '',
      due_date: b.due_date ?? '',
      total: b.total ?? 0,
    };
    this.billEditing = b;
    this.billPanelMode = 'edit';
  }

  cancelBillPanel() { this.billPanelMode = 'hidden'; this.billEditing = null; }

  async saveBillCreate() {
    if (!this.billForm.vendor_name) { this.toast('Vendor name is required.', true); return; }
    this.billLoading.set(true);
    try {
      await firstValueFrom(this.booksSvc.createBill(this.billForm));
      this.toast('Bill created.');
      this.cancelBillPanel();
      await this.loadBills();
    } catch (e: any) {
      this.toast('Error: ' + (e?.error?.message ?? e?.message ?? 'Unknown error'), true);
    } finally { this.billLoading.set(false); }
  }

  async saveBillEdit() {
    this.billLoading.set(true);
    try {
      const id = this.billEditing?.bill_id ?? this.billEditing?.id;
      await firstValueFrom(this.booksSvc.updateBill(id, this.billForm));
      this.toast('Bill updated.');
      this.cancelBillPanel();
      await this.loadBills();
    } catch (e: any) {
      this.toast('Error: ' + (e?.error?.message ?? e?.message ?? 'Unknown error'), true);
    } finally { this.billLoading.set(false); }
  }

  async deleteBill(b: any) {
    if (!confirm(`Delete bill "${b.bill_number}"?`)) return;
    this.billLoading.set(true);
    try {
      await firstValueFrom(this.booksSvc.deleteBill(b.bill_id ?? b.id));
      this.toast('Bill deleted.');
      await this.loadBills();
    } catch (e: any) {
      this.toast('Error: ' + (e?.error?.message ?? e?.message ?? 'Unknown error'), true);
    } finally { this.billLoading.set(false); }
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  TAB 4  Expenses
  // ══════════════════════════════════════════════════════════════════════════

  expLoading = signal(false);
  expenses = signal<any[]>([]);
  expPanelMode: PanelMode = 'hidden';
  expEditing: any = null;
  expForm = { account_name: '', description: '', amount: 0, date: '' };
  readonly expColumns = ['account_name', 'description', 'date', 'amount', 'actions'];

  async loadExpenses() {
    this.expLoading.set(true);
    try {
      const res = await firstValueFrom(this.booksSvc.listExpenses()) as any;
      const list = res?.data ?? res?.expenses ?? [];
      this.expenses.set(Array.isArray(list) ? list : []);
    } catch (e: any) {
      this.toast('Failed to load expenses: ' + (e?.message ?? e), true);
    } finally { this.expLoading.set(false); }
  }

  openExpCreate() {
    this.expForm = { account_name: '', description: '', amount: 0, date: '' };
    this.expEditing = null;
    this.expPanelMode = 'create';
  }

  openExpEdit(exp: any) {
    this.expForm = {
      account_name: exp.account_name ?? '',
      description: exp.description ?? '',
      amount: exp.amount ?? exp.total ?? 0,
      date: exp.date ?? '',
    };
    this.expEditing = exp;
    this.expPanelMode = 'edit';
  }

  cancelExpPanel() { this.expPanelMode = 'hidden'; this.expEditing = null; }

  async saveExpCreate() {
    if (!this.expForm.account_name) { this.toast('Account name is required.', true); return; }
    this.expLoading.set(true);
    try {
      await firstValueFrom(this.booksSvc.createExpense(this.expForm));
      this.toast('Expense created.');
      this.cancelExpPanel();
      await this.loadExpenses();
    } catch (e: any) {
      this.toast('Error: ' + (e?.error?.message ?? e?.message ?? 'Unknown error'), true);
    } finally { this.expLoading.set(false); }
  }

  async saveExpEdit() {
    this.expLoading.set(true);
    try {
      const id = this.expEditing?.expense_id ?? this.expEditing?.id;
      await firstValueFrom(this.booksSvc.updateExpense(id, this.expForm));
      this.toast('Expense updated.');
      this.cancelExpPanel();
      await this.loadExpenses();
    } catch (e: any) {
      this.toast('Error: ' + (e?.error?.message ?? e?.message ?? 'Unknown error'), true);
    } finally { this.expLoading.set(false); }
  }

  async deleteExp(exp: any) {
    if (!confirm(`Delete expense "${exp.description || exp.account_name}"?`)) return;
    this.expLoading.set(true);
    try {
      await firstValueFrom(this.booksSvc.deleteExpense(exp.expense_id ?? exp.id));
      this.toast('Expense deleted.');
      await this.loadExpenses();
    } catch (e: any) {
      this.toast('Error: ' + (e?.error?.message ?? e?.message ?? 'Unknown error'), true);
    } finally { this.expLoading.set(false); }
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────
  private toast(msg: string, error = false) {
    this.snack.open(msg, 'Close', {
      duration: 4000,
      panelClass: error ? ['snack-error'] : ['snack-ok'],
    });
  }
}

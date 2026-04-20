import { ZohoBaseClient } from "../base/ZohoBaseClient";
import { ZohoCredentials, ZOHO_API_BASE, ZohoRegion } from "../base/types";
import {
  BooksContact, CreateBooksContactDTO, UpdateBooksContactDTO,
  BooksInvoice, CreateBooksInvoiceDTO, UpdateBooksInvoiceDTO,
  BooksBill, CreateBillDTO, UpdateBillDTO,
  BooksExpense, CreateBooksExpenseDTO, UpdateBooksExpenseDTO,
  BooksPayment, CreateBooksPaymentDTO,
  BooksItem, CreateBooksItemDTO, UpdateBooksItemDTO,
  BooksRecurringInvoice, CreateRecurringInvoiceDTO, UpdateRecurringInvoiceDTO,
  RecurringInvoiceComment,
  BooksListParams,
} from "./zoho-books.dto";

export interface ZohoBooksConfig extends ZohoCredentials {
  organizationId: string;
  region?: ZohoRegion;
  apiBaseUrl?: string;
}

/**
 * Zoho Books v3 API client.
 * Docs: https://www.zoho.com/books/api/v3/
 */
export class ZohoBooksClient extends ZohoBaseClient {
  constructor(config: ZohoBooksConfig) {
    const region = config.region ?? "com";
    super({
      ...config,
      apiBaseUrl: config.apiBaseUrl ?? `${ZOHO_API_BASE[region]}/books/v3`,
      defaultParams: { organization_id: config.organizationId },
    });
  }

  // â”€â”€â”€ Contacts â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  listContacts(params?: BooksListParams): Promise<{ contacts: BooksContact[]; page_context?: unknown }> {
    return this.get("/contacts", { params });
  }
  getContact(id: string): Promise<{ contact: BooksContact }> {
    return this.get(`/contacts/${id}`);
  }
  createContact(data: CreateBooksContactDTO): Promise<{ contact: BooksContact }> {
    return this.post("/contacts", data);
  }
  updateContact(id: string, data: UpdateBooksContactDTO): Promise<{ contact: BooksContact }> {
    return this.put(`/contacts/${id}`, data);
  }
  deleteContact(id: string): Promise<{ message: string }> {
    return this.delete(`/contacts/${id}`);
  }

  // â”€â”€â”€ Invoices â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  listInvoices(params?: BooksListParams): Promise<{ invoices: BooksInvoice[] }> {
    return this.get("/invoices", { params });
  }
  getInvoice(id: string): Promise<{ invoice: BooksInvoice }> {
    return this.get(`/invoices/${id}`);
  }
  createInvoice(data: CreateBooksInvoiceDTO): Promise<{ invoice: BooksInvoice }> {
    return this.post("/invoices", data);
  }
  updateInvoice(id: string, data: UpdateBooksInvoiceDTO): Promise<{ invoice: BooksInvoice }> {
    return this.put(`/invoices/${id}`, data);
  }
  deleteInvoice(id: string): Promise<{ message: string }> {
    return this.delete(`/invoices/${id}`);
  }
  sendInvoice(id: string, emailData?: Record<string, unknown>): Promise<{ message: string }> {
    return this.post(`/invoices/${id}/email`, emailData ?? {});
  }
  markInvoiceAsSent(id: string): Promise<{ message: string }> {
    return this.post(`/invoices/${id}/status/sent`, {});
  }
  voidInvoice(id: string): Promise<{ message: string }> {
    return this.post(`/invoices/${id}/status/void`, {});
  }

  // â”€â”€â”€ Bills â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  listBills(params?: BooksListParams): Promise<{ bills: BooksBill[] }> {
    return this.get("/bills", { params });
  }
  getBill(id: string): Promise<{ bill: BooksBill }> {
    return this.get(`/bills/${id}`);
  }
  createBill(data: CreateBillDTO): Promise<{ bill: BooksBill }> {
    return this.post("/bills", data);
  }
  updateBill(id: string, data: UpdateBillDTO): Promise<{ bill: BooksBill }> {
    return this.put(`/bills/${id}`, data);
  }
  deleteBill(id: string): Promise<{ message: string }> {
    return this.delete(`/bills/${id}`);
  }

  // â”€â”€â”€ Expenses â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  listExpenses(params?: BooksListParams): Promise<{ expenses: BooksExpense[] }> {
    return this.get("/expenses", { params });
  }
  getExpense(id: string): Promise<{ expense: BooksExpense }> {
    return this.get(`/expenses/${id}`);
  }
  createExpense(data: CreateBooksExpenseDTO): Promise<{ expense: BooksExpense }> {
    return this.post("/expenses", data);
  }
  updateExpense(id: string, data: UpdateBooksExpenseDTO): Promise<{ expense: BooksExpense }> {
    return this.put(`/expenses/${id}`, data);
  }
  deleteExpense(id: string): Promise<{ message: string }> {
    return this.delete(`/expenses/${id}`);
  }

  // â”€â”€â”€ Payments â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  listPayments(params?: BooksListParams): Promise<{ customerpayments: BooksPayment[] }> {
    return this.get("/customerpayments", { params });
  }
  getPayment(id: string): Promise<{ payment: BooksPayment }> {
    return this.get(`/customerpayments/${id}`);
  }
  createPayment(data: CreateBooksPaymentDTO): Promise<{ payment: BooksPayment }> {
    return this.post("/customerpayments", data);
  }
  deletePayment(id: string): Promise<{ message: string }> {
    return this.delete(`/customerpayments/${id}`);
  }

  // â”€â”€â”€ Items â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  listItems(params?: BooksListParams): Promise<{ items: BooksItem[] }> {
    return this.get("/items", { params });
  }
  getItem(id: string): Promise<{ item: BooksItem }> {
    return this.get(`/items/${id}`);
  }
  createItem(data: CreateBooksItemDTO): Promise<{ item: BooksItem }> {
    return this.post("/items", data);
  }
  updateItem(id: string, data: UpdateBooksItemDTO): Promise<{ item: BooksItem }> {
    return this.put(`/items/${id}`, data);
  }
  deleteItem(id: string): Promise<{ message: string }> {
    return this.delete(`/items/${id}`);
  }

  // ─── Recurring Invoices ────────────────────────────────────────────────────────

  listRecurringInvoices(params?: BooksListParams): Promise<{ recurring_invoices: BooksRecurringInvoice[] }> {
    return this.get("/recurringinvoices", { params });
  }
  getRecurringInvoice(id: string): Promise<{ recurring_invoice: BooksRecurringInvoice }> {
    return this.get(`/recurringinvoices/${id}`);
  }
  createRecurringInvoice(data: CreateRecurringInvoiceDTO): Promise<{ recurring_invoice: BooksRecurringInvoice }> {
    return this.post("/recurringinvoices", data);
  }
  updateRecurringInvoice(id: string, data: UpdateRecurringInvoiceDTO): Promise<{ recurring_invoice: BooksRecurringInvoice }> {
    return this.put(`/recurringinvoices/${id}`, data);
  }
  updateRecurringInvoices(data: unknown): Promise<{ recurring_invoices: BooksRecurringInvoice[] }> {
    return this.put("/recurringinvoices", data);
  }
  deleteRecurringInvoice(id: string): Promise<{ message: string }> {
    return this.delete(`/recurringinvoices/${id}`);
  }
  stopRecurringInvoice(id: string): Promise<{ message: string }> {
    return this.post(`/recurringinvoices/${id}/status/stop`, {});
  }
  resumeRecurringInvoice(id: string): Promise<{ message: string }> {
    return this.post(`/recurringinvoices/${id}/status/resume`, {});
  }
  updateRecurringInvoiceTemplate(id: string, templateId: string): Promise<{ message: string }> {
    return this.put(`/recurringinvoices/${id}/templates/${templateId}`, {});
  }
  listRecurringInvoiceComments(id: string): Promise<{ comments: RecurringInvoiceComment[] }> {
    return this.get(`/recurringinvoices/${id}/comments`);
  }
}

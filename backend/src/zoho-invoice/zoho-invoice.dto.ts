import { ZohoAddress, ZohoTax, ZohoListParams } from "../shared/shared.dto";
import { BooksLineItem, InvoiceStatus } from "./../zoho-books/zoho-books.dto";

// â”€â”€â”€ Customer â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface InvoiceCustomer {
  customer_id: string;
  customer_name: string;
  email?: string;
  phone?: string;
  billing_address?: ZohoAddress;
  shipping_address?: ZohoAddress;
  currency_code?: string;
  created_time?: string;
}

export interface CreateInvoiceCustomerDTO {
  customer_name: string;
  email?: string;
  phone?: string;
  billing_address?: ZohoAddress;
  shipping_address?: ZohoAddress;
  currency_code?: string;
}

export type UpdateInvoiceCustomerDTO = Partial<CreateInvoiceCustomerDTO>;

// â”€â”€â”€ Invoice â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface InvoiceRecord {
  invoice_id: string;
  invoice_number?: string;
  customer_id: string;
  customer_name?: string;
  status?: InvoiceStatus;
  date?: string;
  due_date?: string;
  line_items: BooksLineItem[];
  sub_total?: number;
  total?: number;
  balance?: number;
  taxes?: ZohoTax[];
  notes?: string;
  terms?: string;
  created_time?: string;
  last_modified_time?: string;
}

export interface CreateInvoiceRecordDTO {
  customer_id: string;
  invoice_number?: string;
  date?: string;
  due_date?: string;
  line_items: BooksLineItem[];
  notes?: string;
  terms?: string;
}

export type UpdateInvoiceRecordDTO = Partial<CreateInvoiceRecordDTO>;

// â”€â”€â”€ Estimate â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type EstimateStatus = "draft" | "sent" | "accepted" | "declined" | "invoiced" | "expired";

export interface InvoiceEstimate {
  estimate_id: string;
  estimate_number?: string;
  customer_id: string;
  status?: EstimateStatus;
  date?: string;
  expiry_date?: string;
  line_items: BooksLineItem[];
  total?: number;
  created_time?: string;
}

export interface CreateInvoiceEstimateDTO {
  customer_id: string;
  date?: string;
  expiry_date?: string;
  line_items: BooksLineItem[];
  notes?: string;
}

export type UpdateInvoiceEstimateDTO = Partial<CreateInvoiceEstimateDTO>;

// â”€â”€â”€ RecurringInvoice â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface RecurringInvoice {
  recurring_invoice_id: string;
  recurrence_name: string;
  customer_id: string;
  status?: "active" | "expired" | "stopped";
  start_date?: string;
  end_date?: string;
  recurrence_frequency?: "days" | "weeks" | "months" | "years";
  repeat_every?: number;
  line_items: BooksLineItem[];
}

export interface CreateRecurringInvoiceDTO {
  customer_id: string;
  recurrence_name: string;
  start_date: string;
  end_date?: string;
  recurrence_frequency?: "days" | "weeks" | "months" | "years";
  repeat_every?: number;
  line_items: BooksLineItem[];
}

// â”€â”€â”€ Payment â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface InvoicePayment {
  payment_id: string;
  customer_id: string;
  payment_mode?: string;
  amount: number;
  date?: string;
  reference_number?: string;
  invoices?: { invoice_id: string; amount_applied: number }[];
}

export interface CreateInvoicePaymentDTO {
  customer_id: string;
  payment_mode: string;
  amount: number;
  date?: string;
  reference_number?: string;
  invoices?: { invoice_id: string; amount_applied: number }[];
}

// â”€â”€â”€ List params â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface InvoiceListParams extends ZohoListParams {
  customer_id?: string;
  status?: string;
  date_start?: string;
  date_end?: string;
  search_text?: string;
}

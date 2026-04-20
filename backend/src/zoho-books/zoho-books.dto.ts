import { ZohoListWrapper, ZohoListParams, ZohoAddress, ZohoTax } from "../shared/shared.dto";

// â”€â”€â”€ Contact â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface BooksContact {
  contact_id: string;
  contact_name: string;
  contact_type: "customer" | "vendor";
  email?: string;
  phone?: string;
  billing_address?: ZohoAddress;
  shipping_address?: ZohoAddress;
  currency_id?: string;
  outstanding_receivable_amount?: number;
  created_time?: string;
  last_modified_time?: string;
}

export type CreateBooksContactDTO = Omit<BooksContact, "contact_id" | "created_time" | "last_modified_time">;
export type UpdateBooksContactDTO = Partial<CreateBooksContactDTO>;

// â”€â”€â”€ LineItem â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface BooksLineItem {
  line_item_id?: string;
  item_id?: string;
  name?: string;
  description?: string;
  quantity: number;
  unit?: string;
  rate: number;
  discount?: number | string;
  tax_id?: string;
  tax_percentage?: number;
  item_total?: number;
}

// â”€â”€â”€ Invoice â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type InvoiceStatus = "draft" | "sent" | "overdue" | "paid" | "void" | "partially_paid";

export interface BooksInvoice {
  invoice_id: string;
  invoice_number?: string;
  customer_id: string;
  customer_name?: string;
  status?: InvoiceStatus;
  date?: string;           // YYYY-MM-DD
  due_date?: string;
  line_items: BooksLineItem[];
  sub_total?: number;
  total?: number;
  balance?: number;
  currency_code?: string;
  notes?: string;
  terms?: string;
  taxes?: ZohoTax[];
  created_time?: string;
  last_modified_time?: string;
}

export interface CreateBooksInvoiceDTO {
  customer_id: string;
  invoice_number?: string;
  date?: string;
  due_date?: string;
  line_items: BooksLineItem[];
  notes?: string;
  terms?: string;
  discount?: number | string;
  taxes?: ZohoTax[];
}

export type UpdateBooksInvoiceDTO = Partial<CreateBooksInvoiceDTO>;

// â”€â”€â”€ Bill â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type BillStatus = "open" | "overdue" | "paid" | "void" | "partially_paid";

export interface BooksBill {
  bill_id: string;
  bill_number?: string;
  vendor_id: string;
  vendor_name?: string;
  status?: BillStatus;
  date?: string;
  due_date?: string;
  line_items: BooksLineItem[];
  total?: number;
  balance?: number;
  created_time?: string;
  last_modified_time?: string;
}

export interface CreateBillDTO {
  vendor_id: string;
  bill_number?: string;
  date?: string;
  due_date?: string;
  line_items: BooksLineItem[];
}

export type UpdateBillDTO = Partial<CreateBillDTO>;

// â”€â”€â”€ Expense â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface BooksExpense {
  expense_id: string;
  account_id: string;
  date?: string;
  amount: number;
  tax_amount?: number;
  total?: number;
  description?: string;
  vendor_id?: string;
  created_time?: string;
  last_modified_time?: string;
}

export interface CreateBooksExpenseDTO {
  account_id: string;
  date?: string;
  amount: number;
  description?: string;
  vendor_id?: string;
}

export type UpdateBooksExpenseDTO = Partial<CreateBooksExpenseDTO>;

// â”€â”€â”€ Payment (Customer Payment) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface BooksPayment {
  payment_id: string;
  customer_id: string;
  payment_mode?: string;
  amount: number;
  date?: string;
  reference_number?: string;
  invoices?: { invoice_id: string; amount_applied: number }[];
  created_time?: string;
}

export interface CreateBooksPaymentDTO {
  customer_id: string;
  payment_mode: string;
  amount: number;
  date?: string;
  reference_number?: string;
  invoices?: { invoice_id: string; amount_applied: number }[];
}

// â”€â”€â”€ Item (product/service catalogue) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface BooksItem {
  item_id: string;
  name: string;
  rate: number;
  description?: string;
  unit?: string;
  tax_id?: string;
  product_type?: "goods" | "service";
  status?: "active" | "inactive";
}

export interface CreateBooksItemDTO {
  name: string;
  rate: number;
  description?: string;
  unit?: string;
  tax_id?: string;
  product_type?: "goods" | "service";
}

export type UpdateBooksItemDTO = Partial<CreateBooksItemDTO>;

// ─── Recurring Invoice ──────────────────────────────────────────────────

export interface RecurringInvoiceContactPerson {
  contact_person_id: number;
  contact_person_name?: string;
  first_name?: string;
  last_name?: string;
  contact_person_email?: string;
  phone?: string;
  mobile?: string;
  communication_preference?: { is_email_enabled?: boolean; is_whatsapp_enabled?: boolean };
}

export interface RecurringInvoiceTag {
  tag_id: string;
  tag_name?: string;
  tag_option_id?: string;
  tag_option_name?: string;
  is_tag_mandatory?: boolean;
}

export interface RecurringInvoiceLineItem {
  line_item_id?: string;
  quantity: number;
  name?: string;
  item_total?: number;
  sku?: string;
  product_type?: string;
  sat_item_key_code?: number;
  unitkey_code?: string;
  location_id?: string;
  location_name?: string;
  tags?: RecurringInvoiceTag[];
  tax_id?: string;
  tax_treatment_code?: string;
  project_id?: number;
  project_name?: string;
  header_name?: string;
  header_id?: number;
}

export interface RecurringInvoiceCustomField {
  value: string;
  label: string;
  data_type: string;
}

export interface RecurringInvoicePaymentOptions {
  payment_gateways?: { configured?: boolean; additional_field1?: string; gateway_name?: string }[];
}

export interface BooksRecurringInvoice {
  recurring_invoice_id: string;
  recurrence_name: string;
  reference_number?: string;
  customer_name?: string;
  contact_persons_associated?: RecurringInvoiceContactPerson[];
  is_pre_gst?: boolean;
  gst_no?: string;
  gst_treatment?: string;
  tax_treatment?: string;
  is_reverse_charge_applied?: boolean;
  cfdi_usage?: string;
  vat_treatment?: string;
  place_of_supply?: string;
  customer_id: string;
  currency_id?: string;
  currency_code?: string;
  start_date?: string;
  end_date?: string;
  last_sent_date?: string;
  next_invoice_date?: string;
  location_id?: string;
  location_name?: string;
  tags?: RecurringInvoiceTag[];
  line_items: RecurringInvoiceLineItem[];
  billing_address?: ZohoAddress;
  shipping_address?: ZohoAddress;
  custom_fields?: RecurringInvoiceCustomField[];
  payment_options?: RecurringInvoicePaymentOptions;
  avatax_exempt_no?: string;
  avatax_use_code?: string;
  status?: string;
  created_time?: string;
  last_modified_time?: string;
}

export interface CreateRecurringInvoiceDTO {
  recurrence_name: string;
  customer_id: string;
  reference_number?: string;
  start_date?: string;
  end_date?: string;
  line_items: RecurringInvoiceLineItem[];
  billing_address?: ZohoAddress;
  shipping_address?: ZohoAddress;
  custom_fields?: RecurringInvoiceCustomField[];
  payment_options?: RecurringInvoicePaymentOptions;
  gst_no?: string;
  gst_treatment?: string;
  tax_treatment?: string;
  place_of_supply?: string;
  vat_treatment?: string;
  tags?: RecurringInvoiceTag[];
}

export type UpdateRecurringInvoiceDTO = Partial<CreateRecurringInvoiceDTO>;

export interface RecurringInvoiceComment {
  comment_id: string;
  description?: string;
  commented_by?: string;
  date?: string;
  time?: string;
}

export interface BooksListParams extends ZohoListParams {
  customer_id?: string;
  vendor_id?: string;
  status?: string;
  date_start?: string;
  date_end?: string;
  search_text?: string;
}

export type { ZohoListWrapper, ZohoListParams };

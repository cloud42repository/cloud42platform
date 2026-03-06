import { ZohoBaseClient } from "../base/ZohoBaseClient";
import { ZohoCredentials, ZOHO_API_BASE, ZohoRegion } from "../base/types";
import {
  InvoiceCustomer, CreateInvoiceCustomerDTO, UpdateInvoiceCustomerDTO,
  InvoiceRecord, CreateInvoiceRecordDTO, UpdateInvoiceRecordDTO,
  InvoiceEstimate, CreateInvoiceEstimateDTO, UpdateInvoiceEstimateDTO,
  RecurringInvoice, CreateRecurringInvoiceDTO,
  InvoicePayment, CreateInvoicePaymentDTO,
  InvoiceListParams,
} from "./zoho-invoice.dto";

export interface ZohoInvoiceConfig extends ZohoCredentials {
  organizationId: string;
  region?: ZohoRegion;
  apiBaseUrl?: string;
}

/**
 * Zoho Invoice v3 API client.
 * Docs: https://www.zoho.com/invoice/api/v3/
 */
export class ZohoInvoiceClient extends ZohoBaseClient {
  constructor(config: ZohoInvoiceConfig) {
    const region = config.region ?? "com";
    super({
      ...config,
      apiBaseUrl: config.apiBaseUrl ?? `${ZOHO_API_BASE[region]}/invoice/v3`,
      defaultParams: { organization_id: config.organizationId },
    });
  }

  // â”€â”€â”€ Customers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  listCustomers(params?: InvoiceListParams): Promise<{ customers: InvoiceCustomer[] }> {
    return this.get("/customers", { params });
  }
  getCustomer(id: string): Promise<{ customer: InvoiceCustomer }> {
    return this.get(`/customers/${id}`);
  }
  createCustomer(data: CreateInvoiceCustomerDTO): Promise<{ customer: InvoiceCustomer }> {
    return this.post("/customers", data);
  }
  updateCustomer(id: string, data: UpdateInvoiceCustomerDTO): Promise<{ customer: InvoiceCustomer }> {
    return this.put(`/customers/${id}`, data);
  }
  deleteCustomer(id: string): Promise<{ message: string }> {
    return this.delete(`/customers/${id}`);
  }

  // â”€â”€â”€ Invoices â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  listInvoices(params?: InvoiceListParams): Promise<{ invoices: InvoiceRecord[] }> {
    return this.get("/invoices", { params });
  }
  getInvoice(id: string): Promise<{ invoice: InvoiceRecord }> {
    return this.get(`/invoices/${id}`);
  }
  createInvoice(data: CreateInvoiceRecordDTO): Promise<{ invoice: InvoiceRecord }> {
    return this.post("/invoices", data);
  }
  updateInvoice(id: string, data: UpdateInvoiceRecordDTO): Promise<{ invoice: InvoiceRecord }> {
    return this.put(`/invoices/${id}`, data);
  }
  deleteInvoice(id: string): Promise<{ message: string }> {
    return this.delete(`/invoices/${id}`);
  }
  sendInvoice(id: string): Promise<{ message: string }> {
    return this.post(`/invoices/${id}/email`, {});
  }

  // â”€â”€â”€ Estimates â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  listEstimates(params?: InvoiceListParams): Promise<{ estimates: InvoiceEstimate[] }> {
    return this.get("/estimates", { params });
  }
  getEstimate(id: string): Promise<{ estimate: InvoiceEstimate }> {
    return this.get(`/estimates/${id}`);
  }
  createEstimate(data: CreateInvoiceEstimateDTO): Promise<{ estimate: InvoiceEstimate }> {
    return this.post("/estimates", data);
  }
  updateEstimate(id: string, data: UpdateInvoiceEstimateDTO): Promise<{ estimate: InvoiceEstimate }> {
    return this.put(`/estimates/${id}`, data);
  }
  deleteEstimate(id: string): Promise<{ message: string }> {
    return this.delete(`/estimates/${id}`);
  }

  // â”€â”€â”€ Recurring Invoices â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  listRecurringInvoices(params?: InvoiceListParams): Promise<{ recurring_invoices: RecurringInvoice[] }> {
    return this.get("/recurringinvoices", { params });
  }
  getRecurringInvoice(id: string): Promise<{ recurring_invoice: RecurringInvoice }> {
    return this.get(`/recurringinvoices/${id}`);
  }
  createRecurringInvoice(data: CreateRecurringInvoiceDTO): Promise<{ recurring_invoice: RecurringInvoice }> {
    return this.post("/recurringinvoices", data);
  }
  deleteRecurringInvoice(id: string): Promise<{ message: string }> {
    return this.delete(`/recurringinvoices/${id}`);
  }

  // â”€â”€â”€ Payments â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  listPayments(params?: InvoiceListParams): Promise<{ payments: InvoicePayment[] }> {
    return this.get("/customerpayments", { params });
  }
  createPayment(data: CreateInvoicePaymentDTO): Promise<{ payment: InvoicePayment }> {
    return this.post("/customerpayments", data);
  }
  deletePayment(id: string): Promise<{ message: string }> {
    return this.delete(`/customerpayments/${id}`);
  }
}

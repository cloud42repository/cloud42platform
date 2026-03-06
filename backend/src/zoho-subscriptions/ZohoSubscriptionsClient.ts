import { ZohoBaseClient } from "../base/ZohoBaseClient";
import { ZohoCredentials, ZOHO_API_BASE, ZohoRegion } from "../base/types";
import {
  SubsPlan, CreatePlanDTO, UpdatePlanDTO,
  SubsAddon,
  SubsCoupon,
  SubsCustomer, CreateSubsCustomerDTO, UpdateSubsCustomerDTO,
  Subscription, CreateSubscriptionDTO, UpdateSubscriptionDTO,
  SubsListParams,
} from "./zoho-subscriptions.dto";

export interface ZohoSubscriptionsConfig extends ZohoCredentials {
  organizationId: string;
  region?: ZohoRegion;
  apiBaseUrl?: string;
}

/**
 * Zoho Subscriptions v1 API client.
 * Docs: https://www.zoho.com/subscriptions/api/v1/
 */
export class ZohoSubscriptionsClient extends ZohoBaseClient {
  constructor(config: ZohoSubscriptionsConfig) {
    const region = config.region ?? "com";
    super({
      ...config,
      apiBaseUrl: config.apiBaseUrl ?? `${ZOHO_API_BASE[region]}/subscriptions/v1`,
      defaultParams: { organization_id: config.organizationId },
    });
  }

  // â”€â”€â”€ Plans â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  listPlans(params?: SubsListParams): Promise<{ plans: SubsPlan[] }> {
    return this.get("/plans", { params });
  }
  getPlan(code: string): Promise<{ plan: SubsPlan }> {
    return this.get(`/plans/${code}`);
  }
  createPlan(data: CreatePlanDTO): Promise<{ plan: SubsPlan }> {
    return this.post("/plans", data);
  }
  updatePlan(code: string, data: UpdatePlanDTO): Promise<{ plan: SubsPlan }> {
    return this.put(`/plans/${code}`, data);
  }
  deletePlan(code: string): Promise<{ message: string }> {
    return this.delete(`/plans/${code}`);
  }

  // â”€â”€â”€ Addons â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  listAddons(): Promise<{ addons: SubsAddon[] }> {
    return this.get("/addons");
  }
  getAddon(code: string): Promise<{ addon: SubsAddon }> {
    return this.get(`/addons/${code}`);
  }

  // â”€â”€â”€ Coupons â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  listCoupons(): Promise<{ coupons: SubsCoupon[] }> {
    return this.get("/coupons");
  }
  getCoupon(code: string): Promise<{ coupon: SubsCoupon }> {
    return this.get(`/coupons/${code}`);
  }

  // â”€â”€â”€ Customers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  listCustomers(params?: SubsListParams): Promise<{ customers: SubsCustomer[] }> {
    return this.get("/customers", { params });
  }
  getCustomer(id: string): Promise<{ customer: SubsCustomer }> {
    return this.get(`/customers/${id}`);
  }
  createCustomer(data: CreateSubsCustomerDTO): Promise<{ customer: SubsCustomer }> {
    return this.post("/customers", data);
  }
  updateCustomer(id: string, data: UpdateSubsCustomerDTO): Promise<{ customer: SubsCustomer }> {
    return this.put(`/customers/${id}`, data);
  }
  deleteCustomer(id: string): Promise<{ message: string }> {
    return this.delete(`/customers/${id}`);
  }

  // â”€â”€â”€ Subscriptions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  listSubscriptions(params?: SubsListParams): Promise<{ subscriptions: Subscription[] }> {
    return this.get("/subscriptions", { params });
  }
  getSubscription(id: string): Promise<{ subscription: Subscription }> {
    return this.get(`/subscriptions/${id}`);
  }
  createSubscription(data: CreateSubscriptionDTO): Promise<{ subscription: Subscription }> {
    return this.post("/subscriptions", data);
  }
  updateSubscription(id: string, data: UpdateSubscriptionDTO): Promise<{ subscription: Subscription }> {
    return this.put(`/subscriptions/${id}`, data);
  }
  cancelSubscription(id: string): Promise<{ subscription: Subscription }> {
    return this.post(`/subscriptions/${id}/cancel`, {});
  }
  reactivateSubscription(id: string): Promise<{ subscription: Subscription }> {
    return this.post(`/subscriptions/${id}/reactivate`, {});
  }
}

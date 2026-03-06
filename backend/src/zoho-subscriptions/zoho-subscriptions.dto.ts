import { ZohoAddress, ZohoListParams } from "../shared/shared.dto";

// â”€â”€â”€ Plan â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type BillingInterval = "monthly" | "yearly" | "weekly" | "every_2_months" | "quarterly" | "every_6_months";

export interface SubsPlan {
  plan_code: string;
  name: string;
  description?: string;
  price: number;
  interval?: BillingInterval;
  interval_unit?: number;
  trial_period?: number;
  status?: "active" | "inactive";
}

export interface CreatePlanDTO {
  plan_code: string;
  name: string;
  price: number;
  interval?: BillingInterval;
  trial_period?: number;
}

export type UpdatePlanDTO = Partial<Omit<CreatePlanDTO, "plan_code">>;

// â”€â”€â”€ Addon â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface SubsAddon {
  addon_code: string;
  name: string;
  type?: "recurring" | "one_time";
  price_brackets?: { price: number; quantity?: number }[];
}

// â”€â”€â”€ Coupon â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type DiscountType = "percentage" | "absolute";
export type DurationType = "limited_period" | "forever" | "one_time";

export interface SubsCoupon {
  coupon_code: string;
  name?: string;
  discount_type?: DiscountType;
  discount_percentage?: number;
  discount_amount?: number;
  duration_type?: DurationType;
  max_redemptions?: number;
  redemptions?: number;
  expires_at?: string;
  status?: "active" | "inactive";
}

// â”€â”€â”€ Customer â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface SubsCustomer {
  customer_id: string;
  display_name: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  billing_address?: ZohoAddress;
  shipping_address?: ZohoAddress;
  status?: "active" | "inactive";
  outstanding?: number;
  created_time?: string;
}

export interface CreateSubsCustomerDTO {
  display_name: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  billing_address?: ZohoAddress;
}

export type UpdateSubsCustomerDTO = Partial<CreateSubsCustomerDTO>;

// â”€â”€â”€ Subscription â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type SubscriptionStatus = "all" | "active" | "live" | "trial" | "future" | "non_renewing" | "cancelled" | "expired" | "past_due";

export interface Subscription {
  subscription_id: string;
  subscription_number?: string;
  customer_id: string;
  customer_name?: string;
  plan_code: string;
  plan_name?: string;
  status?: SubscriptionStatus;
  starts_at?: string;
  activated_at?: string;
  current_term_starts_at?: string;
  current_term_ends_at?: string;
  next_billing_at?: string;
  sub_total?: number;
  total?: number;
  addons?: { addon_code: string; quantity?: number }[];
  coupon_code?: string;
  created_time?: string;
}

export interface CreateSubscriptionDTO {
  customer_id: string;
  plan_code: string;
  starts_at?: string;
  addons?: { addon_code: string; quantity?: number }[];
  coupon_code?: string;
  auto_collect?: boolean;
}

export type UpdateSubscriptionDTO = Partial<CreateSubscriptionDTO>;

// â”€â”€â”€ List params â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface SubsListParams extends ZohoListParams {
  status?: SubscriptionStatus;
  search_text?: string;
}

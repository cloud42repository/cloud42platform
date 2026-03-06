import { ZohoAddress, ZohoListParams } from "../shared/shared.dto";

// â”€â”€â”€ Product â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type CommerceProductStatus = "active" | "inactive" | "draft";

export interface CommerceProduct {
  product_id?: string;
  name?: string;
  description?: string;
  sku?: string;
  price?: number;
  compare_at_price?: number;
  status?: CommerceProductStatus;
  category_id?: string;
  images?: string[];
  tags?: string[];
  variants?: CommerceVariant[];
  stock_quantity?: number;
  created_time?: string;
}

export interface CreateCommerceProductDTO {
  name: string;
  description?: string;
  sku?: string;
  price: number;
  compare_at_price?: number;
  category_id?: string;
  images?: string[];
  tags?: string[];
  stock_quantity?: number;
}

export type UpdateCommerceProductDTO = Partial<CreateCommerceProductDTO>;

// â”€â”€â”€ Variant â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface CommerceVariant {
  variant_id?: string;
  sku?: string;
  price?: number;
  stock_quantity?: number;
  options?: Record<string, string>;
}

// â”€â”€â”€ Category â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface CommerceCategory {
  category_id?: string;
  name?: string;
  description?: string;
  parent_id?: string;
  image_url?: string;
}

// â”€â”€â”€ Customer â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface CommerceCustomer {
  customer_id?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  billing_address?: ZohoAddress;
  shipping_address?: ZohoAddress;
  created_time?: string;
}

// â”€â”€â”€ Order â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type OrderStatus = "draft" | "pending" | "processing" | "completed" | "cancelled" | "refunded";

export interface CommerceOrderItem {
  product_id?: string;
  variant_id?: string;
  name?: string;
  quantity: number;
  price: number;
  total?: number;
}

export interface CommerceOrder {
  order_id?: string;
  order_number?: string;
  customer_id?: string;
  customer_email?: string;
  status?: OrderStatus;
  items?: CommerceOrderItem[];
  subtotal?: number;
  discount?: number;
  shipping?: number;
  tax?: number;
  total?: number;
  billing_address?: ZohoAddress;
  shipping_address?: ZohoAddress;
  created_time?: string;
}

export interface CreateOrderDTO {
  customer_id?: string;
  customer_email?: string;
  items: CommerceOrderItem[];
  billing_address?: ZohoAddress;
  shipping_address?: ZohoAddress;
  coupon_code?: string;
}

// â”€â”€â”€ List params â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface CommerceListParams extends ZohoListParams {
  status?: string;
  category_id?: string;
  search?: string;
  sort_by?: string;
}

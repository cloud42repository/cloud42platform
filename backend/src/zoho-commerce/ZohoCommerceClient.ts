import { ZohoBaseClient } from "../base/ZohoBaseClient";
import { ZohoCredentials } from "../base/types";
import {
  CommerceProduct, CreateCommerceProductDTO, UpdateCommerceProductDTO,
  CommerceCategory,
  CommerceCustomer,
  CommerceOrder, CreateOrderDTO,
  CommerceListParams,
} from "./zoho-commerce.dto";

export interface ZohoCommerceConfig extends ZohoCredentials {
  /** Override the full API base URL. Defaults to https://commerce.zoho.com/store/api/v1 */
  apiBaseUrl?: string;
}

/**
 * Zoho Commerce v1 API client.
 * Docs: https://www.zoho.com/commerce/api/
 */
export class ZohoCommerceClient extends ZohoBaseClient {
  constructor(config: ZohoCommerceConfig) {
    super({
      ...config,
      apiBaseUrl: config.apiBaseUrl ?? "https://commerce.zoho.com/store/api/v1",
    });
  }

  // â”€â”€â”€ Products â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  listProducts(params?: CommerceListParams): Promise<{ products: CommerceProduct[] }> {
    return this.get("/products", { params });
  }
  getProduct(id: string): Promise<{ product: CommerceProduct }> {
    return this.get(`/products/${id}`);
  }
  createProduct(data: CreateCommerceProductDTO): Promise<{ product: CommerceProduct }> {
    return this.post("/products", data);
  }
  updateProduct(id: string, data: UpdateCommerceProductDTO): Promise<{ product: CommerceProduct }> {
    return this.put(`/products/${id}`, data);
  }
  deleteProduct(id: string): Promise<{ message: string }> {
    return this.delete(`/products/${id}`);
  }

  // â”€â”€â”€ Categories â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  listCategories(): Promise<{ categories: CommerceCategory[] }> {
    return this.get("/categories");
  }
  getCategory(id: string): Promise<{ category: CommerceCategory }> {
    return this.get(`/categories/${id}`);
  }
  createCategory(data: Partial<CommerceCategory>): Promise<{ category: CommerceCategory }> {
    return this.post("/categories", data);
  }
  deleteCategory(id: string): Promise<{ message: string }> {
    return this.delete(`/categories/${id}`);
  }

  // â”€â”€â”€ Customers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  listCustomers(params?: CommerceListParams): Promise<{ customers: CommerceCustomer[] }> {
    return this.get("/customers", { params });
  }
  getCustomer(id: string): Promise<{ customer: CommerceCustomer }> {
    return this.get(`/customers/${id}`);
  }

  // â”€â”€â”€ Orders â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  listOrders(params?: CommerceListParams): Promise<{ orders: CommerceOrder[] }> {
    return this.get("/orders", { params });
  }
  getOrder(id: string): Promise<{ order: CommerceOrder }> {
    return this.get(`/orders/${id}`);
  }
  createOrder(data: CreateOrderDTO): Promise<{ order: CommerceOrder }> {
    return this.post("/orders", data);
  }
  updateOrderStatus(id: string, status: CommerceOrder["status"]): Promise<{ order: CommerceOrder }> {
    return this.put(`/orders/${id}`, { status });
  }
  cancelOrder(id: string): Promise<{ order: CommerceOrder }> {
    return this.post(`/orders/${id}/cancel`, {});
  }
}

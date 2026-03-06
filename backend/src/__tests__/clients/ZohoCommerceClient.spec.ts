import MockAdapter from "axios-mock-adapter";
import { ZohoCommerceClient } from "../../zoho-commerce/ZohoCommerceClient";
import { PassthroughAuth } from "../../auth/PassthroughAuth";

const makeClient = () =>
  new ZohoCommerceClient({
    clientId: "cid",
    clientSecret: "csecret",
    authProvider: new PassthroughAuth("commerce-token"),
  });

describe("ZohoCommerceClient", () => {
  let client: ZohoCommerceClient;
  let mock: MockAdapter;

  beforeEach(() => {
    client = makeClient();
    mock = new MockAdapter(client.axiosInstance);
  });

  afterEach(() => mock.restore());

  it("uses the correct base URL", () => {
    expect(client.axiosInstance.defaults.baseURL ?? "").toContain("commerce.zoho.com/store/api/v1");
  });

  it("injects auth header", async () => {
    mock.onGet("/products").reply((cfg) => [200, { code: 0, auth: cfg.headers?.["Authorization"] }]);
    const res = await client.get<{ auth: string }>("/products");
    expect(res.auth).toBe("Zoho-oauthtoken commerce-token");
  });

  // â”€â”€â”€ Products â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  it("listProducts() calls GET /products", async () => {
    mock.onGet("/products").reply(200, { code: 0, products: [{ product_id: "PROD-1" }] });
    const res = await client.listProducts();
    expect(res.products[0].product_id).toBe("PROD-1");
  });

  it("getProduct() calls GET /products/:id", async () => {
    mock.onGet("/products/PROD-1").reply(200, { code: 0, product: { product_id: "PROD-1" } });
    const res = await client.getProduct("PROD-1");
    expect(res.product.product_id).toBe("PROD-1");
  });

  it("createProduct() calls POST /products", async () => {
    mock.onPost("/products").reply(200, { code: 0, product: { product_id: "PROD-2" } });
    const res = await client.createProduct({ name: "Widget", price: 9.99 } as any);
    expect(res.product.product_id).toBe("PROD-2");
  });

  it("updateProduct() calls PUT /products/:id", async () => {
    mock.onPut("/products/PROD-1").reply(200, { code: 0, product: { product_id: "PROD-1", price: 12.99 } });
    const res = await client.updateProduct("PROD-1", { price: 12.99 } as any);
    expect(res.product.price).toBe(12.99);
  });

  it("deleteProduct() calls DELETE /products/:id", async () => {
    mock.onDelete("/products/PROD-1").reply(200, { code: 0, message: "deleted" });
    const res = await client.deleteProduct("PROD-1");
    expect(res.message).toBe("deleted");
  });

  // â”€â”€â”€ Categories â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  it("listCategories() calls GET /categories", async () => {
    mock.onGet("/categories").reply(200, { code: 0, categories: [{ category_id: "CAT-1" }] });
    const res = await client.listCategories();
    expect(res.categories[0].category_id).toBe("CAT-1");
  });

  it("createCategory() calls POST /categories", async () => {
    mock.onPost("/categories").reply(200, { code: 0, category: { category_id: "CAT-2" } });
    const res = await client.createCategory({ name: "Electronics" } as any);
    expect(res.category.category_id).toBe("CAT-2");
  });

  it("deleteCategory() calls DELETE /categories/:id", async () => {
    mock.onDelete("/categories/CAT-1").reply(200, { code: 0, message: "deleted" });
    await expect(client.deleteCategory("CAT-1")).resolves.toBeDefined();
  });

  // â”€â”€â”€ Customers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  it("listCustomers() calls GET /customers", async () => {
    mock.onGet("/customers").reply(200, { code: 0, customers: [{ customer_id: "CUS-1" }] });
    const res = await client.listCustomers();
    expect(res.customers[0].customer_id).toBe("CUS-1");
  });

  it("getCustomer() calls GET /customers/:id", async () => {
    mock.onGet("/customers/CUS-1").reply(200, { code: 0, customer: { customer_id: "CUS-1" } });
    const res = await client.getCustomer("CUS-1");
    expect(res.customer.customer_id).toBe("CUS-1");
  });

  // â”€â”€â”€ Orders â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  it("listOrders() calls GET /orders", async () => {
    mock.onGet("/orders").reply(200, { code: 0, orders: [{ order_id: "ORD-1" }] });
    const res = await client.listOrders();
    expect(res.orders[0].order_id).toBe("ORD-1");
  });

  it("getOrder() calls GET /orders/:id", async () => {
    mock.onGet("/orders/ORD-1").reply(200, { code: 0, order: { order_id: "ORD-1" } });
    const res = await client.getOrder("ORD-1");
    expect(res.order.order_id).toBe("ORD-1");
  });

  it("createOrder() calls POST /orders", async () => {
    mock.onPost("/orders").reply(200, { code: 0, order: { order_id: "ORD-2" } });
    const res = await client.createOrder({ customer_id: "CUS-1", line_items: [] } as any);
    expect(res.order.order_id).toBe("ORD-2");
  });

  it("updateOrderStatus() calls PUT /orders/:id with status", async () => {
    mock.onPut("/orders/ORD-1").reply((cfg) => [200, { code: 0, order: { order_id: "ORD-1", status: JSON.parse(cfg.data).status } }]);
    const res = await client.updateOrderStatus("ORD-1", "processing");
    expect(res.order.status).toBe("processing");
  });

  it("cancelOrder() calls POST /orders/:id/cancel", async () => {
    mock.onPost("/orders/ORD-1/cancel").reply(200, { code: 0, order: { order_id: "ORD-1", status: "cancelled" } });
    const res = await client.cancelOrder("ORD-1");
    expect(res.order.status).toBe("cancelled");
  });
});

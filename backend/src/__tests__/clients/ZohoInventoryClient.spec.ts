import MockAdapter from "axios-mock-adapter";
import { ZohoInventoryClient } from "../../zoho-inventory/ZohoInventoryClient";
import { PassthroughAuth } from "../../auth/PassthroughAuth";

const ORG_ID = "org-inv-002";

const makeClient = () =>
  new ZohoInventoryClient({
    clientId: "cid",
    clientSecret: "csecret",
    authProvider: new PassthroughAuth("inventory-token"),
    organizationId: ORG_ID,
  });

describe("ZohoInventoryClient", () => {
  let client: ZohoInventoryClient;
  let mock: MockAdapter;

  beforeEach(() => {
    client = makeClient();
    mock = new MockAdapter(client.axiosInstance);
  });

  afterEach(() => mock.restore());

  it("uses the correct base URL", () => {
    expect(client.axiosInstance.defaults.baseURL ?? "").toContain("zohoapis.com/inventory/v1");
  });

  it("appends organization_id to every request", async () => {
    mock.onGet("/items").reply((cfg) => [200, { code: 0, params: cfg.params }]);
    const res = await client.get<{ params: Record<string, string> }>("/items");
    expect(res.params.organization_id).toBe(ORG_ID);
  });

  // â”€â”€â”€ Items â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  it("listItems() calls GET /items", async () => {
    mock.onGet("/items").reply(200, { code: 0, items: [{ item_id: "ITEM-1" }] });
    const res = await client.listItems();
    expect(res.items[0].item_id).toBe("ITEM-1");
  });

  it("getItem() calls GET /items/:id", async () => {
    mock.onGet("/items/ITEM-1").reply(200, { code: 0, item: { item_id: "ITEM-1" } });
    const res = await client.getItem("ITEM-1");
    expect(res.item.item_id).toBe("ITEM-1");
  });

  it("createItem() calls POST /items", async () => {
    mock.onPost("/items").reply(200, { code: 0, item: { item_id: "ITEM-2" } });
    const res = await client.createItem({ name: "Widget" } as any);
    expect(res.item.item_id).toBe("ITEM-2");
  });

  it("updateItem() calls PUT /items/:id", async () => {
    mock.onPut("/items/ITEM-1").reply(200, { code: 0, item: { item_id: "ITEM-1" } });
    const res = await client.updateItem("ITEM-1", {} as any);
    expect(res.item.item_id).toBe("ITEM-1");
  });

  it("deleteItem() calls DELETE /items/:id", async () => {
    mock.onDelete("/items/ITEM-1").reply(200, { code: 0, message: "deleted" });
    await expect(client.deleteItem("ITEM-1")).resolves.toBeDefined();
  });

  // â”€â”€â”€ Warehouses â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  it("listWarehouses() calls GET /warehouses", async () => {
    mock.onGet("/warehouses").reply(200, { code: 0, warehouses: [{ warehouse_id: "WH-1" }] });
    const res = await client.listWarehouses();
    expect(res.warehouses[0].warehouse_id).toBe("WH-1");
  });

  it("getWarehouse() calls GET /warehouses/:id", async () => {
    mock.onGet("/warehouses/WH-1").reply(200, { code: 0, warehouse: { warehouse_id: "WH-1" } });
    const res = await client.getWarehouse("WH-1");
    expect(res.warehouse.warehouse_id).toBe("WH-1");
  });

  // â”€â”€â”€ Sales Orders â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  it("listSalesOrders() calls GET /salesorders", async () => {
    mock.onGet("/salesorders").reply(200, { code: 0, salesorders: [{ salesorder_id: "SO-1" }] });
    const res = await client.listSalesOrders();
    expect(res.salesorders[0].salesorder_id).toBe("SO-1");
  });

  it("createSalesOrder() calls POST /salesorders", async () => {
    mock.onPost("/salesorders").reply(200, { code: 0, salesorder: { salesorder_id: "SO-2" } });
    const res = await client.createSalesOrder({ customer_id: "C1" } as any);
    expect(res.salesorder.salesorder_id).toBe("SO-2");
  });

  it("deleteSalesOrder() calls DELETE /salesorders/:id", async () => {
    mock.onDelete("/salesorders/SO-1").reply(200, { code: 0, message: "deleted" });
    await expect(client.deleteSalesOrder("SO-1")).resolves.toBeDefined();
  });

  // â”€â”€â”€ Purchase Orders â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  it("listPurchaseOrders() calls GET /purchaseorders", async () => {
    mock.onGet("/purchaseorders").reply(200, { code: 0, purchaseorders: [{ purchaseorder_id: "PO-1" }] });
    const res = await client.listPurchaseOrders();
    expect(res.purchaseorders[0].purchaseorder_id).toBe("PO-1");
  });

  it("createPurchaseOrder() calls POST /purchaseorders", async () => {
    mock.onPost("/purchaseorders").reply(200, { code: 0, purchaseorder: { purchaseorder_id: "PO-2" } });
    const res = await client.createPurchaseOrder({ vendor_id: "V1" } as any);
    expect(res.purchaseorder.purchaseorder_id).toBe("PO-2");
  });
});

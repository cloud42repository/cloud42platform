/**
 * Endpoint I/O schemas — input (request) and output (response) JSON samples
 * for every API endpoint. Powers intellisense / autocompletion in body textareas
 * across the api-tester, dashboard, form, and workflow builders.
 *
 * IC schemas derived from the Impossible Cloud Partner API swagger spec.
 * All other modules derived from Zoho / OpenAI public API documentation.
 */

export interface EndpointIOSchema {
  input?: Record<string, unknown>;
  output?: Record<string, unknown> | unknown[];
  /** Human-readable label describing the output shape (shown in step-ref suggestions) */
  outputLabel?: string;
}

// ── Impossible Cloud (from swagger spec) ─────────────────────────────────

const IC_SCHEMAS: Record<string, EndpointIOSchema> = {
  'list-regions': {
    output: {
      regions: [
        { name: 'eu-central-2', s3_url: 'https://s3.eu-central-2.impossiblecloud.com', iam_url: 'https://iam.eu-central-2.impossiblecloud.com', sts_url: 'https://sts.eu-central-2.impossiblecloud.com' },
      ],
    },
  },
  'list-contracts': {
    output: [
      { id: '', distributorId: '', allocatedCapacity: 0, reservedCapacity: 0, costStorageGBCents: 0, currency: 'EUR', details: {} },
    ],
    outputLabel: 'Contract[]',
  },
  'list-contract-partners': {
    output: [
      { id: '', name: '', allocatedCapacity: 0, allowOverdraft: false, distributorContractId: '', details: {} },
    ],
    outputLabel: 'Partner[]',
  },
  'list-storage-accounts': {
    output: [
      { name: '', allocatedCapacity: 0, allowOverdraft: false, clientAccountId: '', contactEmail: '', pendingDeletedAt: null },
    ],
    outputLabel: 'StorageAccount[]',
  },
  'get-storage-accounts-usage': {
    output: [
      { client_id: '', name: '', allocated_capacity: 0, daily_usage: [{ date: '2024-01-01', usage: 0, allocated_capacity: 0 }] },
    ],
    outputLabel: 'ClientUsage[]',
  },
  'get-storage-account': {
    output: { name: '', allocatedCapacity: 0, allowOverdraft: false, clientAccountId: '', contactEmail: '', pendingDeletedAt: null },
  },
  'get-storage-account-usage': {
    output: {
      client_id: '', name: '', allocated_capacity: 0,
      daily_usage: [{ date: '2024-01-01', usage: 0, allocated_capacity: 0 }],
    },
  },
  'get-partner': {
    output: { id: '', name: '', allocatedCapacity: 0, allowOverdraft: false, distributorContractId: '', details: {} },
  },
  'list-members': {
    output: [
      { id: '', name: '', email: '', role: '' },
    ],
    outputLabel: 'Member[]',
  },
  'list-partner-storage-accounts': {
    output: [
      { name: '', allocatedCapacity: 0, allowOverdraft: false, clientAccountId: '', contactEmail: '', pendingDeletedAt: null },
    ],
    outputLabel: 'StorageAccount[]',
  },
  'get-partner-storage-account': {
    output: { name: '', allocatedCapacity: 0, allowOverdraft: false, clientAccountId: '', contactEmail: '', pendingDeletedAt: null },
  },
  'get-partner-storage-account-usage': {
    output: {
      client_id: '', name: '', allocated_capacity: 0,
      daily_usage: [{ date: '2024-01-01', usage: 0, allocated_capacity: 0 }],
    },
  },
  'get-partner-usage': {
    output: [
      { client_id: '', name: '', allocated_capacity: 0, daily_usage: [{ date: '2024-01-01', usage: 0, allocated_capacity: 0 }] },
    ],
    outputLabel: 'ClientUsage[]',
  },
  'create-storage-account': {
    input: { name: '', allocatedCapacity: 0, allowOverdraft: false, clientAccount: { contactEmail: '', password: '' } },
    output: { name: '', allocatedCapacity: 0, allowOverdraft: false, clientAccountId: '', contactEmail: '', pendingDeletedAt: null },
  },
  'delete-storage-account': {
    output: { message: 'storage account deleted' },
  },
  'patch-storage-account': {
    input: { pendingDeletedAt: null },
    output: { name: '', allocatedCapacity: 0, allowOverdraft: false, clientAccountId: '', contactEmail: '', pendingDeletedAt: null },
  },
  'create-partner': {
    input: { distributorContractId: '', name: '', allocatedCapacity: 0, allowOverdraft: false },
    output: { id: '', name: '', allocatedCapacity: 0, allowOverdraft: false, distributorContractId: '', details: {} },
  },
  'update-partner': {
    input: { name: '', allocatedCapacity: 0 },
    output: { id: '', name: '', allocatedCapacity: 0, allowOverdraft: false, distributorContractId: '', details: {} },
  },
  'delete-partner': {
    output: { message: 'partner deleted' },
  },
  'create-member': {
    input: { email: '', password: '', role: '', name: '' },
    output: { id: '', name: '', email: '', role: '' },
  },
  'delete-member': {
    output: { message: 'member deleted' },
  },
  'create-partner-storage-account': {
    input: { name: '', allocatedCapacity: 0, allowOverdraft: false, clientAccount: { contactEmail: '', password: '' } },
    output: { name: '', allocatedCapacity: 0, allowOverdraft: false, clientAccountId: '', contactEmail: '', pendingDeletedAt: null },
  },
  'delete-partner-storage-account': {
    output: { message: 'storage account deleted' },
  },
  'patch-partner-storage-account': {
    input: { pendingDeletedAt: null },
    output: { name: '', allocatedCapacity: 0, allowOverdraft: false, clientAccountId: '', contactEmail: '', pendingDeletedAt: null },
  },
};

// ── Softvalue ────────────────────────────────────────────────────────────

const SOFTVALUE_SCHEMAS: Record<string, EndpointIOSchema> = {
  'proxy-get': { output: { data: {} } },
  'get-token': { output: { token: '', expiresAt: '' } },
  'proxy-post': { input: { url: '', data: {} }, output: { data: {} } },
  'proxy-put': { input: { url: '', data: {} }, output: { data: {} } },
  'proxy-patch': { input: { url: '', data: {} }, output: { data: {} } },
  'proxy-delete': { output: { data: {} } },
  'update-token': { input: { token: '' }, output: { success: true } },
};

// ── Zoho Analytics ───────────────────────────────────────────────────────

const ANALYTICS_SCHEMAS: Record<string, EndpointIOSchema> = {
  'list-workspaces': {
    output: { workspaces: [{ workspaceId: '', workspaceName: '', createdTime: '', description: '' }] },
  },
  'get-workspace': {
    output: { workspaceId: '', workspaceName: '', createdTime: '', description: '' },
  },
  'list-views': {
    output: { views: [{ viewId: '', viewName: '', viewType: '', createdTime: '' }] },
  },
  'get-view': {
    output: { viewId: '', viewName: '', viewType: '', createdTime: '', columns: [] },
  },
  'list-reports': {
    output: { reports: [{ reportId: '', reportName: '', createdTime: '' }] },
  },
  'list-dashboards': {
    output: { dashboards: [{ dashboardId: '', dashboardName: '', createdTime: '' }] },
  },
  'export-data': {
    output: { data: [], columns: [] },
  },
  'create-workspace': {
    input: { workspaceName: '' },
    output: { workspaceId: '', workspaceName: '', createdTime: '' },
  },
  'delete-workspace': { output: { message: 'workspace deleted' } },
  'create-view': {
    input: { viewName: '', viewType: 'TABLE' },
    output: { viewId: '', viewName: '', viewType: '', createdTime: '' },
  },
  'delete-view': { output: { message: 'view deleted' } },
  'import-data': {
    input: { workspaceId: '', viewId: '', data: [] },
    output: { importSummary: { totalRows: 0, successRows: 0, failedRows: 0 } },
  },
};

// ── Zoho Books ───────────────────────────────────────────────────────────

const BOOKS_SCHEMAS: Record<string, EndpointIOSchema> = {
  'list-contacts': {
    output: { contacts: [{ contact_id: '', contact_name: '', contact_type: '', email: '', phone: '', company_name: '', status: '' }] },
  },
  'get-contact': {
    output: { contact: { contact_id: '', contact_name: '', contact_type: '', email: '', phone: '', company_name: '', outstanding_receivable_amount: 0, outstanding_payable_amount: 0 } },
  },
  'list-invoices': {
    output: { invoices: [{ invoice_id: '', invoice_number: '', customer_name: '', status: '', date: '', due_date: '', total: 0, balance: 0, currency_code: '' }] },
  },
  'get-invoice': {
    output: { invoice: { invoice_id: '', invoice_number: '', customer_id: '', customer_name: '', status: '', date: '', due_date: '', total: 0, balance: 0, line_items: [{ item_id: '', name: '', quantity: 1, rate: 0, amount: 0 }] } },
  },
  'list-bills': {
    output: { bills: [{ bill_id: '', bill_number: '', vendor_name: '', status: '', date: '', due_date: '', total: 0, balance: 0 }] },
  },
  'get-bill': {
    output: { bill: { bill_id: '', bill_number: '', vendor_id: '', vendor_name: '', status: '', date: '', due_date: '', total: 0, line_items: [{ account_id: '', description: '', amount: 0 }] } },
  },
  'list-expenses': {
    output: { expenses: [{ expense_id: '', date: '', account_name: '', description: '', amount: 0, status: '' }] },
  },
  'get-expense': {
    output: { expense: { expense_id: '', date: '', account_id: '', account_name: '', amount: 0, description: '', currency_code: '' } },
  },
  'list-payments': {
    output: { customerpayments: [{ payment_id: '', payment_number: '', customer_name: '', date: '', amount: 0, payment_mode: '' }] },
  },
  'get-payment': {
    output: { payment: { payment_id: '', payment_number: '', customer_id: '', customer_name: '', date: '', amount: 0, invoices: [{ invoice_id: '', amount_applied: 0 }] } },
  },
  'list-items': {
    output: { items: [{ item_id: '', name: '', rate: 0, description: '', unit: '', status: '' }] },
  },
  'get-item': {
    output: { item: { item_id: '', name: '', rate: 0, description: '', unit: '', status: '', purchase_rate: 0 } },
  },
  'create-contact': {
    input: { contact_name: '', contact_type: 'customer', email: '', phone: '' },
    output: { contact: { contact_id: '', contact_name: '', contact_type: '', email: '', phone: '' } },
  },
  'update-contact': {
    input: { contact_name: '', email: '', phone: '' },
    output: { contact: { contact_id: '', contact_name: '', email: '', phone: '' } },
  },
  'delete-contact': { output: { message: 'contact deleted' } },
  'create-invoice': {
    input: { customer_id: '', invoice_number: '', date: '', due_date: '', line_items: [{ item_id: '', name: '', quantity: 1, rate: 0 }], notes: '' },
    output: { invoice: { invoice_id: '', invoice_number: '', customer_id: '', status: 'draft', total: 0 } },
  },
  'update-invoice': {
    input: { customer_id: '', line_items: [{ item_id: '', name: '', quantity: 1, rate: 0 }] },
    output: { invoice: { invoice_id: '', invoice_number: '', status: '', total: 0 } },
  },
  'delete-invoice': { output: { message: 'invoice deleted' } },
  'send-invoice': {
    input: { send_from_org_email_id: '', to_mail_ids: [''] },
    output: { message: 'invoice sent' },
  },
  'mark-invoice-sent': { output: { invoice: { invoice_id: '', status: 'sent' } } },
  'void-invoice': { output: { invoice: { invoice_id: '', status: 'void' } } },
  'create-bill': {
    input: { vendor_id: '', bill_number: '', date: '', due_date: '', line_items: [{ account_id: '', description: '', amount: 0 }] },
    output: { bill: { bill_id: '', bill_number: '', vendor_id: '', status: 'open', total: 0 } },
  },
  'update-bill': {
    input: { vendor_id: '', line_items: [{ account_id: '', description: '', amount: 0 }] },
    output: { bill: { bill_id: '', bill_number: '', status: '', total: 0 } },
  },
  'delete-bill': { output: { message: 'bill deleted' } },
  'create-expense': {
    input: { account_id: '', amount: 0, date: '', description: '' },
    output: { expense: { expense_id: '', account_id: '', amount: 0, date: '' } },
  },
  'update-expense': {
    input: { amount: 0, description: '' },
    output: { expense: { expense_id: '', amount: 0, description: '' } },
  },
  'delete-expense': { output: { message: 'expense deleted' } },
  'create-payment': {
    input: { customer_id: '', payment_mode: '', amount: 0, date: '', invoices: [{ invoice_id: '', amount_applied: 0 }] },
    output: { payment: { payment_id: '', customer_id: '', amount: 0 } },
  },
  'delete-payment': { output: { message: 'payment deleted' } },
  'create-item': {
    input: { name: '', rate: 0, description: '', unit: '' },
    output: { item: { item_id: '', name: '', rate: 0, description: '' } },
  },
  'update-item': {
    input: { name: '', rate: 0, description: '' },
    output: { item: { item_id: '', name: '', rate: 0, description: '' } },
  },
  'delete-item': { output: { message: 'item deleted' } },
  'list-recurring-invoices': {
    output: { recurring_invoices: [{ recurring_invoice_id: '', recurrence_name: '', customer_name: '', customer_id: '', status: '', start_date: '', end_date: '', next_invoice_date: '', currency_code: '' }] },
  },
  'get-recurring-invoice': {
    output: { recurring_invoice: { recurring_invoice_id: '', recurrence_name: '', customer_id: '', customer_name: '', status: '', start_date: '', end_date: '', next_invoice_date: '', currency_code: '', line_items: [{ line_item_id: '', name: '', quantity: 1, item_total: 0 }], billing_address: {}, shipping_address: {} } },
  },
  'create-recurring-invoice': {
    input: { recurrence_name: '', customer_id: '', start_date: '', end_date: '', line_items: [{ name: '', quantity: 1, item_total: 0 }] },
    output: { recurring_invoice: { recurring_invoice_id: '', recurrence_name: '', customer_id: '', status: '' } },
  },
  'update-recurring-invoice': {
    input: { recurrence_name: '', customer_id: '', line_items: [{ name: '', quantity: 1, item_total: 0 }] },
    output: { recurring_invoice: { recurring_invoice_id: '', recurrence_name: '', status: '' } },
  },
  'update-recurring-invoices': {
    input: { recurring_invoice_ids: [''] },
    output: { recurring_invoices: [{ recurring_invoice_id: '', status: '' }] },
  },
  'delete-recurring-invoice': { output: { message: 'recurring invoice deleted' } },
  'stop-recurring-invoice': { output: { message: 'recurring invoice stopped' } },
  'resume-recurring-invoice': { output: { message: 'recurring invoice resumed' } },
  'update-recurring-invoice-template': { output: { message: 'template updated' } },
  'list-recurring-invoice-comments': {
    output: { comments: [{ comment_id: '', description: '', commented_by: '', date: '', time: '' }] },
  },
};

// ── Zoho Campaigns ───────────────────────────────────────────────────────

const CAMPAIGNS_SCHEMAS: Record<string, EndpointIOSchema> = {
  'list-mailing-lists': {
    output: { list_of_details: [{ listkey: '', listname: '', createddate: '', open_count: 0, click_count: 0 }] },
  },
  'get-mailing-list': {
    output: { listkey: '', listname: '', createddate: '', total_count: 0, active_count: 0, bounce_count: 0 },
  },
  'list-subscribers': {
    output: { subscribers: [{ contact_email: '', first_name: '', last_name: '', added_time: '', status: '' }] },
  },
  'list-topics': {
    output: { topics: [{ topicId: '', topicName: '', description: '' }] },
  },
  'list-campaigns': {
    output: { campaigns: [{ campaign_key: '', campaign_name: '', status: '', sent_time: '', open_count: 0, click_count: 0 }] },
  },
  'get-campaign': {
    output: { campaign_key: '', campaign_name: '', status: '', subject: '', sent_time: '', total_sent: 0, open_count: 0, click_count: 0 },
  },
  'create-mailing-list': {
    input: { listname: '', signupform: '' },
    output: { listkey: '', listname: '', createddate: '' },
  },
  'delete-mailing-list': { output: { message: 'mailing list deleted' } },
  'add-subscriber': {
    input: { contact_email: '', first_name: '', last_name: '' },
    output: { message: 'subscriber added' },
  },
  'remove-subscriber': { output: { message: 'subscriber removed' } },
  'send-campaign': { output: { message: 'campaign sent' } },
  'schedule-campaign': {
    input: { send_date: '', send_time: '', timezone: '' },
    output: { message: 'campaign scheduled' },
  },
};

// ── Zoho Cliq ────────────────────────────────────────────────────────────

const CLIQ_SCHEMAS: Record<string, EndpointIOSchema> = {
  'list-channels': {
    output: { channels: [{ name: '', channel_id: '', description: '', member_count: 0, created_time: '' }] },
  },
  'get-channel': {
    output: { name: '', channel_id: '', description: '', member_count: 0, created_time: '', creator: '' },
  },
  'list-channel-messages': {
    output: { messages: [{ id: '', text: '', sender: { name: '', id: '' }, time: '' }] },
  },
  'list-user-groups': {
    output: { usergroups: [{ name: '', id: '', description: '', member_count: 0 }] },
  },
  'get-user-group': {
    output: { name: '', id: '', description: '', member_count: 0, members: [] },
  },
  'list-bots': {
    output: { bots: [{ name: '', id: '', status: '' }] },
  },
  'create-channel': {
    input: { name: '', description: '' },
    output: { name: '', channel_id: '', created_time: '' },
  },
  'delete-channel': { output: { message: 'channel deleted' } },
  'add-channel-member': {
    input: { members: [{ email: '' }] },
    output: { message: 'member added' },
  },
  'remove-channel-member': { output: { message: 'member removed' } },
  'send-channel-message': {
    input: { text: '', broadcast: false },
    output: { id: '', text: '', time: '' },
  },
  'delete-message': { output: { message: 'message deleted' } },
  'send-direct-message': {
    input: { text: '' },
    output: { id: '', text: '', time: '' },
  },
  'create-user-group': {
    input: { name: '', description: '', members: [{ email: '' }] },
    output: { name: '', id: '', member_count: 0 },
  },
  'send-bot-message': {
    input: { text: '', channel: '' },
    output: { id: '', text: '', time: '' },
  },
};

// ── Zoho Commerce ────────────────────────────────────────────────────────

const COMMERCE_SCHEMAS: Record<string, EndpointIOSchema> = {
  'list-products': {
    output: { products: [{ product_id: '', name: '', sku: '', price: 0, status: '', category: '', stock: 0, image_url: '' }] },
  },
  'get-product': {
    output: { product: { product_id: '', name: '', sku: '', price: 0, status: '', category: '', stock: 0, description: '', images: [] } },
  },
  'list-categories': {
    output: { categories: [{ category_id: '', name: '', parent_id: '', product_count: 0, status: '' }] },
  },
  'get-category': {
    output: { category: { category_id: '', name: '', parent_id: '', description: '', product_count: 0 } },
  },
  'list-customers': {
    output: { customers: [{ customer_id: '', name: '', email: '', phone: '', created_time: '', order_count: 0 }] },
  },
  'get-customer': {
    output: { customer: { customer_id: '', name: '', email: '', phone: '', address: {}, order_count: 0, total_spent: 0 } },
  },
  'list-orders': {
    output: { orders: [{ order_id: '', order_number: '', customer_name: '', status: '', date: '', total: 0, currency: '' }] },
  },
  'get-order': {
    output: { order: { order_id: '', order_number: '', customer_id: '', status: '', date: '', total: 0, line_items: [{ product_id: '', name: '', quantity: 1, price: 0 }], shipping_address: {} } },
  },
  'create-product': {
    input: { name: '', sku: '', price: 0, description: '', category_id: '', stock: 0 },
    output: { product: { product_id: '', name: '', sku: '', price: 0 } },
  },
  'update-product': {
    input: { name: '', price: 0, description: '', stock: 0 },
    output: { product: { product_id: '', name: '', price: 0 } },
  },
  'delete-product': { output: { message: 'product deleted' } },
  'create-category': {
    input: { name: '', description: '', parent_id: '' },
    output: { category: { category_id: '', name: '' } },
  },
  'delete-category': { output: { message: 'category deleted' } },
  'create-order': {
    input: { customer_id: '', line_items: [{ product_id: '', quantity: 1 }], shipping_address: { street: '', city: '', state: '', zip: '', country: '' } },
    output: { order: { order_id: '', order_number: '', status: 'pending', total: 0 } },
  },
  'update-order-status': {
    input: { status: '' },
    output: { order: { order_id: '', status: '' } },
  },
  'cancel-order': { output: { order: { order_id: '', status: 'cancelled' } } },
};

// ── Zoho Creator ─────────────────────────────────────────────────────────

const CREATOR_SCHEMAS: Record<string, EndpointIOSchema> = {
  'list-applications': {
    output: { applications: [{ application_name: '', link_name: '', created_time: '', is_active: true }] },
  },
  'get-application': {
    output: { application_name: '', link_name: '', created_time: '', is_active: true, forms: [], reports: [] },
  },
  'list-forms': {
    output: { forms: [{ display_name: '', link_name: '', type: '' }] },
  },
  'get-form': {
    output: { display_name: '', link_name: '', type: '', fields: [{ display_name: '', link_name: '', type: '' }] },
  },
  'list-reports': {
    output: { reports: [{ display_name: '', link_name: '', type: '' }] },
  },
  'list-records': {
    output: { data: [{ ID: '', Added_Time: '' }] },
  },
  'get-record': {
    output: { data: { ID: '', Added_Time: '', Added_User: '' } },
  },
  'create-record': {
    input: { data: {} },
    output: { data: { ID: '' }, message: 'record created' },
  },
  'update-record': {
    input: { data: {} },
    output: { data: { ID: '' }, message: 'record updated' },
  },
  'delete-record': { output: { message: 'record deleted' } },
  'trigger-workflow': {
    input: { data: {} },
    output: { message: 'workflow triggered', result: {} },
  },
};

// ── Zoho CRM ─────────────────────────────────────────────────────────────

const CRM_SCHEMAS: Record<string, EndpointIOSchema> = {
  'list-leads': {
    output: { data: [{ id: '', First_Name: '', Last_Name: '', Email: '', Phone: '', Company: '', Lead_Status: '', Owner: { name: '', id: '' } }], info: { per_page: 200, count: 0, page: 1, more_records: false } },
  },
  'get-lead': {
    output: { data: [{ id: '', First_Name: '', Last_Name: '', Email: '', Phone: '', Company: '', Lead_Status: '', Lead_Source: '', Description: '', Owner: { name: '', id: '' }, Created_Time: '' }] },
  },
  'search-leads': {
    output: { data: [{ id: '', First_Name: '', Last_Name: '', Email: '', Company: '' }], info: { per_page: 200, count: 0 } },
  },
  'list-contacts': {
    output: { data: [{ id: '', First_Name: '', Last_Name: '', Email: '', Phone: '', Account_Name: { name: '', id: '' } }], info: { per_page: 200, count: 0, page: 1 } },
  },
  'get-contact': {
    output: { data: [{ id: '', First_Name: '', Last_Name: '', Email: '', Phone: '', Account_Name: { name: '', id: '' }, Mailing_Street: '', Mailing_City: '' }] },
  },
  'list-accounts': {
    output: { data: [{ id: '', Account_Name: '', Phone: '', Website: '', Industry: '', Account_Type: '' }], info: { per_page: 200, count: 0 } },
  },
  'get-account': {
    output: { data: [{ id: '', Account_Name: '', Phone: '', Website: '', Industry: '', Account_Type: '', Annual_Revenue: 0, Employees: 0 }] },
  },
  'list-deals': {
    output: { data: [{ id: '', Deal_Name: '', Amount: 0, Stage: '', Closing_Date: '', Account_Name: { name: '', id: '' } }], info: { per_page: 200, count: 0 } },
  },
  'get-deal': {
    output: { data: [{ id: '', Deal_Name: '', Amount: 0, Stage: '', Closing_Date: '', Probability: 0, Account_Name: { name: '', id: '' }, Contact_Name: { name: '', id: '' } }] },
  },
  'list-tasks': {
    output: { data: [{ id: '', Subject: '', Status: '', Due_Date: '', Priority: '', Owner: { name: '', id: '' } }], info: { per_page: 200, count: 0 } },
  },
  'get-task': {
    output: { data: [{ id: '', Subject: '', Status: '', Due_Date: '', Priority: '', Description: '', Owner: { name: '', id: '' } }] },
  },
  'list-notes': {
    output: { data: [{ id: '', Note_Title: '', Note_Content: '', Parent_Id: { name: '', id: '' }, Created_Time: '' }] },
  },
  'get-note': {
    output: { data: [{ id: '', Note_Title: '', Note_Content: '', Parent_Id: { name: '', id: '' }, Created_Time: '' }] },
  },
  'list-module-records': {
    output: { data: [{ id: '' }], info: { per_page: 200, count: 0, page: 1, more_records: false } },
  },
  'get-module-record': {
    output: { data: [{ id: '' }] },
  },
  'create-leads': {
    input: { data: [{ First_Name: '', Last_Name: '', Email: '', Phone: '', Company: '', Lead_Source: '' }] },
    output: { data: [{ code: 'SUCCESS', details: { id: '', Modified_Time: '', Created_Time: '' }, message: 'record added', status: 'success' }] },
  },
  'update-leads': {
    input: { data: [{ id: '', First_Name: '', Last_Name: '', Email: '' }] },
    output: { data: [{ code: 'SUCCESS', details: { id: '', Modified_Time: '' }, message: 'record updated', status: 'success' }] },
  },
  'delete-lead': { output: { data: [{ code: 'SUCCESS', details: { id: '' }, message: 'record deleted', status: 'success' }] } },
  'create-contacts': {
    input: { data: [{ First_Name: '', Last_Name: '', Email: '', Phone: '', Account_Name: '' }] },
    output: { data: [{ code: 'SUCCESS', details: { id: '' }, message: 'record added', status: 'success' }] },
  },
  'update-contacts': {
    input: { data: [{ id: '', First_Name: '', Last_Name: '', Email: '' }] },
    output: { data: [{ code: 'SUCCESS', details: { id: '' }, message: 'record updated', status: 'success' }] },
  },
  'delete-contact': { output: { data: [{ code: 'SUCCESS', details: { id: '' }, message: 'record deleted', status: 'success' }] } },
  'create-accounts': {
    input: { data: [{ Account_Name: '', Phone: '', Website: '', Industry: '' }] },
    output: { data: [{ code: 'SUCCESS', details: { id: '' }, message: 'record added', status: 'success' }] },
  },
  'update-accounts': {
    input: { data: [{ id: '', Account_Name: '', Phone: '' }] },
    output: { data: [{ code: 'SUCCESS', details: { id: '' }, message: 'record updated', status: 'success' }] },
  },
  'delete-account': { output: { data: [{ code: 'SUCCESS', details: { id: '' }, message: 'record deleted', status: 'success' }] } },
  'create-deals': {
    input: { data: [{ Deal_Name: '', Amount: 0, Stage: '', Closing_Date: '', Account_Name: '' }] },
    output: { data: [{ code: 'SUCCESS', details: { id: '' }, message: 'record added', status: 'success' }] },
  },
  'update-deals': {
    input: { data: [{ id: '', Deal_Name: '', Stage: '', Amount: 0 }] },
    output: { data: [{ code: 'SUCCESS', details: { id: '' }, message: 'record updated', status: 'success' }] },
  },
  'delete-deal': { output: { data: [{ code: 'SUCCESS', details: { id: '' }, message: 'record deleted', status: 'success' }] } },
  'create-tasks': {
    input: { data: [{ Subject: '', Due_Date: '', Status: 'Not Started', Priority: 'Normal' }] },
    output: { data: [{ code: 'SUCCESS', details: { id: '' }, message: 'record added', status: 'success' }] },
  },
  'update-tasks': {
    input: { data: [{ id: '', Subject: '', Status: '' }] },
    output: { data: [{ code: 'SUCCESS', details: { id: '' }, message: 'record updated', status: 'success' }] },
  },
  'delete-task': { output: { data: [{ code: 'SUCCESS', details: { id: '' }, message: 'record deleted', status: 'success' }] } },
  'create-notes': {
    input: { data: [{ Note_Title: '', Note_Content: '', Parent_Id: '', se_module: 'Leads' }] },
    output: { data: [{ code: 'SUCCESS', details: { id: '' }, message: 'record added', status: 'success' }] },
  },
  'delete-note': { output: { data: [{ code: 'SUCCESS', details: { id: '' }, message: 'record deleted', status: 'success' }] } },
  'create-module-records': {
    input: { data: [{}] },
    output: { data: [{ code: 'SUCCESS', details: { id: '' }, message: 'record added', status: 'success' }] },
  },
  'update-module-records': {
    input: { data: [{ id: '' }] },
    output: { data: [{ code: 'SUCCESS', details: { id: '' }, message: 'record updated', status: 'success' }] },
  },
  'delete-module-record': { output: { data: [{ code: 'SUCCESS', details: { id: '' }, message: 'record deleted', status: 'success' }] } },
};

// ── Zoho Desk ────────────────────────────────────────────────────────────

const DESK_SCHEMAS: Record<string, EndpointIOSchema> = {
  'list-tickets': {
    output: { data: [{ id: '', ticketNumber: '', subject: '', status: '', priority: '', channel: '', contactId: '', departmentId: '', assigneeId: '', createdTime: '' }] },
  },
  'get-ticket': {
    output: { id: '', ticketNumber: '', subject: '', description: '', status: '', priority: '', channel: '', contactId: '', departmentId: '', assigneeId: '', createdTime: '', modifiedTime: '' },
  },
  'search-tickets': {
    output: { data: [{ id: '', ticketNumber: '', subject: '', status: '', priority: '' }], count: 0 },
  },
  'list-comments': {
    output: { data: [{ id: '', content: '', isPublic: true, commentedTime: '', commenter: { name: '', id: '' } }] },
  },
  'list-contacts': {
    output: { data: [{ id: '', firstName: '', lastName: '', email: '', phone: '', accountId: '' }] },
  },
  'get-contact': {
    output: { id: '', firstName: '', lastName: '', email: '', phone: '', accountId: '', description: '' },
  },
  'list-agents': {
    output: { data: [{ id: '', name: '', emailId: '', roleId: '', status: '' }] },
  },
  'get-agent': {
    output: { id: '', name: '', emailId: '', roleId: '', status: '', departmentIds: [] },
  },
  'list-departments': {
    output: { data: [{ id: '', name: '', description: '', isEnabled: true }] },
  },
  'get-department': {
    output: { id: '', name: '', description: '', isEnabled: true },
  },
  'create-ticket': {
    input: { subject: '', description: '', contactId: '', departmentId: '', priority: 'Medium', status: 'Open', channel: 'Email' },
    output: { id: '', ticketNumber: '', subject: '', status: 'Open' },
  },
  'update-ticket': {
    input: { subject: '', status: '', priority: '', assigneeId: '' },
    output: { id: '', ticketNumber: '', subject: '', status: '' },
  },
  'delete-ticket': { output: { message: 'ticket deleted' } },
  'add-comment': {
    input: { content: '', isPublic: true },
    output: { id: '', content: '', isPublic: true, commentedTime: '' },
  },
  'delete-comment': { output: { message: 'comment deleted' } },
  'create-contact': {
    input: { firstName: '', lastName: '', email: '', phone: '' },
    output: { id: '', firstName: '', lastName: '', email: '' },
  },
  'update-contact': {
    input: { firstName: '', lastName: '', email: '' },
    output: { id: '', firstName: '', lastName: '', email: '' },
  },
  'delete-contact': { output: { message: 'contact deleted' } },
};

// ── Zoho Expense ─────────────────────────────────────────────────────────

const EXPENSE_SCHEMAS: Record<string, EndpointIOSchema> = {
  'list-categories': {
    output: { expense_categories: [{ category_id: '', category_name: '', description: '', is_enabled: true }] },
  },
  'get-category': {
    output: { expense_category: { category_id: '', category_name: '', description: '', is_enabled: true } },
  },
  'list-expenses': {
    output: { expenses: [{ expense_id: '', date: '', category_name: '', amount: 0, currency_code: '', description: '', status: '', employee_name: '' }] },
  },
  'get-expense': {
    output: { expense: { expense_id: '', date: '', category_id: '', category_name: '', amount: 0, currency_code: '', description: '', status: '' } },
  },
  'list-reports': {
    output: { expense_reports: [{ report_id: '', report_name: '', status: '', total: 0, created_date: '', submitted_date: '' }] },
  },
  'get-report': {
    output: { expense_report: { report_id: '', report_name: '', status: '', total: 0, expenses: [], created_date: '' } },
  },
  'list-advances': {
    output: { advances: [{ advance_id: '', amount: 0, balance: 0, date: '', status: '' }] },
  },
  'get-advance': {
    output: { advance: { advance_id: '', amount: 0, balance: 0, date: '', status: '', description: '' } },
  },
  'create-expense': {
    input: { category_id: '', amount: 0, date: '', description: '', currency_code: '' },
    output: { expense: { expense_id: '', amount: 0, date: '' } },
  },
  'update-expense': {
    input: { amount: 0, description: '' },
    output: { expense: { expense_id: '', amount: 0, description: '' } },
  },
  'delete-expense': { output: { message: 'expense deleted' } },
  'create-report': {
    input: { report_name: '', description: '' },
    output: { expense_report: { report_id: '', report_name: '' } },
  },
  'update-report': {
    input: { report_name: '', description: '' },
    output: { expense_report: { report_id: '', report_name: '' } },
  },
  'delete-report': { output: { message: 'report deleted' } },
  'submit-report': { output: { message: 'report submitted' } },
  'approve-report': { output: { message: 'report approved' } },
};

// ── Zoho Inventory ───────────────────────────────────────────────────────

const INVENTORY_SCHEMAS: Record<string, EndpointIOSchema> = {
  'list-items': {
    output: { items: [{ item_id: '', name: '', sku: '', rate: 0, stock_on_hand: 0, status: '', unit: '' }] },
  },
  'get-item': {
    output: { item: { item_id: '', name: '', sku: '', rate: 0, purchase_rate: 0, stock_on_hand: 0, status: '', description: '', unit: '' } },
  },
  'list-warehouses': {
    output: { warehouses: [{ warehouse_id: '', warehouse_name: '', address: '', city: '', state: '', country: '', is_primary: false }] },
  },
  'get-warehouse': {
    output: { warehouse: { warehouse_id: '', warehouse_name: '', address: '', city: '', state: '', country: '' } },
  },
  'list-sales-orders': {
    output: { salesorders: [{ salesorder_id: '', salesorder_number: '', customer_name: '', status: '', date: '', total: 0 }] },
  },
  'get-sales-order': {
    output: { salesorder: { salesorder_id: '', salesorder_number: '', customer_id: '', status: '', date: '', total: 0, line_items: [{ item_id: '', name: '', quantity: 1, rate: 0 }] } },
  },
  'list-purchase-orders': {
    output: { purchaseorders: [{ purchaseorder_id: '', purchaseorder_number: '', vendor_name: '', status: '', date: '', total: 0 }] },
  },
  'get-purchase-order': {
    output: { purchaseorder: { purchaseorder_id: '', purchaseorder_number: '', vendor_id: '', status: '', date: '', total: 0, line_items: [{ item_id: '', name: '', quantity: 1, rate: 0 }] } },
  },
  'create-item': {
    input: { name: '', sku: '', rate: 0, description: '', unit: '' },
    output: { item: { item_id: '', name: '', rate: 0 } },
  },
  'update-item': {
    input: { name: '', rate: 0, description: '' },
    output: { item: { item_id: '', name: '', rate: 0 } },
  },
  'delete-item': { output: { message: 'item deleted' } },
  'create-sales-order': {
    input: { customer_id: '', salesorder_number: '', date: '', line_items: [{ item_id: '', quantity: 1, rate: 0 }] },
    output: { salesorder: { salesorder_id: '', salesorder_number: '', status: 'draft', total: 0 } },
  },
  'update-sales-order': {
    input: { line_items: [{ item_id: '', quantity: 1, rate: 0 }] },
    output: { salesorder: { salesorder_id: '', status: '', total: 0 } },
  },
  'delete-sales-order': { output: { message: 'sales order deleted' } },
  'create-purchase-order': {
    input: { vendor_id: '', purchaseorder_number: '', date: '', line_items: [{ item_id: '', quantity: 1, rate: 0 }] },
    output: { purchaseorder: { purchaseorder_id: '', purchaseorder_number: '', status: 'draft', total: 0 } },
  },
  'update-purchase-order': {
    input: { line_items: [{ item_id: '', quantity: 1, rate: 0 }] },
    output: { purchaseorder: { purchaseorder_id: '', status: '', total: 0 } },
  },
  'delete-purchase-order': { output: { message: 'purchase order deleted' } },
};

// ── Zoho Invoice ─────────────────────────────────────────────────────────

const INVOICE_SCHEMAS: Record<string, EndpointIOSchema> = {
  'list-customers': {
    output: { customers: [{ customer_id: '', customer_name: '', email: '', phone: '', outstanding: 0, status: '' }] },
  },
  'get-customer': {
    output: { customer: { customer_id: '', customer_name: '', email: '', phone: '', company_name: '', outstanding: 0, billing_address: {} } },
  },
  'list-invoices': {
    output: { invoices: [{ invoice_id: '', invoice_number: '', customer_name: '', status: '', date: '', due_date: '', total: 0, balance: 0 }] },
  },
  'get-invoice': {
    output: { invoice: { invoice_id: '', invoice_number: '', customer_id: '', status: '', date: '', due_date: '', total: 0, balance: 0, line_items: [{ item_id: '', name: '', quantity: 1, rate: 0 }] } },
  },
  'list-estimates': {
    output: { estimates: [{ estimate_id: '', estimate_number: '', customer_name: '', status: '', date: '', total: 0 }] },
  },
  'get-estimate': {
    output: { estimate: { estimate_id: '', estimate_number: '', customer_id: '', status: '', date: '', total: 0, line_items: [] } },
  },
  'list-recurring-invoices': {
    output: { recurring_invoices: [{ recurring_invoice_id: '', profile_name: '', customer_name: '', status: '', total: 0, recurrence_frequency: '' }] },
  },
  'get-recurring-invoice': {
    output: { recurring_invoice: { recurring_invoice_id: '', profile_name: '', customer_id: '', status: '', total: 0, recurrence_frequency: '', start_date: '', end_date: '' } },
  },
  'list-payments': {
    output: { payments: [{ payment_id: '', payment_number: '', customer_name: '', date: '', amount: 0 }] },
  },
  'create-customer': {
    input: { customer_name: '', email: '', phone: '', company_name: '' },
    output: { customer: { customer_id: '', customer_name: '', email: '' } },
  },
  'update-customer': {
    input: { customer_name: '', email: '', phone: '' },
    output: { customer: { customer_id: '', customer_name: '', email: '' } },
  },
  'delete-customer': { output: { message: 'customer deleted' } },
  'create-invoice': {
    input: { customer_id: '', invoice_number: '', date: '', due_date: '', line_items: [{ item_id: '', name: '', quantity: 1, rate: 0 }] },
    output: { invoice: { invoice_id: '', invoice_number: '', status: 'draft', total: 0 } },
  },
  'update-invoice': {
    input: { line_items: [{ item_id: '', name: '', quantity: 1, rate: 0 }] },
    output: { invoice: { invoice_id: '', status: '', total: 0 } },
  },
  'delete-invoice': { output: { message: 'invoice deleted' } },
  'send-invoice': { output: { message: 'invoice sent' } },
  'create-estimate': {
    input: { customer_id: '', date: '', line_items: [{ item_id: '', name: '', quantity: 1, rate: 0 }] },
    output: { estimate: { estimate_id: '', status: 'draft', total: 0 } },
  },
  'update-estimate': {
    input: { line_items: [{ item_id: '', name: '', quantity: 1, rate: 0 }] },
    output: { estimate: { estimate_id: '', status: '', total: 0 } },
  },
  'delete-estimate': { output: { message: 'estimate deleted' } },
  'create-recurring-invoice': {
    input: { customer_id: '', recurrence_frequency: 'monthly', start_date: '', line_items: [{ item_id: '', name: '', quantity: 1, rate: 0 }] },
    output: { recurring_invoice: { recurring_invoice_id: '', status: 'active' } },
  },
  'delete-recurring-invoice': { output: { message: 'recurring invoice deleted' } },
  'create-payment': {
    input: { customer_id: '', amount: 0, date: '', payment_mode: '' },
    output: { payment: { payment_id: '', amount: 0 } },
  },
  'delete-payment': { output: { message: 'payment deleted' } },
};

// ── Zoho Mail ────────────────────────────────────────────────────────────

const MAIL_SCHEMAS: Record<string, EndpointIOSchema> = {
  'list-accounts': {
    output: { data: [{ accountId: '', displayName: '', emailAddress: '', incomingServer: '' }] },
  },
  'get-account': {
    output: { data: { accountId: '', displayName: '', emailAddress: '', incomingServer: '' } },
  },
  'list-folders': {
    output: { data: [{ folderId: '', folderName: '', folderType: '', messageCount: 0, unreadCount: 0 }] },
  },
  'list-messages': {
    output: { data: [{ messageId: '', subject: '', sender: '', receivedTime: '', isRead: false, hasAttachment: false }] },
  },
  'search-messages': {
    output: { data: [{ messageId: '', subject: '', sender: '', receivedTime: '' }] },
  },
  'get-message': {
    output: { data: { messageId: '', subject: '', sender: '', toAddress: '', content: '', receivedTime: '', isRead: true, attachments: [] } },
  },
  'list-contacts': {
    output: { data: [{ contactId: '', firstName: '', lastName: '', email: '' }] },
  },
  'send-message': {
    input: { fromAddress: '', toAddress: '', subject: '', content: '', mailFormat: 'html' },
    output: { data: { messageId: '', subject: '' } },
  },
  'delete-message': { output: { message: 'message deleted' } },
  'move-message': {
    input: { destfolderId: '' },
    output: { message: 'message moved' },
  },
  'mark-read': {
    input: { isRead: true },
    output: { message: 'status updated' },
  },
  'create-contact': {
    input: { firstName: '', lastName: '', email: '' },
    output: { data: { contactId: '', firstName: '', lastName: '', email: '' } },
  },
  'delete-contact': { output: { message: 'contact deleted' } },
};

// ── Zoho Payroll ─────────────────────────────────────────────────────────

const PAYROLL_SCHEMAS: Record<string, EndpointIOSchema> = {
  'list-employees': {
    output: { employees: [{ employee_id: '', first_name: '', last_name: '', email_id: '', designation: '', department: '', date_of_joining: '' }] },
  },
  'get-employee': {
    output: { employee: { employee_id: '', first_name: '', last_name: '', email_id: '', designation: '', department: '', date_of_joining: '', salary_details: {} } },
  },
  'list-pay-components': {
    output: { paycomponents: [{ component_id: '', component_name: '', type: '', is_active: true }] },
  },
  'get-pay-component': {
    output: { paycomponent: { component_id: '', component_name: '', type: '', is_active: true, description: '' } },
  },
  'list-pay-runs': {
    output: { payruns: [{ payrun_id: '', payrun_name: '', pay_period: '', status: '', total_net_pay: 0 }] },
  },
  'get-pay-run': {
    output: { payrun: { payrun_id: '', payrun_name: '', pay_period: '', status: '', total_net_pay: 0, total_gross_pay: 0, employee_count: 0 } },
  },
  'list-payslips': {
    output: { payslips: [{ payslip_id: '', employee_name: '', net_pay: 0, gross_pay: 0, pay_period: '' }] },
  },
  'get-payslip': {
    output: { payslip: { payslip_id: '', employee_name: '', employee_id: '', net_pay: 0, gross_pay: 0, earnings: [], deductions: [] } },
  },
  'list-declarations': {
    output: { declarations: [{ declaration_id: '', employee_name: '', financial_year: '', status: '' }] },
  },
  'get-declaration': {
    output: { declaration: { declaration_id: '', employee_id: '', financial_year: '', status: '', components: [] } },
  },
  'create-employee': {
    input: { first_name: '', last_name: '', email_id: '', designation: '', department: '', date_of_joining: '' },
    output: { employee: { employee_id: '', first_name: '', last_name: '' } },
  },
  'update-employee': {
    input: { first_name: '', last_name: '', designation: '' },
    output: { employee: { employee_id: '', first_name: '', last_name: '' } },
  },
  'terminate-employee': {
    input: { termination_date: '', reason: '' },
    output: { message: 'employee terminated' },
  },
  'create-pay-run': {
    input: { payrun_name: '', pay_period: '' },
    output: { payrun: { payrun_id: '', payrun_name: '', status: 'draft' } },
  },
  'approve-pay-run': { output: { message: 'pay run approved' } },
};

// ── Zoho People ──────────────────────────────────────────────────────────

const PEOPLE_SCHEMAS: Record<string, EndpointIOSchema> = {
  'list-employees': {
    output: { data: [{ EmployeeID: '', FirstName: '', LastName: '', EmailID: '', Department: '', Designation: '', DateOfJoining: '' }] },
  },
  'get-employee': {
    output: { data: { EmployeeID: '', FirstName: '', LastName: '', EmailID: '', Department: '', Designation: '', DateOfJoining: '', Phone: '' } },
  },
  'list-departments': {
    output: { data: [{ Id: '', Department: '', Status: '' }] },
  },
  'list-leave-types': {
    output: { data: [{ Id: '', Name: '', Unit: 'Day', Enabled: true }] },
  },
  'list-leave-requests': {
    output: { data: [{ Id: '', Employee: '', LeaveType: '', From: '', To: '', Days: 0, ApprovalStatus: '' }] },
  },
  'list-attendance': {
    output: { data: [{ Date: '', CheckIn: '', CheckOut: '', TotalHours: '', Status: '' }] },
  },
  'get-form-records': {
    output: { data: [{ ROWID: '' }] },
  },
  'add-employee': {
    input: { FirstName: '', LastName: '', EmailID: '', Department: '', Designation: '', DateOfJoining: '' },
    output: { data: { EmployeeID: '', message: 'employee added' } },
  },
  'update-employee': {
    input: { FirstName: '', LastName: '', Designation: '' },
    output: { data: { EmployeeID: '', message: 'employee updated' } },
  },
  'delete-employee': { output: { message: 'employee deleted' } },
  'add-leave-request': {
    input: { Employee: '', LeaveType: '', From: '', To: '', Reason: '' },
    output: { data: { Id: '', message: 'leave request added' } },
  },
  'approve-leave': { output: { message: 'leave approved' } },
  'reject-leave': {
    input: { reason: '' },
    output: { message: 'leave rejected' },
  },
  'add-form-record': {
    input: { data: {} },
    output: { data: { ROWID: '', message: 'record added' } },
  },
  'update-form-record': {
    input: { data: {} },
    output: { data: { ROWID: '', message: 'record updated' } },
  },
};

// ── Zoho Projects ────────────────────────────────────────────────────────

const PROJECTS_SCHEMAS: Record<string, EndpointIOSchema> = {
  'list-projects': {
    output: { projects: [{ id: '', name: '', status: '', owner_name: '', created_date: '', task_count: { open: 0, closed: 0 } }] },
  },
  'get-project': {
    output: { projects: [{ id: '', name: '', description: '', status: '', owner_name: '', created_date: '', start_date: '', end_date: '' }] },
  },
  'list-tasks': {
    output: { tasks: [{ id: '', name: '', status: { name: '' }, priority: '', start_date: '', end_date: '', percent_complete: 0 }] },
  },
  'get-task': {
    output: { tasks: [{ id: '', name: '', description: '', status: { name: '' }, priority: '', start_date: '', end_date: '', percent_complete: 0, details: { owners: [] } }] },
  },
  'list-milestones': {
    output: { milestones: [{ id: '', name: '', status: '', start_date: '', end_date: '', owner_name: '' }] },
  },
  'list-bugs': {
    output: { bugs: [{ id: '', title: '', status: { type: '' }, severity: { type: '' }, reported_person: '', created_time: '' }] },
  },
  'get-bug': {
    output: { bugs: [{ id: '', title: '', description: '', status: { type: '' }, severity: { type: '' }, reported_person: '', created_time: '' }] },
  },
  'list-timelogs': {
    output: { timelogs: [{ id: '', task_name: '', owner_name: '', log_date: '', hours: '' }] },
  },
  'create-project': {
    input: { name: '', description: '', status: 'active', start_date: '', end_date: '' },
    output: { projects: [{ id: '', name: '', status: '' }] },
  },
  'update-project': {
    input: { name: '', description: '', status: '' },
    output: { projects: [{ id: '', name: '', status: '' }] },
  },
  'delete-project': { output: { message: 'project deleted' } },
  'create-task': {
    input: { name: '', start_date: '', end_date: '', priority: 'None', person_responsible: '' },
    output: { tasks: [{ id: '', name: '' }] },
  },
  'update-task': {
    input: { name: '', status: '', percent_complete: 0 },
    output: { tasks: [{ id: '', name: '', status: {} }] },
  },
  'delete-task': { output: { message: 'task deleted' } },
  'create-bug': {
    input: { title: '', description: '', severity: { type: 'Major' } },
    output: { bugs: [{ id: '', title: '' }] },
  },
  'update-bug': {
    input: { title: '', status: { type: '' } },
    output: { bugs: [{ id: '', title: '' }] },
  },
  'delete-bug': { output: { message: 'bug deleted' } },
  'add-timelog': {
    input: { date: '', hours: '', notes: '' },
    output: { timelogs: [{ id: '', hours: '' }] },
  },
  'delete-timelog': { output: { message: 'timelog deleted' } },
};

// ── Zoho Recruit ─────────────────────────────────────────────────────────

const RECRUIT_SCHEMAS: Record<string, EndpointIOSchema> = {
  'list-job-openings': {
    output: { data: [{ id: '', Job_Opening_Name: '', Posting_Title: '', Number_of_Positions: 0, Job_Opening_Status: '', City: '' }], info: { per_page: 200, count: 0 } },
  },
  'get-job-opening': {
    output: { data: [{ id: '', Job_Opening_Name: '', Posting_Title: '', Number_of_Positions: 0, Job_Opening_Status: '', Department: '', Description: '' }] },
  },
  'list-candidates': {
    output: { data: [{ id: '', First_Name: '', Last_Name: '', Email: '', Phone: '', Current_Employer: '', Candidate_Status: '' }], info: { per_page: 200, count: 0 } },
  },
  'get-candidate': {
    output: { data: [{ id: '', First_Name: '', Last_Name: '', Email: '', Phone: '', Current_Employer: '', Candidate_Status: '', Experience_in_Years: 0, Skill_Set: '' }] },
  },
  'search-candidates': {
    output: { data: [{ id: '', First_Name: '', Last_Name: '', Email: '' }], info: { per_page: 200, count: 0 } },
  },
  'list-interviews': {
    output: { data: [{ id: '', Interview_Name: '', From: '', To: '', Candidate_Name: { name: '', id: '' }, Interviewer: '' }] },
  },
  'get-interview': {
    output: { data: [{ id: '', Interview_Name: '', From: '', To: '', Candidate_Name: { name: '', id: '' }, Interviewer: '', Location: '' }] },
  },
  'list-offers': {
    output: { data: [{ id: '', Offer_Date: '', Candidate_Name: { name: '', id: '' }, Job_Opening: { name: '', id: '' }, Offered_Salary: 0, Status: '' }] },
  },
  'get-offer': {
    output: { data: [{ id: '', Offer_Date: '', Candidate_Name: { name: '', id: '' }, Job_Opening: { name: '', id: '' }, Offered_Salary: 0, Status: '', Joining_Date: '' }] },
  },
  'create-job-openings': {
    input: { data: [{ Posting_Title: '', Number_of_Positions: 1, Job_Opening_Status: 'In-progress', Department: '' }] },
    output: { data: [{ code: 'SUCCESS', details: { id: '' }, message: 'record added', status: 'success' }] },
  },
  'update-job-openings': {
    input: { data: [{ id: '', Posting_Title: '', Job_Opening_Status: '' }] },
    output: { data: [{ code: 'SUCCESS', details: { id: '' }, message: 'record updated', status: 'success' }] },
  },
  'delete-job-opening': { output: { data: [{ code: 'SUCCESS', details: { id: '' }, message: 'record deleted', status: 'success' }] } },
  'create-candidates': {
    input: { data: [{ First_Name: '', Last_Name: '', Email: '', Phone: '', Current_Employer: '' }] },
    output: { data: [{ code: 'SUCCESS', details: { id: '' }, message: 'record added', status: 'success' }] },
  },
  'update-candidates': {
    input: { data: [{ id: '', First_Name: '', Last_Name: '', Email: '' }] },
    output: { data: [{ code: 'SUCCESS', details: { id: '' }, message: 'record updated', status: 'success' }] },
  },
  'delete-candidate': { output: { data: [{ code: 'SUCCESS', details: { id: '' }, message: 'record deleted', status: 'success' }] } },
  'create-interviews': {
    input: { data: [{ Interview_Name: '', From: '', To: '', Candidate_Name: '', Interviewer: '' }] },
    output: { data: [{ code: 'SUCCESS', details: { id: '' }, message: 'record added', status: 'success' }] },
  },
  'delete-interview': { output: { data: [{ code: 'SUCCESS', details: { id: '' }, message: 'record deleted', status: 'success' }] } },
};

// ── Zoho SalesIQ ─────────────────────────────────────────────────────────

const SALESIQ_SCHEMAS: Record<string, EndpointIOSchema> = {
  'list-visitors': {
    output: { data: [{ id: '', name: '', email: '', ip: '', city: '', country: '', browser: '', last_visit: '' }] },
  },
  'get-visitor': {
    output: { data: { id: '', name: '', email: '', ip: '', city: '', country: '', browser: '', visits_count: 0, pages_viewed: 0 } },
  },
  'search-visitors': {
    output: { data: [{ id: '', name: '', email: '' }] },
  },
  'list-chats': {
    output: { data: [{ id: '', visitor_name: '', department_name: '', status: '', start_time: '', end_time: '', rating: '' }] },
  },
  'get-chat': {
    output: { data: { id: '', visitor_name: '', department_name: '', status: '', start_time: '', end_time: '', rating: '', operator_name: '' } },
  },
  'list-chat-messages': {
    output: { data: [{ id: '', text: '', sender: '', type: '', time: '' }] },
  },
  'list-operators': {
    output: { data: [{ id: '', name: '', email: '', role: '', availability: '' }] },
  },
  'get-operator': {
    output: { data: { id: '', name: '', email: '', role: '', availability: '', departments: [] } },
  },
  'list-departments': {
    output: { data: [{ id: '', name: '', description: '', operator_count: 0 }] },
  },
  'list-bots': {
    output: { data: [{ id: '', name: '', status: '', created_time: '' }] },
  },
  'list-feedback-forms': {
    output: { data: [{ id: '', name: '', status: '', created_time: '' }] },
  },
  'send-chat-message': {
    input: { text: '' },
    output: { data: { id: '', text: '', time: '' } },
  },
  'set-rating': {
    input: { rating: 5, feedback: '' },
    output: { message: 'rating submitted' },
  },
  'set-operator-availability': {
    input: { availability: 'available' },
    output: { message: 'availability updated' },
  },
  'send-bot-message': {
    input: { text: '', platform: 'web' },
    output: { data: { id: '', response: '' } },
  },
};

// ── Zoho Sign ────────────────────────────────────────────────────────────

const SIGN_SCHEMAS: Record<string, EndpointIOSchema> = {
  'list-requests': {
    output: { requests: [{ request_id: '', request_name: '', owner_email: '', request_status: '', created_time: '', modified_time: '' }] },
  },
  'get-request': {
    output: { requests: { request_id: '', request_name: '', owner_email: '', request_status: '', actions: [{ action_id: '', recipient_email: '', action_status: '' }], document_ids: [] } },
  },
  'list-templates': {
    output: { templates: [{ template_id: '', template_name: '', owner_email: '', created_time: '', is_active: true }] },
  },
  'get-template': {
    output: { templates: { template_id: '', template_name: '', owner_email: '', created_time: '', actions: [] } },
  },
  'get-document': {
    output: { document_id: '', document_name: '', pages: 0 },
  },
  'download-document': {
    output: { message: 'binary document data' },
  },
  'create-request': {
    input: { requests: { request_name: '', actions: [{ recipient_email: '', recipient_name: '', action_type: 'sign', signing_order: 1 }], notes: '' } },
    output: { requests: { request_id: '', request_name: '', request_status: 'inprogress' } },
  },
  'send-request': { output: { message: 'request sent' } },
  'delete-request': { output: { message: 'request deleted' } },
  'recall-request': { output: { message: 'request recalled' } },
  'remind-request': { output: { message: 'reminder sent' } },
  'create-request-from-template': {
    input: { templates: { actions: [{ recipient_email: '', recipient_name: '', action_type: 'sign' }], notes: '' } },
    output: { requests: { request_id: '', request_name: '', request_status: 'inprogress' } },
  },
};

// ── Zoho Subscriptions ───────────────────────────────────────────────────

const SUBSCRIPTIONS_SCHEMAS: Record<string, EndpointIOSchema> = {
  'list-plans': {
    output: { plans: [{ plan_code: '', name: '', recurring_price: 0, interval: 1, interval_unit: 'months', status: '' }] },
  },
  'get-plan': {
    output: { plan: { plan_code: '', name: '', recurring_price: 0, interval: 1, interval_unit: 'months', status: '', description: '', setup_fee: 0 } },
  },
  'list-addons': {
    output: { addons: [{ addon_code: '', name: '', price: 0, type: '', status: '' }] },
  },
  'get-addon': {
    output: { addon: { addon_code: '', name: '', price: 0, type: '', status: '', description: '' } },
  },
  'list-coupons': {
    output: { coupons: [{ coupon_code: '', name: '', type: '', discount: 0, status: '' }] },
  },
  'get-coupon': {
    output: { coupon: { coupon_code: '', name: '', type: '', discount: 0, status: '', max_redemption: 0, redemption_count: 0 } },
  },
  'list-customers': {
    output: { customers: [{ customer_id: '', display_name: '', email: '', company_name: '', status: '' }] },
  },
  'get-customer': {
    output: { customer: { customer_id: '', display_name: '', email: '', company_name: '', billing_address: {}, shipping_address: {} } },
  },
  'list-subscriptions': {
    output: { subscriptions: [{ subscription_id: '', name: '', customer_name: '', status: '', plan_code: '', amount: 0, next_billing_at: '' }] },
  },
  'get-subscription': {
    output: { subscription: { subscription_id: '', name: '', customer_id: '', status: '', plan: { plan_code: '', name: '' }, amount: 0, next_billing_at: '', activated_at: '' } },
  },
  'create-plan': {
    input: { plan_code: '', name: '', recurring_price: 0, interval: 1, interval_unit: 'months', description: '' },
    output: { plan: { plan_code: '', name: '', status: 'active' } },
  },
  'update-plan': {
    input: { name: '', recurring_price: 0, description: '' },
    output: { plan: { plan_code: '', name: '', recurring_price: 0 } },
  },
  'delete-plan': { output: { message: 'plan deleted' } },
  'create-customer': {
    input: { display_name: '', email: '', company_name: '' },
    output: { customer: { customer_id: '', display_name: '', email: '' } },
  },
  'update-customer': {
    input: { display_name: '', email: '' },
    output: { customer: { customer_id: '', display_name: '', email: '' } },
  },
  'delete-customer': { output: { message: 'customer deleted' } },
  'create-subscription': {
    input: { customer_id: '', plan: { plan_code: '' }, addons: [] },
    output: { subscription: { subscription_id: '', status: 'live', next_billing_at: '' } },
  },
  'update-subscription': {
    input: { plan: { plan_code: '' }, addons: [] },
    output: { subscription: { subscription_id: '', status: '' } },
  },
  'cancel-subscription': { output: { subscription: { subscription_id: '', status: 'cancelled' } } },
  'reactivate-subscription': { output: { subscription: { subscription_id: '', status: 'live' } } },
};

// ── Zoho WorkDrive ───────────────────────────────────────────────────────

const WORKDRIVE_SCHEMAS: Record<string, EndpointIOSchema> = {
  'list-teams': {
    output: { data: [{ id: '', attributes: { name: '', created_time: '', member_count: 0 } }] },
  },
  'get-team': {
    output: { data: { id: '', attributes: { name: '', created_time: '', member_count: 0, storage_usage: 0 } } },
  },
  'search-files': {
    output: { data: [{ id: '', attributes: { name: '', type: '', size: 0, modified_time: '', parent_id: '' } }] },
  },
  'get-folder': {
    output: { data: { id: '', attributes: { name: '', type: 'folder', created_time: '', modified_time: '', parent_id: '' } } },
  },
  'list-folder-contents': {
    output: { data: [{ id: '', attributes: { name: '', type: '', size: 0, modified_time: '' } }] },
  },
  'get-file': {
    output: { data: { id: '', attributes: { name: '', type: '', size: 0, created_time: '', modified_time: '', download_url: '' } } },
  },
  'get-sharelink': {
    output: { data: [{ id: '', attributes: { link: '', created_time: '', expiry_date: '', access_type: '' } }] },
  },
  'list-workspace-members': {
    output: { data: [{ id: '', attributes: { name: '', email: '', role: '' } }] },
  },
  'create-folder': {
    input: { data: { attributes: { name: '', parent_id: '' }, type: 'files' } },
    output: { data: { id: '', attributes: { name: '', type: 'folder' } } },
  },
  'rename-folder': {
    input: { data: { attributes: { name: '' } } },
    output: { data: { id: '', attributes: { name: '' } } },
  },
  'delete-folder': { output: { message: 'folder deleted' } },
  'copy-file': {
    input: { data: { attributes: { parent_id: '' } } },
    output: { data: { id: '', attributes: { name: '' } } },
  },
  'move-file': {
    input: { data: { attributes: { parent_id: '' } } },
    output: { data: { id: '', attributes: { name: '' } } },
  },
  'delete-file': { output: { message: 'file deleted' } },
  'create-sharelink': {
    input: { data: { attributes: { resource_id: '', link_name: '', access_type: 'view', expiry_date: '' } } },
    output: { data: { id: '', attributes: { link: '', access_type: '' } } },
  },
  'add-workspace-member': {
    input: { data: { attributes: { email: '', role: 'viewer' } } },
    output: { data: { id: '', attributes: { email: '', role: '' } } },
  },
  'remove-workspace-member': { output: { message: 'member removed' } },
};

// ── ChatGPT ──────────────────────────────────────────────────────────────

const CHATGPT_SCHEMAS: Record<string, EndpointIOSchema> = {
  'list-models': {
    output: { data: [{ id: 'gpt-4o', object: 'model', created: 0, owned_by: 'openai' }] },
  },
  'get-model': {
    output: { id: 'gpt-4o', object: 'model', created: 0, owned_by: 'openai', permission: [] },
  },
  'create-chat-completion': {
    input: { model: 'gpt-4o', messages: [{ role: 'system', content: 'You are a helpful assistant.' }, { role: 'user', content: '' }], temperature: 0.7, max_tokens: 1024 },
    output: { id: '', object: 'chat.completion', created: 0, model: 'gpt-4o', choices: [{ index: 0, message: { role: 'assistant', content: '' }, finish_reason: 'stop' }], usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 } },
  },
  'create-embedding': {
    input: { model: 'text-embedding-3-small', input: '' },
    output: { object: 'list', data: [{ object: 'embedding', index: 0, embedding: [] }], model: 'text-embedding-3-small', usage: { prompt_tokens: 0, total_tokens: 0 } },
  },
  'generate-image': {
    input: { prompt: '', model: 'dall-e-3', n: 1, size: '1024x1024' },
    output: { created: 0, data: [{ url: '', revised_prompt: '' }] },
  },
  'create-moderation': {
    input: { input: '' },
    output: { id: '', model: 'text-moderation-latest', results: [{ flagged: false, categories: {}, category_scores: {} }] },
  },
};

// ── Master map ───────────────────────────────────────────────────────────

const SCHEMA_MAP: Record<string, Record<string, EndpointIOSchema>> = {
  'impossible-cloud': IC_SCHEMAS,
  'softvalue': SOFTVALUE_SCHEMAS,
  'zoho-analytics': ANALYTICS_SCHEMAS,
  'zoho-books': BOOKS_SCHEMAS,
  'zoho-campaigns': CAMPAIGNS_SCHEMAS,
  'zoho-cliq': CLIQ_SCHEMAS,
  'zoho-commerce': COMMERCE_SCHEMAS,
  'zoho-creator': CREATOR_SCHEMAS,
  'zoho-crm': CRM_SCHEMAS,
  'zoho-desk': DESK_SCHEMAS,
  'zoho-expense': EXPENSE_SCHEMAS,
  'zoho-inventory': INVENTORY_SCHEMAS,
  'zoho-invoice': INVOICE_SCHEMAS,
  'zoho-mail': MAIL_SCHEMAS,
  'zoho-payroll': PAYROLL_SCHEMAS,
  'zoho-people': PEOPLE_SCHEMAS,
  'zoho-projects': PROJECTS_SCHEMAS,
  'zoho-recruit': RECRUIT_SCHEMAS,
  'zoho-salesiq': SALESIQ_SCHEMAS,
  'zoho-sign': SIGN_SCHEMAS,
  'zoho-subscriptions': SUBSCRIPTIONS_SCHEMAS,
  'zoho-workdrive': WORKDRIVE_SCHEMAS,
  'chatgpt': CHATGPT_SCHEMAS,
};

/**
 * Get the I/O schema for a given module + endpoint.
 * Returns a deep-cloned object so callers can mutate freely,
 * or null if no schema is defined.
 */
export function getEndpointSchema(moduleId: string, endpointId: string): EndpointIOSchema | null {
  const schema = SCHEMA_MAP[moduleId]?.[endpointId];
  return schema ? structuredClone(schema) : null;
}

/**
 * Get only the output (response) schema for a given module + endpoint.
 * Useful for step-reference intellisense in workflows.
 */
export function getEndpointOutputSchema(moduleId: string, endpointId: string): Record<string, unknown> | unknown[] | null {
  const schema = SCHEMA_MAP[moduleId]?.[endpointId];
  return schema?.output ? structuredClone(schema.output) : null;
}

/**
 * Get only the input (request body) schema for a given module + endpoint.
 * Useful for body textarea intellisense.
 */
export function getEndpointInputSchema(moduleId: string, endpointId: string): Record<string, unknown> | null {
  const schema = SCHEMA_MAP[moduleId]?.[endpointId];
  return schema?.input ? structuredClone(schema.input) : null;
}

/**
 * Get the human-readable output label for a given module + endpoint.
 * E.g. 'Contract[]', 'Partner[]'. Returns null if not defined.
 */
export function getEndpointOutputLabel(moduleId: string, endpointId: string): string | null {
  const schema = SCHEMA_MAP[moduleId]?.[endpointId];
  return schema?.outputLabel ?? null;
}

/**
 * Flatten an output schema object into a list of dot-path keys.
 * E.g. { data: [{ id: '', name: '' }] } → ['data', 'data[0].id', 'data[0].name']
 * For top-level arrays: [{ id: '' }] → ['[0].id']
 */
export function flattenSchemaKeys(obj: Record<string, unknown> | unknown[], prefix = ''): string[] {
  if (Array.isArray(obj)) {
    // Top-level array: suggest [0].field sub-paths
    if (obj.length > 0 && typeof obj[0] === 'object' && obj[0] !== null) {
      return flattenSchemaKeys(obj[0] as Record<string, unknown>, prefix ? `${prefix}[0]` : '[0]');
    }
    return [];
  }
  const keys: string[] = [];
  for (const [key, val] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    keys.push(path);
    if (Array.isArray(val) && val.length > 0 && typeof val[0] === 'object' && val[0] !== null) {
      keys.push(...flattenSchemaKeys(val[0] as Record<string, unknown>, `${path}[0]`));
    } else if (val && typeof val === 'object' && !Array.isArray(val)) {
      keys.push(...flattenSchemaKeys(val as Record<string, unknown>, path));
    }
  }
  return keys;
}

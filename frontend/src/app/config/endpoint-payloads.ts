/**
 * Default payload templates for API endpoints that accept a request body.
 * Keyed by endpoint id (from EndpointDef.id).
 * Values are ready-to-use JSON objects with sensible defaults / example values.
 */

// ── Impossible Cloud ─────────────────────────────────────────────────────
const IC_PAYLOADS: Record<string, unknown> = {
  'create-storage-account': {
    name: '',
    allocatedCapacity: 0,
    allowOverdraft: false,
    clientAccount: { contactEmail: '', password: '' },
  },
  'patch-storage-account': {
    pendingDeletedAt: null,
  },
  'create-partner': {
    distributorContractId: '',
    name: '',
    allocatedCapacity: 0,
    allowOverdraft: false,
  },
  'update-partner': {
    name: '',
    allocatedCapacity: 0,
  },
  'create-member': {
    email: '',
    password: '',
    role: '',
    name: '',
  },
  'create-partner-storage-account': {
    name: '',
    allocatedCapacity: 0,
    allowOverdraft: false,
    clientAccount: { contactEmail: '', password: '' },
  },
  'patch-partner-storage-account': {
    pendingDeletedAt: null,
  },
};

// ── Softvalue ────────────────────────────────────────────────────────────
const SOFTVALUE_PAYLOADS: Record<string, unknown> = {
  'proxy-post': { url: '', data: {} },
  'proxy-put': { url: '', data: {} },
  'proxy-patch': { url: '', data: {} },
  'update-token': { token: '' },
};

// ── Zoho Analytics ───────────────────────────────────────────────────────
const ANALYTICS_PAYLOADS: Record<string, unknown> = {
  'create-workspace': { workspaceName: '' },
  'create-view': { viewName: '', viewType: 'TABLE' },
  'import-data': { workspaceId: '', viewId: '', data: [] },
};

// ── Zoho Books ───────────────────────────────────────────────────────────
const BOOKS_PAYLOADS: Record<string, unknown> = {
  'create-contact': {
    contact_name: '',
    contact_type: 'customer',
    email: '',
    phone: '',
  },
  'update-contact': {
    contact_name: '',
    email: '',
    phone: '',
  },
  'create-invoice': {
    customer_id: '',
    invoice_number: '',
    date: '',
    due_date: '',
    line_items: [{ item_id: '', name: '', quantity: 1, rate: 0 }],
    notes: '',
  },
  'update-invoice': {
    customer_id: '',
    line_items: [{ item_id: '', name: '', quantity: 1, rate: 0 }],
  },
  'send-invoice': { send_from_org_email_id: '', to_mail_ids: [''] },
  'create-bill': {
    vendor_id: '',
    bill_number: '',
    date: '',
    due_date: '',
    line_items: [{ account_id: '', description: '', amount: 0 }],
  },
  'update-bill': {
    vendor_id: '',
    line_items: [{ account_id: '', description: '', amount: 0 }],
  },
  'create-expense': {
    account_id: '',
    amount: 0,
    date: '',
    description: '',
  },
  'update-expense': {
    amount: 0,
    description: '',
  },
  'create-payment': {
    customer_id: '',
    payment_mode: '',
    amount: 0,
    date: '',
    invoices: [{ invoice_id: '', amount_applied: 0 }],
  },
  'create-item': {
    name: '',
    rate: 0,
    description: '',
    unit: '',
  },
  'update-item': {
    name: '',
    rate: 0,
  },
  'create-recurring-invoice': {
    recurrence_name: '',
    customer_id: '',
    start_date: '',
    end_date: '',
    line_items: [{ name: '', quantity: 1, item_total: 0 }],
  },
  'update-recurring-invoice': {
    recurrence_name: '',
    customer_id: '',
    line_items: [{ name: '', quantity: 1, item_total: 0 }],
  },
  'update-recurring-invoices': {
    recurring_invoice_ids: [''],
  },
  'update-recurring-invoice-template': {},
};

// ── Zoho Campaigns ───────────────────────────────────────────────────────
const CAMPAIGNS_PAYLOADS: Record<string, unknown> = {
  'create-mailing-list': { listname: '', signupform: '' },
  'add-subscriber': { contactinfo: { 'Contact Email': '' } },
  'schedule-campaign': { scheduleType: 'immediate' },
};

// ── Zoho Cliq ────────────────────────────────────────────────────────────
const CLIQ_PAYLOADS: Record<string, unknown> = {
  'create-channel': { name: '', description: '', participantsList: [] },
  'add-channel-member': { participants: [{ email_id: '' }] },
  'send-channel-message': { text: '', bot: '' },
  'send-direct-message': { text: '' },
  'create-user-group': { name: '', description: '' },
  'send-bot-message': { text: '' },
};

// ── Zoho Commerce ────────────────────────────────────────────────────────
const COMMERCE_PAYLOADS: Record<string, unknown> = {
  'create-product': { name: '', price: 0, description: '', sku: '' },
  'update-product': { name: '', price: 0 },
  'create-category': { name: '', description: '' },
  'create-order': {
    customer_id: '',
    line_items: [{ product_id: '', quantity: 1 }],
  },
  'update-order-status': { status: '' },
};

// ── Zoho Creator ─────────────────────────────────────────────────────────
const CREATOR_PAYLOADS: Record<string, unknown> = {
  'create-record': { data: {} },
  'update-record': { data: {} },
  'trigger-workflow': { data: {} },
};

// ── Zoho CRM ─────────────────────────────────────────────────────────────
const CRM_PAYLOADS: Record<string, unknown> = {
  'create-leads': {
    data: [{ Last_Name: '', First_Name: '', Email: '', Phone: '', Company: '' }],
  },
  'update-leads': {
    data: [{ id: '', Last_Name: '', Email: '' }],
  },
  'create-contacts': {
    data: [{ Last_Name: '', First_Name: '', Email: '', Phone: '' }],
  },
  'update-contacts': {
    data: [{ id: '', Last_Name: '', Email: '' }],
  },
  'create-accounts': {
    data: [{ Account_Name: '', Website: '', Phone: '', Industry: '' }],
  },
  'update-accounts': {
    data: [{ id: '', Account_Name: '' }],
  },
  'create-deals': {
    data: [{ Deal_Name: '', Stage: '', Amount: 0, Closing_Date: '' }],
  },
  'update-deals': {
    data: [{ id: '', Deal_Name: '', Stage: '' }],
  },
  'create-tasks': {
    data: [{ Subject: '', Status: 'Not Started', Priority: 'Normal', Due_Date: '' }],
  },
  'update-tasks': {
    data: [{ id: '', Subject: '', Status: '' }],
  },
  'create-notes': {
    data: [{ Note_Title: '', Note_Content: '', se_module: '' }],
  },
  'create-module-records': {
    data: [{}],
  },
  'update-module-records': {
    data: [{ id: '' }],
  },
};

// ── Zoho Desk ────────────────────────────────────────────────────────────
const DESK_PAYLOADS: Record<string, unknown> = {
  'create-ticket': {
    subject: '',
    departmentId: '',
    contactId: '',
    priority: 'Medium',
    status: 'Open',
    description: '',
  },
  'update-ticket': {
    subject: '',
    priority: '',
    status: '',
  },
  'add-comment': {
    content: '',
    isPublic: true,
    contentType: 'plainText',
  },
  'create-contact': {
    lastName: '',
    firstName: '',
    email: '',
    phone: '',
  },
  'update-contact': {
    lastName: '',
    email: '',
  },
};

// ── Zoho Expense ─────────────────────────────────────────────────────────
const EXPENSE_PAYLOADS: Record<string, unknown> = {
  'create-expense': {
    account_id: '',
    amount: 0,
    date: '',
    description: '',
  },
  'update-expense': {
    amount: 0,
    description: '',
  },
  'create-report': {
    report_name: '',
    description: '',
  },
  'update-report': {
    report_name: '',
  },
};

// ── Zoho Inventory ───────────────────────────────────────────────────────
const INVENTORY_PAYLOADS: Record<string, unknown> = {
  'create-item': {
    name: '',
    rate: 0,
    description: '',
    unit: '',
  },
  'update-item': {
    name: '',
    rate: 0,
  },
  'create-sales-order': {
    customer_id: '',
    date: '',
    line_items: [{ item_id: '', quantity: 1, rate: 0 }],
  },
  'update-sales-order': {
    line_items: [{ item_id: '', quantity: 1, rate: 0 }],
  },
  'create-purchase-order': {
    vendor_id: '',
    date: '',
    line_items: [{ item_id: '', quantity: 1, rate: 0 }],
  },
  'update-purchase-order': {
    line_items: [{ item_id: '', quantity: 1, rate: 0 }],
  },
};

// ── Zoho Invoice ─────────────────────────────────────────────────────────
const INVOICE_PAYLOADS: Record<string, unknown> = {
  'create-customer': {
    display_name: '',
    email: '',
    phone: '',
  },
  'update-customer': {
    display_name: '',
    email: '',
  },
  'create-invoice': {
    customer_id: '',
    date: '',
    line_items: [{ item_id: '', name: '', quantity: 1, rate: 0 }],
  },
  'update-invoice': {
    customer_id: '',
    line_items: [{ item_id: '', quantity: 1, rate: 0 }],
  },
  'create-estimate': {
    customer_id: '',
    date: '',
    line_items: [{ item_id: '', quantity: 1, rate: 0 }],
  },
  'update-estimate': {
    line_items: [{ item_id: '', quantity: 1, rate: 0 }],
  },
  'create-recurring-invoice': {
    customer_id: '',
    recurrence_name: '',
    recurrence_frequency: 'months',
    repeat_every: 1,
    line_items: [{ item_id: '', quantity: 1, rate: 0 }],
  },
  'create-payment': {
    customer_id: '',
    payment_mode: '',
    amount: 0,
  },
};

// ── Zoho Mail ────────────────────────────────────────────────────────────
const MAIL_PAYLOADS: Record<string, unknown> = {
  'send-message': {
    fromAddress: '',
    toAddress: '',
    subject: '',
    content: '',
  },
  'move-message': {
    destfolderId: '',
  },
  'mark-read': {
    isRead: true,
  },
  'create-contact': {
    firstName: '',
    lastName: '',
    email: '',
  },
};

// ── Zoho Payroll ─────────────────────────────────────────────────────────
const PAYROLL_PAYLOADS: Record<string, unknown> = {
  'create-employee': {
    first_name: '',
    last_name: '',
    email: '',
    designation: '',
    date_of_joining: '',
  },
  'update-employee': {
    first_name: '',
    last_name: '',
    email: '',
  },
  'terminate-employee': {
    termination_date: '',
    reason: '',
  },
  'create-pay-run': {
    pay_period: '',
    pay_date: '',
  },
};

// ── Zoho People ──────────────────────────────────────────────────────────
const PEOPLE_PAYLOADS: Record<string, unknown> = {
  'add-employee': {
    firstName: '',
    lastName: '',
    emailID: '',
    Department: '',
    Designation: '',
    dateOfJoining: '',
  },
  'update-employee': {
    firstName: '',
    lastName: '',
    emailID: '',
  },
  'add-leave-request': {
    Employee_ID: '',
    Leavetype: '',
    From: '',
    To: '',
    Reason: '',
  },
  'reject-leave': {
    comments: '',
  },
  'add-form-record': {
    data: {},
  },
  'update-form-record': {
    data: {},
  },
};

// ── Zoho Projects ────────────────────────────────────────────────────────
const PROJECTS_PAYLOADS: Record<string, unknown> = {
  'create-project': {
    name: '',
    description: '',
    start_date: '',
    end_date: '',
  },
  'update-project': {
    name: '',
    description: '',
  },
  'create-task': {
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    priority: 'None',
  },
  'update-task': {
    name: '',
    description: '',
  },
  'create-bug': {
    title: '',
    description: '',
    severity: 'Major',
  },
  'update-bug': {
    title: '',
    description: '',
  },
  'add-timelog': {
    date: '',
    hours: '',
    notes: '',
  },
};

// ── Zoho Recruit ─────────────────────────────────────────────────────────
const RECRUIT_PAYLOADS: Record<string, unknown> = {
  'create-job-openings': {
    data: [{ Posting_Title: '', Job_Opening_Status: 'In-progress', Number_of_Positions: 1 }],
  },
  'update-job-openings': {
    data: [{ id: '', Posting_Title: '' }],
  },
  'create-candidates': {
    data: [{ Last_Name: '', First_Name: '', Email: '', Current_Job_Title: '' }],
  },
  'update-candidates': {
    data: [{ id: '', Last_Name: '' }],
  },
  'create-interviews': {
    data: [{ Interview_Name: '', From: '', To: '' }],
  },
};

// ── Zoho SalesIQ ─────────────────────────────────────────────────────────
const SALESIQ_PAYLOADS: Record<string, unknown> = {
  'send-chat-message': { msg: '' },
  'set-rating': { rating: 5, feedback: '' },
  'set-operator-availability': { availability: 'Available' },
  'send-bot-message': { msg: '' },
};

// ── Zoho Sign ────────────────────────────────────────────────────────────
const SIGN_PAYLOADS: Record<string, unknown> = {
  'create-request': {
    requests: {
      request_name: '',
      actions: [{ recipient_email: '', action_type: 'SIGN', signing_order: 1 }],
    },
  },
  'create-request-from-template': {
    templates: {
      actions: [{ recipient_email: '', action_type: 'SIGN' }],
    },
  },
};

// ── Zoho Subscriptions ───────────────────────────────────────────────────
const SUBSCRIPTIONS_PAYLOADS: Record<string, unknown> = {
  'create-plan': {
    plan_code: '',
    name: '',
    recurring_price: 0,
    interval: 1,
    interval_unit: 'months',
  },
  'update-plan': {
    name: '',
    recurring_price: 0,
  },
  'create-customer': {
    display_name: '',
    email: '',
    billing_address: { city: '', state: '', country: '' },
  },
  'update-customer': {
    display_name: '',
    email: '',
  },
  'create-subscription': {
    customer_id: '',
    plan: { plan_code: '' },
  },
  'update-subscription': {
    plan: { plan_code: '' },
  },
};

// ── Zoho WorkDrive ───────────────────────────────────────────────────────
const WORKDRIVE_PAYLOADS: Record<string, unknown> = {
  'create-folder': {
    data: { attributes: { name: '', parent_id: '' }, type: 'files' },
  },
  'rename-folder': {
    data: { attributes: { name: '' }, type: 'files' },
  },
  'copy-file': {
    data: { attributes: { parent_id: '' }, type: 'files' },
  },
  'move-file': {
    data: { attributes: { parent_id: '' }, type: 'files' },
  },
  'create-sharelink': {
    data: { attributes: { resource_id: '', link_type: 'view' }, type: 'links' },
  },
  'add-workspace-member': {
    data: [{ attributes: { email: '', role: 'viewer' }, type: 'members' }],
  },
};

// ── ChatGPT ──────────────────────────────────────────────────────────────
const CHATGPT_PAYLOADS: Record<string, unknown> = {
  'create-chat-completion': {
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: '' },
    ],
    temperature: 0.7,
    max_tokens: 1024,
  },
  'create-embedding': {
    model: 'text-embedding-3-small',
    input: '',
  },
  'generate-image': {
    prompt: '',
    model: 'dall-e-3',
    n: 1,
    size: '1024x1024',
  },
  'create-moderation': {
    input: '',
  },
};

// ── Master map: moduleId → endpointId → payload ─────────────────────────

const PAYLOAD_MAP: Record<string, Record<string, unknown>> = {
  'impossible-cloud': IC_PAYLOADS,
  'softvalue': SOFTVALUE_PAYLOADS,
  'zoho-analytics': ANALYTICS_PAYLOADS,
  'zoho-books': BOOKS_PAYLOADS,
  'zoho-campaigns': CAMPAIGNS_PAYLOADS,
  'zoho-cliq': CLIQ_PAYLOADS,
  'zoho-commerce': COMMERCE_PAYLOADS,
  'zoho-creator': CREATOR_PAYLOADS,
  'zoho-crm': CRM_PAYLOADS,
  'zoho-desk': DESK_PAYLOADS,
  'zoho-expense': EXPENSE_PAYLOADS,
  'zoho-inventory': INVENTORY_PAYLOADS,
  'zoho-invoice': INVOICE_PAYLOADS,
  'zoho-mail': MAIL_PAYLOADS,
  'zoho-payroll': PAYROLL_PAYLOADS,
  'zoho-people': PEOPLE_PAYLOADS,
  'zoho-projects': PROJECTS_PAYLOADS,
  'zoho-recruit': RECRUIT_PAYLOADS,
  'zoho-salesiq': SALESIQ_PAYLOADS,
  'zoho-sign': SIGN_PAYLOADS,
  'zoho-subscriptions': SUBSCRIPTIONS_PAYLOADS,
  'zoho-workdrive': WORKDRIVE_PAYLOADS,
  'chatgpt': CHATGPT_PAYLOADS,
};

/**
 * Get the default payload template for a given module + endpoint.
 * Returns a deep-cloned object so callers can mutate freely,
 * or null if no template is defined.
 */
export function getEndpointPayload(moduleId: string, endpointId: string): unknown {
  const template = PAYLOAD_MAP[moduleId]?.[endpointId];
  return template ? structuredClone(template) : null;
}

import type { AxiosInstance } from 'axios';
import { randomInt } from 'crypto';

// axios-mock-adapter is a CJS module; use require() for compatibility.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const MockAdapter = require('axios-mock-adapter');

// ─── ID helpers ──────────────────────────────────────────────────────────────

let _seq = 1;
const nextId = () => `mock-${String(_seq++).padStart(4, '0')}`;

// ─── In-memory store ─────────────────────────────────────────────────────────

type StoreRecord = Record<string, unknown>;

/** Central store: resourceKey → (mockId → record) */
const store = new Map<string, Map<string, StoreRecord>>();

function getCollection(resourceName: string): Map<string, StoreRecord> {
  const key = resourceName.toLowerCase();
  if (!store.has(key)) store.set(key, new Map());
  return store.get(key)!;
}

/** Extract the canonical mock ID from the URL's last path segment. */
function idFromUrl(url: string): string | null {
  const segments = url.split('?')[0].split('/').filter(Boolean);
  const last = segments[segments.length - 1] ?? '';
  return /^\d+$/.test(last) || last.startsWith('mock-') ? last : null;
}

/**
 * Pre-populate the store with realistic seed records for every resource type.
 * Called once when the adapter is first attached.
 */
function seedStore(): void {
  // Names are derived by running the collection URL segment through resourceFromUrl.
  // e.g. /api/zoho-crm/leads  → seg "leads" → "Leads" → strip 's' → "Lead"
  // e.g. /api/zoho-crm/notes  → seg "notes" → "Notes" → strip 'es' → "Not"
  const SEED_RESOURCES: string[] = [
    // ── Zoho CRM (/api/zoho-crm/) ──────────────────────────────────────────
    'Lead',           // leads
    'Contact',        // contacts
    'Account',        // accounts
    'Deal',           // deals
    'Task',           // tasks
    'Not',            // notes  (Notes → strip 'es' → Not)
    // ── Zoho Books (/api/zoho-books/) ──────────────────────────────────────
    'Invoic',         // invoices  (Invoices → strip 'es' → Invoic)
    'Bill',           // bills
    'Expens',         // expenses  (Expenses → strip 'es' → Expens)
    'Payment',        // payments
    'Item',           // items
    // ── Zoho Invoice (/api/zoho-invoice/) ──────────────────────────────────
    'Customer',       // customers
    'Estimat',        // estimates (Estimates → strip 'es' → Estimat)
    // ── Zoho Inventory (/api/zoho-inventory/) ──────────────────────────────
    'Warehouse',      // warehouses (Warehouses → strip 's' → Warehouse)
    'Salesorder',     // salesorders → strip 's' → Salesorder
    'Purchaseorder',  // purchaseorders → strip 's' → Purchaseorder
    // ── Zoho Campaigns (/api/zoho-campaigns/) ──────────────────────────────
    'List',           // lists
    'Subscriber',     // subscribers
    'Topic',          // topics
    'Campaign',       // campaigns
    // ── Zoho Desk (/api/zoho-desk/) ────────────────────────────────────────
    'Ticket',         // tickets
    'Comment',        // comments
    'Agent',          // agents
    'Department',     // departments
    // ── Zoho Expense (/api/zoho-expense/) ──────────────────────────────────
    'Category',       // categories (Categories → strip 'ies'+'y' → Category)
    'Report',         // reports
    'Advance',        // advances
    // ── Zoho Mail (/api/zoho-mail/) ────────────────────────────────────────
    'Account',        // accounts (shared key with CRM accounts — fine for mock)
    'Folder',         // folders
    'Messag',         // messages (Messages → strip 'es' → Messag)
    // ── Zoho People (/api/zoho-people/) ────────────────────────────────────
    'Employ',         // employees (Employees → strip 'es' → Employ)
    'Leave-type',     // leave-types  → strip 's' → Leave-type
    'Leave-request',  // leave-requests → strip 's' → Leave-request
    'Attendance',     // attendance (no plural → stays Attendance)
    'Form',           // forms
    // ── Zoho Payroll (/api/zoho-payroll/) ──────────────────────────────────
    'Payrun',         // payruns → strip 's' → Payrun
    'Payslip',        // payslips → strip 's' → Payslip
    'Pay-component',  // pay-components → strip 's' → Pay-component
    'Declaration',    // declarations → strip 's' → Declaration
    // ── Zoho Analytics (/api/zoho-analytics/) ──────────────────────────────
    'Workspac',       // workspaces (Workspaces → strip 'es' → Workspac)
    'View',           // views
    'Dashboard',      // dashboards → strip 's' → Dashboard
    // ── Zoho Cliq (/api/zoho-cliq/) ────────────────────────────────────────
    'Channel',        // channels
    'Bot',            // bots → strip 's' → Bot
    'Usergroup',      // usergroups → strip 's' → Usergroup
    // ── Zoho Commerce (/api/zoho-commerce/) ────────────────────────────────
    'Product',        // products
    'Order',          // orders
    'Variant',        // variants
    // ── Zoho Creator (/api/zoho-creator/) ──────────────────────────────────
    'Application',    // applications
    'Workflow',       // workflows
    // ── Zoho Recruit (/api/zoho-recruit/) ──────────────────────────────────
    'Job-opening',    // job-openings → strip 's' → Job-opening
    'Candidat',       // candidates (Candidates → strip 'es' → Candidat)
    'Interview',      // interviews
    'Offer',          // offers
    // ── Zoho SalesIQ (/api/zoho-salesiq/) ──────────────────────────────────
    'Visitor',        // visitors
    'Chat',           // chats → strip 's' → Chat
    'Operator',       // operators
    // ── Zoho Sign (/api/zoho-sign/) ────────────────────────────────────────
    'Request',        // requests
    'Document',       // documents
    'Recipient',      // recipients
    'Template',       // templates
    // ── Zoho Subscriptions (/api/zoho-subscriptions/) ──────────────────────
    'Plan',           // plans
    'Addon',          // addons → strip 's' → Addon
    'Coupon',         // coupons
    'Subscription',   // subscriptions
    // ── Zoho WorkDrive (/api/zoho-workdrive/) ──────────────────────────────
    'Team',           // teams
    'Fil',            // files (Files → strip 'es' → Fil)
    'Member',         // members
    // ── Impossible Cloud (/api/impossible-cloud/) ──────────────────────────
    'Region',         // regions
    'Contract',       // contracts
    'Partner',        // partners
    'Storage-account', // storage-accounts → strip 's' → Storage-account
    // ── Zoho Projects (/api/zoho-projects/) ────────────────────────────────
    'Project',        // projects
    'Mileston',       // milestones (Milestones → strip 'es' → Mileston)
    'Bug',            // bugs → strip 's' → Bug
    'Timelog',        // timelogs — timelogs is in ACTION_SEGMENTS so parent wins; fine as fallback
    // ── Softvalue (/api/softvalue/) ────────────────────────────────────────
    'Softvalue',
    // ── ChatGPT / OpenAI (/api/chatgpt/) ───────────────────────────────────
    'Model',          // models
    'Completion',     // chat/completions (resource extraction fallback)
    'Embedding',      // embeddings
    'Generation',     // images/generations
    'Moderation',     // moderations
  ];
  for (const res of SEED_RESOURCES) {
    const col = getCollection(res);
    for (let i = 0; i < 5; i++) {
      const id = nextId();
      col.set(id, buildRecord(res, id));
    }
  }
  console.log(`[MOCK_MODE] Store seeded with ${SEED_RESOURCES.length} resource types (5 records each).`);
}

// ─── Resource name extraction ─────────────────────────────────────────────────

/** Path segments that are actions/modifiers, not resource names */
const ACTION_SEGMENTS = new Set([
  'list', 'search', 'send', 'approve', 'reject', 'submit', 'recall', 'remind',
  'move', 'read', 'copy', 'trigger', 'cancel', 'reactivate', 'void', 'sent',
  'schedule', 'terminate', 'export', 'import', 'download', 'usage',
  'availability', 'messages', 'members', 'records', 'sharelinks', 'files',
  'timelogs', 'milestones', 'bugs', 'subscribers', 'topics',
]);

function resourceFromUrl(url: string): string {
  const segments = url.split('?')[0].split('/').filter(Boolean);
  // Walk backwards and find the first non-ID, non-action segment
  for (let i = segments.length - 1; i >= 0; i--) {
    const seg = segments[i];
    if (!/^\d+$/.test(seg) && !seg.startsWith('mock-') && !ACTION_SEGMENTS.has(seg.toLowerCase())) {
      // Capitalize and singularize naively (strip trailing 's')
      const name = seg.charAt(0).toUpperCase() + seg.slice(1);
      return name.endsWith('ses') ? name.slice(0, -2) // analyses → analysi — skip
        : name.endsWith('ies') ? name.slice(0, -3) + 'y'  // categories → category
        : name.endsWith('es')  ? name.slice(0, -2)         // addresses → address
        : name.endsWith('s')   ? name.slice(0, -1)         // contacts → contact
        : name;
    }
  }
  return 'Record';
}

// ─── Response builders ────────────────────────────────────────────────────────

function buildRecord(resourceName: string, id?: string): Record<string, unknown> {
  const recordId = id ?? nextId();
  const today = new Date().toISOString().split('T')[0];
  const in30  = new Date(Date.now() + 30 * 86_400_000).toISOString().split('T')[0];
  const now   = new Date().toISOString();
  const owner = { id: 'mock-owner-001', name: 'Mock User', email: 'mock@example.com' };

  switch (resourceName.toLowerCase()) {

    // ── Zoho CRM ────────────────────────────────────────────────────────────
    case 'lead':
      return { id: recordId, First_Name: 'Jane', Last_Name: `Lead-${recordId}`, Email: `lead-${recordId}@example.com`, Phone: '+1-555-0100', Company: 'Acme Corp', Lead_Source: 'Web Download', Lead_Status: 'New', Owner: owner, Created_Time: now, Modified_Time: now };
    case 'contact':
      return { id: recordId, First_Name: 'John', Last_Name: `Contact-${recordId}`, Email: `contact-${recordId}@example.com`, Phone: '+1-555-0101', Account_Name: { id: 'mock-account-001', name: 'Mock Account' }, Owner: owner, Created_Time: now };
    case 'account':
      return { id: recordId, Account_Name: `Mock Account ${recordId}`, Website: 'https://mockaccount.example.com', Phone: '+1-555-0102', Industry: 'Technology', Owner: owner };
    case 'deal':
      return { id: recordId, Deal_Name: `Deal-${recordId}`, Stage: 'Qualification', Amount: randomInt(1000, 50000), Closing_Date: in30, Account_Name: 'Mock Account', Probability: randomInt(10, 90), Owner: owner };
    case 'task':
      return { id: recordId, Subject: `Task-${recordId}`, Status: 'Not Started', Priority: 'Normal', Due_Date: in30, Owner: owner };
    case 'not':       // "Notes" → "Not" (strips 'es')
      return { id: recordId, Note_Title: `Note ${recordId}`, Note_Content: 'Mock note content.', Parent_Id: 'mock-parent-001' };

    // ── Zoho Books ──────────────────────────────────────────────────────────
    case 'invoic':    // "Invoices" → "Invoic" (strips 'es')
      return { invoice_id: recordId, invoice_number: `INV-${recordId}`, customer_id: 'mock-cust-001', customer_name: 'Mock Customer', status: 'draft', date: today, due_date: in30, sub_total: randomInt(100, 4000) / 100, total: randomInt(100, 5000) / 100, balance: randomInt(0, 5000) / 100, currency_code: 'USD' };
    case 'bill':
      return { bill_id: recordId, bill_number: `BILL-${recordId}`, vendor_id: 'mock-vendor-001', vendor_name: 'Mock Vendor', status: 'open', date: today, due_date: in30, total: randomInt(100, 5000) / 100, balance: randomInt(0, 5000) / 100 };
    case 'expens':    // "Expenses" → "Expens" (strips 'es')
      return { expense_id: recordId, merchant_name: 'Mock Merchant', date: today, amount: randomInt(500, 20000) / 100, tax_amount: randomInt(0, 500) / 100, description: 'Business expense', currency_code: 'USD', category_id: 'mock-cat-001', vendor_id: 'mock-vendor-001' };
    case 'customer':
      return { customer_id: recordId, customer_name: `Mock Customer ${recordId}`, display_name: `Mock Customer ${recordId}`, contact_id: recordId, contact_name: `Mock Customer ${recordId}`, contact_type: 'customer', first_name: 'Mock', last_name: `Customer-${recordId}`, email: `customer-${recordId}@example.com`, phone: '+1-555-0400', status: 'active', created_time: now };

    // ── Zoho Invoice ────────────────────────────────────────────────────────
    case 'estimat':   // "Estimates" → "Estimat" (strips 'es')
      return { estimate_id: recordId, estimate_number: `EST-${recordId}`, customer_id: 'mock-cust-001', customer_name: 'Mock Customer', status: 'draft', date: today, expiry_date: in30, total: randomInt(100, 5000) / 100 };

    // ── Zoho Campaigns ──────────────────────────────────────────────────────
    case 'campaign':
      return { campaignid: recordId, campaigntopic: `Campaign ${recordId}`, campstatus: 'draft', camptype: 'email', from_email: 'noreply@example.com', from_name: 'Mock Sender', subject: `Mock Subject ${recordId}`, totalsent: 0, opens: 0, clicks: 0 };
    case 'subscriber':
      return { contact_email: `subscriber-${recordId}@example.com`, first_name: 'Sub', last_name: `User-${recordId}`, company: 'Mock Co', status: 'active', listkey: 'mock-list-001' };
    case 'mailinglist':
      return { listkey: recordId, listname: `List ${recordId}`, description: 'Mock mailing list', type: 'email' };
    case 'topic':
      return { topicid: recordId, topicname: `Topic ${recordId}`, description: 'Mock topic' };

    // ── Zoho Desk ───────────────────────────────────────────────────────────
    case 'ticket':
      return { id: recordId, ticketNumber: `TKT-${recordId}`, subject: `Support request ${recordId}`, contact: { id: 'mock-contact-001', firstName: 'Jane', lastName: 'Doe', email: 'jane.doe@example.com' }, priority: 'Medium', status: 'Open', channel: 'Email', dueDate: in30, createdTime: now };
    case 'comment':
      return { id: recordId, ticketId: 'mock-ticket-001', content: 'Mock comment content.', isPublic: true, createdTime: now };
    case 'agent':
      return { id: recordId, firstName: 'Support', lastName: `Agent-${recordId}`, email: `agent-${recordId}@support.example.com`, type: 'agent', status: 'active' };
    case 'department':
      return { id: recordId, name: `Department ${recordId}`, isDefault: false, description: 'Mock department', enabled: true };

    // ── Zoho Expense ────────────────────────────────────────────────────────
    case 'category':
      return { category_id: recordId, category_name: `Category ${recordId}`, description: 'Mock category', is_enabled: true };
    case 'report':
      return { report_id: recordId, report_name: `Report ${recordId}`, employee_name: 'Mock Employee', submitted_date: today, from_date: today, to_date: in30, total: randomInt(1000, 10000) / 100, status: 'draft' };
    case 'advance':
      return { advance_id: recordId, employee_id: 'mock-emp-001', amount: randomInt(10000, 100000) / 100, currency_code: 'USD', date: today, balance: randomInt(0, 10000) / 100 };

    // ── Zoho Mail ───────────────────────────────────────────────────────────
    case 'folder':
      return { folderId: recordId, folderName: `Folder ${recordId}`, systemFolder: 'Inbox', unreadCount: randomInt(0, 20), messageCount: randomInt(5, 100) };
    case 'messag':    // "Messages" → "Messag" (strips 'es')
      return { messageId: recordId, subject: `Subject ${recordId}`, sender: 'sender@example.com', fromAddress: 'sender@example.com', toAddress: 'recipient@example.com', sentDateInGMT: now, folderId: 'mock-folder-001', status: 'unread', hasAttachment: false };

    // ── Zoho People ─────────────────────────────────────────────────────────
    case 'employ':    // "Employees" → "Employ" (strips 'ees'? No: 'es') — actually "Employees" ends with 'es' → slice(-2) → "Employ"
      return { Employee_ID: recordId, EmployeeID: `EMP-${recordId}`, FirstName: 'Jane', LastName: `Employee-${recordId}`, Email: `employee-${recordId}@example.com`, Mobile: '+1-555-0200', Department: 'Engineering', Designation: 'Developer', DateOfJoining: today, EmploymentStatus: 'active' };
    case 'leaverequest':
    case 'leaverequea': // not expected but guard
      return { leaveId: recordId, employeeId: 'mock-emp-001', leaveTypeId: 'mock-lt-001', from: today, to: in30, dayCount: 1, reason: 'Annual leave', status: 'Pending' };
    case 'leavetype':
      return { leaveTypeId: recordId, leaveTypeName: `Leave Type ${recordId}`, unit: 'days' };
    case 'attendanc':  // "Attendances" → "Attendanc" (strips 'es')
      return { attendanceId: recordId, employeeId: 'mock-emp-001', attendanceDate: today, checkIn: '09:00', checkOut: '17:00', workDuration: 8 };
    case 'form':
      return { formLinkName: `form-${recordId}`, formDisplayName: `Form ${recordId}`, fields: [] };

    // ── Zoho Payroll ────────────────────────────────────────────────────────
    case 'payrun':
      return { pay_run_id: recordId, pay_period: '2025-01', pay_date: today, status: 'draft', total_cost: randomInt(10000, 50000) / 100, employee_count: randomInt(1, 50) };
    case 'payslip':
      return { payslip_id: recordId, employee_id: 'mock-emp-001', employee_name: 'Mock Employee', pay_run_id: 'mock-payrun-001', pay_period: '2025-01', basic_pay: randomInt(200000, 600000) / 100, gross_earnings: randomInt(200000, 700000) / 100, total_deductions: randomInt(10000, 50000) / 100, net_pay: randomInt(150000, 600000) / 100, status: 'draft' };
    case 'component':
      return { component_id: recordId, component_name: `Component ${recordId}`, type: 'earnings', amount: randomInt(10000, 50000) / 100, calculation_type: 'flat', is_mandatory: false };
    case 'declaration':
      return { declaration_id: recordId, employee_id: 'mock-emp-001', fiscal_year: '2025', status: 'draft', declarations: [] };

    // ── Zoho Analytics ──────────────────────────────────────────────────────
    case 'workspac':   // "Workspaces" → "Workspac" (strips 'es')
    case 'workspace':
      return { workspaceId: recordId, workspaceName: `Workspace ${recordId}`, description: 'Mock analytics workspace', ownerId: 'mock-owner-001', createdTime: now };
    case 'view':
      return { viewId: recordId, viewName: `View ${recordId}`, viewType: 'table', workspaceId: 'mock-ws-001', tableName: 'MockTable', description: 'Mock view', createdTime: now };
    case 'dashboard':
      return { dashboardId: recordId, dashboardName: `Dashboard ${recordId}`, workspaceId: 'mock-ws-001', theme: 'default', layouts: [], createdTime: now };

    // ── Zoho Cliq ───────────────────────────────────────────────────────────
    case 'channel':
      return { id: recordId, name: `channel-${recordId}`, type: 'public', description: 'Mock channel', member_count: randomInt(2, 50), creator: 'mock@example.com', created_time: now };
    case 'bot':
      return { id: recordId, name: `Bot ${recordId}`, description: 'Mock bot', icon_url: 'https://example.com/bot-icon.png', platform_url: 'https://example.com/bot', is_enabled: true };
    case 'usergroup':
      return { id: recordId, name: `Group ${recordId}`, description: 'Mock user group', members: [] };

    // ── Zoho Commerce ───────────────────────────────────────────────────────
    case 'product':
      return { product_id: recordId, name: `Product ${recordId}`, description: 'Mock product', sku: `SKU-${recordId}`, price: randomInt(100, 50000) / 100, status: 'active', stock_quantity: randomInt(0, 100), created_time: now };
    case 'order':
      return { order_id: recordId, order_number: `ORD-${recordId}`, customer_id: 'mock-cust-001', customer_email: 'customer@example.com', status: 'pending', subtotal: randomInt(1000, 20000) / 100, total: randomInt(1000, 25000) / 100, created_time: now };
    case 'variant':
      return { variant_id: recordId, sku: `VAR-${recordId}`, price: randomInt(100, 50000) / 100, stock_quantity: randomInt(0, 100), options: { size: 'M', color: 'Blue' } };

    // ── Zoho Creator ────────────────────────────────────────────────────────
    case 'application':
      return { link_name: `app-${recordId}`, application_name: `App ${recordId}`, description: 'Mock Creator app', owner: 'mock@example.com', is_published: false, component_count: 0 };
    case 'workflow':
      return { workflow_id: recordId, workflow_name: `Workflow ${recordId}`, is_enabled: true, trigger: 'form_submit' };

    // ── Zoho Recruit ────────────────────────────────────────────────────────
    case 'jobopening':
    case 'job-opening':
      return { Job_Opening_ID: recordId, Job_Opening_Name: `Job Opening ${recordId}`, Department: 'Engineering', Location: 'Remote', No_of_Positions: randomInt(1, 5), Job_Opening_Status: 'open', Date_Opened: today, Target_Date: in30, Hiring_Manager: 'Mock Manager' };
    case 'candidat':   // "Candidates" → "Candidat" (strips 'es')
      return { Candidate_ID: recordId, First_Name: 'Jane', Last_Name: `Candidate-${recordId}`, Email: `candidate-${recordId}@example.com`, Mobile: '+1-555-0300', Current_Job_Title: 'Developer', Current_Employer: 'Previous Corp', Candidate_Status: 'new', Experience_in_Years: randomInt(1, 10) };
    case 'interview':
      return { Interview_ID: recordId, Candidate_ID: 'mock-cand-001', Job_Opening_ID: 'mock-job-001', Name: `Interview ${recordId}`, Interview_Time: now, Status: 'pending', Notes: 'Mock interview notes' };
    case 'offer':
      return { Offer_ID: recordId, Candidate_ID: 'mock-cand-001', Job_Opening_ID: 'mock-job-001', Offer_Amount: randomInt(50000, 150000), Date_of_Joining: in30, Status: 'pending' };

    // ── Zoho SalesIQ ────────────────────────────────────────────────────────
    case 'visitor':
      return { id: recordId, name: `Visitor ${recordId}`, email: `visitor-${recordId}@example.com`, city: 'New York', country: 'USA', status: 'browsing', time_spent: randomInt(30, 600), no_of_visits: randomInt(1, 20), first_visit: now, last_visit: now };
    case 'chat':
      return { id: recordId, visitor_id: 'mock-visitor-001', visitor_name: 'Mock Visitor', visitor_email: 'visitor@example.com', status: 'open', chat_duration: randomInt(60, 1800), start_time: now };
    case 'operator':
      return { id: recordId, name: `Operator ${recordId}`, email: `operator-${recordId}@example.com`, status: 'online', concurrent_chats: randomInt(0, 5) };

    // ── Zoho Sign ───────────────────────────────────────────────────────────
    case 'document':
      return { document_id: recordId, document_name: `Document-${recordId}.pdf`, request_id: 'mock-req-001', created_time: now, document_fields: [] };
    case 'request':
      return { request_id: recordId, request_name: `Sign Request ${recordId}`, status: 'inprogress', owner_id: 'mock-owner-001', created_time: now, expiration_days: 30, is_sequential: false };
    case 'recipient':
      return { recipient_id: recordId, recipient_name: `Recipient ${recordId}`, recipient_email: `signer-${recordId}@example.com`, role: 'signer', signing_order: 1, status: 'pending' };
    case 'template':
      return { templates_id: recordId, template_name: `Template ${recordId}`, owner_id: 'mock-owner-001', created_time: now, notes_to_signer: '' };

    // ── Zoho Subscriptions ──────────────────────────────────────────────────
    case 'plan':
      return { plan_code: `PLAN-${recordId}`, name: `Plan ${recordId}`, description: 'Mock subscription plan', price: randomInt(999, 9999) / 100, interval: 'monthly', status: 'active' };
    case 'addon':
      return { addon_code: `ADDON-${recordId}`, name: `Addon ${recordId}`, type: 'recurring', price_brackets: [{ price: randomInt(100, 499) / 100 }] };
    case 'coupon':
      return { coupon_code: `CPNO-${recordId}`, name: `Coupon ${recordId}`, discount_type: 'percentage', discount_percentage: randomInt(5, 40), duration_type: 'one_time', status: 'active' };
    case 'subscription':
      return { subscription_id: recordId, subscription_number: `SUB-${recordId}`, customer_id: 'mock-cust-001', customer_name: 'Mock Customer', plan_code: 'PLAN-001', plan_name: 'Basic Plan', status: 'active', starts_at: today, current_term_starts_at: today, current_term_ends_at: in30, sub_total: randomInt(999, 9999) / 100, total: randomInt(999, 9999) / 100, created_time: now };

    // ── Zoho WorkDrive ──────────────────────────────────────────────────────
    case 'team':
      return { id: recordId, name: `Team ${recordId}`, created_time: now, members_count: randomInt(1, 20) };
    case 'fil':        // "Files" → "Fil" (strips 'es')
      return { id: recordId, name: `file-${recordId}.pdf`, type: 'pdf', parent_id: 'mock-folder-001', creator_id: 'mock-owner-001', size: randomInt(1024, 1048576), created_time: now, modified_time: now };
    case 'member':
      return { id: recordId, email: `member-${recordId}@example.com`, name: `Member ${recordId}`, role: 'editor', status: 'active' };

    // ── Impossible Cloud ────────────────────────────────────────────────────    
    case 'region':
      return { id: recordId, name: `region-${recordId}`, displayName: `Mock Region ${recordId}`, endpoint: `https://s3.${recordId}.impossiblecloud.com`, location: 'EU-Central', available: true };    
    case 'contract':
      return { id: recordId, distributorId: 'mock-dist-001', allocatedCapacity: 10000, reservedCapacity: randomInt(0, 5000), costStorageGBCents: 150, costEgressGBCents: 0, currency: 'EUR', details: 'Mock distributor contract' };
    case 'partner':
      return { id: recordId, name: `Partner ${recordId}`, distributorContractId: 'mock-contract-001', allocatedCapacity: randomInt(100, 5000), allowOverdraft: false, details: 'Mock partner' };
    case 'member':
      return { id: recordId, email: `user-${recordId}@example.com`, role: 'member', partnerId: 'mock-partner-001', status: 'active', createdAt: now };

    case 'storageaccount':
    case 'storage-account':
      return { name: `storage-${recordId}`, clientAccountId: `mock-client-${recordId}`, contactEmail: `storage-${recordId}@example.com`, allocatedCapacity: randomInt(10, 1000), allowOverdraft: false, pendingDeletedAt: null };

    // ── Zoho Projects ───────────────────────────────────────────────────────
    case 'project':
      return { id: recordId, name: `Project ${recordId}`, description: 'Mock project', owner: { id: 'mock-owner-001', name: 'Mock User' }, status: 'active', start_date: today, end_date: in30, budget: randomInt(10000, 100000), billing_type: 'fixed_cost', created_time: now };
    case 'milestone':
    case 'mileston':   // "Milestones" → "Mileston" (strips 'es')
      return { id: recordId, name: `Milestone ${recordId}`, project_id: 'mock-project-001', status: 'open', flag: 'internal', end_date: in30 };
    case 'bug':
      return { id: recordId, title: `Bug ${recordId}`, description: 'Mock bug description', project_id: 'mock-project-001', status: 'open', severity: 'minor', priority: 'low', created_time: now };
    case 'timesheet':
    case 'timelog':
      return { id: recordId, project_id: 'mock-project-001', task_id: 'mock-task-001', user_id: 'mock-owner-001', bill_status: 'billable', hours: '2.5', notes: 'Mock time log', log_date: today };

    // ── Softvalue ────────────────────────────────────────────────────────────
    case 'softvalue':
    case 'item':
      return { id: recordId, name: `Item ${recordId}`, value: randomInt(1, 100), created_at: now };

    // ── ChatGPT / OpenAI ────────────────────────────────────────────────────
    case 'model':
      return { id: `gpt-4o-${recordId}`, object: 'model', created: Math.floor(Date.now() / 1000), owned_by: 'openai' };
    case 'completion':
      return { id: `chatcmpl-${recordId}`, object: 'chat.completion', created: Math.floor(Date.now() / 1000), model: 'gpt-4o', choices: [{ index: 0, message: { role: 'assistant', content: `Mock response ${recordId}` }, finish_reason: 'stop' }], usage: { prompt_tokens: randomInt(10, 200), completion_tokens: randomInt(20, 500), total_tokens: randomInt(30, 700) } };
    case 'embedding':
      return { object: 'list', data: [{ object: 'embedding', index: 0, embedding: Array.from({ length: 8 }, () => Math.random()) }], model: 'text-embedding-ada-002', usage: { prompt_tokens: randomInt(5, 50), total_tokens: randomInt(5, 50) } };
    case 'generation':
      return { created: Math.floor(Date.now() / 1000), data: [{ url: `https://oaidalleapiprodscus.blob.core.windows.net/mock/${recordId}.png`, revised_prompt: `Mock image prompt ${recordId}` }] };
    case 'moderation':
      return { id: `modr-${recordId}`, model: 'text-moderation-007', results: [{ flagged: false, categories: { sexual: false, hate: false, harassment: false, 'self-harm': false, violence: false }, category_scores: { sexual: 0.001, hate: 0.0001, harassment: 0.0002, 'self-harm': 0.0001, violence: 0.0003 } }] };

    // ── Fallback ─────────────────────────────────────────────────────────────
    default:
      return { id: recordId, name: `${resourceName} ${recordId}`, created_at: now, modified_at: now, status: 'active', owner };
  }
}

/** GET /resource or /resource/:id — reads from the in-memory store */
function handleGet(url: string): unknown {
  const name = resourceFromUrl(url);
  const col  = getCollection(name);
  const id   = idFromUrl(url);

  if (id) {
    // Single-record lookup
    let record = col.get(id);
    if (!record) {
      // Build on the fly and cache so subsequent GETs are consistent
      record = buildRecord(name, id);
      col.set(id, record);
    }
    return { data: [record] };
  }

  // Collection listing
  const records = [...col.values()];
  return {
    data: records,
    info: { count: records.length, more_records: false, page: 1, per_page: 200 },
  };
}

/** POST → create a new record, persist it, return Zoho-style envelope */
function handlePost(url: string, rawBody: unknown): [number, unknown] {
  const name = resourceFromUrl(url);
  const col  = getCollection(name);
  const id   = nextId();
  const record = buildRecord(name, id);
  // Merge caller-supplied fields on top of the generated template
  if (rawBody && typeof rawBody === 'object') {
    Object.assign(record, rawBody as object);
  }
  col.set(id, record);
  return [
    201,
    {
      data: [{
        code: 'SUCCESS',
        status: 'success',
        message: 'record added',
        details: { id, created_time: new Date().toISOString(), ...record },
      }],
    },
  ];
}

/** PUT / PATCH → update an existing record in the store */
function handlePutPatch(url: string, rawBody: unknown): [number, unknown] {
  const name = resourceFromUrl(url);
  const col  = getCollection(name);
  const id   = idFromUrl(url) ?? nextId();
  const existing = col.get(id) ?? buildRecord(name, id);
  if (rawBody && typeof rawBody === 'object') {
    Object.assign(existing, rawBody as object);
  }
  col.set(id, existing);
  return [
    200,
    {
      data: [{
        code: 'SUCCESS',
        status: 'success',
        message: 'record updated',
        details: { id, modified_time: new Date().toISOString(), ...existing },
      }],
    },
  ];
}

/** DELETE → remove from store */
function handleDelete(url: string): [number, unknown] {
  const name = resourceFromUrl(url);
  const col  = getCollection(name);
  const id   = idFromUrl(url) ?? '';
  col.delete(id);
  return [
    200,
    {
      data: [{
        code: 'SUCCESS',
        status: 'success',
        message: 'record deleted',
        details: { id },
      }],
    },
  ];
}

// ─── Adapter factory ──────────────────────────────────────────────────────────

/**
 * Attaches a MockAdapter to the given Axios instance.
 * All requests are intercepted and answered with realistic stub data.
 *
 * Activated when `MOCK_MODE=true` in the environment.
 */
export function attachMockAdapter(instance: AxiosInstance): void {
  // Seed the store once (guard against multiple calls)
  if (store.size === 0) seedStore();

  const mock = new MockAdapter(instance, {
    delayResponse: 80, // simulate slight latency
    onNoMatch: 'throwException',
  }) as {
    onAny(url?: RegExp): { reply: (fn: (cfg: { url?: string; method?: string; data?: unknown }) => [number, unknown]) => void };
  };

  mock.onAny().reply((config: { url?: string; method?: string; data?: unknown }) => {
    const method = (config.method ?? 'get').toLowerCase();
    const url    = config.url ?? '/';
    // Axios serialises the body as a JSON string; parse it back
    let body: unknown = config.data;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch { /* leave as string */ }
    }

    switch (method) {
      case 'get':    return [200, handleGet(url)];
      case 'post':   return handlePost(url, body);
      case 'put':    return handlePutPatch(url, body);
      case 'patch':  return handlePutPatch(url, body);
      case 'delete': return handleDelete(url);
      default:       return [200, { message: 'ok' }];
    }
  });

  console.log('[MOCK_MODE] Axios mock adapter attached — all HTTP calls are stubbed.');
}

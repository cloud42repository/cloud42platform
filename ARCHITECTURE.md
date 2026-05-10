# Cloud42 Platform — Architecture Documentation

## Table of Contents

1. [Overview](#1-overview)
2. [Technology Stack](#2-technology-stack)
3. [Project Structure](#3-project-structure)
4. [Backend Architecture](#4-backend-architecture)
5. [Frontend Architecture](#5-frontend-architecture)
6. [Authentication & Security](#6-authentication--security)
7. [Database Schema](#7-database-schema)
8. [API Reference](#8-api-reference)
9. [Integration Modules](#9-integration-modules)
10. [Visual Builders](#10-visual-builders)
11. [Script Execution Engine](#11-script-execution-engine)
12. [Sharing System](#12-sharing-system)
13. [Mock Mode](#13-mock-mode)
14. [Internationalization](#14-internationalization)
15. [Theming](#15-theming)
16. [Deployment](#16-deployment)

---

## 1. Overview

Cloud42 Platform is a low-code enterprise integration platform that connects 20+ Zoho APIs and third-party services through visual builders for **workflows**, **dashboards**, **forms**, and **applications**.

**Key capabilities:**
- Visual workflow builder with control flow (loops, conditions, try-catch, scripts)
- Dashboard builder with charts, tables, and badges
- Form builder with dynamic data sources, onChange scripts, and submit actions
- Application builder composing forms, dashboards, and workflows into multi-page apps
- 22 Zoho API integrations + Impossible Cloud, Softvalue, ChatGPT, Microsoft Graph
- Role-based access control (Admin, Manager, User)
- Public sharing via tokenized URLs
- AI agent chatbot with NLU command classification
- Multi-language support (EN, FR, DE)
- Light/dark mode with 5 color themes

---

## 2. Technology Stack

### Backend

| Component | Technology | Version |
|-----------|-----------|---------|
| Framework | NestJS | 10.3 |
| Runtime | Node.js | 18+ |
| Language | TypeScript | ES2020 target |
| Database | PostgreSQL | via TypeORM 0.3 |
| Auth | JWT + Passport.js | @nestjs/jwt 11 |
| HTTP Client | Axios | 1.7 |
| Password Hashing | bcryptjs | 3.0 |
| Google Auth | google-auth-library | 10.6 |
| Email | SendGrid (@sendgrid/mail) | 8.1 |
| Mock | axios-mock-adapter | 1.22 |

### Frontend

| Component | Technology | Version |
|-----------|-----------|---------|
| Framework | Angular (standalone) | 21.2 |
| UI Library | Angular Material 3 | 21.2 |
| State | Angular Signals | built-in |
| Charts | Chart.js + ng2-charts | latest |
| Code Editor | Monaco Editor | latest |
| Drag & Drop | Angular CDK | 21.2 |
| Export | jsPDF, ExcelJS, html2canvas | latest |
| OAuth | Google Identity Services | web |

---

## 3. Project Structure

```
cloud42Platform/
├── backend/
│   ├── src/
│   │   ├── main.ts                    # NestJS bootstrap
│   │   ├── app.module.ts              # Root module (all imports)
│   │   ├── auth/                      # Auth provider implementations
│   │   ├── auth-module/               # JWT auth, guards, strategies
│   │   ├── auth-config/               # Per-module auth config CRUD
│   │   ├── base/                      # ZohoBaseClient (abstract HTTP client)
│   │   ├── shared/                    # Exception filter, email service, schema
│   │   ├── mock/                      # Mock adapter & auth provider
│   │   ├── user/                      # User management
│   │   ├── workflow/                  # Workflow CRUD + execution
│   │   ├── dashboard/                 # Dashboard CRUD
│   │   ├── form/                      # Form CRUD
│   │   ├── notification/              # Notification CRUD
│   │   ├── share/                     # Share link management
│   │   ├── chatgpt/                   # ChatGPT integration
│   │   ├── microsoft-graph/           # Microsoft Graph (email)
│   │   ├── impossible-cloud/          # Impossible Cloud storage
│   │   ├── softvalue/                 # Custom integration
│   │   ├── zoho-crm/                  # Zoho CRM
│   │   ├── zoho-books/                # Zoho Books
│   │   └── zoho-{module}/             # 18 more Zoho modules
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── main.ts                    # Angular bootstrap
│   │   ├── index.html                 # HTML shell
│   │   ├── styles.css                 # Global styles & theme variables
│   │   ├── material-theme.scss        # Material 3 theme
│   │   ├── app/
│   │   │   ├── app.ts                 # Root component (shell, sidenav, toolbar)
│   │   │   ├── app.routes.ts          # Route definitions
│   │   │   ├── app.config.ts          # Providers (HTTP, router, auth)
│   │   │   ├── config/                # Type definitions & module registry
│   │   │   ├── services/              # 40+ services
│   │   │   ├── guards/                # Auth guard
│   │   │   ├── interceptors/          # Auth interceptor
│   │   │   ├── i18n/                  # Translation dictionaries (EN, FR, DE)
│   │   │   ├── shared/                # Shared components
│   │   │   └── pages/                 # 23 page components
│   │   └── environments/              # Dev & prod config
│   ├── public/                        # Static assets
│   ├── angular.json
│   └── package.json
│
├── package.json                       # Root workspace scripts
└── sonar-project.properties           # SonarQube config
```

---

## 4. Backend Architecture

### 4.1 Bootstrap & Configuration

The backend is a NestJS application bootstrapped in `main.ts`:

- **Global prefix**: `/api` — all routes are prefixed
- **CORS**: configurable via `CORS_ORIGIN` env (default: `http://localhost:4200`)
- **Cookie parser**: for HttpOnly refresh token cookies
- **Global exception filter**: `ZohoApiExceptionFilter` converts Axios/Zoho errors to structured HTTP responses
- **Mock mode**: when `MOCK_MODE=true`, all external API calls are intercepted by the mock adapter

### 4.2 Module Architecture

Every feature is a NestJS module following the **Controller → Service → Repository** pattern:

```
Module
├── {name}.module.ts        # Imports, providers, controllers
├── {name}.controller.ts    # REST endpoints
├── {name}.service.ts       # Business logic
├── {name}.entity.ts        # TypeORM entity (if persisted)
└── {name}.dto.ts           # Request/response DTOs
```

**25 modules** are registered in `AppModule`:

| Category | Modules |
|----------|---------|
| Auth | AuthModule, AuthConfigModule |
| Data | UserModule, WorkflowModule, DashboardModule, FormModule, ApplicationModule, ShareModule, NotificationModule |
| Utility | SchemaModule |
| Integration | ZohoCrmModule, ZohoBooksModule, ZohoInvoiceModule, ZohoInventoryModule, ZohoSubscriptionsModule, ZohoPeopleModule, ZohoDeskModule, ZohoProjectsModule, ZohoAnalyticsModule, ZohoCampaignsModule, ZohoRecruitModule, ZohoSignModule, ZohoMailModule, ZohoWorkdriveModule, ZohoCliqModule, ZohoExpenseModule, ZohoPayrollModule, ZohoCommerceModule, ZohoCreatorModule, ZohoSalesiqModule, SoftvalueModule, ImpossibleCloudModule, ChatGPTModule, MicrosoftGraphModule |

### 4.3 Base Client Pattern

All external API integrations extend `ZohoBaseClient`:

```typescript
abstract class ZohoBaseClient {
  protected axios: AxiosInstance;
  
  constructor(config: ZohoProductConfig) {
    // Creates Axios instance with:
    // - Auto Authorization header injection
    // - 401 retry with token refresh
    // - Error conversion to ZohoApiError
    // - Mock adapter attachment (if MOCK_MODE)
  }
  
  protected get<T>(url: string, params?): Promise<T>
  protected post<T>(url: string, data?): Promise<T>
  protected put<T>(url: string, data?): Promise<T>
  protected delete<T>(url: string): Promise<T>
}
```

### 4.4 Service Layer

**Data services** (Form, Dashboard, Workflow, etc.) follow a consistent pattern:

```typescript
@Injectable()
export class FormService {
  constructor(@InjectRepository(FormEntity) private repo: Repository<FormEntity>) {}
  
  findAllByUser(userEmail: string): Promise<FormDto[]>
  findById(id: string): Promise<FormDto>
  create(dto: CreateFormDto): Promise<FormDto>
  update(id: string, dto: UpdateFormDto): Promise<FormDto>
  remove(id: string): Promise<void>
}
```

**Integration services** wrap `ZohoBaseClient` with product-specific methods.

### 4.5 User Context

`UserContextInterceptor` uses `AsyncLocalStorage` to attach the authenticated user's email to every request. Services access it via `getCurrentUserEmail()` without parameter passing.

---

## 5. Frontend Architecture

### 5.1 Application Shell

The root `AppComponent` provides the main layout:

```
┌─────────────────────────────────────────────────┐
│  Toolbar  [Menu] ☁️ Cloud42    🌙 🤖 🔔 👤     │
├──────────┬──────────────────────────────────────┤
│ Sidebar  │                                      │
│          │                                      │
│ Workflows│         <router-outlet>              │
│ Dashboards│                                     │
│ Forms    │         (Page Content)               │
│ Apps     │                                      │
│ API Test │                                      │
│ Settings │                                      │
│ ─────── │                                      │
│ Modules  │                                      │
│  ├ CRM   │                                      │
│  ├ Books │                                      │
│  └ ...   │                                      │
├──────────┴──────────────────────────────────────┤
```

### 5.2 Standalone Components

All components are **standalone** (no NgModules). Dependencies are declared in each component's `imports` array:

```typescript
@Component({
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, ...],
  template: `...`,
})
export class MyComponent { }
```

### 5.3 Signal-Based State

The frontend uses Angular **signals** for all reactive state:

```typescript
// Service
readonly workflows = signal<Workflow[]>([]);
readonly loading = signal(false);

// Component
readonly selectedId = signal<string | null>(null);
readonly selected = computed(() => 
  this.workflows().find(w => w.id === this.selectedId())
);
```

### 5.4 Routing

All routes are defined in `app.routes.ts`. Protected routes use `canActivate: [authGuard]`:

| Path | Component | Purpose |
|------|-----------|---------|
| `/login` | LoginComponent | Google & password login |
| `/workflows` | WorkflowListComponent | Workflow list |
| `/workflows/new` | WorkflowBuilderComponent | Create workflow |
| `/workflows/:id/edit` | WorkflowBuilderComponent | Edit workflow |
| `/workflows/calendar` | WorkflowCalendarComponent | Schedule view |
| `/dashboards` | DashboardListComponent | Dashboard list |
| `/dashboards/new` | DashboardBuilderComponent | Create dashboard |
| `/dashboards/:id/edit` | DashboardBuilderComponent | Edit dashboard |
| `/forms` | FormListComponent | Form list |
| `/forms/new` | FormBuilderComponent | Create form |
| `/forms/:id/edit` | FormBuilderComponent | Edit form |
| `/applications` | ApplicationListComponent | App list |
| `/applications/new` | ApplicationBuilderComponent | Create app |
| `/applications/:id/edit` | ApplicationBuilderComponent | Edit app |
| `/applications/:id/view` | ApplicationViewerComponent | View app |
| `/settings` | SettingsComponent | Auth configuration |
| `/users` | UserManagementComponent | Admin user management |
| `/api-tester` | ApiTesterComponent | API endpoint browser |
| `/agent` | AgentComponent | AI chatbot |
| `/shares` | SharedListComponent | Share link management |
| `/shared/:token` | SharedViewerComponent | Public shared view (no auth) |
| Module routes | ModulePageComponent | Dynamic per-module pages |

### 5.5 Services

**40+ services** organized by responsibility:

| Service | Purpose |
|---------|---------|
| `ApiService` | HTTP request builder (get/post/put/patch/delete) |
| `AuthService` | Google & password login, token management |
| `FormService` | Form CRUD, sync with backend |
| `DashboardService` | Dashboard CRUD |
| `WorkflowService` | Workflow CRUD + client-side execution |
| `ApplicationService` | Application CRUD |
| `NotificationService` | Notification CRUD, polling |
| `ShareService` | Share link creation, resolution |
| `UserManagementService` | User roles, module visibility |
| `ModuleVisibilityService` | Module access control |
| `SchemaService` | API schema cache (for builder autocomplete) |
| `ThemeService` | Light/dark mode, color themes |
| `TranslateService` | i18n language switching |
| `NluEngine` | AI agent command classification |
| 22× Zoho services | Per-module API wrappers |

### 5.6 Shared Components

| Component | Purpose |
|-----------|---------|
| `FormViewComponent` | Renders dynamic forms for any API endpoint |
| `ListViewComponent` | Renders data tables for any GET endpoint |
| `NotificationPanelComponent` | Bell icon with notification dropdown |
| `ScriptEditorDialogComponent` | Monaco code editor with debug console |

---

## 6. Authentication & Security

### 6.1 Auth Flow

```
┌──────────┐     Google ID Token      ┌──────────┐
│  Browser  │ ──────────────────────► │  Backend  │
│           │                         │           │
│           │ ◄──── JWT Access Token  │  Verifies │
│           │       + HttpOnly Cookie │  Google   │
│           │       (refresh token)   │  Token    │
│           │                         │           │
│  Stores   │     Bearer Token        │  Validates│
│  JWT in   │ ──────────────────────► │  JWT on   │
│ session   │    (every API call)     │  every    │
│ Storage   │                         │  request  │
└──────────┘                         └──────────┘
```

### 6.2 Token Management

| Token | Storage | TTL | Purpose |
|-------|---------|-----|---------|
| Access Token (JWT) | sessionStorage | 15min | API authorization |
| Refresh Token | HttpOnly cookie | 7 days | Silent token refresh |
| Google ID Token | transient | single-use | Initial authentication |

### 6.3 Guards & Interceptors

**Backend:**
- `JwtAuthGuard` (global) — Validates JWT on every request, opt-out with `@Public()`
- `RolesGuard` — Enforced when `@Roles('admin')` is present

**Frontend:**
- `authGuard` — Redirects to `/login` if not authenticated, attempts refresh
- `authInterceptor` — Adds `Authorization: Bearer` header, retries on 401

### 6.4 Auth Providers (for External APIs)

Eight pluggable auth providers for connecting to external services:

| Provider | Use Case |
|----------|----------|
| `OAuthRefreshProvider` | Server-to-server with refresh token |
| `ClientCredentialsAuth` | Daemon/background services |
| `PKCEAuth` | Public clients (SPAs, mobile) |
| `DeviceFlowAuth` | CLI/devices without browser |
| `AuthorizationCodeAuth` | Standard OAuth2 code flow |
| `PassthroughAuth` | Pre-existing access token |
| `StoredTokenAuthProvider` | Static token from config |
| `CustomAuthProvider` | User-defined custom auth |

### 6.5 Role-Based Access Control

| Role | Permissions |
|------|-------------|
| Admin | Full access, user management, module config |
| Manager | Module configuration, workflow execution |
| User | Read-only access to enabled modules |

Module visibility is controlled per-user via `moduleVisibility` (JSONB on User entity).

---

## 7. Database Schema

PostgreSQL with TypeORM. 8 tables:

### Entity Relationship

```
users (PK: email)
 ├── workflows (FK: userEmail → users.email, CASCADE)
 ├── dashboards (FK: userEmail → users.email, CASCADE)
 ├── forms (FK: userEmail → users.email, CASCADE)
 ├── applications (FK: userEmail → users.email, CASCADE)
 ├── shares (FK: ownerEmail → users.email, CASCADE)
 ├── notifications (FK: userEmail → users.email, CASCADE)
 └── auth_configs (FK: userEmail → users.email, CASCADE)
```

### Table Details

#### `users`
| Column | Type | Notes |
|--------|------|-------|
| email | varchar(320) | **PK** |
| name | varchar | Display name |
| photoUrl | varchar | Avatar URL |
| role | enum | admin \| manager \| user |
| status | enum | pending \| active \| revoked |
| passwordHash | varchar | bcrypt hash (nullable for Google-only) |
| passwordSetToken | varchar | Reset token (nullable) |
| passwordSetTokenExpiry | timestamptz | Token expiry |
| moduleVisibility | jsonb | `{ "zoho-crm": true, ... }` |
| hashedRefreshToken | varchar | SHA-256 of current refresh token |
| createdAt | timestamptz | |
| lastLoginAt | timestamptz | |

#### `workflows`
| Column | Type | Notes |
|--------|------|-------|
| id | varchar(64) | **PK** |
| userEmail | varchar | FK → users |
| name | varchar | |
| description | varchar | |
| steps | jsonb | Full step tree |
| inputs | jsonb | Named input parameters |
| outputs | jsonb | Named output bindings |
| status | enum | draft \| scheduled \| running \| completed \| failed |
| scheduledAt | timestamptz | Nullable |
| lastRunLog | jsonb | Execution log |
| createdAt, updatedAt | timestamptz | |

#### `dashboards`
| Column | Type | Notes |
|--------|------|-------|
| id | varchar(64) | **PK** |
| userEmail | varchar | FK → users |
| name, description | varchar | |
| widgets | jsonb | Widget definitions |
| status | enum | draft \| published |
| createdAt, updatedAt | timestamptz | |

#### `forms`
| Column | Type | Notes |
|--------|------|-------|
| id | varchar(64) | **PK** |
| userEmail | varchar | FK → users |
| name, description | varchar | |
| fields | jsonb | Field definitions |
| submitActions | jsonb | Action definitions |
| status | enum | draft \| published |
| createdAt, updatedAt | timestamptz | |

#### `applications`
| Column | Type | Notes |
|--------|------|-------|
| id | varchar(64) | **PK** |
| userEmail | varchar | FK → users |
| name, description | varchar | |
| pages | jsonb | Page definitions |
| navigation | jsonb | Nav style + home page |
| status | enum | draft \| published |
| createdAt, updatedAt | timestamptz | |

#### `shares`
| Column | Type | Notes |
|--------|------|-------|
| token | varchar(64) | **PK** |
| itemType | enum | dashboard \| form \| workflow \| application |
| itemId | varchar(64) | Reference to item |
| ownerEmail | varchar | FK → users |
| sharedWithEmail | varchar(320) | Nullable (restrict access) |
| active | boolean | |
| createdAt | timestamptz | |

#### `notifications`
| Column | Type | Notes |
|--------|------|-------|
| id | varchar(64) | **PK** |
| userEmail | varchar | FK → users |
| type | enum | info \| success \| warning \| error |
| title, message | varchar | |
| read | boolean | |
| metadata | jsonb | Optional link, IDs, etc. |
| createdAt | timestamptz | |

#### `auth_configs`
| Column | Type | Notes |
|--------|------|-------|
| userEmail | varchar | **Composite PK** |
| moduleId | varchar | **Composite PK** |
| config | jsonb | Auth settings |

---

## 8. API Reference

### 8.1 Auth Endpoints

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/api/auth/login` | Public | Google ID token login |
| POST | `/api/auth/password-login` | Public | Email + password login |
| POST | `/api/auth/dev-login` | Public | Mock mode only |
| POST | `/api/auth/refresh` | Public | Refresh JWT |
| GET | `/api/auth/me` | JWT | Get current user profile |
| POST | `/api/auth/logout` | JWT | Revoke refresh token |

### 8.2 CRUD Endpoints (Standard Pattern)

All data modules expose these routes:

```
GET    /api/{resource}            → List all (filtered by userEmail)
GET    /api/{resource}/:id        → Get one
POST   /api/{resource}            → Create
PUT    /api/{resource}/:id        → Update
DELETE /api/{resource}/:id        → Delete
```

**Resources**: `forms`, `dashboards`, `workflows`, `applications`, `notifications`, `shares`, `users`, `auth-configs`

### 8.3 Integration Endpoints

Each Zoho module exposes:

```
GET    /api/{module}/                    → List records
GET    /api/{module}/:id                 → Get one record
POST   /api/{module}                     → Create (batch)
PUT    /api/{module}                     → Update (batch)
DELETE /api/{module}/:id                 → Delete one
GET    /api/{module}/search              → Search records

# OAuth (per module)
GET    /api/{module}/oauth/authorize     → Get OAuth URL
POST   /api/{module}/oauth/exchange      → Exchange code for tokens
POST   /api/{module}/oauth/revoke        → Revoke auth
```

### 8.4 Special Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/workflows/:id/execute` | Run a workflow |
| GET | `/api/schema` | Public API schema (for builder autocomplete) |
| POST | `/api/chatgpt/chat` | Send message to ChatGPT |
| POST | `/api/microsoft-graph/send-mail` | Send email via Graph API |

---

## 9. Integration Modules

### 9.1 Module Registry

The frontend defines all available modules in `config/endpoints.ts`:

```typescript
interface ModuleDef {
  id: string;           // e.g., 'zoho-crm'
  label: string;        // e.g., 'Zoho CRM'
  apiPrefix: string;    // e.g., '/zoho-crm'
  icon: string;         // Material icon
  endpoints: EndpointDef[];
}

interface EndpointDef {
  id: string;
  label: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  pathTemplate: string;
  hasQueryParams?: boolean;
  hasBody?: boolean;
}
```

### 9.2 Available Integrations

| Module | API Prefix | Key Resources |
|--------|-----------|---------------|
| Zoho CRM | `/zoho-crm` | Leads, Contacts, Accounts, Deals, Tasks, Notes |
| Zoho Books | `/zoho-books` | Contacts, Invoices, Bills, Expenses, Payments, Items |
| Zoho Invoice | `/zoho-invoice` | Customers, Estimates, Invoices |
| Zoho Inventory | `/zoho-inventory` | Items, Warehouses, Sales/Purchase Orders |
| Zoho Subscriptions | `/zoho-subscriptions` | Plans, Subscriptions, Invoices |
| Zoho People | `/zoho-people` | Employees, Attendance, Leave |
| Zoho Desk | `/zoho-desk` | Tickets, Agents, Departments |
| Zoho Projects | `/zoho-projects` | Projects, Tasks, Milestones, Timesheets |
| Zoho Analytics | `/zoho-analytics` | Workspaces, Views, Reports |
| Zoho Campaigns | `/zoho-campaigns` | Mailing Lists, Subscribers, Campaigns |
| Zoho Recruit | `/zoho-recruit` | Candidates, Job Openings, Interviews |
| Zoho Sign | `/zoho-sign` | Documents, Recipients, Templates |
| Zoho Mail | `/zoho-mail` | Accounts, Folders, Messages |
| Zoho Workdrive | `/zoho-workdrive` | Folders, Files, Sharing |
| Zoho Cliq | `/zoho-cliq` | Channels, Messages, Bots |
| Zoho Expense | `/zoho-expense` | Reports, Expenses, Approvals |
| Zoho Payroll | `/zoho-payroll` | Payslips, Pay Components |
| Zoho Commerce | `/zoho-commerce` | Products, Orders, Categories |
| Zoho Creator | `/zoho-creator` | Apps, Forms, Reports |
| Zoho SalesIQ | `/zoho-salesiq` | Visitors, Chats, Operators |
| Impossible Cloud | `/impossible-cloud` | Regions, Storage Accounts, Partners |
| Softvalue | `/softvalue` | Proxy API, Token Management |
| ChatGPT | `/chatgpt` | Chat Completions |
| Microsoft Graph | `/microsoft-graph` | Send Email |

---

## 10. Visual Builders

### 10.1 Workflow Builder

**Purpose**: Create multi-step API orchestration workflows with visual drag-and-drop.

**Step Types:**

| Kind | Description |
|------|-------------|
| `endpoint` | Call any API endpoint with path params and body |
| `try-catch` | Error handling with try/catch branches |
| `loop` | Iterate by count or for-each over array |
| `if-else` | Conditional branching with comparisons |
| `mapper` | Transform data with field mappings |
| `filter` | Filter arrays with conditions |
| `sub-workflow` | Call another workflow as a step |
| `script` | Execute JavaScript with input bindings |
| `notification` | Create in-app notification |

**Data Flow**: Steps reference prior step outputs via `PayloadSource`:
```typescript
{ type: 'from-step', stepId: 'step-1', field: 'data.contacts[0].email' }
{ type: 'hardcoded', value: 'Hello World' }
```

**Body Modes**: `fields` (key-value), `text` (raw JSON), `form` (multipart)

### 10.2 Dashboard Builder

**Purpose**: Create data visualization dashboards with configurable widgets.

**Widget Types:**

| Kind | Description |
|------|-------------|
| `line-chart` | Line chart with multiple data points |
| `bar-chart` | Bar chart with categories |
| `pie-chart` | Pie/donut chart |
| `data-table` | Tabular data with filtering |
| `badge` | Single metric display (count, sum, etc.) |
| `search-text` | Searchable text display |

**Data Sources**: API endpoint or JavaScript script. Data path supports dot-notation to extract arrays from nested responses.

### 10.3 Form Builder

**Purpose**: Create dynamic forms with data-bound fields and submit actions.

**Field Types:**

| Kind | Description |
|------|-------------|
| `label` | Read-only text display |
| `text` | Text input with autocomplete proposals |
| `number` | Numeric input |
| `boolean` | Toggle switch |
| `date` | Date picker |
| `select` | Dropdown from API data |
| `datatable` | Data table with row selection |

**Features:**
- Fields can have API or script data sources
- `onChangeScript` triggers when a field value changes
- `onRowSelectScript` triggers when a datatable row is selected
- Submit actions can be API calls, scripts, or notifications
- `setFieldValue()`, `setFieldEnabled()`, `setFieldProposals()` for dynamic control

### 10.4 Application Builder

**Purpose**: Compose forms, dashboards, and workflows into multi-page applications.

**Configuration:**
- **Pages**: Each page references a form, dashboard, or workflow by ID
- **Navigation**: `sidebar`, `tabs`, or `top-bar` style
- **Home Page**: Default page on load

---

## 11. Script Execution Engine

Scripts run in an `AsyncFunction` sandbox with injected APIs:

```javascript
// Available in all script contexts:
log(...values)                          // Debug console output
showMessage(text, type?)                // Inline toast (info/warning/error)
addNotification(title, msg?, type?)     // Persistent notification
sendMail({ to, subject, body, ... })    // Email via Microsoft Graph
await ZohoBooks.ListContacts()          // API proxy calls
await ZohoCRM.GetLeads({ id: '123' })  // With path params

// Available in form onChange/action scripts:
FormFields['Label']                     // Read field value by label
setFieldValue('Label', newValue)        // Set field value
setFieldEnabled('Label', true/false)    // Enable/disable field
setFieldProposals('Label', ['a','b'])   // Set autocomplete suggestions
```

**Script Contexts:**

| Context | Available In | Extras |
|---------|-------------|--------|
| Field data script | Form builder, Shared viewer | `FormFields`, return value sets field |
| onChange script | Form builder, Shared viewer | `value`, `FormFields`, `setFieldValue`, `setFieldEnabled`, `setFieldProposals` |
| Row select script | Form builder, Shared viewer | `row`, `rowIndex`, `FormFields`, `setFieldValue` |
| Action script | Form builder, Shared viewer | `FormFields`, `setFieldValue`, return value = response |
| Widget script | Dashboard builder | return value = chart data |
| Workflow script | Workflow service | input bindings, return value = step output |

**Monaco Editor**: Full-featured code editor with:
- Syntax highlighting
- IntelliSense (auto-generated TypeScript declarations for all APIs)
- Debug runner with log capture
- Breakpoint support (via browser DevTools)
- Help panel showing available functions per context

---

## 12. Sharing System

### Flow

```
Builder → Share → Generate Token → /shared/:token (public URL)
                                         │
                                         ▼
                                  SharedViewerComponent
                                  (no auth required)
                                  Renders: Form / Dashboard /
                                  Workflow / Application
```

### Share Entity

- `token`: unique 64-char string
- `itemType`: dashboard | form | workflow | application
- `itemId`: reference to the item
- `ownerEmail`: who created the share
- `sharedWithEmail`: optional access restriction
- `active`: can be revoked

### SharedViewerComponent

Renders any shared item type in read-only mode:
- **Forms**: Editable fields, onChange scripts, submit actions
- **Dashboards**: Widgets with chart rendering and data fetching
- **Workflows**: Input fields, run button, execution log display
- **Applications**: Multi-page navigation with embedded forms/dashboards

---

## 13. Mock Mode

When `MOCK_MODE=true` (backend env), the entire platform runs without external API connections:

### How It Works

1. `MockAuthProvider` returns synthetic tokens (bypasses OAuth)
2. `mock-adapter.ts` intercepts all Axios requests with `axios-mock-adapter`
3. In-memory `Map<resourceName, Map<id, record>>` stores all mock data
4. Pre-seeded with 84 resource types (5 records each)
5. Supports full CRUD: list, get, create, update, delete
6. Generates realistic field values per resource type

### Seeded Resources

CRM (Lead, Contact, Account, Deal, Task, Note), Books (Contact, Item, Invoice, Bill, Expense, Payment), Desk (Ticket, Agent, Department), People (Employee, Leave), Projects (Project, Task), and 60+ more resource types.

### Mock Login

`POST /api/auth/dev-login` accepts any email and returns a valid JWT without Google verification.

---

## 14. Internationalization

### Supported Languages

| Code | Language | Flag |
|------|----------|------|
| `en` | English | 🇬🇧 |
| `fr` | Français | 🇫🇷 |
| `de` | Deutsch | 🇩🇪 |

### Usage

**Template:**
```html
{{ 'form.save' | t }}
{{ 'users.role-updated' | t : { role: 'Admin' } }}
```

**Service:**
```typescript
this.translate.t('nav.settings');
this.translate.setLang('de');
```

### Dictionary Structure

200+ translation keys covering:
- App shell (title, menus, buttons)
- Builder UIs (workflows, dashboards, forms)
- Settings & user management
- Error messages & tooltips
- Module names & navigation labels

---

## 15. Theming

### Color Themes

| Theme | Primary Color |
|-------|--------------|
| Blue (default) | `#0284c7` |
| Green | `#16a34a` |
| Purple | `#7c3aed` |
| Orange | `#ea580c` |
| Rose | `#e11d48` |

### Light / Dark Mode

Toggle via toolbar button. Applied as CSS class on `<html>`:

```css
html.theme-dark {
  --color-surface: #1e293b;
  --color-bg: #0f172a;
  --color-text: #e2e8f0;
  /* ... */
}
```

### CSS Variables

```css
:root {
  --color-primary, --color-primary-dark, --color-primary-light
  --color-accent, --color-success, --color-warn
  --color-surface, --color-bg
  --color-sidebar-bg, --color-sidebar-text, --color-sidebar-hover
  --color-toolbar-bg, --color-toolbar-shadow
  --color-text, --color-text-muted, --color-heading
  --color-border, --color-code-bg
  --radius-card, --shadow-card, --shadow-hover, --transition
}
```

---

## 16. Deployment

### Environment Variables (Backend)

| Variable | Default | Purpose |
|----------|---------|---------|
| `PORT` | 3000 | Server port |
| `CORS_ORIGIN` | `http://localhost:4200` | Allowed origins |
| `MOCK_MODE` | false | Enable mock adapter |
| `AZURE_POSTGRESQL_HOST` | localhost | DB host |
| `AZURE_POSTGRESQL_PORT` | 5432 | DB port |
| `AZURE_POSTGRESQL_USER` | — | DB user |
| `AZURE_POSTGRESQL_PASSWORD` | — | DB password |
| `AZURE_POSTGRESQL_DATABASE` | postgres | DB name |
| `AZURE_POSTGRESQL_SYNC` | true | Auto-sync schema |
| `AZURE_POSTGRESQL_SSL` | false | SSL connection |
| `JWT_SECRET` | — | JWT signing key |
| `JWT_REFRESH_SECRET` | — | Refresh token key |
| `JWT_EXPIRY` | 15m | Access token TTL |
| `JWT_REFRESH_EXPIRY` | 7d | Refresh token TTL |
| `GOOGLE_CLIENT_ID` | — | Google OAuth client ID |
| `SENDGRID_API_KEY` | — | SendGrid email key |

### Environment Variables (Frontend)

Configured in `src/environments/`:

| Variable | Dev | Prod |
|----------|-----|------|
| `production` | false | true |
| `mockMode` | false | false |
| `apiBase` | `http://localhost:3000/api` | Azure Web App URL |
| `googleClientId` | Google OAuth Client ID | Same |

### Scripts

**Backend:**
```bash
npm run start:dev    # Development (ts-node)
npm run start:mock   # Mock mode (no external APIs)
npm run build        # Compile to dist/
npm start            # Production (node dist/main.js)
```

**Frontend:**
```bash
npm start            # Dev server (localhost:4200)
npm run build        # Production build
npm run watch        # Build with watch mode
```

### Production Architecture

```
┌──────────────────┐     HTTPS     ┌──────────────────┐
│  Azure Static    │ ◄──────────── │    Browser        │
│  Web Apps        │               │    (Angular SPA)  │
│  (Frontend)      │               └──────────────────┘
└──────────────────┘                        │
                                            │ /api/*
                                            ▼
                              ┌──────────────────────┐
                              │  Azure Web App        │
                              │  (NestJS Backend)     │
                              │                       │
                              │  ┌─────────────────┐  │
                              │  │  PostgreSQL      │  │
                              │  │  (Azure DB)      │  │
                              │  └─────────────────┘  │
                              │                       │
                              │  ┌─────────────────┐  │
                              │  │  Zoho APIs       │  │
                              │  │  (20+ services)  │  │
                              │  └─────────────────┘  │
                              └──────────────────────┘
```

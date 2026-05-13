# zoho-crm.dto.ts

TypeScript interfaces and types defining the data structures for the Zoho CRM integration, covering leads, contacts, accounts, deals, tasks, notes, module fields, and search criteria.

## Key Exports

- **CRMOwner** — Interface for record owner (id, name, email)
- **CRMLead** — Interface for a CRM lead record with standard and custom fields
- **CreateLeadDTO / UpdateLeadDTO** — DTOs for lead creation and update
- **CRMContact** — Interface for a CRM contact with account lookup and address
- **CreateCRMContactDTO / UpdateCRMContactDTO** — DTOs for contact operations
- **CRMAccount** — Interface for a CRM account with industry and billing address
- **CreateAccountDTO / UpdateAccountDTO** — DTOs for account operations
- **CRMDeal** — Interface for a deal with stage, amount, and probability
- **CreateDealDTO / UpdateDealDTO** — DTOs for deal operations
- **CRMTask** — Interface for a task with status, priority, and associations
- **CreateCRMTaskDTO / UpdateCRMTaskDTO** — DTOs for task operations
- **CRMNote** — Interface for a note attached to a parent record
- **CreateNoteDTO / UpdateNoteDTO** — DTOs for note operations
- **CRMModuleField** — Interface describing a module's field metadata
- **CRMSearchParams** — Search parameters with criteria, email, phone, word filters

## Dependencies

- `../shared/shared.dto` — `ZohoAddress`, `ZohoListWrapper`, `ZohoListParams`, `ZohoBulkResponse`, `ZohoLookup`, `ZohoSingleWrapper`

## How It Works

Defines all request/response shapes for the CRM API client. Each entity uses Omit-based DTOs to exclude server-managed fields (id, timestamps). Index signatures `[key: string]: unknown` allow custom fields. Re-exports shared wrapper types for consistent API response handling.

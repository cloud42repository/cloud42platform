# zoho-crm.controller.e2e-spec.ts

End-to-end test for the `ZohoCrmController` that boots the full `AppModule` and exercises all CRM module endpoints including Leads, Contacts, Accounts, Deals, Tasks, Notes, and generic module operations.

## Test Suites

- **ZohoCrmController (e2e)** — full integration tests against Zoho CRM endpoints

## Key Test Cases

- **Leads** — `listLeads()`, `searchLeads()`, `getLead()`, `createLeads()`, `updateLeads()`, `deleteLead()`
- **Contacts** — `listContacts()`, `searchContacts()`, `getContact()`, `createContacts()`, `updateContacts()`, `deleteContact()`
- **Accounts** — `listAccounts()`, `getAccount()`, `createAccounts()`, `updateAccounts()`, `deleteAccount()`
- **Deals** — `listDeals()`, `getDeal()`, `createDeals()`, `updateDeals()`, `deleteDeal()`
- **Tasks** — `listTasks()`, `getTask()`, `createTasks()`, `updateTasks()`, `deleteTask()`
- **Notes** — `listNotes()`, `getNote()`, `createNotes()`, `deleteNote()`
- **Generic Modules** — `listRecords()`, `getRecord()`, `createRecords()`, `updateRecords()`, `deleteRecord()`, `searchRecords()`

## Test Setup

- Imports the full `AppModule` via `Test.createTestingModule`
- Controller is retrieved from the compiled module in `beforeAll`
- Module is closed in `afterAll` for cleanup
- Tests call controller methods directly with sample CRM record data and IDs

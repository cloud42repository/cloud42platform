# zoho-creator.dto.ts

TypeScript interfaces and types defining the data structures for the Zoho Creator integration, covering applications, forms, fields, records, reports, and workflows.

## Key Exports

- **CreatorApplication** — Interface for a Creator application with link name, owner, and publish status
- **CreatorFormType** — Union type (`form`, `section`)
- **CreatorForm** — Interface for a form with fields and metadata
- **CreatorFieldType** — Union type for supported field types (Text, Number, Email, Date, Dropdown, etc.)
- **CreatorField** — Interface for a form field with validation properties
- **CreatorRecord** — Interface for a generic record with dynamic fields
- **CreateRecordDTO / UpdateRecordDTO** — DTOs wrapping a `data` object for record creation/update
- **CreatorReport** — Interface for a report with type (list, grid, calendar, chart)
- **CreatorWorkflow** — Interface for a workflow definition
- **CreatorListParams** — Pagination/filter params with criteria and sort options

## Dependencies

- `../shared/shared.dto` — `ZohoListParams`

## How It Works

Defines all request/response shapes used by `ZohoCreatorClient` and the service layer. Types are organized by domain entity (Application, Form, Field, Record, Report, Workflow) with separate Create/Update DTOs. Records use a flexible `Record<string, unknown>` data wrapper to support Creator's dynamic schema.

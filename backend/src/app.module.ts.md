# app.module.ts

Root NestJS module that assembles the entire backend application. Configures global settings (environment variables via `ConfigModule`), PostgreSQL database connection via TypeORM, and imports all feature modules including authentication, Zoho integrations, workflows, dashboards, forms, and more.

## Key Exports

- `AppModule` — The root module class decorated with `@Module()`

## Dependencies

- `@nestjs/common` — Module decorator
- `@nestjs/core` — APP_INTERCEPTOR token
- `@nestjs/config` — ConfigModule/ConfigService for environment-based configuration
- `@nestjs/typeorm` — TypeOrmModule for PostgreSQL connectivity
- `./auth-module/user-context` — UserContextInterceptor for AsyncLocalStorage-based user propagation
- Feature modules: AuthModule, ZohoCrmModule, ZohoBooksModule, ZohoInvoiceModule, ZohoInventoryModule, ZohoSubscriptionsModule, ZohoPeopleModule, ZohoDeskModule, ZohoProjectsModule, ZohoAnalyticsModule, ZohoCampaignsModule, ZohoRecruitModule, ZohoSignModule, ZohoMailModule, ZohoWorkdriveModule, ZohoCliqModule, ZohoExpenseModule, ZohoPayrollModule, ZohoCommerceModule, ZohoCreatorModule, ZohoSalesiqModule, SoftvalueModule, ImpossibleCloudModule, ChatGPTModule, SchemaModule, UserModule, WorkflowModule, DashboardModule, FormModule, ShareModule, AuthConfigModule, ZohoOAuthModule, NotificationModule, MicrosoftGraphModule, ApplicationModule

## How It Works

1. `ConfigModule.forRoot({ isGlobal: true })` loads `.env` variables globally
2. `TypeOrmModule.forRootAsync` configures PostgreSQL using `AZURE_POSTGRESQL_*` env vars with SSL and synchronize options
3. Registers all entities (User, Workflow, Dashboard, Form, Share, AuthConfig, Notification, Application)
4. Imports all feature modules for Zoho services, auth, workflows, dashboards, etc.
5. Registers `UserContextInterceptor` as a global interceptor via `APP_INTERCEPTOR` so every request has user context available through AsyncLocalStorage

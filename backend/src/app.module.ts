import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AuthModule } from './auth-module/auth.module';
import { ZohoCrmModule } from './zoho-crm/zoho-crm.module';
import { ZohoBooksModule } from './zoho-books/zoho-books.module';
import { ZohoInvoiceModule } from './zoho-invoice/zoho-invoice.module';
import { ZohoInventoryModule } from './zoho-inventory/zoho-inventory.module';
import { ZohoSubscriptionsModule } from './zoho-subscriptions/zoho-subscriptions.module';
import { ZohoPeopleModule } from './zoho-people/zoho-people.module';
import { ZohoDeskModule } from './zoho-desk/zoho-desk.module';
import { ZohoProjectsModule } from './zoho-projects/zoho-projects.module';
import { ZohoAnalyticsModule } from './zoho-analytics/zoho-analytics.module';
import { ZohoCampaignsModule } from './zoho-campaigns/zoho-campaigns.module';
import { ZohoRecruitModule } from './zoho-recruit/zoho-recruit.module';
import { ZohoSignModule } from './zoho-sign/zoho-sign.module';
import { ZohoMailModule } from './zoho-mail/zoho-mail.module';
import { ZohoWorkdriveModule } from './zoho-workdrive/zoho-workdrive.module';
import { ZohoCliqModule } from './zoho-cliq/zoho-cliq.module';
import { ZohoExpenseModule } from './zoho-expense/zoho-expense.module';
import { ZohoPayrollModule } from './zoho-payroll/zoho-payroll.module';
import { ZohoCommerceModule } from './zoho-commerce/zoho-commerce.module';
import { ZohoCreatorModule } from './zoho-creator/zoho-creator.module';
import { ZohoSalesiqModule } from './zoho-salesiq/zoho-salesiq.module';
import { SoftvalueModule } from './softvalue/softvalue.module';
import { ImpossibleCloudModule } from './impossible-cloud/impossible-cloud.module';
import { ChatGPTModule } from './chatgpt/chatgpt.module';
import { SchemaModule } from './schema/schema.module';
import { UserModule } from './user/user.module';
import { WorkflowModule } from './workflow/workflow.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    ZohoCrmModule,
    ZohoBooksModule,
    ZohoInvoiceModule,
    ZohoInventoryModule,
    ZohoSubscriptionsModule,
    ZohoPeopleModule,
    ZohoDeskModule,
    ZohoProjectsModule,
    ZohoAnalyticsModule,
    ZohoCampaignsModule,
    ZohoRecruitModule,
    ZohoSignModule,
    ZohoMailModule,
    ZohoWorkdriveModule,
    ZohoCliqModule,
    ZohoExpenseModule,
    ZohoPayrollModule,
    ZohoCommerceModule,
    ZohoCreatorModule,
    ZohoSalesiqModule,
    SoftvalueModule,
    ImpossibleCloudModule,
    ChatGPTModule,
    SchemaModule,
    UserModule,
    WorkflowModule,
  ],
})
export class AppModule {}

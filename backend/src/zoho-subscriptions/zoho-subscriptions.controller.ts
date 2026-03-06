import {
  Controller, Get, Post, Put, Delete, Param, Body, Query,
} from '@nestjs/common';
import { ZohoSubscriptionsService } from './zoho-subscriptions.service';

@Controller('zoho-subscriptions')
export class ZohoSubscriptionsController {
  constructor(private readonly service: ZohoSubscriptionsService) {}

  @Get('plans') listPlans(@Query() q: Record<string, unknown>) { return this.service.listPlans(q); }
  @Get('plans/:code') getPlan(@Param('code') code: string) { return this.service.getPlan(code); }
  @Post('plans') createPlan(@Body() body: unknown) { return this.service.createPlan(body); }
  @Put('plans/:code') updatePlan(@Param('code') code: string, @Body() body: unknown) { return this.service.updatePlan(code, body); }
  @Delete('plans/:code') deletePlan(@Param('code') code: string) { return this.service.deletePlan(code); }

  @Get('addons') listAddons() { return this.service.listAddons(); }
  @Get('addons/:code') getAddon(@Param('code') code: string) { return this.service.getAddon(code); }

  @Get('coupons') listCoupons() { return this.service.listCoupons(); }
  @Get('coupons/:code') getCoupon(@Param('code') code: string) { return this.service.getCoupon(code); }

  @Get('customers') listCustomers(@Query() q: Record<string, unknown>) { return this.service.listCustomers(q); }
  @Get('customers/:id') getCustomer(@Param('id') id: string) { return this.service.getCustomer(id); }
  @Post('customers') createCustomer(@Body() body: unknown) { return this.service.createCustomer(body); }
  @Put('customers/:id') updateCustomer(@Param('id') id: string, @Body() body: unknown) { return this.service.updateCustomer(id, body); }
  @Delete('customers/:id') deleteCustomer(@Param('id') id: string) { return this.service.deleteCustomer(id); }

  @Get('subscriptions') listSubscriptions(@Query() q: Record<string, unknown>) { return this.service.listSubscriptions(q); }
  @Get('subscriptions/:id') getSubscription(@Param('id') id: string) { return this.service.getSubscription(id); }
  @Post('subscriptions') createSubscription(@Body() body: unknown) { return this.service.createSubscription(body); }
  @Put('subscriptions/:id') updateSubscription(@Param('id') id: string, @Body() body: unknown) { return this.service.updateSubscription(id, body); }
  @Post('subscriptions/:id/cancel') cancelSubscription(@Param('id') id: string) { return this.service.cancelSubscription(id); }
  @Post('subscriptions/:id/reactivate') reactivateSubscription(@Param('id') id: string) { return this.service.reactivateSubscription(id); }
}

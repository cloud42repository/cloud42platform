import {
  Controller, Get, Post, Put, Delete, Param, Body, Query,
} from '@nestjs/common';
import { ZohoCommerceService } from './zoho-commerce.service';

@Controller('zoho-commerce')
export class ZohoCommerceController {
  constructor(private readonly service: ZohoCommerceService) {}

  @Get('products') listProducts(@Query() q: Record<string, unknown>) { return this.service.listProducts(q); }
  @Get('products/:id') getProduct(@Param('id') id: string) { return this.service.getProduct(id); }
  @Post('products') createProduct(@Body() body: unknown) { return this.service.createProduct(body); }
  @Put('products/:id') updateProduct(@Param('id') id: string, @Body() body: unknown) { return this.service.updateProduct(id, body); }
  @Delete('products/:id') deleteProduct(@Param('id') id: string) { return this.service.deleteProduct(id); }

  @Get('categories') listCategories() { return this.service.listCategories(); }
  @Get('categories/:id') getCategory(@Param('id') id: string) { return this.service.getCategory(id); }
  @Post('categories') createCategory(@Body() body: unknown) { return this.service.createCategory(body); }
  @Delete('categories/:id') deleteCategory(@Param('id') id: string) { return this.service.deleteCategory(id); }

  @Get('customers') listCustomers(@Query() q: Record<string, unknown>) { return this.service.listCustomers(q); }
  @Get('customers/:id') getCustomer(@Param('id') id: string) { return this.service.getCustomer(id); }

  @Get('orders') listOrders(@Query() q: Record<string, unknown>) { return this.service.listOrders(q); }
  @Get('orders/:id') getOrder(@Param('id') id: string) { return this.service.getOrder(id); }
  @Post('orders') createOrder(@Body() body: unknown) { return this.service.createOrder(body); }
  @Put('orders/:id/status') updateOrderStatus(@Param('id') id: string, @Body() body: { status: string }) { return this.service.updateOrderStatus(id, body.status); }
  @Post('orders/:id/cancel') cancelOrder(@Param('id') id: string) { return this.service.cancelOrder(id); }
}

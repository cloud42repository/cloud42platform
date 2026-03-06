import {
  Controller, Get, Post, Put, Delete, Param, Body, Query,
} from '@nestjs/common';
import { ZohoInventoryService } from './zoho-inventory.service';

@Controller('zoho-inventory')
export class ZohoInventoryController {
  constructor(private readonly service: ZohoInventoryService) {}

  @Get('items') listItems(@Query() q: Record<string, unknown>) { return this.service.listItems(q); }
  @Get('items/:id') getItem(@Param('id') id: string) { return this.service.getItem(id); }
  @Post('items') createItem(@Body() body: unknown) { return this.service.createItem(body); }
  @Put('items/:id') updateItem(@Param('id') id: string, @Body() body: unknown) { return this.service.updateItem(id, body); }
  @Delete('items/:id') deleteItem(@Param('id') id: string) { return this.service.deleteItem(id); }

  @Get('warehouses') listWarehouses() { return this.service.listWarehouses(); }
  @Get('warehouses/:id') getWarehouse(@Param('id') id: string) { return this.service.getWarehouse(id); }

  @Get('salesorders') listSalesOrders(@Query() q: Record<string, unknown>) { return this.service.listSalesOrders(q); }
  @Get('salesorders/:id') getSalesOrder(@Param('id') id: string) { return this.service.getSalesOrder(id); }
  @Post('salesorders') createSalesOrder(@Body() body: unknown) { return this.service.createSalesOrder(body); }
  @Put('salesorders/:id') updateSalesOrder(@Param('id') id: string, @Body() body: unknown) { return this.service.updateSalesOrder(id, body); }
  @Delete('salesorders/:id') deleteSalesOrder(@Param('id') id: string) { return this.service.deleteSalesOrder(id); }

  @Get('purchaseorders') listPurchaseOrders(@Query() q: Record<string, unknown>) { return this.service.listPurchaseOrders(q); }
  @Get('purchaseorders/:id') getPurchaseOrder(@Param('id') id: string) { return this.service.getPurchaseOrder(id); }
  @Post('purchaseorders') createPurchaseOrder(@Body() body: unknown) { return this.service.createPurchaseOrder(body); }
  @Put('purchaseorders/:id') updatePurchaseOrder(@Param('id') id: string, @Body() body: unknown) { return this.service.updatePurchaseOrder(id, body); }
  @Delete('purchaseorders/:id') deletePurchaseOrder(@Param('id') id: string) { return this.service.deletePurchaseOrder(id); }
}

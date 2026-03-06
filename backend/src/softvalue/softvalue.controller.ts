import { All, Body, Controller, Delete, Get, HttpCode, Patch, Post, Put, Query } from '@nestjs/common';
import { SoftvalueService } from './softvalue.service';

@Controller('softvalue')
export class SoftvalueController {
  constructor(private readonly service: SoftvalueService) {}

  @Get('proxy')
  proxyGet(@Query('path') path: string, @Query() params: Record<string, unknown>) {
    return this.service.get(path, { params });
  }

  @Post('proxy')
  proxyPost(@Query('path') path: string, @Body() data: unknown) {
    return this.service.post(path, data);
  }

  @Put('proxy')
  proxyPut(@Query('path') path: string, @Body() data: unknown) {
    return this.service.put(path, data);
  }

  @Patch('proxy')
  proxyPatch(@Query('path') path: string, @Body() data: unknown) {
    return this.service.patch(path, data);
  }

  @Delete('proxy')
  proxyDelete(@Query('path') path: string) {
    return this.service.delete(path);
  }

  @Post('token')
  @HttpCode(204)
  updateToken(@Body('token') token: string) {
    this.service.updateToken(token);
  }

  @Get('token')
  getToken() {
    return { token: this.service.getToken() };
  }
}

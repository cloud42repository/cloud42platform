import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApplicationService } from './application.service';
import type { CreateApplicationDto, UpdateApplicationDto } from './application.dto';

@Controller('applications')
export class ApplicationController {
  constructor(private readonly service: ApplicationService) {}

  /** GET /api/applications?userEmail=xxx — list all apps for a user */
  @Get()
  findAll(@Query('userEmail') userEmail: string) {
    return this.service.findAllByUser(userEmail);
  }

  /** GET /api/applications/:id — get a single app */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findById(id);
  }

  /** POST /api/applications — create a new app */
  @Post()
  create(@Body() dto: CreateApplicationDto) {
    return this.service.create(dto);
  }

  /** PUT /api/applications/:id — update an app */
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateApplicationDto) {
    return this.service.update(id, dto);
  }

  /** GET /api/applications/:id/context — get the application context */
  @Get(':id/context')
  getContext(@Param('id') id: string) {
    return this.service.getContext(id);
  }

  /** PUT /api/applications/:id/context — update the application context */
  @Put(':id/context')
  updateContext(@Param('id') id: string, @Body() context: Record<string, unknown>) {
    return this.service.updateContext(id, context);
  }

  /** DELETE /api/applications/:id — delete an app */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}

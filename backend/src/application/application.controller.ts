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

  /** DELETE /api/applications/:id — delete an app */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}

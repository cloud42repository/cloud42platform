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
import { DashboardService } from './dashboard.service';
import type { CreateDashboardDto, UpdateDashboardDto } from './dashboard.dto';

@Controller('dashboards')
export class DashboardController {
  constructor(private readonly service: DashboardService) {}

  /** GET /api/dashboards?userEmail=xxx — list all dashboards for a user */
  @Get()
  findAll(@Query('userEmail') userEmail: string) {
    return this.service.findAllByUser(userEmail);
  }

  /** GET /api/dashboards/:id — get a single dashboard */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findById(id);
  }

  /** POST /api/dashboards — create a new dashboard */
  @Post()
  create(@Body() dto: CreateDashboardDto) {
    return this.service.create(dto);
  }

  /** PUT /api/dashboards/:id — update a dashboard */
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateDashboardDto) {
    return this.service.update(id, dto);
  }

  /** DELETE /api/dashboards/:id — delete a dashboard */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}

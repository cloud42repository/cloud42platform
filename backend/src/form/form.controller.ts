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
import { FormService } from './form.service';
import type { CreateFormDto, UpdateFormDto } from './form.dto';

@Controller('forms')
export class FormController {
  constructor(private readonly service: FormService) {}

  /** GET /api/forms?userEmail=xxx — list all forms for a user */
  @Get()
  findAll(@Query('userEmail') userEmail: string) {
    return this.service.findAllByUser(userEmail);
  }

  /** GET /api/forms/:id — get a single form */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findById(id);
  }

  /** POST /api/forms — create a new form */
  @Post()
  create(@Body() dto: CreateFormDto) {
    return this.service.create(dto);
  }

  /** PUT /api/forms/:id — update a form */
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateFormDto) {
    return this.service.update(id, dto);
  }

  /** DELETE /api/forms/:id — delete a form */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}

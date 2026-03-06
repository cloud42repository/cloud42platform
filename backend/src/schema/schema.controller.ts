import { Controller, Get } from '@nestjs/common';
import { SCHEMA } from '../shared/schema';

@Controller('schema')
export class SchemaController {
  @Get()
  getSchema() {
    return SCHEMA;
  }
}

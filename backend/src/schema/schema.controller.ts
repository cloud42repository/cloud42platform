import { Controller, Get } from '@nestjs/common';
import { SCHEMA } from '../shared/schema';
import { Public } from '../auth-module/public.decorator';

@Controller('schema')
export class SchemaController {
  @Public()
  @Get()
  getSchema() {
    return SCHEMA;
  }
}

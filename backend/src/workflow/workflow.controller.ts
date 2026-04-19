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
import { WorkflowService } from './workflow.service';
import { WorkflowExecutionService } from './workflow-execution.service';
import type { CreateWorkflowDto, UpdateWorkflowDto, ExecuteWorkflowDto } from './workflow.dto';

@Controller('workflows')
export class WorkflowController {
  constructor(
    private readonly service: WorkflowService,
    private readonly execution: WorkflowExecutionService,
  ) {}

  /** GET /api/workflows?userEmail=xxx — list all workflows for a user */
  @Get()
  findAll(@Query('userEmail') userEmail: string) {
    return this.service.findAllByUser(userEmail);
  }

  /** GET /api/workflows/:id — get a single workflow */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findById(id);
  }

  /** POST /api/workflows/:id/execute — execute a workflow on the backend */
  @Post(':id/execute')
  execute(@Param('id') id: string, @Body() dto: ExecuteWorkflowDto) {
    return this.execution.execute(id, dto?.inputValues);
  }

  /** POST /api/workflows — create a new workflow */
  @Post()
  create(@Body() dto: CreateWorkflowDto) {
    return this.service.create(dto);
  }

  /** PUT /api/workflows/:id — update a workflow */
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateWorkflowDto) {
    return this.service.update(id, dto);
  }

  /** DELETE /api/workflows/:id — delete a workflow */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}

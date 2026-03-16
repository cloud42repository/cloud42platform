import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkflowEntity } from './workflow.entity';
import type {
  CreateWorkflowDto,
  UpdateWorkflowDto,
  WorkflowResponseDto,
} from './workflow.dto';

@Injectable()
export class WorkflowService {
  constructor(
    @InjectRepository(WorkflowEntity)
    private readonly repo: Repository<WorkflowEntity>,
  ) {}

  /* ── Helpers ── */

  private toDto(w: WorkflowEntity): WorkflowResponseDto {
    return {
      id: w.id,
      userEmail: w.userEmail,
      name: w.name,
      description: w.description ?? '',
      steps: w.steps ?? [],
      status: w.status,
      scheduledAt: w.scheduledAt ? w.scheduledAt.toISOString() : null,
      lastRunLog: w.lastRunLog ?? null,
      createdAt: w.createdAt.toISOString(),
      updatedAt: w.updatedAt.toISOString(),
    };
  }

  private generateId(): string {
    return `wf-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  }

  /* ── List all workflows for a user ── */

  async findAllByUser(userEmail: string): Promise<WorkflowResponseDto[]> {
    const rows = await this.repo.find({
      where: { userEmail },
      order: { updatedAt: 'DESC' },
    });
    return rows.map(w => this.toDto(w));
  }

  /* ── Get one workflow ── */

  async findById(id: string): Promise<WorkflowResponseDto> {
    const wf = await this.repo.findOneBy({ id });
    if (!wf) throw new NotFoundException(`Workflow ${id} not found`);
    return this.toDto(wf);
  }

  /* ── Create ── */

  async create(dto: CreateWorkflowDto): Promise<WorkflowResponseDto> {
    const wf = this.repo.create({
      id: dto.id || this.generateId(),
      userEmail: dto.userEmail,
      name: dto.name,
      description: dto.description ?? '',
      steps: dto.steps ?? [],
      status: dto.status ?? 'draft',
      scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null,
    });
    const saved = await this.repo.save(wf);
    return this.toDto(saved);
  }

  /* ── Update ── */

  async update(
    id: string,
    dto: UpdateWorkflowDto,
  ): Promise<WorkflowResponseDto> {
    const wf = await this.repo.findOneBy({ id });
    if (!wf) throw new NotFoundException(`Workflow ${id} not found`);

    if (dto.name !== undefined) wf.name = dto.name;
    if (dto.description !== undefined) wf.description = dto.description;
    if (dto.steps !== undefined) wf.steps = dto.steps;
    if (dto.status !== undefined) wf.status = dto.status;
    if (dto.scheduledAt !== undefined) {
      wf.scheduledAt = dto.scheduledAt ? new Date(dto.scheduledAt) : null;
    }
    if (dto.lastRunLog !== undefined) wf.lastRunLog = dto.lastRunLog;

    const saved = await this.repo.save(wf);
    return this.toDto(saved);
  }

  /* ── Delete ── */

  async remove(id: string): Promise<void> {
    const result = await this.repo.delete({ id });
    if (result.affected === 0) {
      throw new NotFoundException(`Workflow ${id} not found`);
    }
  }

  /* ── Delete all workflows for a user ── */

  async removeAllByUser(userEmail: string): Promise<void> {
    await this.repo.delete({ userEmail });
  }
}

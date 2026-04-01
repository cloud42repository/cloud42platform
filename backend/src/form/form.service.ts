import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FormEntity } from './form.entity';
import type {
  CreateFormDto,
  UpdateFormDto,
  FormResponseDto,
} from './form.dto';

@Injectable()
export class FormService {
  constructor(
    @InjectRepository(FormEntity)
    private readonly repo: Repository<FormEntity>,
  ) {}

  /* ── Helpers ── */

  private toDto(f: FormEntity): FormResponseDto {
    return {
      id: f.id,
      userEmail: f.userEmail,
      name: f.name,
      description: f.description ?? '',
      fields: f.fields ?? [],
      submitActions: f.submitActions ?? [],
      status: f.status,
      createdAt: f.createdAt.toISOString(),
      updatedAt: f.updatedAt.toISOString(),
    };
  }

  private generateId(): string {
    return `frm-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  }

  /* ── List all forms for a user ── */

  async findAllByUser(userEmail: string): Promise<FormResponseDto[]> {
    const rows = await this.repo.find({
      where: { userEmail },
      order: { updatedAt: 'DESC' },
    });
    return rows.map(f => this.toDto(f));
  }

  /* ── Get one form ── */

  async findById(id: string): Promise<FormResponseDto> {
    const form = await this.repo.findOneBy({ id });
    if (!form) throw new NotFoundException(`Form ${id} not found`);
    return this.toDto(form);
  }

  /* ── Create ── */

  async create(dto: CreateFormDto): Promise<FormResponseDto> {
    const form = this.repo.create({
      id: dto.id || this.generateId(),
      userEmail: dto.userEmail,
      name: dto.name,
      description: dto.description ?? '',
      fields: dto.fields ?? [],
      submitActions: dto.submitActions ?? [],
      status: dto.status ?? 'draft',
    });
    const saved = await this.repo.save(form);
    return this.toDto(saved);
  }

  /* ── Update ── */

  async update(
    id: string,
    dto: UpdateFormDto,
  ): Promise<FormResponseDto> {
    const form = await this.repo.findOneBy({ id });
    if (!form) throw new NotFoundException(`Form ${id} not found`);

    if (dto.name !== undefined) form.name = dto.name;
    if (dto.description !== undefined) form.description = dto.description;
    if (dto.fields !== undefined) form.fields = dto.fields;
    if (dto.submitActions !== undefined) form.submitActions = dto.submitActions;
    if (dto.status !== undefined) form.status = dto.status;

    const saved = await this.repo.save(form);
    return this.toDto(saved);
  }

  /* ── Delete ── */

  async remove(id: string): Promise<void> {
    const result = await this.repo.delete({ id });
    if (result.affected === 0) {
      throw new NotFoundException(`Form ${id} not found`);
    }
  }

  /* ── Delete all forms for a user ── */

  async removeAllByUser(userEmail: string): Promise<void> {
    await this.repo.delete({ userEmail });
  }
}

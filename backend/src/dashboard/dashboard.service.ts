import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DashboardEntity } from './dashboard.entity';
import type {
  CreateDashboardDto,
  UpdateDashboardDto,
  DashboardResponseDto,
} from './dashboard.dto';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(DashboardEntity)
    private readonly repo: Repository<DashboardEntity>,
  ) {}

  /* ── Helpers ── */

  private toDto(d: DashboardEntity): DashboardResponseDto {
    return {
      id: d.id,
      userEmail: d.userEmail,
      name: d.name,
      description: d.description ?? '',
      widgets: d.widgets ?? [],
      status: d.status,
      createdAt: d.createdAt.toISOString(),
      updatedAt: d.updatedAt.toISOString(),
    };
  }

  private generateId(): string {
    return `db-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  }

  /* ── List all dashboards for a user ── */

  async findAllByUser(userEmail: string): Promise<DashboardResponseDto[]> {
    const rows = await this.repo.find({
      where: { userEmail },
      order: { updatedAt: 'DESC' },
    });
    return rows.map(d => this.toDto(d));
  }

  /* ── Get one dashboard ── */

  async findById(id: string): Promise<DashboardResponseDto> {
    const db = await this.repo.findOneBy({ id });
    if (!db) throw new NotFoundException(`Dashboard ${id} not found`);
    return this.toDto(db);
  }

  /* ── Create ── */

  async create(dto: CreateDashboardDto): Promise<DashboardResponseDto> {
    const db = this.repo.create({
      id: dto.id || this.generateId(),
      userEmail: dto.userEmail,
      name: dto.name,
      description: dto.description ?? '',
      widgets: dto.widgets ?? [],
      status: dto.status ?? 'draft',
    });
    const saved = await this.repo.save(db);
    return this.toDto(saved);
  }

  /* ── Update ── */

  async update(
    id: string,
    dto: UpdateDashboardDto,
  ): Promise<DashboardResponseDto> {
    const db = await this.repo.findOneBy({ id });
    if (!db) throw new NotFoundException(`Dashboard ${id} not found`);

    if (dto.name !== undefined) db.name = dto.name;
    if (dto.description !== undefined) db.description = dto.description;
    if (dto.widgets !== undefined) db.widgets = dto.widgets;
    if (dto.status !== undefined) db.status = dto.status;

    const saved = await this.repo.save(db);
    return this.toDto(saved);
  }

  /* ── Delete ── */

  async remove(id: string): Promise<void> {
    const result = await this.repo.delete({ id });
    if (result.affected === 0) {
      throw new NotFoundException(`Dashboard ${id} not found`);
    }
  }

  /* ── Delete all dashboards for a user ── */

  async removeAllByUser(userEmail: string): Promise<void> {
    await this.repo.delete({ userEmail });
  }
}

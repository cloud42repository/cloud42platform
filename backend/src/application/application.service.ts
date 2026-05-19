import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplicationEntity } from './application.entity';
import type {
  CreateApplicationDto,
  UpdateApplicationDto,
  ApplicationResponseDto,
} from './application.dto';

@Injectable()
export class ApplicationService {
  constructor(
    @InjectRepository(ApplicationEntity)
    private readonly repo: Repository<ApplicationEntity>,
  ) {}

  /* ── Helpers ── */

  private toDto(a: ApplicationEntity): ApplicationResponseDto {
    return {
      id: a.id,
      userEmail: a.userEmail,
      name: a.name,
      description: a.description ?? '',
      pages: a.pages ?? [],
      navigation: a.navigation ?? {},
      context: a.context ?? {},
      status: a.status,
      createdAt: a.createdAt.toISOString(),
      updatedAt: a.updatedAt.toISOString(),
    };
  }

  private generateId(): string {
    return `app-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  }

  /* ── List all apps for a user ── */

  async findAllByUser(userEmail: string): Promise<ApplicationResponseDto[]> {
    const rows = await this.repo.find({
      where: { userEmail },
      order: { updatedAt: 'DESC' },
    });
    return rows.map(a => this.toDto(a));
  }

  /* ── Get one app ── */

  async findById(id: string): Promise<ApplicationResponseDto> {
    const app = await this.repo.findOneBy({ id });
    if (!app) throw new NotFoundException(`Application ${id} not found`);
    return this.toDto(app);
  }

  /* ── Create ── */

  async create(dto: CreateApplicationDto): Promise<ApplicationResponseDto> {
    const app = this.repo.create({
      id: dto.id || this.generateId(),
      userEmail: dto.userEmail,
      name: dto.name,
      description: dto.description ?? '',
      pages: dto.pages ?? [],
      navigation: dto.navigation ?? {},
      context: dto.context ?? {},
      status: dto.status ?? 'draft',
    });
    const saved = await this.repo.save(app);
    return this.toDto(saved);
  }

  /* ── Update ── */

  async update(
    id: string,
    dto: UpdateApplicationDto,
  ): Promise<ApplicationResponseDto> {
    const app = await this.repo.findOneBy({ id });
    if (!app) throw new NotFoundException(`Application ${id} not found`);

    if (dto.name !== undefined) app.name = dto.name;
    if (dto.description !== undefined) app.description = dto.description;
    if (dto.pages !== undefined) app.pages = dto.pages;
    if (dto.navigation !== undefined) app.navigation = dto.navigation;
    if (dto.context !== undefined) app.context = dto.context;
    if (dto.status !== undefined) app.status = dto.status;

    const saved = await this.repo.save(app);
    return this.toDto(saved);
  }

  /* ── Context ── */

  async getContext(id: string): Promise<Record<string, unknown>> {
    const app = await this.repo.findOneBy({ id });
    if (!app) throw new NotFoundException(`Application ${id} not found`);
    return app.context ?? {};
  }

  async updateContext(
    id: string,
    context: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    const app = await this.repo.findOneBy({ id });
    if (!app) throw new NotFoundException(`Application ${id} not found`);
    app.context = context;
    await this.repo.save(app);
    return app.context;
  }

  /* ── Delete ── */

  async remove(id: string): Promise<void> {
    const result = await this.repo.delete({ id });
    if (result.affected === 0) {
      throw new NotFoundException(`Application ${id} not found`);
    }
  }

  /* ── Delete all apps for a user ── */

  async removeAllByUser(userEmail: string): Promise<void> {
    await this.repo.delete({ userEmail });
  }
}

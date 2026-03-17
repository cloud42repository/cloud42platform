import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthConfigEntity } from './auth-config.entity';
import type { AuthConfigDto, AuthConfigResponseDto } from './auth-config.dto';

@Injectable()
export class AuthConfigService {
  private readonly logger = new Logger(AuthConfigService.name);

  constructor(
    @InjectRepository(AuthConfigEntity)
    private readonly repo: Repository<AuthConfigEntity>,
  ) {}

  /* ── Helpers ── */

  private toDto(entity: AuthConfigEntity): AuthConfigResponseDto {
    return {
      moduleId: entity.moduleId,
      config: entity.config as unknown as AuthConfigDto,
      updatedAt: entity.updatedAt.toISOString(),
    };
  }

  /* ── Get all configs for a user ── */

  async findAll(userEmail: string): Promise<AuthConfigResponseDto[]> {
    const rows = await this.repo.find({
      where: { userEmail },
      order: { moduleId: 'ASC' },
    });
    return rows.map(r => this.toDto(r));
  }

  /* ── Get one config ── */

  async findOne(userEmail: string, moduleId: string): Promise<AuthConfigResponseDto | null> {
    const row = await this.repo.findOneBy({ userEmail, moduleId });
    return row ? this.toDto(row) : null;
  }

  /* ── Upsert a config ── */

  async save(
    userEmail: string,
    moduleId: string,
    config: AuthConfigDto,
  ): Promise<AuthConfigResponseDto> {
    let entity = await this.repo.findOneBy({ userEmail, moduleId });

    if (entity) {
      entity.config = config as unknown as Record<string, unknown>;
      entity = await this.repo.save(entity);
      this.logger.log(`Updated auth config [${moduleId}] for ${userEmail}`);
    } else {
      entity = this.repo.create({
        userEmail,
        moduleId,
        config: config as unknown as Record<string, unknown>,
      });
      entity = await this.repo.save(entity);
      this.logger.log(`Created auth config [${moduleId}] for ${userEmail}`);
    }

    return this.toDto(entity);
  }

  /* ── Delete a config ── */

  async remove(userEmail: string, moduleId: string): Promise<void> {
    await this.repo.delete({ userEmail, moduleId });
    this.logger.log(`Deleted auth config [${moduleId}] for ${userEmail}`);
  }

  /* ── Delete all configs for a user ── */

  async removeAll(userEmail: string): Promise<void> {
    await this.repo.delete({ userEmail });
    this.logger.log(`Deleted all auth configs for ${userEmail}`);
  }
}

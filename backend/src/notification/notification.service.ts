import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationEntity } from './notification.entity';
import { CreateNotificationDto, NotificationResponseDto } from './notification.dto';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(NotificationEntity)
    private readonly repo: Repository<NotificationEntity>,
  ) {}

  private generateId(): string {
    const ts = Date.now().toString(36);
    const rnd = Math.random().toString(36).substring(2, 8);
    return `ntf-${ts}-${rnd}`;
  }

  private toDto(entity: NotificationEntity): NotificationResponseDto {
    return {
      id: entity.id,
      userEmail: entity.userEmail,
      type: entity.type,
      title: entity.title,
      message: entity.message,
      read: entity.read,
      metadata: entity.metadata ?? {},
      createdAt: entity.createdAt.toISOString(),
    };
  }

  async findAllByUser(userEmail: string): Promise<NotificationResponseDto[]> {
    const entities = await this.repo.find({
      where: { userEmail },
      order: { createdAt: 'DESC' },
    });
    return entities.map(e => this.toDto(e));
  }

  async findUnreadByUser(userEmail: string): Promise<NotificationResponseDto[]> {
    const entities = await this.repo.find({
      where: { userEmail, read: false },
      order: { createdAt: 'DESC' },
    });
    return entities.map(e => this.toDto(e));
  }

  async create(dto: CreateNotificationDto): Promise<NotificationResponseDto> {
    const entity = this.repo.create({
      id: this.generateId(),
      userEmail: dto.userEmail,
      type: dto.type ?? 'info',
      title: dto.title,
      message: dto.message ?? '',
      read: false,
      metadata: dto.metadata ?? {},
    });
    const saved = await this.repo.save(entity);
    return this.toDto(saved);
  }

  async markAsRead(ids: string[]): Promise<void> {
    if (ids.length === 0) return;
    await this.repo.update(ids, { read: true });
  }

  async markAllRead(userEmail: string): Promise<void> {
    await this.repo.update({ userEmail, read: false }, { read: true });
  }

  async remove(id: string): Promise<void> {
    const entity = await this.repo.findOneBy({ id });
    if (!entity) throw new NotFoundException(`Notification ${id} not found`);
    await this.repo.remove(entity);
  }

  async removeAllByUser(userEmail: string): Promise<void> {
    await this.repo.delete({ userEmail });
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity, UserRole } from './user.entity';
import type { UserResponseDto } from './user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repo: Repository<UserEntity>,
  ) {}

  /* ── Helpers ── */

  private toDto(u: UserEntity): UserResponseDto {
    return {
      email: u.email,
      name: u.name,
      photoUrl: u.photoUrl,
      role: u.role,
      moduleVisibility: u.moduleVisibility ?? {},
      createdAt: u.createdAt.toISOString(),
      lastLoginAt: u.lastLoginAt.toISOString(),
    };
  }

  /* ── List all users ── */

  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.repo.find({ order: { createdAt: 'ASC' } });
    return users.map(u => this.toDto(u));
  }

  /* ── Get one user ── */

  async findByEmail(email: string): Promise<UserResponseDto> {
    const user = await this.repo.findOneBy({ email });
    if (!user) throw new NotFoundException(`User ${email} not found`);
    return this.toDto(user);
  }

  /* ── Register / login upsert ── */

  async registerLogin(
    email: string,
    name: string,
    photoUrl: string,
  ): Promise<UserResponseDto> {
    const existing = await this.repo.findOneBy({ email });

    if (existing) {
      existing.name = name;
      existing.photoUrl = photoUrl;
      existing.lastLoginAt = new Date();
      const saved = await this.repo.save(existing);
      return this.toDto(saved);
    }

    // First-ever user becomes admin
    const count = await this.repo.count();
    const role: UserRole = count === 0 ? 'admin' : 'user';

    const newUser = this.repo.create({
      email,
      name,
      photoUrl,
      role,
      moduleVisibility: {},
    });
    const saved = await this.repo.save(newUser);
    return this.toDto(saved);
  }

  /* ── Role management ── */

  async setRole(email: string, role: UserRole): Promise<UserResponseDto> {
    const user = await this.repo.findOneBy({ email });
    if (!user) throw new NotFoundException(`User ${email} not found`);
    user.role = role;
    const saved = await this.repo.save(user);
    return this.toDto(saved);
  }

  /* ── Remove user ── */

  async removeUser(email: string): Promise<void> {
    const result = await this.repo.delete({ email });
    if (result.affected === 0) {
      throw new NotFoundException(`User ${email} not found`);
    }
  }

  /* ── Module visibility ── */

  async setModuleEnabled(
    email: string,
    moduleId: string,
    enabled: boolean,
  ): Promise<UserResponseDto> {
    const user = await this.repo.findOneBy({ email });
    if (!user) throw new NotFoundException(`User ${email} not found`);
    user.moduleVisibility = { ...user.moduleVisibility, [moduleId]: enabled };
    const saved = await this.repo.save(user);
    return this.toDto(saved);
  }

  async setAllModulesEnabled(
    email: string,
    moduleIds: string[],
    enabled: boolean,
  ): Promise<UserResponseDto> {
    const user = await this.repo.findOneBy({ email });
    if (!user) throw new NotFoundException(`User ${email} not found`);
    const vis = { ...user.moduleVisibility };
    moduleIds.forEach(id => (vis[id] = enabled));
    user.moduleVisibility = vis;
    const saved = await this.repo.save(user);
    return this.toDto(saved);
  }
}

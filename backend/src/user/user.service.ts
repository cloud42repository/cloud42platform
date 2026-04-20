import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'node:crypto';
import * as bcrypt from 'bcryptjs';
import { UserEntity, UserRole, UserStatus } from './user.entity';
import { EmailService } from '../shared/email.service';
import type { UserResponseDto } from './user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repo: Repository<UserEntity>,
    private readonly emailService: EmailService,
  ) {}

  /* ── Helpers ── */

  private toDto(u: UserEntity): UserResponseDto {
    return {
      email: u.email,
      name: u.name,
      photoUrl: u.photoUrl,
      role: u.role,
      status: u.status ?? 'active',
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

  /* ── Refresh-token storage ── */

  async setHashedRefreshToken(email: string, hash: string | null): Promise<void> {
    await this.repo.update({ email }, { hashedRefreshToken: hash });
  }

  async getHashedRefreshToken(email: string): Promise<string | null> {
    const user = await this.repo.findOneBy({ email });
    return user?.hashedRefreshToken ?? null;
  }

  /* ── Self-Registration (public) ── */

  /**
   * Register a new user with status 'pending'.
   * The user must wait for admin approval before they can log in.
   */
  async register(email: string, name: string): Promise<UserResponseDto> {
    const existing = await this.repo.findOneBy({ email });
    if (existing) throw new BadRequestException('An account with this email already exists');

    const user = this.repo.create({
      email,
      name,
      photoUrl: '',
      role: 'user',
      status: 'pending',
      moduleVisibility: {},
    });
    const saved = await this.repo.save(user);
    return this.toDto(saved);
  }

  /* ── Admin: Approve user ── */

  /**
   * Approve a pending user: set status to 'active', generate a password-set token,
   * and send the activation email via SendGrid.
   */
  async approveUser(email: string): Promise<UserResponseDto> {
    const user = await this.repo.findOneBy({ email });
    if (!user) throw new NotFoundException(`User ${email} not found`);
    if (user.status === 'active' && user.passwordHash) {
      throw new BadRequestException('User is already active');
    }

    // Generate a cryptographically secure token
    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    user.status = 'active';
    user.passwordSetToken = hashedToken;
    user.passwordSetTokenExpiry = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours
    const saved = await this.repo.save(user);

    // Send activation email with the raw token (user clicks → we verify hash)
    await this.emailService.sendPasswordSetEmail(email, user.name, rawToken);

    return this.toDto(saved);
  }

  /* ── Admin: Revoke user ── */

  async revokeUser(email: string): Promise<UserResponseDto> {
    const user = await this.repo.findOneBy({ email });
    if (!user) throw new NotFoundException(`User ${email} not found`);

    user.status = 'revoked';
    user.hashedRefreshToken = null; // force logout
    const saved = await this.repo.save(user);
    return this.toDto(saved);
  }

  /* ── Admin: Re-send invite ── */

  async resendInvite(email: string): Promise<UserResponseDto> {
    const user = await this.repo.findOneBy({ email });
    if (!user) throw new NotFoundException(`User ${email} not found`);

    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    user.passwordSetToken = hashedToken;
    user.passwordSetTokenExpiry = new Date(Date.now() + 48 * 60 * 60 * 1000);
    const saved = await this.repo.save(user);

    await this.emailService.sendPasswordSetEmail(email, user.name, rawToken);
    return this.toDto(saved);
  }

  /* ── Set password (via token) ── */

  /**
   * Validate the password-set token and store the bcrypt-hashed password.
   */
  async setPassword(email: string, rawToken: string, plainPassword: string): Promise<UserResponseDto> {
    const user = await this.repo.findOneBy({ email });
    if (!user) throw new NotFoundException(`User ${email} not found`);

    if (!user.passwordSetToken || !user.passwordSetTokenExpiry) {
      throw new BadRequestException('No pending password-set request');
    }

    // Verify token
    const hashedIncoming = crypto.createHash('sha256').update(rawToken).digest('hex');
    if (hashedIncoming !== user.passwordSetToken) {
      throw new ForbiddenException('Invalid password-set token');
    }

    // Check expiry
    if (new Date() > user.passwordSetTokenExpiry) {
      throw new BadRequestException('Password-set token has expired');
    }

    // Validate password strength
    if (!plainPassword || plainPassword.length < 8) {
      throw new BadRequestException('Password must be at least 8 characters');
    }

    // Hash password with bcrypt (salt rounds = 12)
    const salt = await bcrypt.genSalt(12);
    user.passwordHash = await bcrypt.hash(plainPassword, salt);

    // Clear the one-time token
    user.passwordSetToken = null;
    user.passwordSetTokenExpiry = null;
    user.status = 'active';

    const saved = await this.repo.save(user);
    return this.toDto(saved);
  }

  /* ── Password validation (for login) ── */

  async validatePassword(email: string, plainPassword: string): Promise<UserResponseDto | null> {
    const user = await this.repo.findOneBy({ email });
    if (!user || !user.passwordHash) return null;
    if (user.status !== 'active') return null;

    const valid = await bcrypt.compare(plainPassword, user.passwordHash);
    if (!valid) return null;

    user.lastLoginAt = new Date();
    await this.repo.save(user);
    return this.toDto(user);
  }

  /* ── Get raw entity (internal) ── */

  async findEntityByEmail(email: string): Promise<UserEntity | null> {
    return this.repo.findOneBy({ email });
  }
}

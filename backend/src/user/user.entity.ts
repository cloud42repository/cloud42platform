import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export type UserRole = 'admin' | 'manager' | 'user';

@Entity('users')
export class UserEntity {
  /** Email is the primary key (matches Google login identity) */
  @PrimaryColumn({ type: 'varchar', length: 320 })
  email!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 2048, default: '' })
  photoUrl!: string;

  @Column({ type: 'varchar', length: 20, default: 'user' })
  role!: UserRole;

  /**
   * Per-module visibility map: { moduleId: boolean }.
   * Stored as JSONB in PostgreSQL for efficient querying.
   */
  @Column({ type: 'jsonb', default: {} })
  moduleVisibility!: Record<string, boolean>;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  lastLoginAt!: Date;
}

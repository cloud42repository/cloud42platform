import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Stores the per-module authentication configuration for a given user.
 * Composite primary key: (userEmail, moduleId).
 */
@Entity('auth_configs')
export class AuthConfigEntity {
  /** Owner — references users.email */
  @PrimaryColumn({ type: 'varchar', length: 320 })
  userEmail!: string;

  /** API module identifier (e.g. "zoho-crm") */
  @PrimaryColumn({ type: 'varchar', length: 100 })
  moduleId!: string;

  /**
   * Full auth config stored as JSONB.
   * Structure matches the frontend AuthConfig interface.
   */
  @Column({ type: 'jsonb', default: {} })
  config!: Record<string, unknown>;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}

import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserEntity } from '../user/user.entity';

export type WorkflowStatus = 'draft' | 'scheduled' | 'running' | 'completed' | 'failed';

@Entity('workflows')
export class WorkflowEntity {
  @PrimaryColumn({ type: 'varchar', length: 64 })
  id!: string;

  /** Owner (FK → users.email) */
  @Column({ type: 'varchar', length: 320 })
  userEmail!: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userEmail', referencedColumnName: 'email' })
  user!: UserEntity;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 2048, default: '' })
  description!: string;

  /**
   * The full step tree serialised as JSONB.
   * Includes endpoint steps, try-catch, loop, if-else blocks.
   */
  @Column({ type: 'jsonb', default: [] })
  steps!: unknown[];

  /** Named input parameters this workflow accepts */
  @Column({ type: 'jsonb', default: [] })
  inputs!: unknown[];

  /** Named outputs this workflow returns */
  @Column({ type: 'jsonb', default: [] })
  outputs!: unknown[];

  @Column({ type: 'varchar', length: 20, default: 'draft' })
  status!: WorkflowStatus;

  /** ISO-8601 datetime — scheduler fires the workflow at this time */
  @Column({ type: 'timestamptz', nullable: true })
  scheduledAt!: Date | null;

  /** Last execution log, stored as JSONB */
  @Column({ type: 'jsonb', nullable: true })
  lastRunLog!: unknown | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}

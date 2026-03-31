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

export type DashboardStatus = 'draft' | 'published';

@Entity('dashboards')
export class DashboardEntity {
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

  /** The widget tree serialised as JSONB */
  @Column({ type: 'jsonb', default: [] })
  widgets!: unknown[];

  @Column({ type: 'varchar', length: 20, default: 'draft' })
  status!: DashboardStatus;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}

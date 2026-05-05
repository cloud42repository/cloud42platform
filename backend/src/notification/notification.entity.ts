import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserEntity } from '../user/user.entity';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

@Entity('notifications')
export class NotificationEntity {
  @PrimaryColumn({ type: 'varchar', length: 64 })
  id!: string;

  /** Owner (FK → users.email) */
  @Column({ type: 'varchar', length: 320 })
  userEmail!: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userEmail', referencedColumnName: 'email' })
  user!: UserEntity;

  @Column({ type: 'varchar', length: 20, default: 'info' })
  type!: NotificationType;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'varchar', length: 4096, default: '' })
  message!: string;

  @Column({ type: 'boolean', default: false })
  read!: boolean;

  /** Optional metadata (e.g. link, source workflow/form id) */
  @Column({ type: 'jsonb', default: {} })
  metadata!: Record<string, unknown>;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;
}

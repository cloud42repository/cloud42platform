import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserEntity } from '../user/user.entity';

export type ShareItemType = 'dashboard' | 'form' | 'workflow';

@Entity('shares')
export class ShareEntity {
  /** Unique share token (URL-safe random string) */
  @PrimaryColumn({ type: 'varchar', length: 64 })
  token!: string;

  /** What kind of item is shared */
  @Column({ type: 'varchar', length: 20 })
  itemType!: ShareItemType;

  /** The ID of the shared item (dashboard/form/workflow ID) */
  @Column({ type: 'varchar', length: 64 })
  itemId!: string;

  /** Who created this share link */
  @Column({ type: 'varchar', length: 320 })
  ownerEmail!: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ownerEmail', referencedColumnName: 'email' })
  owner!: UserEntity;

  /** Whether the share link is currently active */
  @Column({ type: 'boolean', default: true })
  active!: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;
}

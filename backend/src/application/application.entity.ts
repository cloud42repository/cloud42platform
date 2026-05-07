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

export type ApplicationStatus = 'draft' | 'published';

@Entity('applications')
export class ApplicationEntity {
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

  /** The pages / views of the app serialised as JSONB */
  @Column({ type: 'jsonb', default: [] })
  pages!: unknown[];

  /** Navigation settings serialised as JSONB */
  @Column({ type: 'jsonb', default: {} })
  navigation!: unknown;

  @Column({ type: 'varchar', length: 20, default: 'draft' })
  status!: ApplicationStatus;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}

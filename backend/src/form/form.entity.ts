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

export type FormStatus = 'draft' | 'published';

@Entity('forms')
export class FormEntity {
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

  /** The form field definitions serialised as JSONB */
  @Column({ type: 'jsonb', default: [] })
  fields!: unknown[];

  /** Submit action definitions serialised as JSONB */
  @Column({ type: 'jsonb', default: [] })
  submitActions!: unknown[];

  @Column({ type: 'varchar', length: 20, default: 'draft' })
  status!: FormStatus;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}

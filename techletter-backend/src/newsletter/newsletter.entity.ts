import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

export type SendStatus = 'SUCCESS' | 'FAILED' | 'SENDING' | 'SCHEDULED';
export type SendType = 'daily' | 'weekly' | 'manual';

@Entity('newsletter_sends')
export class NewsletterSend {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar' })
  title!: string;

  @Column({
    type: 'enum',
    enum: ['daily', 'weekly', 'manual'],
    default: 'manual',
  })
  type!: SendType;

  @Column({
    type: 'enum',
    enum: ['SUCCESS', 'FAILED', 'SENDING', 'SCHEDULED'],
    default: 'SCHEDULED',
  })
  status!: SendStatus;

  @Column({ type: 'int', default: 0 })
  recipientCount!: number;

  @Column({ type: 'int', default: 0 })
  successCount!: number;

  @Column({ type: 'int', default: 0 })
  failCount!: number;

  @Column({ type: 'json', nullable: true })
  failReasons!: { reason: string; count: number }[] | null;

  @Column({ type: 'varchar', nullable: true })
  targetCondition!: string | null;

  // ✅ type: 'int' 명시
  @Column({ type: 'int', nullable: true })
  newsId!: number | null;

  @Column({ type: 'timestamp', nullable: true })
  scheduledAt!: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  sentAt!: Date | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'createdBy' })
  createdByUser!: User | null;

  // ✅ type: 'int' 명시
  @Column({ type: 'int', nullable: true })
  createdBy!: number | null;

  @CreateDateColumn()
  createdAt!: Date;
}
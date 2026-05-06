import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

export type SubscriptionStatus =
  | 'NONE'
  | 'ACTIVE'
  | 'CANCELED'
  | 'EXPIRED'
  | 'PAYMENT_FAILED';

export type PlanType = 'daily' | 'weekly' | 'all';

@Entity('subscriptions')
export class Subscription {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column()
  userId!: number;

  @Column({
    type: 'enum',
    enum: ['NONE', 'ACTIVE', 'CANCELED', 'EXPIRED', 'PAYMENT_FAILED'],
    default: 'NONE',
  })
  status!: SubscriptionStatus;

  @Column({
    type: 'enum',
    enum: ['daily', 'weekly', 'all'],
    nullable: true,
  })
  planType!: PlanType | null;

  @Column({ type: 'date', nullable: true })
  startDate!: string | null;

  @Column({ type: 'date', nullable: true })
  endDate!: string | null;

  @Column({ type: 'date', nullable: true })
  nextPaymentDate!: string | null;

  @Column({ type: 'varchar', nullable: true })
  paymentMethodBrand!: string | null;

  @Column({ type: 'varchar', nullable: true })
  paymentMethodLast4!: string | null;

  @Column({ default: true })
  dailyActive!: boolean;

  @Column({ default: true })
  weeklyActive!: boolean;

  @Column({ type: 'varchar', nullable: true })
  dailySendTime!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
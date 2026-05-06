import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity('subscriptions')
export class Subscription {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column()
  userId!: number;

  @Column({ default: true })
  dailyActive!: boolean;

  @Column({ default: true })
  weeklyActive!: boolean;

  @Column({ nullable: true })
  dailySendTime!: string;

  @CreateDateColumn()
  subscribedAt!: Date;

  @Column({ nullable: true })
  unsubscribedAt!: Date;
}
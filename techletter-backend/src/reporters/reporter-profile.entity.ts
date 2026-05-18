import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

export enum ReporterStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('reporter_profiles')
export class ReporterProfile {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ unique: true })
  userId!: number;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column()
  realName!: string;

  @Column()
  organization!: string;

  @Column({ type: 'text' })
  bio!: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  portfolioUrl!: string | null;

  @Column({ type: 'enum', enum: ReporterStatus, default: ReporterStatus.PENDING })
  status!: ReporterStatus;

  @Column({ type: 'text', nullable: true })
  rejectedReason!: string | null;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt!: Date | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

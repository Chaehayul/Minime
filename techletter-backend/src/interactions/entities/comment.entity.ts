import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/user.entity';
import { News } from '../../news/news.entity';

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ type: 'text' })
  content!: string;

  @Column({ default: 0 })
  likeCount!: number;

  @Column({ default: false })
  isBest!: boolean;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column()
  userId!: number;

  @ManyToOne(() => News)
  @JoinColumn({ name: 'news_id' })
  news!: News;

  @Column()
  newsId!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
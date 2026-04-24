import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/user.entity';
import { News } from '../../news/news.entity';

@Entity('bookmarks')
export class Bookmark {
  @PrimaryGeneratedColumn('increment')
  id!: number;

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
}
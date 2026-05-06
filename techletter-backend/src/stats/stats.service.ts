import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { News, NewsStatus } from '../news/news.entity';
import { User } from '../users/user.entity';
import { Like } from '../interactions/entities/like.entity';
import { Comment } from '../interactions/entities/comment.entity';
import { Subscription } from '../subscriptions/subscription.entity';

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(News)
    private newsRepository: Repository<News>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Like)
    private likeRepository: Repository<Like>,
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
  ) {}

  async getDashboard() {
    const totalSubscribers = await this.subscriptionRepository.count({
      where: { dailyActive: true },
    });

    const totalNews = await this.newsRepository.count({
      where: { status: NewsStatus.PUBLISHED },
    });

    const totalComments = await this.commentRepository.count();

    const topNews = await this.newsRepository.find({
      where: { status: NewsStatus.PUBLISHED },
      order: { viewCount: 'DESC' },
      take: 5,
    });

    return {
      totalSubscribers,
      totalNews,
      totalComments,
      topNews,
    };
  }

  async getTopNews() {
    return this.newsRepository.find({
      where: { status: NewsStatus.PUBLISHED },
      order: { viewCount: 'DESC' },
      take: 10,
      relations: ['author'],
    });
  }
}
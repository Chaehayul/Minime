import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { News } from '../news/news.entity';

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(News)
    private newsRepo: Repository<News>,
  ) {}

  async search(query: string, page = 1, limit = 10) {
    if (!query || query.trim().length === 0) {
      return { items: [], total: 0, page, totalPages: 0 };
    }

    const keyword = `%${query.trim()}%`;
    const skip = (page - 1) * limit;

    const [items, total] = await this.newsRepo
      .createQueryBuilder('news')
      .leftJoinAndSelect('news.category', 'category')
      .leftJoinAndSelect('news.tags', 'tags')
      .where('news.status = :status', { status: 'published' })
      .andWhere(
        '(news.title LIKE :keyword OR news.lead LIKE :keyword OR news.content LIKE :keyword)',
        { keyword },
      )
      .orderBy('news.publishedAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }
}
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { News, NewsStatus } from './news.entity';
import { Tag } from '../tags/tag.entity';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';

@Injectable()
export class NewsService {
  constructor(
    @InjectRepository(News)
    private newsRepository: Repository<News>,
    @InjectRepository(Tag)
    private tagRepository: Repository<Tag>,
  ) {}

  async findAll(page = 1, limit = 10, categoryId?: number, status?: string) {
    const query = this.newsRepository.createQueryBuilder('news')
      .leftJoinAndSelect('news.author', 'author')
      .leftJoinAndSelect('news.category', 'category')
      .leftJoinAndSelect('news.tags', 'tags')
      .orderBy('news.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (categoryId) query.andWhere('news.categoryId = :categoryId', { categoryId });
    if (status) query.andWhere('news.status = :status', { status });
    else query.andWhere('news.status = :status', { status: NewsStatus.PUBLISHED });

    const [news, total] = await query.getManyAndCount();
    return { news, total, page, limit };
  }

  async findAllAdmin(page = 1, limit = 20) {
    const [news, total] = await this.newsRepository.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['author', 'category', 'tags'],
    });
    return { news, total, page, limit };
  }

  async findOne(id: number) {
    const news = await this.newsRepository.findOne({
      where: { id },
      relations: ['author', 'category', 'tags'],
    });
    if (!news) throw new NotFoundException('뉴스를 찾을 수 없습니다.');
    return news;
  }

  async findBySlug(slug: string) {
    const news = await this.newsRepository.findOne({
      where: { slug },
      relations: ['author', 'category', 'tags'],
    });
    if (!news) throw new NotFoundException('뉴스를 찾을 수 없습니다.');
    return news;
  }

  async create(dto: CreateNewsDto, authorId: number) {
    const slug = dto.slug || this.generateSlug(dto.title);
    let tags: Tag[] = [];

    if (dto.tags && dto.tags.length > 0) {
      tags = await Promise.all(
        dto.tags.map(async (tagName) => {
          let tag = await this.tagRepository.findOne({ where: { name: tagName } });
          if (!tag) {
            tag = this.tagRepository.create({ name: tagName, slug: this.generateSlug(tagName) });
            tag = await this.tagRepository.save(tag);
          }
          return tag;
        })
      );
    }

    const news = this.newsRepository.create({
      ...dto,
      slug,
      authorId,
      tags,
      status: (dto.status as NewsStatus) || NewsStatus.DRAFT,
      publishedAt: dto.status === NewsStatus.PUBLISHED ? new Date() : undefined,
    });

    return this.newsRepository.save(news);
  }

  async update(id: number, dto: UpdateNewsDto) {
    const news = await this.findOne(id);

    if (dto.tags) {
      news.tags = await Promise.all(
        dto.tags.map(async (tagName) => {
          let tag = await this.tagRepository.findOne({ where: { name: tagName } });
          if (!tag) {
            tag = this.tagRepository.create({ name: tagName, slug: this.generateSlug(tagName) });
            tag = await this.tagRepository.save(tag);
          }
          return tag;
        })
      );
    }

    if (dto.status === NewsStatus.PUBLISHED && !news.publishedAt) {
      news.publishedAt = new Date();
    }

    Object.assign(news, { ...dto, tags: news.tags });
    return this.newsRepository.save(news);
  }

  async remove(id: number) {
    const news = await this.findOne(id);
    return this.newsRepository.remove(news);
  }

  async incrementViewCount(id: number) {
    await this.newsRepository.increment({ id }, 'viewCount', 1);
  }

  async publishScheduled() {
    const now = new Date();
    const scheduledNews = await this.newsRepository.find({
      where: { status: NewsStatus.SCHEDULED },
    });
    for (const news of scheduledNews) {
      if (news.scheduledAt && news.scheduledAt <= now) {
        news.status = NewsStatus.PUBLISHED;
        news.publishedAt = now;
        await this.newsRepository.save(news);
      }
    }
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9가-힣\s]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 100) + '-' + Date.now();
  }
}
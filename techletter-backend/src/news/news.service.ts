import { BadGatewayException, BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { News, NewsStatus } from './news.entity';
import { Tag } from '../tags/tag.entity';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';

interface NaverNewsItem {
  title: string;
  originallink: string;
  link: string;
  description: string;
  pubDate: string;
}

interface NaverNewsResponse {
  lastBuildDate: string;
  total: number;
  start: number;
  display: number;
  items: NaverNewsItem[];
}

@Injectable()
export class NewsService {
  constructor(
    @InjectRepository(News)
    private newsRepository: Repository<News>,
    @InjectRepository(Tag)
    private tagRepository: Repository<Tag>,
    private configService: ConfigService,
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

  async searchNaverNews(query: string, display = 10, start = 1, sort: 'sim' | 'date' = 'date') {
    const keyword = query?.trim();
    if (!keyword) {
      throw new BadRequestException('검색어를 입력해주세요.');
    }

    const clientId =
      this.configService.get<string>('NAVER_SEARCH_CLIENT_ID') ||
      this.configService.get<string>('NAVER_CLIENT_ID');
    const clientSecret =
      this.configService.get<string>('NAVER_SEARCH_CLIENT_SECRET') ||
      this.configService.get<string>('NAVER_CLIENT_SECRET');
    if (!clientId || !clientSecret) {
      throw new BadRequestException(
        'NAVER_SEARCH_CLIENT_ID와 NAVER_SEARCH_CLIENT_SECRET을 설정해주세요.',
      );
    }

    const params = new URLSearchParams({
      query: keyword,
      display: String(Math.min(Math.max(display, 1), 100)),
      start: String(Math.min(Math.max(start, 1), 1000)),
      sort,
    });

    let response: Response;
    try {
      response = await fetch(`https://openapi.naver.com/v1/search/news.json?${params}`, {
        headers: {
          'X-Naver-Client-Id': clientId,
          'X-Naver-Client-Secret': clientSecret,
        },
      });
    } catch {
      throw new BadGatewayException('네이버 뉴스 검색 API에 연결하지 못했습니다.');
    }

    if (!response.ok) {
      throw new BadGatewayException('네이버 뉴스 검색 API 호출에 실패했습니다. Client ID와 Secret을 확인해주세요.');
    }

    const data = (await response.json()) as NaverNewsResponse;
    return {
      total: data.total,
      start: data.start,
      display: data.display,
      items: data.items.map((item) => ({
        title: this.cleanNaverText(item.title),
        description: this.cleanNaverText(item.description),
        link: item.link,
        originalLink: item.originallink,
        pubDate: item.pubDate,
      })),
    };
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

  private cleanNaverText(value: string): string {
    return value
      .replace(/<[^>]+>/g, '')
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>');
  }
}

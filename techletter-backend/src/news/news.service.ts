import { BadGatewayException, BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { News, NewsStatus } from './news.entity';
import { Tag } from '../tags/tag.entity';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import OpenAI from 'openai'; // ✅ OpenAI 임포트 추가

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
  private openai: OpenAI; // ✅ OpenAI 인스턴스 변수 선언

  constructor(
    @InjectRepository(News)
    private newsRepository: Repository<News>,
    @InjectRepository(Tag)
    private tagRepository: Repository<Tag>,
  ) {
    // ✅ 클래스 생성 시점에 OpenAI 초기화
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  // ✅ AI 3줄 요약 프라이빗 메서드 추가
  private async generateAiSummary(content: string): Promise<string> {
    if (!content) return ''; // 본문이 없으면 빈 문자열 반환

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `너는 IT 전문 기자이자 요약의 달인이야. 주어진 뉴스 본문을 핵심만 뽑아 정확히 3줄로 요약해야 해. 
            [규칙]
            1. 반드시 각 줄은 "- " 기호로 시작할 것.
            2. 일반인도 이해하기 쉬운 친절한 말투를 사용할 것.
            3. 3줄을 초과하거나 미달하지 말 것.`,
          },
          {
            role: 'user',
            content: content,
          },
        ],
        temperature: 0.3,
      });

      return response.choices[0].message.content || '요약을 생성할 수 없습니다.';
    } catch (error) {
      console.error('AI 요약 생성 중 에러 발생:', error);
      return 'AI 요약 생성에 실패했습니다.';
    }
  }

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

    // ✅ 뉴스 저장 전 본문(content)을 바탕으로 AI 요약본 생성
    const aiSummary = await this.generateAiSummary(dto.content);

    const news = this.newsRepository.create({
      ...dto,
      slug,
      authorId,
      tags,
      aiSummary, // ✅ 생성된 요약본을 DB 엔티티에 매핑
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

    // (선택 사항) 만약 뉴스 내용(content)이 수정될 때마다 요약본도 갱신하고 싶다면
    // update 메서드 안에도 const aiSummary = await this.generateAiSummary(dto.content); 를 추가할 수 있습니다.
    
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

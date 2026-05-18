import {
  ForbiddenException,
  Controller, Get, Post, Put, Delete,
  Param, Body, Query, UseGuards, Request, Headers,
} from '@nestjs/common';
import { NewsService } from './news.service';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserRole } from '../users/user.entity';

@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get()
  findAll(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('categoryId') categoryId: string,
    @Query('status') status: string,
  ) {
    return this.newsService.findAll(+page || 1, +limit || 10, categoryId ? +categoryId : undefined, status);
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard)
  findAllAdmin(@Query('page') page: string, @Query('limit') limit: string) {
    return this.newsService.findAllAdmin(+page || 1, +limit || 20);
  }

  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.newsService.findBySlug(slug);
  }

  @Get('naver/search')
  searchNaverNews(
    @Query('query') query: string,
    @Query('display') display: string,
    @Query('start') start: string,
    @Query('sort') sort: 'sim' | 'date',
  ) {
    return this.newsService.searchNaverNews(
      query,
      +display || 10,
      +start || 1,
      sort === 'sim' ? 'sim' : 'date',
    );
  }

  @Post('ai/analyze')
  @UseGuards(JwtAuthGuard)
  analyzeWithAi(@Body() dto: { title?: string; content?: string; tags?: string[] }) {
    return this.newsService.analyzeNews(dto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Headers('x-view-token') viewToken: string) {
    if (viewToken) {
      await this.newsService.incrementViewCount(+id);
    }
    return this.newsService.findOne(+id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() dto: CreateNewsDto, @Request() req: any) {
    this.assertReporterOrAdmin(req.user);
    return this.newsService.create(dto, req.user.id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() dto: UpdateNewsDto) {
    return this.newsService.update(+id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.newsService.remove(+id);
  }

  private assertReporterOrAdmin(user: { role?: string }) {
    if (![UserRole.REPORTER, UserRole.ADMIN].includes(user.role as UserRole)) {
      throw new ForbiddenException('기자 승인 후 기사를 작성할 수 있습니다.');
    }
  }
}

import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  UseGuards,
  ForbiddenException,
  Query,
} from '@nestjs/common';
import { NewsletterService } from './newsletter.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('newsletter')
@UseGuards(JwtAuthGuard)
export class NewsletterController {
  constructor(private readonly newsletterService: NewsletterService) {}

  // 발송 이력 조회 (관리자)
  @Get('history')
  async getHistory(@Req() req: any) {
    if (req.user.role !== 'admin') {
      throw new ForbiddenException('관리자만 접근 가능합니다.');
    }
    return this.newsletterService.getHistory();
  }

  // ✅ @Body() → @Query() 로 변경
  @Get('estimated-recipients')
  async getEstimatedRecipients(
    @Req() req: any,
    @Query('type') type: 'daily' | 'weekly' | 'manual',
  ) {
    if (req.user.role !== 'admin') {
      throw new ForbiddenException('관리자만 접근 가능합니다.');
    }
    const count = await this.newsletterService.getEstimatedRecipients(type);
    return { count };
  }

  // 즉시 발송 / 예약 발송 (관리자)
  @Post('send')
  async sendNewsletter(
    @Req() req: any,
    @Body() body: {
      title: string;
      type: 'daily' | 'weekly' | 'manual';
      newsId?: number;
      scheduledAt?: string;
    },
  ) {
    if (req.user.role !== 'admin') {
      throw new ForbiddenException('관리자만 접근 가능합니다.');
    }

    if (body.scheduledAt) {
      return this.newsletterService.scheduleNewsletter(
        body.title,
        body.type,
        body.newsId ?? null,
        body.scheduledAt,
        req.user.id,
      );
    }

    return this.newsletterService.sendNewsletter(
      body.title,
      body.type,
      body.newsId ?? null,
      req.user.id,
    );
  }
}
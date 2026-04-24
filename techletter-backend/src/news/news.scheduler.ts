import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NewsService } from './news.service';

@Injectable()
export class NewsScheduler {
  constructor(private readonly newsService: NewsService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async publishScheduledNews() {
    await this.newsService.publishScheduled();
  }
}
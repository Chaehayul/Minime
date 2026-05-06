import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SubscriptionsService } from './subscriptions.service';

@Injectable()
export class SubscriptionsScheduler {
  private readonly logger = new Logger(SubscriptionsScheduler.name);

  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  // 매일 자정에 만료된 구독 처리
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleExpiredSubscriptions() {
    this.logger.log('만료된 구독 처리 시작...');
    try {
      await this.subscriptionsService.expireSubscriptions();
      this.logger.log('만료된 구독 처리 완료');
    } catch (err) {
      this.logger.error('만료된 구독 처리 실패', err);
    }
  }
}
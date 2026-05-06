import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NewsletterSend } from './newsletter.entity';
import { Subscription } from '../subscriptions/subscription.entity';

@Injectable()
export class NewsletterService {
  constructor(
    @InjectRepository(NewsletterSend)
    private newsletterRepo: Repository<NewsletterSend>,
    @InjectRepository(Subscription)
    private subscriptionRepo: Repository<Subscription>,
  ) {}

  // 발송 이력 전체 조회 (관리자)
  async getHistory(): Promise<NewsletterSend[]> {
    return this.newsletterRepo.find({
      order: { createdAt: 'DESC' },
    });
  }

  // 예상 수신자 수 조회
  async getEstimatedRecipients(type: 'daily' | 'weekly' | 'manual'): Promise<number> {
    const today = new Date().toISOString().split('T')[0];

    // ACTIVE + CANCELED(기간내) 구독자 조회
    const baseQuery = this.subscriptionRepo
      .createQueryBuilder('s')
      .where('s.status = :active', { active: 'ACTIVE' })
      .orWhere('(s.status = :canceled AND s.endDate >= :today)', {
        canceled: 'CANCELED',
        today,
      });

    if (type === 'daily') {
      baseQuery.andWhere('s.dailyActive = true');
    } else if (type === 'weekly') {
      baseQuery.andWhere('s.weeklyActive = true');
    }

    return baseQuery.getCount();
  }

  // 뉴스레터 즉시 발송
  async sendNewsletter(
    title: string,
    type: 'daily' | 'weekly' | 'manual',
    newsId: number | null,
    createdBy: number,
  ): Promise<NewsletterSend> {
    const recipientCount = await this.getEstimatedRecipients(type);

    const targetCondition =
      type === 'daily' ? 'ACTIVE + CANCELED(기간내) / dailyActive=true'
      : type === 'weekly' ? 'ACTIVE + CANCELED(기간내) / weeklyActive=true'
      : 'ACTIVE + CANCELED(기간내) / 전체';

    const send = this.newsletterRepo.create({
      title,
      type,
      status: 'SENDING',
      recipientCount,
      successCount: 0,
      failCount: 0,
      failReasons: null,
      targetCondition,
      newsId,
      createdBy,
      sentAt: new Date(),
    });

    await this.newsletterRepo.save(send);

    // ✅ 실제 이메일 발송 로직은 여기에 추가 (Resend, Nodemailer 등)
    // 지금은 성공으로 처리
    send.status = 'SUCCESS';
    send.successCount = recipientCount;
    await this.newsletterRepo.save(send);

    return send;
  }

  // 뉴스레터 예약 발송
  async scheduleNewsletter(
    title: string,
    type: 'daily' | 'weekly' | 'manual',
    newsId: number | null,
    scheduledAt: string,
    createdBy: number,
  ): Promise<NewsletterSend> {
    const recipientCount = await this.getEstimatedRecipients(type);

    const targetCondition =
      type === 'daily' ? 'ACTIVE + CANCELED(기간내) / dailyActive=true'
      : type === 'weekly' ? 'ACTIVE + CANCELED(기간내) / weeklyActive=true'
      : 'ACTIVE + CANCELED(기간내) / 전체';

    const send = this.newsletterRepo.create({
      title,
      type,
      status: 'SCHEDULED',
      recipientCount,
      successCount: 0,
      failCount: 0,
      failReasons: null,
      targetCondition,
      newsId,
      createdBy,
      scheduledAt: new Date(scheduledAt),
      sentAt: null,
    });

    return this.newsletterRepo.save(send);
  }
}
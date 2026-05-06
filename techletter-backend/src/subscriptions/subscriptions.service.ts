import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription } from './subscription.entity';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
  ) {}

  async subscribe(userId: number) {
    const existing = await this.subscriptionRepository.findOne({
      where: { userId },
    });
    if (existing) throw new ConflictException('이미 구독 중입니다.');

    const subscription = this.subscriptionRepository.create({ userId });
    return this.subscriptionRepository.save(subscription);
  }

  async unsubscribe(userId: number) {
    const subscription = await this.subscriptionRepository.findOne({
      where: { userId },
    });
    if (!subscription) throw new NotFoundException('구독 정보를 찾을 수 없습니다.');
    subscription.unsubscribedAt = new Date();
    subscription.dailyActive = false;
    subscription.weeklyActive = false;
    return this.subscriptionRepository.save(subscription);
  }

  async getMySubscription(userId: number) {
    return this.subscriptionRepository.findOne({ where: { userId } });
  }

  async updateSettings(
    userId: number,
    settings: { dailyActive?: boolean; weeklyActive?: boolean; dailySendTime?: string },
  ) {
    const subscription = await this.subscriptionRepository.findOne({
      where: { userId },
    });
    if (!subscription) throw new NotFoundException('구독 정보를 찾을 수 없습니다.');
    Object.assign(subscription, settings);
    return this.subscriptionRepository.save(subscription);
  }

  async findAllActive() {
    return this.subscriptionRepository.find({
      where: { dailyActive: true },
      relations: ['user'],
    });
  }
}
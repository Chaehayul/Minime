import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription } from './subscription.entity';
import { Payment } from './payment.entity';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(Subscription)
    private subscriptionRepo: Repository<Subscription>,
    @InjectRepository(Payment)
    private paymentRepo: Repository<Payment>,
  ) {}

  // 내 구독 정보 조회
  async getMySubscription(userId: number): Promise<Subscription | null> {
    return this.subscriptionRepo.findOne({ where: { userId } });
  }

  // 구독 생성 (최초 구독)
  async subscribe(
    userId: number,
    planType: 'daily' | 'weekly' | 'all',
    paymentMethodBrand: string,
    paymentMethodLast4: string,
  ): Promise<Subscription> {
    // 이미 구독 중인지 확인
    const existing = await this.subscriptionRepo.findOne({ where: { userId } });
    if (existing && existing.status === 'ACTIVE') {
      throw new BadRequestException('이미 구독 중입니다.');
    }

    const today = new Date();
    const endDate = new Date(today);
    endDate.setMonth(endDate.getMonth() + 1);
    endDate.setDate(endDate.getDate() - 1);

    const nextPaymentDate = new Date(today);
    nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);

    const formatDate = (d: Date) => d.toISOString().split('T')[0];

    if (existing) {
      // 재구독
      existing.status = 'ACTIVE';
      existing.planType = planType;
      existing.startDate = formatDate(today);
      existing.endDate = formatDate(endDate);
      existing.nextPaymentDate = formatDate(nextPaymentDate);
      existing.paymentMethodBrand = paymentMethodBrand;
      existing.paymentMethodLast4 = paymentMethodLast4;
      existing.dailyActive = planType === 'daily' || planType === 'all';
      existing.weeklyActive = planType === 'weekly' || planType === 'all';
      await this.subscriptionRepo.save(existing);

      // 결제 내역 생성
      await this.createPaymentRecord(existing, today);
      return existing;
    }

    // 신규 구독
    const subscription = this.subscriptionRepo.create({
      userId,
      status: 'ACTIVE',
      planType,
      startDate: formatDate(today),
      endDate: formatDate(endDate),
      nextPaymentDate: formatDate(nextPaymentDate),
      paymentMethodBrand,
      paymentMethodLast4,
      dailyActive: planType === 'daily' || planType === 'all',
      weeklyActive: planType === 'weekly' || planType === 'all',
    });

    await this.subscriptionRepo.save(subscription);
    await this.createPaymentRecord(subscription, today);
    return subscription;
  }

  // 결제 내역 생성 (내부 사용)
  private async createPaymentRecord(subscription: Subscription, paidAt: Date): Promise<Payment> {
    const planPrices: Record<string, number> = {
      daily: 2900,
      weekly: 1900,
      all: 3900,
    };

    const payment = this.paymentRepo.create({
      userId: subscription.userId,
      subscriptionId: subscription.id,
      amount: planPrices[subscription.planType ?? 'all'],
      status: 'SUCCESS',
      periodStart: subscription.startDate!,
      periodEnd: subscription.endDate!,
      paymentMethodBrand: subscription.paymentMethodBrand,
      paymentMethodLast4: subscription.paymentMethodLast4,
      planType: subscription.planType,
      paidAt,
    });

    return this.paymentRepo.save(payment);
  }

  // 구독 해지 (CANCELED - 기간 만료까지 유지)
  async cancelSubscription(userId: number): Promise<Subscription> {
    const subscription = await this.subscriptionRepo.findOne({ where: { userId } });
    if (!subscription || subscription.status !== 'ACTIVE') {
      throw new BadRequestException('구독 중인 서비스가 없습니다.');
    }

    subscription.status = 'CANCELED';
    return this.subscriptionRepo.save(subscription);
  }

  // 자동결제 재활성화 (CANCELED → ACTIVE)
  async reactivateSubscription(userId: number): Promise<Subscription> {
    const subscription = await this.subscriptionRepo.findOne({ where: { userId } });
    if (!subscription || subscription.status !== 'CANCELED') {
      throw new BadRequestException('재활성화할 구독이 없습니다.');
    }

    subscription.status = 'ACTIVE';

    // 기간이 이미 남아있으면 nextPaymentDate만 재설정
    const today = new Date();
    const endDate = new Date(subscription.endDate!);
    if (endDate > today) {
      // 남은 기간 있음 → 종료일 기준으로 다음 결제일 설정
      const nextPayment = new Date(endDate);
      nextPayment.setDate(nextPayment.getDate() + 1);
      subscription.nextPaymentDate = nextPayment.toISOString().split('T')[0];
    } else {
      // 기간 만료 → 오늘부터 새로 시작
      const newEnd = new Date(today);
      newEnd.setMonth(newEnd.getMonth() + 1);
      newEnd.setDate(newEnd.getDate() - 1);
      const nextPayment = new Date(today);
      nextPayment.setMonth(nextPayment.getMonth() + 1);

      subscription.startDate = today.toISOString().split('T')[0];
      subscription.endDate = newEnd.toISOString().split('T')[0];
      subscription.nextPaymentDate = nextPayment.toISOString().split('T')[0];
    }

    return this.subscriptionRepo.save(subscription);
  }

  // 결제 수단 변경
  async updatePaymentMethod(
    userId: number,
    brand: string,
    last4: string,
  ): Promise<Subscription> {
    const subscription = await this.subscriptionRepo.findOne({ where: { userId } });
    if (!subscription) throw new NotFoundException('구독 정보가 없습니다.');

    subscription.paymentMethodBrand = brand;
    subscription.paymentMethodLast4 = last4;

    // 결제 실패 상태였으면 ACTIVE로 복구
    if (subscription.status === 'PAYMENT_FAILED') {
      subscription.status = 'ACTIVE';
    }

    return this.subscriptionRepo.save(subscription);
  }

  // 내 결제 내역 조회
  async getMyPayments(userId: number): Promise<Payment[]> {
    return this.paymentRepo.find({
      where: { userId },
      order: { paidAt: 'DESC' },
    });
  }

  // 만료된 구독 처리 스케줄러용
  async expireSubscriptions(): Promise<void> {
    const today = new Date().toISOString().split('T')[0];

    // CANCELED 상태에서 endDate 지난 것들 EXPIRED로 변경
    await this.subscriptionRepo
      .createQueryBuilder()
      .update(Subscription)
      .set({ status: 'EXPIRED' })
      .where('status = :status', { status: 'CANCELED' })
      .andWhere('endDate < :today', { today })
      .execute();
  }

  // 구독 설정 변경 (기존 API 유지)
  async updateSettings(
    userId: number,
    dailyActive: boolean,
    weeklyActive: boolean,
  ): Promise<Subscription> {
    const subscription = await this.subscriptionRepo.findOne({ where: { userId } });
    if (!subscription) throw new NotFoundException('구독 정보가 없습니다.');

    subscription.dailyActive = dailyActive;
    subscription.weeklyActive = weeklyActive;
    return this.subscriptionRepo.save(subscription);
  }
}
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NewsletterController } from './newsletter.controller';
import { NewsletterService } from './newsletter.service';
import { NewsletterSend } from './newsletter.entity';
import { Subscription } from '../subscriptions/subscription.entity';

@Module({
  imports: [TypeOrmModule.forFeature([NewsletterSend, Subscription])],
  controllers: [NewsletterController],
  providers: [NewsletterService],
  exports: [NewsletterService],
})
export class NewsletterModule {}
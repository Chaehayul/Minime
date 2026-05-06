import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatbotController } from './chatbot.controller';
import { ChatbotService } from './chatbot.service';
import { News } from '../news/news.entity'; // 경로 확인 필수!

@Module({
  imports: [TypeOrmModule.forFeature([News])], // News 레포지토리 주입
  controllers: [ChatbotController],
  providers: [ChatbotService]
})
export class ChatbotModule {}
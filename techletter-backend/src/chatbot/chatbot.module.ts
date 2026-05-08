import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatbotController } from './chatbot.controller';
import { ChatbotService } from './chatbot.service';
import { ReporterChatbotService } from './reporter-chatbot.service'; // 👈 새로 추가!
import { News } from '../news/news.entity'; // 기자용 챗봇이 DB를 쓰므로 추가

@Module({
  imports: [TypeOrmModule.forFeature([News])], // 👈 DB 사용을 위해 엔티티 등록
  controllers: [ChatbotController],
  providers: [
    ChatbotService, 
    ReporterChatbotService, // 👈 둘 다 등록해 줍니다!
  ],
})
export class ChatbotModule {}
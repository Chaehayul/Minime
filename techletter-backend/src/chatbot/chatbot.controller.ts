// src/chatbot/chatbot.controller.ts
import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';
import { ReporterChatbotService } from './reporter-chatbot.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // 👈 진현 님 프로젝트의 가드 경로에 맞게 임포트!
import { UserRole } from '../users/user.entity';

@Controller('chatbot')
export class ChatbotController {
  constructor(
    private readonly chatbotService: ChatbotService,
    private readonly reporterChatbotService: ReporterChatbotService,
  ) {}

  @Post('ask')
  @UseGuards(JwtAuthGuard) // 🚨 주석 해제! (이제 신분증 없으면 안 들여보내줌)
  async ask(
    @Body() body: any, 
    @Req() req: any,
  ) {
    const userMessage = body.question || body.message || body.text || '';
    const articleDraft = body.articleDraft || '';

    if (!userMessage.trim()) return { answer: '무엇이든 물어보세요! 😊' };

    // 🚨 치트키(userRole = 'admin') 삭제하고 다시 원래대로 복구!
    const userRole = req.user?.role || 'user'; 
    const userId = req.user?.id;

    if (userRole === UserRole.ADMIN || userRole === UserRole.REPORTER) {
      const answer = await this.reporterChatbotService.getReporterAnswer(userMessage, articleDraft);
      return { answer };
    } else {
      const answer = await this.chatbotService.getAnswer(userMessage, userId);
      return { answer };
    }
  }
}

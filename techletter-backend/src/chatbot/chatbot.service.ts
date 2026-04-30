import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { News } from '../news/news.entity'; // 본인의 뉴스 엔티티 경로
import OpenAI from 'openai';

@Injectable()
export class ChatbotService {
  private openai: OpenAI;

  constructor(
    @InjectRepository(News)
    private newsRepository: Repository<News>,
  ) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async getAnswer(userMessage: string): Promise<string> {
    try {
      // 1. DB에서 가장 최근 뉴스 5개를 가져와서 문맥(Context)으로 만듭니다.
      const recentNews = await this.newsRepository.find({
        order: { createdAt: 'DESC' },
        take: 5,
      });

      const newsContext = recentNews
        .map((news) => `[제목: ${news.title}]\n요약: ${news.aiSummary || '요약 없음'}`)
        .join('\n\n');

      // 2. OpenAI에게 뉴스 정보와 함께 유저의 질문을 던집니다.
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `너는 TechLetter(테크레터)의 친절한 전문 AI 비서야. 
            아래에 제공된 [최근 뉴스 정보]를 참고해서 사용자의 질문에 대답해줘. 
            뉴스에 없는 내용을 물어보면 IT 지식을 동원해 대답하되, "현재 TechLetter 뉴스에는 없지만~" 이라고 덧붙여줘.
            
            [최근 뉴스 정보]
            ${newsContext}`,
          },
          {
            role: 'user',
            content: userMessage,
          },
        ],
        temperature: 0.5,
      });

      return response.choices[0].message.content || '죄송해요, 대답을 생성하지 못했어요.';
    } catch (error) {
      console.error('챗봇 응답 에러:', error);
      return '서버와 연결이 불안정하여 답변을 드릴 수 없습니다 😢';
    }
  }
}
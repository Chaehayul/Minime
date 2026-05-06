import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { News } from '../news/news.entity';
import OpenAI from 'openai';
 
@Injectable()
export class ChatbotService {
  private openai: OpenAI;
 
  constructor(
    @InjectRepository(News)
    private newsRepository: Repository<News>,
    private dataSource: DataSource,
  ) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
 
  // ─────────────────────────────────────────────
  // Public: 챗봇 답변 생성
  // userId가 있으면 개인화, 없으면 일반 브리핑
  // ─────────────────────────────────────────────
  async getAnswer(userMessage: string, userId?: string): Promise<string> {
    try {
      // 1. 최신 뉴스 (공통)
      const recentNews = await this.newsRepository.find({
        order: { createdAt: 'DESC' },
        take: 8,
        relations: ['category', 'tags'],
      });
 
      const newsContext = recentNews.length > 0
        ? recentNews
            .map((news) =>
              `[${news.category?.name ?? '기타'}] ${news.title}\n요약: ${news.aiSummary ?? '요약 없음'}\n태그: ${news.tags?.map((t) => `#${t.name}`).join(' ') ?? '없음'}`,
            )
            .join('\n\n')
        : '현재 등록된 뉴스가 없습니다.';
 
      // 2. 사용자 개인화 컨텍스트 (로그인 시)
      const personalContext = userId
        ? await this.buildPersonalContext(userId)
        : null;
 
      // 3. 프롬프트 조합 후 OpenAI 호출
      const systemPrompt = this.buildSystemPrompt(newsContext, personalContext);
 
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.4,
      });
 
      return (
        response.choices[0].message.content ??
        '죄송해요, 대답을 생성하지 못했어요.'
      );
    } catch (error) {
      console.error('챗봇 응답 에러:', error);
      return '서버와 연결이 불안정하여 답변을 드릴 수 없습니다 😢';
    }
  }
 
  // ─────────────────────────────────────────────
  // Private: 사용자 개인화 데이터 수집
  // recommendation 모듈의 user_category_scores +
  // 최근 읽은 뉴스 + 북마크 활용
  // ─────────────────────────────────────────────
 private async buildPersonalContext(userId: string): Promise<string> {
    // 🚀 Promise.all을 사용하여 4개의 DB 쿼리를 동시에 쾅! 날립니다.
    const [topCategories, recentlyRead, bookmarkedTags, monthlyStatsResult] = await Promise.all([
      // 1. 관심 카테고리 TOP 3
      this.dataSource.query(
        `SELECT c.name, ucs.score, ucs.view_count, ucs.like_count, ucs.bookmark_count
         FROM user_category_scores ucs
         JOIN categories c ON c.id = ucs.category_id
         WHERE ucs.user_id = ?
         ORDER BY ucs.score DESC
         LIMIT 3`,
        [userId],
      ),
      // 2. 최근 읽은 뉴스 3개
      this.dataSource.query(
        `SELECT DISTINCT n.title, c.name AS category
         FROM interactions i
         JOIN news n ON n.id = i.news_id
         JOIN categories c ON c.id = n.category_id
         WHERE i.user_id = ? AND i.type = 'view'
         ORDER BY i.created_at DESC
         LIMIT 3`,
        [userId],
      ),
      // 3. 북마크한 뉴스 태그
      this.dataSource.query(
        `SELECT DISTINCT t.name
         FROM interactions i
         JOIN news_tags nt ON nt.news_id = i.news_id
         JOIN tags t ON t.id = nt.tag_id
         WHERE i.user_id = ? AND i.type = 'bookmark'
         ORDER BY i.created_at DESC
         LIMIT 8`,
        [userId],
      ),
      // 4. 이번 달 읽은 뉴스 수
      this.dataSource.query(
        `SELECT COUNT(DISTINCT news_id) AS read_count
         FROM interactions
         WHERE user_id = ? AND type = 'view'
           AND created_at >= DATE_FORMAT(NOW(), '%Y-%m-01')`,
        [userId],
      )
    ]);

    const monthlyStats = monthlyStatsResult[0]; // 배열 구조 분해
 
    // ── 개인화 컨텍스트 문자열 조합 ──
    const lines: string[] = [];
 
    if (topCategories.length > 0) {
      const catList = topCategories
        .map(
          (c: any, i: number) =>
            `  ${i + 1}위. ${c.name} (조회 ${c.view_count}회, 좋아요 ${c.like_count}회, 북마크 ${c.bookmark_count}회)`,
        )
        .join('\n');
      lines.push(`[관심 카테고리 TOP ${topCategories.length}]\n${catList}`);
    }
 
    if (recentlyRead.length > 0) {
      const readList = recentlyRead
        .map((n: any) => `  - [${n.category}] ${n.title}`)
        .join('\n');
      lines.push(`[최근 읽은 뉴스]\n${readList}`);
    }
 
    if (bookmarkedTags.length > 0) {
      const tagList = bookmarkedTags.map((t: any) => `#${t.name}`).join(' ');
      lines.push(`[북마크 기반 관심 키워드]\n  ${tagList}`);
    }
 
    if (monthlyStats?.read_count) {
      lines.push(`[이번 달 읽은 뉴스]\n  총 ${monthlyStats.read_count}개`);
    }
 
    return lines.length > 0 ? lines.join('\n\n') : '';
  }
 
  // ─────────────────────────────────────────────
  // Private: 시스템 프롬프트 생성
  // ─────────────────────────────────────────────
  private buildSystemPrompt(
    newsContext: string,
    personalContext: string | null,
  ): string {
    const isPersonalized = personalContext && personalContext.length > 0;
 
    const personalSection = isPersonalized
      ? `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[이 사용자의 개인 데이터]
${personalContext}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 
[개인화 답변 규칙]
- 위 개인 데이터를 반드시 활용해서 답변을 맞춤화해.
- 사용자가 "뉴스 추천해 줘" 라고 하면 → 관심 카테고리 TOP 순서대로 관련 뉴스를 먼저 추천해.
- 사용자가 "요즘 뭐 많이 봐?" 처럼 자신의 패턴을 물으면 → 관심 카테고리와 읽은 뉴스를 바탕으로 성향을 분석해서 알려줘.
  예: "요즘 AI/ML 관련 뉴스를 가장 많이 읽고 계시네요! 특히 #ChatGPT #LLM 키워드에 관심이 높으신 것 같아요 🤖"
- 사용자의 관심 카테고리에 해당하는 오늘 뉴스가 있으면 그걸 제일 먼저 언급해.
- 관심 카테고리와 무관한 뉴스를 추천할 때는 "평소 관심사와 조금 다른 분야지만..." 같은 브릿지 문구를 써.
- 이름 대신 "님"으로 통일해서 부를 것.`
      : `
[일반 브리핑 규칙]
- 로그인하지 않은 사용자에게는 전체 뉴스 중 가장 주목할 만한 것을 균형 있게 소개해.
- 브리핑 말미에 "로그인하시면 관심 분야에 맞는 맞춤 추천을 받을 수 있어요! 😊" 를 자연스럽게 안내해.`;
 
    return `너는 IT 테크 뉴스 플랫폼 '테크레터'의 AI 뉴스 비서야.
${isPersonalized ? '이 사용자의 읽기 패턴과 관심사 데이터가 있으니, 철저히 개인화된 답변을 제공해.' : ''}
 
[너의 역할]
- 뉴스 브리핑·요약·추천을 담당하는 친절한 AI 비서
- 사용자가 오늘 어떤 뉴스를 읽어야 할지 빠르게 파악하도록 도와주는 역할
- 딱딱하지 않고 친근하되, 정보는 정확하고 간결하게
 
[절대 규칙]
1. 반드시 아래 [최근 뉴스 정보]를 기반으로만 답변해. 없는 뉴스를 지어내지 마.
2. [최근 뉴스 정보]가 비어 있다면 → "아직 오늘 새로운 테크 기사가 없어요 😅 조금 뒤에 다시 확인해 주세요!"
3. IT·테크와 무관한 질문(날씨, 맛집, 연애 등) → "저는 테크레터 뉴스 비서라서 IT 소식만 알려드릴 수 있어요! 다른 건 몰라요 😅"
4. 답변은 이모지(🚀 💡 🔥 🤖 ☁️ 🔐 등)를 적절히 섞어 가독성 있게.
5. 한 번에 너무 많은 뉴스를 나열하지 말고, 핵심 2~4개만 골라서 깊이 있게 소개해.
6. 뉴스 제목을 그대로 읽지 말고, 핵심 내용을 쉽게 풀어서 설명해.
${personalSection}
 
[답변 형식 가이드]
- 뉴스 브리핑 요청 시: 카테고리 이모지 + 한 줄 핵심 요약 형태로
- 특정 주제 질문 시: 관련 뉴스 먼저 → 간단한 배경 설명 → 한 줄 코멘트
- 패턴/성향 질문 시: 데이터 기반 분석 → 따뜻한 코멘트
 
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[최근 뉴스 정보]
${newsContext}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
  }
}
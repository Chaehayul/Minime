// src/chatbot/reporter-chatbot.service.ts
//
// 기자용 레퍼런스 큐레이터 챗봇
// ─ 방법 1: 네이버 뉴스 API description 활용 (토큰 절약)
// ─ 방법 2: 레퍼런스 큐레이터 역할 (링크 추천)
// ─ 방법 3: 자체 DB 뉴스 검색 (완벽한 본문 분석)

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { News } from '../news/news.entity';
import OpenAI from 'openai';

// ── 타입 ──────────────────────────────────────
interface NaverNewsItem {
  title: string;
  description: string;
  link: string;
  pubDate: string;
  originallink: string;
}

interface NaverNewsResult {
  items: NaverNewsItem[];
}

interface OwnNewsResult {
  id: string;
  title: string;
  content: string;
  aiSummary: string | null;
  category: string;
  publishedAt: Date;
}

// ─────────────────────────────────────────────
@Injectable()
export class ReporterChatbotService {
  private readonly logger = new Logger(ReporterChatbotService.name);
  private openai: OpenAI | null;

  // 네이버 뉴스 캐시 (검색어별, 3분 TTL)
  private naverCache = new Map<string, { data: NaverNewsItem[]; cachedAt: number }>();
  private readonly CACHE_TTL = 3 * 60 * 1000;

  constructor(
    @InjectRepository(News)
    private newsRepository: Repository<News>,
    private dataSource: DataSource,
  ) {
    this.openai = process.env.OPENAI_API_KEY
      ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
      : null;
  }

  // ─────────────────────────────────────────────
  // Public: 기자용 챗봇 메인 진입점
  // ─────────────────────────────────────────────
  async getReporterAnswer(
    userMessage: string,
    articleDraft?: string, // 기자가 작성 중인 기사 초안 (선택)
  ): Promise<string> {
    const openai = this.openai;
    if (!openai) {
      return '현재 포트폴리오 데모에서는 기자 AI 도우미 기능이 비활성화되어 있습니다.';
    }

    try {
      // 메시지에서 검색 키워드 추출
      const searchKeyword = this.extractKeyword(userMessage);

      // 세 가지 데이터 소스를 병렬로 수집
      const [naverNews, ownNews] = await Promise.all([
        this.searchNaverNews(searchKeyword),
        this.searchOwnNews(searchKeyword),
      ]);

      const systemPrompt = this.buildReporterPrompt(
        naverNews,
        ownNews,
        articleDraft,
      );

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.2, // 낮은 temperature — 팩트 중심 답변
      });

      return (
        response.choices[0].message.content ??
        '답변을 생성하지 못했습니다.'
      );
    } catch (error) {
      this.logger.error('기자용 챗봇 에러', error);
      return '서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.';
    }
  }

  // ─────────────────────────────────────────────
  // 방법 1 + 2: 네이버 뉴스 API
  // description(요약)만 가져와서 토큰 절약
  // ─────────────────────────────────────────────
  private async searchNaverNews(keyword: string): Promise<NaverNewsItem[]> {
    // 캐시 확인
    const cached = this.naverCache.get(keyword);
    if (cached && Date.now() - cached.cachedAt < this.CACHE_TTL) {
      return cached.data;
    }

    const clientId = process.env.NAVER_SEARCH_CLIENT_ID;
    const clientSecret = process.env.NAVER_SEARCH_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      this.logger.warn('네이버 API 키 미설정');
      return [];
    }

    try {
      const url = new URL('https://openapi.naver.com/v1/search/news.json');
      url.searchParams.set('query', keyword);
      url.searchParams.set('display', '10'); // 상위 10개
      url.searchParams.set('sort', 'date');  // 최신순

      const res = await fetch(url.toString(), {
        headers: {
          'X-Naver-Client-Id': clientId,
          'X-Naver-Client-Secret': clientSecret,
        },
      });

      if (!res.ok) throw new Error(`네이버 API 오류: ${res.status}`);

      const data: NaverNewsResult = await res.json();
      const items = data.items ?? [];

      // HTML 태그 제거 (네이버 description에 <b> 태그 포함됨)
      const cleaned = items.map((item) => ({
        ...item,
        title: this.stripHtml(item.title),
        description: this.stripHtml(item.description),
      }));

      this.naverCache.set(keyword, { data: cleaned, cachedAt: Date.now() });
      return cleaned;
    } catch (err) {
      this.logger.error('네이버 뉴스 검색 실패', err);
      return [];
    }
  }

  // ─────────────────────────────────────────────
  // 방법 3: 자체 DB 뉴스 전문 검색
  // FULLTEXT 검색 or LIKE 검색
  // ─────────────────────────────────────────────
  private async searchOwnNews(keyword: string): Promise<OwnNewsResult[]> {
    try {
      // MySQL FULLTEXT 검색 (schema에 FULLTEXT KEY ft_news_title_content 있음)
      const rows = await this.dataSource.query(
        `SELECT
           n.id, n.title, n.content, n.ai_summary, n.published_at,
           c.name AS category
         FROM news n
         LEFT JOIN categories c ON c.id = n.category_id
         WHERE n.status = 'published'
           AND (
             MATCH(n.title, n.content) AGAINST(? IN BOOLEAN MODE)
             OR n.title LIKE ?
           )
         ORDER BY n.published_at DESC
         LIMIT 5`,
        [keyword, `%${keyword}%`],
      );

      return rows.map((r: any) => ({
        id: r.id,
        title: r.title,
        // 본문이 길면 앞 500자만 (토큰 절약)
        content: r.content?.slice(0, 500) ?? '',
        aiSummary: r.ai_summary,
        category: r.category ?? '기타',
        publishedAt: r.published_at,
      }));
    } catch (err) {
      this.logger.error('자체 DB 검색 실패', err);
      return [];
    }
  }

  // ─────────────────────────────────────────────
  // 시스템 프롬프트 — 기자용
  // ─────────────────────────────────────────────
  private buildReporterPrompt(
    naverNews: NaverNewsItem[],
    ownNews: OwnNewsResult[],
    articleDraft?: string,
  ): string {
    const hasNaver   = naverNews.length > 0;
    const hasOwn     = ownNews.length > 0;
    const hasDraft   = !!articleDraft?.trim();

    // ── 네이버 뉴스 블록 (제목 + 요약만, 본문 X → 토큰 절약) ──
    const naverBlock = hasNaver
      ? `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[네이버 최신 뉴스 — 제목 + 요약]
${naverNews
  .map(
    (item, i) =>
      `${i + 1}. ${item.title}\n   요약: ${item.description}\n   링크: ${item.originallink || item.link}\n   날짜: ${new Date(item.pubDate).toLocaleDateString('ko-KR')}`,
  )
  .join('\n\n')}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`
      : '(네이버 뉴스 검색 결과 없음)';

    // ── 자체 DB 블록 (본문 일부 포함 → 논조 분석 가능) ──
    const ownBlock = hasOwn
      ? `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[테크레터 자체 DB 관련 기사]
${ownNews
  .map(
    (n, i) =>
      `${i + 1}. [${n.category}] ${n.title}\n` +
      `   요약: ${n.aiSummary ?? '(요약 없음)'}\n` +
      `   본문 일부: ${n.content}...\n` +
      `   발행일: ${new Date(n.publishedAt).toLocaleDateString('ko-KR')}`,
  )
  .join('\n\n')}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`
      : '(자체 DB에 관련 기사 없음)';

    // ── 기사 초안 블록 (선택) ──
    const draftBlock = hasDraft
      ? `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[기자가 작성 중인 기사 초안]
${articleDraft}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`
      : '';

    return `너는 IT 테크 뉴스 플랫폼 'MINIME'의 기자 전용 취재 보조 AI야.
일반 독자용 챗봇이 아니라, 기자가 기사를 더 빠르고 정확하게 쓸 수 있도록 돕는 "레퍼런스 큐레이터"야.
 
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[메시지 유형 분류 — 가장 먼저 판단해]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 
1. 가벼운 인삿말 (안녕, ㅎㅇ, 안녕하세요, 반가워, hi, hello 등)
   → 아래 형식으로만 짧게 답하고 끝내. 레퍼런스 탐색 금지.
   답변 예시: "안녕하세요! 취재 보조 AI입니다. 다루실 주제나 키워드를 말씀해 주시면 관련 자료를 정리해 드릴게요."
 
2. 취재·기사·뉴스와 관련 없는 질문
   (날씨, 맛집, 연애, 코딩 도움, 번역, 잡담, 농담 요청 등)
   → 아래 문구로만 정중히 거절. 추가 설명이나 대안 제시 금지.
   답변 예시: "저는 취재 보조 전용 AI라 IT 뉴스·기사 관련 질문만 도와드릴 수 있어요."
 
3. IT·테크·뉴스 관련 취재 요청
   → 아래 [너의 역할]과 [답변 형식]에 따라 풀 리스폰스 제공.
 
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 
[너의 역할] — 유형 3에만 적용
1. 기자가 다루려는 주제와 관련된 최신 이슈 트렌드를 핵심 3가지로 정리.
2. 취재에 참고할 만한 기사 링크를 "왜 참고할 만한지" 이유와 함께 추천.
3. 자체 DB에 관련 기사가 있으면 "예전에 이런 논조로 다뤘습니다"라고 안내.
4. 기사 초안이 있으면 "이 주장을 뒷받침할 수 있는 자료"를 구체적으로 짚어줘.
 
[답변 원칙] — 유형 3에만 적용
- 팩트와 출처 중심으로 간결하게. 감성적 표현 금지.
- 링크는 반드시 실제 URL 그대로 노출. 절대 지어내지 마.
- 네이버 뉴스는 제목+요약만 있으므로 본문 내용을 추측하거나 단정짓지 마.
  반드시 "제목과 요약 기준으로" 또는 "본문 확인 필요" 단서를 달 것.
- 자체 DB 기사는 본문 일부가 있으니 좀 더 구체적인 분석 가능.
- 응답 형식: 마크다운 없이 번호 리스트로 깔끔하게.
 
[답변 형식] — 유형 3에만 적용
📌 현재 이슈 트렌드 (3가지)
1. ...
2. ...
3. ...
 
📎 취재 참고 링크
1. [기사 제목] — [왜 참고할 만한지 한 줄]
   링크: https://...
 
📂 MINIME 관련 기사
- [제목] (YYYY.MM.DD) — [논조 한 줄 요약]

${draftBlock ? '✏️ 초안 관련 보완 자료\n...' : ''}

${naverBlock}

${ownBlock}

${draftBlock}`;
  }

  // ─────────────────────────────────────────────
  // Helper: 메시지에서 검색 키워드 추출
  // ─────────────────────────────────────────────
  private extractKeyword(message: string): string {
    // 따옴표 안의 키워드 우선 추출
    const quoted = message.match(/["'](.+?)["']/);
    if (quoted) return quoted[1];

    // "~에 대해", "~관련", "~기사" 등 패턴 제거 후 핵심어 추출
    return message
      .replace(/참고|자료|기사|뉴스|써줘|찾아줘|알려줘|관련|최신|레퍼런스|취재/g, '')
      .replace(/[^\w\sㄱ-힣]/g, '')
      .trim()
      .slice(0, 30); // 네이버 API 검색어 최대 30자
  }

  // HTML 태그 제거
  private stripHtml(str: string): string {
    return str.replace(/<[^>]+>/g, '').replace(/&quot;/g, '"').replace(/&amp;/g, '&');
  }
}

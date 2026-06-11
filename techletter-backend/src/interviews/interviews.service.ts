import {
  Injectable,
  InternalServerErrorException,
  ServiceUnavailableException,
} from '@nestjs/common';
import OpenAI from 'openai';
import { createReadStream } from 'fs';
import { unlink } from 'fs/promises';

export interface InterviewAnalysis {
  transcript: string;
  summary: string[];
  keyQuotes: string[];
  titleSuggestions: string[];
  lead: string;
  tags: string[];
  articleOutline: string[];
}

@Injectable()
export class InterviewsService {
  private readonly openai = process.env.OPENAI_API_KEY
    ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    : null;

  async analyze(file: Express.Multer.File): Promise<InterviewAnalysis> {
    if (!this.openai) {
      await unlink(file.path).catch(() => undefined);
      throw new ServiceUnavailableException(
        '인터뷰 분석 기능에 필요한 OPENAI_API_KEY가 설정되지 않았습니다.',
      );
    }

    try {
      const transcript = await this.transcribe(file.path);
      const analysis = await this.summarizeForArticle(transcript);

      return {
        transcript,
        ...analysis,
      };
    } catch (error) {
      console.error('Interview analysis failed:', error);
      throw new InternalServerErrorException('인터뷰 분석 중 오류가 발생했습니다.');
    } finally {
      await unlink(file.path).catch(() => undefined);
    }
  }

  private async transcribe(filePath: string): Promise<string> {
    const transcription = await this.openai!.audio.transcriptions.create({
      file: createReadStream(filePath),
      model: process.env.OPENAI_TRANSCRIBE_MODEL || 'whisper-1',
      language: 'ko',
      response_format: 'text',
    });

    return typeof transcription === 'string' ? transcription.trim() : String(transcription).trim();
  }

  private async summarizeForArticle(transcript: string): Promise<Omit<InterviewAnalysis, 'transcript'>> {
    const response = await this.openai!.chat.completions.create({
      model: process.env.OPENAI_SUMMARY_MODEL || 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            '너는 한국어 테크 뉴스 편집자다. 인터뷰 녹취록에서 기사 작성에 필요한 핵심 요약, 인용문, 제목 후보, 리드문, 태그, 구성안을 JSON으로만 반환한다.',
        },
        {
          role: 'user',
          content: `아래 인터뷰 녹취록을 분석해서 JSON으로 반환해 주세요.

JSON 형식:
{
  "summary": ["핵심 요약 1", "핵심 요약 2", "핵심 요약 3"],
  "keyQuotes": ["기사에 쓸 만한 주요 발언", "..."],
  "titleSuggestions": ["기사 제목 후보", "..."],
  "lead": "기사 리드문 2문장",
  "tags": ["태그", "..."],
  "articleOutline": ["도입", "배경", "핵심 내용", "전망"]
}

규칙:
- summary는 반드시 3개만 작성합니다.
- 녹취록에 없는 사실을 추가하지 않습니다.
- 불명확한 내용은 "확인 필요"라고 표시합니다.
- keyQuotes는 원문 표현을 최대한 보존합니다.

녹취록:
${transcript}`,
        },
      ],
      temperature: 0.2,
    });

    const content = response.choices[0].message.content || '{}';
    const parsed = JSON.parse(content) as Partial<Omit<InterviewAnalysis, 'transcript'>>;

    return {
      summary: this.toStringArray(parsed.summary, 3),
      keyQuotes: this.toStringArray(parsed.keyQuotes, 5),
      titleSuggestions: this.toStringArray(parsed.titleSuggestions, 3),
      lead: parsed.lead || '',
      tags: this.toStringArray(parsed.tags, 6),
      articleOutline: this.toStringArray(parsed.articleOutline, 6),
    };
  }

  private toStringArray(value: unknown, limit?: number): string[] {
    const items = Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
    return typeof limit === 'number' ? items.slice(0, limit) : items;
  }
}

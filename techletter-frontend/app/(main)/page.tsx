import MobileFrame from "@/components/layout/MobileFrame";
import NewsCard from "@/components/news/NewsCard";
import NewsListItem from "@/components/news/NewsListItem";
import { News } from "@/types/news";

const hotNews: News[] = [
  {
    id: 1,
    title: "GPT-5 출시, 성능 40% 향상",
    summary: "",
    createdAt: "2시간 전",
    views: 1200,
    likesCount: 84,
  },
  {
    id: 2,
    title: "React 19 정식 릴리즈",
    summary: "",
    createdAt: "5시간 전",
    views: 980,
    likesCount: 61,
  },
];

const latestNews: News[] = [
  {
    id: 1,
    title: "GPT-5 출시, 이전 버전 대비 성능 40% 향상",
    summary: "",
    createdAt: "2시간 전",
    views: 832,
    commentsCount: 12,
  },
  {
    id: 2,
    title: "React 19 정식 릴리즈 발표",
    summary: "",
    createdAt: "5시간 전",
    views: 654,
    commentsCount: 7,
  },
];

export default function HomePage() {
  return (
    <MobileFrame>
      <div className="mb-4 flex items-center gap-3">
        {/* 메뉴 버튼 */}
        <button className="text-2xl text-blue-500">☰</button>
        
        {/* 검색바: 라이트모드 땐 밝은 회색, 다크모드 땐 어두운 톤 */}
        <div className="flex-1 rounded-full border border-gray-200 bg-gray-100 px-4 py-2 text-sm text-gray-500 dark:border-[#3b3b3b] dark:bg-[#181818] dark:text-gray-400 transition-colors">
          🔍 검색
        </div>
        
        <button className="text-xl">🔔</button>
        
        {/* 유저 아이콘 */}
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-600 dark:bg-[#f1f5ff] transition-colors">
          U
        </div>
      </div>

      {/* 배너: 라이트 모드에서도 어둡게 고정 */}
      <div className="mb-5 flex h-36 items-center justify-center bg-[#1a1c2e] border border-gray-800 text-gray-300 transition-colors">
        이번 주 핫뉴스 배너
      </div>

      {/* 핫뉴스 타이틀 */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white transition-colors">⚡ 지금 핫한 뉴스</h2>
        <button className="text-sm text-blue-500 hover:text-blue-600">전체보기</button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {hotNews.map((news) => (
          <NewsCard key={news.id} news={news} />
        ))}
      </div>

      {/* 카테고리 버튼들 */}
      <div className="mt-5 mb-5 flex flex-wrap gap-2">
        <button className="rounded-xl bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-600 dark:bg-[#e9f0ff] transition-colors">
          전체
        </button>
        <button className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 dark:border-[#3b3b3b] dark:bg-transparent dark:text-gray-300 transition-colors">
          AI
        </button>
        <button className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 dark:border-[#3b3b3b] dark:bg-transparent dark:text-gray-300 transition-colors">
          프론트
        </button>
        <button className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 dark:border-[#3b3b3b] dark:bg-transparent dark:text-gray-300 transition-colors">
          백엔드
        </button>
        <button className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 dark:border-[#3b3b3b] dark:bg-transparent dark:text-gray-300 transition-colors">
          보안
        </button>
      </div>

      {/* 최신 뉴스 타이틀 */}
      <h2 className="mb-3 text-lg font-bold text-gray-900 dark:text-white transition-colors">최신 뉴스</h2>

      <div>
        {latestNews.map((news) => (
          <NewsListItem key={news.id} news={news} />
        ))}
      </div>

    </MobileFrame>
  );
}
'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import api, { getImageUrl } from '@/lib/api';
import SearchPreviewInput from '@/components/common/SearchPreviewInput';

interface Category { id: number; name: string }
interface News {
  id: number;
  title: string;
  content?: string;
  lead?: string;
  aiSummary?: string;
  thumbnailUrl?: string | null;
  createdAt: string;
  publishedAt?: string | null;
  category?: Category | null;
}
interface HomeFeed {
  mainNews?: News[];
  urgentNews?: News[];
  recommendedNews?: News[];
  weeklyPopular?: News[];
}
interface User { nickname: string }
interface UserReport { topCategories: Array<{ category: Category }> }

const stripHtml = (value = '') => value.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
const asNews = (value: unknown) => Array.isArray(value) ? value as News[] : [];
const dateLabel = (date?: string | null) => date
  ? new Date(date).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })
  : '';

function Thumb({ news, className }: { news: News; className: string }) {
  const source = getImageUrl(news.thumbnailUrl);
  return source ? <img src={source} alt="" className={`${className} object-cover`} /> : (
    <div className={`${className} flex items-center justify-center bg-gray-100 text-xs font-semibold text-gray-400 dark:bg-gray-900`}>MINIME</div>
  );
}

function NewsRow({ news, rank }: { news: News; rank?: number }) {
  return (
    <Link href={`/news/${news.id}`} className="group grid grid-cols-[1fr_112px] gap-4 border-b border-gray-200 py-5 dark:border-gray-800">
      <div className="min-w-0">
        <div className="mb-2 flex items-center gap-2 text-xs text-gray-500">
          {rank && <strong className="text-blue-600">{String(rank).padStart(2, '0')}</strong>}
          <span>{news.category?.name ?? '테크 뉴스'}</span>
          <span>{dateLabel(news.publishedAt ?? news.createdAt)}</span>
        </div>
        <h3 className="line-clamp-2 text-base font-bold group-hover:text-blue-600">{news.title}</h3>
        <p className="mt-2 line-clamp-2 text-sm text-gray-500">{news.lead || news.aiSummary || stripHtml(news.content)}</p>
      </div>
      <Thumb news={news} className="h-20 w-28" />
    </Link>
  );
}

export default function HomePage() {
  const [feed, setFeed] = useState<HomeFeed>({});
  const [latest, setLatest] = useState<News[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [report, setReport] = useState<UserReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    Promise.all([
      api.get('/news/home'),
      api.get('/news', { params: { limit: 12 } }),
      api.get('/categories'),
      token ? api.get('/users/me').catch(() => ({ data: null })) : Promise.resolve({ data: null }),
      token ? api.get('/users/me/report').catch(() => ({ data: null })) : Promise.resolve({ data: null }),
    ])
      .then(([feedResponse, newsResponse, categoryResponse, userResponse, reportResponse]) => {
        setFeed(feedResponse.data ?? {});
        setLatest(asNews(newsResponse.data?.news));
        setCategories(Array.isArray(categoryResponse.data) ? categoryResponse.data : []);
        setUser(userResponse.data);
        setReport(reportResponse.data);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (loading) return;
    api.get('/news', { params: { limit: 12, ...(activeCategory ? { categoryId: activeCategory } : {}) } })
      .then((response) => setLatest(asNews(response.data?.news)));
  }, [activeCategory, loading]);

  const featured = asNews(feed.urgentNews)[0] || asNews(feed.mainNews)[0] || latest[0];
  const picked = asNews(feed.recommendedNews).filter((news) => news.id !== featured?.id).slice(0, 3);
  const popular = (asNews(feed.weeklyPopular).length ? asNews(feed.weeklyPopular) : latest).slice(0, 5);
  const interestNames = report?.topCategories?.map((item) => item.category.name).join(', ');
  const personalized = useMemo(() => {
    const ids = new Set(report?.topCategories?.map((item) => item.category.id) ?? []);
    return [...asNews(feed.recommendedNews), ...latest]
      .filter((news, index, list) => list.findIndex((item) => item.id === news.id) === index)
      .sort((a, b) => Number(ids.has(b.category?.id ?? -1)) - Number(ids.has(a.category?.id ?? -1)))
      .slice(0, 4);
  }, [feed.recommendedNews, latest, report]);

  if (loading) {
    return <main className="mx-auto min-h-screen max-w-6xl px-4 py-10"><div className="h-96 animate-pulse bg-gray-100 dark:bg-gray-900" /></main>;
  }

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 pb-20">
      <section className="grid min-h-[430px] gap-8 border-b border-gray-200 py-8 dark:border-gray-800 lg:grid-cols-[1.5fr_0.8fr]">
        {featured ? (
          <Link href={`/news/${featured.id}`} className="group relative min-h-[360px] overflow-hidden bg-gray-950">
            <Thumb news={featured} className="absolute inset-0 h-full w-full opacity-65 transition duration-500 group-hover:scale-[1.02]" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-8">
              <span className="text-xs font-bold uppercase text-blue-300">Today&apos;s briefing</span>
              <h1 className="mt-3 max-w-3xl text-3xl font-bold leading-tight sm:text-4xl">{featured.title}</h1>
              <p className="mt-3 line-clamp-2 max-w-2xl text-sm text-gray-200">{featured.lead || featured.aiSummary || stripHtml(featured.content)}</p>
            </div>
          </Link>
        ) : <div className="flex min-h-[360px] items-center justify-center bg-gray-100 text-gray-500 dark:bg-gray-900">등록된 기사가 없습니다.</div>}

        <aside>
          <p className="text-xs font-bold uppercase text-blue-600">Editor&apos;s picks</p>
          <h2 className="mt-1 text-xl font-bold">지금 놓치면 아쉬운 뉴스</h2>
          <div className="mt-3">
            {(picked.length ? picked : latest.slice(1, 4)).map((news) => <NewsRow key={news.id} news={news} />)}
          </div>
        </aside>
      </section>

      <section className="border-b border-gray-200 py-6 dark:border-gray-800">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setActiveCategory(null)} className={`px-3 py-2 text-sm ${activeCategory === null ? 'bg-gray-950 text-white dark:bg-white dark:text-gray-950' : 'bg-gray-100 dark:bg-gray-900'}`}>전체</button>
            {categories.map((category) => (
              <button key={category.id} onClick={() => setActiveCategory(category.id)} className={`px-3 py-2 text-sm ${activeCategory === category.id ? 'bg-gray-950 text-white dark:bg-white dark:text-gray-950' : 'bg-gray-100 dark:bg-gray-900'}`}>
                {category.name}
              </button>
            ))}
          </div>
          <div className="w-full sm:w-72"><SearchPreviewInput /></div>
        </div>
      </section>

      {user && personalized.length > 0 && (
        <section className="border-b border-gray-200 py-10 dark:border-gray-800">
          <p className="text-xs font-bold uppercase text-blue-600">For {user.nickname}</p>
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
            <h2 className="text-2xl font-bold">관심 분야를 반영한 추천</h2>
            <span className="text-sm text-gray-500">{interestNames ? `${interestNames} 활동 기준` : '최근 활동 기준'}</span>
          </div>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {personalized.map((news) => (
              <Link key={news.id} href={`/news/${news.id}`} className="group">
                <Thumb news={news} className="aspect-[4/3] w-full" />
                <span className="mt-3 block text-xs text-blue-600">{news.category?.name ?? '테크 뉴스'}</span>
                <h3 className="mt-1 line-clamp-2 font-bold group-hover:text-blue-600">{news.title}</h3>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="grid gap-10 py-10 lg:grid-cols-[1.5fr_0.7fr]">
        <div>
          <p className="text-xs font-bold uppercase text-blue-600">Latest</p>
          <h2 className="mt-1 text-2xl font-bold">최신 기술 뉴스</h2>
          <div className="mt-4">{latest.map((news) => <NewsRow key={news.id} news={news} />)}</div>
        </div>
        <aside>
          <p className="text-xs font-bold uppercase text-blue-600">Weekly ranking</p>
          <h2 className="mt-1 text-2xl font-bold">이번 주 많이 본 기사</h2>
          <div className="mt-4">{popular.map((news, index) => <NewsRow key={news.id} news={news} rank={index + 1} />)}</div>
        </aside>
      </section>
    </main>
  );
}

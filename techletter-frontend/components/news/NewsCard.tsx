import Link from 'next/link';
import { News } from '@/types/news';

interface Props {
  news: News;
}

export default function NewsCard({ news }: Props) {
  return (
    <Link href={`/news/${news.id}`} className="card-dark block p-3">
      <div className="mb-3 flex h-20 items-center justify-center rounded-xl border border-dashed border-[#4a4a4a] text-sm text-gray-500">
        {news.thumbnail ? (
          <img
            src={news.thumbnail}
            alt={news.title}
            className="h-full w-full rounded-xl object-cover"
          />
        ) : (
          '썸네일'
        )}
      </div>

      <h3 className="line-clamp-2 text-[15px] font-semibold leading-5 text-white">
        {news.title}
      </h3>

      <div className="mt-3 flex items-center gap-3 text-xs text-gray-400">
        <span>👁 {news.views ?? 0}</span>
        <span>♡ {news.likesCount ?? 0}</span>
      </div>
    </Link>
  );
}
import Link from 'next/link';
import { News } from '@/types/news';

interface Props {
  news: News;
}

export default function NewsListItem({ news }: Props) {
  return (
    <Link href={`/news/${news.id}`} className="block border-b border-[#2c2c2c] py-4">
      <div className="flex gap-3">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-dashed border-[#4a4a4a] text-xs text-gray-500">
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

        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap gap-2">
            {news.category?.name && (
              <span className="rounded-md bg-[#e8f0ff] px-2 py-1 text-[11px] font-semibold text-blue-600">
                {news.category.name}
              </span>
            )}

            {news.tags?.slice(0, 1).map((tag) => (
              <span
                key={tag.id}
                className="rounded-md bg-[#262626] px-2 py-1 text-[11px] text-gray-300"
              >
                #{tag.name}
              </span>
            ))}
          </div>

          <h3 className="line-clamp-2 text-[15px] font-semibold leading-5 text-white">
            {news.title}
          </h3>

          <div className="mt-2 flex gap-3 text-xs text-gray-400">
            <span>{new Date(news.createdAt).toLocaleDateString()}</span>
            <span>👁 {news.views ?? 0}</span>
            <span>💬 {news.commentsCount ?? 0}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
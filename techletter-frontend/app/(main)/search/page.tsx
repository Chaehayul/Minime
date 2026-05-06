export default function SearchPage() {
  return <div>Search Page</div>;
}

function LocalResults({
  loading,
  newsList,
  hasQuery,
}: {
  loading: boolean;
  newsList: News[];
  hasQuery: boolean;
}) {
  if (loading) return <LoadingList />;

  if (!hasQuery) {
    return (
      <EmptyState>
        TechLetter에 등록된 기사 제목, 본문, 카테고리를 검색할 수 있습니다.
      </EmptyState>
    );
  }

  if (newsList.length === 0) {
    return <EmptyState>검색 결과가 없습니다.</EmptyState>;
  }

  return (
    <div className="flex flex-col">
      {newsList.map((news) => (
        <Link key={news.id} href={`/news/${news.id}`}>
          <article className="flex gap-3 rounded-lg border-b border-gray-800 px-2 py-4 transition hover:bg-gray-900">
            {getImageUrl(news.thumbnailUrl) ? (
              <img
                src={getImageUrl(news.thumbnailUrl)}
                alt={news.title}
                className="h-16 w-20 flex-shrink-0 rounded-lg object-cover"
              />
            ) : (
              <div className="flex h-16 w-20 flex-shrink-0 items-center justify-center rounded-lg bg-gray-700 text-xs text-gray-500">
                이미지 없음
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="mb-1 line-clamp-2 text-sm font-medium text-gray-100">
                {news.title}
              </p>
              <p className="line-clamp-1 text-xs text-gray-500">
                {news.content.replace(/<[^>]*>/g, '')}
              </p>
              <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
                <span>{news.category?.name || '뉴스'}</span>
                <span>조회 {news.viewCount}</span>
              </div>
            </div>
          </article>
        </Link>
      ))}
    </div>
  );
}

function LoadingList() {
  return (
    <div className="flex flex-col gap-3">
      {[1, 2, 3].map((item) => (
        <div key={item} className="h-24 animate-pulse rounded-xl bg-gray-800" />
      ))}
    </div>
  );
}

function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 px-4 py-8 text-center text-sm text-gray-400">
      {children}
    </div>
  );
}

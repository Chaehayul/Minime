'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import TiptapEditor from '@/components/editor/TiptapEditor';

interface Category {
  id: number;
  name: string;
  slug: string;
}

export default function AdminNewsCreatePage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({
    title: '',
    content: '',
    categoryId: '',
    status: 'draft',
    thumbnailUrl: '',
    lead: '',
    metaDescription: '',
    slug: '',
    tags: [] as string[],
    scheduledAt: '',
  });

  // ✅ 뉴스레터 발송 옵션
  const [newsletterOption, setNewsletterOption] = useState({
    enabled: false,
    type: 'manual' as 'daily' | 'weekly' | 'manual',
    isScheduled: false,
    scheduledAt: '',
  });

  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [thumbnailUploading, setThumbnailUploading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const thumbnailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.get('/categories').then(res => setCategories(res.data)).catch(() => {});
  }, []);

  const handleThumbnailUpload = async (file: File) => {
    setThumbnailUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setForm(f => ({ ...f, thumbnailUrl: res.data.url }));
    } catch {
      alert('이미지 업로드 실패');
    } finally {
      setThumbnailUploading(false);
    }
  };

  const addTag = () => {
    const tag = tagInput.trim().replace(/^#/, '');
    if (tag && !form.tags.includes(tag)) setForm(f => ({ ...f, tags: [...f.tags, tag] }));
    setTagInput('');
  };

  const removeTag = (tag: string) => setForm(f => ({ ...f, tags: f.tags.filter(t => t !== tag) }));

  const handleSubmit = async (status: string) => {
    if (!form.title.trim()) { setError('제목을 입력해주세요.'); return; }
    if (!form.content.trim()) { setError('내용을 입력해주세요.'); return; }

    // 뉴스레터 예약 발송인데 뉴스 예약 시간 없으면 체크
    if (newsletterOption.enabled && newsletterOption.isScheduled && !newsletterOption.scheduledAt) {
      setError('뉴스레터 예약 발송 시간을 입력해주세요.'); return;
    }

    setLoading(true); setError('');
    try {
      const res = await api.post('/news', {
        ...form,
        status,
        categoryId: form.categoryId ? +form.categoryId : null,
      });

      // ✅ 뉴스레터 발송 옵션이 켜져있으면 발송 API 호출
      if (newsletterOption.enabled) {
        // 실제 연동 시 주석 해제
        // await api.post('/newsletter/send', {
        //   newsId: res.data.id,
        //   type: newsletterOption.type,
        //   scheduledAt: newsletterOption.isScheduled ? newsletterOption.scheduledAt : null,
        // });
      }

      if (status === 'draft') {
        alert('임시저장 되었습니다.');
      } else if (newsletterOption.enabled) {
        alert(newsletterOption.isScheduled ? '기사가 저장되고 뉴스레터가 예약되었습니다!' : '기사가 발행되고 뉴스레터가 발송되었습니다!');
      } else {
        alert('발행되었습니다!');
      }
      router.push('/admin/news');
    } catch (err: any) {
      setError(err.response?.data?.message || '뉴스 작성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 예상 수신자 수 (목업)
  const estimatedRecipients: Record<string, number> = {
    daily: 128, weekly: 64, manual: 192,
  };

  const typeLabel: Record<string, string> = {
    daily: '데일리 구독자', weekly: '위클리 구독자', manual: '전체 구독자',
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white pb-10">
      <header className="sticky top-0 z-50 bg-gray-950 border-b border-gray-800">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={() => router.push('/mypage')} className="text-gray-400 hover:text-white transition">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <span className="font-bold text-base flex-1">새 뉴스 작성</span>
          <div className="flex gap-2">
            <button onClick={() => router.push('/admin/news')} disabled={loading}
              className="text-sm px-3 py-1.5 border border-gray-700 rounded-lg text-gray-400 hover:text-white transition">
              목록으로
            </button>
            <button onClick={() => handleSubmit('draft')} disabled={loading}
              className="text-sm px-3 py-1.5 border border-blue-700 rounded-lg text-blue-400 hover:text-blue-300 transition disabled:opacity-50">
              임시저장
            </button>
            <button onClick={() => handleSubmit('published')} disabled={loading}
              className="text-sm px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50">
              {loading ? '발행 중...' : '발행'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 flex flex-col gap-5">
        {error && <div className="p-3 bg-red-900 text-red-300 rounded-lg text-sm">{error}</div>}

        {/* 제목 */}
        <input type="text" placeholder="뉴스 제목 입력" value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-base text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* 리드문 */}
        <div>
          <label className="text-xs text-gray-500 mb-1 block">리드문 (기사 요약)</label>
          <textarea placeholder="기사 핵심 내용을 한두 문장으로 요약해주세요" value={form.lead}
            onChange={(e) => setForm({ ...form, lead: e.target.value })} rows={2}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        {/* 카테고리 + 상태 */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">카테고리</label>
            <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">선택</option>
              {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">상태</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500">
              <option value="draft">임시저장</option>
              <option value="review">검토중</option>
              <option value="approved">승인됨</option>
              <option value="published">게시됨</option>
              <option value="scheduled">예약발행</option>
            </select>
          </div>
        </div>

        {/* 예약 발행 시간 */}
        {form.status === 'scheduled' && (
          <div>
            <label className="text-xs text-gray-500 mb-1 block">예약 발행 시간</label>
            <input type="datetime-local" value={form.scheduledAt}
              onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        {/* 썸네일 */}
        <div>
          <label className="text-xs text-gray-500 mb-1 block">썸네일</label>
          {form.thumbnailUrl && (
            <div className="relative mb-2 w-full h-40 rounded-lg overflow-hidden bg-gray-800">
              <img src={form.thumbnailUrl} alt="썸네일" className="w-full h-full object-cover" />
              <button onClick={() => setForm(f => ({ ...f, thumbnailUrl: '' }))}
                className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs transition">✕</button>
            </div>
          )}
          <input type="text" placeholder="이미지 URL 직접 입력" value={form.thumbnailUrl}
            onChange={(e) => setForm({ ...form, thumbnailUrl: e.target.value })}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500 mb-2"
          />
          <input ref={thumbnailRef} type="file" accept="image/*" className="hidden"
            onChange={(e) => { const file = e.target.files?.[0]; if (file) handleThumbnailUpload(file); }}
          />
          <button onClick={() => thumbnailRef.current?.click()} disabled={thumbnailUploading}
            className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-sm text-gray-200 rounded-lg transition disabled:opacity-50">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>
            {thumbnailUploading ? '업로드 중...' : '이미지 파일 업로드'}
          </button>
        </div>

        {/* 태그 */}
        <div>
          <label className="text-xs text-gray-500 mb-1 block">태그</label>
          <div className="flex gap-2 mb-2 flex-wrap">
            {form.tags.map(tag => (
              <span key={tag} className="flex items-center gap-1 bg-gray-700 text-gray-200 text-xs px-2 py-1 rounded-full">
                #{tag}
                <button onClick={() => removeTag(tag)} className="text-gray-400 hover:text-white">×</button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input type="text" placeholder="#태그 입력 후 Enter" value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addTag()}
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button onClick={addTag} className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-sm rounded-lg transition">추가</button>
          </div>
        </div>

        {/* SEO */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 flex flex-col gap-3">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">SEO 설정</div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">URL 슬러그</label>
            <input type="text" placeholder="url-slug" value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">메타 설명 (검색 미리보기)</label>
            <textarea placeholder="검색 결과에 표시될 설명" value={form.metaDescription}
              onChange={(e) => setForm({ ...form, metaDescription: e.target.value })} rows={2}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
        </div>

        {/* 본문 */}
        <div>
          <label className="text-xs text-gray-500 mb-2 block">본문</label>
          <TiptapEditor content={form.content} onChange={(content) => setForm({ ...form, content })} />
        </div>

        {/* ✅ 뉴스레터 발송 옵션 */}
        <div className={`rounded-xl border p-4 flex flex-col gap-4 transition ${
          newsletterOption.enabled ? 'bg-blue-600/10 border-blue-600/30' : 'bg-gray-800 border-gray-700'
        }`}>
          {/* 토글 */}
          <div className="flex justify-between items-center">
            <div>
              <div className="text-sm font-medium text-white">뉴스레터로 발송</div>
              <div className="text-xs text-gray-500 mt-0.5">이 기사를 구독자에게 뉴스레터로 발송합니다</div>
            </div>
            <button
              onClick={() => setNewsletterOption(o => ({ ...o, enabled: !o.enabled }))}
              className={`w-11 h-6 rounded-full flex items-center px-0.5 transition-all duration-200 ${
                newsletterOption.enabled ? 'bg-blue-600 justify-end' : 'bg-gray-700 justify-start'
              }`}
            >
              <div className="w-5 h-5 rounded-full bg-white shadow-sm" />
            </button>
          </div>

          {/* 옵션 펼침 */}
          {newsletterOption.enabled && (
            <div className="flex flex-col gap-4">

              {/* 발송 유형 */}
              <div>
                <label className="text-xs text-gray-400 mb-2 block">발송 대상</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'daily',  label: '데일리 구독자', desc: '매일 수신 동의자', color: 'border-blue-500 bg-blue-500/10 text-blue-400' },
                    { key: 'weekly', label: '위클리 구독자', desc: '매주 수신 동의자', color: 'border-purple-500 bg-purple-500/10 text-purple-400' },
                    { key: 'manual', label: '전체 구독자',   desc: 'ACTIVE + 기간내 CANCELED', color: 'border-emerald-500 bg-emerald-500/10 text-emerald-400' },
                  ].map((item) => (
                    <button
                      key={item.key}
                      onClick={() => setNewsletterOption(o => ({ ...o, type: item.key as any }))}
                      className={`p-3 rounded-xl border-2 text-left transition ${
                        newsletterOption.type === item.key
                          ? item.color
                          : 'border-gray-700 bg-gray-900 text-gray-400'
                      }`}
                    >
                      <div className="text-xs font-medium">{item.label}</div>
                      <div className="text-xs opacity-70 mt-0.5">{item.desc}</div>
                      <div className="text-sm font-bold mt-1">
                        {estimatedRecipients[item.key]}명
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 즉시 / 예약 선택 */}
              <div>
                <label className="text-xs text-gray-400 mb-2 block">발송 시각</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setNewsletterOption(o => ({ ...o, isScheduled: false }))}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition border ${
                      !newsletterOption.isScheduled
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'bg-gray-800 border-gray-700 text-gray-400'
                    }`}
                  >
                    즉시 발송
                  </button>
                  <button
                    onClick={() => setNewsletterOption(o => ({ ...o, isScheduled: true }))}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition border ${
                      newsletterOption.isScheduled
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'bg-gray-800 border-gray-700 text-gray-400'
                    }`}
                  >
                    예약 발송
                  </button>
                </div>

                {newsletterOption.isScheduled && (
                  <input
                    type="datetime-local"
                    value={newsletterOption.scheduledAt}
                    onChange={(e) => setNewsletterOption(o => ({ ...o, scheduledAt: e.target.value }))}
                    className="w-full mt-2 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                )}
              </div>

              {/* 미리보기 버튼 */}
              <button
                onClick={() => setShowPreview(true)}
                disabled={!form.title.trim()}
                className="w-full py-2.5 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition flex items-center justify-center gap-2"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                </svg>
                뉴스레터 미리보기
              </button>

              {/* 발송 요약 */}
              <div className="bg-gray-900 rounded-xl p-3 flex flex-col gap-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">발송 대상</span>
                  <span className="text-white">{typeLabel[newsletterOption.type]}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">예상 수신자</span>
                  <span className="text-blue-400 font-medium">{estimatedRecipients[newsletterOption.type]}명</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">발송 시각</span>
                  <span className="text-white">
                    {newsletterOption.isScheduled
                      ? newsletterOption.scheduledAt || '미설정'
                      : '기사 발행 즉시'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* 뉴스레터 미리보기 모달 */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4 overflow-y-auto py-10">
          <div className="bg-white rounded-2xl w-full max-w-lg">

            {/* 모달 헤더 */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
              <span className="font-bold text-gray-800 text-sm">뉴스레터 미리보기</span>
              <button onClick={() => setShowPreview(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {/* 뉴스레터 템플릿 */}
            <div className="px-6 py-6">
              {/* 헤더 */}
              <div className="text-center mb-6">
                <div className="text-xs text-gray-400 mb-1">TechLetter</div>
                <div className="text-xs text-gray-400">
                  {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
              </div>

              {/* 썸네일 */}
              {form.thumbnailUrl && (
                <img src={form.thumbnailUrl} alt="썸네일"
                  className="w-full h-48 object-cover rounded-xl mb-4" />
              )}

              {/* 제목 */}
              <h1 className="text-xl font-bold text-gray-900 mb-3 leading-tight">
                {form.title || '뉴스 제목'}
              </h1>

              {/* 리드문 */}
              {form.lead && (
                <p className="text-sm text-gray-600 leading-relaxed mb-4 pb-4 border-b border-gray-100">
                  {form.lead}
                </p>
              )}

              {/* 본문 일부 */}
              <div className="text-sm text-gray-700 leading-relaxed mb-4"
                dangerouslySetInnerHTML={{
                  __html: form.content
                    ? form.content.replace(/<[^>]*>/g, ' ').slice(0, 200) + (form.content.length > 200 ? '...' : '')
                    : '본문 내용이 여기에 표시됩니다.'
                }}
              />

              {/* 원문 링크 버튼 */}
              <div className="text-center mb-6">
                <div className="inline-block px-6 py-3 bg-blue-600 text-white text-sm font-bold rounded-xl">
                  전체 기사 읽기 →
                </div>
              </div>

              {/* 발송 정보 */}
              <div className="bg-gray-50 rounded-xl p-3 flex flex-col gap-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">발송 대상</span>
                  <span className="text-gray-700 font-medium">{typeLabel[newsletterOption.type]}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">예상 수신자</span>
                  <span className="text-blue-600 font-bold">{estimatedRecipients[newsletterOption.type]}명</span>
                </div>
              </div>

              {/* 수신 거부 */}
              <div className="text-center mt-4">
                <span className="text-xs text-gray-400">수신을 원하지 않으시면 </span>
                <span className="text-xs text-blue-500 underline cursor-pointer">여기</span>
                <span className="text-xs text-gray-400">를 클릭하세요.</span>
              </div>
            </div>

            {/* 모달 하단 버튼 */}
            <div className="flex gap-3 px-6 pb-6">
              <button
                onClick={() => setShowPreview(false)}
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-medium transition"
              >
                닫기
              </button>
              <button
                onClick={() => { setShowPreview(false); handleSubmit('published'); }}
                disabled={loading}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-sm font-bold transition"
              >
                {loading ? '발행 중...' : newsletterOption.isScheduled ? '기사 저장 + 예약 발송' : '기사 발행 + 즉시 발송'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
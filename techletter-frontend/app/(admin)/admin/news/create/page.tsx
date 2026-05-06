'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import TiptapEditor from '@/components/editor/TiptapEditor';

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface AiSeoResult {
  score: number;
  items: { label: string; ok: boolean; suggestion: string }[];
  keywords: string[];
  titleSuggestions: string[];
  metaSuggestion: string;
  readabilityNote: string;
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 60);
}

function calcBasicSeo(form: any) {
  const contentText = form.content.replace(/<[^>]*>/g, '');
  const hasH2 = form.content.includes('<h2') || form.content.includes('<h3');
  return [
    { label: '제목 길이 (10~60자)',       ok: form.title.length >= 10 && form.title.length <= 60,    suggestion: '제목을 10~60자 사이로 작성해주세요.' },
    { label: '메타 설명 (50~160자)',      ok: form.metaDescription.length >= 50,                      suggestion: '메타 설명을 50자 이상 입력해주세요.' },
    { label: 'URL 슬러그 입력',           ok: form.slug.length > 0,                                   suggestion: 'URL 슬러그를 입력해주세요.' },
    { label: '태그 3개 이상',             ok: form.tags.length >= 3,                                  suggestion: '태그를 3개 이상 추가해주세요.' },
    { label: '본문 500자 이상',           ok: contentText.length >= 500,                              suggestion: `현재 ${contentText.length}자, 500자 이상 작성을 권장합니다.` },
    { label: '썸네일 이미지 등록',        ok: form.thumbnailUrl.length > 0,                           suggestion: '썸네일 이미지를 등록해주세요.' },
    { label: '리드문 입력',               ok: form.lead.length > 0,                                   suggestion: '리드문을 입력해주세요.' },
    { label: '소제목(H2/H3) 포함',        ok: hasH2,                                                  suggestion: '본문에 소제목을 추가하면 가독성이 향상됩니다.' },
  ];
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

  const [premiumContent, setPremiumContent] = useState({
    keyPoints: [''],
    editorComment: '',
    relatedLinks: [{ title: '', url: '' }],
  });

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
  const [previewMode, setPreviewMode] = useState<'pc' | 'mobile'>('pc');
  const thumbnailRef = useRef<HTMLInputElement>(null);

  // 자동 임시저장
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsaved, setHasUnsaved] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);

  // AI 패널
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const [aiSeoResult, setAiSeoResult] = useState<AiSeoResult | null>(null);
  const [aiGeneratedContents, setAiGeneratedContents] = useState<{
    titles: string[];
    lead: string;
    tags: string[];
    meta: string;
    keyPoints: string[];
    newsletterSummary: string;
    styleNote: string;
  }>({
    titles: [], lead: '', tags: [], meta: '',
    keyPoints: [], newsletterSummary: '', styleNote: '',
  });

  // 예상 수신자
  const [estimatedRecipients, setEstimatedRecipients] = useState<Record<string, number>>({
    daily: 0, weekly: 0, manual: 0,
  });

  const typeLabel: Record<string, string> = {
    daily: '데일리 구독자', weekly: '위클리 구독자', manual: '전체 구독자',
  };

  const basicSeoItems = calcBasicSeo(form);
  const basicSeoScore = Math.round(
    (basicSeoItems.filter(i => i.ok).length / basicSeoItems.length) * 100
  );

  useEffect(() => {
    api.get('/categories').then(res => setCategories(res.data)).catch(() => {});
    const saved = localStorage.getItem('news_draft');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (confirm('이전에 작성 중인 내용이 있어요. 복구할까요?')) {
          setForm(parsed.form);
          if (parsed.premiumContent) setPremiumContent(parsed.premiumContent);
          if (parsed.newsletterOption) setNewsletterOption(parsed.newsletterOption);
        }
        localStorage.removeItem('news_draft');
      } catch {}
    }
  }, []);

  useEffect(() => { setHasUnsaved(true); }, [form, premiumContent, newsletterOption]);

  useEffect(() => {
    if (!hasUnsaved || !form.title) return;
    const timer = setTimeout(() => {
      setAutoSaving(true);
      localStorage.setItem('news_draft', JSON.stringify({ form, premiumContent, newsletterOption }));
      setLastSaved(new Date());
      setHasUnsaved(false);
      setAutoSaving(false);
    }, 30000);
    return () => clearTimeout(timer);
  }, [hasUnsaved, form, premiumContent, newsletterOption]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsaved && form.title) { e.preventDefault(); e.returnValue = ''; }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsaved, form.title]);

  useEffect(() => {
    if (!newsletterOption.enabled) return;
    api.get(`/newsletter/estimated-recipients?type=${newsletterOption.type}`)
      .then(res => setEstimatedRecipients(prev => ({ ...prev, [newsletterOption.type]: res.data.count })))
      .catch(() => {});
  }, [newsletterOption.enabled, newsletterOption.type]);

  const handleTitleChange = (title: string) => {
    setForm(f => ({ ...f, title, slug: f.slug ? f.slug : generateSlug(title) }));
  };

  const handleThumbnailUpload = async (file: File) => {
    setThumbnailUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post('/upload/image', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setForm(f => ({ ...f, thumbnailUrl: res.data.url }));
    } catch { alert('이미지 업로드 실패'); }
    finally { setThumbnailUploading(false); }
  };

  const addTag = () => {
    const tag = tagInput.trim().replace(/^#/, '');
    if (tag && !form.tags.includes(tag)) setForm(f => ({ ...f, tags: [...f.tags, tag] }));
    setTagInput('');
  };
  const removeTag = (tag: string) => setForm(f => ({ ...f, tags: f.tags.filter(t => t !== tag) }));

  const handleManualSave = () => {
    localStorage.setItem('news_draft', JSON.stringify({ form, premiumContent, newsletterOption }));
    setLastSaved(new Date());
    setHasUnsaved(false);
    alert('임시저장 되었습니다.');
  };

  const handleSubmit = async (status: string) => {
    if (!form.title.trim()) { setError('제목을 입력해주세요.'); return; }
    if (!form.content.trim()) { setError('내용을 입력해주세요.'); return; }
    if (newsletterOption.enabled && newsletterOption.isScheduled && !newsletterOption.scheduledAt) {
      setError('뉴스레터 예약 발송 시간을 입력해주세요.'); return;
    }
    setLoading(true); setError('');
    try {
      const res = await api.post('/news', { ...form, status, categoryId: form.categoryId ? +form.categoryId : null });
      if (newsletterOption.enabled && status !== 'draft') {
        await api.post('/newsletter/send', {
          title: form.title, newsId: res.data.id, type: newsletterOption.type,
          scheduledAt: newsletterOption.isScheduled ? newsletterOption.scheduledAt : null,
        });
      }
      localStorage.removeItem('news_draft');
      setHasUnsaved(false);
      if (status === 'draft') alert('임시저장 되었습니다.');
      else if (newsletterOption.enabled) alert(newsletterOption.isScheduled ? '기사 저장 + 뉴스레터 예약 완료!' : '기사 발행 + 뉴스레터 발송 완료!');
      else alert('발행되었습니다!');
      router.push('/admin/news');
    } catch (err: any) {
      setError(err.response?.data?.message || '뉴스 작성에 실패했습니다.');
    } finally { setLoading(false); }
  };

  // ✅ AI 통합 분석 (SEO + 모든 보조 기능 한번에)
  const handleAiAnalyze = async () => {
    if (!form.title && !form.content) { alert('제목 또는 본문을 입력해주세요.'); return; }
    setAiLoading('analyze');
    const contentText = form.content.replace(/<[^>]*>/g, '').slice(0, 1000);
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: `다음 뉴스 기사를 분석하여 JSON 형식으로만 응답해주세요. 다른 텍스트는 절대 포함하지 마세요.

제목: ${form.title || '(미입력)'}
본문: ${contentText || '(미입력)'}
현재 태그: ${form.tags.join(', ') || '(없음)'}

다음 JSON 구조로 응답하세요:
{
  "seoScore": 75,
  "seoItems": [
    {"label": "제목이 검색 친화적입니다", "ok": true, "suggestion": ""},
    {"label": "키워드가 본문에 적절히 분포되어 있습니다", "ok": true, "suggestion": ""},
    {"label": "소제목 추가를 권장합니다", "ok": false, "suggestion": "H2 태그로 소제목을 2~3개 추가하면 가독성과 SEO가 향상됩니다"},
    {"label": "키워드 반복 빈도가 적절합니다", "ok": true, "suggestion": ""},
    {"label": "검색 노출 가능성이 높습니다", "ok": false, "suggestion": "롱테일 키워드를 제목에 포함시켜 보세요"}
  ],
  "keywords": ["핵심키워드1", "핵심키워드2", "핵심키워드3"],
  "titleSuggestions": ["추천제목1", "추천제목2", "추천제목3"],
  "metaSuggestion": "SEO에 최적화된 메타 설명 (50~160자)",
  "lead": "2문장 이내의 리드문",
  "tags": ["태그1", "태그2", "태그3", "태그4", "태그5"],
  "keyPoints": ["핵심포인트1", "핵심포인트2", "핵심포인트3"],
  "newsletterSummary": "뉴스레터용 2~3문장 요약",
  "styleNote": "문체 및 가독성 분석 결과 한 문장",
  "readabilityNote": "본문 구조 개선 제안 한 문장"
}`
          }],
        }),
      });
      const data = await response.json();
      const text = data.content?.[0]?.text || '{}';
      const clean = text.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(clean);

      setAiSeoResult({
        score: parsed.seoScore || 0,
        items: parsed.seoItems || [],
        keywords: parsed.keywords || [],
        titleSuggestions: parsed.titleSuggestions || [],
        metaSuggestion: parsed.metaSuggestion || '',
        readabilityNote: parsed.readabilityNote || '',
      });
      setAiGeneratedContents({
        titles: parsed.titleSuggestions || [],
        lead: parsed.lead || '',
        tags: parsed.tags || [],
        meta: parsed.metaSuggestion || '',
        keyPoints: parsed.keyPoints || [],
        newsletterSummary: parsed.newsletterSummary || '',
        styleNote: parsed.styleNote || '',
      });
    } catch (err) {
      alert('AI 분석 중 오류가 발생했습니다.');
    } finally {
      setAiLoading(null);
    }
  };

  const seoScore = aiSeoResult?.score ?? basicSeoScore;
  const seoItems = aiSeoResult?.items.length ? aiSeoResult.items : basicSeoItems;
  const seoColor = seoScore >= 80 ? 'text-emerald-400' : seoScore >= 50 ? 'text-yellow-400' : 'text-red-400';
  const seoBarColor = seoScore >= 80 ? 'bg-emerald-500' : seoScore >= 50 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="min-h-screen transition-colors duration-200 pb-10">
      <header className="sticky top-0 z-50 bg-gray-950 border-b border-gray-800">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={() => {
            if (hasUnsaved && form.title && !confirm('저장하지 않은 내용이 있어요. 이동할까요?')) return;
            router.push('/mypage');
          }} className="text-gray-400 hover:text-white transition">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <span className="font-bold text-base flex-1">새 뉴스 작성</span>

          {/* 저장 상태 */}
          <div className="text-xs text-gray-500 flex items-center gap-1">
            {autoSaving ? (
              <><svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>저장 중...</>
            ) : lastSaved ? `${lastSaved.getHours()}:${String(lastSaved.getMinutes()).padStart(2, '0')} 저장됨`
            : hasUnsaved && form.title ? <span className="text-yellow-500">● 미저장</span> : null}
          </div>

          {/* AI 패널 토글 */}
          <button onClick={() => setShowAiPanel(!showAiPanel)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              showAiPanel ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}>
            ✨ AI 보조
          </button>

          <div className="flex gap-2">
            <button onClick={() => router.push('/admin/news')} disabled={loading}
              className="text-sm px-3 py-1.5 border border-gray-700 rounded-lg text-gray-400 hover:text-white transition">
              목록으로
            </button>
            <button onClick={handleManualSave} disabled={loading}
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

      <div className={`max-w-5xl mx-auto px-4 py-6 flex gap-6 ${showAiPanel ? '' : 'justify-center'}`}>

        {/* 메인 에디터 */}
        <main className={`flex flex-col gap-5 ${showAiPanel ? 'flex-1 min-w-0' : 'w-full max-w-3xl'}`}>
          {error && <div className="p-3 bg-red-900 text-red-300 rounded-lg text-sm">{error}</div>}

          {/* 제목 */}
          <div>
            <input type="text" placeholder="뉴스 제목 입력" value={form.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-base text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex justify-between mt-1">
              <span className="text-xs text-gray-600">{form.title.length}/60자</span>
              {form.title.length > 60 && <span className="text-xs text-red-400">제목이 너무 길어요</span>}
            </div>
          </div>

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
                <option value="review">검토 요청</option>
                <option value="approved">승인 완료</option>
                <option value="published">게시 완료</option>
                <option value="scheduled">예약 게시</option>
              </select>
            </div>
          </div>

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
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">SEO 설정</div>
              <div className="flex items-center gap-2">
                {aiSeoResult && <span className="text-xs text-purple-400">✨ AI 분석</span>}
                <div className="w-24 bg-gray-700 rounded-full h-1.5">
                  <div className={`h-1.5 rounded-full transition-all ${seoBarColor}`} style={{ width: `${seoScore}%` }} />
                </div>
                <span className={`text-xs font-bold ${seoColor}`}>{seoScore}점</span>
              </div>
            </div>

            {/* SEO 체크리스트 */}
            <div className="flex flex-col gap-1.5">
              {seoItems.map((item, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className={`text-xs mt-0.5 ${item.ok ? 'text-emerald-400' : 'text-red-400'}`}>
                    {item.ok ? '✓' : '✗'}
                  </span>
                  <div className="flex-1">
                    <span className={`text-xs ${item.ok ? 'text-gray-300' : 'text-gray-500'}`}>{item.label}</span>
                    {!item.ok && item.suggestion && (
                      <p className="text-xs text-gray-600 mt-0.5">{item.suggestion}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* AI 키워드 */}
            {aiSeoResult?.keywords.length ? (
              <div>
                <div className="text-xs text-gray-500 mb-1">핵심 키워드</div>
                <div className="flex gap-1 flex-wrap">
                  {aiSeoResult.keywords.map((kw, i) => (
                    <span key={i} className="text-xs px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded-full">{kw}</span>
                  ))}
                </div>
              </div>
            ) : null}

            {/* 가독성 메모 */}
            {aiSeoResult?.readabilityNote && (
              <div className="bg-gray-900 rounded-lg p-2">
                <p className="text-xs text-gray-400">💡 {aiSeoResult.readabilityNote}</p>
              </div>
            )}

            <div>
              <label className="text-xs text-gray-500 mb-1 block">URL 슬러그</label>
              <input type="text" placeholder="url-slug" value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">메타 설명 ({form.metaDescription.length}/160자)</label>
              <textarea placeholder="검색 결과에 표시될 설명 (50~160자)" value={form.metaDescription}
                onChange={(e) => setForm({ ...form, metaDescription: e.target.value })} rows={2}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          </div>

          {/* 본문 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-gray-500">본문 ({form.content.replace(/<[^>]*>/g, '').length}자)</label>
            </div>
            <TiptapEditor content={form.content} onChange={(content) => setForm({ ...form, content })} />
          </div>

          {/* 구독자 전용 콘텐츠 */}
          <div className="bg-gray-800 border border-yellow-600/30 rounded-xl p-4 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded-full font-medium">구독자 전용</span>
              <span className="text-xs text-gray-500">뉴스레터에만 포함되는 추가 콘텐츠</span>
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-2 block">핵심 포인트</label>
              <div className="flex flex-col gap-2">
                {premiumContent.keyPoints.map((point, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <span className="text-xs text-yellow-400 font-bold w-4">{i + 1}</span>
                    <input type="text" value={point}
                      onChange={(e) => {
                        const updated = [...premiumContent.keyPoints];
                        updated[i] = e.target.value;
                        setPremiumContent(p => ({ ...p, keyPoints: updated }));
                      }}
                      placeholder={`핵심 포인트 ${i + 1}`}
                      className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 outline-none focus:ring-2 focus:ring-yellow-500"
                    />
                    {premiumContent.keyPoints.length > 1 && (
                      <button onClick={() => setPremiumContent(p => ({
                        ...p, keyPoints: p.keyPoints.filter((_, idx) => idx !== i)
                      }))} className="text-gray-600 hover:text-red-400 text-sm">×</button>
                    )}
                  </div>
                ))}
                <button onClick={() => setPremiumContent(p => ({ ...p, keyPoints: [...p.keyPoints, ''] }))}
                  className="text-xs text-gray-500 hover:text-white transition text-left">+ 포인트 추가</button>
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">에디터 코멘트</label>
              <textarea value={premiumContent.editorComment}
                onChange={(e) => setPremiumContent(p => ({ ...p, editorComment: e.target.value }))}
                placeholder="구독자에게 전하는 에디터의 한마디..." rows={2}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 outline-none focus:ring-2 focus:ring-yellow-500 resize-none"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-2 block">추천 링크</label>
              <div className="flex flex-col gap-2">
                {premiumContent.relatedLinks.map((link, i) => (
                  <div key={i} className="flex gap-2">
                    <input type="text" value={link.title}
                      onChange={(e) => {
                        const updated = [...premiumContent.relatedLinks];
                        updated[i] = { ...updated[i], title: e.target.value };
                        setPremiumContent(p => ({ ...p, relatedLinks: updated }));
                      }}
                      placeholder="링크 제목"
                      className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 outline-none focus:ring-2 focus:ring-yellow-500"
                    />
                    <input type="text" value={link.url}
                      onChange={(e) => {
                        const updated = [...premiumContent.relatedLinks];
                        updated[i] = { ...updated[i], url: e.target.value };
                        setPremiumContent(p => ({ ...p, relatedLinks: updated }));
                      }}
                      placeholder="https://"
                      className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 outline-none focus:ring-2 focus:ring-yellow-500"
                    />
                    {premiumContent.relatedLinks.length > 1 && (
                      <button onClick={() => setPremiumContent(p => ({
                        ...p, relatedLinks: p.relatedLinks.filter((_, idx) => idx !== i)
                      }))} className="text-gray-600 hover:text-red-400 text-sm">×</button>
                    )}
                  </div>
                ))}
                <button onClick={() => setPremiumContent(p => ({ ...p, relatedLinks: [...p.relatedLinks, { title: '', url: '' }] }))}
                  className="text-xs text-gray-500 hover:text-white transition text-left">+ 링크 추가</button>
              </div>
            </div>
          </div>

          {/* 뉴스레터 발송 옵션 */}
          <div className={`rounded-xl border p-4 flex flex-col gap-4 transition ${
            newsletterOption.enabled ? 'bg-blue-600/10 border-blue-600/30' : 'bg-gray-800 border-gray-700'
          }`}>
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm font-medium text-white">뉴스레터로 발송</div>
                <div className="text-xs text-gray-500 mt-0.5">기사 발행과 독립적으로 발송 시간 설정 가능</div>
              </div>
              <button onClick={() => setNewsletterOption(o => ({ ...o, enabled: !o.enabled }))}
                className={`w-11 h-6 rounded-full flex items-center px-0.5 transition-all duration-200 ${
                  newsletterOption.enabled ? 'bg-blue-600 justify-end' : 'bg-gray-700 justify-start'
                }`}>
                <div className="w-5 h-5 rounded-full bg-white shadow-sm" />
              </button>
            </div>
            {newsletterOption.enabled && (
              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-2 block">발송 대상</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { key: 'daily',  label: '데일리', desc: '매일 수신 동의자',       color: 'border-blue-500 bg-blue-500/10 text-blue-400' },
                      { key: 'weekly', label: '위클리', desc: '매주 수신 동의자',       color: 'border-purple-500 bg-purple-500/10 text-purple-400' },
                      { key: 'manual', label: '전체',   desc: 'ACTIVE+기간내CANCELED', color: 'border-emerald-500 bg-emerald-500/10 text-emerald-400' },
                    ].map((item) => (
                      <button key={item.key} onClick={() => setNewsletterOption(o => ({ ...o, type: item.key as any }))}
                        className={`p-3 rounded-xl border-2 text-left transition ${
                          newsletterOption.type === item.key ? item.color : 'border-gray-700 bg-gray-900 text-gray-400'
                        }`}>
                        <div className="text-xs font-medium">{item.label}</div>
                        <div className="text-xs opacity-70 mt-0.5">{item.desc}</div>
                        <div className="text-sm font-bold mt-1">{estimatedRecipients[item.key]}명</div>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-2 block">발송 시각</label>
                  <div className="flex gap-2">
                    <button onClick={() => setNewsletterOption(o => ({ ...o, isScheduled: false }))}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition border ${
                        !newsletterOption.isScheduled ? 'bg-blue-600 border-blue-600 text-white' : 'bg-gray-800 border-gray-700 text-gray-400'
                      }`}>즉시 발송</button>
                    <button onClick={() => setNewsletterOption(o => ({ ...o, isScheduled: true }))}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition border ${
                        newsletterOption.isScheduled ? 'bg-blue-600 border-blue-600 text-white' : 'bg-gray-800 border-gray-700 text-gray-400'
                      }`}>예약 발송</button>
                  </div>
                  {newsletterOption.isScheduled && (
                    <input type="datetime-local" value={newsletterOption.scheduledAt}
                      onChange={(e) => setNewsletterOption(o => ({ ...o, scheduledAt: e.target.value }))}
                      className="w-full mt-2 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                  )}
                </div>
                <button onClick={() => setShowPreview(true)} disabled={!form.title.trim()}
                  className="w-full py-2.5 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition flex items-center justify-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                  뉴스레터 미리보기
                </button>
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
                      {newsletterOption.isScheduled ? newsletterOption.scheduledAt || '미설정' : '기사 발행 즉시'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* ✅ AI 보조 패널 */}
        {showAiPanel && (
          <aside className="w-80 flex-shrink-0 flex flex-col gap-4 sticky top-20 h-fit max-h-[calc(100vh-5rem)] overflow-y-auto">
            <div className="bg-gray-900 border border-purple-600/30 rounded-2xl p-4 flex flex-col gap-4">

              {/* 헤더 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">✨ AI 작성 보조</span>
                </div>
                <button onClick={handleAiAnalyze} disabled={!!aiLoading}
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition flex items-center gap-1">
                  {aiLoading === 'analyze' ? (
                    <><svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>분석 중...</>
                  ) : '전체 분석'}
                </button>
              </div>

              <p className="text-xs text-gray-500">제목 또는 본문 입력 후 전체 분석을 실행하면 AI가 SEO, 제목, 태그, 리드문 등을 한번에 분석해드려요.</p>

              {/* AI 결과가 없을 때 */}
              {!aiSeoResult && !aiLoading && (
                <div className="text-center py-6 text-gray-600 text-xs">
                  아직 분석 결과가 없어요.<br />전체 분석 버튼을 눌러주세요!
                </div>
              )}

              {aiLoading === 'analyze' && (
                <div className="text-center py-6">
                  <svg className="animate-spin w-6 h-6 mx-auto text-purple-400 mb-2" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  <p className="text-xs text-gray-500">AI가 기사를 분석하고 있어요...</p>
                </div>
              )}

              {aiSeoResult && !aiLoading && (
                <>
                  {/* 제목 추천 */}
                  {aiGeneratedContents.titles.length > 0 && (
                    <div className="border-t border-gray-800 pt-4">
                      <div className="text-xs font-medium text-gray-400 mb-2">📌 제목 추천</div>
                      <div className="flex flex-col gap-2">
                        {aiGeneratedContents.titles.map((title, i) => (
                          <div key={i} className="bg-gray-800 rounded-lg p-2.5 flex justify-between items-start gap-2">
                            <p className="text-xs text-gray-300 flex-1 leading-relaxed">{title}</p>
                            <button onClick={() => setForm(f => ({ ...f, title, slug: generateSlug(title) }))}
                              className="text-xs text-blue-400 hover:text-blue-300 transition flex-shrink-0">
                              적용
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 리드문 */}
                  {aiGeneratedContents.lead && (
                    <div className="border-t border-gray-800 pt-4">
                      <div className="text-xs font-medium text-gray-400 mb-2">📝 리드문 추천</div>
                      <div className="bg-gray-800 rounded-lg p-2.5 flex justify-between items-start gap-2">
                        <p className="text-xs text-gray-300 flex-1 leading-relaxed">{aiGeneratedContents.lead}</p>
                        <button onClick={() => setForm(f => ({ ...f, lead: aiGeneratedContents.lead }))}
                          className="text-xs text-blue-400 hover:text-blue-300 transition flex-shrink-0">
                          적용
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 태그 추천 */}
                  {aiGeneratedContents.tags.length > 0 && (
                    <div className="border-t border-gray-800 pt-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-xs font-medium text-gray-400">🏷️ 태그 추천</div>
                        <button onClick={() => {
                          const newTags = aiGeneratedContents.tags.filter(t => !form.tags.includes(t));
                          setForm(f => ({ ...f, tags: [...f.tags, ...newTags] }));
                        }} className="text-xs text-blue-400 hover:text-blue-300 transition">전체 추가</button>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {aiGeneratedContents.tags.map((tag, i) => (
                          <button key={i}
                            onClick={() => { if (!form.tags.includes(tag)) setForm(f => ({ ...f, tags: [...f.tags, tag] })); }}
                            className={`text-xs px-2 py-0.5 rounded-full transition ${
                              form.tags.includes(tag)
                                ? 'bg-emerald-500/20 text-emerald-400 cursor-default'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}>
                            #{tag} {form.tags.includes(tag) ? '✓' : '+'}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 메타 설명 */}
                  {aiGeneratedContents.meta && (
                    <div className="border-t border-gray-800 pt-4">
                      <div className="text-xs font-medium text-gray-400 mb-2">🔍 메타 설명 추천</div>
                      <div className="bg-gray-800 rounded-lg p-2.5 flex justify-between items-start gap-2">
                        <p className="text-xs text-gray-300 flex-1 leading-relaxed">{aiGeneratedContents.meta}</p>
                        <button onClick={() => setForm(f => ({ ...f, metaDescription: aiGeneratedContents.meta }))}
                          className="text-xs text-blue-400 hover:text-blue-300 transition flex-shrink-0">
                          적용
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 핵심 포인트 */}
                  {aiGeneratedContents.keyPoints.length > 0 && (
                    <div className="border-t border-gray-800 pt-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-xs font-medium text-gray-400">⭐ 핵심 포인트</div>
                        <button onClick={() => setPremiumContent(p => ({ ...p, keyPoints: aiGeneratedContents.keyPoints }))}
                          className="text-xs text-blue-400 hover:text-blue-300 transition">적용</button>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        {aiGeneratedContents.keyPoints.map((point, i) => (
                          <div key={i} className="flex gap-2 text-xs text-gray-400">
                            <span className="text-yellow-400 font-bold">{i + 1}.</span>
                            <span>{point}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 뉴스레터 요약 */}
                  {aiGeneratedContents.newsletterSummary && (
                    <div className="border-t border-gray-800 pt-4">
                      <div className="text-xs font-medium text-gray-400 mb-2">📧 뉴스레터 요약</div>
                      <div className="bg-gray-800 rounded-lg p-2.5 flex justify-between items-start gap-2">
                        <p className="text-xs text-gray-300 flex-1 leading-relaxed">{aiGeneratedContents.newsletterSummary}</p>
                        <button onClick={() => setForm(f => ({ ...f, lead: aiGeneratedContents.newsletterSummary }))}
                          className="text-xs text-blue-400 hover:text-blue-300 transition flex-shrink-0">
                          리드문에 적용
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 문체 분석 */}
                  {aiGeneratedContents.styleNote && (
                    <div className="border-t border-gray-800 pt-4">
                      <div className="text-xs font-medium text-gray-400 mb-2">✍️ 문체 분석</div>
                      <div className="bg-gray-800 rounded-lg p-2.5">
                        <p className="text-xs text-gray-400 leading-relaxed">{aiGeneratedContents.styleNote}</p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </aside>
        )}
      </div>

      {/* 뉴스레터 미리보기 모달 */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4 overflow-y-auto py-10">
          <div className="w-full max-w-2xl">
            <div className="flex justify-center gap-2 mb-4">
              <button onClick={() => setPreviewMode('pc')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition ${previewMode === 'pc' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
                💻 PC
              </button>
              <button onClick={() => setPreviewMode('mobile')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition ${previewMode === 'mobile' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
                📱 모바일
              </button>
            </div>
            <div className={`bg-white rounded-2xl mx-auto transition-all ${previewMode === 'mobile' ? 'max-w-sm' : 'max-w-2xl'}`}>
              <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
                <span className="font-bold text-gray-800 text-sm">뉴스레터 미리보기</span>
                <button onClick={() => setShowPreview(false)}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
              <div className="px-6 py-6">
                <div className="text-center mb-6">
                  <div className="text-xs text-gray-400 mb-1">TechLetter</div>
                  <div className="text-xs text-gray-400">
                    {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                </div>
                {form.thumbnailUrl && (
                  <img src={form.thumbnailUrl} alt="썸네일" className="w-full h-48 object-cover rounded-xl mb-4" />
                )}
                <h1 className={`font-bold text-gray-900 mb-3 leading-tight ${previewMode === 'mobile' ? 'text-lg' : 'text-xl'}`}>
                  {form.title || '뉴스 제목'}
                </h1>
                {form.lead && (
                  <p className="text-sm text-gray-600 leading-relaxed mb-4 pb-4 border-b border-gray-100">{form.lead}</p>
                )}
                <div className="text-sm text-gray-700 leading-relaxed mb-4"
                  dangerouslySetInnerHTML={{
                    __html: form.content
                      ? form.content.replace(/<[^>]*>/g, ' ').slice(0, 200) + (form.content.length > 200 ? '...' : '')
                      : '본문 내용이 여기에 표시됩니다.'
                  }}
                />
                {premiumContent.keyPoints.some(p => p.trim()) && (
                  <div className="bg-yellow-50 rounded-xl p-4 mb-4">
                    <div className="text-xs font-bold text-yellow-700 mb-2">✨ 핵심 포인트 (구독자 전용)</div>
                    {premiumContent.keyPoints.filter(p => p.trim()).map((point, i) => (
                      <div key={i} className="flex gap-2 text-sm text-gray-700 mb-1">
                        <span className="text-yellow-500 font-bold">{i + 1}.</span>
                        <span>{point}</span>
                      </div>
                    ))}
                  </div>
                )}
                {premiumContent.editorComment && (
                  <div className="bg-gray-50 rounded-xl p-4 mb-4 border-l-4 border-blue-400">
                    <div className="text-xs font-bold text-gray-500 mb-1">에디터 코멘트</div>
                    <p className="text-sm text-gray-700 italic">{premiumContent.editorComment}</p>
                  </div>
                )}
                <div className="text-center mb-6">
                  <div className="inline-block px-6 py-3 bg-blue-600 text-white text-sm font-bold rounded-xl">
                    전체 기사 읽기 →
                  </div>
                </div>
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
                <div className="text-center mt-4">
                  <span className="text-xs text-gray-400">수신을 원하지 않으시면 </span>
                  <span className="text-xs text-blue-500 underline cursor-pointer">여기</span>
                  <span className="text-xs text-gray-400">를 클릭하세요.</span>
                </div>
              </div>
              <div className="flex gap-3 px-6 pb-6">
                <button onClick={() => setShowPreview(false)}
                  className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-medium transition">
                  닫기
                </button>
                <button onClick={() => { setShowPreview(false); handleSubmit('published'); }} disabled={loading}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-sm font-bold transition">
                  {loading ? '발행 중...' : newsletterOption.isScheduled ? '기사 저장 + 예약 발송' : '기사 발행 + 즉시 발송'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

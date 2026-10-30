import React, { useEffect, useState } from 'react';
import { ArrowLeft, Play, Plus, X, Youtube, Link as LinkIcon, AlertCircle, CheckCircle2, Film } from 'lucide-react';
import { getText, loadSavedTexts } from './siteTexts';
import { fetchSiteContent, loadCachedData } from './siteStore';

type Video = {
  id: number;
  youtubeId: string;
  title: string;
  author: string;
  description: string;
  createdAt: string;
};

// Mirrors the server-side parser so the preview matches what will be saved
function extractYoutubeId(input: string): string | null {
  const value = input.trim();
  if (!value) return null;
  if (/^[\w-]{11}$/.test(value)) return value;
  try {
    const url = new URL(value.startsWith('http') ? value : `https://${value}`);
    const host = url.hostname.replace(/^(www\.|m\.|music\.)/, '');
    let id: string | null = null;
    if (host === 'youtu.be') {
      id = url.pathname.split('/')[1] || null;
    } else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
      id = url.searchParams.get('v');
      if (!id) {
        const match = url.pathname.match(/^\/(?:embed|shorts|live|v)\/([\w-]{11})/);
        id = match ? match[1] : null;
      }
    }
    return id && /^[\w-]{11}$/.test(id) ? id : null;
  } catch {
    return null;
  }
}

const thumb = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

function formatDate(value: string) {
  const d = new Date(value);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

export default function VideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [form, setForm] = useState({ url: '', title: '', author: '', description: '' });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [playing, setPlaying] = useState<Video | null>(null);

  const previewId = extractYoutubeId(form.url);
  const [texts, setTexts] = useState<Record<string, string> | undefined>(
    () => loadCachedData()?.texts ?? loadSavedTexts()
  );
  const t = (key: string) => getText(texts, key);
  const title = t('videosTitle');
  const highlight = t('videosTitleHighlight');
  const highlightAt = highlight ? title.indexOf(highlight) : -1;

  useEffect(() => {
    fetchSiteContent()
      .then((data) => data?.texts && setTexts(data.texts))
      .catch(() => {});
  }, []);

  useEffect(() => {
    document.title = '영상 갤러리 | 청송 못난이 사과 축제 2026';
    fetch('/api/videos')
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(setVideos)
      .catch(() => setLoadError('영상 목록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!playing) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setPlaying(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [playing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!previewId) {
      setFormError('올바른 유튜브 링크를 입력해주세요.');
      return;
    }
    if (!form.title.trim()) {
      setFormError('영상 제목을 입력해주세요.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || '영상 등록에 실패했습니다.');
      setVideos((prev) => [body, ...prev]);
      setForm({ url: '', title: '', author: '', description: '' });
      setToast('🎬 영상이 갤러리에 등록되었습니다!');
      setTimeout(() => setToast(null), 3500);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : '영상 등록에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    'w-full px-4 py-3 rounded-xl border border-black/10 bg-white text-sm text-[#1A291E] placeholder:text-black/35 focus:outline-none focus:ring-2 focus:ring-[#D92525]/40 focus:border-[#D92525]/60 transition';

  return (
    <div className="min-h-screen bg-[#F4F7EE] text-[#1A291E]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#143022]/95 backdrop-blur border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          <a href="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg bg-[#D92525] transition-transform group-hover:scale-105">
              <span className="text-2xl select-none">🍎</span>
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-white font-serif">{t('brandName')}</span>
              <p className="text-xs text-[#E2ECC8]/80 font-light tracking-wide">VIDEO GALLERY</p>
            </div>
          </a>
          <a
            href="/"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold text-[#E2ECC8] bg-white/10 hover:bg-white/20 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">{t('videosBack')}</span>
          </a>
        </div>
      </header>

      {/* Intro */}
      <section className="bg-[#143022] text-white pb-24 pt-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#E2ECC8] text-[#143022]">
            <Film className="w-3.5 h-3.5" /> {t('videosBadge')}
          </span>
          <h1 className="mt-5 text-3xl sm:text-5xl font-extrabold font-serif leading-tight">
            {highlightAt >= 0 ? (
              <>
                {title.slice(0, highlightAt)}
                <span className="text-[#ff6b6b]">{highlight}</span>
                {title.slice(highlightAt + highlight.length)}
              </>
            ) : (
              title
            )}
          </h1>
          <p className="mt-4 max-w-2xl text-[#F4F7EE]/75 leading-relaxed">
            {t('videosDesc')}
          </p>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 pb-24 grid lg:grid-cols-[400px_1fr] gap-8 items-start">
        {/* Attach form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl shadow-xl border border-black/5 p-6 sm:p-7 space-y-4 lg:sticky lg:top-28"
        >
          <div className="flex items-center gap-2">
            <Youtube className="w-6 h-6 text-[#D92525]" />
            <h2 className="text-lg font-bold">{t('videosFormTitle')}</h2>
          </div>

          <div className="aspect-video rounded-2xl overflow-hidden bg-[#E2ECC8]/50 border border-dashed border-[#143022]/20 flex items-center justify-center">
            {previewId ? (
              <img src={thumb(previewId)} alt="영상 미리보기" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center text-xs text-[#143022]/50 px-6">
                <LinkIcon className="w-6 h-6 mx-auto mb-2 opacity-60" />
                링크를 붙여넣으면 미리보기가 표시됩니다
              </div>
            )}
          </div>

          <label className="block space-y-1.5">
            <span className="text-xs font-semibold text-[#143022]/70">유튜브 링크 *</span>
            <input
              className={inputClass}
              placeholder="https://www.youtube.com/watch?v=..."
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs font-semibold text-[#143022]/70">영상 제목 *</span>
            <input
              className={inputClass}
              placeholder="예) 못난이 사과 수확 체험 브이로그"
              maxLength={120}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs font-semibold text-[#143022]/70">작성자</span>
            <input
              className={inputClass}
              placeholder="닉네임 (선택)"
              maxLength={40}
              value={form.author}
              onChange={(e) => setForm({ ...form, author: e.target.value })}
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs font-semibold text-[#143022]/70">영상 소개</span>
            <textarea
              className={`${inputClass} resize-none`}
              rows={3}
              placeholder="영상에 대한 짧은 소개 (선택)"
              maxLength={500}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </label>

          {formError && (
            <p className="flex items-center gap-2 text-sm text-[#D92525]">
              <AlertCircle className="w-4 h-4 shrink-0" /> {formError}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#D92525] text-white font-bold shadow-md hover:brightness-110 active:scale-[0.98] transition disabled:opacity-60 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            {submitting ? '등록 중...' : t('videosSubmitButton')}
          </button>
        </form>

        {/* Gallery */}
        <section className="lg:pt-20">
          <div className="flex items-end justify-between mb-5">
            <h2 className="text-2xl font-extrabold font-serif">{t('videosListTitle')}</h2>
            <span className="text-sm text-black/50">총 {videos.length}개</span>
          </div>

          {loading ? (
            <div className="grid sm:grid-cols-2 gap-6">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="rounded-3xl bg-white/70 aspect-[4/3] animate-pulse" />
              ))}
            </div>
          ) : loadError ? (
            <p className="flex items-center gap-2 p-6 rounded-2xl bg-white text-[#D92525]">
              <AlertCircle className="w-5 h-5" /> {loadError}
            </p>
          ) : videos.length === 0 ? (
            <div className="rounded-3xl border-2 border-dashed border-[#143022]/15 bg-white/60 p-12 text-center">
              <div className="text-5xl mb-3">🎥</div>
              <p className="font-semibold">{t('videosEmptyTitle')}</p>
              <p className="text-sm text-black/50 mt-1">{t('videosEmptyDesc')}</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-6">
              {videos.map((video) => (
                <article
                  key={video.id}
                  className="group bg-white rounded-3xl overflow-hidden border border-black/5 shadow-sm hover:shadow-xl transition"
                >
                  <button
                    type="button"
                    onClick={() => setPlaying(video)}
                    className="relative block w-full aspect-video overflow-hidden cursor-pointer"
                    aria-label={`${video.title} 재생`}
                  >
                    <img
                      src={thumb(video.youtubeId)}
                      alt=""
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute inset-0 bg-black/20 group-hover:bg-black/35 transition flex items-center justify-center">
                      <span className="w-14 h-14 rounded-full bg-[#D92525] text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition">
                        <Play className="w-6 h-6 fill-current ml-0.5" />
                      </span>
                    </span>
                  </button>
                  <div className="p-5">
                    <h3 className="font-bold leading-snug line-clamp-2">{video.title}</h3>
                    {video.description && (
                      <p className="mt-1.5 text-sm text-black/60 line-clamp-2">{video.description}</p>
                    )}
                    <p className="mt-3 text-xs text-black/40">
                      {video.author || '익명'} · {formatDate(video.createdAt)}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Player modal */}
      {playing && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPlaying(null)}
        >
          <div className="w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3 text-white">
              <h3 className="font-bold truncate pr-4">{playing.title}</h3>
              <button
                onClick={() => setPlaying(null)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 cursor-pointer"
                aria-label="닫기"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="aspect-video rounded-2xl overflow-hidden bg-black shadow-2xl">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${playing.youtubeId}?autoplay=1&rel=0`}
                title={playing.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#143022] text-white text-sm shadow-2xl">
          <CheckCircle2 className="w-4 h-4 text-[#E2ECC8]" /> {toast}
        </div>
      )}
    </div>
  );
}

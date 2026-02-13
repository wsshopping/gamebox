import React, { useEffect, useMemo, useRef, useState } from 'react';

type VideoItem = {
  id: string;
  title: string;
  creator: string;
  sources: string[];
};

type PexelsVideoFile = {
  id: number;
  link: string;
  width: number;
  height: number;
  quality: string;
  file_type: string;
};

type PexelsVideo = {
  id: number;
  user?: {
    name?: string;
  };
  video_files?: PexelsVideoFile[];
};

type PexelsSearchResponse = {
  videos?: PexelsVideo[];
};

const PEXELS_API_URL = 'https://api.pexels.com/videos/search';
const PEXELS_QUERY = ['woman portrait', 'fashion woman', 'city lifestyle woman'];

const FALLBACK_VIDEO_FEED: VideoItem[] = [
  {
    id: 'v1',
    title: 'Big Buck Bunny',
    creator: 'Blender Open Movie',
    sources: [
      'https://archive.org/download/BigBuckBunny_328/BigBuckBunny_512kb.mp4',
      'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      'https://cdn.jsdelivr.net/gh/mediaelement/mediaelement-files@master/big_buck_bunny.mp4'
    ]
  },
  {
    id: 'v2',
    title: 'Sintel Trailer',
    creator: 'Blender Open Movie',
    sources: [
      'https://media.w3.org/2010/05/sintel/trailer.mp4',
      'https://download.blender.org/durian/trailer/sintel_trailer-480p.mp4',
      'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'
    ]
  },
  {
    id: 'v3',
    title: 'Open Sample Mix',
    creator: 'Open Video Samples',
    sources: [
      'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      'https://cdn.jsdelivr.net/gh/mediaelement/mediaelement-files@master/echo-hereweare.mp4'
    ]
  }
];

const SWIPE_THRESHOLD = 56;
const WHEEL_COOLDOWN_MS = 420;

const shuffleItems = <T,>(items: T[]): T[] => {
  const list = [...items];
  for (let i = list.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
};

const selectPexelsMp4 = (files: PexelsVideoFile[] = []) => {
  const mp4 = files.filter((file) => file.file_type === 'video/mp4');
  if (mp4.length === 0) return '';
  const preferred = mp4.find((file) => file.quality === 'sd' && file.width <= 960);
  if (preferred) return preferred.link;
  const sorted = [...mp4].sort((a, b) => (a.width * a.height) - (b.width * b.height));
  return sorted[0]?.link || '';
};

const fetchOpenWomenVideos = async (): Promise<VideoItem[]> => {
  const pexelsKey = ((import.meta as any)?.env?.VITE_PEXELS_API_KEY || '').trim();
  if (!pexelsKey) {
    throw new Error('missing pexels api key');
  }

  const settled = await Promise.allSettled(
    PEXELS_QUERY.map((query) =>
      fetch(`${PEXELS_API_URL}?query=${encodeURIComponent(query)}&per_page=20&orientation=portrait`, {
        headers: { Authorization: pexelsKey }
      }).then(async (res) => {
        if (!res.ok) {
          throw new Error(`Pexels ${res.status}`);
        }
        return (await res.json()) as PexelsSearchResponse;
      })
    )
  );

  const merged: VideoItem[] = [];
  const seen = new Set<string>();
  settled.forEach((result) => {
    if (result.status !== 'fulfilled') return;
    (result.value.videos || []).forEach((video) => {
      const url = selectPexelsMp4(video.video_files || []);
      if (!url || seen.has(url)) return;
      seen.add(url);
      merged.push({
        id: `pexels-${video.id}`,
        title: 'Open Portrait Clip',
        creator: video.user?.name || 'Pexels Creator',
        sources: [url]
      });
    });
  });

  if (merged.length === 0) {
    throw new Error('no pexels videos');
  }
  return merged;
};

const PlayerVideoModal: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const [videoFeed, setVideoFeed] = useState<VideoItem[]>(FALLBACK_VIDEO_FEED);
  const [videoIndex, setVideoIndex] = useState(0);
  const [sourceIndex, setSourceIndex] = useState(0);
  const [sourceError, setSourceError] = useState('');
  const [muted, setMuted] = useState(true);
  const [needsTapToPlay, setNeedsTapToPlay] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [feedNotice, setFeedNotice] = useState('');
  const [loadingFeed, setLoadingFeed] = useState(false);
  const touchStartYRef = useRef<number | null>(null);
  const wheelTriggerAtRef = useRef(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    setLoadingFeed(true);
    setFeedNotice('');
    setVideoIndex(0);
    setSourceIndex(0);
    setSourceError('');
    setMuted(true);
    setNeedsTapToPlay(false);
    setIsPlaying(false);

    let active = true;
    const loadFeed = async () => {
      try {
        const openVideos = await fetchOpenWomenVideos();
        if (!active) return;
        setVideoFeed(shuffleItems(openVideos));
        setFeedNotice('已切换开源视频源');
      } catch {
        if (!active) return;
        setVideoFeed(shuffleItems(FALLBACK_VIDEO_FEED));
        setFeedNotice('开源视频源不可用，已切换兜底源');
      } finally {
        if (active) setLoadingFeed(false);
      }
    };

    void loadFeed();
    return () => {
      active = false;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = oldOverflow;
    };
  }, [open]);

  const currentVideo = useMemo(() => videoFeed[videoIndex], [videoFeed, videoIndex]);
  const currentSource = currentVideo?.sources[sourceIndex] || '';

  useEffect(() => {
    setSourceIndex(0);
    setSourceError('');
    setNeedsTapToPlay(false);
  }, [videoIndex]);

  const tryPlayCurrent = async () => {
    const el = videoRef.current;
    if (!el) return;
    try {
      await el.play();
      setNeedsTapToPlay(false);
      setIsPlaying(true);
    } catch {
      setNeedsTapToPlay(true);
      setIsPlaying(false);
    }
  };

  const moveVideo = (step: number) => {
    setVideoIndex((current) => {
      const total = videoFeed.length;
      if (total <= 1) {
        return current;
      }
      const next = (current + step + total) % total;
      return next;
    });
  };

  const nextVideo = () => moveVideo(1);
  const prevVideo = () => moveVideo(-1);

  const handleVideoError = () => {
    if (!currentVideo) return;
    if (sourceIndex + 1 < currentVideo.sources.length) {
      setSourceIndex(sourceIndex + 1);
      setSourceError('当前线路不可用，已自动切换线路...');
      setNeedsTapToPlay(false);
      return;
    }
    setSourceError('当前视频线路全部不可用，已切换下一条；如持续失败请检查网络是否可访问外网视频域名');
    nextVideo();
  };

  const togglePlay = async () => {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) {
      await tryPlayCurrent();
      return;
    }
    el.pause();
    setIsPlaying(false);
  };

  const handleTouchStart: React.TouchEventHandler<HTMLDivElement> = (event) => {
    touchStartYRef.current = event.touches[0]?.clientY ?? null;
  };

  const handleTouchEnd: React.TouchEventHandler<HTMLDivElement> = (event) => {
    const startY = touchStartYRef.current;
    touchStartYRef.current = null;
    if (startY === null) return;
    const endY = event.changedTouches[0]?.clientY ?? startY;
    const delta = endY - startY;
    if (Math.abs(delta) < SWIPE_THRESHOLD) return;
    if (delta < 0) {
      nextVideo();
      return;
    }
    prevVideo();
  };

  const handleWheel: React.WheelEventHandler<HTMLDivElement> = (event) => {
    if (Math.abs(event.deltaY) < 12) {
      return;
    }
    const now = Date.now();
    if (now - wheelTriggerAtRef.current < WHEEL_COOLDOWN_MS) {
      return;
    }
    wheelTriggerAtRef.current = now;
    event.preventDefault();
    if (event.deltaY > 0) {
      nextVideo();
      return;
    }
    prevVideo();
  };

  useEffect(() => {
    if (!open) return;
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        prevVideo();
        return;
      }
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        nextVideo();
      }
    };
    window.addEventListener('keydown', keydown);
    return () => {
      window.removeEventListener('keydown', keydown);
    };
  }, [open, videoFeed.length]);

  useEffect(() => {
    if (!open) return;
    setNeedsTapToPlay(false);
    setIsPlaying(false);
    const timer = window.setTimeout(() => {
      void tryPlayCurrent();
    }, 40);
    return () => {
      window.clearTimeout(timer);
    };
  }, [open, videoIndex, sourceIndex, muted]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] bg-black text-white overflow-hidden select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
    >
      {currentVideo && (
        <video
          ref={videoRef}
          key={`${currentVideo.id}-${videoIndex}-${sourceIndex}`}
          src={currentSource}
          playsInline
          autoPlay
          muted={muted}
          preload="metadata"
          onEnded={nextVideo}
          onError={handleVideoError}
          onPlay={() => {
            setIsPlaying(true);
            setNeedsTapToPlay(false);
          }}
          onPause={() => setIsPlaying(false)}
          onClick={togglePlay}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-black/50"></div>

      {(needsTapToPlay || !isPlaying) && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <button
            onClick={() => void tryPlayCurrent()}
            className="pointer-events-auto h-12 px-5 rounded-full bg-black/45 border border-white/25 text-sm font-bold"
          >
            点击播放
          </button>
        </div>
      )}

      <div className="absolute top-[calc(env(safe-area-inset-top)+14px)] left-4 right-4 flex items-center justify-between">
        <div className="text-[11px] uppercase tracking-[0.18em] text-amber-300/90 font-black">Short Video</div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMuted((prev) => !prev)}
            className="h-9 min-w-9 px-2 rounded-full bg-black/35 border border-white/20 text-xs font-bold"
            aria-label={muted ? '开启声音' : '静音'}
          >
            {muted ? '静音' : '有声'}
          </button>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-black/35 border border-white/20 text-slate-100"
            aria-label="关闭刷视频"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-2">
        <button
          onClick={prevVideo}
          className="w-10 h-10 rounded-full bg-black/35 border border-white/20 text-lg leading-none"
          aria-label="上一条"
        >
          ˄
        </button>
        <button
          onClick={nextVideo}
          className="w-10 h-10 rounded-full bg-black/35 border border-white/20 text-lg leading-none"
          aria-label="下一条"
        >
          ˅
        </button>
      </div>

      <div className="absolute left-4 right-16 bottom-[calc(env(safe-area-inset-bottom)+18px)]">
        {currentVideo && (
          <>
            <div className="text-lg font-black leading-tight">{currentVideo.title}</div>
            <div className="text-sm text-slate-200 mt-1">{currentVideo.creator}</div>
            <div className="text-[11px] text-slate-300 mt-2">
              线路 {sourceIndex + 1}/{currentVideo.sources.length} · 上滑下一条 下滑上一条
            </div>
          </>
        )}
        {sourceError && (
          <div className="mt-2 text-xs text-amber-300">{sourceError}</div>
        )}
        {feedNotice && (
          <div className="mt-2 text-xs text-sky-200">{feedNotice}</div>
        )}
        {loadingFeed && (
          <div className="mt-2 text-xs text-slate-300">正在加载开源视频源...</div>
        )}
      </div>

      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="text-[10px] tracking-[0.2em] uppercase text-white/35 -mt-28">Swipe Up Or Down</div>
      </div>
    </div>
  );
};

export default PlayerVideoModal;

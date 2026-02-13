import React, { useEffect, useRef, useState } from 'react';

type MusicTrack = {
  id: string;
  title: string;
  artist: string;
  vibe: string;
  cover: string;
  url: string;
};

declare global {
  interface Window {
    APlayer?: any;
  }
}

const APLAYER_CSS_ID = 'aplayer-css-cdn';
const APLAYER_JS_ID = 'aplayer-js-cdn';
const APLAYER_THEME_STYLE_ID = 'aplayer-theme-style';
const APLAYER_LIST_MAX_HEIGHT = '108px';
const NETEASE_PLAYLIST_IDS = [
  '3778678',
  '2619366284',
  '322615025',
  '539567186',
  '153799688',
  '135451308'
];
const METING_API = 'https://api.injahow.cn/meting/';

const PLAYER_MUSIC_PLAYLIST: MusicTrack[] = [
  {
    id: 'm1',
    title: 'A Mermaid Tale',
    artist: 'Open Archive Artist',
    vibe: '轻节奏 · 专注',
    cover: '/uploads/file/portal-games/wendao_banner.jpg',
    url: 'https://archive.org/download/mermaid_201907/mermaid.mp3'
  },
  {
    id: 'm2',
    title: 'Moonlit Oil',
    artist: 'A Requiem For The Ears',
    vibe: '热血 · 激燃',
    cover: '/uploads/file/portal-games/tianlong_banner.jpg',
    url: 'https://archive.org/download/moonlit-oil-a-requiem-for-the-ears/Moonlit%20Oil%20-%20A%20Requiem%20For%20The%20Ears.mp3'
  },
  {
    id: 'm3',
    title: 'More 12 String Final',
    artist: 'Open Archive Artist',
    vibe: '放松 · 治愈',
    cover: '/uploads/file/portal-games/qiannv_banner.jpg',
    url: 'https://archive.org/download/more12string_final/more12string_final.mp3'
  },
  {
    id: 'm4',
    title: 'Twentythreve',
    artist: 'Luke Etyrnal',
    vibe: '电子 · 动感',
    cover: '/uploads/file/portal-games/wendao_1.jpg',
    url: 'https://archive.org/download/luke-etyrnal-twentythreve/luke%20etyrnal%20-%20twentythreve.mp3'
  }
];

const fetchNeteasePlaylist = async (playlistId: string): Promise<MusicTrack[]> => {
  const query = new URLSearchParams({
    server: 'netease',
    type: 'playlist',
    id: playlistId
  });

  const res = await fetch(`${METING_API}?${query.toString()}`);
  if (!res.ok) {
    throw new Error(`Meting API ${res.status}`);
  }

  const data = await res.json();
  if (!Array.isArray(data)) {
    throw new Error('Meting API 返回格式异常');
  }

  const mapped = data
    .map((item: any, index: number) => {
      if (!item?.name || !item?.url) {
        return null;
      }
      return {
        id: `netease-${index}`,
        title: String(item.name),
        artist: String(item.artist || '网易云音乐'),
        vibe: '网易云歌单 · 演示版',
        cover: String(item.pic || '/uploads/file/portal-games/wendao_banner.jpg'),
        url: String(item.url)
      } as MusicTrack;
    })
    .filter(Boolean) as MusicTrack[];

  if (mapped.length === 0) {
    throw new Error('网易云歌单为空');
  }

  return mapped;
};

const fetchMergedNeteasePlaylists = async (): Promise<MusicTrack[]> => {
  const settled = await Promise.allSettled(NETEASE_PLAYLIST_IDS.map((id) => fetchNeteasePlaylist(id)));
  const merged: MusicTrack[] = [];
  const seen = new Set<string>();

  settled.forEach((result) => {
    if (result.status !== 'fulfilled') {
      return;
    }
    result.value.forEach((item) => {
      const key = `${item.title}__${item.artist}__${item.url}`;
      if (seen.has(key)) {
        return;
      }
      seen.add(key);
      merged.push(item);
    });
  });

  if (merged.length === 0) {
    throw new Error('网易云歌单为空');
  }

  return merged;
};

const shuffleTracks = (tracks: MusicTrack[]) => {
  const list = [...tracks];
  for (let i = list.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
};

const ensureAPlayerAssets = async () => {
  if (typeof document === 'undefined') {
    return;
  }

  if (!document.getElementById(APLAYER_CSS_ID)) {
    const link = document.createElement('link');
    link.id = APLAYER_CSS_ID;
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/aplayer/dist/APlayer.min.css';
    document.head.appendChild(link);
  }

  if (!document.getElementById(APLAYER_THEME_STYLE_ID)) {
    const style = document.createElement('style');
    style.id = APLAYER_THEME_STYLE_ID;
    style.textContent = `
.player-music-modal .aplayer{
  background: rgba(15, 23, 42, 0.82);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #e2e8f0;
}
.player-music-modal .aplayer .aplayer-info .aplayer-music .aplayer-title{
  color: #f8fafc;
}
.player-music-modal .aplayer .aplayer-info .aplayer-music .aplayer-author{
  color: #94a3b8;
}
.player-music-modal .aplayer .aplayer-list{
  background: rgba(15, 23, 42, 0.92);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}
.player-music-modal .aplayer .aplayer-list ol{
  max-height: ${APLAYER_LIST_MAX_HEIGHT} !important;
}
.player-music-modal .aplayer .aplayer-list ol li{
  color: #cbd5e1;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}
.player-music-modal .aplayer .aplayer-list ol li:hover{
  background: rgba(245, 158, 11, 0.14);
}
.player-music-modal .aplayer .aplayer-list ol li.aplayer-list-light{
  background: rgba(245, 158, 11, 0.2);
  color: #fde68a;
}
`;
    document.head.appendChild(style);
  }

  if (window.APlayer) {
    return;
  }

  await new Promise<void>((resolve, reject) => {
    const existing = document.getElementById(APLAYER_JS_ID) as HTMLScriptElement | null;

    if (existing) {
      if (existing.dataset.ready === '1') {
        resolve();
        return;
      }
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('APlayer script load failed')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.id = APLAYER_JS_ID;
    script.src = 'https://cdn.jsdelivr.net/npm/aplayer/dist/APlayer.min.js';
    script.async = true;
    script.onload = () => {
      script.dataset.ready = '1';
      resolve();
    };
    script.onerror = () => reject(new Error('APlayer script load failed'));
    document.body.appendChild(script);
  });
};

const PlayerMusicModal: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<any>(null);
  const activePlaylistRef = useRef<MusicTrack[]>(PLAYER_MUSIC_PLAYLIST);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentMeta, setCurrentMeta] = useState<Pick<MusicTrack, 'title' | 'artist' | 'vibe'> | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const updateMetaByIndex = (index: number) => {
    const player = playerRef.current;
    const audioList = player?.list?.audios || [];
    const target = audioList[index];
    if (!target) return;
    const raw = activePlaylistRef.current.find((item) => item.title === target.name && item.artist === target.artist);
    setCurrentMeta({
      title: target.name,
      artist: target.artist,
      vibe: raw?.vibe || '精选推荐'
    });
  };

  const handleTogglePlay = () => {
    const player = playerRef.current;
    if (!player) return;
    if (player.audio?.paused) {
      player.play();
    } else {
      player.pause();
    }
  };

  const handleRandomNext = () => {
    const player = playerRef.current;
    const audioList = player?.list?.audios || [];
    if (!player || audioList.length === 0) return;
    const currentIndex = Number(player.list.index || 0);
    const candidates = audioList.map((_: unknown, index: number) => index).filter((index: number) => index !== currentIndex);
    const nextIndex = candidates[Math.floor(Math.random() * candidates.length)] ?? 0;
    player.list.switch(nextIndex);
    player.play();
  };

  useEffect(() => {
    if (!open) {
      return;
    }

    let canceled = false;
    setLoading(true);
    setError('');

    const mountPlayer = async () => {
      try {
        await ensureAPlayerAssets();
        if (canceled || !containerRef.current || !window.APlayer) {
          return;
        }

        containerRef.current.innerHTML = '';
        let sourceList = PLAYER_MUSIC_PLAYLIST;
        try {
          sourceList = await fetchMergedNeteasePlaylists();
        } catch (err) {
          // ignore and fallback to open links
        }
        const shuffled = shuffleTracks(sourceList);
        activePlaylistRef.current = shuffled;

        playerRef.current = new window.APlayer({
          container: containerRef.current,
          fixed: false,
          mini: false,
          autoplay: true,
          theme: '#f59e0b',
          loop: 'all',
          order: 'random',
          preload: 'auto',
          volume: 0.7,
          mutex: true,
          listFolded: true,
          listMaxHeight: APLAYER_LIST_MAX_HEIGHT,
          audio: shuffled.map((item) => ({
            name: item.title,
            artist: item.artist,
            url: item.url,
            cover: item.cover
          }))
        });

        updateMetaByIndex(Number(playerRef.current?.list?.index || 0));
        playerRef.current.on('listswitch', (payload: any) => {
          const nextIndex = Number(payload?.index ?? 0);
          updateMetaByIndex(nextIndex);
        });
        playerRef.current.on('play', () => setIsPlaying(true));
        playerRef.current.on('pause', () => setIsPlaying(false));

        setIsPlaying(true);
      } catch (err: any) {
        setError(err?.message || '播放器加载失败');
      } finally {
        if (!canceled) {
          setLoading(false);
        }
      }
    };

    void mountPlayer();

    return () => {
      canceled = true;
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
      setIsPlaying(false);
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

  useEffect(() => {
    if (open) {
      setIsMinimized(false);
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className={`player-music-modal fixed inset-0 z-[80] flex ${isMinimized ? 'items-end justify-end p-4 pointer-events-none' : 'items-center justify-center px-5'}`}>
      {!isMinimized && <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose}></div>}

      {isMinimized && (
        <div className="pointer-events-auto relative w-[170px] rounded-xl border border-white/15 bg-[#0f172a]/95 backdrop-blur-md px-2 py-1.5 shadow-2xl">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="text-[10px] text-slate-300 truncate leading-tight">{currentMeta?.title || '网易云演示播放器'}</div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleTogglePlay}
                className="w-6 h-6 rounded-full bg-white/10 border border-white/15 text-slate-200 text-[10px]"
                aria-label={isPlaying ? '暂停播放' : '继续播放'}
              >
                {isPlaying ? '❚❚' : '▶'}
              </button>
              <button
                onClick={() => setIsMinimized(false)}
                className="w-6 h-6 rounded-full bg-white/10 border border-white/15 text-slate-200 text-[11px]"
                aria-label="展开播放器"
              >
                □
              </button>
              <button
                onClick={onClose}
                className="w-6 h-6 rounded-full bg-white/10 border border-white/15 text-slate-200 text-[11px]"
                aria-label="关闭播放器"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={`relative w-full max-w-sm bg-[#0f172a] rounded-[28px] p-6 border border-white/10 shadow-2xl overflow-hidden ${isMinimized ? 'hidden' : ''}`}>
        <div className="absolute top-0 right-0 w-44 h-44 bg-amber-500/10 rounded-full blur-3xl -mr-12 -mt-12"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl -ml-12 -mb-12"></div>

        <div className="absolute top-4 right-4 flex items-center gap-2">
          <button
            onClick={() => setIsMinimized(true)}
            className="w-8 h-8 rounded-full bg-white/10 border border-white/15 text-slate-300 hover:text-white"
            aria-label="缩小播放器"
          >
            —
          </button>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 border border-white/15 text-slate-300 hover:text-white"
            aria-label="关闭播放器"
          >
            ✕
          </button>
        </div>

        <div className="relative z-10 text-white">
          <div className="text-[11px] uppercase tracking-[0.2em] text-amber-400/90 font-bold mb-4">APlayer · 网易云演示</div>

          <div className="mb-4 rounded-2xl bg-white/5 border border-white/10 px-3 py-2.5">
            <div className="text-sm font-bold truncate">{currentMeta?.title || '随机播放中...'}</div>
            <div className="text-xs text-slate-400 truncate mt-1">
              {currentMeta ? `${currentMeta.artist} · ${currentMeta.vibe}` : '正在加载播放器资源'}
            </div>
          </div>

          <div className="mb-4 grid grid-cols-2 gap-3">
            <button
              onClick={handleTogglePlay}
              className="h-10 rounded-xl bg-gradient-to-r from-amber-300 to-amber-500 text-black text-sm font-black shadow-lg"
              disabled={loading || !!error}
            >
              {isPlaying ? '暂停' : '播放'}
            </button>
            <button
              onClick={handleRandomNext}
              className="h-10 rounded-xl bg-white/8 border border-white/15 text-sm font-bold text-slate-200 hover:text-amber-300"
              disabled={loading || !!error}
            >
              随机下一首
            </button>
          </div>

          {loading && (
            <div className="mb-3 text-xs text-amber-200/80">正在加载开源播放器...</div>
          )}
          {error && (
            <div className="mb-3 text-xs text-rose-300">{error}</div>
          )}

          <div ref={containerRef} className="rounded-2xl overflow-hidden border border-white/10"></div>
        </div>
      </div>
    </div>
  );
};

export default PlayerMusicModal;

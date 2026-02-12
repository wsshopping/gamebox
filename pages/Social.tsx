import React, { useEffect, useMemo, useRef, useState } from 'react';
import Trade from './Trade';
import MessageList from './MessageList';
import Agency, { SuperAdminPage } from './Agency';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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
const NETEASE_PLAYLIST_ID = '3778678';
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

const fetchNeteasePlaylist = async (): Promise<MusicTrack[]> => {
  const query = new URLSearchParams({
    server: 'netease',
    type: 'playlist',
    id: NETEASE_PLAYLIST_ID
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

const MusicPlayerModal: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<any>(null);
  const activePlaylistRef = useRef<MusicTrack[]>(PLAYER_MUSIC_PLAYLIST);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentMeta, setCurrentMeta] = useState<Pick<MusicTrack, 'title' | 'artist' | 'vibe'> | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

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
          sourceList = await fetchNeteasePlaylist();
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
          listMaxHeight: '200px',
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

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center px-5">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose}></div>

      <div className="relative w-full max-w-sm bg-[#0f172a] rounded-[28px] p-6 border border-white/10 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-44 h-44 bg-amber-500/10 rounded-full blur-3xl -mr-12 -mt-12"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl -ml-12 -mb-12"></div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 border border-white/15 text-slate-300 hover:text-white"
          aria-label="关闭播放器"
        >
          ✕
        </button>

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

const PlayerHub: React.FC = () => {
  const navigate = useNavigate();
  const [musicOpen, setMusicOpen] = useState(false);

  return (
    <>
      <div className="px-5 pt-6">
        <div className="card-bg rounded-[24px] p-6 shadow-sm border border-theme">
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setMusicOpen(true)}
              className="card-bg rounded-2xl border border-theme p-4 text-left group hover:border-accent/40 transition-all"
            >
              <div className="w-11 h-11 rounded-2xl bg-[var(--bg-primary)] border border-theme flex items-center justify-center text-xl mb-3 group-hover:text-accent">
                🎵
              </div>
              <div className="text-sm font-bold mb-1" style={{ color: 'var(--text-primary)' }}>听音乐</div>
              <div className="text-xs text-slate-500">开源播放器 · 随机播放</div>
            </button>

            <button
              onClick={() => navigate('/user/video')}
              className="card-bg rounded-2xl border border-theme p-4 text-left group hover:border-accent/40 transition-all"
            >
              <div className="w-11 h-11 rounded-2xl bg-[var(--bg-primary)] border border-theme flex items-center justify-center text-xl mb-3 group-hover:text-accent">
                🎬
              </div>
              <div className="text-sm font-bold mb-1" style={{ color: 'var(--text-primary)' }}>刷视频</div>
              <div className="text-xs text-slate-500">热门速刷 · 一键开看</div>
            </button>
          </div>
        </div>
      </div>

      <MusicPlayerModal open={musicOpen} onClose={() => setMusicOpen(false)} />
    </>
  );
};

const Social: React.FC = () => {
  const { user } = useAuth();
  const roleId = Number(user?.role?.id ?? user?.roleId ?? 0);
  const isSuperAdmin = roleId === 1;
  const isAgent = roleId === 2 || roleId === 3 || roleId === 4 || roleId === 5;

  const tabs = useMemo(() => {
    const base = ['trade', 'message', 'player'];
    if (isSuperAdmin || isAgent) {
      base.push('agency');
    }
    if (isSuperAdmin) {
      base.push('superadmin');
    }
    return base;
  }, [isAgent, isSuperAdmin]);

  const [activeTab, setActiveTab] = useState<'trade' | 'message' | 'player' | 'agency' | 'superadmin'>(tabs[0] as any);
  const tabCount = tabs.length;
  const activeIndex = tabs.indexOf(activeTab);

  useEffect(() => {
    if (activeIndex === -1) {
      setActiveTab(tabs[0] as any);
    }
  }, [activeIndex, tabs]);

  const sliderWidth = `calc(${(100 / tabCount).toFixed(2)}% - 4px)`;
  const sliderLeft = `calc(${(100 / tabCount).toFixed(2)}% * ${activeIndex} + 2px)`;

  return (
    <div className="app-bg min-h-full pt-[calc(5rem+env(safe-area-inset-top))] flex flex-col transition-colors duration-500">
      <div className="glass-bg fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md z-40 border-b border-theme pt-[calc(1rem+env(safe-area-inset-top))] pb-3 transition-colors duration-500">
        <div className="flex justify-center px-4">
          <div className="relative flex w-full max-w-sm bg-[var(--bg-primary)] p-1 rounded-2xl border border-theme shadow-lg shadow-black/5">
            <div
              className="absolute top-1 bottom-1 bg-accent-color/20 rounded-xl shadow-sm border border-accent/20 transition-all duration-300 ease-out"
              style={{ width: sliderWidth, left: sliderLeft }}
            ></div>

            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`relative flex-1 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 z-10 ${
                  activeTab === tab
                    ? 'text-accent'
                    : 'text-slate-500 hover:text-[var(--text-primary)]'
                }`}
              >
                {tab === 'trade'
                  ? '市场交易'
                  : tab === 'message'
                    ? '消息中心'
                    : tab === 'player'
                      ? '玩家中心'
                      : tab === 'agency'
                        ? '代理中心'
                        : '超管中心'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1">
        {activeTab === 'trade' && <Trade isEmbedded={true} />}
        {activeTab === 'message' && <MessageList isEmbedded={true} />}
        {activeTab === 'player' && <PlayerHub />}
        {activeTab === 'agency' && <Agency />}
        {activeTab === 'superadmin' && <SuperAdminPage />}
      </div>
    </div>
  );
};

export default Social;

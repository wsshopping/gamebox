import React, { useEffect, useMemo, useState } from 'react';
import Trade from './Trade';
import MessageList from './MessageList';
import Agency, { SuperAdminPage } from './Agency';
import { useAuth } from '../context/AuthContext';
import PlayerMusicModal from '../components/PlayerMusicModal';
import PlayerVideoModal from '../components/PlayerVideoModal';

const PlayerHub: React.FC<{ onOpenMusic: () => void; onOpenVideo: () => void }> = ({ onOpenMusic, onOpenVideo }) => {
  return (
    <>
      <div className="px-5 pt-6">
        <div className="card-bg rounded-[24px] p-6 shadow-sm border border-theme">
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={onOpenMusic}
              className="card-bg rounded-2xl border border-theme p-4 text-left group hover:border-accent/40 transition-all"
            >
              <div className="w-11 h-11 rounded-2xl bg-[var(--bg-primary)] border border-theme flex items-center justify-center text-xl mb-3 group-hover:text-accent">
                🎵
              </div>
              <div className="text-sm font-bold mb-1" style={{ color: 'var(--text-primary)' }}>听音乐</div>
              <div className="text-xs text-slate-500">开源播放器 · 随机播放</div>
            </button>

            <button
              onClick={onOpenVideo}
              className="card-bg rounded-2xl border border-theme p-4 text-left group hover:border-accent/40 transition-all"
            >
              <div className="w-11 h-11 rounded-2xl bg-[var(--bg-primary)] border border-theme flex items-center justify-center text-xl mb-3 group-hover:text-accent">
                🎬
              </div>
              <div className="text-sm font-bold mb-1" style={{ color: 'var(--text-primary)' }}>刷视频</div>
              <div className="text-xs text-slate-500">随机刷视频 · 自动下一条</div>
            </button>
          </div>
        </div>
      </div>
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
  const [musicOpen, setMusicOpen] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);
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
      <div className="glass-bg fixed top-0 left-0 w-full z-40 border-b border-theme pt-[calc(1rem+env(safe-area-inset-top))] pb-3 transition-colors duration-500">
        <div className="px-4">
          <div className="relative flex w-full bg-[var(--bg-primary)] p-1 rounded-2xl border border-theme shadow-lg shadow-black/5">
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
        {activeTab === 'player' && <PlayerHub onOpenMusic={() => setMusicOpen(true)} onOpenVideo={() => setVideoOpen(true)} />}
        {activeTab === 'agency' && <Agency />}
        {activeTab === 'superadmin' && <SuperAdminPage />}
      </div>

      <PlayerMusicModal open={musicOpen} onClose={() => setMusicOpen(false)} />
      <PlayerVideoModal open={videoOpen} onClose={() => setVideoOpen(false)} />
    </div>
  );
};

export default Social;

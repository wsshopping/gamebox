import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import RegisterForm from '../components/RegisterForm';
import { api } from '../services/api';
import { Game } from '../types';

const GameRegisterLanding: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const [game, setGame] = useState<Game | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const inviteCode = (searchParams.get('inviteCode') || '').trim().toUpperCase();

  useEffect(() => {
    let mounted = true;
    const loadGame = async () => {
      if (!id) {
        setLoading(false);
        return;
      }
      try {
        const data = await api.game.getById(id);
        if (mounted) {
          setGame(data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };
    loadGame();
    return () => {
      mounted = false;
    };
  }, [id]);

  const banner = game?.banner || game?.images?.[0] || '';

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] relative overflow-hidden">
      {banner ? (
        <>
          <div className="absolute inset-0">
            <img src={banner} alt={game?.title || 'game-banner'} className="h-full w-full object-cover" />
          </div>
          <div className="absolute inset-0 bg-slate-950/55" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.16),_transparent_30%),radial-gradient(circle_at_top_left,_rgba(245,158,11,0.18),_transparent_28%)]" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/55 to-[var(--bg-primary)]" />
        </>
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.18),_transparent_35%),linear-gradient(180deg,#0f172a_0%,#020617_100%)]" />
      )}

      <button onClick={() => navigate('/login')} className="absolute top-6 left-6 z-20 text-white/80 hover:text-white transition-colors">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
      </button>

      <div className="relative z-10 min-h-screen px-6 py-10 flex flex-col justify-end">
        <div className="max-w-md mx-auto w-full">
          {loading ? (
            <div className="rounded-[32px] border border-white/20 bg-white/8 backdrop-blur-3xl p-6 shadow-[0_24px_80px_-24px_rgba(0,0,0,0.8)]">
              <div className="h-8 w-40 rounded-xl bg-white/10 animate-pulse mb-4" />
              <div className="h-4 w-full rounded-xl bg-white/10 animate-pulse mb-2" />
              <div className="h-4 w-2/3 rounded-xl bg-white/10 animate-pulse" />
            </div>
          ) : (
            <>
              <div className="mb-5">
                <div className="inline-flex items-center rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.28em] text-amber-300">
                  Game Register
                </div>
              </div>
              <div className="relative overflow-hidden rounded-[32px] border border-white/18 bg-white/10 backdrop-blur-3xl p-6 shadow-[0_28px_90px_-28px_rgba(0,0,0,0.85)]">
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.16),transparent_32%,transparent_68%,rgba(255,255,255,0.08))]" />
                <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-white/35" />
                <RegisterForm
                  defaultInviteCode={inviteCode}
                  title={game?.title ? `${game.title} 专属注册` : '游戏专属注册'}
                  subtitle={game?.description || (inviteCode ? `当前默认代理码 ${inviteCode}` : '填写信息后即可完成注册')}
                  onSuccess={() => navigate('/user')}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameRegisterLanding;

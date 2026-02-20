
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Game } from '../types';

const GameDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [game, setGame] = useState<Game | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [reserved, setReserved] = useState(false);
  const [reserveTotal, setReserveTotal] = useState(0);
  const [reserveLoading, setReserveLoading] = useState(false);
  const [reserveSubmitting, setReserveSubmitting] = useState(false);

  useEffect(() => {
    const loadGame = async () => {
      if (!id) return;
      try {
        const data = await api.game.getById(id);
        setGame(data);
        if (data?.isReserve) {
          setReserveLoading(true);
          try {
            const status = await api.game.getReserveStatus(id);
            setReserved(Boolean(status.reserved));
            setReserveTotal(Number(status.total || 0));
          } catch (error) {
            console.error(error);
          } finally {
            setReserveLoading(false);
          }
        } else {
          setReserved(false);
          setReserveTotal(0);
          setReserveLoading(false);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    loadGame();
  }, [id]);

  const handleDownload = () => {
    if (game?.downloadUrl) {
      window.open(game.downloadUrl, '_blank');
    } else {
      alert('下载链接暂未配置');
    }
  };

  const handleReserve = async () => {
    if (!id || !game?.isReserve || reserved || reserveSubmitting) return;
    setReserveSubmitting(true);
    try {
      const status = await api.game.reserve(id);
      setReserved(Boolean(status.reserved));
      setReserveTotal(Number(status.total || 0));
    } catch (error: any) {
      if (error?.message) {
        window.alert(error.message);
      }
    } finally {
      setReserveSubmitting(false);
    }
  };

  if (isLoading) {
    return (
       <div className="app-bg min-h-screen flex items-center justify-center">
         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
       </div>
    );
  }

  if (!game) {
    return (
      <div className="app-bg min-h-screen flex flex-col items-center justify-center p-6">
        <div className="text-4xl mb-4">👾</div>
        <p className="text-slate-500 font-bold mb-4">游戏未找到</p>
        <button onClick={() => navigate(-1)} className="text-accent font-bold">返回</button>
      </div>
    );
  }

  const isReserveGame = Boolean(game.isReserve);
  const primaryDisabled = isReserveGame ? reserved || reserveSubmitting : false;
  const primaryButtonText = isReserveGame
    ? (reserved ? '已预约' : (reserveSubmitting ? '预约中...' : '立即预约'))
    : '立即下载';

  // Use configured banner or fallback to first screenshot or placeholder
  const heroImage = game.banner || (game.images && game.images.length > 0 ? game.images[0] : 'https://picsum.photos/800/400?blur=5');

  return (
    <div className="app-bg min-h-screen relative pb-10 transition-colors duration-500">
      {/* Back Button */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50 p-4">
        <button onClick={() => navigate(-1)} className="bg-black/40 hover:bg-black/60 text-white p-2 rounded-full backdrop-blur-md transition-all border border-white/10">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
      </div>

      {/* Hero Image */}
      <div className="h-64 relative overflow-hidden">
        <img src={heroImage} alt="cover" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] via-transparent to-black/30"></div>
      </div>

      {/* Header Content */}
      <div className="px-5 -mt-12 relative z-10">
        <div className="card-bg rounded-[24px] p-5 shadow-xl border border-theme">
          <div className="flex items-start space-x-4">
             <img src={game.icon} alt={game.title} className="w-20 h-20 rounded-[20px] shadow-lg border-2 border-theme -mt-10 bg-[var(--bg-card)]" />
             <div className="pt-0 flex-1 min-w-0">
               <h1 className="text-xl font-black leading-tight truncate" style={{color: 'var(--text-primary)'}}>{game.title}</h1>
               <div className="flex items-center space-x-2 mt-1">
                 <span className="text-[10px] font-bold bg-indigo-500/10 text-indigo-500 px-2 py-0.5 rounded-md border border-indigo-500/20">{game.category}</span>
                 <span className="text-[10px] text-slate-400 font-medium">{game.size || '未知大小'}</span>
               </div>
             </div>
             <div className="flex flex-col items-center justify-center bg-amber-500/10 px-3 py-1 rounded-xl border border-amber-500/20">
                 <span className="text-amber-500 text-xs font-bold">★ {game.rating}</span>
             </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-4">
            {game.tags.map(tag => (
              <span key={tag} className="px-2.5 py-1 bg-[var(--bg-primary)] text-slate-500 text-[10px] font-bold rounded-lg border border-theme">#{tag}</span>
            ))}
          </div>

          {/* Download Action */}
          <div className="mt-6 flex space-x-3">
             <button 
               onClick={isReserveGame ? handleReserve : handleDownload}
               disabled={primaryDisabled}
               className={`flex-1 py-3.5 rounded-xl font-bold shadow-lg active:scale-95 transition-all flex items-center justify-center ${
                 primaryDisabled
                   ? 'bg-slate-400 text-white cursor-not-allowed shadow-slate-500/20'
                   : 'bg-accent-gradient text-black shadow-amber-500/20 hover:brightness-110'
               }`}
             >
               <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
               {primaryButtonText}
             </button>
             <button className="w-12 h-12 bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 rounded-xl flex items-center justify-center hover:bg-indigo-500/20 transition-colors">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
             </button>
          </div>
          {isReserveGame && (
            <p className="text-xs text-slate-500 mt-2">
              {reserveLoading ? '预约人数加载中...' : `已有 ${reserveTotal} 人预约`}
            </p>
          )}
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-3 gap-3 mt-4">
           <div className="card-bg p-3 rounded-2xl text-center border border-theme">
              <p className="text-[10px] text-slate-400 uppercase font-bold">版本</p>
              <p className="text-sm font-bold mt-1" style={{color: 'var(--text-primary)'}}>{game.version || '1.0.0'}</p>
           </div>
           <div className="card-bg p-3 rounded-2xl text-center border border-theme">
              <p className="text-[10px] text-slate-400 uppercase font-bold">大小</p>
              <p className="text-sm font-bold mt-1" style={{color: 'var(--text-primary)'}}>{game.size || '--'}</p>
           </div>
           <div className="card-bg p-3 rounded-2xl text-center border border-theme">
              <p className="text-[10px] text-slate-400 uppercase font-bold">开发商</p>
              <p className="text-sm font-bold mt-1 truncate px-1" title={game.developer} style={{color: 'var(--text-primary)'}}>{game.developer || '贪玩游戏'}</p>
           </div>
        </div>

        {/* Introduction */}
        <div className="mt-6">
          <h3 className="text-lg font-black mb-3 tracking-tight" style={{color: 'var(--text-primary)'}}>游戏介绍</h3>
          <div className="card-bg p-5 rounded-[24px] border border-theme shadow-sm">
             <p className="text-slate-500 text-sm leading-relaxed text-justify">
               {game.intro || game.description || "暂无详细介绍。"}
             </p>
          </div>
        </div>

        {/* Screenshots */}
        <div className="mt-6 mb-8">
          <h3 className="text-lg font-black mb-3 tracking-tight" style={{color: 'var(--text-primary)'}}>游戏预览</h3>
          <div className="flex space-x-4 overflow-x-auto no-scrollbar pb-2 -mx-5 px-5">
             {game.images && game.images.length > 0 ? (
                game.images.map((img, i) => (
                  <img 
                    key={i} 
                    src={img} 
                    className="w-72 h-40 object-cover rounded-2xl flex-shrink-0 shadow-md border border-theme" 
                    alt={`screenshot-${i}`} 
                  />
                ))
             ) : (
                <div className="w-full text-center py-8 text-slate-400 text-sm card-bg rounded-2xl border border-dashed border-theme">
                   暂无预览图
                </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameDetail;

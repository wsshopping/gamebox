
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api/index';
import { Game } from '../types';

const Rank: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'hot' | 'new' | 'soaring'>('hot');
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchRank = async () => {
      setIsLoading(true);
      try {
        const data = await api.game.getRankings(activeTab);
        if (isMounted) {
            setGames(data || []);
        }
      } catch (e) {
        console.error("Rank fetch failed", e);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchRank();
    return () => { isMounted = false; };
  }, [activeTab]);

  const getRankStyle = (index: number) => {
    switch (index) {
      case 0: return 'bg-yellow-400 text-white shadow-lg shadow-yellow-400/30 scale-110 border-2 border-yellow-200';
      case 1: return 'bg-slate-300 text-slate-800 shadow-md shadow-slate-300/30 scale-105 border-2 border-slate-200';
      case 2: return 'bg-amber-700 text-white shadow-md shadow-amber-700/30 scale-105 border-2 border-amber-600';
      default: return 'text-slate-500 bg-[var(--bg-primary)] font-medium border border-theme';
    }
  };

  const getCrown = (index: number) => {
      if (index === 0) return "👑";
      if (index === 1) return "🥈";
      if (index === 2) return "🥉";
      return null;
  }

  return (
    <div className="app-bg min-h-screen pb-10 transition-colors duration-500">
       {/* Header with Background */}
       <div className="relative bg-[var(--bg-card)] pb-16 pt-4 rounded-b-[40px] overflow-hidden shadow-xl border-b border-theme transition-colors duration-500">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[60px] -mr-16 -mt-16 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-rose-500/10 rounded-full blur-[40px] -ml-10 -mb-10 pointer-events-none"></div>

          <div className="relative z-10 px-4 flex items-center mb-8">
             <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-[var(--text-primary)] hover:bg-white/20 transition-colors border border-theme">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
             </button>
             <div className="flex-1 text-center mr-10">
                <h1 className="text-xl font-bold tracking-wide" style={{color: 'var(--text-primary)'}}>排行榜</h1>
             </div>
          </div>

          {/* Tabs */}
          <div className="flex justify-center space-x-10 relative z-10">
             {[
               { id: 'hot', label: '热门榜' },
               { id: 'new', label: '新游榜' },
               { id: 'soaring', label: '飙升榜' },
             ].map(tab => (
               <button 
                 key={tab.id}
                 onClick={() => setActiveTab(tab.id as any)}
                 className={`flex flex-col items-center group transition-all duration-300 ${activeTab === tab.id ? 'scale-110 opacity-100' : 'opacity-50 hover:opacity-80'}`}
               >
                 <span className={`text-base font-bold mb-2 tracking-wide ${activeTab === tab.id ? 'text-accent' : 'text-slate-400'}`}>{tab.label}</span>
                 <div className={`w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_10px_rgba(251,191,36,0.8)] transition-all duration-300 ${activeTab === tab.id ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}></div>
               </button>
             ))}
          </div>
       </div>

       {/* List */}
       <div className="px-5 -mt-8 relative z-20 space-y-4">
          {isLoading ? (
             [1, 2, 3, 4, 5].map(i => (
                <div key={i} className="card-bg rounded-[20px] h-20 animate-pulse shadow-sm border border-theme"></div>
             ))
          ) : (
             games.map((game, index) => (
               <div key={game.id} onClick={() => navigate(`/game/${game.id}`)} className="card-bg p-4 rounded-[24px] shadow-sm border border-theme flex items-center cursor-pointer active:scale-[0.98] transition-all hover:border-accent/30 hover:shadow-lg">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-4 text-base font-black relative ${getRankStyle(index)}`}>
                     {index < 3 ? getCrown(index) : index + 1}
                  </div>
                  
                  <div className="relative w-14 h-14 mr-4 flex-shrink-0">
                     <img src={game.icon} alt={game.title} className="w-full h-full rounded-2xl object-cover shadow-sm border border-theme" />
                  </div>
                  
                  <div className="flex-1 min-w-0 mr-2">
                     <h3 className="text-sm font-bold truncate" style={{color: 'var(--text-primary)'}}>{game.title}</h3>
                     <div className="flex items-center mt-1.5 space-x-2">
                        <span className="text-[10px] text-slate-500 bg-[var(--bg-primary)] px-2 py-0.5 rounded-md font-medium border border-theme">{game.category}</span>
                        {index < 3 && <span className="text-[10px] text-rose-500 flex items-center font-bold">🔥 {(10 - index) * 98}.{index}w</span>}
                     </div>
                  </div>

                  <button className="w-9 h-9 rounded-full bg-[var(--bg-primary)] text-[var(--text-primary)] flex items-center justify-center shadow-sm border border-theme active:bg-accent active:text-white transition-colors">
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  </button>
               </div>
             ))
          )}
       </div>
    </div>
  );
};

export default Rank;

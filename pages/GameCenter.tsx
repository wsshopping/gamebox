
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Game } from '../types';
import GameCard from '../components/GameCard';
import { useNavigate } from 'react-router-dom';

const GameCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'hot' | 'new' | 'reserve' | 'server'>('hot');
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGames = async () => {
      setIsLoading(true);
      try {
        const filter = activeTab === 'server' ? 'all' : activeTab;
        const data = await api.game.getList(filter);
        setGames(data);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchGames();
  }, [activeTab]);

  return (
    <div className="app-bg min-h-full pb-6 pt-[calc(5rem+env(safe-area-inset-top))] transition-colors duration-500">
      {/* Search Header */}
      <div className="glass-bg p-4 pt-[calc(1rem+env(safe-area-inset-top))] fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md z-40 border-b border-theme transition-colors duration-500">
        <div 
          onClick={() => navigate('/search')}
          className="card-bg border border-theme rounded-full flex items-center px-4 py-2.5 cursor-pointer hover:border-accent/50 transition-colors shadow-sm"
        >
          <svg className="w-5 h-5 text-slate-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <span className="text-sm text-slate-500">搜索游戏、礼包、攻略...</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex app-bg border-b border-theme overflow-x-auto no-scrollbar pt-2 sticky top-[calc(73px+env(safe-area-inset-top))] z-30 transition-colors duration-500">
        {[
          { id: 'hot', label: '热门' },
          { id: 'new', label: '新游' },
          { id: 'reserve', label: '预约' },
          { id: 'server', label: '开服' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 min-w-[20%] py-3 text-sm font-medium relative whitespace-nowrap transition-colors ${
                activeTab === tab.id 
                ? 'font-bold' 
                : 'text-slate-500 hover:text-[var(--text-secondary)]'
            }`}
            style={{ color: activeTab === tab.id ? 'var(--text-primary)' : '' }}
          >
            {tab.label}
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-1 bg-accent-gradient rounded-full shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
            )}
          </button>
        ))}
      </div>
      
      {activeTab === 'server' && (
        <div className="p-3 bg-indigo-500/10 text-indigo-500 text-xs text-center border-b border-theme">
           今日已开服 <span className="font-bold">12</span> 款游戏，快来体验！
        </div>
      )}

      {/* Game List */}
      <div className="p-4 space-y-3 min-h-[300px]">
        {isLoading ? (
           <div className="space-y-3">
             {[1, 2, 3, 4].map(i => (
               <div key={i} className="card-bg rounded-[20px] p-4 flex space-x-4 animate-pulse border border-theme">
                 <div className="w-[72px] h-[72px] bg-slate-700/20 rounded-2xl"></div>
                 <div className="flex-1 space-y-2 py-1">
                   <div className="h-4 bg-slate-700/20 rounded w-2/3"></div>
                   <div className="h-3 bg-slate-700/20 rounded w-1/3"></div>
                 </div>
               </div>
             ))}
           </div>
        ) : (
          <>
            {games.map(game => (
              <GameCard key={game.id} game={game} />
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default GameCenter;

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
        const data = await api.game.getList(activeTab);
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
    <div className="bg-[#f8fafc] min-h-full pb-6">
      {/* Search Header */}
      <div className="bg-white/90 backdrop-blur-md p-4 sticky top-0 z-40 border-b border-gray-100">
        <div 
          onClick={() => navigate('/search')}
          className="bg-gray-100 border border-gray-200 rounded-full flex items-center px-4 py-2.5 cursor-pointer hover:bg-gray-50 transition-colors"
        >
          <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <span className="text-sm text-gray-400">搜索游戏、礼包、攻略...</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white border-b border-gray-100 overflow-x-auto no-scrollbar pt-2">
        {[
          { id: 'hot', label: '热门' },
          { id: 'new', label: '新游' },
          { id: 'reserve', label: '预约' },
          { id: 'server', label: '开服' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 min-w-[20%] py-3 text-sm font-medium relative whitespace-nowrap transition-colors ${activeTab === tab.id ? 'text-gray-900 font-bold' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-violet-600 rounded-full" />
            )}
          </button>
        ))}
      </div>
      
      {activeTab === 'server' && (
        <div className="p-3 bg-blue-50 text-blue-600 text-xs text-center border-b border-blue-100">
           今日已开服 <span className="font-bold">12</span> 款游戏，快来体验！
        </div>
      )}

      {/* Game List */}
      <div className="p-4 space-y-3 min-h-[300px]">
        {isLoading ? (
           <div className="space-y-3">
             {[1, 2, 3, 4].map(i => (
               <div key={i} className="bg-white rounded-[20px] p-4 flex space-x-4 animate-pulse">
                 <div className="w-[72px] h-[72px] bg-slate-100 rounded-2xl"></div>
                 <div className="flex-1 space-y-2 py-1">
                   <div className="h-4 bg-slate-100 rounded w-2/3"></div>
                   <div className="h-3 bg-slate-100 rounded w-1/3"></div>
                 </div>
               </div>
             ))}
           </div>
        ) : (
          <>
            {games.map(game => (
              <GameCard key={game.id} game={game} />
            ))}
            {/* Mock Duplication for scroll test if list is short */}
            {activeTab === 'hot' && games.map(game => (
              <GameCard key={`dup-${game.id}`} game={game} />
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default GameCenter;
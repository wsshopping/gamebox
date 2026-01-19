import React, { useState } from 'react';
import { GAMES } from '../services/mockData';
import GameCard from '../components/GameCard';
import { useNavigate } from 'react-router-dom';

const GameCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'hot' | 'new' | 'reserve' | 'server'>('hot');
  const navigate = useNavigate();

  const getFilteredGames = () => {
     // Mock logic for filtering, just shuffling or slicing for demo
     if (activeTab === 'new') return [...GAMES].reverse();
     if (activeTab === 'reserve') return GAMES.slice(2, 5);
     if (activeTab === 'server') return GAMES.slice(0, 3);
     return GAMES;
  };

  return (
    <div className="bg-gray-50 min-h-full">
      {/* Search Header */}
      <div className="bg-white p-4 sticky top-0 z-40 shadow-sm">
        <div 
          onClick={() => navigate('/search')}
          className="bg-gray-100 rounded-full flex items-center px-4 py-2 cursor-pointer"
        >
          <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <span className="text-sm text-gray-400">搜索游戏、礼包、攻略...</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white border-b border-gray-100 overflow-x-auto no-scrollbar">
        {[
          { id: 'hot', label: '热门' },
          { id: 'new', label: '新游' },
          { id: 'reserve', label: '预约' },
          { id: 'server', label: '开服' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 min-w-[20%] py-3 text-sm font-medium relative whitespace-nowrap ${activeTab === tab.id ? 'text-blue-600 font-bold' : 'text-gray-500'}`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-4 h-1 bg-blue-600 rounded-full" />
            )}
          </button>
        ))}
      </div>
      
      {/* Secondary Banner for Tabs (Optional) */}
      {activeTab === 'server' && (
        <div className="p-3 bg-blue-50 text-blue-700 text-xs text-center">
           今日已开服 12 款游戏，快来体验！
        </div>
      )}

      {/* Game List */}
      <div className="p-4 space-y-3">
        {getFilteredGames().map(game => (
          <GameCard key={game.id} game={game} />
        ))}
         {/* Demo duplication for scrolling */}
         {activeTab === 'hot' && getFilteredGames().map(game => (
          <GameCard key={`dup-${game.id}`} game={game} />
        ))}
      </div>
    </div>
  );
};

export default GameCenter;
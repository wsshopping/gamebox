
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import GameCard from '../components/GameCard';
import { Game } from '../types';

const Search: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<{games: Game[], items: any[]} | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const hotSearches = ['古剑奇谭', '赛博飞车', '二次元', 'MMORPG', '代练', '首充号'];
  const history = ['王国保卫战', '策略游戏'];

  const handleSearch = async (term: string) => {
    if (!term.trim()) return;
    setSearchTerm(term);
    setIsLoading(true);
    setHasSearched(true);
    try {
      const data = await api.search.query(term);
      setResults(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(searchTerm);
    }
  };

  return (
    <div className="bg-white min-h-screen pb-10">
      {/* Search Header */}
      <div className="flex items-center p-4 border-b border-gray-100 sticky top-0 bg-white z-20">
         <button onClick={() => navigate(-1)} className="mr-3 text-gray-600 p-1">
           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
         </button>
         <div className="flex-1 bg-gray-100 rounded-full flex items-center px-4 py-2.5 transition-all focus-within:ring-2 focus-within:ring-indigo-100 focus-within:bg-white">
            <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="搜索游戏、礼包、帖子" 
              className="bg-transparent border-none outline-none flex-1 text-sm text-gray-900 placeholder-gray-400" 
              autoFocus
            />
            {searchTerm && (
               <button onClick={() => setSearchTerm('')} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
               </button>
            )}
         </div>
         <button 
           onClick={() => handleSearch(searchTerm)}
           className="ml-3 text-sm font-bold text-indigo-600 px-2 py-1 hover:bg-indigo-50 rounded-lg transition-colors"
         >
            搜索
         </button>
      </div>

      {!hasSearched ? (
        <>
          {/* History */}
          <div className="p-5">
            <div className="flex justify-between items-center mb-3">
               <h3 className="font-bold text-gray-900 text-sm">历史搜索</h3>
               <button className="text-gray-400 hover:text-gray-600 p-1">
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
               </button>
            </div>
            <div className="flex flex-wrap gap-2">
               {history.map(item => (
                 <button onClick={() => handleSearch(item)} key={item} className="px-3 py-1.5 bg-gray-50 text-gray-600 text-xs rounded-lg font-medium hover:bg-gray-100 transition-colors">{item}</button>
               ))}
            </div>
          </div>

          {/* Hot Search */}
          <div className="p-5 pt-0">
             <h3 className="font-bold text-gray-900 text-sm mb-3">热门搜索</h3>
             <div className="flex flex-wrap gap-2">
               {hotSearches.map((item, index) => (
                 <button 
                    key={item} 
                    onClick={() => handleSearch(item)}
                    className={`px-3 py-1.5 text-xs rounded-lg font-bold transition-colors flex items-center ${index < 3 ? 'bg-red-50 text-red-500 hover:bg-red-100' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                 >
                   {item} {index < 3 && <span className="ml-1 text-[10px]">🔥</span>}
                 </button>
               ))}
             </div>
          </div>
        </>
      ) : (
        /* Results */
        <div className="p-4 space-y-4 min-h-[500px]">
           {isLoading ? (
             <div className="flex flex-col items-center justify-center pt-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"></div>
                <p className="text-xs text-gray-400">正在搜索...</p>
             </div>
           ) : (
             <>
               {results && (results.games.length > 0 || results.items.length > 0) ? (
                 <>
                   {results.games.length > 0 && (
                     <div className="space-y-3">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">相关游戏</h3>
                        {results.games.map(game => (
                          <GameCard key={game.id} game={game} compact={true} />
                        ))}
                     </div>
                   )}
                   
                   {results.items.length > 0 && (
                     <div className="space-y-3 pt-2">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">相关交易</h3>
                        {results.items.map(item => (
                           <div key={item.id} className="bg-white p-3 rounded-xl border border-gray-100 flex items-center shadow-sm">
                              <div className="w-10 h-10 bg-gray-100 rounded-lg mr-3 overflow-hidden">
                                <img src={item.image} className="w-full h-full object-cover" />
                              </div>
                              <div className="flex-1">
                                <div className="text-sm font-bold text-gray-800 line-clamp-1">{item.title}</div>
                                <div className="text-amber-600 font-bold text-xs mt-0.5">¥{item.price}</div>
                              </div>
                           </div>
                        ))}
                     </div>
                   )}
                 </>
               ) : (
                 <div className="flex flex-col items-center justify-center pt-20 text-gray-400">
                    <div className="text-4xl mb-2">🤔</div>
                    <p className="text-sm">未找到相关内容，换个词试试？</p>
                 </div>
               )}
             </>
           )}
        </div>
      )}
    </div>
  );
};

export default Search;


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
    <div className="app-bg min-h-screen pb-10 transition-colors duration-500">
      {/* Search Header */}
      <div className="flex items-center p-4 border-b border-theme sticky top-0 glass-bg z-20">
         <button onClick={() => navigate(-1)} className="mr-3 text-slate-500 hover:text-[var(--text-primary)] p-1">
           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
         </button>
         <div className="flex-1 card-bg rounded-full flex items-center px-4 py-2.5 transition-all focus-within:ring-2 focus-within:ring-accent/20 border border-theme">
            <svg className="w-5 h-5 text-slate-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="搜索游戏、礼包、帖子" 
              className="bg-transparent border-none outline-none flex-1 text-sm text-[var(--text-primary)] placeholder-slate-500" 
              autoFocus
            />
            {searchTerm && (
               <button onClick={() => setSearchTerm('')} className="text-slate-400 hover:text-slate-200">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
               </button>
            )}
         </div>
         <button 
           onClick={() => handleSearch(searchTerm)}
           className="ml-3 text-sm font-bold text-accent px-2 py-1 hover:bg-accent/10 rounded-lg transition-colors"
         >
            搜索
         </button>
      </div>

      {!hasSearched ? (
        <>
          {/* History */}
          <div className="p-5">
            <div className="flex justify-between items-center mb-3">
               <h3 className="font-bold text-sm" style={{color: 'var(--text-primary)'}}>历史搜索</h3>
               <button className="text-slate-400 hover:text-slate-300 p-1">
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
               </button>
            </div>
            <div className="flex flex-wrap gap-2">
               {history.map(item => (
                 <button onClick={() => handleSearch(item)} key={item} className="px-3 py-1.5 card-bg border border-theme text-slate-500 text-xs rounded-lg font-medium hover:text-[var(--text-primary)] hover:border-accent/30 transition-colors">{item}</button>
               ))}
            </div>
          </div>

          {/* Hot Search */}
          <div className="p-5 pt-0">
             <h3 className="font-bold text-sm mb-3" style={{color: 'var(--text-primary)'}}>热门搜索</h3>
             <div className="flex flex-wrap gap-2">
               {hotSearches.map((item, index) => (
                 <button 
                    key={item} 
                    onClick={() => handleSearch(item)}
                    className={`px-3 py-1.5 text-xs rounded-lg font-bold transition-colors flex items-center border ${
                        index < 3 
                        ? 'bg-rose-500/10 text-rose-500 border-rose-500/20 hover:bg-rose-500/20' 
                        : 'card-bg text-slate-500 border-theme hover:text-[var(--text-primary)]'
                    }`}
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
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mb-4"></div>
                <p className="text-xs text-slate-500">正在搜索...</p>
             </div>
           ) : (
             <>
               {results && (results.games.length > 0 || results.items.length > 0) ? (
                 <>
                   {results.games.length > 0 && (
                     <div className="space-y-3">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">相关游戏</h3>
                        {results.games.map(game => (
                          <GameCard key={game.id} game={game} compact={true} />
                        ))}
                     </div>
                   )}
                   
                   {results.items.length > 0 && (
                     <div className="space-y-3 pt-2">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">相关交易</h3>
                        {results.items.map(item => (
                           <div key={item.id} className="card-bg p-3 rounded-xl border border-theme flex items-center shadow-sm">
                              <div className="w-10 h-10 bg-slate-700/20 rounded-lg mr-3 overflow-hidden border border-theme">
                                <img src={item.image} className="w-full h-full object-cover" />
                              </div>
                              <div className="flex-1">
                                <div className="text-sm font-bold line-clamp-1" style={{color: 'var(--text-primary)'}}>{item.title}</div>
                                <div className="text-accent font-bold text-xs mt-0.5">¥{item.price}</div>
                              </div>
                           </div>
                        ))}
                     </div>
                   )}
                 </>
               ) : (
                 <div className="flex flex-col items-center justify-center pt-20 text-slate-500">
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

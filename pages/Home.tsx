
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Game, Article } from '../types';
import GameCard from '../components/GameCard';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [games, setGames] = useState<Game[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [gamesData, articlesData] = await Promise.all([
          api.game.getHot(),
          api.community.getArticles()
        ]);
        setGames(gamesData);
        setArticles(articlesData);
      } catch (e) {
        console.error("Failed to load home data", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="bg-[#020617] min-h-full pb-10">
      {/* Premium Header: Dark Glass */}
      <div className="px-6 py-5 sticky top-0 z-40 flex items-center justify-between bg-[#020617]/80 backdrop-blur-xl border-b border-white/5 transition-all">
        <div className="flex items-center space-x-3">
          {/* Logo: Obsidian & Gold */}
          <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-slate-900 to-black flex items-center justify-center shadow-[0_0_15px_rgba(251,191,36,0.15)] relative overflow-hidden group border border-amber-500/20">
            {/* Gold Shine */}
            <div className="absolute top-0 right-0 w-8 h-8 bg-amber-500/10 rounded-full blur-md -mr-3 -mt-3"></div>
            {/* Icon */}
            <svg className="w-5 h-5 text-amber-400 relative z-10 drop-shadow-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 3L3.5 7.5V16.5L12 21L20.5 16.5V7.5L12 3Z" />
            </svg>
          </div>
          
          <div className="flex flex-col justify-center">
             <h1 className="text-xl font-black tracking-tight text-white font-sans leading-none flex items-center">
               贪玩盒子
             </h1>
             <span className="text-[10px] text-amber-500 font-bold tracking-[0.2em] uppercase scale-90 origin-left drop-shadow-[0_0_5px_rgba(245,158,11,0.5)]">PREMIUM</span>
          </div>
        </div>
        
        <button 
          onClick={() => navigate('/search')} 
          className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-900 border border-white/10 text-slate-400 hover:text-amber-400 hover:border-amber-500/30 hover:shadow-[0_0_10px_rgba(251,191,36,0.2)] transition-all duration-300"
        >
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </button>
      </div>

      {/* Hero Banner: Luxury Black Card Style */}
      <div className="px-6 mt-6 relative z-0">
        <div className="h-56 rounded-[32px] p-8 relative overflow-hidden group cursor-pointer shadow-[0_20px_50px_-10px_rgba(0,0,0,0.7)] transition-transform duration-500 hover:scale-[1.02] border border-white/5">
          {/* Dark Background */}
          <div className="absolute inset-0 bg-black"></div>
          
          {/* Gold Accents/Glows */}
          <div className="absolute top-[-80px] right-[-80px] w-64 h-64 bg-amber-600/10 rounded-full blur-[80px]"></div>
          <div className="absolute bottom-[-40px] left-[-40px] w-40 h-40 bg-yellow-700/10 rounded-full blur-[60px]"></div>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay"></div>
          
          <div className="relative z-10 h-full flex flex-col justify-center items-start">
            <div className="inline-flex items-center space-x-2 mb-4 bg-white/5 backdrop-blur-md px-3 py-1 rounded-full border border-amber-500/20">
               <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]"></span>
               <span className="text-amber-200 text-[10px] font-bold uppercase tracking-widest">Premium Event</span>
            </div>
            
            <h2 className="text-4xl font-black mb-2 leading-[0.9] tracking-tighter text-white font-serif italic">
              BLACK<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600 drop-shadow-sm">MYTH</span>
            </h2>
            
            <p className="text-slate-400 text-xs mb-6 font-medium max-w-[200px] leading-relaxed">
              Experience the legend. Exclusive rewards for VIP members.
            </p>
            
            <button onClick={() => navigate('/screen-welfare')} className="group/btn bg-gradient-to-r from-amber-500 to-yellow-700 text-black px-6 py-2.5 rounded-full text-xs font-bold shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:brightness-110 transition-all flex items-center">
              立即探索
              <svg className="w-3 h-3 ml-2 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Access: Dark Icons */}
      <div className="flex justify-between px-8 mt-10 mb-10">
        {[
          { name: '排行榜', icon: '🏆', path: '/newrank' },
          { name: '新游', icon: '⚡', path: '/game' },
          { name: '视频', icon: '▶', path: '/index/video' },
          { name: '交易', icon: '❖', path: '/trade' },
        ].map((item) => (
          <div key={item.name} onClick={() => navigate(item.path)} className="flex flex-col items-center space-y-3 cursor-pointer group">
            <div className="w-[68px] h-[68px] rounded-[22px] bg-[#0f172a] flex items-center justify-center text-2xl shadow-lg shadow-black/40 border border-white/5 group-hover:bg-black group-hover:border-amber-500/30 group-hover:shadow-[0_0_20px_rgba(251,191,36,0.1)] group-hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
               {/* Icon Color Change on Hover */}
               <span className="text-slate-400 group-hover:text-amber-400 transition-colors duration-300 drop-shadow-sm relative z-10">{item.icon}</span>
               {/* Subtle background shine on hover */}
               <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <span className="text-xs font-bold tracking-wide text-slate-500 group-hover:text-slate-200 transition-colors">{item.name}</span>
          </div>
        ))}
      </div>

      {/* Recommended Games */}
      <div className="px-6 mb-10">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white tracking-tight flex items-center">
             <span className="w-1 h-5 bg-gradient-to-b from-amber-400 to-amber-600 rounded-full mr-2 shadow-[0_0_8px_rgba(251,191,36,0.5)]"></span>
             精选推荐
          </h3>
          <span onClick={() => navigate('/game')} className="text-xs font-bold text-slate-500 flex items-center cursor-pointer hover:text-amber-400 transition-colors">
            查看全部 
            <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </span>
        </div>
        <div className="space-y-4 min-h-[200px]">
          {isLoading ? (
            // Skeleton
            [1, 2, 3].map(i => (
              <div key={i} className="bg-slate-900 rounded-[20px] p-4 flex space-x-4 animate-pulse border border-white/5">
                <div className="w-18 h-18 bg-slate-800 rounded-2xl w-[72px] h-[72px]"></div>
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-slate-800 rounded w-3/4"></div>
                  <div className="h-3 bg-slate-800 rounded w-1/4"></div>
                </div>
              </div>
            ))
          ) : (
            games.map(game => (
              <GameCard key={game.id} game={game} />
            ))
          )}
        </div>
      </div>

       {/* News */}
       <div className="px-6 pb-20">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white tracking-tight flex items-center">
             <span className="w-1 h-5 bg-gradient-to-b from-slate-500 to-slate-700 rounded-full mr-2"></span>
             前沿资讯
          </h3>
        </div>
        <div className="flex overflow-x-auto space-x-4 no-scrollbar pb-4 -mx-6 px-6">
          {isLoading ? (
            [1, 2].map(i => (
               <div key={i} className="min-w-[280px] bg-slate-900 p-4 rounded-[24px] h-[250px] animate-pulse border border-white/5"></div>
            ))
          ) : (
            articles.map(article => (
              <div 
                 key={article.id} 
                 onClick={() => navigate('/article')}
                 className="min-w-[280px] bg-[#0f172a] p-4 rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.4)] border border-white/5 cursor-pointer hover:border-amber-500/20 hover:shadow-[0_10px_30px_-5px_rgba(0,0,0,0.6)] transition-all group"
              >
                 <div className="relative h-36 rounded-2xl overflow-hidden mb-4">
                   <img src={article.image} alt={article.title} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" />
                   <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10">
                      <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wide">{article.tag}</span>
                   </div>
                 </div>
                 <h4 className="text-[15px] font-bold text-slate-100 leading-snug mb-2 line-clamp-2 group-hover:text-amber-400 transition-colors">{article.title}</h4>
                 <div className="flex items-center justify-between text-xs text-slate-500 group-hover:text-slate-400">
                    <span>{article.author}</span>
                    <span>{article.timestamp}</span>
                 </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GAMES, ARTICLES } from '../services/mockData';
import GameCard from '../components/GameCard';

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-[#0f172a] min-h-full pb-6">
      {/* Header */}
      <div className="bg-[#0f172a]/80 backdrop-blur-md p-4 sticky top-0 z-40 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/30">G</div>
          <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 tracking-tight">GameBox<span className="text-white text-xs ml-1 font-normal opacity-50">Pro</span></h1>
        </div>
        <div className="flex space-x-3">
          <button onClick={() => navigate('/search')} className="p-2 bg-white/5 rounded-full text-gray-300 hover:bg-white/10 transition-colors border border-white/5">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </button>
        </div>
      </div>

      {/* Banner */}
      <div className="p-4">
        <div className="h-44 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-6 text-white shadow-2xl shadow-purple-900/40 relative overflow-hidden group cursor-pointer">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-30"></div>
          <div className="absolute right-0 bottom-0 opacity-20 transform translate-x-1/4 translate-y-1/4 group-hover:scale-110 transition-transform duration-500">
            <svg className="w-48 h-48" fill="currentColor" viewBox="0 0 20 20"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
          </div>
          <div className="relative z-10">
            <span className="bg-black/30 backdrop-blur-sm text-xs px-2 py-0.5 rounded border border-white/10 mb-2 inline-block">限时活动</span>
            <h2 className="text-3xl font-black mb-1 italic">SUMMER<br/>PARTY</h2>
            <p className="text-purple-100 mb-4 text-sm">上线领取限定传说皮肤！</p>
            <button onClick={() => navigate('/screen-welfare')} className="bg-white text-purple-600 px-5 py-2 rounded-full text-xs font-bold hover:bg-gray-100 shadow-lg">
              立即查看
            </button>
          </div>
        </div>
      </div>

      {/* Quick Access */}
      <div className="grid grid-cols-4 gap-4 px-4 mb-6">
        {[
          { name: '排行榜', color: 'from-orange-400 to-red-500', icon: '🏆', path: '/newrank' },
          { name: '新游', color: 'from-emerald-400 to-teal-500', icon: '🆕', path: '/game' },
          { name: '视频', color: 'from-blue-400 to-cyan-500', icon: '📺', path: '/index/video' },
          { name: '交易', color: 'from-violet-400 to-fuchsia-500', icon: '💰', path: '/trade' },
        ].map((item) => (
          <div key={item.name} onClick={() => navigate(item.path)} className="flex flex-col items-center space-y-2 cursor-pointer group">
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-2xl shadow-lg shadow-gray-900/50 group-hover:scale-105 transition-transform border border-white/10`}>
              {item.icon}
            </div>
            <span className="text-xs text-gray-400 font-medium group-hover:text-white transition-colors">{item.name}</span>
          </div>
        ))}
      </div>

      {/* Recommended Games */}
      <div className="px-4 mb-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-bold text-white flex items-center"><span className="w-1 h-5 bg-blue-500 rounded-full mr-2"></span>精选推荐</h3>
          <span onClick={() => navigate('/game')} className="text-xs text-gray-500 flex items-center cursor-pointer hover:text-blue-400">
            更多 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </span>
        </div>
        <div className="space-y-3">
          {GAMES.slice(0, 3).map(game => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      </div>

       {/* News Feed Preview */}
       <div className="px-4 pb-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-bold text-white flex items-center"><span className="w-1 h-5 bg-purple-500 rounded-full mr-2"></span>最新资讯</h3>
          <span onClick={() => navigate('/article')} className="text-xs text-gray-500 cursor-pointer hover:text-purple-400">全部</span>
        </div>
        <div className="space-y-3">
          {ARTICLES.slice(0, 2).map(article => (
            <div key={article.id} className="bg-[#1e293b] p-3 rounded-xl border border-white/5 shadow-sm flex space-x-3 active:scale-[0.98] transition-transform" onClick={() => navigate('/article')}>
               <img src={article.image} alt={article.title} className="w-28 h-20 object-cover rounded-lg bg-gray-800" />
               <div className="flex-1 flex flex-col justify-between py-0.5">
                 <h4 className="text-sm font-semibold text-gray-200 line-clamp-2 leading-snug">{article.title}</h4>
                 <div className="flex justify-between items-center text-xs text-gray-500">
                    <span className="bg-[#0f172a] px-1.5 py-0.5 rounded text-blue-400 border border-white/5">{article.tag}</span>
                    <span>{article.timestamp}</span>
                 </div>
               </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
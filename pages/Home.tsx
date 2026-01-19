import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GAMES, ARTICLES } from '../services/mockData';
import GameCard from '../components/GameCard';

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-[#020617] min-h-full pb-6">
      {/* Immersive Header */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#020617] to-transparent z-10 pointer-events-none"></div>
      <div className="p-5 pt-6 sticky top-0 z-40 flex items-center justify-between backdrop-blur-sm">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <span className="text-white font-black text-sm italic">G</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">
            Game<span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">Box</span>
            <span className="text-[10px] ml-1 text-gray-500 font-normal uppercase tracking-widest border border-gray-700 px-1 rounded">Pro</span>
          </h1>
        </div>
        <div className="flex space-x-3">
          <button onClick={() => navigate('/search')} className="w-9 h-9 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white transition-all backdrop-blur-md">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </button>
        </div>
      </div>

      {/* Premium Banner */}
      <div className="px-5 mt-2 relative z-0">
        <div className="h-48 rounded-3xl p-6 text-white relative overflow-hidden group cursor-pointer shadow-[0_20px_50px_-12px_rgba(79,70,229,0.3)] border border-white/5">
          {/* Animated Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-violet-900 via-indigo-900 to-slate-900"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-500/20 rounded-full blur-[60px] -mr-16 -mt-16 mix-blend-screen"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/20 rounded-full blur-[50px] -ml-10 -mb-10 mix-blend-screen"></div>
          
          {/* Content */}
          <div className="relative z-10 h-full flex flex-col justify-center items-start">
            <div className="flex items-center space-x-2 mb-3">
               <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Exclusive</span>
            </div>
            <h2 className="text-3xl font-black mb-2 leading-none italic tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-400">
              SUMMER<br/>
              <span className="text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">LEGENDS</span>
            </h2>
            <p className="text-gray-300 text-xs mb-5 font-light max-w-[150px]">解锁限定皮肤与史诗级道具奖励。</p>
            <button onClick={() => navigate('/screen-welfare')} className="bg-white text-black px-6 py-2 rounded-full text-xs font-bold hover:bg-gray-200 shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all">
              立即参与
            </button>
          </div>
          
          {/* Graphic Element */}
          <div className="absolute right-0 bottom-0 w-40 h-full opacity-80 mix-blend-overlay pointer-events-none">
             {/* Abstract shape representing dynamic action */}
             <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-white/10 fill-current transform scale-150 translate-x-10 translate-y-10">
               <path d="M42.7,-62.9C54.1,-52.7,61.4,-39.1,66.9,-25.1C72.4,-11.1,76.1,3.3,71.8,15.6C67.5,27.9,55.2,38.1,42.9,46.5C30.6,54.9,18.3,61.5,4.7,63.1C-8.9,64.7,-23.8,61.3,-37.2,53.4C-50.6,45.5,-62.5,33.1,-67.6,18.3C-72.7,3.5,-71,-13.7,-62.9,-27.2C-54.8,-40.7,-40.3,-50.5,-26.4,-59.1C-12.5,-67.7,0.8,-75.1,13.8,-74.6C26.8,-74.1,39.5,-65.7,42.7,-62.9Z" transform="translate(100 100)" />
             </svg>
          </div>
        </div>
      </div>

      {/* Glass Icons Quick Access */}
      <div className="grid grid-cols-4 gap-3 px-5 mt-8 mb-8">
        {[
          { name: '排行榜', bg: 'bg-gradient-to-b from-orange-400/20 to-orange-600/20', border: 'border-orange-500/30', text: 'text-orange-400', icon: '🏆', path: '/newrank' },
          { name: '新游', bg: 'bg-gradient-to-b from-emerald-400/20 to-emerald-600/20', border: 'border-emerald-500/30', text: 'text-emerald-400', icon: '⚡', path: '/game' },
          { name: '视频', bg: 'bg-gradient-to-b from-cyan-400/20 to-cyan-600/20', border: 'border-cyan-500/30', text: 'text-cyan-400', icon: '▶', path: '/index/video' },
          { name: '交易', bg: 'bg-gradient-to-b from-purple-400/20 to-purple-600/20', border: 'border-purple-500/30', text: 'text-purple-400', icon: '❖', path: '/trade' },
        ].map((item) => (
          <div key={item.name} onClick={() => navigate(item.path)} className="flex flex-col items-center space-y-2 cursor-pointer group">
            <div className={`w-16 h-16 rounded-2xl ${item.bg} backdrop-blur-md flex items-center justify-center text-2xl border ${item.border} shadow-[0_8px_16px_-4px_rgba(0,0,0,0.5)] group-hover:scale-105 transition-all duration-300 relative overflow-hidden`}>
               <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
               <span className={`drop-shadow-lg transform group-hover:rotate-12 transition-transform duration-300`}>{item.icon}</span>
            </div>
            <span className={`text-xs font-medium tracking-wide ${item.text} opacity-80 group-hover:opacity-100 transition-opacity`}>{item.name}</span>
          </div>
        ))}
      </div>

      {/* Recommended Games */}
      <div className="px-5 mb-8">
        <div className="flex justify-between items-end mb-4">
          <h3 className="text-lg font-bold text-white tracking-tight flex items-center">
            <span className="w-1 h-5 bg-gradient-to-b from-violet-500 to-fuchsia-500 rounded-full mr-3 shadow-[0_0_10px_rgba(168,85,247,0.5)]"></span>
            精选推荐
          </h3>
          <span onClick={() => navigate('/game')} className="text-xs text-gray-500 flex items-center cursor-pointer hover:text-white transition-colors pb-1">
            全部 <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </span>
        </div>
        <div className="space-y-4">
          {GAMES.slice(0, 3).map(game => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      </div>

       {/* News Feed Preview */}
       <div className="px-5 pb-4">
        <div className="flex justify-between items-end mb-4">
          <h3 className="text-lg font-bold text-white tracking-tight flex items-center">
             <span className="w-1 h-5 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full mr-3 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></span>
             前沿资讯
          </h3>
        </div>
        <div className="space-y-3">
          {ARTICLES.slice(0, 2).map(article => (
            <div key={article.id} className="bg-[#111827]/40 p-3 rounded-2xl border border-white/5 shadow-sm flex space-x-4 active:scale-[0.98] transition-all hover:bg-[#1f2937]/50" onClick={() => navigate('/article')}>
               <div className="relative w-28 h-20 flex-shrink-0">
                 <img src={article.image} alt={article.title} className="w-full h-full object-cover rounded-xl shadow-lg" />
                 <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/10"></div>
               </div>
               <div className="flex-1 flex flex-col justify-between py-0.5">
                 <h4 className="text-sm font-semibold text-gray-200 line-clamp-2 leading-snug hover:text-blue-300 transition-colors">{article.title}</h4>
                 <div className="flex justify-between items-center text-[10px] text-gray-500 font-medium">
                    <span className="text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">{article.tag}</span>
                    <span className="opacity-70">{article.timestamp}</span>
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
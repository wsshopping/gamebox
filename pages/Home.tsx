import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GAMES, ARTICLES } from '../services/mockData';
import GameCard from '../components/GameCard';

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-[#f8fafc] min-h-full pb-6">
      {/* Light Header with Blur */}
      <div className="p-5 pt-6 sticky top-0 z-40 flex items-center justify-between bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-md shadow-violet-200">
            <span className="text-white font-black text-sm italic">G</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900">
            Game<span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600">Box</span>
            <span className="text-[10px] ml-1 text-gray-400 font-normal uppercase tracking-widest border border-gray-200 px-1 rounded">Pro</span>
          </h1>
        </div>
        <div className="flex space-x-3">
          <button onClick={() => navigate('/search')} className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-50 border border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-all">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </button>
        </div>
      </div>

      {/* Premium Banner - Keep colorful but ensure it pops on white */}
      <div className="px-5 mt-5 relative z-0">
        <div className="h-48 rounded-3xl p-6 text-white relative overflow-hidden group cursor-pointer shadow-xl shadow-indigo-100 border border-white">
          {/* Animated Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-400/30 rounded-full blur-[60px] -mr-16 -mt-16 mix-blend-screen"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/30 rounded-full blur-[50px] -ml-10 -mb-10 mix-blend-screen"></div>
          
          {/* Content */}
          <div className="relative z-10 h-full flex flex-col justify-center items-start">
            <div className="flex items-center space-x-2 mb-3">
               <span className="bg-white/20 text-white border border-white/30 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider backdrop-blur-md">Exclusive</span>
            </div>
            <h2 className="text-3xl font-black mb-2 leading-none italic tracking-tight text-white drop-shadow-md">
              SUMMER<br/>
              <span className="text-amber-300">LEGENDS</span>
            </h2>
            <p className="text-indigo-100 text-xs mb-5 font-medium max-w-[150px]">解锁限定皮肤与史诗级道具奖励。</p>
            <button onClick={() => navigate('/screen-welfare')} className="bg-white text-indigo-900 px-6 py-2 rounded-full text-xs font-bold hover:bg-indigo-50 shadow-lg transition-all">
              立即参与
            </button>
          </div>
          
          {/* Graphic Element */}
          <div className="absolute right-0 bottom-0 w-40 h-full opacity-60 mix-blend-overlay pointer-events-none">
             <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-white fill-current transform scale-150 translate-x-10 translate-y-10">
               <path d="M42.7,-62.9C54.1,-52.7,61.4,-39.1,66.9,-25.1C72.4,-11.1,76.1,3.3,71.8,15.6C67.5,27.9,55.2,38.1,42.9,46.5C30.6,54.9,18.3,61.5,4.7,63.1C-8.9,64.7,-23.8,61.3,-37.2,53.4C-50.6,45.5,-62.5,33.1,-67.6,18.3C-72.7,3.5,-71,-13.7,-62.9,-27.2C-54.8,-40.7,-40.3,-50.5,-26.4,-59.1C-12.5,-67.7,0.8,-75.1,13.8,-74.6C26.8,-74.1,39.5,-65.7,42.7,-62.9Z" transform="translate(100 100)" />
             </svg>
          </div>
        </div>
      </div>

      {/* Icons Quick Access - Lighter backgrounds */}
      <div className="grid grid-cols-4 gap-3 px-5 mt-8 mb-8">
        {[
          { name: '排行榜', bg: 'bg-orange-50', border: 'border-orange-100', text: 'text-orange-500', icon: '🏆', path: '/newrank' },
          { name: '新游', bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-500', icon: '⚡', path: '/game' },
          { name: '视频', bg: 'bg-cyan-50', border: 'border-cyan-100', text: 'text-cyan-500', icon: '▶', path: '/index/video' },
          { name: '交易', bg: 'bg-purple-50', border: 'border-purple-100', text: 'text-purple-500', icon: '❖', path: '/trade' },
        ].map((item) => (
          <div key={item.name} onClick={() => navigate(item.path)} className="flex flex-col items-center space-y-2 cursor-pointer group">
            <div className={`w-16 h-16 rounded-2xl ${item.bg} flex items-center justify-center text-2xl border ${item.border} shadow-sm group-hover:scale-105 transition-all duration-300`}>
               <span className={`drop-shadow-sm transform group-hover:rotate-12 transition-transform duration-300`}>{item.icon}</span>
            </div>
            <span className={`text-xs font-medium tracking-wide text-gray-600`}>{item.name}</span>
          </div>
        ))}
      </div>

      {/* Recommended Games */}
      <div className="px-5 mb-8">
        <div className="flex justify-between items-end mb-4">
          <h3 className="text-lg font-bold text-gray-900 tracking-tight flex items-center">
            <span className="w-1 h-5 bg-violet-600 rounded-full mr-3"></span>
            精选推荐
          </h3>
          <span onClick={() => navigate('/game')} className="text-xs text-gray-500 flex items-center cursor-pointer hover:text-violet-600 transition-colors pb-1">
            全部 <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </span>
        </div>
        <div className="space-y-4">
          {GAMES.slice(0, 3).map(game => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      </div>

       {/* News Feed Preview - White cards */}
       <div className="px-5 pb-4">
        <div className="flex justify-between items-end mb-4">
          <h3 className="text-lg font-bold text-gray-900 tracking-tight flex items-center">
             <span className="w-1 h-5 bg-blue-500 rounded-full mr-3"></span>
             前沿资讯
          </h3>
        </div>
        <div className="space-y-3">
          {ARTICLES.slice(0, 2).map(article => (
            <div key={article.id} className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm flex space-x-4 active:scale-[0.98] transition-all hover:shadow-md cursor-pointer" onClick={() => navigate('/article')}>
               <div className="relative w-28 h-20 flex-shrink-0">
                 <img src={article.image} alt={article.title} className="w-full h-full object-cover rounded-xl shadow-sm" />
               </div>
               <div className="flex-1 flex flex-col justify-between py-0.5">
                 <h4 className="text-sm font-bold text-gray-800 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">{article.title}</h4>
                 <div className="flex justify-between items-center text-[10px] text-gray-500 font-medium">
                    <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{article.tag}</span>
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
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GAMES, ARTICLES } from '../services/mockData';
import GameCard from '../components/GameCard';

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-[#f8fafc] min-h-full pb-10">
      {/* 
         Premium Header:
         - Minimalist
         - Blur backdrop
      */}
      <div className="px-6 py-5 sticky top-0 z-40 flex items-center justify-between bg-white/80 backdrop-blur-xl border-b border-white/50">
        <div className="flex items-center space-x-3">
          {/* Logo Mark */}
          <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center shadow-lg shadow-slate-200">
            <span className="text-white font-black text-sm italic tracking-tighter">GB</span>
          </div>
          {/* Text Logo */}
          <h1 className="text-xl font-black tracking-tight text-slate-900 font-sans">
            GAMEBOX
            <span className="text-[9px] align-top ml-1 text-amber-600 font-bold uppercase tracking-widest">PRO</span>
          </h1>
        </div>
        
        <button 
          onClick={() => navigate('/search')} 
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-slate-100 text-slate-400 hover:text-slate-900 hover:border-slate-300 hover:shadow-md transition-all duration-300"
        >
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </button>
      </div>

      {/* 
         Hero Banner: "Magazine" Style 
         - High quality gradient
         - Serif typography for contrast
      */}
      <div className="px-6 mt-6 relative z-0">
        <div className="h-56 rounded-[32px] p-8 text-white relative overflow-hidden group cursor-pointer shadow-[0_20px_50px_rgba(79,70,229,0.15)] transition-transform duration-500 hover:scale-[1.02]">
          {/* Background - Deep Premium Gradient */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-500 via-purple-600 to-slate-900"></div>
          
          {/* Noise Texture (Simulated with SVG pattern or subtle opacity) */}
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>

          {/* Abstract Glows */}
          <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-amber-400/30 rounded-full blur-[80px] mix-blend-screen"></div>
          <div className="absolute bottom-[-20px] left-[-20px] w-40 h-40 bg-cyan-400/20 rounded-full blur-[60px] mix-blend-screen"></div>
          
          {/* Content */}
          <div className="relative z-10 h-full flex flex-col justify-center items-start">
            <div className="inline-flex items-center space-x-2 mb-4 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
               <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
               <span className="text-white text-[10px] font-bold uppercase tracking-widest">Featured Event</span>
            </div>
            
            <h2 className="text-4xl font-black mb-2 leading-[0.9] tracking-tighter text-white drop-shadow-lg font-serif italic">
              SUMMER<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-400">LEGENDS</span>
            </h2>
            
            <p className="text-indigo-100 text-xs mb-6 font-medium max-w-[200px] leading-relaxed opacity-80">
              Unlock exclusive platinum skins and epic rewards in our seasonal event.
            </p>
            
            <button onClick={() => navigate('/screen-welfare')} className="group/btn bg-white text-slate-900 px-6 py-2.5 rounded-full text-xs font-bold shadow-xl hover:bg-slate-50 transition-all flex items-center">
              Explore Now
              <svg className="w-3 h-3 ml-2 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </button>
          </div>
        </div>
      </div>

      {/* 
         Quick Access - Apple Style Icons
         - White squares with soft shadow
         - Centered high contrast icons
      */}
      <div className="flex justify-between px-8 mt-10 mb-10">
        {[
          { name: '排行榜', icon: '🏆', color: 'text-amber-500', path: '/newrank' },
          { name: '新游', icon: '⚡', color: 'text-indigo-500', path: '/game' },
          { name: '视频', icon: '▶', color: 'text-rose-500', path: '/index/video' },
          { name: '交易', icon: '❖', color: 'text-emerald-500', path: '/trade' },
        ].map((item) => (
          <div key={item.name} onClick={() => navigate(item.path)} className="flex flex-col items-center space-y-3 cursor-pointer group">
            <div className="w-[68px] h-[68px] rounded-[22px] bg-white flex items-center justify-center text-2xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)] border border-white group-hover:shadow-[0_15px_30px_-5px_rgba(0,0,0,0.1)] group-hover:-translate-y-1 transition-all duration-300">
               <span className={`${item.color} drop-shadow-sm`}>{item.icon}</span>
            </div>
            <span className="text-xs font-semibold tracking-wide text-slate-600 group-hover:text-slate-900 transition-colors">{item.name}</span>
          </div>
        ))}
      </div>

      {/* Recommended Games - Clean Headers */}
      <div className="px-6 mb-10">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">精选推荐</h3>
          <span onClick={() => navigate('/game')} className="text-xs font-bold text-slate-400 flex items-center cursor-pointer hover:text-slate-900 transition-colors">
            查看全部 
            <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </span>
        </div>
        <div className="space-y-4">
          {GAMES.slice(0, 3).map(game => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      </div>

       {/* News - Horizontal Scroll for Premium Feel */}
       <div className="px-6 pb-20">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">前沿资讯</h3>
        </div>
        <div className="flex overflow-x-auto space-x-4 no-scrollbar pb-4 -mx-6 px-6">
          {ARTICLES.map(article => (
            <div 
               key={article.id} 
               onClick={() => navigate('/article')}
               className="min-w-[280px] bg-white p-4 rounded-[24px] shadow-[0_8px_20px_rgba(0,0,0,0.03)] border border-slate-50 cursor-pointer hover:shadow-lg transition-all"
            >
               <div className="relative h-36 rounded-2xl overflow-hidden mb-4">
                 <img src={article.image} alt={article.title} className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700" />
                 <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg">
                    <span className="text-[10px] font-bold text-slate-900 uppercase tracking-wide">{article.tag}</span>
                 </div>
               </div>
               <h4 className="text-[15px] font-bold text-slate-900 leading-snug mb-2 line-clamp-2">{article.title}</h4>
               <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>{article.author}</span>
                  <span>{article.timestamp}</span>
               </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
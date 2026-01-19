import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GAMES, ARTICLES } from '../services/mockData';
import GameCard from '../components/GameCard';

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-gray-50 min-h-full">
      {/* Header */}
      <div className="bg-white p-4 sticky top-0 z-40 shadow-sm flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">G</div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">GameBox</h1>
        </div>
        <div className="flex space-x-3">
          <button onClick={() => navigate('/search')} className="p-2 bg-gray-100 rounded-full text-gray-600">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </button>
        </div>
      </div>

      {/* Banner */}
      <div className="p-4">
        <div className="h-40 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="absolute right-0 bottom-0 opacity-20 transform translate-x-1/4 translate-y-1/4">
            <svg className="w-48 h-48" fill="currentColor" viewBox="0 0 20 20"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
          </div>
          <h2 className="text-2xl font-bold mb-2 relative z-10">夏日狂欢季</h2>
          <p className="text-blue-100 mb-4 relative z-10">上线领取限定好礼！</p>
          <button onClick={() => navigate('/screen-welfare')} className="bg-white text-blue-600 px-4 py-1.5 rounded-full text-sm font-semibold relative z-10 hover:bg-gray-100">
            立即查看
          </button>
        </div>
      </div>

      {/* Quick Access */}
      <div className="grid grid-cols-4 gap-4 px-4 mb-6">
        {[
          { name: '排行榜', color: 'bg-red-100 text-red-600', icon: '🏆', path: '/newrank' },
          { name: '新游', color: 'bg-green-100 text-green-600', icon: '🆕', path: '/game' },
          { name: '视频', color: 'bg-purple-100 text-purple-600', icon: '📺', path: '/index/video' },
          { name: '交易', color: 'bg-orange-100 text-orange-600', icon: '💰', path: '/trade' },
        ].map((item) => (
          <div key={item.name} onClick={() => navigate(item.path)} className="flex flex-col items-center space-y-2 cursor-pointer hover:opacity-80 transition-opacity">
            <div className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center text-2xl shadow-sm`}>
              {item.icon}
            </div>
            <span className="text-xs text-gray-600 font-medium">{item.name}</span>
          </div>
        ))}
      </div>

      {/* Recommended Games */}
      <div className="px-4 mb-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-bold text-gray-800">精选推荐</h3>
          <span onClick={() => navigate('/game')} className="text-sm text-gray-500 flex items-center cursor-pointer">
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
          <h3 className="text-lg font-bold text-gray-800">最新资讯</h3>
          <span onClick={() => navigate('/article')} className="text-sm text-gray-500 cursor-pointer">全部</span>
        </div>
        <div className="space-y-3">
          {ARTICLES.slice(0, 2).map(article => (
            <div key={article.id} className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex space-x-3" onClick={() => navigate('/article')}>
               <img src={article.image} alt={article.title} className="w-24 h-16 object-cover rounded-lg" />
               <div className="flex-1">
                 <h4 className="text-sm font-semibold text-gray-800 line-clamp-2">{article.title}</h4>
                 <div className="flex justify-between mt-2 text-xs text-gray-400">
                    <span>{article.tag}</span>
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
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GAMES } from '../services/mockData';

const GameDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const game = GAMES.find(g => g.id === id) || GAMES[0];

  return (
    <div className="bg-white min-h-screen relative">
      {/* Back Button */}
      <button onClick={() => navigate(-1)} className="absolute top-4 left-4 z-50 bg-black/30 text-white p-2 rounded-full backdrop-blur-md">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
      </button>

      {/* Hero Image */}
      <div className="h-64 bg-gray-200 relative">
        <img src={game.images ? game.images[0] : 'https://picsum.photos/400/300'} alt="cover" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
      </div>

      {/* Content */}
      <div className="px-5 -mt-12 relative z-10">
        <div className="flex items-start space-x-4 mb-4">
           <img src={game.icon} alt={game.title} className="w-24 h-24 rounded-2xl shadow-lg border-4 border-white" />
           <div className="pt-12">
             <h1 className="text-xl font-bold text-gray-900 leading-tight">{game.title}</h1>
             <p className="text-sm text-gray-500 mt-1">{game.category} • {game.downloads} 次下载</p>
           </div>
        </div>

        {/* Tags */}
        <div className="flex space-x-2 mb-6">
          {game.tags.map(tag => (
            <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">{tag}</span>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4 mb-8">
           <button className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-200">
             立即下载
           </button>
           <button className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
           </button>
        </div>

        {/* Description */}
        <div className="mb-8">
          <h3 className="font-bold text-gray-900 mb-2">游戏介绍</h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            {game.description || "加入这场史诗般的冒险，体验战斗的快感。与全球数百万玩家并肩作战。"}
          </p>
        </div>

        {/* Screenshots */}
        <div className="mb-8">
          <h3 className="font-bold text-gray-900 mb-3">游戏预览</h3>
          <div className="flex space-x-3 overflow-x-auto no-scrollbar">
             {game.images?.map((img, i) => (
               <img key={i} src={img} className="w-64 h-36 object-cover rounded-lg flex-shrink-0" alt="screenshot" />
             ))}
             {!game.images && (
                <>
                 <div className="w-64 h-36 bg-gray-200 rounded-lg flex-shrink-0"></div>
                 <div className="w-64 h-36 bg-gray-200 rounded-lg flex-shrink-0"></div>
                </>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameDetail;
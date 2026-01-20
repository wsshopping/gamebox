
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Game } from '../types';

const GameDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [game, setGame] = useState<Game | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadGame = async () => {
      if (!id) return;
      try {
        const data = await api.game.getById(id);
        setGame(data);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    loadGame();
  }, [id]);

  const handleDownload = () => {
    if (game?.downloadUrl) {
      window.open(game.downloadUrl, '_blank');
    } else {
      alert('下载链接暂未配置');
    }
  };

  if (isLoading) {
    return (
       <div className="bg-white min-h-screen flex items-center justify-center">
         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
       </div>
    );
  }

  if (!game) {
    return (
      <div className="bg-white min-h-screen flex flex-col items-center justify-center p-6">
        <div className="text-4xl mb-4">👾</div>
        <p className="text-gray-500 font-bold mb-4">游戏未找到</p>
        <button onClick={() => navigate(-1)} className="text-blue-600 font-bold">返回</button>
      </div>
    );
  }

  // Use configured banner or fallback to first screenshot or placeholder
  const heroImage = game.banner || (game.images && game.images.length > 0 ? game.images[0] : 'https://picsum.photos/800/400?blur=5');

  return (
    <div className="bg-[#f8fafc] min-h-screen relative pb-10">
      {/* Back Button */}
      <button onClick={() => navigate(-1)} className="absolute top-4 left-4 z-50 bg-black/20 hover:bg-black/30 text-white p-2 rounded-full backdrop-blur-md transition-all">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
      </button>

      {/* Hero Image */}
      <div className="h-64 relative overflow-hidden">
        <img src={heroImage} alt="cover" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#f8fafc] via-transparent to-black/20"></div>
      </div>

      {/* Header Content */}
      <div className="px-5 -mt-12 relative z-10">
        <div className="bg-white rounded-[24px] p-5 shadow-xl shadow-slate-200/50 border border-white">
          <div className="flex items-start space-x-4">
             <img src={game.icon} alt={game.title} className="w-20 h-20 rounded-[20px] shadow-md border-2 border-white -mt-10 bg-white" />
             <div className="pt-0 flex-1 min-w-0">
               <h1 className="text-xl font-black text-slate-900 leading-tight truncate">{game.title}</h1>
               <div className="flex items-center space-x-2 mt-1">
                 <span className="text-xs font-bold bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md">{game.category}</span>
                 <span className="text-xs text-slate-400 font-medium">{game.size || '未知大小'}</span>
               </div>
             </div>
             <div className="flex flex-col items-center justify-center bg-amber-50 px-3 py-1 rounded-xl">
                 <span className="text-amber-500 text-xs font-bold">★ {game.rating}</span>
             </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-4">
            {game.tags.map(tag => (
              <span key={tag} className="px-2.5 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-lg">#{tag}</span>
            ))}
          </div>

          {/* Download Action */}
          <div className="mt-6 flex space-x-3">
             <button 
               onClick={handleDownload}
               className="flex-1 bg-slate-900 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-slate-200 active:scale-95 transition-all hover:bg-slate-800 flex items-center justify-center"
             >
               <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
               立即下载
             </button>
             <button className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center hover:bg-indigo-100 transition-colors">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
             </button>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-3 gap-3 mt-4">
           <div className="bg-white p-3 rounded-2xl text-center border border-slate-50">
              <p className="text-[10px] text-slate-400 uppercase font-bold">版本</p>
              <p className="text-sm font-bold text-slate-800 mt-1">{game.version || '1.0.0'}</p>
           </div>
           <div className="bg-white p-3 rounded-2xl text-center border border-slate-50">
              <p className="text-[10px] text-slate-400 uppercase font-bold">大小</p>
              <p className="text-sm font-bold text-slate-800 mt-1">{game.size || '--'}</p>
           </div>
           <div className="bg-white p-3 rounded-2xl text-center border border-slate-50">
              <p className="text-[10px] text-slate-400 uppercase font-bold">开发商</p>
              <p className="text-sm font-bold text-slate-800 mt-1 truncate px-1" title={game.developer}>{game.developer || '贪玩游戏'}</p>
           </div>
        </div>

        {/* Introduction */}
        <div className="mt-6">
          <h3 className="text-lg font-black text-slate-900 mb-3 tracking-tight">游戏介绍</h3>
          <div className="bg-white p-5 rounded-[24px] border border-slate-50 shadow-sm">
             <p className="text-slate-600 text-sm leading-relaxed text-justify">
               {game.intro || game.description || "暂无详细介绍。"}
             </p>
          </div>
        </div>

        {/* Screenshots */}
        <div className="mt-6 mb-8">
          <h3 className="text-lg font-black text-slate-900 mb-3 tracking-tight">游戏预览</h3>
          <div className="flex space-x-4 overflow-x-auto no-scrollbar pb-2 -mx-5 px-5">
             {game.images && game.images.length > 0 ? (
                game.images.map((img, i) => (
                  <img 
                    key={i} 
                    src={img} 
                    className="w-72 h-40 object-cover rounded-2xl flex-shrink-0 shadow-md border border-slate-100" 
                    alt={`screenshot-${i}`} 
                  />
                ))
             ) : (
                <div className="w-full text-center py-8 text-slate-400 text-sm bg-white rounded-2xl border border-dashed border-slate-200">
                   暂无预览图
                </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameDetail;

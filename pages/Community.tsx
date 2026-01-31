
import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Article } from '../types';

const Community: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [activeTab, setActiveTab] = useState('推荐');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
       setIsLoading(true);
       try {
         const data = await api.community.getArticles(activeTab);
         setArticles(data);
       } finally {
         setIsLoading(false);
       }
    };
    fetchArticles();
  }, [activeTab]);

  return (
    <div className="app-bg min-h-full transition-colors duration-500 pb-20 pt-[calc(5rem+env(safe-area-inset-top))]">
       <div className="glass-bg p-4 pt-[calc(1rem+env(safe-area-inset-top))] fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md z-40 shadow-sm flex items-center justify-between border-b border-theme transition-colors duration-500">
         <h1 className="text-xl font-bold" style={{color: 'var(--text-primary)'}}>社区</h1>
         <div className="flex space-x-2">
           <button className="p-2 text-slate-500 hover:text-[var(--text-primary)] card-bg border border-theme rounded-full transition-colors">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
           </button>
           <button className="p-2 text-white bg-blue-600 rounded-full shadow-md hover:bg-blue-500 transition-colors">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
           </button>
         </div>
       </div>

       {/* Topics */}
       <div className="flex overflow-x-auto space-x-2 p-4 app-bg border-b border-theme no-scrollbar transition-colors duration-500">
          {['推荐', '综合', '攻略', '同人', '问答'].map((topic) => (
             <span 
                key={topic} 
                onClick={() => setActiveTab(topic)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap cursor-pointer transition-all border ${
                    activeTab === topic 
                    ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] border-[var(--text-primary)]' 
                    : 'card-bg text-slate-500 border-theme hover:text-[var(--text-primary)]'
                }`}
             >
               {topic}
             </span>
          ))}
       </div>

       {/* Feed */}
       <div className="p-4 space-y-4 min-h-[300px]">
         {isLoading ? (
            [1, 2, 3].map(i => (
               <div key={i} className="card-bg rounded-xl p-4 shadow-sm h-64 animate-pulse border border-theme">
                  <div className="flex space-x-2 mb-4">
                     <div className="w-8 h-8 bg-slate-700/20 rounded-full"></div>
                     <div className="h-8 bg-slate-700/20 rounded w-1/3"></div>
                  </div>
                  <div className="h-4 bg-slate-700/20 rounded w-3/4 mb-4"></div>
                  <div className="h-32 bg-slate-700/20 rounded"></div>
               </div>
            ))
         ) : (
            articles.map(article => (
              <div key={article.id} className="card-bg rounded-xl p-4 shadow-sm border border-theme hover:border-accent/30 transition-all">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-slate-700/20 border border-theme overflow-hidden">
                     <img src={`https://picsum.photos/50/50?random=${article.author}`} alt="" className="w-full h-full object-cover"/>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold" style={{color: 'var(--text-primary)'}}>{article.author}</p>
                    <p className="text-[10px] text-slate-500">{article.timestamp}</p>
                  </div>
                  <span className="text-[10px] bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded border border-blue-500/20">{article.tag}</span>
                </div>
                
                <h3 className="font-bold text-sm mb-2 leading-relaxed" style={{color: 'var(--text-primary)'}}>{article.title}</h3>
                
                {article.image && (
                  <div className="rounded-lg overflow-hidden mb-3 h-40 border border-theme">
                      <img src={article.image} alt="post" className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="flex items-center justify-between text-slate-500 text-xs">
                    <div className="flex space-x-4">
                      <span className="flex items-center"><span className="mr-1">👁</span> {article.views}</span>
                      <span className="flex items-center"><span className="mr-1">💬</span> {article.comments}</span>
                    </div>
                    <button className="flex items-center space-x-1 hover:text-red-500 transition-colors">
                      <span>👍</span> <span>点赞</span>
                    </button>
                </div>
              </div>
            ))
         )}
       </div>
    </div>
  );
};

export default Community;

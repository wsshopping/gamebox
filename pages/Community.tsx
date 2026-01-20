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
    <div className="bg-gray-50 min-h-full">
       <div className="bg-white p-4 sticky top-0 z-40 shadow-sm flex items-center justify-between">
         <h1 className="text-xl font-bold text-gray-900">社区</h1>
         <div className="flex space-x-2">
           <button className="p-2 text-gray-500 bg-gray-100 rounded-full">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
           </button>
           <button className="p-2 text-white bg-blue-600 rounded-full shadow-md">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
           </button>
         </div>
       </div>

       {/* Topics */}
       <div className="flex overflow-x-auto space-x-2 p-4 bg-white border-b border-gray-100 no-scrollbar">
          {['推荐', '综合', '攻略', '同人', '问答'].map((topic) => (
             <span 
                key={topic} 
                onClick={() => setActiveTab(topic)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap cursor-pointer transition-colors ${activeTab === topic ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'}`}
             >
               {topic}
             </span>
          ))}
       </div>

       {/* Feed */}
       <div className="p-4 space-y-4 min-h-[300px]">
         {isLoading ? (
            [1, 2, 3].map(i => (
               <div key={i} className="bg-white rounded-xl p-4 shadow-sm h-64 animate-pulse">
                  <div className="flex space-x-2 mb-4">
                     <div className="w-8 h-8 bg-gray-100 rounded-full"></div>
                     <div className="h-8 bg-gray-100 rounded w-1/3"></div>
                  </div>
                  <div className="h-4 bg-gray-100 rounded w-3/4 mb-4"></div>
                  <div className="h-32 bg-gray-100 rounded"></div>
               </div>
            ))
         ) : (
            articles.map(article => (
              <div key={article.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200" />
                  <div className="flex-1">
                    <p className="text-xs font-bold text-gray-800">{article.author}</p>
                    <p className="text-[10px] text-gray-400">{article.timestamp}</p>
                  </div>
                  <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded">{article.tag}</span>
                </div>
                
                <h3 className="font-bold text-gray-900 mb-2">{article.title}</h3>
                
                {article.image && (
                  <div className="rounded-lg overflow-hidden mb-3 h-40">
                      <img src={article.image} alt="post" className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="flex items-center justify-between text-gray-500 text-xs">
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
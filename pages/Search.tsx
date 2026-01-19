import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Search: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const hotSearches = ['古剑奇谭', '赛博飞车', '二次元', 'MMORPG', '代练', '首充号'];
  const history = ['王国保卫战', '策略游戏'];

  return (
    <div className="bg-white min-h-screen">
      {/* Search Header */}
      <div className="flex items-center p-4 border-b border-gray-100">
         <button onClick={() => navigate(-1)} className="mr-3 text-gray-600">
           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
         </button>
         <div className="flex-1 bg-gray-100 rounded-full flex items-center px-4 py-2">
            <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="搜索游戏、礼包、帖子" 
              className="bg-transparent border-none outline-none flex-1 text-sm text-gray-700" 
              autoFocus
            />
         </div>
         <button className="ml-3 text-sm font-medium text-blue-600">搜索</button>
      </div>

      {/* History */}
      <div className="p-4">
        <div className="flex justify-between items-center mb-3">
           <h3 className="font-bold text-gray-800 text-sm">历史搜索</h3>
           <button className="text-gray-400">
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
           </button>
        </div>
        <div className="flex flex-wrap gap-2">
           {history.map(item => (
             <span key={item} className="px-3 py-1 bg-gray-50 text-gray-600 text-xs rounded-full">{item}</span>
           ))}
        </div>
      </div>

      {/* Hot Search */}
      <div className="p-4">
         <h3 className="font-bold text-gray-800 text-sm mb-3">热门搜索</h3>
         <div className="flex flex-wrap gap-2">
           {hotSearches.map((item, index) => (
             <span key={item} className={`px-3 py-1 text-xs rounded-full ${index < 3 ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-600'}`}>
               {item} {index < 3 && '🔥'}
             </span>
           ))}
         </div>
      </div>
    </div>
  );
};

export default Search;
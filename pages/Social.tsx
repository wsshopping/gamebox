import React, { useState } from 'react';
import Trade from './Trade';
import MessageList from './MessageList';

const Social: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'trade' | 'message'>('trade');

  return (
    <div className="bg-[#0f172a] min-h-full flex flex-col">
      {/* Sticky Tab Header */}
      <div className="bg-[#0f172a]/80 backdrop-blur-md sticky top-0 z-40 border-b border-white/5 pt-4 pb-2">
        <div className="flex justify-center p-2">
           <div className="flex bg-[#1e293b] p-1 rounded-xl border border-white/5">
             <button 
               onClick={() => setActiveTab('trade')}
               className={`px-8 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${
                 activeTab === 'trade' 
                 ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                 : 'text-gray-400 hover:text-gray-200'
               }`}
             >
               市场交易
             </button>
             <button 
               onClick={() => setActiveTab('message')}
               className={`px-8 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${
                 activeTab === 'message' 
                 ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                 : 'text-gray-400 hover:text-gray-200'
               }`}
             >
               消息中心
             </button>
           </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1">
        {activeTab === 'trade' ? (
          <Trade isEmbedded={true} />
        ) : (
          <MessageList isEmbedded={true} />
        )}
      </div>
    </div>
  );
};

export default Social;
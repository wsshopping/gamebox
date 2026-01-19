import React, { useState } from 'react';
import Trade from './Trade';
import MessageList from './MessageList';

const Social: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'trade' | 'message'>('trade');

  return (
    <div className="bg-gray-50 min-h-full flex flex-col">
      {/* Sticky Tab Header */}
      <div className="bg-white sticky top-0 z-40 shadow-sm">
        <div className="flex justify-center p-2">
           <div className="flex bg-gray-100 p-1 rounded-lg">
             <button 
               onClick={() => setActiveTab('trade')}
               className={`px-6 py-1.5 rounded-md text-sm font-bold transition-all ${
                 activeTab === 'trade' 
                 ? 'bg-white text-blue-600 shadow-sm' 
                 : 'text-gray-500 hover:text-gray-700'
               }`}
             >
               市场交易
             </button>
             <button 
               onClick={() => setActiveTab('message')}
               className={`px-6 py-1.5 rounded-md text-sm font-bold transition-all ${
                 activeTab === 'message' 
                 ? 'bg-white text-blue-600 shadow-sm' 
                 : 'text-gray-500 hover:text-gray-700'
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
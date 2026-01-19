import React, { useState } from 'react';
import Trade from './Trade';
import MessageList from './MessageList';

const Social: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'trade' | 'message'>('trade');

  return (
    <div className="bg-[#f8fafc] min-h-full flex flex-col">
      {/* Sticky Tab Header */}
      <div className="bg-white/90 backdrop-blur-xl sticky top-0 z-40 border-b border-gray-100 pt-4 pb-3">
        <div className="flex justify-center px-4">
           <div className="relative flex w-full max-w-xs bg-gray-100 p-1 rounded-2xl shadow-inner">
             {/* Slider Background - White */}
             <div 
               className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-xl shadow-sm border border-gray-200 transition-all duration-300 ease-out ${
                 activeTab === 'trade' ? 'left-1' : 'left-[calc(50%+4px)]'
               }`}
             ></div>
             
             <button 
               onClick={() => setActiveTab('trade')}
               className={`relative flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 z-10 ${
                 activeTab === 'trade' 
                 ? 'text-gray-900' 
                 : 'text-gray-500 hover:text-gray-700'
               }`}
             >
               市场交易
             </button>
             <button 
               onClick={() => setActiveTab('message')}
               className={`relative flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 z-10 ${
                 activeTab === 'message' 
                 ? 'text-gray-900' 
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
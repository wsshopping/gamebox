import React, { useState } from 'react';
import Trade from './Trade';
import MessageList from './MessageList';
import Agency from './Agency';

const Social: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'trade' | 'message' | 'agency'>('trade');

  return (
    <div className="bg-[#f8fafc] min-h-full flex flex-col">
      {/* Sticky Tab Header */}
      <div className="bg-white/90 backdrop-blur-xl sticky top-0 z-40 border-b border-gray-100 pt-4 pb-3">
        <div className="flex justify-center px-4">
           <div className="relative flex w-full max-w-sm bg-gray-100 p-1 rounded-2xl shadow-inner">
             {/* Slider Background */}
             <div 
               className={`absolute top-1 bottom-1 w-[calc(33.33%-4px)] bg-white rounded-xl shadow-sm border border-gray-200 transition-all duration-300 ease-out ${
                 activeTab === 'trade' ? 'left-1' : 
                 activeTab === 'message' ? 'left-[calc(33.33%+2px)]' : 
                 'left-[calc(66.66%+2px)]'
               }`}
             ></div>
             
             {['trade', 'message', 'agency'].map(tab => (
                 <button 
                   key={tab}
                   onClick={() => setActiveTab(tab as any)}
                   className={`relative flex-1 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 z-10 ${
                     activeTab === tab 
                     ? 'text-gray-900' 
                     : 'text-gray-500 hover:text-gray-700'
                   }`}
                 >
                   {tab === 'trade' ? '市场交易' : tab === 'message' ? '消息中心' : '代理中心'}
                 </button>
             ))}
           </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1">
        {activeTab === 'trade' && <Trade isEmbedded={true} />}
        {activeTab === 'message' && <MessageList isEmbedded={true} />}
        {activeTab === 'agency' && <Agency />}
      </div>
    </div>
  );
};

export default Social;
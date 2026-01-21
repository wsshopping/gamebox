
import React, { useState } from 'react';
import Trade from './Trade';
import MessageList from './MessageList';
import Agency from './Agency';

const Social: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'trade' | 'message' | 'agency'>('trade');

  return (
    <div className="app-bg min-h-full flex flex-col transition-colors duration-500">
      {/* Sticky Tab Header - Premium Dark Glass */}
      <div className="glass-bg sticky top-0 z-40 border-b border-theme pt-4 pb-3 transition-colors duration-500">
        <div className="flex justify-center px-4">
           <div className="relative flex w-full max-w-sm bg-[var(--bg-primary)] p-1 rounded-2xl border border-theme shadow-lg shadow-black/5">
             {/* Slider Background - Adaptive color */}
             <div 
               className={`absolute top-1 bottom-1 w-[calc(33.33%-4px)] bg-accent-color/20 rounded-xl shadow-sm border border-accent/20 transition-all duration-300 ease-out ${
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
                     ? 'text-accent' 
                     : 'text-slate-500 hover:text-[var(--text-primary)]'
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

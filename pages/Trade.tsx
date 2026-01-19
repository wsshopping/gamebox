import React from 'react';
import { TRADE_ITEMS } from '../services/mockData';

interface TradeProps {
  isEmbedded?: boolean;
}

const Trade: React.FC<TradeProps> = ({ isEmbedded = false }) => {
  return (
    <div className={`bg-gray-50 min-h-full ${isEmbedded ? '' : ''}`}>
      {/* Header - Only show if not embedded */}
      {!isEmbedded && (
        <div className="bg-white p-4 sticky top-0 z-40 shadow-sm flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">交易市场</h1>
          <button className="text-sm text-blue-600 font-medium">我的发布</button>
        </div>
      )}

      {/* Categories */}
      <div className="flex overflow-x-auto space-x-2 p-4 no-scrollbar">
        {['全部', '账号', '道具', '游戏币', '代练'].map((cat, idx) => (
          <span key={cat} className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${idx === 0 ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>
            {cat}
          </span>
        ))}
      </div>

      {/* Items List */}
      <div className="px-4 pb-4 grid grid-cols-2 gap-3">
        {TRADE_ITEMS.map(item => (
          <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
            <div className="h-32 bg-gray-200 relative">
               <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
               <span className="absolute top-2 left-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded backdrop-blur-sm">
                 {item.type === 'Account' ? '账号' : item.type === 'Item' ? '道具' : '货币'}
               </span>
            </div>
            <div className="p-3 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 mb-1">{item.title}</h3>
                <p className="text-xs text-gray-400">{item.gameName} • {item.server}</p>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-red-500 font-bold text-sm">¥{item.price}</span>
                <span className="text-[10px] text-gray-400 truncate max-w-[60px]">{item.seller}</span>
              </div>
            </div>
          </div>
        ))}
        {/* Duplicate for visual fullness */}
         {TRADE_ITEMS.map(item => (
          <div key={`dup-${item.id}`} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
            <div className="h-32 bg-gray-200 relative">
               <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
               <span className="absolute top-2 left-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded backdrop-blur-sm">
                 {item.type === 'Account' ? '账号' : item.type === 'Item' ? '道具' : '货币'}
               </span>
            </div>
            <div className="p-3 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 mb-1">{item.title}</h3>
                <p className="text-xs text-gray-400">{item.gameName} • {item.server}</p>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-red-500 font-bold text-sm">¥{item.price}</span>
                <span className="text-[10px] text-gray-400 truncate max-w-[60px]">{item.seller}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Floating Sell Button */}
      <button className="fixed bottom-20 right-4 bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg hover:bg-blue-700 z-50">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
      </button>
    </div>
  );
};

export default Trade;
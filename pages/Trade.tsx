import React from 'react';
import { TRADE_ITEMS } from '../services/mockData';

interface TradeProps {
  isEmbedded?: boolean;
}

const Trade: React.FC<TradeProps> = ({ isEmbedded = false }) => {
  return (
    <div className={`bg-[#0f172a] min-h-full ${isEmbedded ? '' : ''}`}>
      {/* Header - Only show if not embedded */}
      {!isEmbedded && (
        <div className="bg-[#0f172a] p-4 sticky top-0 z-40 shadow-sm flex justify-between items-center border-b border-white/5">
          <h1 className="text-xl font-bold text-white">交易市场</h1>
          <button className="text-sm text-blue-400 font-medium">我的发布</button>
        </div>
      )}

      {/* Categories */}
      <div className="flex overflow-x-auto space-x-3 p-4 no-scrollbar">
        {['全部', '账号', '道具', '游戏币', '代练'].map((cat, idx) => (
          <span key={cat} className={`px-5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${idx === 0 ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-900/50' : 'bg-[#1e293b] text-gray-400 border-white/5 hover:bg-[#334155]'}`}>
            {cat}
          </span>
        ))}
      </div>

      {/* Items List */}
      <div className="px-4 pb-4 grid grid-cols-2 gap-3">
        {TRADE_ITEMS.map(item => (
          <div key={item.id} className="bg-[#1e293b] rounded-xl border border-white/5 overflow-hidden flex flex-col hover:border-white/20 transition-all group">
            <div className="h-32 bg-gray-800 relative overflow-hidden">
               <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
               <div className="absolute inset-0 bg-gradient-to-t from-[#1e293b] to-transparent opacity-60"></div>
               <span className="absolute top-2 left-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded backdrop-blur-md border border-white/10">
                 {item.type === 'Account' ? '账号' : item.type === 'Item' ? '道具' : '货币'}
               </span>
            </div>
            <div className="p-3 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-200 line-clamp-2 mb-1 group-hover:text-blue-400 transition-colors">{item.title}</h3>
                <p className="text-xs text-gray-500">{item.gameName} • {item.server}</p>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-red-400 font-bold text-sm">¥{item.price}</span>
                <span className="text-[10px] text-gray-500 truncate max-w-[60px]">{item.seller}</span>
              </div>
            </div>
          </div>
        ))}
        {/* Duplicate for visual fullness */}
         {TRADE_ITEMS.map(item => (
          <div key={`dup-${item.id}`} className="bg-[#1e293b] rounded-xl border border-white/5 overflow-hidden flex flex-col hover:border-white/20 transition-all group">
            <div className="h-32 bg-gray-800 relative overflow-hidden">
               <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
               <div className="absolute inset-0 bg-gradient-to-t from-[#1e293b] to-transparent opacity-60"></div>
               <span className="absolute top-2 left-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded backdrop-blur-md border border-white/10">
                 {item.type === 'Account' ? '账号' : item.type === 'Item' ? '道具' : '货币'}
               </span>
            </div>
            <div className="p-3 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-200 line-clamp-2 mb-1 group-hover:text-blue-400 transition-colors">{item.title}</h3>
                <p className="text-xs text-gray-500">{item.gameName} • {item.server}</p>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-red-400 font-bold text-sm">¥{item.price}</span>
                <span className="text-[10px] text-gray-500 truncate max-w-[60px]">{item.seller}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Floating Sell Button */}
      <button className="fixed bottom-24 right-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105 transition-all z-40 border border-white/20">
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
      </button>
    </div>
  );
};

export default Trade;
import React from 'react';
import { TRADE_ITEMS } from '../services/mockData';

interface TradeProps {
  isEmbedded?: boolean;
}

const Trade: React.FC<TradeProps> = ({ isEmbedded = false }) => {
  return (
    <div className={`bg-[#f8fafc] min-h-full ${isEmbedded ? '' : ''}`}>
      {/* Header - Only show if not embedded */}
      {!isEmbedded && (
        <div className="bg-white p-5 sticky top-0 z-40 shadow-sm flex justify-between items-center border-b border-gray-100">
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">交易市场</h1>
          <button className="text-sm text-amber-600 font-medium hover:text-amber-700 transition-colors">我的发布</button>
        </div>
      )}

      {/* Categories */}
      <div className="flex overflow-x-auto space-x-3 p-5 pt-2 no-scrollbar">
        {['全部', '账号', '道具', '游戏币', '代练'].map((cat, idx) => (
          <span key={cat} className={`px-5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border cursor-pointer ${idx === 0 ? 'bg-gray-900 text-white border-gray-900 shadow-md' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50 hover:text-gray-900'}`}>
            {cat}
          </span>
        ))}
      </div>

      {/* Items List */}
      <div className="px-5 pb-24 grid grid-cols-2 gap-4">
        {TRADE_ITEMS.map(item => (
          <div key={item.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col hover:shadow-lg transition-all group shadow-sm">
            <div className="h-36 bg-gray-100 relative overflow-hidden">
               <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
               <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60"></div>
               
               {/* Badge */}
               <div className="absolute top-2 left-2">
                 <span className={`text-[10px] font-bold px-2 py-1 rounded-lg backdrop-blur-md border border-white/20 ${
                   item.type === 'Account' ? 'bg-blue-500/80 text-white' :
                   item.type === 'Item' ? 'bg-purple-500/80 text-white' :
                   'bg-amber-500/80 text-white'
                 }`}>
                   {item.type === 'Account' ? '账号' : item.type === 'Item' ? '道具' : '货币'}
                 </span>
               </div>
            </div>
            
            <div className="p-3 flex-1 flex flex-col justify-between relative">
              <div>
                <h3 className="text-sm font-bold text-gray-800 line-clamp-2 mb-1 group-hover:text-violet-600 transition-colors leading-snug">{item.title}</h3>
                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">{item.gameName} • {item.server}</p>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-amber-600 font-black text-sm">¥{item.price}</span>
                <div className="flex items-center">
                   <div className="w-4 h-4 rounded-full bg-gray-200 mr-1 overflow-hidden">
                     <img src={`https://picsum.photos/50/50?random=${item.seller}`} className="w-full h-full object-cover" />
                   </div>
                   <span className="text-[10px] text-gray-400 truncate max-w-[50px]">{item.seller}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
        {/* Duplicate for visual fullness */}
         {TRADE_ITEMS.map(item => (
          <div key={`dup-${item.id}`} className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col hover:shadow-lg transition-all group shadow-sm">
            <div className="h-36 bg-gray-100 relative overflow-hidden">
               <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
               <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60"></div>
               <div className="absolute top-2 left-2">
                 <span className={`text-[10px] font-bold px-2 py-1 rounded-lg backdrop-blur-md border border-white/20 ${
                   item.type === 'Account' ? 'bg-blue-500/80 text-white' :
                   item.type === 'Item' ? 'bg-purple-500/80 text-white' :
                   'bg-amber-500/80 text-white'
                 }`}>
                   {item.type === 'Account' ? '账号' : item.type === 'Item' ? '道具' : '货币'}
                 </span>
               </div>
            </div>
            <div className="p-3 flex-1 flex flex-col justify-between relative">
              <div>
                <h3 className="text-sm font-bold text-gray-800 line-clamp-2 mb-1 group-hover:text-violet-600 transition-colors leading-snug">{item.title}</h3>
                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">{item.gameName} • {item.server}</p>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-amber-600 font-black text-sm">¥{item.price}</span>
                <div className="flex items-center">
                   <div className="w-4 h-4 rounded-full bg-gray-200 mr-1 overflow-hidden">
                     <img src={`https://picsum.photos/50/50?random=${item.seller}`} className="w-full h-full object-cover" />
                   </div>
                   <span className="text-[10px] text-gray-400 truncate max-w-[50px]">{item.seller}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Floating Sell Button - Adjusted position to avoid overlap with AI Assistant (bottom-48 instead of bottom-28) */}
      <button className="fixed bottom-48 right-5 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg shadow-violet-300 hover:scale-110 transition-all z-40 border-2 border-white group">
        <svg className="w-7 h-7 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
      </button>
    </div>
  );
};

export default Trade;
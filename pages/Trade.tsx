import React from 'react';
import { TRADE_ITEMS } from '../services/mockData';

interface TradeProps {
  isEmbedded?: boolean;
}

const Trade: React.FC<TradeProps> = ({ isEmbedded = false }) => {
  return (
    <div className={`bg-[#020617] min-h-full ${isEmbedded ? '' : ''}`}>
      {/* Header - Only show if not embedded */}
      {!isEmbedded && (
        <div className="bg-[#020617] p-5 sticky top-0 z-40 shadow-sm flex justify-between items-center border-b border-white/5">
          <h1 className="text-xl font-bold text-white tracking-tight">交易市场</h1>
          <button className="text-sm text-amber-400 font-medium hover:text-amber-300 transition-colors">我的发布</button>
        </div>
      )}

      {/* Categories */}
      <div className="flex overflow-x-auto space-x-3 p-5 pt-2 no-scrollbar">
        {['全部', '账号', '道具', '游戏币', '代练'].map((cat, idx) => (
          <span key={cat} className={`px-5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border cursor-pointer ${idx === 0 ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10 hover:text-white'}`}>
            {cat}
          </span>
        ))}
      </div>

      {/* Items List */}
      <div className="px-5 pb-24 grid grid-cols-2 gap-4">
        {TRADE_ITEMS.map(item => (
          <div key={item.id} className="bg-[#111827]/60 rounded-2xl border border-white/5 overflow-hidden flex flex-col hover:border-violet-500/30 transition-all group shadow-lg">
            <div className="h-36 bg-gray-800 relative overflow-hidden">
               <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
               <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent opacity-80"></div>
               
               {/* Badge */}
               <div className="absolute top-2 left-2">
                 <span className={`text-[10px] font-bold px-2 py-1 rounded-lg backdrop-blur-md border border-white/10 ${
                   item.type === 'Account' ? 'bg-blue-500/20 text-blue-300' :
                   item.type === 'Item' ? 'bg-purple-500/20 text-purple-300' :
                   'bg-amber-500/20 text-amber-300'
                 }`}>
                   {item.type === 'Account' ? '账号' : item.type === 'Item' ? '道具' : '货币'}
                 </span>
               </div>
            </div>
            
            <div className="p-3 flex-1 flex flex-col justify-between relative bg-gradient-to-b from-transparent to-[#000000]/40">
              <div>
                <h3 className="text-sm font-bold text-gray-100 line-clamp-2 mb-1 group-hover:text-violet-300 transition-colors leading-snug">{item.title}</h3>
                <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wide">{item.gameName} • {item.server}</p>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-amber-400 font-black text-sm drop-shadow-[0_0_8px_rgba(251,191,36,0.3)]">¥{item.price}</span>
                <div className="flex items-center">
                   <div className="w-4 h-4 rounded-full bg-gray-700 mr-1"></div>
                   <span className="text-[10px] text-gray-400 truncate max-w-[50px]">{item.seller}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
        {/* Duplicate for visual fullness */}
         {TRADE_ITEMS.map(item => (
          <div key={`dup-${item.id}`} className="bg-[#111827]/60 rounded-2xl border border-white/5 overflow-hidden flex flex-col hover:border-violet-500/30 transition-all group shadow-lg">
            <div className="h-36 bg-gray-800 relative overflow-hidden">
               <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
               <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent opacity-80"></div>
               <div className="absolute top-2 left-2">
                 <span className={`text-[10px] font-bold px-2 py-1 rounded-lg backdrop-blur-md border border-white/10 ${
                   item.type === 'Account' ? 'bg-blue-500/20 text-blue-300' :
                   item.type === 'Item' ? 'bg-purple-500/20 text-purple-300' :
                   'bg-amber-500/20 text-amber-300'
                 }`}>
                   {item.type === 'Account' ? '账号' : item.type === 'Item' ? '道具' : '货币'}
                 </span>
               </div>
            </div>
            <div className="p-3 flex-1 flex flex-col justify-between relative bg-gradient-to-b from-transparent to-[#000000]/40">
              <div>
                <h3 className="text-sm font-bold text-gray-100 line-clamp-2 mb-1 group-hover:text-violet-300 transition-colors leading-snug">{item.title}</h3>
                <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wide">{item.gameName} • {item.server}</p>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-amber-400 font-black text-sm drop-shadow-[0_0_8px_rgba(251,191,36,0.3)]">¥{item.price}</span>
                <div className="flex items-center">
                   <div className="w-4 h-4 rounded-full bg-gray-700 mr-1"></div>
                   <span className="text-[10px] text-gray-400 truncate max-w-[50px]">{item.seller}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Floating Sell Button */}
      <button className="fixed bottom-28 right-5 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-[0_10px_30px_-10px_rgba(124,58,237,0.6)] hover:shadow-[0_10px_40px_-10px_rgba(124,58,237,0.8)] hover:scale-110 transition-all z-40 border border-white/20 group">
        <svg className="w-7 h-7 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
      </button>
    </div>
  );
};

export default Trade;
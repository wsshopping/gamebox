
import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { TradeItem } from '../types';

interface TradeProps {
  isEmbedded?: boolean;
}

const Trade: React.FC<TradeProps> = ({ isEmbedded = false }) => {
  const [items, setItems] = useState<TradeItem[]>([]);
  const [category, setCategory] = useState('全部');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      setIsLoading(true);
      try {
        const data = await api.trade.getItems(category);
        setItems(data);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchItems();
  }, [category]);

  return (
    <div className={`app-bg min-h-full transition-colors duration-500 ${isEmbedded ? '' : 'pt-20'}`}>
      {/* Header - Only show if not embedded (Standalone Mode) */}
      {!isEmbedded && (
        <div className="glass-bg p-5 fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md z-40 shadow-sm flex justify-between items-center border-b border-theme transition-colors duration-500">
          <h1 className="text-xl font-bold tracking-tight" style={{color: 'var(--text-primary)'}}>交易市场</h1>
          <button className="text-sm text-accent font-medium hover:brightness-110 transition-colors">我的发布</button>
        </div>
      )}

      {/* Categories - Themed Chips */}
      <div className="flex overflow-x-auto space-x-3 p-5 pt-4 no-scrollbar">
        {['全部', '账号', '道具', '游戏币', '代练'].map((cat) => (
          <span 
            key={cat} 
            onClick={() => setCategory(cat)}
            className={`px-5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border cursor-pointer ${
                category === cat 
                ? 'bg-accent-gradient text-black border-transparent shadow-[0_0_10px_rgba(245,158,11,0.4)]' 
                : 'card-bg border-theme text-slate-500 hover:border-accent/50 hover:text-[var(--text-primary)]'
            }`}
          >
            {cat}
          </span>
        ))}
      </div>

      {/* Items List */}
      <div className="px-5 pb-24 min-h-[400px]">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="card-bg rounded-2xl h-60 animate-pulse border border-theme">
                <div className="h-36 bg-slate-700/20 rounded-t-2xl"></div>
                <div className="p-3 space-y-2">
                   <div className="h-3 bg-slate-700/20 rounded w-full"></div>
                   <div className="h-3 bg-slate-700/20 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {items.map(item => (
              <div key={item.id} className="card-bg rounded-2xl border border-theme overflow-hidden flex flex-col hover:border-accent/50 hover:shadow-lg transition-all group shadow-sm">
                <div className="h-36 bg-slate-900 relative overflow-hidden">
                   <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90 group-hover:opacity-100" />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                   
                   {/* Badge */}
                   <div className="absolute top-2 left-2">
                     <span className={`text-[10px] font-bold px-2 py-1 rounded-lg backdrop-blur-md border border-white/10 shadow-sm ${
                       item.type === 'Account' ? 'bg-blue-600/60 text-white' :
                       item.type === 'Item' ? 'bg-purple-600/60 text-white' :
                       'bg-amber-600/60 text-white'
                     }`}>
                       {item.type === 'Account' ? '账号' : item.type === 'Item' ? '道具' : '货币'}
                     </span>
                   </div>
                </div>
                
                <div className="p-3 flex-1 flex flex-col justify-between relative">
                  <div>
                    <h3 className="text-sm font-bold line-clamp-2 mb-1 group-hover:text-accent transition-colors leading-snug" style={{color: 'var(--text-primary)'}}>{item.title}</h3>
                    <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">{item.gameName} • {item.server}</p>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-accent font-black text-sm drop-shadow-sm">¥{item.price}</span>
                    <div className="flex items-center">
                       <div className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-700 mr-1 overflow-hidden border border-theme">
                         <img src={`https://picsum.photos/50/50?random=${item.seller}`} className="w-full h-full object-cover" />
                       </div>
                       <span className="text-[10px] text-slate-500 truncate max-w-[50px]">{item.seller}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
             {/* Simple duplication for fullness if list is small */}
             {items.length > 0 && items.length < 4 && items.map(item => (
               <div key={`dup-${item.id}`} className="card-bg rounded-2xl border border-theme overflow-hidden flex flex-col transition-all group shadow-sm opacity-50 grayscale">
                   <div className="h-36 bg-slate-700 relative overflow-hidden">
                     <img src={item.image} alt="" className="w-full h-full object-cover"/>
                  </div>
                  <div className="p-3"><p className="text-xs text-slate-500">Sample Duplicate</p></div>
               </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Floating Sell Button */}
      <button className="fixed bottom-48 right-5 bg-accent-gradient text-black rounded-full w-14 h-14 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:scale-110 transition-all z-40 border border-white/20 group">
        <svg className="w-7 h-7 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
      </button>
    </div>
  );
};

export default Trade;

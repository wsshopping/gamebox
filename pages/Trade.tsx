import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { TradeListing } from '../types';

interface TradeProps {
  isEmbedded?: boolean;
}

const Trade: React.FC<TradeProps> = ({ isEmbedded = false }) => {
  const [keyword, setKeyword] = useState('');
  const [listings, setListings] = useState<TradeListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notice, setNotice] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const noticeTimer = useRef<number | null>(null);
  const navigate = useNavigate();

  const showNotice = (message: string) => {
    setNotice(message);
    if (noticeTimer.current) {
      window.clearTimeout(noticeTimer.current);
    }
    noticeTimer.current = window.setTimeout(() => {
      setNotice('');
    }, 3000);
  };

  useEffect(() => {
    return () => {
      if (noticeTimer.current) {
        window.clearTimeout(noticeTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setIsLoading(true);
      try {
        const data = await api.trade.getListings('');
        if (active) {
          setListings(data.items);
        }
      } catch (e: any) {
        if (active) {
          showNotice(e?.message || '加载失败');
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  const filteredListings = useMemo(() => {
    const query = keyword.trim().toLowerCase();
    if (!query) {
      return listings;
    }
    return listings.filter(item => {
      const title = item.title?.toLowerCase() || '';
      const category = item.category?.toLowerCase() || '';
      const seller = item.sellerName?.toLowerCase() || '';
      return title.includes(query) || category.includes(query) || seller.includes(query);
    });
  }, [keyword, listings]);

  return (
    <div className={`app-bg min-h-full transition-colors duration-500 ${isEmbedded ? '' : 'pt-[calc(5rem+env(safe-area-inset-top))]'}`}>
      {notice && (
        <div className="fixed top-[calc(5rem+env(safe-area-inset-top))] left-1/2 -translate-x-1/2 z-50">
          <div className="card-bg rounded-[18px] border border-amber-400/30 bg-slate-900/90 px-4 py-2 shadow-2xl shadow-black/40">
            <div className="flex items-center gap-2">
              <span className="text-amber-300 text-sm">⚠️</span>
              <span className="text-xs font-semibold text-slate-100">{notice}</span>
            </div>
          </div>
        </div>
      )}

      {!isEmbedded && (
        <div className="glass-bg p-5 pt-[calc(1.25rem+env(safe-area-inset-top))] fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md z-40 shadow-sm flex justify-between items-center border-b border-theme transition-colors duration-500">
          <h1 className="text-xl font-bold tracking-tight" style={{color: 'var(--text-primary)'}}>市场交易</h1>
        </div>
      )}

      <div className={`${isEmbedded ? 'pt-4' : 'pt-6'} px-5`}>
        <div className="flex items-center gap-3">
          <input
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            placeholder="搜索商品/分类/卖家"
            className="flex-1 bg-transparent border border-theme rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] placeholder:text-slate-500"
          />
        </div>
      </div>

      <div className="px-5 pb-24 min-h-[400px]">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 mt-4">
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
          <div className="grid grid-cols-2 gap-4 mt-4">
            {filteredListings.map(listing => (
              <div
                key={listing.id}
                className="card-bg rounded-2xl border border-theme overflow-hidden flex flex-col hover:border-accent/50 hover:shadow-lg transition-all group shadow-sm"
                onClick={() => navigate(`/trade/${listing.id}`)}
              >
                <div className="h-36 bg-slate-900 relative overflow-hidden">
                  {listing.coverImage && (
                    <img src={listing.coverImage} alt={listing.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90 group-hover:opacity-100" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute top-2 left-2">
                    <span className="text-[10px] font-bold px-2 py-1 rounded-lg backdrop-blur-md border border-white/10 shadow-sm bg-amber-600/60 text-white">
                      {listing.category}
                    </span>
                  </div>
                </div>
                <div className="p-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold line-clamp-2 mb-1 group-hover:text-accent transition-colors leading-snug" style={{color: 'var(--text-primary)'}}>{listing.title}</h3>
                    <p className="text-[10px] text-slate-500 font-medium">
                      {listing.sellerName}
                    </p>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-accent font-black text-sm drop-shadow-sm">{listing.pricePoints} 积分</span>
                    <span className="text-[10px] text-slate-500">库存 {listing.stock}</span>
                  </div>
                </div>
              </div>
            ))}
            {filteredListings.length === 0 && (
              <div className="col-span-2 text-center text-slate-500 text-sm py-12">暂无在售商品</div>
            )}
          </div>
        )}
      </div>

      <button
        onClick={() => setMenuOpen(true)}
        className="fixed bottom-48 right-5 bg-accent-gradient text-black rounded-full w-14 h-14 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:scale-110 transition-all z-40 border border-white/20 group"
      >
        <svg className="w-7 h-7 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
      </button>

      {menuOpen && (
        <div className="fixed inset-0 z-50">
          <button className="absolute inset-0 bg-black/25" onClick={() => setMenuOpen(false)} aria-label="关闭菜单" />
          <div className="absolute right-5 bottom-32 w-40 card-bg rounded-2xl border border-theme shadow-2xl shadow-black/50 p-2">
            {[
              { label: '发布商品', path: '/trade/publish' },
              { label: '我的发布', path: '/trade/my' },
              { label: '我的订单', path: '/trade/orders' }
            ].map(item => (
              <button
                key={item.label}
                onClick={() => {
                  setMenuOpen(false);
                  navigate(item.path);
                }}
                className="w-full text-left text-sm font-bold px-3 py-2 rounded-xl text-[var(--text-primary)] hover:bg-amber-500/15"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Trade;

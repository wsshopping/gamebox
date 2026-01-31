import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { TradeListing } from '../types';

const TradeMyListings: React.FC = () => {
  const [listings, setListings] = useState<TradeListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notice, setNotice] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const noticeTimer = useRef<number | null>(null);
  const navigate = useNavigate();

  const statusLabel = useMemo<Record<string, string>>(() => ({
    active: '上架中',
    inactive: '已下架',
    sold_out: '已售罄'
  }), []);

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
    setIsLoading(true);
    api.trade.getMyListings()
      .then(res => {
        if (active) {
          setListings(res.items);
        }
      })
      .catch((err: any) => {
        if (active) {
          showNotice(err?.message || '加载失败');
        }
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [refreshKey]);

  const handleDeleteListing = async (listing: TradeListing) => {
    if (!window.confirm('确认删除该挂单吗？')) {
      return;
    }
    try {
      await api.trade.deleteListing(listing.id);
      setRefreshKey(key => key + 1);
    } catch (e: any) {
      showNotice(e?.message || '删除失败');
    }
  };

  return (
    <div className="app-bg min-h-full transition-colors duration-500 pt-[calc(5rem+env(safe-area-inset-top))]">
      {notice && (
        <div className="fixed top-[calc(1rem+env(safe-area-inset-top))] left-1/2 -translate-x-1/2 z-50">
          <div className="card-bg rounded-[18px] border border-amber-400/30 bg-slate-900/90 px-4 py-2 shadow-2xl shadow-black/40">
            <div className="flex items-center gap-2">
              <span className="text-amber-300 text-sm">⚠️</span>
              <span className="text-xs font-semibold text-slate-100">{notice}</span>
            </div>
          </div>
        </div>
      )}

      <div className="glass-bg p-5 pt-[calc(1.25rem+env(safe-area-inset-top))] fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md z-40 shadow-sm flex items-center justify-between border-b border-theme transition-colors duration-500">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-slate-400 hover:bg-white/10 p-1 rounded-full">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <h1 className="text-lg font-bold" style={{color: 'var(--text-primary)'}}>我的发布</h1>
        </div>
        <button
          onClick={() => navigate('/trade/publish')}
          className="text-xs font-bold text-accent"
        >
          发布商品
        </button>
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
            {listings.map(listing => (
              <div
                key={listing.id}
                className="card-bg rounded-2xl border border-theme overflow-hidden flex flex-col shadow-sm"
              >
                <div className="h-36 bg-slate-900 relative overflow-hidden">
                  {listing.coverImage && (
                    <img src={listing.coverImage} alt={listing.title} className="w-full h-full object-cover" />
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
                    <h3 className="text-sm font-bold line-clamp-2 mb-1" style={{color: 'var(--text-primary)'}}>{listing.title}</h3>
                    <p className="text-[10px] text-slate-500 font-medium">{statusLabel[listing.status] || listing.status}</p>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-accent font-black text-sm drop-shadow-sm">{listing.pricePoints} 积分</span>
                    <div className="flex gap-2 text-[10px]">
                      <button
                        onClick={() => navigate(`/trade/publish?id=${listing.id}`)}
                        className="text-accent"
                      >
                        编辑
                      </button>
                      <button
                        onClick={() => handleDeleteListing(listing)}
                        className="text-slate-500"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {listings.length === 0 && (
              <div className="col-span-2 text-center text-slate-500 text-sm py-12">暂无发布商品</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TradeMyListings;

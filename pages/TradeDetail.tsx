import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../services/api';
import { TradeListing } from '../types';

const TradeDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState<TradeListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');
  const noticeTimer = useRef<number | null>(null);

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
    const listingId = Number(id);
    if (!listingId) {
      showNotice('无效商品');
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    api.trade.getListingDetail(listingId)
      .then(res => {
        if (active) {
          setListing(res.listing);
        }
      })
      .catch((err: any) => {
        if (active) {
          showNotice(err?.message || '获取详情失败');
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [id]);

  const handleCreateOrder = async () => {
    if (!listing) return;
    if (listing.stock <= 0) {
      showNotice('已售罄');
      return;
    }
    try {
      await api.trade.createOrder(listing.id);
      showNotice('下单成功');
    } catch (e: any) {
      showNotice(e?.message || '下单失败');
    }
  };

  return (
    <div className="app-bg min-h-full transition-colors duration-500 pt-[calc(5rem+env(safe-area-inset-top))]">
      {notice && (
        <div className="fixed top-[calc(1rem+env(safe-area-inset-top))] left-1/2 -translate-x-1/2 z-50">
          <div className="card-bg rounded-[18px] border border-amber-400/30 bg-slate-900/90 px-4 py-2 shadow-2xl shadow-black/40">
            <div className="flex items-center gap-2">
              <span className="text-amber-300 text-sm">✅</span>
              <span className="text-xs font-semibold text-slate-100">{notice}</span>
            </div>
          </div>
        </div>
      )}

      <div className="glass-bg p-5 pt-[calc(1.25rem+env(safe-area-inset-top))] fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md z-40 shadow-sm flex items-center gap-3 border-b border-theme transition-colors duration-500">
        <button onClick={() => navigate(-1)} className="text-slate-400 hover:bg-white/10 p-1 rounded-full">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <h1 className="text-lg font-bold" style={{color: 'var(--text-primary)'}}>商品详情</h1>
      </div>

      <div className="px-5 pb-24">
        {loading && (
          <div className="space-y-4 pt-4">
            <div className="card-bg rounded-2xl h-48 animate-pulse border border-theme"></div>
            <div className="card-bg rounded-2xl h-20 animate-pulse border border-theme"></div>
          </div>
        )}

        {!loading && listing && (
          <div className="space-y-4">
            <div className="card-bg rounded-2xl border border-theme overflow-hidden">
              <div className="flex gap-2 overflow-x-auto p-3">
                {listing.images.map((img, idx) => (
                  <img key={idx} src={img} className="w-28 h-20 rounded-xl object-cover border border-theme" />
                ))}
              </div>
            </div>

            <div className="card-bg rounded-2xl border border-theme p-4">
              <h2 className="text-base font-bold" style={{color: 'var(--text-primary)'}}>{listing.title}</h2>
              <p className="text-xs text-slate-500 mt-2">{listing.description}</p>
              <div className="mt-3 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-500">{listing.category} · {listing.sellerName}</p>
                  <p className="text-accent font-black text-lg mt-1">{listing.pricePoints} 积分</p>
                </div>
                <div className="text-xs text-slate-500">库存 {listing.stock}</div>
              </div>
            </div>

            <button
              onClick={handleCreateOrder}
              className="w-full py-3 rounded-xl bg-accent-gradient text-black font-bold text-sm disabled:opacity-50"
              disabled={listing.stock <= 0}
            >
              {listing.stock > 0 ? '立即下单' : '已售罄'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TradeDetail;

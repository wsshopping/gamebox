import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { TradeOrder } from '../types';

type OrderRole = 'buyer' | 'seller';

const TradeOrders: React.FC = () => {
  const [orders, setOrders] = useState<TradeOrder[]>([]);
  const [orderRole, setOrderRole] = useState<OrderRole>('buyer');
  const [isLoading, setIsLoading] = useState(true);
  const [notice, setNotice] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const noticeTimer = useRef<number | null>(null);
  const navigate = useNavigate();

  const statusLabel = useMemo<Record<string, string>>(() => ({
    pending_delivery: '待发货',
    delivering: '已发货',
    completed: '已完成',
    canceled: '已取消',
    disputed: '申诉中',
    refunded: '已退款'
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
    api.trade.listOrders(orderRole)
      .then(res => {
        if (active) {
          setOrders(res.items);
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
  }, [orderRole, refreshKey]);

  const handleCancelOrder = async (order: TradeOrder) => {
    if (!window.confirm('确认取消该订单吗？')) {
      return;
    }
    try {
      await api.trade.cancelOrder(order.id);
      setRefreshKey(key => key + 1);
    } catch (e: any) {
      showNotice(e?.message || '取消失败');
    }
  };

  const handleConfirmOrder = async (order: TradeOrder) => {
    if (!window.confirm('确认收货并完成交易？')) {
      return;
    }
    try {
      await api.trade.confirmOrder(order.id);
      setRefreshKey(key => key + 1);
    } catch (e: any) {
      showNotice(e?.message || '确认失败');
    }
  };

  const handleDeliverOrder = async (order: TradeOrder) => {
    const deliveryText = window.prompt('请输入发货内容（文本）');
    if (!deliveryText) {
      return;
    }
    try {
      await api.trade.deliverOrder(order.id, deliveryText);
      setRefreshKey(key => key + 1);
    } catch (e: any) {
      showNotice(e?.message || '发货失败');
    }
  };

  const handleDisputeOrder = async (order: TradeOrder) => {
    const reason = window.prompt('请输入申诉原因');
    if (!reason) {
      return;
    }
    try {
      await api.trade.openDispute(order.id, reason);
      setRefreshKey(key => key + 1);
    } catch (e: any) {
      showNotice(e?.message || '申诉失败');
    }
  };

  const renderOrderActions = (order: TradeOrder) => {
    if (orderRole === 'buyer') {
      if (order.status === 'pending_delivery') {
        return (
          <button onClick={() => handleCancelOrder(order)} className="px-3 py-1 text-xs rounded-lg border border-theme text-slate-500 hover:text-[var(--text-primary)]">
            取消
          </button>
        );
      }
      if (order.status === 'delivering') {
        return (
          <div className="flex gap-2">
            <button onClick={() => handleConfirmOrder(order)} className="px-3 py-1 text-xs rounded-lg bg-accent-gradient text-black">
              确认
            </button>
            <button onClick={() => handleDisputeOrder(order)} className="px-3 py-1 text-xs rounded-lg border border-theme text-slate-500 hover:text-[var(--text-primary)]">
              申诉
            </button>
          </div>
        );
      }
      return null;
    }
    if (order.status === 'pending_delivery') {
      return (
        <button onClick={() => handleDeliverOrder(order)} className="px-3 py-1 text-xs rounded-lg bg-accent-gradient text-black">
          发货
        </button>
      );
    }
    return null;
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

      <div className="glass-bg p-5 pt-[calc(1.25rem+env(safe-area-inset-top))] fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md z-40 shadow-sm flex items-center gap-3 border-b border-theme transition-colors duration-500">
        <button onClick={() => navigate(-1)} className="text-slate-400 hover:bg-white/10 p-1 rounded-full">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <h1 className="text-lg font-bold" style={{color: 'var(--text-primary)'}}>我的订单</h1>
      </div>

      <div className="px-5 pt-4">
        <div className="flex gap-2">
          {(['buyer', 'seller'] as OrderRole[]).map(role => (
            <button
              key={role}
              onClick={() => setOrderRole(role)}
              className={`px-4 py-2 rounded-xl text-xs font-bold border ${
                orderRole === role ? 'bg-accent-gradient text-black border-transparent' : 'card-bg border-theme text-slate-500 hover:border-accent/50'
              }`}
            >
              {role === 'buyer' ? '我买的' : '我卖的'}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 pb-24 min-h-[400px]">
        {isLoading ? (
          <div className="space-y-4 mt-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="card-bg rounded-2xl h-24 animate-pulse border border-theme"></div>
            ))}
          </div>
        ) : (
          <div className="space-y-4 mt-4">
            {orders.map(order => (
              <div key={order.id} className="card-bg rounded-2xl border border-theme p-4 flex gap-3 items-start">
                <div className="w-16 h-16 rounded-xl overflow-hidden border border-theme">
                  {order.listingImage && <img src={order.listingImage} className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-bold leading-snug" style={{color: 'var(--text-primary)'}}>{order.listingTitle}</h3>
                      <p className="text-[10px] text-slate-500 mt-1">{order.category} · {order.pricePoints} 积分</p>
                    </div>
                    <span className="text-[10px] text-slate-500">{statusLabel[order.status] || order.status}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="text-[10px] text-slate-500">
                      {orderRole === 'buyer' ? `卖家：${order.sellerName}` : `买家：${order.buyerName}`}
                    </div>
                    {renderOrderActions(order)}
                  </div>
                </div>
              </div>
            ))}
            {orders.length === 0 && (
              <div className="text-center text-slate-500 text-sm py-12">暂无订单</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TradeOrders;

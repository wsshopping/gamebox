import React, { useCallback, useEffect, useState } from 'react';
import { api } from '../services/api';
import { WelfareLedgerItem, WelfareOverview, WelfareReward } from '../types';

const Welfare: React.FC = () => {
  const [overview, setOverview] = useState<WelfareOverview | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [reward, setReward] = useState<WelfareReward | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [ledgerItems, setLedgerItems] = useState<WelfareLedgerItem[]>([]);
  const [ledgerCursor, setLedgerCursor] = useState<number | null>(null);
  const [ledgerLoading, setLedgerLoading] = useState(false);
  const [errorTip, setErrorTip] = useState<string | null>(null);

  const fetchOverview = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.welfare.getOverview();
      setOverview(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchLedger = useCallback(async (cursor?: number, append = false) => {
    setLedgerLoading(true);
    try {
      const data = await api.welfare.getLedger(cursor);
      setLedgerItems((prev) => (append ? [...prev, ...data.items] : data.items));
      setLedgerCursor(data.nextCursor || null);
    } finally {
      setLedgerLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOverview();
    fetchLedger();
  }, [fetchOverview, fetchLedger]);

  useEffect(() => {
    if (!errorTip) return;
    const timer = window.setTimeout(() => setErrorTip(null), 3000);
    return () => window.clearTimeout(timer);
  }, [errorTip]);

  const handleDraw = async () => {
    if (isDrawing) return;
    setIsDrawing(true);
    try {
      const result = await api.welfare.drawBlindBox();
      setReward(result.reward);
      await Promise.all([fetchOverview(), fetchLedger()]);
    } catch (err: any) {
      setErrorTip(err?.message || '抽取失败');
    } finally {
      setIsDrawing(false);
    }
  };

  const handleSignIn = async () => {
    if (isSigning || overview?.signedIn) return;
    setIsSigning(true);
    try {
      await api.welfare.signIn();
      await Promise.all([fetchOverview(), fetchLedger()]);
    } catch (err: any) {
      setErrorTip(err?.message || '签到失败');
    } finally {
      setIsSigning(false);
    }
  };

  const resetBox = () => {
    setReward(null);
  };

  const renderReward = (data: WelfareReward | null) => {
    if (!data) return '';
    return data.type === 'points' ? `${data.value} 积分` : data.value;
  };

  const renderSource = (source: string) => {
    switch (source) {
      case 'daily_signin':
        return '每日签到';
      case 'blindbox_cost':
        return '盲盒消耗';
      case 'blindbox_reward':
        return '盲盒奖励';
      default:
        return source;
    }
  };

  const renderAmount = (amount: number) => {
    return amount > 0 ? `+${amount}` : String(amount);
  };

  return (
    <div className="app-bg min-h-full transition-colors duration-500">
      {errorTip ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
          <button
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setErrorTip(null)}
            aria-label="关闭提示"
          />
          <div className="relative card-bg w-full max-w-[260px] rounded-[20px] border border-amber-400/30 bg-slate-900/90 p-4 shadow-2xl shadow-black/40">
            <div className="flex items-start gap-2.5">
              <span className="text-xl text-amber-300">⚠️</span>
              <div className="flex-1">
                <div className="text-[9px] uppercase tracking-[0.2em] text-amber-300/80 font-bold">操作提示</div>
                <div className="text-xs font-semibold text-slate-100 mt-1">{errorTip}</div>
              </div>
            </div>
            <div className="mt-3 flex justify-end">
              <button
                onClick={() => setErrorTip(null)}
                className="text-[10px] px-2.5 py-0.5 rounded-full border border-amber-400/40 text-amber-200 hover:text-white"
              >
                知道了
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Black Gold Premium Card Banner - Always Dark to maintain Premium Look */}
      <div className="p-6 pt-10 pb-12">
        <div className="relative h-52 rounded-[32px] bg-gradient-to-br from-slate-900 via-[#020617] to-slate-900 p-8 overflow-hidden shadow-2xl shadow-black/30 border border-white/10 group">
          <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/10 via-transparent to-purple-900/10 opacity-50"></div>
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] mix-blend-overlay"></div>
          {/* Gold Shine Animation */}
          <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-amber-500/10 to-transparent skew-x-12 group-hover:left-full transition-all duration-1000 ease-in-out"></div>

          <div className="relative z-10 flex flex-col h-full justify-between text-slate-800">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-black tracking-tight italic drop-shadow-md text-white">
                  PLATINUM <span className="text-amber-500">VIP</span>
                </h1>
                <p className="text-amber-500 font-bold tracking-[0.2em] uppercase mt-1 text-[10px] opacity-80">至尊会员中心</p>
              </div>
              <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center bg-black/20 backdrop-blur-sm shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                <span className="text-xl">💎</span>
              </div>
            </div>

            <div className="flex items-end justify-between">
              <div>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1">当前积分余额</p>
                <p className="text-4xl font-mono font-bold text-amber-500 tracking-tighter drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]">
                  {isLoading ? '...' : overview?.balance ?? 0}
                </p>
              </div>
              <button className="bg-accent-gradient text-black px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg hover:brightness-110 transition-all border border-white/20 active:scale-95">
                积分兑换
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="-mt-10 px-6 pb-24 relative z-10">
        {/* Blind Box Section - Cosmic Theme */}
        <div className="card-bg rounded-[24px] border border-theme p-1 mb-6 shadow-lg relative overflow-hidden group">
          <div className="bg-gradient-to-br from-slate-900 to-[#020617] rounded-[20px] p-6 relative overflow-hidden text-center">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30"></div>
            <div className="absolute top-[-50px] right-[-50px] w-40 h-40 bg-purple-600/10 rounded-full blur-[60px]"></div>
            <div className="absolute bottom-[-20px] left-[-20px] w-32 h-32 bg-amber-500/10 rounded-full blur-[50px]"></div>

            <div className="relative z-10">
              <div className="flex justify-center items-center space-x-2 mb-2">
                <span className="text-amber-500 text-lg animate-pulse">✨</span>
                <h3 className="text-white font-black text-lg tracking-wide uppercase italic">幸运盲盒</h3>
                <span className="text-amber-500 text-lg animate-pulse">✨</span>
              </div>
              <div className="text-[10px] text-slate-400 mb-4">
                今日已抽 {overview?.todayDrawCount ?? 0}/{overview?.blindboxDailyLimit ?? 0}
              </div>

              <div className="h-40 flex items-center justify-center relative mb-4">
                {reward ? (
                  <div className="animate-fade-in-up">
                    <div className="text-5xl mb-2 drop-shadow-[0_0_20px_rgba(245,158,11,0.6)]">🎁</div>
                    <p className="text-amber-500 font-bold text-lg">{renderReward(reward)}</p>
                    <button onClick={resetBox} className="mt-3 text-[10px] text-slate-400 underline hover:text-white">
                      收起
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={handleDraw}
                    className={`cursor-pointer transition-all duration-300 ${isDrawing ? 'animate-bounce' : 'hover:scale-105'}`}
                  >
                    <div className="text-[80px] drop-shadow-[0_0_25px_rgba(147,51,234,0.5)] transform transition-transform">📦</div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-purple-500/20 rounded-full blur-2xl -z-10"></div>
                  </div>
                )}
              </div>

              {!reward && (
                <button
                  onClick={handleDraw}
                  disabled={isDrawing}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black text-sm py-3.5 rounded-xl shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] active:scale-95 transition-all flex items-center justify-center space-x-2 border border-white/10"
                >
                  {isDrawing ? (
                    <span>开启中...</span>
                  ) : (
                    <>
                      <span>开启盲盒</span>
                      <span className="bg-black/20 px-1.5 py-0.5 rounded text-[10px] font-mono border border-white/10">
                        -{overview?.blindboxCostPoints ?? 0} 💎
                      </span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Daily Sign In */}
        <div className="card-bg rounded-[24px] border border-theme p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
              每日签到
            </h3>
            <span className="text-xs font-bold text-accent bg-[var(--bg-primary)] border border-theme px-2 py-1 rounded-md">
              +{overview?.signinRewardPoints ?? 0} 积分
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400">{overview?.signedIn ? '今日已签到' : '今日未签到'}</p>
              {overview?.signedIn && overview?.signedAt ? (
                <p className="text-[10px] text-slate-500 mt-1">{overview.signedAt}</p>
              ) : null}
            </div>
            <button
              onClick={handleSignIn}
              disabled={overview?.signedIn || isSigning}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                overview?.signedIn
                  ? 'bg-[var(--bg-primary)] text-slate-400 border border-theme'
                  : 'bg-accent-gradient text-black shadow-lg hover:brightness-110'
              }`}
            >
              {overview?.signedIn ? '已签到' : isSigning ? '签到中...' : '立即签到'}
            </button>
          </div>
        </div>

        {/* Ledger */}
        <div className="space-y-4">
          <h3 className="font-bold text-lg px-2" style={{ color: 'var(--text-primary)' }}>
            积分明细
          </h3>
          {ledgerLoading && ledgerItems.length === 0 ? (
            [1, 2].map((i) => (
              <div key={i} className="card-bg p-5 rounded-[20px] h-16 animate-pulse border border-theme"></div>
            ))
          ) : ledgerItems.length === 0 ? (
            <div className="card-bg p-5 rounded-[20px] border border-theme text-sm text-slate-400">暂无积分记录</div>
          ) : (
            ledgerItems.map((item) => (
              <div
                key={item.id}
                className="card-bg p-4 rounded-[18px] shadow-sm border border-theme flex items-center justify-between"
              >
                <div>
                  <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                    {renderSource(item.source)}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">{item.createdAt}</div>
                </div>
                <div
                  className={`text-sm font-bold ${
                    item.amount >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {renderAmount(item.amount)}
                </div>
              </div>
            ))
          )}

          {ledgerCursor ? (
            <button
              onClick={() => fetchLedger(ledgerCursor, true)}
              disabled={ledgerLoading}
              className="w-full border border-theme rounded-xl py-2 text-xs text-slate-400 hover:text-slate-200"
            >
              {ledgerLoading ? '加载中...' : '加载更多'}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Welfare;

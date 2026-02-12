import React, { useCallback, useEffect, useState } from 'react';
import { api } from '../services/api';
import { WelfareLedgerItem, WelfareOverview, WelfareReward } from '../types';

const SIGNIN_MILESTONES = [5, 10, 15, 20, 30];

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

  const streakDays = overview?.streakDays ?? 0;
  const cycleDays = overview?.cycleDays ?? 30;
  const cycleProgress = Math.min(100, Math.round((streakDays / cycleDays) * 100));
  const nextMilestoneDay = overview?.nextMilestoneDay ?? 0;
  const daysToNextMilestone = nextMilestoneDay > 0 ? Math.max(nextMilestoneDay - streakDays, 0) : 0;

  const vipCardStyle = {
    backgroundImage: 'linear-gradient(135deg, var(--welfare-vip-from), var(--welfare-vip-to))',
  };
  const boxCardStyle = {
    backgroundImage: 'linear-gradient(135deg, var(--welfare-box-from), var(--welfare-box-to))',
  };
  const signCardStyle = {
    backgroundImage: 'linear-gradient(135deg, var(--welfare-sign-from), var(--welfare-sign-to))',
  };

  const secondaryTextStyle = { color: 'var(--text-secondary)' };

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

      <div className="px-6 pt-6 pb-24 relative z-10 space-y-6">
        <div className="min-h-[calc(100dvh-10rem)] flex flex-col gap-4">
          <div className="basis-[33.33%] card-bg rounded-[24px] border border-theme p-1 shadow-lg relative overflow-hidden">
            <div className="h-full rounded-[20px] p-4 relative overflow-hidden" style={vipCardStyle}>
              <div
                className="absolute top-[-40px] right-[-40px] w-32 h-32 rounded-full blur-[56px]"
                style={{ backgroundColor: 'var(--welfare-vip-glow)' }}
              ></div>
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-xl border flex items-center justify-center text-base"
                      style={{
                        backgroundColor: 'var(--welfare-vip-chip-bg)',
                        borderColor: 'var(--welfare-vip-chip-border)',
                      }}
                    >
                      💎
                    </div>
                    <div>
                      <h3 className="font-black text-base tracking-wide uppercase" style={{ color: 'var(--text-primary)' }}>
                        PLATINUM VIP
                      </h3>
                      <p className="text-[10px] tracking-[0.16em] uppercase" style={{ color: 'var(--welfare-vip-label)' }}>
                        至尊会员中心
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-semibold tracking-[0.12em] uppercase" style={secondaryTextStyle}>
                    当前积分余额
                  </p>
                  <div className="mt-1 flex items-end justify-between">
                    <p className="text-3xl font-mono font-bold tracking-tight" style={{ color: 'var(--welfare-vip-label)' }}>
                      {isLoading ? '...' : overview?.balance ?? 0}
                    </p>
                    <button className="bg-accent-gradient text-black px-3 py-2 rounded-xl text-xs font-bold shadow-md hover:brightness-110 transition-all border border-white/20 active:scale-95">
                      积分兑换
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="basis-[33.33%] card-bg rounded-[24px] border border-theme p-1 shadow-lg relative overflow-hidden">
            <div className="h-full rounded-[20px] p-4 relative overflow-hidden text-center" style={boxCardStyle}>
              <div
                className="absolute top-[-45px] right-[-45px] w-32 h-32 rounded-full blur-[60px]"
                style={{ backgroundColor: 'var(--welfare-box-glow)' }}
              ></div>
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                  <div className="flex justify-center items-center gap-2 mb-2">
                    <div
                      className="w-7 h-7 rounded-lg border flex items-center justify-center text-sm"
                      style={{
                        backgroundColor: 'var(--welfare-box-chip-bg)',
                        borderColor: 'var(--welfare-box-chip-border)',
                      }}
                    >
                      🎁
                    </div>
                    <h3 className="font-black text-base tracking-wide uppercase" style={{ color: 'var(--text-primary)' }}>
                      幸运盲盒
                    </h3>
                  </div>
                  <div className="text-[10px]" style={secondaryTextStyle}>
                    今日已抽 {overview?.todayDrawCount ?? 0}/{overview?.blindboxDailyLimit ?? 0}
                  </div>
                </div>

                <div className="h-20 flex items-center justify-center">
                  {reward ? (
                    <div className="animate-fade-in-up">
                      <div className="text-4xl mb-1">🎉</div>
                      <p className="font-bold text-sm" style={{ color: 'var(--welfare-box-label)' }}>
                        {renderReward(reward)}
                      </p>
                    </div>
                  ) : (
                    <div
                      onClick={handleDraw}
                      className={`cursor-pointer transition-all duration-300 ${isDrawing ? 'animate-bounce' : 'hover:scale-105'}`}
                    >
                      <div className="text-[64px] drop-shadow-[0_0_24px_rgba(139,92,246,0.45)]">📦</div>
                    </div>
                  )}
                </div>

                <button
                  onClick={reward ? resetBox : handleDraw}
                  disabled={isDrawing}
                  className="w-full bg-accent-gradient text-black font-semibold text-[10px] py-2 rounded-lg active:scale-95 transition-all flex items-center justify-center gap-1.5 border border-white/15"
                >
                  {reward ? (
                    <span>收起奖励</span>
                  ) : isDrawing ? (
                    <span>开启中...</span>
                  ) : (
                    <>
                      <span>开启盲盒</span>
                      <span className="bg-black/20 px-1.5 py-0.5 rounded text-[9px] font-mono border border-white/10">
                        -{overview?.blindboxCostPoints ?? 0} 💎
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="basis-[33.33%] card-bg rounded-[24px] border border-theme p-1 shadow-lg relative overflow-hidden">
            <div className="h-full rounded-[20px] p-4 relative overflow-hidden" style={signCardStyle}>
              <div
                className="absolute top-[-45px] right-[-45px] w-32 h-32 rounded-full blur-[58px]"
                style={{ backgroundColor: 'var(--welfare-sign-glow)' }}
              ></div>
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-7 h-7 rounded-lg border flex items-center justify-center text-sm"
                        style={{
                          backgroundColor: 'var(--welfare-sign-chip-bg)',
                          borderColor: 'var(--welfare-sign-chip-border)',
                        }}
                      >
                        📅
                      </div>
                      <h3 className="font-black text-base" style={{ color: 'var(--text-primary)' }}>
                        每日签到
                      </h3>
                    </div>
                    <p className="text-[11px] mt-1" style={secondaryTextStyle}>
                      今日签到可得
                      <span className="font-semibold ml-1" style={{ color: 'var(--welfare-sign-label)' }}>
                        +{overview?.todayPreviewPoints ?? overview?.signinRewardPoints ?? 0} 积分
                      </span>
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-[10px]" style={secondaryTextStyle}>
                      连续签到
                    </p>
                    <p className="text-2xl leading-none font-black mt-1" style={{ color: 'var(--text-primary)' }}>
                      {streakDays}
                    </p>
                    <p className="text-[10px] mt-1" style={secondaryTextStyle}>
                      / {cycleDays} 天
                    </p>
                  </div>
                </div>

                <div>
                  <div className="mt-3 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-500"
                      style={{ width: `${cycleProgress}%` }}
                    />
                  </div>

                  <div className="mt-2.5 grid grid-cols-5 gap-1.5">
                    {SIGNIN_MILESTONES.map((day) => {
                      const reached = streakDays >= day;
                      const isNextTarget = nextMilestoneDay === day;
                      return (
                        <div
                          key={day}
                          className={`rounded-lg border px-1 py-1 text-center transition-all ${
                            isNextTarget
                              ? 'border-amber-400/60 bg-amber-400/10 text-amber-300'
                              : reached
                                ? 'border-slate-500/40 bg-slate-700/20 text-slate-200'
                                : 'border-white/10 bg-slate-900/30 text-slate-500'
                          }`}
                        >
                          <div className="text-[10px] font-semibold">{day}天</div>
                          <div className="text-[9px] mt-0.5">{day === 30 ? '翻倍' : '加分'}</div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-2.5 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs" style={secondaryTextStyle}>
                        {overview?.signedIn ? '今日已签到' : '今日未签到'}
                      </p>
                      {overview?.signedIn && overview?.signedAt ? (
                        <p className="text-[10px] mt-1" style={secondaryTextStyle}>
                          {overview.signedAt}
                        </p>
                      ) : null}
                      <p className="text-[10px] mt-1" style={secondaryTextStyle}>
                        {nextMilestoneDay > 0
                          ? `再签 ${daysToNextMilestone} 天解锁第 ${nextMilestoneDay} 天奖励`
                          : '已达成30天，次日自动重置并开启新周期'}
                      </p>
                    </div>

                    <button
                      onClick={handleSignIn}
                      disabled={overview?.signedIn || isSigning}
                      className={`min-w-[96px] px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        overview?.signedIn
                          ? 'bg-[var(--bg-primary)] text-slate-400 border border-theme'
                          : 'bg-accent-gradient text-black shadow-md hover:brightness-110'
                      }`}
                    >
                      {overview?.signedIn ? '已签到' : isSigning ? '签到中...' : '立即签到'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
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


import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { gameApi } from '../services/api/game';
import { useAuth } from '../context/AuthContext';
import type { Game } from '../types';
import type { SystemNotificationAdminItem, SystemNotificationUpsert } from '../services/api/messageAdmin';

// --- Types ---
type TabMode = '代理管理' | '玩家列表' | '订单查询' | '业绩详情' | '结算中心' | '手游排序';

type AgencyStats = {
  role: string;
  code: string;
  creatable?: string;
  registerCount?: number;
  totalFlow?: string;
  totalProfit?: string;
  withdrawn?: string;
  withdrawable?: string;
};

type AgentGameRebate = {
  gameId: number;
  gameName?: string;
  rebateRatePct: number;
};

type AgentItem = {
  id: number;
  account: string;
  username?: string;
  role: string;
  inviteCode: string;
  upline: string;
  status: string;
  createdAt: string;
  gameRebates?: AgentGameRebate[];
};

type PlayerItem = {
  id: number;
  account: string;
  inviteCode: string;
  recharge: string;
  registeredAt: string;
};

type OrderItem = {
  orderNo: string;
  gameId: string;
  gameName: string;
  account: string;
  amount: string;
  payTime: string;
  status: string;
};

type SystemNotificationFormState = {
  title: string;
  content: string;
  category: string;
  level: 'info' | 'warning' | 'success';
  targetType: 'all' | 'user';
  targetUserId: string;
};

type BossItem = {
  id: number;
  account: string;
  nickname: string;
  status: string;
  games: { id: number; name: string }[];
  createdAt: string;
};

type PerformanceOverviewEntry = {
  inviteCode: string;
  amount: string;
  diffRatePct: number;
  profit: string;
};

type PerformanceOverviewDetail = {
  gameId: string;
  gameName: string;
  entries: PerformanceOverviewEntry[];
};

type PerformanceOverviewStat = {
  totalAmount: string;
  orderCount: number;
  totalProfit: string;
};

type PerformanceOverviewCard = {
  key: string;
  label: string;
  date?: string;
  totalAmount: string;
  orderCount: number;
  totalProfit: string;
  details: PerformanceOverviewDetail[];
};

type PerformanceOverviewAgent = {
  inviteCode: string;
  nickname: string;
  role?: string;
  downlineCount: number;
  today: PerformanceOverviewStat;
  yesterday: PerformanceOverviewStat;
  total: PerformanceOverviewStat;
};

type PerformanceOverviewGame = {
  gameId: string;
  gameName: string;
  ratePct: number;
  rateSource: string;
  today: PerformanceOverviewStat;
  yesterday: PerformanceOverviewStat;
  total: PerformanceOverviewStat;
};

type WithdrawItem = {
  id: number;
  amount: string;
  status: string;
  createdAt: string;
};

type ApprovalItem = {
  id: number;
  agentAccount: string;
  inviteCode: string;
  amount: string;
  status: string;
  createdAt: string;
};

type GameOrderItem = {
  gameId: number;
  name: string;
  iconUrl?: string;
  platform?: string;
  sortIndex?: number;
};

const PAGE_SIZE = 10;

const ROLE_SUPER_ADMIN = 1;
const ROLE_TOP_PROMOTER = 2;
const ROLE_GENERAL_AGENT = 3;
const ROLE_SUB_AGENT = 4;
const ROLE_STREAMER = 5;

const ROLE_OPTIONS: Record<number, { id: number; name: string }[]> = {
  [ROLE_SUPER_ADMIN]: [
    { id: ROLE_TOP_PROMOTER, name: '总推' }
  ],
  [ROLE_TOP_PROMOTER]: [{ id: ROLE_GENERAL_AGENT, name: '总代' }],
  [ROLE_GENERAL_AGENT]: [{ id: ROLE_SUB_AGENT, name: '子代' }],
  [ROLE_SUB_AGENT]: [{ id: ROLE_STREAMER, name: '主播' }]
};

const formatRatePct = (value: number) => {
  if (Number.isNaN(value)) return '--';
  const fixed = value.toFixed(2);
  return fixed.replace(/\.?0+$/, '');
};

// --- Components ---

const UserInfoCard = ({
  stats,
  userId,
  showRegisterCount = true,
  showCreatable = true,
  title = '代理中心'
}: {
  stats: AgencyStats | null;
  userId?: number;
  showRegisterCount?: boolean;
  showCreatable?: boolean;
  title?: string;
}) => {
  const [copied, setCopied] = useState(false);
  if (!stats) return <div className="h-32 bg-slate-900 rounded-[24px] animate-pulse mb-6 border border-white/5"></div>;

  const copyInviteCode = async () => {
    if (!stats.code) return;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(stats.code);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = stats.code;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch (err) {
      window.alert('复制失败，请手动复制');
    }
  };

  return (
    // Black Card with Gold Details - Always Dark for Premium Look
    <div className="bg-[#0f172a] rounded-[24px] p-6 border border-white/10 mb-6 relative overflow-hidden group shadow-xl">
       {/* Background Decoration */}
       <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-amber-500/20"></div>
       <div className="absolute bottom-0 left-0 w-32 h-32 bg-slate-700/10 rounded-full blur-3xl -ml-10 -mb-10"></div>
       <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay"></div>
       
       <div className="relative z-10 text-white">
           <div className="flex justify-between items-start mb-6">
              <div className="flex items-center space-x-4">
                 <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-700 flex items-center justify-center text-slate-900 text-2xl shadow-lg border border-amber-200/50">
                    👑
                 </div>
                 <div>
                    <h2 className="text-xl font-black text-white leading-tight">{title}</h2>
                    <div className="flex items-center mt-1.5">
                        <span className="text-[10px] font-bold bg-amber-500/20 text-amber-500 px-2 py-0.5 rounded border border-amber-500/30 mr-2 uppercase tracking-wider">
                           {stats.role}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">ID: {userId || '--'}</span>
                    </div>
                 </div>
              </div>
              <div className="text-right">
                  <p className="text-[10px] text-slate-400 mb-1 font-bold uppercase tracking-widest">Invite Code</p>
                  <div
                    className="flex items-center space-x-2 justify-end cursor-pointer active:opacity-70 group/code"
                    onClick={copyInviteCode}
                    title="点击复制邀请码"
                  >
                      <span className="text-xl font-black text-amber-500 tracking-wider group-hover/code:text-amber-200 transition-colors">{stats.code}</span>
                      <svg className="w-4 h-4 text-slate-500 group-hover/code:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>
                      {copied && <span className="text-[10px] text-emerald-400">已复制</span>}
                  </div>
              </div>
           </div>

           {(showCreatable || showRegisterCount) && (
             <div className={`flex items-center ${showCreatable && showRegisterCount ? 'justify-between' : 'justify-start'} bg-white/5 rounded-2xl p-4 border border-white/10 backdrop-blur-sm`}>
                {showCreatable && (
                  <div className="flex items-center space-x-3">
                     <span className="text-xs text-slate-400">当前可创建</span>
                     <span className="text-base font-bold text-white">{stats.creatable || '无'}</span>
                  </div>
                )}
                {showCreatable && showRegisterCount && <div className="w-px h-4 bg-white/10"></div>}
                {showRegisterCount && (
                  <div className="flex items-center space-x-3">
                     <span className="text-xs text-slate-400">总注册数</span>
                     <span className="text-base font-bold text-white">{stats.registerCount ?? 0}</span>
                  </div>
                )}
             </div>
           )}
       </div>
    </div>
  );
};

// --- Functional Components ---

const CreateAgent = ({ roleOptions }: { roleOptions: { id: number; name: string }[] }) => {
  const [formData, setFormData] = useState({
    phone: '',
    password: '',
    roleId: roleOptions[0]?.id || 0,
    inviteCode: '',
    gameRebates: [] as { gameId: number; rebateRatePct: string }[]
  });
  const [games, setGames] = useState<Game[]>([]);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;
    const loadGames = async () => {
      try {
        const list = await gameApi.getList('all', 1, 200);
        if (mounted) {
          setGames(list);
        }
      } catch (err) {
        // ignore load errors
      }
    };
    loadGames();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (roleOptions[0]) {
      setFormData((prev) => ({ ...prev, roleId: roleOptions[0].id }));
    }
  }, [roleOptions]);

  const submit = async () => {
    setError('');
    setResult(null);
    if (!formData.phone) {
      setError('请输入手机号');
      return;
    }
    if (!formData.password) {
      setError('请输入初始密码');
      return;
    }
    if (!formData.roleId) {
      setError('请选择角色');
      return;
    }
    setSubmitting(true);
    try {
      const gameRebates = formData.gameRebates
        .filter((item) => item.gameId)
        .map((item) => ({
          gameId: item.gameId,
          rebateRatePct: Number(item.rebateRatePct || '0')
        }));
      const res = await api.agency.createAgent({
        username: formData.phone,
        phone: formData.phone,
        password: formData.password,
        roleId: formData.roleId,
        inviteCode: formData.inviteCode,
        gameRebates
      });
      setResult(res);
      setFormData({ phone: '', password: '', roleId: formData.roleId, inviteCode: '', gameRebates: [] });
    } catch (err: any) {
      setError(err.message || '创建失败');
    } finally {
      setSubmitting(false);
    }
  };

  const addGameRebate = () => {
    const firstGameId = games[0] ? Number(games[0].id) : 0;
    setFormData({
      ...formData,
      gameRebates: [...formData.gameRebates, { gameId: firstGameId, rebateRatePct: '' }]
    });
  };

  const updateGameRebate = (index: number, key: 'gameId' | 'rebateRatePct', value: number | string) => {
    const next = [...formData.gameRebates];
    next[index] = { ...next[index], [key]: value };
    setFormData({ ...formData, gameRebates: next });
  };

  const removeGameRebate = (index: number) => {
    const next = formData.gameRebates.filter((_, idx) => idx !== index);
    setFormData({ ...formData, gameRebates: next });
  };

  return (
    <div className="card-bg rounded-[24px] p-6 shadow-sm border border-theme space-y-5 animate-fade-in-up">
      <div className="flex items-center space-x-2 mb-2">
        <div className="w-1 h-5 bg-accent-gradient rounded-full"></div>
        <h3 className="font-bold text-lg" style={{color: 'var(--text-primary)'}}>创建下级代理</h3>
      </div>

      {error && (
        <div className="bg-red-500/10 text-red-500 text-xs px-4 py-3 rounded-xl border border-red-500/20">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 ml-1">手机号</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full bg-[var(--bg-primary)] border border-theme rounded-xl px-4 py-3.5 text-sm outline-none text-[var(--text-primary)] focus:ring-2 focus:ring-amber-500/50 transition-all font-medium placeholder:text-slate-500"
            placeholder="请输入11位手机号"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 ml-1">初始密码</label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full bg-[var(--bg-primary)] border border-theme rounded-xl px-4 py-3.5 text-sm outline-none text-[var(--text-primary)] focus:ring-2 focus:ring-amber-500/50 transition-all font-medium placeholder:text-slate-500"
            placeholder="请填写初始密码"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 ml-1">代理码</label>
          <input
            type="text"
            value={formData.inviteCode}
            onChange={(e) => setFormData({ ...formData, inviteCode: e.target.value.toUpperCase() })}
            className="w-full bg-[var(--bg-primary)] border border-theme rounded-xl px-4 py-3.5 text-sm outline-none text-[var(--text-primary)] focus:ring-2 focus:ring-amber-500/50 transition-all font-medium placeholder:text-slate-500"
            placeholder="不填自动生成（4位大写字母或数字）"
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-400 ml-1">游戏分成比例</label>
            <button
              type="button"
              onClick={addGameRebate}
              className="text-[10px] font-bold text-amber-500 hover:text-amber-300"
            >
              添加游戏
            </button>
          </div>
          {formData.gameRebates.length === 0 ? (
            <div className="text-[10px] text-slate-500 bg-[var(--bg-primary)] border border-theme rounded-xl px-3 py-2">
              未配置分成，默认0
            </div>
          ) : (
            <div className="space-y-3">
              {formData.gameRebates.map((item, index) => (
                <div key={`${item.gameId}-${index}`} className="flex items-center space-x-2">
                  <select
                    value={item.gameId}
                    onChange={(e) => updateGameRebate(index, 'gameId', Number(e.target.value))}
                    className="flex-1 bg-[var(--bg-primary)] border border-theme rounded-xl px-3 py-2.5 text-xs outline-none text-[var(--text-primary)] focus:ring-2 focus:ring-amber-500/50 transition-all"
                  >
                    <option value={0}>选择游戏</option>
                    {games.map((game) => (
                      <option key={game.id} value={Number(game.id)}>
                        {game.title}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step="0.01"
                    value={item.rebateRatePct}
                    onChange={(e) => updateGameRebate(index, 'rebateRatePct', e.target.value)}
                    className="w-24 bg-[var(--bg-primary)] border border-theme rounded-xl px-3 py-2.5 text-xs outline-none text-[var(--text-primary)] focus:ring-2 focus:ring-amber-500/50 transition-all"
                    placeholder="比例(%)"
                  />
                  <button
                    type="button"
                    onClick={() => removeGameRebate(index)}
                    className="text-xs text-slate-500 hover:text-red-400"
                  >
                    删除
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <button
        onClick={submit}
        disabled={submitting}
        className="w-full bg-gradient-to-r from-slate-700 to-slate-800 text-white font-bold py-4 rounded-2xl shadow-lg mt-6 active:scale-[0.98] transition-all hover:bg-slate-700 border border-theme hover:text-amber-400 disabled:opacity-60"
      >
        {submitting ? '创建中...' : '立即创建'}
      </button>

      {result && (
        <div className="bg-emerald-500/10 text-emerald-500 text-xs px-4 py-3 rounded-xl border border-emerald-500/20 space-y-1">
          <div>账号：{result.username}</div>
          <div>手机号：{result.phone}</div>
          <div>密码：{result.password}</div>
          <div>代理码：{result.inviteCode}</div>
          {Array.isArray(result.gameRebates) && result.gameRebates.length > 0 && (
            <div className="text-[10px] text-emerald-400">
              分成：{result.gameRebates.map((item: any) => `${item.gameName || item.gameId} ${formatRatePct(Number(item.rebateRatePct))}%`).join(', ')}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const DirectAgentList = () => {
  const [keyword, setKeyword] = useState('');
  const [list, setList] = useState<AgentItem[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    phone: '',
    password: '',
    status: 1,
    gameRebates: [] as { gameId: number; rebateRatePct: string }[]
  });
  const [error, setError] = useState('');

  const load = async (nextPage = 1) => {
    setLoading(true);
    try {
      const data = await api.agency.getAgents({ scope: 'direct', keyword: keyword.trim(), page: nextPage, pageSize: PAGE_SIZE });
      setList(data.list || []);
      setTotal(data.total || 0);
      setPage(nextPage);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(1);
  }, []);

  useEffect(() => {
    let mounted = true;
    const loadGames = async () => {
      try {
        const list = await gameApi.getList('all', 1, 200);
        if (mounted) {
          setGames(list);
        }
      } catch (err) {
        // ignore load errors
      }
    };
    loadGames();
    return () => {
      mounted = false;
    };
  }, []);

  const startEdit = (item: AgentItem) => {
    const rebates = Array.isArray(item.gameRebates)
      ? item.gameRebates.map((rebate) => ({
          gameId: rebate.gameId,
          rebateRatePct: String(rebate.rebateRatePct ?? '')
        }))
      : [];
    setEditingId(item.id);
    setEditForm({
      phone: item.account,
      password: '',
      status: item.status === '正常' ? 1 : 2,
      gameRebates: rebates
    });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    setError('');
    if (!editForm.phone) {
      setError('请输入手机号');
      return;
    }
    try {
      const gameRebates = editForm.gameRebates
        .filter((item) => item.gameId)
        .map((item) => ({
          gameId: item.gameId,
          rebateRatePct: Number(item.rebateRatePct || '0')
        }));
      await api.agency.updateAgent(editingId, {
        phone: editForm.phone,
        password: editForm.password || undefined,
        status: editForm.status,
        gameRebates
      });
      setEditingId(null);
      setEditForm({ phone: '', password: '', status: 1, gameRebates: [] });
      load(page);
    } catch (err: any) {
      setError(err.message || '修改失败');
    }
  };

  const addEditGameRebate = () => {
    const firstGameId = games[0] ? Number(games[0].id) : 0;
    setEditForm({
      ...editForm,
      gameRebates: [...editForm.gameRebates, { gameId: firstGameId, rebateRatePct: '' }]
    });
  };

  const updateEditGameRebate = (index: number, key: 'gameId' | 'rebateRatePct', value: number | string) => {
    const next = [...editForm.gameRebates];
    next[index] = { ...next[index], [key]: value };
    setEditForm({ ...editForm, gameRebates: next });
  };

  const removeEditGameRebate = (index: number) => {
    const next = editForm.gameRebates.filter((_, idx) => idx !== index);
    setEditForm({ ...editForm, gameRebates: next });
  };

  const resolveGameName = (gameId: number, fallback?: string) => {
    if (fallback) return fallback;
    const game = games.find((item) => Number(item.id) === gameId);
    return game?.title || String(gameId);
  };

  const remove = async (item: AgentItem) => {
    if (!window.confirm(`确认删除直属代理 ${item.account} 吗？`)) {
      return;
    }
    try {
      await api.agency.deleteAgent(item.id);
      load(page);
    } catch (err: any) {
      setError(err.message || '删除失败');
    }
  };

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="card-bg rounded-[20px] p-4 border border-theme flex items-center space-x-2">
        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="手机号/用户名/代理码"
          className="flex-1 bg-[var(--bg-primary)] border border-theme rounded-xl px-3 py-2 text-xs outline-none text-[var(--text-primary)]"
        />
        <button onClick={() => load(1)} className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-800 text-white border border-theme">查询</button>
      </div>

      {error && (
        <div className="bg-red-500/10 text-red-500 text-xs px-4 py-3 rounded-xl border border-red-500/20">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 card-bg rounded-2xl border border-theme animate-pulse"></div>
          ))}
        </div>
      ) : list.length === 0 ? (
        <EmptyState title="暂无直属代理" />
      ) : (
        <div className="space-y-3">
          {list.map((item) => {
            const isExpanded = expandedId === item.id;
            const isEditing = editingId === item.id;
            return (
              <div key={item.id} className="card-bg rounded-2xl border border-theme p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold" style={{color: 'var(--text-primary)'}}>{item.account}</div>
                    <div className="text-[10px] text-slate-500 mt-1">{item.role} · 状态 {item.status}</div>
                  </div>
                  <div className="flex items-center space-x-2 text-[10px]">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : item.id)}
                      className="text-slate-400 border border-theme rounded-lg px-2 py-1"
                    >
                      查看
                    </button>
                    <button
                      onClick={() => startEdit(item)}
                      className="text-amber-500 border border-amber-500/30 rounded-lg px-2 py-1"
                    >
                      修改
                    </button>
                    <button
                      onClick={() => remove(item)}
                      className="text-red-500 border border-red-500/30 rounded-lg px-2 py-1"
                    >
                      删除
                    </button>
                  </div>
                </div>

                {Array.isArray(item.gameRebates) && item.gameRebates.length > 0 && (
                  <div className="mt-2 text-[10px] text-slate-500">
                    分成：
                    {item.gameRebates.map((rebate) => `${resolveGameName(rebate.gameId, rebate.gameName)} ${formatRatePct(rebate.rebateRatePct)}%`).join('，')}
                  </div>
                )}

                {isExpanded && (
                  <div className="mt-3 text-[10px] text-slate-500 space-y-1">
                    <div>邀请码：{item.inviteCode}</div>
                    <div>上级：{item.upline || '--'}</div>
                    <div>创建时间：{item.createdAt}</div>
                  </div>
                )}

                {isEditing && (
                  <div className="mt-4 border-t border-white/5 pt-4 space-y-3">
                    <input
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      placeholder="手机号"
                      className="w-full bg-[var(--bg-primary)] border border-theme rounded-xl px-3 py-2 text-xs outline-none text-[var(--text-primary)]"
                    />
                    <input
                      value={editForm.password}
                      onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                      placeholder="新密码（可选）"
                      type="password"
                      className="w-full bg-[var(--bg-primary)] border border-theme rounded-xl px-3 py-2 text-xs outline-none text-[var(--text-primary)]"
                    />
                    <select
                      value={editForm.status}
                      onChange={(e) => setEditForm({ ...editForm, status: Number(e.target.value) })}
                      className="w-full bg-[var(--bg-primary)] border border-theme rounded-xl px-3 py-2 text-xs text-slate-400"
                    >
                      <option value={1}>正常</option>
                      <option value={2}>禁用</option>
                    </select>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-500">分成设置</span>
                        <button
                          type="button"
                          onClick={addEditGameRebate}
                          className="text-[10px] text-amber-500 border border-amber-500/30 rounded-lg px-2 py-1"
                        >
                          添加游戏
                        </button>
                      </div>
                      {editForm.gameRebates.length === 0 ? (
                        <div className="text-[10px] text-slate-500">未配置分成</div>
                      ) : (
                        <div className="space-y-2">
                          {editForm.gameRebates.map((item, index) => (
                            <div key={`${item.gameId}-${index}`} className="flex items-center space-x-2">
                              <select
                                value={item.gameId}
                                onChange={(e) => updateEditGameRebate(index, 'gameId', Number(e.target.value))}
                                className="flex-1 bg-[var(--bg-primary)] border border-theme rounded-xl px-3 py-2 text-xs text-slate-400"
                              >
                                {games.map((game) => (
                                  <option key={game.id} value={Number(game.id)}>
                                    {game.title}
                                  </option>
                                ))}
                              </select>
                              <input
                                type="number"
                                min={0}
                                max={100}
                                step="0.01"
                                value={item.rebateRatePct}
                                onChange={(e) => updateEditGameRebate(index, 'rebateRatePct', e.target.value)}
                                className="w-24 bg-[var(--bg-primary)] border border-theme rounded-xl px-3 py-2 text-xs outline-none text-[var(--text-primary)] focus:ring-2 focus:ring-amber-500/50 transition-all"
                                placeholder="比例(%)"
                              />
                              <button
                                type="button"
                                onClick={() => removeEditGameRebate(index)}
                                className="text-xs text-slate-500 hover:text-red-400"
                              >
                                删除
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={saveEdit}
                        className="flex-1 bg-slate-800 text-white text-xs font-bold py-2.5 rounded-xl border border-theme"
                      >
                        保存修改
                      </button>
                      <button
                        onClick={() => { setEditingId(null); setEditForm({ phone: '', password: '', status: 1, gameRebates: [] }); }}
                        className="flex-1 text-xs text-slate-400 border border-theme rounded-xl py-2.5"
                      >
                        取消
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Pagination page={page} total={total} onChange={load} />
    </div>
  );
};

const AgentManagement = ({ roleOptions }: { roleOptions: { id: number; name: string }[] }) => {
  const [subTab, setSubTab] = useState<'create' | 'direct'>('create');
  return (
    <div className="space-y-4">
      <div className="card-bg rounded-[20px] p-2 border border-theme flex items-center">
        {[
          { id: 'create', label: '创建下级代理' },
          { id: 'direct', label: '直属代理列表' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSubTab(tab.id as 'create' | 'direct')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              subTab === tab.id ? 'bg-[var(--text-primary)] text-[var(--bg-primary)]' : 'text-slate-500'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {subTab === 'create' ? (
        roleOptions.length > 0 ? <CreateAgent roleOptions={roleOptions} /> : <EmptyState title="无创建权限" />
      ) : (
        <DirectAgentList />
      )}
    </div>
  );
};

type SuperAdminTab = 'allAgents' | 'allPlayers' | 'boss' | 'approval' | 'notifications';

const SuperAdminCenter = ({ isSuperAdmin }: { isSuperAdmin: boolean }) => {
  const [subTab, setSubTab] = useState<SuperAdminTab>('allAgents');
  if (!isSuperAdmin) {
    return <EmptyState title="无权限" />;
  }
  const menuItems = [
    { id: 'allAgents', icon: '📋', label: '全部代理' },
    { id: 'allPlayers', icon: '👥', label: '全部玩家' },
    { id: 'boss', icon: '👔', label: '老板管理' },
    { id: 'approval', icon: '📝', label: '审批管理' },
    { id: 'notifications', icon: '📣', label: '系统通知' }
  ];
  return (
    <div className="space-y-4">
      <div className="card-bg rounded-[24px] p-6 shadow-sm border border-theme mb-2">
        <div className="grid grid-cols-4 gap-y-6 gap-x-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setSubTab(item.id as SuperAdminTab)}
              className="flex flex-col items-center group transition-all duration-300 relative"
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl mb-2 transition-all duration-300 shadow-sm border ${
                subTab === item.id
                  ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] border-transparent scale-110 shadow-lg'
                  : 'bg-[var(--bg-primary)] text-slate-500 border-theme group-hover:border-accent/30 group-hover:text-accent'
              }`}>
                {item.icon}
              </div>
              <span className={`text-[11px] font-bold tracking-wide transition-colors ${
                subTab === item.id ? 'text-[var(--text-primary)]' : 'text-slate-500'
              }`}>
                {item.label}
              </span>
              {subTab === item.id && (
                <div className="absolute -bottom-2 w-1 h-1 bg-accent rounded-full shadow-[0_0_5px_rgba(245,158,11,0.8)]"></div>
              )}
            </button>
          ))}
        </div>
      </div>
      {subTab === 'allAgents' && <AgentList />}
      {subTab === 'allPlayers' && <PlayerList scope="all" />}
      {subTab === 'boss' && <BossManagement isSuperAdmin={isSuperAdmin} />}
      {subTab === 'approval' && <ApprovalList isSuperAdmin={isSuperAdmin} />}
      {subTab === 'notifications' && <SystemNotificationAdmin />}
    </div>
  );
};

const Pagination = ({ page, total, pageSize, onChange }: { page: number; total: number; pageSize?: number; onChange: (next: number) => void }) => {
  const size = pageSize || PAGE_SIZE;
  const totalPages = Math.max(1, Math.ceil(total / size));
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between text-xs text-slate-500 mt-4">
      <button
        onClick={() => onChange(Math.max(1, page - 1))}
        className="px-3 py-1.5 rounded-lg border border-theme hover:text-[var(--text-primary)]"
        disabled={page <= 1}
      >
        上一页
      </button>
      <span>第 {page} / {totalPages} 页</span>
      <button
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        className="px-3 py-1.5 rounded-lg border border-theme hover:text-[var(--text-primary)]"
        disabled={page >= totalPages}
      >
        下一页
      </button>
    </div>
  );
};

const SystemNotificationAdmin = () => {
  const [list, setList] = useState<SystemNotificationAdminItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [formError, setFormError] = useState('');
  const [form, setForm] = useState<SystemNotificationFormState>({
    title: '',
    content: '',
    category: 'system',
    level: 'info',
    targetType: 'all',
    targetUserId: ''
  });

  const load = async (nextPage = 1) => {
    setLoading(true);
    try {
      const data = await api.messageAdmin.listSystemNotifications({
        page: nextPage,
        pageSize: PAGE_SIZE,
        keyword: keyword.trim() || undefined,
        status: statusFilter === 'all' ? undefined : statusFilter,
        level: levelFilter === 'all' ? undefined : levelFilter,
        category: categoryFilter.trim() || undefined
      });
      setList(data.list || []);
      setTotal(data.total || 0);
      setPage(nextPage);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(1);
  }, []);

  const resetForm = () => {
    setSelectedId(null);
    setFormError('');
    setForm({
      title: '',
      content: '',
      category: 'system',
      level: 'info',
      targetType: 'all',
      targetUserId: ''
    });
  };

  const handleEdit = (item: SystemNotificationAdminItem) => {
    setSelectedId(item.id);
    setFormError('');
    setForm({
      title: item.title || '',
      content: item.content || '',
      category: item.category || 'system',
      level: item.level || 'info',
      targetType: item.targetType || 'all',
      targetUserId: item.targetUserId ? String(item.targetUserId) : ''
    });
  };

  const handleSave = async () => {
    setFormError('');

    if (!form.title.trim() || !form.content.trim()) {
      setFormError('标题和内容不能为空');
      return;
    }
    if (form.targetType === 'user' && !form.targetUserId.trim()) {
      setFormError('目标用户不能为空');
      return;
    }

    const payload: SystemNotificationUpsert = {
      title: form.title.trim(),
      content: form.content.trim(),
      category: form.category.trim() || 'system',
      level: form.level,
      targetType: form.targetType,
      targetUserId: form.targetType === 'user' ? Number(form.targetUserId) : undefined
    };
    if (selectedId) {
      payload.id = selectedId;
    }

    setSaving(true);
    try {
      if (selectedId) {
        await api.messageAdmin.updateSystemNotification(payload);
      } else {
        await api.messageAdmin.createSystemNotification(payload);
      }
      resetForm();
      load(1);
    } catch (err) {
      console.error(err);
      setFormError('保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handleRevoke = async (id: number) => {
    try {
      await api.messageAdmin.revokeSystemNotification(id);
      load(page);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="card-bg rounded-[20px] p-4 border border-theme space-y-3">
        <div className="flex flex-wrap gap-2">
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="标题关键词"
            className="flex-1 min-w-[120px] bg-[var(--bg-primary)] border border-theme rounded-xl px-3 py-2 text-xs outline-none text-[var(--text-primary)]"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[var(--bg-primary)] border border-theme rounded-xl px-3 py-2 text-xs text-[var(--text-primary)]"
          >
            <option value="all">全部状态</option>
            <option value="draft">草稿</option>
            <option value="published">已发布</option>
            <option value="revoked">已撤销</option>
          </select>
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="bg-[var(--bg-primary)] border border-theme rounded-xl px-3 py-2 text-xs text-[var(--text-primary)]"
          >
            <option value="all">全部等级</option>
            <option value="info">普通</option>
            <option value="warning">警告</option>
            <option value="success">成功</option>
          </select>
          <input
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            placeholder="分类"
            className="w-24 bg-[var(--bg-primary)] border border-theme rounded-xl px-3 py-2 text-xs outline-none text-[var(--text-primary)]"
          />
          <button onClick={() => load(1)} className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-800 text-white border border-theme">
            查询
          </button>
          <button onClick={resetForm} className="px-3 py-2 rounded-xl text-xs font-bold border border-theme text-slate-500">
            新增
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
          [1, 2, 3].map((i) => <div key={i} className="h-24 card-bg rounded-2xl border border-theme animate-pulse"></div>)
        ) : list.length === 0 ? (
          <EmptyState title="暂无通知" />
        ) : (
          list.map((item) => (
            <div key={item.id} className="card-bg rounded-2xl border border-theme p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold truncate" style={{color: 'var(--text-primary)'}}>{item.title}</div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    {item.category} · {item.level} · {item.status}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    发布 {item.publishAt ? new Date(item.publishAt).toLocaleString() : '--'}
                    {item.expireAt ? ` · 失效 ${new Date(item.expireAt).toLocaleString()}` : ''}
                  </div>
                </div>
                <div className="flex flex-col space-y-2">
                  <button onClick={() => handleEdit(item)} className="px-3 py-1.5 rounded-lg text-xs font-bold border border-theme text-slate-500 hover:text-[var(--text-primary)]">
                    编辑
                  </button>
                  <button
                    onClick={() => handleRevoke(item.id)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold border border-theme text-red-400 hover:text-red-300"
                    disabled={item.status === 'revoked'}
                  >
                    撤回
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
        <Pagination page={page} total={total} onChange={load} />
      </div>

      <div className="card-bg rounded-[20px] p-4 border border-theme space-y-3">
        <div className="text-sm font-bold" style={{color: 'var(--text-primary)'}}>
          {selectedId ? `编辑通知 #${selectedId}` : '新建通知'}
        </div>
        {formError && <div className="text-xs text-red-400">{formError}</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="标题"
            className="bg-[var(--bg-primary)] border border-theme rounded-xl px-3 py-2 text-xs text-[var(--text-primary)]"
          />
          <input
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            placeholder="分类"
            className="bg-[var(--bg-primary)] border border-theme rounded-xl px-3 py-2 text-xs text-[var(--text-primary)]"
          />
          <select
            value={form.level}
            onChange={(e) => setForm({ ...form, level: e.target.value as SystemNotificationFormState['level'] })}
            className="bg-[var(--bg-primary)] border border-theme rounded-xl px-3 py-2 text-xs text-[var(--text-primary)]"
          >
            <option value="info">普通</option>
            <option value="warning">警告</option>
            <option value="success">成功</option>
          </select>
          <select
            value={form.targetType}
            onChange={(e) => setForm({ ...form, targetType: e.target.value as SystemNotificationFormState['targetType'] })}
            className="bg-[var(--bg-primary)] border border-theme rounded-xl px-3 py-2 text-xs text-[var(--text-primary)]"
          >
            <option value="all">全体</option>
            <option value="user">指定用户</option>
          </select>
          <input
            value={form.targetUserId}
            onChange={(e) => setForm({ ...form, targetUserId: e.target.value })}
            placeholder="目标用户ID"
            disabled={form.targetType !== 'user'}
            className="bg-[var(--bg-primary)] border border-theme rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] disabled:opacity-50"
          />
        </div>
        <textarea
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          placeholder="通知内容"
          className="w-full min-h-[90px] bg-[var(--bg-primary)] border border-theme rounded-xl px-3 py-2 text-xs text-[var(--text-primary)]"
        />
        <div className="flex items-center justify-end space-x-2">
          {selectedId && (
            <button onClick={resetForm} className="px-3 py-2 rounded-xl text-xs font-bold border border-theme text-slate-500">
              取消编辑
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-accent-gradient text-black hover:brightness-110 disabled:opacity-60"
          >
            {saving ? '发布中...' : '发布通知'}
          </button>
        </div>
      </div>
    </div>
  );
};

const AgentList = () => {
  const [keyword, setKeyword] = useState('');
  const [list, setList] = useState<AgentItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const load = async (nextPage = 1) => {
    setLoading(true);
    try {
      const data = await api.agency.getAgents({ scope: 'all', keyword: keyword.trim(), page: nextPage, pageSize: PAGE_SIZE });
      setList(data.list || []);
      setTotal(data.total || 0);
      setPage(nextPage);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(1);
  }, []);

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="card-bg rounded-[20px] p-4 border border-theme flex items-center space-x-2">
        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="手机号/用户名/代理码"
          className="flex-1 bg-[var(--bg-primary)] border border-theme rounded-xl px-3 py-2 text-xs outline-none text-[var(--text-primary)]"
        />
        <button onClick={() => load(1)} className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-800 text-white border border-theme">查询</button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 card-bg rounded-2xl border border-theme animate-pulse"></div>
          ))}
        </div>
      ) : list.length === 0 ? (
        <EmptyState title="暂无代理" />
      ) : (
        <div className="space-y-3">
          {list.map((item) => (
            <div key={item.id} className="card-bg rounded-2xl border border-theme p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold" style={{color: 'var(--text-primary)'}}>{item.account}</div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    {item.role} · 上级 {item.upline || '--'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-black text-amber-500">{item.inviteCode}</div>
                  <span className="text-[10px] text-slate-500">{item.status}</span>
                </div>
              </div>
              <div className="text-[10px] text-slate-500 mt-2">创建时间 {item.createdAt}</div>
              {Array.isArray(item.gameRebates) && item.gameRebates.length > 0 && (
                <div className="text-[10px] text-slate-500 mt-1">
                  分成：
                  {item.gameRebates.map((rebate) => `${rebate.gameName || rebate.gameId} ${formatRatePct(rebate.rebateRatePct)}%`).join('，')}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Pagination page={page} total={total} onChange={load} />
    </div>
  );
};

const PlayerList = ({ scope = 'direct' }: { scope?: 'direct' | 'all' }) => {
  const [keyword, setKeyword] = useState('');
  const [list, setList] = useState<PlayerItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = async (nextPage = 1) => {
    setLoading(true);
    try {
      const data = scope === 'all'
        ? await api.agency.getAllPlayers({ keyword: keyword.trim(), page: nextPage, pageSize: PAGE_SIZE })
        : await api.agency.getPlayers({ keyword: keyword.trim(), page: nextPage, pageSize: PAGE_SIZE });
      setList(data.list || []);
      setTotal(data.total || 0);
      setPage(nextPage);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(1);
  }, []);

  const resetPassword = async (item: PlayerItem) => {
    setError('');
    const next = window.prompt(`请输入玩家 ${item.account} 的新密码`);
    if (!next) {
      return;
    }
    try {
      await api.agency.resetPlayerPassword(item.id, next);
      window.alert('重置成功');
    } catch (err: any) {
      setError(err.message || '重置失败');
    }
  };

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="card-bg rounded-[20px] p-4 border border-theme flex items-center space-x-2">
        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="手机号/用户名"
          className="flex-1 bg-[var(--bg-primary)] border border-theme rounded-xl px-3 py-2 text-xs outline-none text-[var(--text-primary)]"
        />
        <button onClick={() => load(1)} className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-800 text-white border border-theme">查询</button>
      </div>

      {error && (
        <div className="bg-red-500/10 text-red-500 text-xs px-4 py-3 rounded-xl border border-red-500/20">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 card-bg rounded-2xl border border-theme animate-pulse"></div>
          ))}
        </div>
      ) : list.length === 0 ? (
        <EmptyState title="暂无玩家" />
      ) : (
        <div className="space-y-3">
          {list.map((item) => (
            <div key={item.id} className="card-bg rounded-2xl border border-theme p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold" style={{color: 'var(--text-primary)'}}>{item.account}</div>
                  <div className="text-[10px] text-slate-500 mt-1">代理码 {item.inviteCode}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-black text-emerald-500">¥ {item.recharge}</div>
                  <span className="text-[10px] text-slate-500">{item.registeredAt}</span>
                  <div className="mt-2">
                    <button
                      onClick={() => resetPassword(item)}
                      className="text-[10px] text-amber-500 border border-amber-500/30 rounded-lg px-2 py-1"
                    >
                      重置密码
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

  <Pagination page={page} total={total} onChange={load} />
</div>
);
};

const OrderQuery = () => {
  const [keyword, setKeyword] = useState('');
  const [list, setList] = useState<OrderItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = async (nextPage = 1) => {
    setLoading(true);
    setError('');
    try {
      const data = await api.agency.getOrders({ keyword: keyword.trim(), page: nextPage, pageSize: PAGE_SIZE });
      setList(data.list || []);
      setTotal(data.total || 0);
      setPage(nextPage);
    } catch (err: any) {
      setError(err.message || '查询失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(1);
  }, []);

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="card-bg rounded-[20px] p-4 border border-theme flex items-center space-x-2">
        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="手机号/订单号"
          className="flex-1 bg-[var(--bg-primary)] border border-theme rounded-xl px-3 py-2 text-xs outline-none text-[var(--text-primary)]"
        />
        <button onClick={() => load(1)} className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-800 text-white border border-theme">查询</button>
      </div>

      {error && (
        <div className="bg-red-500/10 text-red-500 text-xs px-4 py-3 rounded-xl border border-red-500/20">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 card-bg rounded-2xl border border-theme animate-pulse"></div>
          ))}
        </div>
      ) : list.length === 0 ? (
        <EmptyState title="暂无订单" />
      ) : (
        <div className="space-y-3">
          {list.map((item) => (
            <div key={item.orderNo} className="card-bg rounded-2xl border border-theme p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold" style={{color: 'var(--text-primary)'}}>
                    {item.gameName || item.gameId}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">订单号 {item.orderNo}</div>
                  <div className="text-[10px] text-slate-500 mt-1">玩家 {item.account || '--'}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-black text-amber-500">¥ {item.amount}</div>
                  <div className="text-[10px] text-slate-500">{item.payTime || '--'}</div>
                  <div className="text-[10px] text-slate-400 mt-1">{item.status || '--'}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Pagination page={page} total={total} onChange={load} />
    </div>
  );
};

const BossManagement = ({ isSuperAdmin }: { isSuperAdmin: boolean }) => {
  const [games, setGames] = useState<Game[]>([]);
  const [list, setList] = useState<BossItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [listError, setListError] = useState('');
  const [subTab, setSubTab] = useState<'create' | 'list'>('create');
  const [formData, setFormData] = useState({
    username: '',
    phone: '',
    password: '',
    inviteCode: '',
    gameIds: [] as number[]
  });
  const [editingBossId, setEditingBossId] = useState<number | null>(null);
  const [editingBossAccountId, setEditingBossAccountId] = useState<number | null>(null);
  const [editingGameIds, setEditingGameIds] = useState<number[]>([]);
  const [savingGames, setSavingGames] = useState(false);
  const [accountForm, setAccountForm] = useState({ username: '', phone: '', password: '', status: 1 });

  const loadGames = async () => {
    try {
      const data = await gameApi.getList('all', 1, 200);
      setGames(data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadBosses = async (nextPage = 1) => {
    setLoading(true);
    try {
      const data = await api.agency.getBosses({ page: nextPage, pageSize: PAGE_SIZE });
      setList(data.list || []);
      setTotal(data.total || 0);
      setPage(nextPage);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isSuperAdmin) return;
    loadGames();
    loadBosses(1);
  }, [isSuperAdmin]);

  useEffect(() => {
    if (!isSuperAdmin) return;
    if (subTab === 'list') {
      loadBosses(1);
    }
  }, [subTab, isSuperAdmin]);

  const toggleGameId = (ids: number[], gameId: number) => {
    if (ids.includes(gameId)) {
      return ids.filter((id) => id !== gameId);
    }
    return [...ids, gameId];
  };

  const submit = async () => {
    setError('');
    if (!formData.phone) {
      setError('请输入手机号');
      return;
    }
    setCreating(true);
    try {
      await api.agency.createBoss({
        username: formData.phone,
        phone: formData.phone,
        password: formData.password,
        inviteCode: formData.inviteCode,
        gameIds: formData.gameIds
      });
      setFormData({ username: '', phone: '', password: '', inviteCode: '', gameIds: [] });
      loadBosses(1);
    } catch (err: any) {
      setError(err.message || '创建失败');
    } finally {
      setCreating(false);
    }
  };

  const startEdit = (boss: BossItem) => {
    setEditingBossId(boss.id);
    setEditingGameIds(boss.games.map((item) => item.id));
    setEditingBossAccountId(null);
  };

  const saveEdit = async () => {
    if (!editingBossId) return;
    setSavingGames(true);
    try {
      await api.agency.updateBossGames(editingBossId, editingGameIds);
      setEditingBossId(null);
      setEditingGameIds([]);
      loadBosses(page);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingGames(false);
    }
  };

  const startEditAccount = (boss: BossItem) => {
    setEditingBossAccountId(boss.id);
    setEditingBossId(null);
    setEditingGameIds([]);
    setAccountForm({
      username: boss.account,
      phone: boss.account,
      password: '',
      status: boss.status === '正常' ? 1 : 2
    });
  };

  const saveAccount = async () => {
    if (!editingBossAccountId) return;
    setListError('');
    if (!accountForm.phone) {
      setListError('请输入手机号');
      return;
    }
    try {
      await api.agency.updateBoss(editingBossAccountId, {
        username: accountForm.phone,
        phone: accountForm.phone,
        password: accountForm.password || undefined,
        status: accountForm.status
      });
      setEditingBossAccountId(null);
      setAccountForm({ username: '', phone: '', password: '', status: 1 });
      loadBosses(page);
    } catch (err: any) {
      setListError(err.message || '修改失败');
    }
  };

  if (!isSuperAdmin) {
    return <EmptyState title="无权限" />;
  }

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="card-bg rounded-[20px] p-2 border border-theme flex items-center">
        {[
          { id: 'create', label: '创建老板账号' },
          { id: 'list', label: '老板账号列表' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSubTab(tab.id as 'create' | 'list')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              subTab === tab.id ? 'bg-[var(--text-primary)] text-[var(--bg-primary)]' : 'text-slate-500'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {subTab === 'create' ? (
        <div className="card-bg rounded-[24px] p-5 border border-theme">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-1 h-5 bg-accent-gradient rounded-full"></div>
            <h3 className="font-bold text-lg" style={{color: 'var(--text-primary)'}}>创建老板账号</h3>
          </div>
          {error && (
            <div className="bg-red-500/10 text-red-500 text-xs px-4 py-3 rounded-xl border border-red-500/20 mb-4">
              {error}
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
          <input
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value, username: e.target.value })}
            placeholder="手机号"
            className="bg-[var(--bg-primary)] border border-theme rounded-xl px-3 py-2 text-xs outline-none text-[var(--text-primary)]"
          />
            <input
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="初始密码"
              type="password"
              className="bg-[var(--bg-primary)] border border-theme rounded-xl px-3 py-2 text-xs outline-none text-[var(--text-primary)]"
            />
            <input
              value={formData.inviteCode}
              onChange={(e) => setFormData({ ...formData, inviteCode: e.target.value.toUpperCase() })}
              placeholder="代理码(可选)"
              className="bg-[var(--bg-primary)] border border-theme rounded-xl px-3 py-2 text-xs outline-none text-[var(--text-primary)]"
            />
          </div>
          <div className="mt-4">
            <div className="text-[10px] text-slate-400 mb-2">绑定游戏（可多选）</div>
            <div className="grid grid-cols-2 gap-2 max-h-32 overflow-auto">
              {games.map((game) => {
                const gameId = Number(game.id);
                return (
                  <label key={game.id} className="flex items-center text-xs text-slate-400 space-x-2 bg-[var(--bg-primary)] border border-theme rounded-lg px-2 py-1.5">
                    <input
                      type="checkbox"
                      checked={formData.gameIds.includes(gameId)}
                      onChange={() => setFormData({ ...formData, gameIds: toggleGameId(formData.gameIds, gameId) })}
                    />
                    <span className="truncate">{game.title}</span>
                  </label>
                );
              })}
            </div>
          </div>
          <button
            onClick={submit}
            disabled={creating}
            className="w-full mt-4 bg-slate-800 text-white text-sm font-bold py-3 rounded-2xl border border-theme disabled:opacity-60"
          >
            {creating ? '创建中...' : '创建老板'}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {listError && (
            <div className="bg-red-500/10 text-red-500 text-xs px-4 py-3 rounded-xl border border-red-500/20">
              {listError}
            </div>
          )}
          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-20 card-bg rounded-2xl border border-theme animate-pulse"></div>
              ))}
            </div>
          ) : list.length === 0 ? (
            <EmptyState title="暂无老板账号" />
          ) : (
            <div className="space-y-3">
              {list.map((boss) => (
                <div key={boss.id} className="card-bg rounded-2xl border border-theme p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold" style={{color: 'var(--text-primary)'}}>{boss.account}</div>
                      <div className="text-[10px] text-slate-500 mt-1">{boss.nickname} · {boss.status}</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => startEditAccount(boss)}
                        className="text-xs text-amber-500 border border-amber-500/30 rounded-lg px-2 py-1"
                      >
                        修改账号
                      </button>
                      <button
                        onClick={() => startEdit(boss)}
                        className="text-xs text-amber-500 border border-amber-500/30 rounded-lg px-2 py-1"
                      >
                        编辑游戏
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {boss.games.length === 0 ? (
                      <span className="text-[10px] text-slate-500">未绑定游戏</span>
                    ) : (
                      boss.games.map((game) => (
                        <span key={game.id} className="text-[10px] px-2 py-1 rounded-full bg-[var(--bg-primary)] border border-theme text-slate-400">
                          {game.name}
                        </span>
                      ))
                    )}
                  </div>

                  {editingBossId === boss.id && (
                    <div className="mt-4 border-t border-white/5 pt-4 space-y-3">
                      <div className="text-[10px] text-slate-400">选择游戏</div>
                      <div className="grid grid-cols-2 gap-2 max-h-32 overflow-auto">
                        {games.map((game) => {
                          const gameId = Number(game.id);
                          return (
                            <label key={game.id} className="flex items-center text-xs text-slate-400 space-x-2 bg-[var(--bg-primary)] border border-theme rounded-lg px-2 py-1.5">
                              <input
                                type="checkbox"
                                checked={editingGameIds.includes(gameId)}
                                onChange={() => setEditingGameIds(toggleGameId(editingGameIds, gameId))}
                              />
                              <span className="truncate">{game.title}</span>
                            </label>
                          );
                        })}
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={saveEdit}
                          disabled={savingGames}
                          className="flex-1 bg-slate-800 text-white text-xs font-bold py-2.5 rounded-xl border border-theme"
                        >
                          {savingGames ? '保存中...' : '保存'}
                        </button>
                        <button
                          onClick={() => { setEditingBossId(null); setEditingGameIds([]); }}
                          className="flex-1 text-xs text-slate-400 border border-theme rounded-xl py-2.5"
                        >
                          取消
                        </button>
                      </div>
                    </div>
                  )}

                  {editingBossAccountId === boss.id && (
                    <div className="mt-4 border-t border-white/5 pt-4 space-y-3">
                      <input
                        value={accountForm.phone}
                        readOnly
                        placeholder="用户名=手机号"
                        className="w-full bg-[var(--bg-primary)] border border-theme rounded-xl px-3 py-2 text-xs outline-none text-[var(--text-primary)] opacity-70"
                      />
                      <input
                        value={accountForm.phone}
                        onChange={(e) => setAccountForm({ ...accountForm, phone: e.target.value, username: e.target.value })}
                        placeholder="手机号"
                        className="w-full bg-[var(--bg-primary)] border border-theme rounded-xl px-3 py-2 text-xs outline-none text-[var(--text-primary)]"
                      />
                      <input
                        value={accountForm.password}
                        onChange={(e) => setAccountForm({ ...accountForm, password: e.target.value })}
                        placeholder="新密码（可选）"
                        type="password"
                        className="w-full bg-[var(--bg-primary)] border border-theme rounded-xl px-3 py-2 text-xs outline-none text-[var(--text-primary)]"
                      />
                      <select
                        value={accountForm.status}
                        onChange={(e) => setAccountForm({ ...accountForm, status: Number(e.target.value) })}
                        className="w-full bg-[var(--bg-primary)] border border-theme rounded-xl px-3 py-2 text-xs text-slate-400"
                      >
                        <option value={1}>正常</option>
                        <option value={2}>禁用</option>
                      </select>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={saveAccount}
                          className="flex-1 bg-slate-800 text-white text-xs font-bold py-2.5 rounded-xl border border-theme"
                        >
                          保存修改
                        </button>
                        <button
                          onClick={() => { setEditingBossAccountId(null); setAccountForm({ username: '', phone: '', password: '', status: 1 }); }}
                          className="flex-1 text-xs text-slate-400 border border-theme rounded-xl py-2.5"
                        >
                          取消
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <Pagination page={page} total={total} onChange={loadBosses} />
        </div>
      )}
    </div>
  );
};

const PerformanceDetail = () => {
  const [cards, setCards] = useState<PerformanceOverviewCard[]>([]);
  const [agents, setAgents] = useState<PerformanceOverviewAgent[]>([]);
  const [games, setGames] = useState<PerformanceOverviewGame[]>([]);
  const [loading, setLoading] = useState(false);
  const [detailCard, setDetailCard] = useState<PerformanceOverviewCard | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'agent' | 'game'>('overview');

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.agency.getPerformanceOverview();
      setCards(data.cards || []);
      setAgents(data.agents || []);
      setGames(data.games || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const formatRateText = (value: number) => {
    const formatted = formatRatePct(value);
    return formatted === '--' ? '0' : formatted;
  };

  const renderDetailLines = (details: PerformanceOverviewDetail[]) => {
    if (!details || details.length === 0) return [];
    return details
      .map((detail) => {
        if (!detail.entries || detail.entries.length === 0) return '';
        const entries = detail.entries
          .map(
            (entry) =>
              `子代(${entry.inviteCode}) ￥${entry.amount}×差额${formatRateText(entry.diffRatePct)}%=￥${entry.profit}`
          )
          .join('，');
        return `${detail.gameName || detail.gameId}：${entries}`;
      })
      .filter((line) => line);
  };
  const orderedCards = (() => {
    const order = ['total', 'today', 'yesterday', 'dayBefore'];
    const map = new Map(cards.map((card) => [card.key, card]));
    return order.map((key) => map.get(key)).filter(Boolean) as PerformanceOverviewCard[];
  })();

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="card-bg rounded-[20px] p-2 border border-theme flex items-center">
        {([
          { key: 'overview', label: '业绩概览' },
          { key: 'agent', label: '代理表现' },
          { key: 'game', label: '按游戏维度' }
        ] as const).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === tab.key ? 'bg-[var(--text-primary)] text-[var(--bg-primary)]' : 'text-slate-500'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="card-bg rounded-[24px] p-5 border border-theme">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-1 h-5 bg-accent-gradient rounded-full"></div>
              <h3 className="font-bold text-lg" style={{color: 'var(--text-primary)'}}>业绩概览</h3>
            </div>
            <button
              onClick={load}
              className="text-[11px] text-slate-400 hover:text-white transition"
            >
              刷新
            </button>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-28 card-bg rounded-2xl border border-theme animate-pulse"></div>
              ))}
            </div>
          ) : orderedCards.length === 0 ? (
            <EmptyState title="暂无业绩" />
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {orderedCards.map((card) => {
                const label = card.date ? `${card.label}（${card.date}）` : card.label;
                return (
                  <div key={card.key} className="bg-[var(--bg-primary)] rounded-2xl border border-theme p-4">
                    <p className="text-[11px] text-slate-500 font-bold">{label}</p>
                    <p className="text-xl font-black text-amber-500 mt-2">￥{card.totalAmount}</p>
                    <div className="flex items-center justify-between text-xs text-slate-500 mt-2">
                      <span>订单：{card.orderCount || 0}</span>
                      <button
                        type="button"
                        onClick={() => setDetailCard(card)}
                        className="flex items-center gap-1 text-slate-400 hover:text-white transition"
                      >
                        <span>利润</span>
                        <span className="inline-flex items-center justify-center w-4 h-4 rounded-full border border-slate-500 text-[10px]">
                          i
                        </span>
                      </button>
                    </div>
                    <p className="text-lg font-bold text-emerald-500 mt-1">￥{card.totalProfit}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'agent' && (
        <div className="card-bg rounded-[24px] p-5 border border-theme">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-1 h-5 bg-accent-gradient rounded-full"></div>
              <h3 className="font-bold text-lg" style={{color: 'var(--text-primary)'}}>代理表现</h3>
            </div>
            <button
              onClick={load}
              className="text-[11px] text-slate-400 hover:text-white transition"
            >
              刷新
            </button>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 card-bg rounded-2xl border border-theme animate-pulse"></div>
              ))}
            </div>
          ) : agents.length === 0 ? (
            <div className="text-xs text-slate-500">暂无代理数据</div>
          ) : (
            <div className="space-y-4">
              {agents.map((agent) => (
                <div key={agent.inviteCode} className="bg-[var(--bg-primary)] rounded-2xl border border-theme p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-black text-amber-400">{agent.inviteCode}</div>
                    <span className="text-[10px] text-slate-500">下级：{agent.downlineCount} 个</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    昵称：{agent.nickname}{agent.role ? ` · ${agent.role}` : ''}
                  </div>
                  <div className="text-xs text-slate-500 mt-2 space-y-1">
                    <div>今日 ￥{agent.today.totalAmount} / {agent.today.orderCount} 单 · 利润￥{agent.today.totalProfit}</div>
                    <div>昨日 ￥{agent.yesterday.totalAmount} / {agent.yesterday.orderCount} 单 · 利润￥{agent.yesterday.totalProfit}</div>
                    <div>累计 ￥{agent.total.totalAmount} / {agent.total.orderCount} 单 · 利润￥{agent.total.totalProfit}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'game' && (
        <div className="card-bg rounded-[24px] p-5 border border-theme">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-1 h-5 bg-accent-gradient rounded-full"></div>
              <h3 className="font-bold text-lg" style={{color: 'var(--text-primary)'}}>按游戏维度</h3>
            </div>
            <button
              onClick={load}
              className="text-[11px] text-slate-400 hover:text-white transition"
            >
              刷新
            </button>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-20 card-bg rounded-2xl border border-theme animate-pulse"></div>
              ))}
            </div>
          ) : games.length === 0 ? (
            <div className="text-xs text-slate-500">暂无游戏数据</div>
          ) : (
            <div className="space-y-4">
              {games.map((game) => (
                <div key={game.gameId} className="bg-[var(--bg-primary)] rounded-2xl border border-theme p-4">
                  <div className="text-sm font-bold text-white">{game.gameName || game.gameId}</div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    分成比例：{formatRateText(game.ratePct)}%（{game.rateSource === 'custom' ? '自定义' : '默认'}）
                  </div>
                  <div className="text-xs text-slate-500 mt-2 space-y-1">
                    <div>今日 ￥{game.today.totalAmount} / {game.today.orderCount} 单 · 利润￥{game.today.totalProfit}</div>
                    <div>昨日 ￥{game.yesterday.totalAmount} / {game.yesterday.orderCount} 单 · 利润￥{game.yesterday.totalProfit}</div>
                    <div>累计 ￥{game.total.totalAmount} / {game.total.orderCount} 单 · 利润￥{game.total.totalProfit}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="text-[10px] text-slate-500 mt-4">
            数据来源于充值网关统计表 recharge_daily_stats（约每分钟更新）
          </div>
        </div>
      )}

      {detailCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="card-bg rounded-2xl border border-theme p-5 w-full max-w-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-base font-bold" style={{color: 'var(--text-primary)'}}>分成计算明细</h4>
              <button
                type="button"
                onClick={() => setDetailCard(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-3">按游戏差额分成（未配置视为0）</p>
            <div className="space-y-2 text-sm text-slate-200">
              {renderDetailLines(detailCard.details).length > 0 ? (
                renderDetailLines(detailCard.details).map((line, index) => (
                  <div key={`${detailCard.key}-${index}`} className="leading-relaxed">
                    {line}
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-500">暂无分成明细</div>
              )}
            </div>
            <div className="mt-3 text-sm font-bold text-emerald-400">
              累计预计分成：￥{detailCard.totalProfit}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SettlementCenter = ({ stats, onRefreshStats }: { stats: AgencyStats | null; onRefreshStats: () => Promise<void> }) => {
  const [subTab, setSubTab] = useState<'address' | 'withdraw' | 'record'>('address');
  const [address, setAddress] = useState('');
  const [addressLoading, setAddressLoading] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [addressError, setAddressError] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawRemark, setWithdrawRemark] = useState('');
  const [submittingWithdraw, setSubmittingWithdraw] = useState(false);
  const [withdrawError, setWithdrawError] = useState('');
  const [records, setRecords] = useState<WithdrawItem[]>([]);
  const [recordsTotal, setRecordsTotal] = useState(0);
  const [recordPage, setRecordPage] = useState(1);
  const [recordsLoading, setRecordsLoading] = useState(false);

  const loadAddress = async () => {
    setAddressLoading(true);
    try {
      const data = await api.agency.getPayoutAddress();
      setAddress(data.address || '');
    } catch (err) {
      console.error(err);
    } finally {
      setAddressLoading(false);
    }
  };

  const loadRecords = async (nextPage = 1) => {
    setRecordsLoading(true);
    try {
      const data = await api.agency.getWithdraws({ page: nextPage, pageSize: PAGE_SIZE });
      setRecords(data.list || []);
      setRecordsTotal(data.total || 0);
      setRecordPage(nextPage);
    } catch (err) {
      console.error(err);
    } finally {
      setRecordsLoading(false);
    }
  };

  useEffect(() => {
    loadAddress();
  }, []);

  useEffect(() => {
    if (subTab === 'record') {
      loadRecords(1);
    }
  }, [subTab]);

  const saveAddress = async () => {
    setAddressError('');
    if (!address.trim()) {
      setAddressError('请输入收款地址');
      return;
    }
    setSavingAddress(true);
    try {
      await api.agency.savePayoutAddress(address);
    } catch (err: any) {
      setAddressError(err.message || '保存失败');
    } finally {
      setSavingAddress(false);
    }
  };

  const submitWithdraw = async () => {
    setWithdrawError('');
    if (!withdrawAmount) {
      setWithdrawError('请输入提现金额');
      return;
    }
    setSubmittingWithdraw(true);
    try {
      await api.agency.createWithdraw(withdrawAmount, withdrawRemark);
      setWithdrawAmount('');
      setWithdrawRemark('');
      await onRefreshStats();
      if (subTab === 'record') {
        loadRecords(1);
      }
    } catch (err: any) {
      setWithdrawError(err.message || '提现失败');
    } finally {
      setSubmittingWithdraw(false);
    }
  };

  if (!stats) return <div className="animate-pulse h-40 bg-slate-900 rounded-xl"></div>;

  return (
    <div className="space-y-6 animate-fade-in-up">
       <div className="card-bg rounded-[24px] p-5 shadow-sm border border-theme">
          <div className="flex items-center space-x-2 mb-5">
             <div className="w-1 h-5 bg-accent-gradient rounded-full"></div>
             <h3 className="font-bold text-lg" style={{color: 'var(--text-primary)'}}>结算概览</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div className="bg-[var(--bg-primary)] p-4 rounded-2xl border border-theme">
                <p className="text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-wider">总流水</p>
                <p className="text-lg font-black" style={{color: 'var(--text-primary)'}}>¥ {stats.totalFlow || '0.00'}</p>
             </div>
             <div className="bg-[var(--bg-primary)] p-4 rounded-2xl border border-theme">
                <p className="text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-wider">利润</p>
                <p className="text-lg font-black text-emerald-500">¥ {stats.totalProfit || '0.00'}</p>
             </div>
             <div className="bg-[var(--bg-primary)] p-4 rounded-2xl border border-theme">
                <p className="text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-wider">已提现</p>
                <p className="text-lg font-black" style={{color: 'var(--text-primary)'}}>¥ {stats.withdrawn || '0.00'}</p>
             </div>
             <div className="bg-slate-800 p-4 rounded-2xl border border-theme relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 w-16 h-16 bg-accent-color/20 rounded-full blur-xl"></div>
                <p className="text-[10px] text-amber-500/70 font-bold mb-1 uppercase tracking-wider relative z-10">可提现</p>
                <p className="text-xl font-black text-amber-500 relative z-10">¥ {stats.withdrawable || '0.00'}</p>
             </div>
          </div>
       </div>

       <div className="card-bg rounded-[24px] p-5 shadow-sm border border-theme min-h-[350px]">
          <div className="flex p-1 bg-[var(--bg-primary)] rounded-xl mb-6 border border-theme">
             {[
               { id: 'address', label: '收款地址' },
               { id: 'withdraw', label: '发起提现' },
               { id: 'record', label: '提现记录' }
             ].map(tab => (
               <button 
                 key={tab.id}
                 onClick={() => setSubTab(tab.id as any)}
                 className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all duration-300 ${
                    subTab === tab.id 
                    ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] shadow-md border border-white/5' 
                    : 'text-slate-500 hover:text-[var(--text-primary)]'
                 }`}
               >
                 {tab.label}
               </button>
             ))}
          </div>

          <div className="px-1">
            {subTab === 'address' && (
                <div className="space-y-5">
                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <label className="text-sm font-bold" style={{color: 'var(--text-primary)'}}>钱包地址</label>
                            <span className="text-[10px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded border border-theme font-bold">TRC20-USDT</span>
                        </div>
                        {addressError && (
                          <div className="bg-red-500/10 text-red-500 text-xs px-4 py-2 rounded-xl border border-red-500/20 mb-3">
                            {addressError}
                          </div>
                        )}
                        <input 
                            type="text" 
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            disabled={addressLoading}
                            className="w-full bg-[var(--bg-primary)] border border-theme rounded-xl px-4 py-4 text-sm text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-amber-500/50 transition-all font-mono"
                        />
                        <p className="text-[10px] text-slate-500 mt-2 flex items-center">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            请务必确认地址正确，保存后用于自动结算
                        </p>
                    </div>
                    <button
                      onClick={saveAddress}
                      disabled={savingAddress}
                      className="w-full bg-slate-800 text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-slate-700 transition-all active:scale-[0.98] border border-theme disabled:opacity-60"
                    >
                        {savingAddress ? '保存中...' : '保存设置'}
                    </button>
                </div>
            )}

            {subTab === 'withdraw' && (
                <div className="space-y-6 text-center py-4">
                    <div>
                        <p className="text-xs text-slate-500 mb-1">本次可提现金额</p>
                        <p className="text-4xl font-black tracking-tight" style={{color: 'var(--text-primary)'}}>¥ {stats.withdrawable || '0.00'}</p>
                        <p className="text-[10px] text-slate-500 mt-2">最低提现 ¥ 50</p>
                    </div>
                    {withdrawError && (
                      <div className="bg-red-500/10 text-red-500 text-xs px-4 py-3 rounded-xl border border-red-500/20">
                        {withdrawError}
                      </div>
                    )}
                    <div className="bg-[var(--bg-primary)] rounded-2xl p-4 border border-theme focus-within:border-amber-500/50 transition-all">
                       <input
                        type="number"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        placeholder="输入提现金额"
                        className="w-full text-center bg-transparent text-lg font-bold outline-none placeholder:text-slate-500 text-[var(--text-primary)]"
                      />
                    </div>
                    <input
                      value={withdrawRemark}
                      onChange={(e) => setWithdrawRemark(e.target.value)}
                      placeholder="备注（可选）"
                      className="w-full bg-[var(--bg-primary)] border border-theme rounded-xl px-4 py-3 text-xs text-[var(--text-primary)] outline-none"
                    />
                    <button
                      onClick={submitWithdraw}
                      disabled={submittingWithdraw}
                      className="w-full bg-gradient-to-r from-slate-700 to-slate-800 text-white font-bold py-4 rounded-2xl shadow-lg transition-all active:scale-[0.98] border border-theme hover:text-amber-400 disabled:opacity-60"
                    >
                        {submittingWithdraw ? '提交中...' : '确认提现'}
                    </button>
                </div>
            )}

            {subTab === 'record' && (
                <div className="space-y-4">
                  {recordsLoading ? (
                    <div className="space-y-3">
                      {[1, 2].map((i) => (
                        <div key={i} className="h-16 card-bg rounded-xl border border-theme animate-pulse"></div>
                      ))}
                    </div>
                  ) : records.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-slate-500">
                      <div className="w-20 h-20 bg-[var(--bg-primary)] rounded-full flex items-center justify-center mb-4 border border-theme">
                          <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      </div>
                      <p className="text-sm font-medium">暂无提现记录</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {records.map((record) => (
                        <div key={record.id} className="card-bg rounded-2xl border border-theme p-4 flex items-center justify-between">
                          <div>
                            <div className="text-sm font-bold" style={{color: 'var(--text-primary)'}}>¥ {record.amount}</div>
                            <div className="text-[10px] text-slate-500">{record.createdAt}</div>
                          </div>
                          <span className="text-[10px] text-slate-500">{record.status}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <Pagination page={recordPage} total={recordsTotal} onChange={loadRecords} />
                </div>
            )}
          </div>
       </div>
    </div>
  );
};

const GameSort = () => {
  const [games, setGames] = useState<GameOrderItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadOrder = async () => {
    setLoading(true);
    try {
      const data = await api.agency.getGameOrder();
      setGames((data || []) as GameOrderItem[]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadAllGames = async () => {
    setLoading(true);
    try {
      const data = await gameApi.getList('all', 1, 200);
      const next = data.map((game, index) => ({
        gameId: Number(game.id),
        name: game.title,
        iconUrl: game.icon,
        platform: '安卓',
        sortIndex: index + 1
      }));
      setGames(next);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
  }, []);

  const move = (index: number, delta: number) => {
    const next = [...games];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    const temp = next[index];
    next[index] = next[target];
    next[target] = temp;
    setGames(next);
  };

  const saveOrder = async () => {
    setSaving(true);
    try {
      await Promise.race([
        api.agency.updateGameOrder(games.map((item) => item.gameId)),
        new Promise((_, reject) => setTimeout(() => reject(new Error('保存超时')), 12000))
      ]);
      await loadOrder();
    } catch (err: any) {
      console.error(err);
      window.alert(err?.message || '保存失败');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card-bg rounded-[24px] p-5 shadow-sm border border-theme animate-fade-in-up min-h-[400px]">
       <div className="flex items-center justify-between mb-5">
          <div className="flex items-center space-x-2">
            <div className="w-1 h-5 bg-accent-gradient rounded-full"></div>
            <h3 className="font-bold text-lg" style={{color: 'var(--text-primary)'}}>手游排序</h3>
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={loadOrder} className="text-[10px] text-slate-400 border border-theme rounded-lg px-2 py-1">刷新</button>
            <button onClick={loadAllGames} className="text-[10px] text-amber-500 border border-amber-500/30 rounded-lg px-2 py-1">载入全部</button>
          </div>
       </div>
       {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 card-bg rounded-xl border border-theme animate-pulse"></div>
          ))}
        </div>
       ) : games.length === 0 ? (
        <EmptyState title="暂无排序数据" />
       ) : (
        <div className="space-y-3">
          {games.map((game, idx) => (
            <div key={game.gameId} className="flex items-center bg-[var(--bg-primary)] p-4 rounded-xl border border-theme shadow-sm group hover:border-amber-500/30 transition-colors">
              <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm ${idx === 0 ? 'bg-amber-500 text-black' : 'bg-slate-700 text-slate-400'}`}>{idx + 1}</span>
              <div className="flex-1 ml-3 flex items-center space-x-2">
                {game.iconUrl ? (
                  <img src={game.iconUrl} className="w-6 h-6 rounded" />
                ) : (
                  <span className="text-lg">🎮</span>
                )}
                <span className="text-sm font-bold" style={{color: 'var(--text-primary)'}}>{game.name}</span>
              </div>
              <span className="w-16 text-center text-xs text-slate-500 bg-slate-900/50 py-1 rounded font-bold border border-theme">{game.platform || '安卓'}</span>
              <div className="flex items-center space-x-1 ml-2">
                <button onClick={() => move(idx, -1)} className="text-xs text-slate-500 hover:text-amber-400">上移</button>
                <button onClick={() => move(idx, 1)} className="text-xs text-slate-500 hover:text-amber-400">下移</button>
              </div>
            </div>
          ))}
          <button
            onClick={saveOrder}
            disabled={saving}
            className="w-full bg-slate-800 text-white font-bold py-3 rounded-2xl border border-theme disabled:opacity-60"
          >
            {saving ? '保存中...' : '保存排序'}
          </button>
        </div>
       )}
    </div>
  );
};

const ApprovalList = ({ isSuperAdmin }: { isSuperAdmin: boolean }) => {
  const [status, setStatus] = useState('');
  const [list, setList] = useState<ApprovalItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const load = async (nextPage = 1) => {
    setLoading(true);
    try {
      const data = await api.agency.getApprovals({ status, page: nextPage, pageSize: PAGE_SIZE });
      setList(data.list || []);
      setTotal(data.total || 0);
      setPage(nextPage);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isSuperAdmin) return;
    load(1);
  }, [isSuperAdmin]);

  const handleUpdate = async (id: number, nextStatus: string) => {
    try {
      await api.agency.updateApproval(id, nextStatus);
      load(page);
    } catch (err) {
      console.error(err);
    }
  };

  if (!isSuperAdmin) {
    return <EmptyState title="无权限" />;
  }

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="card-bg rounded-[20px] p-4 border border-theme flex items-center space-x-2">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="flex-1 bg-[var(--bg-primary)] border border-theme rounded-xl px-3 py-2 text-xs text-slate-400"
        >
          <option value="">全部状态</option>
          <option value="pending">待审批</option>
          <option value="approved">已通过</option>
          <option value="rejected">已拒绝</option>
          <option value="paid">已打款</option>
        </select>
        <button onClick={() => load(1)} className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-800 text-white border border-theme">查询</button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 card-bg rounded-2xl border border-theme animate-pulse"></div>
          ))}
        </div>
      ) : list.length === 0 ? (
        <EmptyState title="暂无审批" />
      ) : (
        <div className="space-y-3">
          {list.map((item) => (
            <div key={item.id} className="card-bg rounded-2xl border border-theme p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold" style={{color: 'var(--text-primary)'}}>{item.agentAccount}</div>
                  <div className="text-[10px] text-slate-500 mt-1">邀请码 {item.inviteCode}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-black text-amber-500">¥ {item.amount}</div>
                  <div className="text-[10px] text-slate-500">{item.createdAt}</div>
                </div>
              </div>
              <div className="flex items-center justify-between mt-3">
                <span className="text-[10px] text-slate-400">状态: {item.status}</span>
                <div className="flex items-center space-x-2">
                  {item.status === 'pending' && (
                    <>
                      <button onClick={() => handleUpdate(item.id, 'approved')} className="text-xs text-emerald-500 border border-emerald-500/30 rounded-lg px-2 py-1">通过</button>
                      <button onClick={() => handleUpdate(item.id, 'rejected')} className="text-xs text-red-500 border border-red-500/30 rounded-lg px-2 py-1">拒绝</button>
                    </>
                  )}
                  {item.status === 'approved' && (
                    <button onClick={() => handleUpdate(item.id, 'paid')} className="text-xs text-amber-500 border border-amber-500/30 rounded-lg px-2 py-1">标记已打款</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Pagination page={page} total={total} onChange={load} />
    </div>
  );
};

const EmptyState = ({ title }: { title: string }) => (
   <div className="flex flex-col items-center justify-center py-24 card-bg rounded-[24px] border border-theme shadow-sm animate-fade-in-up">
      <div className="w-24 h-24 bg-[var(--bg-primary)] rounded-full flex items-center justify-center mb-4 border border-theme">
         <span className="text-4xl grayscale opacity-50">🚧</span>
      </div>
      <h3 className="font-bold mb-1" style={{color: 'var(--text-primary)'}}>{title}</h3>
      <p className="text-slate-500 text-sm">该功能模块正在开发中</p>
   </div>
);


const Agency: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabMode>('结算中心');
  const [stats, setStats] = useState<AgencyStats | null>(null);
  const roleOptions = ROLE_OPTIONS[user?.role?.id || user?.roleId || 0] || [];

  // Menu Configuration - Unified Gold/Black Theme
  const menuItems: { id: TabMode; icon: string }[] = [
    { id: '代理管理', icon: '👥' },
    { id: '玩家列表', icon: '🎮' },
    { id: '订单查询', icon: '🧾' },
    { id: '业绩详情', icon: '📈' },
    { id: '结算中心', icon: '💰' },
    { id: '手游排序', icon: '🔝' }
  ];

  const loadStats = async () => {
    try {
      const data = await api.agency.getStats();
      setStats(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  return (
    <div className="flex flex-col min-h-full app-bg pb-24 transition-colors duration-500">
       {/* Content Padding */}
       <div className="px-5 pt-6">
          <UserInfoCard stats={stats} userId={user?.ID} />
          
          {/* Dashboard Grid Menu - Premium Black/Gold Style */}
          <div className="card-bg rounded-[24px] p-6 shadow-sm border border-theme mb-6">
              <div className="grid grid-cols-4 gap-y-6 gap-x-2">
                  {menuItems.map((item) => (
                      <button 
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`flex flex-col items-center group transition-all duration-300 relative`}
                      >
                          {/* Icon Container */}
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl mb-2 transition-all duration-300 shadow-sm border ${
                              activeTab === item.id 
                              ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] border-transparent scale-110 shadow-lg' 
                              : 'bg-[var(--bg-primary)] text-slate-500 border-theme group-hover:border-accent/30 group-hover:text-accent'
                          }`}>
                              {item.icon}
                          </div>
                          
                          <span className={`text-[11px] font-bold tracking-wide transition-colors ${
                              activeTab === item.id ? 'text-[var(--text-primary)]' : 'text-slate-500'
                          }`}>
                              {item.id}
                          </span>
                          
                          {/* Active Indicator Dot */}
                          {activeTab === item.id && (
                              <div className="absolute -bottom-2 w-1 h-1 bg-accent rounded-full shadow-[0_0_5px_rgba(245,158,11,0.8)]"></div>
                          )}
                      </button>
                  ))}
              </div>
          </div>

          {/* Main Content Render */}
          <div className="min-h-[300px]">
            {activeTab === '代理管理' && (
             <AgentManagement roleOptions={roleOptions} />
            )}
             {activeTab === '玩家列表' && <PlayerList />}
             {activeTab === '订单查询' && <OrderQuery />}
             {activeTab === '业绩详情' && <PerformanceDetail />}
             {activeTab === '结算中心' && <SettlementCenter stats={stats} onRefreshStats={loadStats} />}
             {activeTab === '手游排序' && <GameSort />}
          </div>
       </div>
    </div>
  );
};

export const SuperAdminPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<AgencyStats | null>(null);
  const isSuperAdmin = Number(user?.role?.id ?? user?.roleId) === ROLE_SUPER_ADMIN;

  const loadStats = async () => {
    try {
      const data = await api.agency.getStats();
      setStats(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  return (
    <div className="flex flex-col min-h-full app-bg pb-24 transition-colors duration-500">
      <div className="px-5 pt-6">
        <UserInfoCard stats={stats} userId={user?.ID} showRegisterCount={false} showCreatable={false} title="超管中心" />
        <SuperAdminCenter isSuperAdmin={isSuperAdmin} />
      </div>
    </div>
  );
};

export default Agency;

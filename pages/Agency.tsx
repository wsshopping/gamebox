import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

// --- Types ---
type ViewMode = 'dashboard' | 'create_agent' | 'agent_list' | 'boss_manage' | 'player_list' | 'finance' | 'game_sort';

// Mock Data for Sort (Frontend UI State)
const MOCK_GAMES = [
  { id: '1', name: '天龙八部怀旧(三端)', platform: '安卓', icon: '🐲' },
  { id: '2', name: '灵画师', platform: '安卓', icon: '🎨' },
  { id: '3', name: '已下架 (#2)', platform: '已下架', icon: '🚫' },
  { id: '4', name: '道友来挖宝', platform: '安卓', icon: '💎' },
];

// --- Extracted Components ---

const DashboardHeader = ({ stats }: { stats: any }) => {
  if (!stats) return <div className="h-48 bg-slate-800 rounded-[32px] animate-pulse mb-6"></div>;

  return (
    <div className="relative overflow-hidden bg-[#0f172a] rounded-[32px] p-6 text-white shadow-xl shadow-slate-200 mb-6 transition-all">
       {/* Background Effects */}
       <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-[60px] -mr-10 -mt-10 pointer-events-none"></div>
       <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-500/10 rounded-full blur-[50px] -ml-5 -mb-5 pointer-events-none"></div>
       
       <div className="relative z-10">
          <div className="flex justify-between items-start mb-6">
             <div>
                <div className="flex items-center space-x-2 mb-2">
                   <span className="bg-white/10 border border-white/10 text-slate-200 text-[10px] font-bold px-2.5 py-1 rounded-lg backdrop-blur-sm">
                      {stats.role}
                   </span>
                   <span className="text-amber-500 text-[10px] font-bold flex items-center">
                      <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mr-1.5"></span>
                      {stats.level}
                   </span>
                </div>
                <h2 className="text-3xl font-black tracking-tighter font-mono">{stats.code}</h2>
                <p className="text-slate-400 text-[10px] font-bold mt-1 uppercase tracking-widest">我的邀请码</p>
             </div>
             <button className="w-10 h-10 rounded-2xl bg-white/5 backdrop-blur-md flex items-center justify-center border border-white/10 hover:bg-white/10 transition-colors active:scale-95">
                <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>
             </button>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-5">
             <div>
                <p className="text-slate-500 text-[10px] uppercase tracking-wider font-bold mb-1">累计注册</p>
                <p className="text-xl font-bold text-white">{stats.totalUsers} <span className="text-xs text-slate-500 font-normal">人</span></p>
             </div>
             <div>
                <p className="text-slate-500 text-[10px] uppercase tracking-wider font-bold mb-1">本月收益</p>
                <div className="flex items-baseline">
                   <span className="text-xs text-amber-500 font-bold mr-1">¥</span>
                   <p className="text-xl font-bold text-amber-400">{stats.balance}</p>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc, colorClass, onClick }: { icon: string, title: string, desc: string, colorClass: string, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className="bg-white p-4 rounded-[24px] border border-slate-50 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col items-start text-left hover:shadow-[0_10px_30px_rgba(0,0,0,0.05)] hover:border-slate-100 transition-all active:scale-[0.98] group"
  >
    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl mb-3 ${colorClass} group-hover:scale-110 transition-transform`}>
      {icon}
    </div>
    <h3 className="font-bold text-slate-900 text-sm mb-0.5">{title}</h3>
    <p className="text-[10px] text-slate-400 font-medium">{desc}</p>
  </button>
);

const SubPageHeader = ({ title, onBack }: { title: string, onBack: () => void }) => (
  <div className="flex items-center space-x-3 mb-6">
     <button 
       onClick={onBack}
       className="w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
     >
       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
     </button>
     <h2 className="text-xl font-black text-slate-900">{title}</h2>
  </div>
);

const CreateAgent = ({ onBack }: { onBack: () => void }) => (
  <div className="animate-fade-in-up">
     <SubPageHeader title="创建下级代理" onBack={onBack} />
     <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100 space-y-4">
         <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 ml-1">手机号</label>
            <input type="tel" className="w-full bg-slate-50 rounded-xl px-4 py-3 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 transition-all" placeholder="请输入11位手机号" />
         </div>
         <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 ml-1">初始密码</label>
            <input type="password" className="w-full bg-slate-50 rounded-xl px-4 py-3 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 transition-all" placeholder="设置密码" />
         </div>
         <button className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl shadow-lg shadow-slate-200 mt-4 active:scale-95 transition-all">
           立即创建
         </button>
     </div>
  </div>
);

const AgentList = ({ onBack }: { onBack: () => void }) => {
  const [agents, setAgents] = useState<any[]>([]);
  useEffect(() => { api.agency.getAgents().then(setAgents) }, []);

  return (
    <div className="animate-fade-in-up">
       <SubPageHeader title="全部代理" onBack={onBack} />
       <div className="space-y-3">
          {agents.map((agent: any) => (
             <div key={agent.id} className="bg-white rounded-[24px] p-5 shadow-sm border border-slate-50 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                   <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">🧑‍💼</div>
                   <div>
                      <p className="font-bold text-sm text-slate-900">{agent.account}</p>
                      <span className="text-[10px] text-indigo-500 bg-indigo-50 px-1.5 rounded font-bold">{agent.role}</span>
                   </div>
                </div>
                <span className="text-xs font-bold text-emerald-500">{agent.status}</span>
             </div>
          ))}
       </div>
    </div>
  );
}

const BossManage = ({ onBack }: { onBack: () => void }) => {
  const [bosses, setBosses] = useState<any[]>([]);
  useEffect(() => { api.agency.getBosses().then(setBosses) }, []);

  return (
    <div className="animate-fade-in-up">
       <SubPageHeader title="老板管理" onBack={onBack} />
       {bosses.map((boss: any) => (
          <div key={boss.id} className="bg-white rounded-[24px] p-4 mb-3 border border-slate-50 shadow-sm flex justify-between items-center">
             <div>
                <p className="font-bold text-sm text-slate-900">{boss.account}</p>
                <p className="text-[10px] text-slate-400 mt-1">{boss.game}</p>
             </div>
             <button className="text-xs font-bold text-slate-900 border border-slate-200 px-3 py-1.5 rounded-lg">编辑</button>
          </div>
       ))}
    </div>
  );
}

const PlayerList = ({ onBack }: { onBack: () => void }) => {
  const [players, setPlayers] = useState<any[]>([]);
  useEffect(() => { api.agency.getPlayers().then(setPlayers) }, []);

  return (
    <div className="animate-fade-in-up">
       <SubPageHeader title="玩家列表" onBack={onBack} />
       {players.map((p: any) => (
          <div key={p.id} className="bg-white rounded-[24px] p-4 mb-3 border border-slate-50 shadow-sm flex justify-between items-center">
             <div>
                <p className="font-bold text-sm text-slate-900">{p.account}</p>
                <p className="text-[10px] text-slate-400 mt-1">充值: {p.recharge}</p>
             </div>
          </div>
       ))}
    </div>
  );
}

const Finance = ({ onBack }: { onBack: () => void }) => (
  <div className="animate-fade-in-up">
     <SubPageHeader title="结算中心" onBack={onBack} />
     <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-[32px] p-6 text-white shadow-lg shadow-emerald-200 mb-6">
        <p className="text-xs opacity-80 font-bold mb-1">可提现余额</p>
        <h2 className="text-3xl font-black">¥ 81.20</h2>
        <button className="mt-6 w-full bg-white/20 backdrop-blur-md py-3 rounded-xl text-sm font-bold border border-white/20">立即提现</button>
     </div>
  </div>
);

const GameSort = ({ onBack }: { onBack: () => void }) => (
  <div className="animate-fade-in-up">
     <SubPageHeader title="手游排序" onBack={onBack} />
     <div className="bg-white rounded-[24px] p-4 shadow-sm border border-slate-50 space-y-2">
        {MOCK_GAMES.map((game, idx) => (
           <div key={game.id} className="flex items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="font-black text-slate-300 mr-3 text-lg">{idx + 1}</span>
              <span className="text-sm font-bold text-slate-700 flex-1">{game.name}</span>
              <span className="text-xs text-slate-400">☰</span>
           </div>
        ))}
     </div>
  </div>
);


const Agency: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch Stats on mount
  useEffect(() => {
    const loadStats = async () => {
      const data = await api.agency.getStats();
      setStats(data);
    };
    loadStats();
  }, []);

  return (
    <div className="px-4 pb-24 pt-2 min-h-full bg-[#f8fafc]">
       {viewMode === 'dashboard' ? (
         <div className="animate-fade-in-up">
            <DashboardHeader stats={stats} />
            
            <div className="mb-4 flex items-center justify-between px-2">
               <h3 className="font-bold text-slate-900 text-sm">功能管理</h3>
               <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-1 rounded-full">Dashboard</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
               <FeatureCard 
                 icon="👥" 
                 title="创建代理" 
                 desc="添加下级总推/代理" 
                 colorClass="bg-indigo-50 text-indigo-600"
                 onClick={() => setViewMode('create_agent')} 
               />
               <FeatureCard 
                 icon="📋" 
                 title="代理列表" 
                 desc="查看所有下级数据" 
                 colorClass="bg-blue-50 text-blue-600"
                 onClick={() => setViewMode('agent_list')} 
               />
               <FeatureCard 
                 icon="👔" 
                 title="老板管理" 
                 desc="老板账号与权限" 
                 colorClass="bg-slate-100 text-slate-600"
                 onClick={() => setViewMode('boss_manage')} 
               />
               <FeatureCard 
                 icon="🎮" 
                 title="玩家列表" 
                 desc="注册玩家与流水" 
                 colorClass="bg-orange-50 text-orange-600"
                 onClick={() => setViewMode('player_list')} 
               />
               <FeatureCard 
                 icon="💰" 
                 title="结算中心" 
                 desc="提现与资金记录" 
                 colorClass="bg-emerald-50 text-emerald-600"
                 onClick={() => setViewMode('finance')} 
               />
               <FeatureCard 
                 icon="🔃" 
                 title="手游排序" 
                 desc="自定义游戏展示" 
                 colorClass="bg-purple-50 text-purple-600"
                 onClick={() => setViewMode('game_sort')} 
               />
            </div>
         </div>
       ) : (
         // Render Sub-pages based on state
         <div className="min-h-[500px]">
            {viewMode === 'create_agent' && <CreateAgent onBack={() => setViewMode('dashboard')} />}
            {viewMode === 'agent_list' && <AgentList onBack={() => setViewMode('dashboard')} />}
            {viewMode === 'boss_manage' && <BossManage onBack={() => setViewMode('dashboard')} />}
            {viewMode === 'player_list' && <PlayerList onBack={() => setViewMode('dashboard')} />}
            {viewMode === 'finance' && <Finance onBack={() => setViewMode('dashboard')} />}
            {viewMode === 'game_sort' && <GameSort onBack={() => setViewMode('dashboard')} />}
         </div>
       )}
    </div>
  );
};

export default Agency;
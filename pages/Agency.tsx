
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

// --- Types ---
type TabMode = '代理管理' | '全部代理' | '老板管理' | '玩家列表' | '业绩详情' | '结算中心' | '手游排序' | '审批列表';

// --- Components ---

const UserInfoCard = ({ stats }: { stats: any }) => {
  if (!stats) return <div className="h-32 bg-slate-900 rounded-[24px] animate-pulse mb-6 border border-white/5"></div>;

  return (
    // Black Card with Gold Details
    <div className="bg-[#0f172a] rounded-[24px] p-6 shadow-[0_15px_40px_-10px_rgba(0,0,0,0.5)] border border-white/10 mb-6 relative overflow-hidden group">
       {/* Background Decoration */}
       <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-amber-500/20"></div>
       <div className="absolute bottom-0 left-0 w-32 h-32 bg-slate-700/20 rounded-full blur-3xl -ml-10 -mb-10"></div>
       <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay"></div>
       
       <div className="relative z-10 text-white">
           <div className="flex justify-between items-start mb-6">
              <div className="flex items-center space-x-4">
                 <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-700 flex items-center justify-center text-slate-900 text-2xl shadow-[0_0_15px_rgba(251,191,36,0.4)] border border-amber-200/50">
                    👑
                 </div>
                 <div>
                    <h2 className="text-xl font-black text-white leading-tight">代理中心</h2>
                    <div className="flex items-center mt-1.5">
                        <span className="text-[10px] font-bold bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded border border-amber-500/30 mr-2 uppercase tracking-wider">
                           {stats.role}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">ID: 8848</span>
                    </div>
                 </div>
              </div>
              <div className="text-right">
                  <p className="text-[10px] text-slate-400 mb-1 font-bold uppercase tracking-widest">Invite Code</p>
                  <div className="flex items-center space-x-2 justify-end cursor-pointer active:opacity-70 group/code">
                      <span className="text-xl font-black text-amber-400 tracking-wider group-hover/code:text-amber-300 transition-colors">{stats.code}</span>
                      <svg className="w-4 h-4 text-slate-500 group-hover/code:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>
                  </div>
              </div>
           </div>

           <div className="flex items-center justify-between bg-white/5 rounded-2xl p-4 border border-white/10 backdrop-blur-sm">
              <div className="flex items-center space-x-3">
                 <span className="text-xs text-slate-400">当前可创建</span>
                 <span className="text-base font-bold text-white">{stats.creatable}</span>
              </div>
              <div className="w-px h-4 bg-white/10"></div>
              <div className="flex items-center space-x-3">
                 <span className="text-xs text-slate-400">总注册数</span>
                 <span className="text-base font-bold text-white">{stats.registerCount}</span>
              </div>
           </div>
       </div>
    </div>
  );
};

// --- Functional Components ---

const CreateAgent = () => (
  <div className="bg-[#0f172a] rounded-[24px] p-6 shadow-sm border border-white/5 space-y-5 animate-fade-in-up">
     <div className="flex items-center space-x-2 mb-2">
        <div className="w-1 h-5 bg-amber-500 rounded-full"></div>
        <h3 className="font-bold text-white text-lg">创建下级代理</h3>
     </div>
     
     <div className="space-y-4">
        <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 ml-1">手机号</label>
            <input type="tel" className="w-full bg-[#020617] border border-white/10 rounded-xl px-4 py-3.5 text-sm outline-none text-white focus:ring-2 focus:ring-amber-500/50 transition-all font-medium placeholder:text-slate-600" placeholder="请输入11位手机号" />
        </div>
        <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 ml-1">初始密码</label>
            <input type="password" className="w-full bg-[#020617] border border-white/10 rounded-xl px-4 py-3.5 text-sm outline-none text-white focus:ring-2 focus:ring-amber-500/50 transition-all font-medium placeholder:text-slate-600" placeholder="设置登录密码" />
        </div>
     </div>

     <button className="w-full bg-gradient-to-r from-slate-800 to-slate-900 text-amber-400 font-bold py-4 rounded-2xl shadow-lg shadow-black mt-6 active:scale-[0.98] transition-all hover:bg-slate-800 border border-white/10 hover:border-amber-500/30">
       立即创建
     </button>
  </div>
);

const SettlementCenter = ({ stats }: { stats: any }) => {
  const [subTab, setSubTab] = useState<'address' | 'withdraw' | 'record'>('address');
  const [address, setAddress] = useState('aabbxddfff');

  if (!stats) return <div className="animate-pulse h-40 bg-slate-900 rounded-xl"></div>;

  return (
    <div className="space-y-6 animate-fade-in-up">
       {/* 概览卡片 */}
       <div className="bg-[#0f172a] rounded-[24px] p-5 shadow-sm border border-white/5">
          <div className="flex items-center space-x-2 mb-5">
             <div className="w-1 h-5 bg-amber-500 rounded-full"></div>
             <h3 className="font-bold text-white text-lg">结算概览</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div className="bg-[#020617] p-4 rounded-2xl border border-white/5">
                <p className="text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-wider">Total Flow</p>
                <p className="text-lg font-black text-white">¥ {stats.totalFlow}</p>
             </div>
             <div className="bg-[#020617] p-4 rounded-2xl border border-white/5">
                <p className="text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-wider">Profit</p>
                <p className="text-lg font-black text-emerald-500">¥ {stats.totalProfit}</p>
             </div>
             <div className="bg-[#020617] p-4 rounded-2xl border border-white/5">
                <p className="text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-wider">Withdrawn</p>
                <p className="text-lg font-black text-white">¥ {stats.withdrawn}</p>
             </div>
             {/* Highlight Card */}
             <div className="bg-slate-800 p-4 rounded-2xl border border-white/10 relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 w-16 h-16 bg-amber-500/20 rounded-full blur-xl"></div>
                <p className="text-[10px] text-amber-500/70 font-bold mb-1 uppercase tracking-wider relative z-10">Balance</p>
                <p className="text-xl font-black text-amber-400 relative z-10">¥ {stats.withdrawable}</p>
             </div>
          </div>
       </div>

       {/* 操作区域 */}
       <div className="bg-[#0f172a] rounded-[24px] p-5 shadow-sm border border-white/5 min-h-[350px]">
          {/* Tabs */}
          <div className="flex p-1 bg-[#020617] rounded-xl mb-6 border border-white/5">
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
                    ? 'bg-slate-800 text-white shadow-md border border-white/5' 
                    : 'text-slate-500 hover:text-slate-300'
                 }`}
               >
                 {tab.label}
               </button>
             ))}
          </div>

          {/* Sub Content */}
          <div className="px-1">
            {subTab === 'address' && (
                <div className="space-y-5">
                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <label className="text-sm font-bold text-white">钱包地址</label>
                            <span className="text-[10px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded border border-amber-500/20 font-bold">TRC20-USDT</span>
                        </div>
                        <input 
                            type="text" 
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="w-full bg-[#020617] border border-white/10 rounded-xl px-4 py-4 text-sm text-slate-200 outline-none focus:ring-2 focus:ring-amber-500/50 transition-all font-mono"
                        />
                        <p className="text-[10px] text-slate-500 mt-2 flex items-center">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            请务必确认地址正确，保存后用于自动结算
                        </p>
                    </div>
                    <button className="w-full bg-slate-800 text-white font-bold py-4 rounded-2xl shadow-lg shadow-black hover:bg-slate-700 transition-all active:scale-[0.98] border border-white/10">
                        保存设置
                    </button>
                </div>
            )}

            {subTab === 'withdraw' && (
                <div className="space-y-6 text-center py-4">
                    <div>
                        <p className="text-xs text-slate-500 mb-1">本次可提现金额</p>
                        <p className="text-4xl font-black text-white tracking-tight">¥ {stats.withdrawable}</p>
                    </div>
                    <div className="bg-[#020617] rounded-2xl p-4 border border-white/10 focus-within:border-amber-500/50 transition-all">
                       <input type="number" placeholder="输入提现金额" className="w-full text-center bg-transparent text-lg font-bold outline-none placeholder:text-slate-600 text-white"/>
                    </div>
                    <button className="w-full bg-gradient-to-r from-slate-800 to-slate-900 text-amber-400 font-bold py-4 rounded-2xl shadow-lg shadow-black hover:shadow-amber-500/10 transition-all active:scale-[0.98] border border-white/10">
                        确认提现
                    </button>
                </div>
            )}

            {subTab === 'record' && (
                <div className="flex flex-col items-center justify-center py-16 text-slate-500">
                    <div className="w-20 h-20 bg-[#020617] rounded-full flex items-center justify-center mb-4 border border-white/5">
                        <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    </div>
                    <p className="text-sm font-medium">暂无提现记录</p>
                </div>
            )}
          </div>
       </div>
    </div>
  );
};

const GameSort = () => (
  <div className="bg-[#0f172a] rounded-[24px] p-5 shadow-sm border border-white/5 animate-fade-in-up min-h-[400px]">
     <div className="flex items-center space-x-2 mb-5">
        <div className="w-1 h-5 bg-amber-500 rounded-full"></div>
        <h3 className="font-bold text-white text-lg">手游排序</h3>
     </div>
     <div className="space-y-3">
         <div className="bg-[#020617] p-3 rounded-lg border border-white/5 flex items-center justify-between text-[10px] text-slate-500 font-bold uppercase tracking-wider">
             <span className="w-8 text-center">排名</span>
             <span className="flex-1 ml-3">游戏名称</span>
             <span className="w-16 text-center">状态</span>
             <span className="w-8 text-center">操作</span>
         </div>
         {[{id: '1', name: '天龙八部怀旧(三端)', platform: '安卓', icon: '🐲'}, {id: '2', name: '灵画师', platform: '安卓', icon: '🎨'}, {id: '3', name: '道友来挖宝', platform: '安卓', icon: '💎'}].map((game, idx) => (
            <div key={game.id} className="flex items-center bg-[#0f172a] p-4 rounded-xl border border-white/5 shadow-sm group hover:border-amber-500/30 transition-colors">
            <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm ${idx === 0 ? 'bg-amber-500 text-black' : 'bg-slate-800 text-slate-400'}`}>{idx + 1}</span>
            <div className="flex-1 ml-3 flex items-center">
                <span className="text-lg mr-2">{game.icon}</span>
                <span className="text-sm font-bold text-slate-300">{game.name}</span>
            </div>
            <span className="w-16 text-center text-xs text-slate-500 bg-[#020617] py-1 rounded font-bold border border-white/5">{game.platform}</span>
            <span className="w-8 flex justify-center text-slate-600 cursor-move hover:text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </span>
            </div>
        ))}
     </div>
  </div>
);

const EmptyState = ({ title }: { title: string }) => (
   <div className="flex flex-col items-center justify-center py-24 bg-[#0f172a] rounded-[24px] border border-white/5 shadow-sm animate-fade-in-up">
      <div className="w-24 h-24 bg-[#020617] rounded-full flex items-center justify-center mb-4 border border-white/5">
         <span className="text-4xl grayscale opacity-50">🚧</span>
      </div>
      <h3 className="text-white font-bold mb-1">{title}</h3>
      <p className="text-slate-500 text-sm">该功能模块正在开发中</p>
   </div>
);


const Agency: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabMode>('结算中心');
  const [stats, setStats] = useState<any>(null);

  // Menu Configuration - Unified Gold/Black Theme
  const menuItems: { id: TabMode; icon: string }[] = [
    { id: '代理管理', icon: '👥' },
    { id: '全部代理', icon: '📋' },
    { id: '老板管理', icon: '👔' },
    { id: '玩家列表', icon: '🎮' },
    { id: '业绩详情', icon: '📈' },
    { id: '结算中心', icon: '💰' },
    { id: '手游排序', icon: '🔝' },
    { id: '审批列表', icon: '📝' },
  ];

  useEffect(() => {
    const loadStats = async () => {
      const data = await api.agency.getStats();
      setStats(data);
    };
    loadStats();
  }, []);

  return (
    <div className="flex flex-col min-h-full bg-[#020617] pb-24">
       {/* Content Padding */}
       <div className="px-5 pt-6">
          <UserInfoCard stats={stats} />
          
          {/* Dashboard Grid Menu - Premium Black/Gold Style */}
          <div className="bg-[#0f172a] rounded-[24px] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.2)] border border-white/5 mb-6">
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
                              ? 'bg-slate-800 text-amber-400 border-amber-500/30 scale-110 shadow-lg shadow-black' 
                              : 'bg-[#020617] text-slate-500 border-white/5 group-hover:border-amber-500/30 group-hover:text-amber-500'
                          }`}>
                              {item.icon}
                          </div>
                          
                          <span className={`text-[11px] font-bold tracking-wide transition-colors ${
                              activeTab === item.id ? 'text-white' : 'text-slate-500'
                          }`}>
                              {item.id}
                          </span>
                          
                          {/* Active Indicator Dot */}
                          {activeTab === item.id && (
                              <div className="absolute -bottom-2 w-1 h-1 bg-amber-500 rounded-full shadow-[0_0_5px_rgba(245,158,11,0.8)]"></div>
                          )}
                      </button>
                  ))}
              </div>
          </div>

          {/* Main Content Render */}
          <div className="min-h-[300px]">
             {activeTab === '代理管理' && <CreateAgent />}
             {activeTab === '全部代理' && <EmptyState title="全部代理" />}
             {activeTab === '结算中心' && <SettlementCenter stats={stats} />}
             {activeTab === '手游排序' && <GameSort />}
             
             {/* Simple placeholders for others to avoid complex mock data logic for now */}
             {['老板管理', '玩家列表', '业绩详情', '审批列表'].includes(activeTab) && (
                <EmptyState title={activeTab} />
             )}
          </div>
       </div>
    </div>
  );
};

export default Agency;

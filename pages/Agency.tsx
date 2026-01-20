
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

// --- Types ---
type TabMode = '代理管理' | '全部代理' | '老板管理' | '玩家列表' | '业绩详情' | '结算中心' | '手游排序' | '审批列表';

// --- Components ---

const UserInfoCard = ({ stats }: { stats: any }) => {
  if (!stats) return <div className="h-32 bg-white rounded-[24px] animate-pulse mb-6 shadow-sm"></div>;

  return (
    <div className="bg-white rounded-[24px] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-slate-100 mb-6 relative overflow-hidden group">
       {/* Background Decoration */}
       <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-orange-100/50"></div>
       
       <div className="relative z-10">
           <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-3">
                 <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white text-xl shadow-lg shadow-orange-200">
                    👑
                 </div>
                 <div>
                    <h2 className="text-lg font-black text-slate-900 leading-tight">代理中心</h2>
                    <div className="flex items-center mt-1">
                        <span className="text-[10px] font-bold bg-orange-50 text-orange-600 px-2 py-0.5 rounded-md border border-orange-100 mr-2">
                           {stats.role}
                        </span>
                        <span className="text-[10px] text-slate-400">ID: 8848</span>
                    </div>
                 </div>
              </div>
              <div className="text-right">
                  <p className="text-[10px] text-slate-400 mb-0.5">我的邀请码</p>
                  <div className="flex items-center space-x-1 justify-end cursor-pointer active:opacity-70">
                      <span className="text-lg font-black text-slate-900 tracking-wider">{stats.code}</span>
                      <svg className="w-3.5 h-3.5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>
                  </div>
              </div>
           </div>

           <div className="flex items-center justify-between bg-slate-50 rounded-xl p-3 border border-slate-100">
              <div className="flex items-center space-x-2">
                 <span className="text-xs text-slate-500">当前可创建:</span>
                 <span className="text-sm font-bold text-slate-900">{stats.creatable}</span>
              </div>
              <div className="w-px h-4 bg-slate-200"></div>
              <div className="flex items-center space-x-2">
                 <span className="text-xs text-slate-500">总注册数:</span>
                 <span className="text-sm font-bold text-slate-900">{stats.registerCount}</span>
              </div>
           </div>
       </div>
    </div>
  );
};

// --- Functional Components ---

const CreateAgent = () => (
  <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100 space-y-5 animate-fade-in-up">
     <div className="flex items-center space-x-2 mb-2">
        <div className="w-1 h-4 bg-orange-500 rounded-full"></div>
        <h3 className="font-bold text-gray-900 text-lg">创建下级代理</h3>
     </div>
     
     <div className="space-y-4">
        <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 ml-1">手机号</label>
            <input type="tel" className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3.5 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-orange-100 focus:border-orange-500 transition-all font-medium" placeholder="请输入11位手机号" />
        </div>
        <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 ml-1">初始密码</label>
            <input type="password" className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3.5 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-orange-100 focus:border-orange-500 transition-all font-medium" placeholder="设置登录密码" />
        </div>
     </div>

     <button className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-orange-200 mt-6 active:scale-[0.98] transition-all hover:shadow-xl">
       立即创建
     </button>
  </div>
);

const SettlementCenter = ({ stats }: { stats: any }) => {
  const [subTab, setSubTab] = useState<'address' | 'withdraw' | 'record'>('address');
  const [address, setAddress] = useState('aabbxddfff');

  if (!stats) return <div className="animate-pulse h-40 bg-white rounded-xl"></div>;

  return (
    <div className="space-y-6 animate-fade-in-up">
       {/* 概览卡片 */}
       <div className="bg-white rounded-[24px] p-5 shadow-sm border border-slate-100">
          <div className="flex items-center space-x-2 mb-5">
             <div className="w-1 h-4 bg-orange-500 rounded-full"></div>
             <h3 className="font-bold text-slate-900 text-lg">结算概览</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div className="bg-orange-50/50 p-4 rounded-2xl border border-orange-100/50">
                <p className="text-[10px] text-orange-600/70 font-bold mb-1">总流水</p>
                <p className="text-lg font-black text-slate-900">¥ {stats.totalFlow}</p>
             </div>
             <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100/50">
                <p className="text-[10px] text-emerald-600/70 font-bold mb-1">累计利润</p>
                <p className="text-lg font-black text-slate-900">¥ {stats.totalProfit}</p>
             </div>
             <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50">
                <p className="text-[10px] text-blue-600/70 font-bold mb-1">已提现</p>
                <p className="text-lg font-black text-slate-900">¥ {stats.withdrawn}</p>
             </div>
             <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100/50 relative overflow-hidden">
                <div className="absolute -right-2 -top-2 text-4xl opacity-10">💰</div>
                <p className="text-[10px] text-indigo-600/70 font-bold mb-1">可提现</p>
                <p className="text-xl font-black text-indigo-600">¥ {stats.withdrawable}</p>
             </div>
          </div>
       </div>

       {/* 操作区域 */}
       <div className="bg-white rounded-[24px] p-5 shadow-sm border border-slate-100 min-h-[350px]">
          {/* Tabs */}
          <div className="flex p-1 bg-slate-50 rounded-xl mb-6">
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
                    ? 'bg-white text-slate-900 shadow-sm ring-1 ring-black/5' 
                    : 'text-slate-400 hover:text-slate-600'
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
                            <label className="text-sm font-bold text-slate-900">钱包地址</label>
                            <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded">TRC20-USDT</span>
                        </div>
                        <input 
                            type="text" 
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-4 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-500 transition-all font-mono"
                        />
                        <p className="text-[10px] text-slate-400 mt-2 flex items-center">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            请务必确认地址正确，保存后用于自动结算
                        </p>
                    </div>
                    <button className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all active:scale-[0.98]">
                        保存设置
                    </button>
                </div>
            )}

            {subTab === 'withdraw' && (
                <div className="space-y-6 text-center py-4">
                    <div>
                        <p className="text-xs text-slate-400 mb-1">本次可提现金额</p>
                        <p className="text-4xl font-black text-slate-900 tracking-tight">¥ {stats.withdrawable}</p>
                    </div>
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                       <input type="number" placeholder="输入提现金额" className="w-full text-center bg-transparent text-lg font-bold outline-none placeholder:text-slate-300 text-slate-900"/>
                    </div>
                    <button className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-orange-200 hover:shadow-xl transition-all active:scale-[0.98]">
                        确认提现
                    </button>
                </div>
            )}

            {subTab === 'record' && (
                <div className="flex flex-col items-center justify-center py-16 text-slate-300">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
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
  <div className="bg-white rounded-[24px] p-5 shadow-sm border border-slate-100 animate-fade-in-up min-h-[400px]">
     <div className="flex items-center space-x-2 mb-5">
        <div className="w-1 h-4 bg-orange-500 rounded-full"></div>
        <h3 className="font-bold text-slate-900 text-lg">手游排序</h3>
     </div>
     <div className="space-y-3">
         <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
             <span className="w-8 text-center">排名</span>
             <span className="flex-1 ml-3">游戏名称</span>
             <span className="w-16 text-center">状态</span>
             <span className="w-8 text-center">操作</span>
         </div>
         {[{id: '1', name: '天龙八部怀旧(三端)', platform: '安卓', icon: '🐲'}, {id: '2', name: '灵画师', platform: '安卓', icon: '🎨'}, {id: '3', name: '道友来挖宝', platform: '安卓', icon: '💎'}].map((game, idx) => (
            <div key={game.id} className="flex items-center bg-white p-4 rounded-xl border border-slate-100 shadow-sm group hover:border-orange-200 transition-colors">
            <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm ${idx === 0 ? 'bg-yellow-100 text-yellow-600' : 'bg-slate-100 text-slate-500'}`}>{idx + 1}</span>
            <div className="flex-1 ml-3 flex items-center">
                <span className="text-lg mr-2">{game.icon}</span>
                <span className="text-sm font-bold text-slate-700">{game.name}</span>
            </div>
            <span className="w-16 text-center text-xs text-emerald-600 bg-emerald-50 py-1 rounded font-bold">{game.platform}</span>
            <span className="w-8 flex justify-center text-slate-300 cursor-move hover:text-slate-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </span>
            </div>
        ))}
     </div>
  </div>
);

const EmptyState = ({ title }: { title: string }) => (
   <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[24px] border border-slate-100 shadow-sm animate-fade-in-up">
      <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-4">
         <span className="text-4xl grayscale opacity-50">🚧</span>
      </div>
      <h3 className="text-slate-900 font-bold mb-1">{title}</h3>
      <p className="text-slate-400 text-sm">该功能模块正在开发中</p>
   </div>
);


const Agency: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabMode>('结算中心');
  const [stats, setStats] = useState<any>(null);

  // Menu Configuration
  const menuItems: { id: TabMode; icon: string; color: string }[] = [
    { id: '代理管理', icon: '👥', color: 'bg-blue-50 text-blue-600' },
    { id: '全部代理', icon: '📋', color: 'bg-indigo-50 text-indigo-600' },
    { id: '老板管理', icon: '👔', color: 'bg-purple-50 text-purple-600' },
    { id: '玩家列表', icon: '🎮', color: 'bg-emerald-50 text-emerald-600' },
    { id: '业绩详情', icon: '📈', color: 'bg-rose-50 text-rose-600' },
    { id: '结算中心', icon: '💰', color: 'bg-orange-50 text-orange-600' },
    { id: '手游排序', icon: '🔝', color: 'bg-cyan-50 text-cyan-600' },
    { id: '审批列表', icon: '📝', color: 'bg-slate-50 text-slate-600' },
  ];

  useEffect(() => {
    const loadStats = async () => {
      const data = await api.agency.getStats();
      setStats(data);
    };
    loadStats();
  }, []);

  return (
    <div className="flex flex-col min-h-full bg-[#f8fafc] pb-24">
       {/* Content Padding */}
       <div className="px-5 pt-6">
          <UserInfoCard stats={stats} />
          
          {/* Dashboard Grid Menu - The "Card Style" requested */}
          <div className="bg-white rounded-[24px] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.02)] border border-slate-100 mb-6">
              <div className="grid grid-cols-4 gap-y-6 gap-x-2">
                  {menuItems.map((item) => (
                      <button 
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`flex flex-col items-center group transition-all duration-300 relative`}
                      >
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl mb-2 transition-all duration-300 shadow-sm ${
                              activeTab === item.id 
                              ? 'bg-slate-900 text-white scale-110 shadow-lg shadow-slate-200' 
                              : `${item.color} group-hover:scale-105`
                          }`}>
                              {item.icon}
                          </div>
                          <span className={`text-[11px] font-bold tracking-wide transition-colors ${
                              activeTab === item.id ? 'text-slate-900' : 'text-slate-500'
                          }`}>
                              {item.id}
                          </span>
                          
                          {/* Active Indicator Dot */}
                          {activeTab === item.id && (
                              <div className="absolute -bottom-2 w-1 h-1 bg-slate-900 rounded-full"></div>
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

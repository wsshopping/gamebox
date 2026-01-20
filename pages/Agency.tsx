import React, { useState } from 'react';

// Mock Data
const MOCK_AGENTS = [
  { id: 1, account: '16666666633', role: '总代', inviteCode: 'QPHS', upline: '18812567888', status: '正常', time: '2026-01-20 17:50' },
  { id: 2, account: '13636363636', role: '总推', inviteCode: 'EMGP', upline: '13999999438', status: '正常', time: '2026-01-20 17:31' },
  { id: 3, account: '15347705566', role: '总代', inviteCode: '9TDD', upline: '18812567888', status: '正常', time: '2026-01-20 17:03' },
];

const MOCK_BOSSES = [
  { id: 1, account: '13777776662', nickname: '13777776662', status: '正常', game: '天龙八部怀旧(三端)(安卓版)', time: '2026-01-20 17:54:56' },
];

const MOCK_PLAYERS = [
  { id: 1, account: '13636363636', inviteCode: 'GNN7BE73', recharge: '0.00', time: '2026-01-20 17:31:36' },
  { id: 2, account: '13000000009', inviteCode: 'GNN7BE73', recharge: '0.00', time: '2026-01-13 21:40:47' },
  { id: 3, account: '19988998899', inviteCode: 'GNN7BE73', recharge: '0.00', time: '2026-01-11 20:04:33' },
];

const MOCK_GAMES = [
  { id: '1', name: '天龙八部怀旧(三端)', platform: '安卓' },
  { id: '2', name: '灵画师', platform: '安卓' },
  { id: '3', name: '已下架 (#2)', platform: '手游 · 已下架' },
  { id: '4', name: '道友来挖宝', platform: '安卓' },
];

const ALL_GAMES = [
    { id: '5', name: '大话西游', platform: '安卓' },
    { id: '6', name: '倩女幽魂', platform: '安卓' },
    { id: '7', name: '约定之日', platform: '安卓' },
    { id: '8', name: '兵器王者', platform: '安卓' },
    { id: '9', name: '梦幻西游手游', platform: '安卓' },
];

type TabType = 'agent_create' | 'agent_list' | 'boss' | 'player' | 'finance' | 'game_sort';

const Agency: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('agent_create');
  
  // Headers
  const renderHeader = () => (
    <div className="bg-white p-4 rounded-b-[24px] shadow-sm mb-4">
       <div className="bg-orange-50 rounded-2xl p-4 border border-orange-100">
          <div className="flex justify-between items-center mb-3">
             <div className="flex space-x-2 text-xs">
                <span className="text-gray-500">我的角色:</span>
                <span className="font-bold text-orange-500">超级管理员</span>
             </div>
             <div className="flex items-center space-x-2 text-xs">
                <span className="text-gray-500">我的邀请码:</span>
                <span className="font-bold text-orange-500">GNN7BE73</span>
                <button className="text-[10px] border border-orange-300 text-orange-500 px-1.5 rounded bg-white">复制</button>
             </div>
          </div>
          <div className="flex space-x-4 text-xs">
             <div className="flex space-x-2">
                <span className="text-gray-500">当前可创建:</span>
                <span className="font-bold text-orange-500">总推</span>
             </div>
             <div className="flex space-x-2">
                <span className="text-gray-500">总注册数:</span>
                <span className="font-bold text-orange-500">30</span>
             </div>
          </div>
       </div>
    </div>
  );

  // Navigation
  const renderNav = () => (
    <div className="sticky top-0 z-30 bg-[#f8fafc] pt-2 pb-2">
      <div className="flex overflow-x-auto no-scrollbar space-x-1 px-4">
        {[
            { id: 'agent_create', label: '代理管理' },
            { id: 'agent_list', label: '全部代理' },
            { id: 'boss', label: '老板管理' },
            { id: 'player', label: '玩家列表' },
            { id: 'finance', label: '结算中心' },
            { id: 'game_sort', label: '手游排序' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={`whitespace-nowrap px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              activeTab === tab.id 
              ? 'bg-orange-500 text-white shadow-md shadow-orange-200' 
              : 'text-gray-500 hover:text-gray-800 bg-white border border-transparent hover:border-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );

  // Content: Agent Creation
  const renderAgentCreate = () => (
    <div className="px-4 pb-20 space-y-4 animate-fade-in-up">
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-900 mb-4 border-l-4 border-orange-500 pl-2">创建总推</h3>
        <div className="space-y-4">
           <div>
              <label className="text-xs text-gray-500 mb-1 block">手机号</label>
              <input type="text" placeholder="请输入11位手机号" className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-orange-500" />
           </div>
           <div>
              <label className="text-xs text-gray-500 mb-1 block">密码</label>
              <input type="password" placeholder="6-30位字母或数字" className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-orange-500" />
           </div>
           <div>
              <label className="text-xs text-gray-500 mb-1 block">确认密码</label>
              <input type="password" placeholder="再次输入密码" className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-orange-500" />
           </div>

           <div className="border border-dashed border-orange-200 bg-orange-50/50 rounded-xl p-3">
              <div className="flex justify-between items-center mb-2">
                 <span className="text-xs text-gray-500">按游戏单独配置分成比例 (可选)</span>
              </div>
              <button className="w-full py-2 bg-white border border-orange-200 text-orange-500 text-xs rounded-lg font-bold">
                 添加游戏分成
              </button>
              <p className="text-[10px] text-gray-400 mt-2">仅可选择列表内的游戏，未配置的游戏将无法获得分成。</p>
           </div>

           <div>
              <label className="text-xs text-gray-500 mb-1 block">自定义邀请码</label>
              <input type="text" placeholder="可选，4-32位大写字母或数字" className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-orange-500" />
              <p className="text-[10px] text-gray-400 mt-1">若不填写，将自动生成唯一邀请码；子代注册时需填写本人的邀请码。</p>
           </div>
           
           <button className="w-full bg-orange-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-orange-200 mt-4 active:scale-95 transition-transform">
             立即创建
           </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
         <h3 className="font-bold text-gray-900 mb-4 border-l-4 border-orange-500 pl-2">直属子代</h3>
         <div className="space-y-4">
            <div className="border-b border-gray-50 pb-3">
               <div className="flex justify-between items-start mb-1">
                  <span className="font-bold text-gray-900">13636363636</span>
                  <span className="text-[10px] text-gray-400">2026-01-20 17:31</span>
               </div>
               <div className="flex items-center space-x-2 text-xs text-gray-500 mb-3">
                  <span className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded text-[10px]">总推</span>
                  <span>邀请码: <span className="text-orange-500 font-bold">EMGP</span></span>
               </div>
               <div className="flex items-center justify-between text-xs">
                   <span className="text-gray-400">联系方式: 13636363636 / --</span>
                   <div className="flex space-x-2">
                      <button className="text-orange-500 border border-orange-200 px-2 py-0.5 rounded">分成详情</button>
                      <button className="text-orange-500 border border-orange-200 px-2 py-0.5 rounded">重置密码</button>
                      <button className="text-red-500 border border-red-200 px-2 py-0.5 rounded">删除</button>
                   </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );

  // Content: All Agents List
  const renderAgentList = () => (
    <div className="px-4 pb-20 space-y-4 animate-fade-in-up">
       <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
         <h3 className="font-bold text-gray-900 mb-3 text-sm">全部代理 (仅超管)</h3>
         <div className="grid grid-cols-2 gap-3 mb-3">
            <input className="bg-gray-50 rounded-lg px-3 py-2 text-xs outline-none" placeholder="账号" />
            <input className="bg-gray-50 rounded-lg px-3 py-2 text-xs outline-none" placeholder="手机号" />
            <input className="bg-gray-50 rounded-lg px-3 py-2 text-xs outline-none" placeholder="邀请码" />
            <select className="bg-gray-50 rounded-lg px-3 py-2 text-xs outline-none text-gray-500">
               <option>全部角色</option>
            </select>
         </div>
         <div className="flex space-x-3">
            <select className="bg-gray-50 rounded-lg px-3 py-2 text-xs outline-none text-gray-500 flex-1">
               <option>全部状态</option>
            </select>
            <button className="bg-orange-500 text-white text-xs font-bold px-6 py-2 rounded-lg flex-1">筛选</button>
         </div>
       </div>

       <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex bg-gray-50 px-4 py-2 text-[10px] text-gray-500 font-bold">
             <div className="w-24">账号/角色</div>
             <div className="flex-1 text-center">邀请码/上级</div>
             <div className="w-12 text-center">状态</div>
             <div className="w-20 text-right">操作</div>
          </div>
          {MOCK_AGENTS.map(agent => (
             <div key={agent.id} className="p-4 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                   <div>
                      <p className="font-bold text-sm text-gray-900">{agent.account}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{agent.time}</p>
                   </div>
                   <div className="text-right">
                      <p className="text-xs font-bold text-orange-500">{agent.role}</p>
                   </div>
                </div>
                <div className="flex justify-between items-center text-xs text-gray-500">
                   <div>
                      <span className="block text-gray-900 font-bold mb-0.5">{agent.inviteCode}</span>
                      <span className="text-[10px] text-gray-400">上级: {agent.upline || '--'}</span>
                   </div>
                   <div className="text-center">
                      <span className="text-green-500 bg-green-50 px-1.5 py-0.5 rounded text-[10px]">{agent.status}</span>
                   </div>
                   <div className="text-right">
                      <button className="text-orange-500">封禁</button>
                   </div>
                </div>
             </div>
          ))}
       </div>
    </div>
  );

  // Content: Boss Management
  const renderBossManage = () => (
    <div className="px-4 pb-20 space-y-4 animate-fade-in-up">
       {/* Create Boss */}
       <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
         <h3 className="font-bold text-gray-900 mb-4 border-l-4 border-orange-500 pl-2">创建老板账号</h3>
         <div className="space-y-3">
             <input type="text" placeholder="请输入11位手机号" className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-orange-500" />
             <input type="password" placeholder="6-30位字母或数字" className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-orange-500" />
             <input type="password" placeholder="再次输入密码" className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-orange-500" />
             <input type="text" placeholder="昵称 (可选)" className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-orange-500" />
             <div className="relative">
                <input type="text" placeholder="绑定游戏 (0项)" readOnly className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none" />
                <div className="absolute right-4 top-3 text-gray-400">...</div>
             </div>
             <p className="text-[10px] text-gray-400">可多选，一个游戏仅可绑定一个老板账号。</p>
             <button className="w-full bg-orange-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-orange-200 mt-2 active:scale-95 transition-transform">
               立即创建
             </button>
         </div>
       </div>

       {/* Boss List */}
       <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-3 text-sm">老板列表</h3>
          <div className="flex space-x-3 mb-4">
             <input className="bg-gray-50 rounded-lg px-3 py-2 text-xs outline-none flex-1" placeholder="账号" />
             <select className="bg-gray-50 rounded-lg px-3 py-2 text-xs outline-none text-gray-500 w-24">
                <option>全部状态</option>
             </select>
          </div>
          <button className="w-full bg-orange-500 text-white text-xs font-bold py-2 rounded-lg mb-4">筛选</button>

          <div className="space-y-3">
             {MOCK_BOSSES.map(boss => (
               <div key={boss.id} className="border-b border-gray-50 pb-3 last:border-0">
                  <div className="flex justify-between items-start mb-1">
                     <span className="font-bold text-gray-900">{boss.account}</span>
                     <span className="text-[10px] text-gray-400">{boss.time}</span>
                  </div>
                  <div className="text-xs text-gray-500 mb-2">
                     <span className="mr-3">昵称: {boss.nickname}</span>
                     <span>状态: <span className="text-green-500">{boss.status}</span></span>
                  </div>
                  <div className="text-xs text-gray-400 mb-3">
                     游戏: <span className="text-blue-500">{boss.game}</span>
                  </div>
                  <div className="flex justify-end space-x-2">
                     <button className="text-orange-500 text-xs border border-orange-200 px-2 py-1 rounded">封禁</button>
                     <button className="text-orange-500 text-xs border border-orange-200 px-2 py-1 rounded">编辑游戏</button>
                  </div>
               </div>
             ))}
          </div>
       </div>
    </div>
  );

  // Content: Player List
  const renderPlayerList = () => (
    <div className="px-4 pb-20 space-y-4 animate-fade-in-up">
       <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
         <h3 className="font-bold text-gray-900 mb-3 text-sm">玩家列表</h3>
         <div className="space-y-3 mb-4">
            <input className="w-full bg-gray-50 rounded-lg px-3 py-2 text-xs outline-none" placeholder="玩家账号" />
            <input className="w-full bg-gray-50 rounded-lg px-3 py-2 text-xs outline-none" placeholder="使用的邀请码" />
         </div>
         <button className="w-full bg-orange-500 text-white text-xs font-bold py-2.5 rounded-lg">查询</button>
       </div>

       <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex bg-gray-50 px-3 py-2 text-[10px] text-gray-500 font-bold">
             <div className="w-24">玩家账号</div>
             <div className="flex-1 text-center">邀请码/充值</div>
             <div className="w-16 text-right">操作</div>
          </div>
          {MOCK_PLAYERS.map(player => (
             <div key={player.id} className="p-3 border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                <div className="flex justify-between items-center">
                   <div className="w-24 truncate">
                      <p className="font-bold text-xs text-gray-900">{player.account}</p>
                   </div>
                   <div className="flex-1 text-center">
                      <p className="font-bold text-xs text-gray-900">{player.inviteCode}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">¥ {player.recharge}</p>
                      <p className="text-[9px] text-gray-300 mt-0.5">{player.time.split(' ')[0]}</p>
                   </div>
                   <div className="w-16 text-right">
                      <button className="text-[10px] text-orange-500 border border-orange-200 px-1.5 py-0.5 rounded">重置密码</button>
                   </div>
                </div>
             </div>
          ))}
       </div>
    </div>
  );

  // Content: Settlement Center
  const renderFinance = () => (
    <div className="px-4 pb-20 space-y-4 animate-fade-in-up">
       {/* Overview */}
       <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-3 text-sm border-l-4 border-orange-500 pl-2">结算概览</h3>
          <div className="grid grid-cols-3 gap-4 mb-4">
             <div>
                <p className="text-[10px] text-gray-400 mb-1">总流水</p>
                <p className="text-base font-bold text-orange-500">¥ 5060.00</p>
             </div>
             <div>
                <p className="text-[10px] text-gray-400 mb-1">累计利润</p>
                <p className="text-base font-bold text-orange-500">¥ 101.20</p>
             </div>
             <div>
                <p className="text-[10px] text-gray-400 mb-1">已提现</p>
                <p className="text-base font-bold text-orange-500">¥ 0.00</p>
             </div>
          </div>
          <div>
             <p className="text-[10px] text-gray-400 mb-1">可提现</p>
             <p className="text-xl font-bold text-orange-500">¥ 81.20</p>
          </div>
       </div>

       {/* Withdrawal Action */}
       <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex border-b border-gray-100 mb-4">
             {['收款地址', '发起提现', '提现记录'].map(t => (
               <button key={t} className={`flex-1 pb-2 text-xs font-bold ${t === '收款地址' ? 'text-orange-500 border-b-2 border-orange-500' : 'text-gray-400'}`}>
                  {t}
               </button>
             ))}
          </div>

          <div>
             <h4 className="text-xs font-bold text-gray-900 mb-3">收款地址 (TRC20-USDT)</h4>
             <div className="mb-3">
               <label className="text-[10px] text-gray-400 mb-1 block">收款地址</label>
               <input type="text" defaultValue="aabbxddfff" className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none" />
             </div>
             <p className="text-[10px] text-gray-400 mb-4">仅支持 TRC20 地址，保存后用于提现。</p>
             <button className="w-full bg-orange-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-orange-200 active:scale-95 transition-transform">
               保存
             </button>
          </div>
       </div>
    </div>
  );

  // Content: Game Sort
  const renderGameSort = () => (
     <div className="px-4 pb-20 space-y-4 animate-fade-in-up">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
           <h3 className="font-bold text-gray-900 mb-2 text-sm">代理手游排序</h3>
           <p className="text-[10px] text-gray-400 leading-relaxed mb-4">最多可配置 30 款手游，将优先展示给通过您邀请码注册的玩家，未配置的游戏保持平台默认顺序。</p>
           
           <h4 className="text-xs font-bold text-gray-900 mb-3">已选手游</h4>
           <div className="space-y-2 mb-6">
              {MOCK_GAMES.map(game => (
                <div key={game.id} className="bg-gray-50 p-3 rounded-xl flex items-center justify-between">
                   <div>
                      <p className="text-xs font-bold text-gray-900">{game.name}</p>
                      <p className="text-[10px] text-gray-400">{game.platform}</p>
                   </div>
                   <div className="flex space-x-1">
                      <button className="bg-white border border-gray-200 text-gray-500 text-[10px] px-2 py-1 rounded">上移</button>
                      <button className="bg-white border border-gray-200 text-gray-500 text-[10px] px-2 py-1 rounded">下移</button>
                      <button className="bg-white border border-gray-200 text-red-500 text-[10px] px-2 py-1 rounded">移除</button>
                   </div>
                </div>
              ))}
           </div>

           <div className="flex space-x-2 mb-4">
              <input className="flex-1 bg-gray-50 rounded-lg px-3 py-2 text-xs outline-none" placeholder="搜索手游名称" />
              <button className="bg-gray-100 text-gray-500 text-xs px-4 rounded-lg">搜索</button>
           </div>

           <div className="space-y-2">
              {ALL_GAMES.map(game => (
                <div key={game.id} className="bg-white border border-gray-100 p-3 rounded-xl flex items-center justify-between">
                   <div>
                      <p className="text-xs font-bold text-gray-900">{game.name}</p>
                      <p className="text-[10px] text-gray-400">{game.platform}</p>
                   </div>
                   <button className="border border-orange-500 text-orange-500 text-[10px] px-3 py-1 rounded">添加</button>
                </div>
              ))}
           </div>
        </div>
     </div>
  );

  return (
    <div className="bg-[#f8fafc] min-h-full">
       {renderHeader()}
       {renderNav()}
       <div className="mt-4">
         {activeTab === 'agent_create' && renderAgentCreate()}
         {activeTab === 'agent_list' && renderAgentList()}
         {activeTab === 'boss' && renderBossManage()}
         {activeTab === 'player' && renderPlayerList()}
         {activeTab === 'finance' && renderFinance()}
         {activeTab === 'game_sort' && renderGameSort()}
       </div>
    </div>
  );
};

export default Agency;
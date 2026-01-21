
import React, { useEffect } from 'react';
import { useNavigate, useLocation, Routes, Route } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GAMES, TRADE_ITEMS } from '../services/mockData';
import GameCard from '../components/GameCard';

// Sub-page Component
const UserSubPage: React.FC<{ title: string; type: 'game' | 'trade' | 'gift' | 'default' }> = ({ title, type }) => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-[#020617] pb-20">
      <div className="bg-[#020617]/90 backdrop-blur-md px-4 py-3 sticky top-0 z-40 shadow-sm flex items-center border-b border-white/5">
         <button onClick={() => navigate('/user')} className="mr-3 text-slate-400 hover:bg-slate-800 p-1 rounded-full">
           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
         </button>
         <h1 className="text-lg font-bold text-white">{title}</h1>
      </div>
      
      <div className="p-4">
        {type === 'game' && (
          <div className="space-y-3">
             {GAMES.slice(0, 2).map(game => (
               <GameCard key={game.id} game={game} />
             ))}
             <div className="text-center text-xs text-slate-600 mt-4">没有更多游戏了</div>
          </div>
        )}

        {type === 'trade' && (
           <div className="space-y-3">
             {TRADE_ITEMS.slice(0, 1).map(item => (
                <div key={item.id} className="bg-slate-900 p-4 rounded-xl border border-white/5 flex justify-between items-center">
                   <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-slate-800 rounded-lg overflow-hidden">
                        <img src={item.image} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-200">{item.title}</div>
                        <div className="text-xs text-slate-500">{item.time || '2024-05-20'}</div>
                      </div>
                   </div>
                   <div className="text-amber-500 font-bold">-¥{item.price}</div>
                </div>
             ))}
           </div>
        )}

        {(type === 'gift' || type === 'default') && (
           <div className="flex flex-col items-center justify-center pt-20 text-slate-600">
              <div className="text-4xl mb-2 opacity-50">📦</div>
              <p className="text-sm">暂无记录</p>
           </div>
        )}
      </div>
    </div>
  );
};

const UserCenterMain: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="bg-[#020617] min-h-full">
      {/* Header: "Black Card" Aesthetic */}
      <div className="relative bg-gradient-to-b from-slate-900 to-[#020617] p-8 pt-12 pb-16 overflow-hidden rounded-b-[40px] shadow-2xl shadow-black/50 border-b border-white/5">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-amber-500/5 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-indigo-500/5 rounded-full blur-[60px] -ml-10 -mb-10 pointer-events-none"></div>
        
        <div className="relative z-10 flex items-center space-x-6">
          <div className="relative group cursor-pointer">
             <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-yellow-600 rounded-full opacity-70 blur group-hover:opacity-100 transition duration-500"></div>
             <div className="relative w-20 h-20 rounded-full p-[3px] bg-[#0f172a]">
                <img src={user.avatar} alt="avatar" className="w-full h-full rounded-full object-cover border-2 border-[#1e293b]" />
             </div>
             <div className="absolute bottom-0 right-0 bg-amber-500 text-black text-[10px] font-bold px-1.5 py-0.5 rounded-md border-2 border-[#0f172a]">
               Lv.{Math.floor((user.assets || 0) / 100) + 1}
             </div>
          </div>
          
          <div className="flex-1">
            <h2 className="text-2xl font-black text-white tracking-tight mb-1">{user.username}</h2>
            <p className="text-slate-500 text-xs font-mono mb-3 tracking-wider">ID: {user.id.slice(-8)}</p>
            
            <div className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 px-3 py-1 rounded-full backdrop-blur-md">
               <span className="text-amber-400 text-xs drop-shadow-md">♛</span>
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500 text-[10px] font-bold tracking-widest uppercase">VIP {user.vipLevel} Platinum</span>
            </div>
          </div>
          
          <button onClick={() => navigate('/user/set')} className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-all border border-white/5">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </button>
        </div>

        <div className="flex justify-between mt-8 px-4 relative z-10 border-t border-white/5 pt-6">
          {[
            { label: 'Games', value: '12' },
            { label: 'Following', value: '5' },
            { label: 'Posts', value: '128' },
            { label: 'Fans', value: '2.5k' }
          ].map((stat) => (
             <div key={stat.label} className="flex flex-col items-center group cursor-pointer">
               <span className="text-lg font-bold text-white mb-1 group-hover:text-amber-400 transition-colors">{stat.value}</span>
               <span className="text-[10px] text-slate-500 uppercase tracking-widest font-medium">{stat.label}</span>
             </div>
          ))}
        </div>
      </div>

      {/* Assets Card */}
      <div className="px-6 -mt-8 relative z-20">
         <div className="bg-[#0f172a] rounded-[24px] p-6 flex justify-between items-center shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)] border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-[40px] -mr-10 -mt-10"></div>
            <div className="relative z-10">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1 flex items-center">
                 <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-2 shadow-[0_0_5px_rgba(245,158,11,0.8)]"></span>
                 Total Assets
              </p>
              <div className="flex items-baseline">
                <span className="text-xl font-medium text-amber-500 mr-1">¥</span>
                <span className="text-3xl font-black text-white tracking-tight">{user.assets.toLocaleString()}</span>
                <span className="text-lg font-medium text-slate-500">.00</span>
              </div>
            </div>
            <button className="bg-gradient-to-r from-amber-500 to-yellow-600 text-black text-xs font-bold px-6 py-3 rounded-2xl hover:shadow-[0_0_15px_rgba(245,158,11,0.4)] transition-all active:scale-95 relative z-10">
              Wallet
            </button>
         </div>
      </div>

      {/* Menu List */}
      <div className="px-6 pt-8 pb-32 space-y-6">
         <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 pl-2">Entertainment</h4>
            <div className="bg-[#0f172a] rounded-[24px] border border-white/5 overflow-hidden">
               {[
                 { name: '我的游戏', icon: '🎮', path: '/user/game' },
                 { name: '我的礼包', icon: '🎁', path: '/user/gift' },
                 { name: '交易记录', icon: '📦', path: '/user/trade_record' },
               ].map((item, i) => (
                 <div key={item.name} onClick={() => navigate(item.path)} className={`p-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors ${i !== 2 ? 'border-b border-white/5' : ''}`}>
                    <div className="flex items-center space-x-4">
                       <span className="text-lg opacity-70 w-8 text-center">{item.icon}</span>
                       <span className="text-sm font-semibold text-slate-200">{item.name}</span>
                    </div>
                    <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                 </div>
               ))}
            </div>
         </div>

         <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 pl-2">Settings & Support</h4>
            <div className="bg-[#0f172a] rounded-[24px] border border-white/5 overflow-hidden">
               {[
                 { name: '代金券', icon: '🎟', path: '/user/voucher' },
                 { name: '实名认证', icon: '🆔', path: '/user/realname' },
                 { name: '客服帮助', icon: '🎧', path: '/user/service' },
               ].map((item, i) => (
                 <div key={item.name} onClick={() => navigate(item.path)} className={`p-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors ${i !== 2 ? 'border-b border-white/5' : ''}`}>
                    <div className="flex items-center space-x-4">
                       <span className="text-lg opacity-70 w-8 text-center">{item.icon}</span>
                       <span className="text-sm font-semibold text-slate-200">{item.name}</span>
                    </div>
                    <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                 </div>
               ))}
            </div>
         </div>

         <button onClick={handleLogout} className="w-full mt-4 text-rose-500 font-bold text-sm py-4 hover:bg-rose-900/20 rounded-2xl transition-colors border border-rose-900/30">
            退出登录
         </button>
      </div>
    </div>
  );
}

const UserCenter: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login');
    }
  }, [user, isLoading, navigate]);

  if (isLoading || !user) {
    return (
      <div className="bg-[#020617] min-h-full flex items-center justify-center">
         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <Routes>
       <Route path="/" element={<UserCenterMain />} />
       <Route path="game" element={<UserSubPage title="我的游戏" type="game" />} />
       <Route path="trade_record" element={<UserSubPage title="交易记录" type="trade" />} />
       <Route path="gift" element={<UserSubPage title="我的礼包" type="gift" />} />
       <Route path="*" element={<UserSubPage title="功能开发中" type="default" />} />
    </Routes>
  );
};

export default UserCenter;

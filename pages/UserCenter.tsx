
import React, { useEffect } from 'react';
import { useNavigate, useLocation, Routes, Route } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { GAMES, TRADE_ITEMS } from '../services/mockData';
import GameCard from '../components/GameCard';

// Sub-page Component
const UserSubPage: React.FC<{ title: string; type: 'game' | 'trade' | 'gift' | 'default' }> = ({ title, type }) => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen app-bg pb-20">
      <div className="glass-bg px-4 py-3 sticky top-0 z-40 shadow-sm flex items-center border-b border-theme">
         <button onClick={() => navigate('/user')} className="mr-3 text-slate-400 hover:bg-white/10 p-1 rounded-full">
           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
         </button>
         <h1 className="text-lg font-bold" style={{color: 'var(--text-primary)'}}>{title}</h1>
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
                <div key={item.id} className="card-bg p-4 rounded-xl border border-theme flex justify-between items-center">
                   <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-white/5 rounded-lg overflow-hidden border border-theme">
                        <img src={item.image} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="text-sm font-bold" style={{color: 'var(--text-primary)'}}>{item.title}</div>
                        <div className="text-xs text-slate-500">{item.time || '2024-05-20'}</div>
                      </div>
                   </div>
                   <div className="text-accent font-bold">-¥{item.price}</div>
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
  const { theme, setTheme } = useTheme();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="app-bg min-h-full transition-colors duration-500">
      {/* Header: Dynamic Theme Background */}
      <div className="relative bg-gradient-to-b from-[var(--bg-card)] to-[var(--bg-primary)] p-8 pt-12 pb-16 overflow-hidden rounded-b-[40px] shadow-2xl shadow-black/10 border-b border-theme transition-all duration-500">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-accent-gradient opacity-10 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-indigo-500/5 rounded-full blur-[60px] -ml-10 -mb-10 pointer-events-none"></div>
        
        <div className="relative z-10 flex items-center space-x-6">
          <div className="relative group cursor-pointer">
             <div className="absolute -inset-1 bg-accent-gradient rounded-full opacity-70 blur group-hover:opacity-100 transition duration-500"></div>
             <div className="relative w-20 h-20 rounded-full p-[3px] bg-[var(--bg-primary)]">
                <img
                  src={user.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${user.username}`}
                  alt="avatar"
                  className="w-full h-full rounded-full object-cover border-2 border-theme"
                />
             </div>
             <div className="absolute bottom-0 right-0 bg-accent-gradient text-black text-[10px] font-bold px-1.5 py-0.5 rounded-md border-2 border-[var(--bg-primary)]">
               Lv.{Math.floor((user.assets || 0) / 100) + 1}
             </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-black tracking-tight mb-1" style={{color: 'var(--text-primary)'}}>{user.username}</h2>
            <div className="flex items-center space-x-2">
               <p className="text-slate-500 text-xs font-mono tracking-wider truncate">ID: {String(user.ID).slice(-8)}</p>
            </div>
            
            <div className="inline-flex items-center space-x-2 bg-[var(--bg-glass)] border border-theme px-3 py-1 rounded-full backdrop-blur-md mt-2">
               <span className="text-accent text-xs drop-shadow-md">♛</span>
               <span className="text-accent-gradient text-[10px] font-bold tracking-widest uppercase">VIP {user.vipLevel || 0} Platinum</span>
            </div>

            {/* Theme Switcher Segmented Control */}
            <div className="mt-4 flex bg-black/10 backdrop-blur-md rounded-lg p-1 border border-theme w-fit">
               {[
                 { id: 'black-gold', label: '黑金', icon: '🌑' },
                 { id: 'quiet-luxury', label: '静谧', icon: '☁️' },
                 { id: 'light', label: '亮白', icon: '☀' }
               ].map((t) => (
                 <button 
                   key={t.id}
                   onClick={() => setTheme(t.id as any)}
                   className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-all flex items-center space-x-1 ${
                     theme === t.id 
                     ? 'bg-accent-gradient text-black shadow-sm' 
                     : 'text-slate-500 hover:text-[var(--text-primary)]'
                   }`}
                 >
                   <span>{t.icon}</span>
                   <span>{t.label}</span>
                 </button>
               ))}
            </div>
          </div>
          
          <button onClick={() => navigate('/user/set')} className="absolute top-8 right-8 w-10 h-10 rounded-full bg-[var(--bg-glass)] flex items-center justify-center text-slate-400 hover:text-accent hover:bg-[var(--bg-card)] transition-all border border-theme shadow-sm">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </button>
        </div>

        <div className="flex justify-between mt-6 px-4 relative z-10 border-t border-theme pt-6">
          {[
            { label: 'Games', value: '12' },
            { label: 'Following', value: '5' },
            { label: 'Posts', value: '128' },
            { label: 'Fans', value: '2.5k' }
          ].map((stat) => (
             <div key={stat.label} className="flex flex-col items-center group cursor-pointer">
               <span className="text-lg font-bold mb-1 group-hover:text-accent transition-colors" style={{color: 'var(--text-primary)'}}>{stat.value}</span>
               <span className="text-[10px] text-slate-500 uppercase tracking-widest font-medium">{stat.label}</span>
             </div>
          ))}
        </div>
      </div>

      {/* Assets Card */}
      <div className="px-6 -mt-8 relative z-20">
         <div className="card-bg rounded-[24px] p-6 flex justify-between items-center shadow-[0_20px_40px_-10px_rgba(0,0,0,0.2)] border border-theme relative overflow-hidden transition-colors duration-500">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent-gradient opacity-10 rounded-full blur-[40px] -mr-10 -mt-10"></div>
            <div className="relative z-10">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1 flex items-center">
                 <span className="w-1.5 h-1.5 rounded-full bg-accent-gradient mr-2 shadow-[0_0_5px_rgba(245,158,11,0.8)]"></span>
                 Total Assets
              </p>
              <div className="flex items-baseline">
                <span className="text-xl font-medium text-accent mr-1">¥</span>
                <span className="text-3xl font-black tracking-tight" style={{color: 'var(--text-primary)'}}>{(user.assets || 0).toLocaleString()}</span>
                <span className="text-lg font-medium text-slate-500">.00</span>
              </div>
            </div>
            <button className="bg-accent-gradient text-black text-xs font-bold px-6 py-3 rounded-2xl hover:shadow-[0_0_15px_rgba(245,158,11,0.4)] transition-all active:scale-95 relative z-10">
              Wallet
            </button>
         </div>
      </div>

      {/* Menu List */}
      <div className="px-6 pt-8 pb-32 space-y-6">
         <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 pl-2">Entertainment</h4>
            <div className="card-bg rounded-[24px] border border-theme overflow-hidden shadow-sm">
               {[
                 { name: '我的游戏', icon: '🎮', path: '/user/game' },
                 { name: '我的礼包', icon: '🎁', path: '/user/gift' },
                 { name: '交易记录', icon: '📦', path: '/user/trade_record' },
               ].map((item, i) => (
                 <div key={item.name} onClick={() => navigate(item.path)} className={`p-4 flex items-center justify-between cursor-pointer hover:bg-[var(--bg-glass)] transition-colors ${i !== 2 ? 'border-b border-theme' : ''}`}>
                    <div className="flex items-center space-x-4">
                       <span className="text-lg opacity-70 w-8 text-center">{item.icon}</span>
                       <span className="text-sm font-semibold" style={{color: 'var(--text-primary)'}}>{item.name}</span>
                    </div>
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                 </div>
               ))}
            </div>
         </div>

         <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 pl-2">Settings & Support</h4>
            <div className="card-bg rounded-[24px] border border-theme overflow-hidden shadow-sm">
               {[
                 { name: '代金券', icon: '🎟', path: '/user/voucher' },
                 { name: '实名认证', icon: '🆔', path: '/user/realname' },
                 // Update the link to the new Feedback page
                 { name: '客服帮助', icon: '🎧', path: '/user/feedback' },
               ].map((item, i) => (
                 <div key={item.name} onClick={() => navigate(item.path)} className={`p-4 flex items-center justify-between cursor-pointer hover:bg-[var(--bg-glass)] transition-colors ${i !== 2 ? 'border-b border-theme' : ''}`}>
                    <div className="flex items-center space-x-4">
                       <span className="text-lg opacity-70 w-8 text-center">{item.icon}</span>
                       <span className="text-sm font-semibold" style={{color: 'var(--text-primary)'}}>{item.name}</span>
                    </div>
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                 </div>
               ))}
            </div>
         </div>

         <button onClick={handleLogout} className="w-full mt-4 text-rose-500 font-bold text-sm py-4 hover:bg-rose-500/10 rounded-2xl transition-colors border border-rose-500/20">
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
      <div className="app-bg min-h-full flex items-center justify-center">
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
       <Route path="feedback" element={<UserSubPage title="反馈" type="default" />} /> 
       <Route path="*" element={<UserSubPage title="功能开发中" type="default" />} />
    </Routes>
  );
};

export default UserCenter;

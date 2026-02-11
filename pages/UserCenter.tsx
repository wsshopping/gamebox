
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { GAMES } from '../services/mockData';
import GameCard from '../components/GameCard';
import { api } from '../services/api';
import { userApi } from '../services/api/user';
import { useIm } from '../context/ImContext';
import { TradeOrder } from '../types';

// Sub-page Component
const UserSubPage: React.FC<{ title: string; type: 'game' | 'trade' | 'gift' | 'default' }> = ({ title, type }) => {
  const navigate = useNavigate();
  const [tradeOrders, setTradeOrders] = useState<TradeOrder[]>([]);
  const [tradeLoading, setTradeLoading] = useState(false);
  const [tradeError, setTradeError] = useState('');

  useEffect(() => {
    if (type !== 'trade') {
      return;
    }
    let active = true;
    setTradeLoading(true);
    setTradeError('');
    api.trade.listOrders('buyer')
      .then(res => {
        if (active) {
          setTradeOrders(res.items);
        }
      })
      .catch((err: any) => {
        if (active) {
          setTradeError(err?.message || '加载失败');
        }
      })
      .finally(() => {
        if (active) {
          setTradeLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [type]);

  const tradeStatusLabel: Record<string, string> = {
    pending_delivery: '待发货',
    delivering: '已发货',
    completed: '已完成',
    canceled: '已取消',
    disputed: '申诉中',
    refunded: '已退款'
  };

  const formatOrderTime = (raw?: string) => {
    if (!raw) return '';
    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) {
      return raw;
    }
    return date.toLocaleDateString();
  };
  
  return (
    <div className="min-h-screen app-bg pb-20 pt-20">
      <div className="glass-bg px-4 py-3 fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md z-40 shadow-sm flex items-center border-b border-theme">
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
             {tradeLoading && (
               <div className="text-center text-xs text-slate-500">加载中...</div>
             )}
             {!tradeLoading && tradeError && (
               <div className="text-center text-xs text-rose-400">{tradeError}</div>
             )}
             {!tradeLoading && !tradeError && tradeOrders.length === 0 && (
               <div className="text-center text-xs text-slate-500">暂无记录</div>
             )}
             {!tradeLoading && !tradeError && tradeOrders.map(order => (
                <div key={order.id} className="card-bg p-4 rounded-xl border border-theme flex justify-between items-center">
                   <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-white/5 rounded-lg overflow-hidden border border-theme">
                        {order.listingImage && <img src={order.listingImage} className="w-full h-full object-cover" />}
                      </div>
                      <div>
                        <div className="text-sm font-bold" style={{color: 'var(--text-primary)'}}>{order.listingTitle}</div>
                        <div className="text-xs text-slate-500">
                          {formatOrderTime(order.createdAt)} · {tradeStatusLabel[order.status] || order.status}
                        </div>
                      </div>
                   </div>
                   <div className="text-accent font-bold">{order.pricePoints} 积分</div>
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

type UserCenterModal = 'username' | 'password' | null;

const ModalShell: React.FC<{ title: string; onClose: () => void; children: React.ReactNode }> = ({
  title,
  onClose,
  children
}) => (
  <div className="fixed inset-0 z-[80] flex items-center justify-center px-6">
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
    <div className="relative w-full max-w-sm card-bg rounded-[24px] p-6 border border-theme shadow-2xl animate-fade-in-up">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{title}</h3>
        <button onClick={onClose} className="text-slate-500 hover:text-slate-300 p-1">
          关闭
        </button>
      </div>
      {children}
    </div>
  </div>
);

const PasswordModal: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
  }, [open]);

  const submit = async () => {
    setError('');
    if (!oldPassword || !newPassword || !confirmPassword) {
      setError('请完整填写密码信息');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('两次输入的新密码不一致');
      return;
    }
    setSaving(true);
    try {
      await userApi.changePassword(oldPassword, newPassword);
      window.alert('修改成功，请重新登录');
      await logout();
      navigate('/login');
    } catch (err: any) {
      setError(err.message || '修改失败');
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <ModalShell title="修改密码" onClose={onClose}>
      <div className="space-y-4">
        <div className="card-bg rounded-[24px] p-5 border border-theme">
          <label className="block text-xs text-slate-500 mb-2">旧密码</label>
          <input
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            className="w-full bg-[var(--bg-primary)] border border-theme rounded-xl px-4 py-3 text-sm outline-none text-[var(--text-primary)] focus:ring-2 focus:ring-amber-500/50 transition-all"
            placeholder="请输入旧密码"
          />
        </div>

        <div className="card-bg rounded-[24px] p-5 border border-theme">
          <label className="block text-xs text-slate-500 mb-2">新密码</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full bg-[var(--bg-primary)] border border-theme rounded-xl px-4 py-3 text-sm outline-none text-[var(--text-primary)] focus:ring-2 focus:ring-amber-500/50 transition-all"
            placeholder="请输入新密码"
          />
        </div>

        <div className="card-bg rounded-[24px] p-5 border border-theme">
          <label className="block text-xs text-slate-500 mb-2">确认新密码</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full bg-[var(--bg-primary)] border border-theme rounded-xl px-4 py-3 text-sm outline-none text-[var(--text-primary)] focus:ring-2 focus:ring-amber-500/50 transition-all"
            placeholder="请再次输入新密码"
          />
        </div>

        {error && (
          <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        <button
          onClick={submit}
          disabled={saving}
          className="w-full bg-gradient-to-r from-slate-800 to-slate-900 text-amber-500 py-4 rounded-2xl font-bold shadow-lg shadow-black/20 transition-all disabled:opacity-60"
        >
          {saving ? '提交中...' : '确认修改'}
        </button>
      </div>
    </ModalShell>
  );
};

const UsernameModal: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const { user, updateUser } = useAuth();
  const { refreshConversations } = useIm();
  const [username, setUsername] = useState(user?.username || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setUsername(user?.username || '');
    setError('');
  }, [open, user?.username]);

  const submit = async () => {
    const trimmed = username.trim();
    setError('');
    if (!trimmed) {
      setError('请输入用户名');
      return;
    }
    setSaving(true);
    try {
      const updated = await userApi.updateUsername(trimmed);
      updateUser({ username: updated?.username || trimmed });
      await refreshConversations().catch(() => null);
      window.alert('用户名已更新');
      onClose();
    } catch (err: any) {
      setError(err?.message || '修改失败');
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <ModalShell title="修改用户名" onClose={onClose}>
      <div className="space-y-4">
        <div className="card-bg rounded-[24px] p-5 border border-theme">
          <label className="block text-xs text-slate-500 mb-2">用户名</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-[var(--bg-primary)] border border-theme rounded-xl px-4 py-3 text-sm outline-none text-[var(--text-primary)] focus:ring-2 focus:ring-amber-500/50 transition-all"
            placeholder="请输入新用户名"
            maxLength={64}
          />
        </div>

        {error && (
          <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        <button
          onClick={submit}
          disabled={saving}
          className="w-full bg-gradient-to-r from-slate-800 to-slate-900 text-amber-500 py-4 rounded-2xl font-bold shadow-lg shadow-black/20 transition-all disabled:opacity-60"
        >
          {saving ? '提交中...' : '确认修改'}
        </button>
      </div>
    </ModalShell>
  );
};

const UserCenterMain: React.FC<{ initialModal?: UserCenterModal; onModalClose?: () => void }> = ({
  initialModal = null,
  onModalClose
}) => {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const [activeModal, setActiveModal] = useState<UserCenterModal>(initialModal);

  useEffect(() => {
    setActiveModal(initialModal);
  }, [initialModal]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleThemeChange = async (nextTheme: string) => {
    if (theme === nextTheme) {
      return;
    }
    const previousTheme = theme;
    setTheme(nextTheme as any);
    if (!user) {
      return;
    }
    updateUser({ theme: nextTheme });
    try {
      await userApi.updateTheme(nextTheme);
    } catch (err: any) {
      updateUser({ theme: previousTheme });
      setTheme(previousTheme as any);
      window.alert(err?.message || '主题保存失败');
    }
  };

  if (!user) return null;

  const handleModalClose = () => {
    setActiveModal(null);
    if (onModalClose) {
      onModalClose();
    }
  };

  const settingsItems = [
    { id: 'username', name: '修改用户名', icon: '✏️', action: () => setActiveModal('username') },
    { id: 'password', name: '修改密码', icon: '🔒', action: () => setActiveModal('password') },
    { id: 'realname', name: '实名认证', icon: '🆔', path: '/user/realname' },
    { id: 'feedback', name: '客服帮助', icon: '🎧', path: '/user/feedback' }
  ];

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
                   onClick={() => handleThemeChange(t.id)}
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
               {settingsItems.map((item, i) => (
                 <div
                   key={item.id}
                   onClick={() => {
                     if (item.action) {
                       item.action();
                     } else if (item.path) {
                       navigate(item.path);
                     }
                   }}
                   className={`p-4 flex items-center justify-between cursor-pointer hover:bg-[var(--bg-glass)] transition-colors ${i !== settingsItems.length - 1 ? 'border-b border-theme' : ''}`}
                 >
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

      <UsernameModal open={activeModal === 'username'} onClose={handleModalClose} />
      <PasswordModal open={activeModal === 'password'} onClose={handleModalClose} />
    </div>
  );
}

const UserCenter: React.FC<{ isEmbedded?: boolean }> = ({ isEmbedded = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!location.pathname.startsWith('/user')) {
      return;
    }
    if (!isLoading && !user) {
      navigate('/login');
    }
  }, [user, isLoading, navigate, location.pathname]);

  if (isLoading || !user) {
    return (
      <div className="app-bg min-h-full flex items-center justify-center">
         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (isEmbedded) {
    return <UserCenterMain />;
  }

  const normalizedPath = location.pathname.replace(/\/+$/, '') || '/';
  let content: React.ReactNode = <UserSubPage title="功能开发中" type="default" />;

  if (normalizedPath === '/user') {
    content = <UserCenterMain />;
  } else if (normalizedPath === '/user/game') {
    content = <UserSubPage title="我的游戏" type="game" />;
  } else if (normalizedPath === '/user/trade_record') {
    content = <UserSubPage title="交易记录" type="trade" />;
  } else if (normalizedPath === '/user/gift') {
    content = <UserSubPage title="我的礼包" type="gift" />;
  } else if (normalizedPath === '/user/username') {
    content = <UserCenterMain initialModal="username" onModalClose={() => navigate('/user')} />;
  } else if (normalizedPath === '/user/password') {
    content = <UserCenterMain initialModal="password" onModalClose={() => navigate('/user')} />;
  } else if (normalizedPath === '/user/feedback') {
    content = <UserSubPage title="反馈" type="default" />;
  }

  return <>{content}</>;
};

export default UserCenter;

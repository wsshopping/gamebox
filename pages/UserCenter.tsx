import React from 'react';
import { useNavigate } from 'react-router-dom';

const UserCenter: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-[#f8fafc] min-h-full">
      {/* Profile Header - Keep Dark for Premium Feel */}
      <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-6 pb-8 pt-10 relative overflow-hidden shadow-lg">
        {/* Abstract BG */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/20 rounded-full blur-3xl -mr-16 -mt-16"></div>

        <div className="flex items-center space-x-5 relative z-10">
          <div className="w-20 h-20 rounded-full p-[2px] bg-gradient-to-tr from-amber-300 via-yellow-500 to-amber-700 shadow-xl">
             <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden border-2 border-white/20">
                <img src="https://picsum.photos/100/100?random=user" alt="avatar" className="w-full h-full object-cover" />
             </div>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-black text-white tracking-tight">玩家_8839</h2>
            <p className="text-xs text-indigo-200 mb-3 font-mono">UID: 8839201</p>
            <div className="inline-flex items-center space-x-1 bg-white/10 border border-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
               <span className="text-amber-300 text-xs">👑</span>
               <span className="text-amber-200 text-[10px] font-bold tracking-widest uppercase">VIP 3 Platinum</span>
            </div>
          </div>
          <button className="text-white/70 bg-white/10 p-2 rounded-full border border-white/10 hover:bg-white/20 hover:text-white transition-colors" onClick={() => navigate('/set')}>
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </button>
        </div>
        
        {/* Stats */}
        <div className="flex justify-between mt-8 px-2 relative z-10">
          {[
            { label: '游戏', value: '12' },
            { label: '关注', value: '5' },
            { label: '帖子', value: '128' },
            { label: '粉丝', value: '2.5k' }
          ].map((stat) => (
             <div key={stat.label} className="text-center group cursor-pointer">
               <p className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors">{stat.value}</p>
               <p className="text-xs text-indigo-200 uppercase tracking-wide opacity-80">{stat.label}</p>
             </div>
          ))}
        </div>
      </div>

      {/* Assets Card */}
      <div className="px-5 -mt-6 relative z-20">
         <div className="bg-[#1e293b] rounded-2xl p-5 flex justify-between items-center border border-white/10 shadow-xl">
            <div>
              <p className="text-xs text-gray-400 font-medium tracking-wide mb-1">ASSET BALANCE</p>
              <p className="text-2xl font-black text-white tracking-tight">¥ 124<span className="text-lg text-gray-400 font-normal">.50</span></p>
            </div>
            <button className="bg-white text-gray-900 text-xs font-bold px-5 py-2.5 rounded-full hover:bg-gray-100 shadow-lg">我的钱包</button>
         </div>
      </div>

      {/* Menu List - White background */}
      <div className="p-5 space-y-4">
         {[
           { name: '我的游戏', icon: '🎮', path: '/user/game' },
           { name: '交易记录', icon: '📦', path: '/trade/record' },
           { name: '我的礼包', icon: '🎁', path: '/user/gift' },
           { name: '代金券', icon: '🎟', path: '/user/voucher' },
           { name: '实名认证', icon: '🆔', path: '/user/realname' },
           { name: '客服帮助', icon: '🎧', path: '/service' },
         ].map(item => (
           <div key={item.name} onClick={() => navigate(item.path)} className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center justify-between cursor-pointer hover:shadow-md transition-all group shadow-sm">
              <div className="flex items-center space-x-4">
                 <span className="text-xl opacity-80 group-hover:scale-110 transition-transform">{item.icon}</span>
                 <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{item.name}</span>
              </div>
              <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
           </div>
         ))}
      </div>

      <div className="px-5 pb-8">
        <button onClick={() => navigate('/login')} className="w-full bg-red-50 text-red-600 border border-red-100 py-3.5 rounded-2xl text-sm font-bold hover:bg-red-100 transition-all">
          退出登录
        </button>
      </div>
    </div>
  );
};

export default UserCenter;
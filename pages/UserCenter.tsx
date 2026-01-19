import React from 'react';
import { useNavigate } from 'react-router-dom';

const UserCenter: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-[#f8fafc] min-h-full">
      {/* 
         Header: "Black Card" Aesthetic
         Matte black texture with gold accents
      */}
      <div className="relative bg-[#0f172a] p-8 pt-12 pb-16 overflow-hidden rounded-b-[40px] shadow-2xl shadow-slate-200">
        {/* Decorative Circles */}
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-white/5 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-indigo-500/10 rounded-full blur-[60px] -ml-10 -mb-10 pointer-events-none"></div>
        
        {/* Content */}
        <div className="relative z-10 flex items-center space-x-6">
          <div className="relative group cursor-pointer">
             <div className="absolute -inset-1 bg-gradient-to-r from-amber-300 to-amber-600 rounded-full opacity-70 blur group-hover:opacity-100 transition duration-500"></div>
             <div className="relative w-20 h-20 rounded-full p-[3px] bg-[#0f172a]">
                <img src="https://picsum.photos/100/100?random=user" alt="avatar" className="w-full h-full rounded-full object-cover border-2 border-[#1e293b]" />
             </div>
             <div className="absolute bottom-0 right-0 bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md border-2 border-[#0f172a]">
               Lv.8
             </div>
          </div>
          
          <div className="flex-1">
            <h2 className="text-2xl font-black text-white tracking-tight mb-1">Player_8839</h2>
            <p className="text-slate-400 text-xs font-mono mb-3 tracking-wider">ID: 8839 2010</p>
            
            <div className="inline-flex items-center space-x-2 bg-slate-800/50 border border-slate-700/50 px-3 py-1 rounded-full backdrop-blur-md">
               <span className="text-amber-400 text-xs drop-shadow-md">♛</span>
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500 text-[10px] font-bold tracking-widest uppercase">VIP 3 Platinum</span>
            </div>
          </div>
          
          <button onClick={() => navigate('/set')} className="w-10 h-10 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-700 transition-all">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </button>
        </div>

        {/* Stats - Minimalist */}
        <div className="flex justify-between mt-8 px-4 relative z-10 border-t border-slate-800/50 pt-6">
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

      {/* 
         Assets Card 
         Floating overlap design, very clean
      */}
      <div className="px-6 -mt-8 relative z-20">
         <div className="bg-white rounded-[24px] p-6 flex justify-between items-center shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] border border-white">
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1 flex items-center">
                 <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2"></span>
                 Total Assets
              </p>
              <div className="flex items-baseline">
                <span className="text-xl font-medium text-slate-900 mr-1">¥</span>
                <span className="text-3xl font-black text-slate-900 tracking-tight">1,240</span>
                <span className="text-lg font-medium text-slate-400">.50</span>
              </div>
            </div>
            <button className="bg-slate-900 text-white text-xs font-bold px-6 py-3 rounded-2xl hover:bg-slate-800 hover:shadow-lg transition-all active:scale-95">
              Wallet
            </button>
         </div>
      </div>

      {/* Menu List - Grouped and Clean */}
      <div className="px-6 pt-8 pb-32 space-y-6">
         {/* Group 1 */}
         <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 pl-2">Entertainment</h4>
            <div className="bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-slate-50 overflow-hidden">
               {[
                 { name: '我的游戏', icon: '🎮', path: '/user/game' },
                 { name: '我的礼包', icon: '🎁', path: '/user/gift' },
                 { name: '交易记录', icon: '📦', path: '/trade/record' },
               ].map((item, i) => (
                 <div key={item.name} onClick={() => navigate(item.path)} className={`p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors ${i !== 2 ? 'border-b border-slate-50' : ''}`}>
                    <div className="flex items-center space-x-4">
                       <span className="text-lg opacity-70 w-8 text-center">{item.icon}</span>
                       <span className="text-sm font-semibold text-slate-700">{item.name}</span>
                    </div>
                    <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                 </div>
               ))}
            </div>
         </div>

         {/* Group 2 */}
         <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 pl-2">Settings & Support</h4>
            <div className="bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-slate-50 overflow-hidden">
               {[
                 { name: '代金券', icon: '🎟', path: '/user/voucher' },
                 { name: '实名认证', icon: '🆔', path: '/user/realname' },
                 { name: '客服帮助', icon: '🎧', path: '/service' },
               ].map((item, i) => (
                 <div key={item.name} onClick={() => navigate(item.path)} className={`p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors ${i !== 2 ? 'border-b border-slate-50' : ''}`}>
                    <div className="flex items-center space-x-4">
                       <span className="text-lg opacity-70 w-8 text-center">{item.icon}</span>
                       <span className="text-sm font-semibold text-slate-700">{item.name}</span>
                    </div>
                    <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                 </div>
               ))}
            </div>
         </div>

         <button onClick={() => navigate('/login')} className="w-full mt-4 text-rose-500 font-bold text-sm py-4 hover:bg-rose-50 rounded-2xl transition-colors">
            Log Out
         </button>
      </div>
    </div>
  );
};

export default UserCenter;
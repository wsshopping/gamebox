import React from 'react';
import { NavLink } from 'react-router-dom';

const BottomNav: React.FC = () => {
  const navItems = [
    { name: '首页', path: '/', icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
    )},
    { name: '游戏', path: '/game', icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" /></svg>
    )},
    { name: '社交', path: '/social', icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
    )},
    { name: '福利', path: '/screen-welfare', icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>
    )},
    { name: '我的', path: '/user', icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
    )},
  ];

  return (
    <div className="absolute bottom-0 left-0 w-full z-50">
      {/* 
        Premium Aesthetics:
        - Higher blur (backdrop-blur-2xl)
        - Subtle top border (border-white/40)
        - Pure white with slight transparency (bg-white/90)
        - Soft upward shadow (shadow-[0_-5px_20px_...])
      */}
      <div className="bg-white/85 backdrop-blur-2xl border-t border-white/50 shadow-[0_-10px_30px_rgba(0,0,0,0.03)] flex justify-between px-6 py-2 pb-8 relative">
        
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => `relative flex flex-col items-center justify-center w-full py-1 group ${isActive ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
          >
            {({ isActive }) => (
              <>
                 <div className={`relative transition-all duration-500 ease-out ${isActive ? '-translate-y-2' : 'translate-y-0'}`}>
                    {/* Active Background Glow - Soft and diffused */}
                    <div className={`absolute -inset-4 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 rounded-full blur-xl transition-all duration-500 ${isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}></div>
                    
                    {/* Icon Container - Scale change */}
                    <div className={`relative z-10 transition-transform duration-300 ${isActive ? 'scale-110 drop-shadow-sm' : 'scale-100'}`}>
                      {item.icon}
                    </div>

                    {/* Active Dot Indicator - Premium Minimalist */}
                    <div className={`absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full bg-slate-900 transition-all duration-500 ${isActive ? 'opacity-100 w-1.5 h-1.5' : 'opacity-0 w-0 h-0'}`}></div>
                 </div>
                 
                 <span className={`text-[9px] font-semibold tracking-wide mt-2 transition-all duration-500 absolute -bottom-3 ${isActive ? 'opacity-100 translate-y-0 text-slate-900' : 'opacity-0 translate-y-2 text-slate-400'}`}>
                    {item.name}
                 </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default BottomNav;
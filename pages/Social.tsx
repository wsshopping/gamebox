
import React, { useEffect, useMemo, useState } from 'react';
import Trade from './Trade';
import MessageList from './MessageList';
import Agency, { SuperAdminPage } from './Agency';
import { useAuth } from '../context/AuthContext';

const Social: React.FC = () => {
  const { user } = useAuth();
  const roleId = Number(user?.role?.id ?? user?.roleId ?? 0);
  const isSuperAdmin = roleId === 1;
  const isAgent = roleId === 2 || roleId === 3 || roleId === 4 || roleId === 5;
  const tabs = useMemo(() => {
    const base = ['trade', 'message'];
    if (isSuperAdmin || isAgent) {
      base.push('agency');
    }
    if (isSuperAdmin) {
      base.push('superadmin');
    }
    return base;
  }, [isAgent, isSuperAdmin]);
  const [activeTab, setActiveTab] = useState<'trade' | 'message' | 'agency' | 'superadmin'>(tabs[0] as any);
  const tabCount = tabs.length;
  const activeIndex = tabs.indexOf(activeTab);
  useEffect(() => {
    if (activeIndex === -1) {
      setActiveTab(tabs[0] as any);
    }
  }, [activeIndex, tabs]);
  const sliderWidth = `calc(${(100 / tabCount).toFixed(2)}% - 4px)`;
  const sliderLeft = `calc(${(100 / tabCount).toFixed(2)}% * ${activeIndex} + 2px)`;

  return (
    <div className="app-bg min-h-full pt-20 flex flex-col transition-colors duration-500">
      {/* Sticky Tab Header - Premium Dark Glass */}
      <div className="glass-bg fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md z-40 border-b border-theme pt-4 pb-3 transition-colors duration-500">
        <div className="flex justify-center px-4">
           <div className="relative flex w-full max-w-sm bg-[var(--bg-primary)] p-1 rounded-2xl border border-theme shadow-lg shadow-black/5">
             {/* Slider Background - Adaptive color */}
             <div 
               className="absolute top-1 bottom-1 bg-accent-color/20 rounded-xl shadow-sm border border-accent/20 transition-all duration-300 ease-out"
               style={{ width: sliderWidth, left: sliderLeft }}
             ></div>
             
             {tabs.map(tab => (
                 <button 
                   key={tab}
                   onClick={() => setActiveTab(tab as any)}
                   className={`relative flex-1 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 z-10 ${
                     activeTab === tab 
                     ? 'text-accent' 
                     : 'text-slate-500 hover:text-[var(--text-primary)]'
                   }`}
                 >
                   {tab === 'trade' ? '市场交易' : tab === 'message' ? '消息中心' : tab === 'agency' ? '代理中心' : '超管中心'}
                 </button>
             ))}
           </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1">
        {activeTab === 'trade' && <Trade isEmbedded={true} />}
        {activeTab === 'message' && <MessageList isEmbedded={true} />}
        {activeTab === 'agency' && <Agency />}
        {activeTab === 'superadmin' && <SuperAdminPage />}
      </div>
    </div>
  );
};

export default Social;


import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Task } from '../types';

const Welfare: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [reward, setReward] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
       setIsLoading(true);
       try {
         const data = await api.welfare.getTasks();
         setTasks(data);
       } finally {
         setIsLoading(false);
       }
    };
    fetchTasks();
  }, []);

  const handleDraw = async () => {
    if (isDrawing || reward) return;
    
    setIsDrawing(true);
    try {
      const result = await api.welfare.drawBlindBox();
      setReward(result);
    } finally {
      setIsDrawing(false);
    }
  };

  const resetBox = () => {
    setReward(null);
  };

  const handleClaim = async (taskId: string) => {
    // In a real app, we would optimistically update UI or re-fetch
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'claimed' } : t));
    await api.welfare.claimTask(taskId);
  };

  return (
    <div className="app-bg min-h-full">
      {/* Black Gold Premium Card Banner */}
      <div className="p-6 pt-10 pb-12">
        <div className="relative h-52 rounded-[32px] bg-gradient-to-br from-[var(--bg-card)] via-[var(--bg-primary)] to-[var(--bg-card)] p-8 overflow-hidden shadow-2xl shadow-black/30 border border-theme group">
           <div className="absolute inset-0 bg-gradient-to-tr from-accent-color/10 via-transparent to-purple-900/10 opacity-50"></div>
           <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] mix-blend-overlay"></div>
           {/* Gold Shine Animation */}
           <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-accent-color/10 to-transparent skew-x-12 group-hover:left-full transition-all duration-1000 ease-in-out"></div>

           <div className="relative z-10 flex flex-col h-full justify-between text-slate-800">
              <div className="flex justify-between items-start">
                 <div>
                    <h1 className="text-2xl font-black tracking-tight italic drop-shadow-md text-white">PLATINUM <span className="text-accent">VIP</span></h1>
                    <p className="text-accent font-bold tracking-[0.2em] uppercase mt-1 text-[10px] opacity-80">至尊会员中心</p>
                 </div>
                 <div className="w-10 h-10 rounded-full border border-theme flex items-center justify-center bg-black/20 backdrop-blur-sm shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                    <span className="text-xl">💎</span>
                 </div>
              </div>
              
              <div className="flex items-end justify-between">
                 <div>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1">当前积分余额</p>
                    <p className="text-4xl font-mono font-bold text-accent tracking-tighter drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]">1,250</p>
                 </div>
                 <button className="bg-accent-gradient text-black px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg hover:brightness-110 transition-all border border-theme active:scale-95">
                    积分兑换
                 </button>
              </div>
           </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="-mt-10 px-6 pb-24 relative z-10">
        {/* Blind Box Section - Cosmic Theme */}
        <div className="card-bg rounded-[24px] border border-theme p-1 mb-6 shadow-lg relative overflow-hidden group">
          <div className="bg-gradient-to-br from-[var(--bg-card)] to-[var(--bg-primary)] rounded-[20px] p-6 relative overflow-hidden text-center">
             <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30"></div>
             <div className="absolute top-[-50px] right-[-50px] w-40 h-40 bg-purple-600/10 rounded-full blur-[60px]"></div>
             <div className="absolute bottom-[-20px] left-[-20px] w-32 h-32 bg-accent-color/10 rounded-full blur-[50px]"></div>

             <div className="relative z-10">
                <div className="flex justify-center items-center space-x-2 mb-4">
                  <span className="text-accent text-lg animate-pulse">✨</span>
                  <h3 className="text-white font-black text-lg tracking-wide uppercase italic">幸运盲盒</h3>
                  <span className="text-accent text-lg animate-pulse">✨</span>
                </div>

                <div className="h-40 flex items-center justify-center relative mb-4">
                  {reward ? (
                    <div className="animate-fade-in-up">
                       <div className="text-5xl mb-2 drop-shadow-[0_0_20px_rgba(245,158,11,0.6)]">🎁</div>
                       <p className="text-accent font-bold text-lg">{reward}</p>
                       <button onClick={resetBox} className="mt-3 text-[10px] text-slate-400 underline hover:text-white">再来一次</button>
                    </div>
                  ) : (
                    <div 
                      onClick={handleDraw}
                      className={`cursor-pointer transition-all duration-300 ${isDrawing ? 'animate-bounce' : 'hover:scale-105'}`}
                    >
                       <div className="text-[80px] drop-shadow-[0_0_25px_rgba(147,51,234,0.5)] transform transition-transform">
                         📦
                       </div>
                       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-purple-500/20 rounded-full blur-2xl -z-10"></div>
                    </div>
                  )}
                </div>

                {!reward && (
                  <button 
                    onClick={handleDraw}
                    disabled={isDrawing}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black text-sm py-3.5 rounded-xl shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] active:scale-95 transition-all flex items-center justify-center space-x-2 border border-white/10"
                  >
                    {isDrawing ? (
                      <span>开启中...</span>
                    ) : (
                      <>
                        <span>开启盲盒</span>
                        <span className="bg-black/20 px-1.5 py-0.5 rounded text-[10px] font-mono border border-white/10">-50 💎</span>
                      </>
                    )}
                  </button>
                )}
             </div>
          </div>
        </div>
        
        {/* Daily Sign In */}
        <div className="card-bg rounded-[24px] border border-theme p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
             <h3 className="font-bold text-lg" style={{color: 'var(--text-primary)'}}>每日签到</h3>
             <span className="text-xs font-bold text-accent bg-black/20 border border-theme px-2 py-1 rounded-md">赢取好礼</span>
          </div>
          
          <div className="flex justify-between">
            {[1, 2, 3, 4, 5, 6, 7].map((day) => {
              const active = day <= 3;
              return (
                <div key={day} className={`flex flex-col items-center group cursor-pointer`}>
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm mb-2 transition-all border-2 ${
                     active 
                     ? 'bg-accent-gradient border-transparent text-black shadow-sm' 
                     : 'bg-transparent border-slate-700 text-slate-500 group-hover:border-slate-500'
                  }`}>
                     {active ? '✓' : ''}
                  </div>
                  <span className={`text-[10px] font-bold ${active ? 'text-accent' : 'text-slate-600'}`}>{day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Task List */}
        <div className="space-y-4">
           <h3 className="font-bold text-lg px-2" style={{color: 'var(--text-primary)'}}>今日任务</h3>
           {isLoading ? (
             [1, 2].map(i => (
               <div key={i} className="card-bg p-5 rounded-[20px] h-20 animate-pulse border border-theme"></div>
             ))
           ) : (
             tasks.map((task, index) => (
              <div key={task.id} className="card-bg p-5 rounded-[20px] shadow-sm border border-theme flex items-center justify-between hover:bg-[var(--bg-primary)] hover:border-theme transition-all">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-inner border border-theme ${
                      index === 0 ? 'bg-indigo-500/10 text-indigo-400' : 
                      index === 1 ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'
                  }`}>
                    {task.icon}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold" style={{color: 'var(--text-primary)'}}>{task.title}</h4>
                    <div className="flex items-center mt-1">
                       <span className="text-[10px] font-bold bg-accent-color/10 text-accent px-1.5 py-0.5 rounded border border-theme">+{task.reward}</span>
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={() => task.status === 'completed' ? handleClaim(task.id) : null}
                  disabled={task.status === 'claimed'}
                  className={`text-xs px-5 py-2.5 rounded-full font-bold transition-all ${
                    task.status === 'completed' 
                      ? 'bg-accent-gradient text-black shadow-lg hover:brightness-110' 
                      : task.status === 'claimed'
                      ? 'bg-slate-800 text-slate-500 border border-theme'
                      : 'bg-transparent border-2 border-slate-600 text-slate-400 hover:border-slate-400 hover:text-slate-200'
                  }`}
                >
                  {task.status === 'claimed' ? '已领' : task.status === 'completed' ? '领取' : '去完成'}
                </button>
              </div>
            ))
           )}
        </div>
      </div>
    </div>
  );
};

export default Welfare;

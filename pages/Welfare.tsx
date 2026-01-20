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
    <div className="bg-[#f8fafc] min-h-full">
      {/* Platinum Card Banner */}
      <div className="p-6 pt-10 pb-12">
        <div className="relative h-52 rounded-[32px] bg-gradient-to-br from-slate-300 via-slate-100 to-slate-300 p-8 overflow-hidden shadow-2xl shadow-slate-200 border border-white">
           <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent transform rotate-45 scale-150"></div>
           <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>

           <div className="relative z-10 flex flex-col h-full justify-between text-slate-800">
              <div className="flex justify-between items-start">
                 <div>
                    <h1 className="text-2xl font-black tracking-tight text-slate-900 italic">PLATINUM</h1>
                    <p className="text-slate-500 text-[10px] font-bold tracking-[0.2em] uppercase mt-1">至尊会员中心</p>
                 </div>
                 <div className="w-10 h-10 rounded-full border-2 border-slate-800/10 flex items-center justify-center">
                    <span className="text-2xl">💎</span>
                 </div>
              </div>
              
              <div className="flex items-end justify-between">
                 <div>
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-1">当前余额</p>
                    <p className="text-4xl font-mono font-bold text-slate-900 tracking-tighter">1,250</p>
                 </div>
                 <button className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg hover:bg-slate-800 transition-colors">
                    积分兑换
                 </button>
              </div>
           </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="-mt-10 px-6 pb-24 relative z-10">
        {/* Blind Box Section */}
        <div className="bg-white rounded-[24px] border border-slate-50 p-1 mb-6 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] relative overflow-hidden group">
          <div className="bg-gradient-to-br from-[#1e1b4b] to-[#312e81] rounded-[20px] p-6 relative overflow-hidden text-center">
             <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
             <div className="absolute top-[-50px] right-[-50px] w-40 h-40 bg-purple-500/30 rounded-full blur-[50px]"></div>
             <div className="absolute bottom-[-20px] left-[-20px] w-32 h-32 bg-indigo-500/30 rounded-full blur-[40px]"></div>

             <div className="relative z-10">
                <div className="flex justify-center items-center space-x-2 mb-4">
                  <span className="text-amber-400 text-lg">✨</span>
                  <h3 className="text-white font-black text-lg tracking-wide uppercase italic">幸运盲盒</h3>
                  <span className="text-amber-400 text-lg">✨</span>
                </div>

                <div className="h-40 flex items-center justify-center relative mb-4">
                  {reward ? (
                    <div className="animate-fade-in-up">
                       <div className="text-5xl mb-2">🎁</div>
                       <p className="text-amber-300 font-bold text-lg">{reward}</p>
                       <button onClick={resetBox} className="mt-3 text-[10px] text-white/50 underline hover:text-white">再来一次</button>
                    </div>
                  ) : (
                    <div 
                      onClick={handleDraw}
                      className={`cursor-pointer transition-all duration-300 ${isDrawing ? 'animate-bounce' : 'hover:scale-105'}`}
                    >
                       <div className="text-[80px] drop-shadow-[0_0_15px_rgba(168,85,247,0.5)] transform transition-transform">
                         📦
                       </div>
                       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-purple-500/20 rounded-full blur-xl -z-10"></div>
                    </div>
                  )}
                </div>

                {!reward && (
                  <button 
                    onClick={handleDraw}
                    disabled={isDrawing}
                    className="w-full bg-gradient-to-r from-amber-300 to-amber-500 text-indigo-950 font-black text-sm py-3.5 rounded-xl shadow-[0_0_20px_rgba(251,191,36,0.3)] hover:shadow-[0_0_30px_rgba(251,191,36,0.5)] active:scale-95 transition-all flex items-center justify-center space-x-2"
                  >
                    {isDrawing ? (
                      <span>开启中...</span>
                    ) : (
                      <>
                        <span>开启盲盒</span>
                        <span className="bg-black/10 px-1.5 py-0.5 rounded text-[10px] font-mono">-50 💎</span>
                      </>
                    )}
                  </button>
                )}
             </div>
          </div>
        </div>
        
        {/* Daily Sign In */}
        <div className="bg-white rounded-[24px] border border-slate-50 p-6 mb-6 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)]">
          <div className="flex justify-between items-center mb-6">
             <h3 className="font-bold text-slate-900 text-lg">每日签到</h3>
             <span className="text-xs font-bold text-amber-500 bg-amber-50 px-2 py-1 rounded-md">赢取好礼</span>
          </div>
          
          <div className="flex justify-between">
            {[1, 2, 3, 4, 5, 6, 7].map((day) => {
              const active = day <= 3;
              return (
                <div key={day} className={`flex flex-col items-center group cursor-pointer`}>
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm mb-2 transition-all border-2 ${
                     active 
                     ? 'bg-amber-400 border-amber-400 text-white shadow-md shadow-amber-200' 
                     : 'bg-transparent border-slate-100 text-slate-300'
                  }`}>
                     {active ? '✓' : ''}
                  </div>
                  <span className={`text-[10px] font-bold ${active ? 'text-amber-500' : 'text-slate-300'}`}>{day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Task List */}
        <div className="space-y-4">
           <h3 className="font-bold text-slate-900 text-lg px-2">今日任务</h3>
           {isLoading ? (
             [1, 2].map(i => (
               <div key={i} className="bg-white p-5 rounded-[20px] h-20 animate-pulse"></div>
             ))
           ) : (
             tasks.map((task, index) => (
              <div key={task.id} className="bg-white p-5 rounded-[20px] shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-slate-50 flex items-center justify-between hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-sm ${
                      index === 0 ? 'bg-indigo-50 text-indigo-500' : 
                      index === 1 ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-500'
                  }`}>
                    {task.icon}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{task.title}</h4>
                    <div className="flex items-center mt-1">
                       <span className="text-[10px] font-bold bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded border border-amber-100">+{task.reward}</span>
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={() => task.status === 'completed' ? handleClaim(task.id) : null}
                  disabled={task.status === 'claimed'}
                  className={`text-xs px-5 py-2.5 rounded-full font-bold transition-all ${
                    task.status === 'completed' 
                      ? 'bg-slate-900 text-white shadow-lg shadow-slate-200 hover:bg-slate-800' 
                      : task.status === 'claimed'
                      ? 'bg-slate-100 text-slate-400'
                      : 'bg-white border-2 border-slate-100 text-slate-400 hover:border-slate-300 hover:text-slate-600'
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
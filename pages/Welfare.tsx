import React from 'react';
import { TASKS } from '../services/mockData';

const Welfare: React.FC = () => {
  return (
    <div className="bg-[#020617] min-h-full">
      {/* Header Banner - Credit Card Style */}
      <div className="p-5 pt-8 pb-12">
        <div className="relative h-48 rounded-3xl bg-gradient-to-br from-indigo-900 to-violet-800 p-6 overflow-hidden shadow-2xl border border-white/10">
           {/* Decorative circles */}
           <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
           <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/20 rounded-full blur-2xl -ml-10 -mb-10"></div>
           
           <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="flex justify-between items-start">
                 <div>
                    <h1 className="text-2xl font-black text-white tracking-tight">福利中心</h1>
                    <p className="text-indigo-200 text-xs font-medium tracking-wide opacity-80">WELFARE CENTER</p>
                 </div>
                 <span className="text-2xl">💎</span>
              </div>
              
              <div className="flex items-end justify-between">
                 <div>
                    <p className="text-[10px] text-indigo-300 uppercase tracking-widest mb-1">Total Points</p>
                    <p className="text-3xl font-mono font-bold text-white tracking-tight">1,250</p>
                 </div>
                 <button className="bg-amber-400 text-amber-900 px-4 py-2 rounded-xl text-xs font-bold shadow-lg hover:bg-amber-300 transition-colors">
                    立即兑换
                 </button>
              </div>
           </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="-mt-8 px-5 pb-20 relative z-10">
        {/* Daily Sign In */}
        <div className="bg-[#111827]/80 backdrop-blur-md rounded-3xl border border-white/5 p-5 mb-5 shadow-lg">
          <h3 className="font-bold text-gray-200 mb-4 flex items-center">
             <span className="w-1 h-4 bg-amber-500 rounded-full mr-2"></span>
             每日签到
          </h3>
          <div className="flex justify-between">
            {[1, 2, 3, 4, 5, 6, 7].map((day) => (
              <div key={day} className={`flex flex-col items-center group cursor-pointer`}>
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm mb-2 transition-all border ${
                   day <= 3 
                   ? 'bg-amber-500 text-amber-950 border-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.4)]' 
                   : 'bg-white/5 text-gray-500 border-white/5 group-hover:border-white/20'
                }`}>
                   {day <= 3 ? '✓' : '🎁'}
                </div>
                <span className={`text-[10px] ${day <= 3 ? 'text-amber-500' : 'text-gray-600'}`}>Day {day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Task List */}
        <div className="bg-[#111827]/80 backdrop-blur-md rounded-3xl border border-white/5 overflow-hidden shadow-lg">
          <div className="p-5 border-b border-white/5">
             <h3 className="font-bold text-gray-200 flex items-center">
                <span className="w-1 h-4 bg-indigo-500 rounded-full mr-2"></span>
                每日任务
             </h3>
          </div>
          <div>
            {TASKS.map((task, index) => (
              <div key={task.id} className={`p-4 flex items-center justify-between hover:bg-white/5 transition-colors ${index !== TASKS.length - 1 ? 'border-b border-white/5' : ''}`}>
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-lg border border-indigo-500/20">
                    {task.icon}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-200">{task.title}</h4>
                    <p className="text-xs text-amber-400 font-medium mt-0.5">+{task.reward}</p>
                  </div>
                </div>
                <button 
                  disabled={task.status === 'claimed'}
                  className={`text-xs px-4 py-2 rounded-full font-bold transition-all ${
                    task.status === 'completed' 
                      ? 'bg-indigo-600 text-white shadow-[0_0_10px_rgba(79,70,229,0.4)] hover:bg-indigo-500' 
                      : task.status === 'claimed'
                      ? 'bg-white/5 text-gray-500 border border-white/5'
                      : 'border border-indigo-500 text-indigo-400 hover:bg-indigo-500/10'
                  }`}
                >
                  {task.status === 'claimed' ? '已领' : task.status === 'completed' ? '领取' : '去完成'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Welfare;
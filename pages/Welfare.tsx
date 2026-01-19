import React from 'react';
import { TASKS } from '../services/mockData';

const Welfare: React.FC = () => {
  return (
    <div className="bg-[#f8fafc] min-h-full">
      {/* Header Banner - Credit Card Style */}
      <div className="p-5 pt-8 pb-12">
        <div className="relative h-48 rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-700 p-6 overflow-hidden shadow-xl shadow-indigo-200 border border-white/20">
           {/* Decorative circles */}
           <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
           <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full blur-2xl -ml-10 -mb-10"></div>
           
           <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="flex justify-between items-start">
                 <div>
                    <h1 className="text-2xl font-black text-white tracking-tight">福利中心</h1>
                    <p className="text-indigo-100 text-xs font-medium tracking-wide opacity-80">WELFARE CENTER</p>
                 </div>
                 <span className="text-2xl">💎</span>
              </div>
              
              <div className="flex items-end justify-between">
                 <div>
                    <p className="text-[10px] text-indigo-100 uppercase tracking-widest mb-1">Total Points</p>
                    <p className="text-3xl font-mono font-bold text-white tracking-tight">1,250</p>
                 </div>
                 <button className="bg-white text-indigo-900 px-4 py-2 rounded-xl text-xs font-bold shadow-lg hover:bg-gray-50 transition-colors">
                    立即兑换
                 </button>
              </div>
           </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="-mt-8 px-5 pb-20 relative z-10">
        {/* Daily Sign In */}
        <div className="bg-white rounded-3xl border border-gray-100 p-5 mb-5 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center">
             <span className="w-1 h-4 bg-amber-500 rounded-full mr-2"></span>
             每日签到
          </h3>
          <div className="flex justify-between">
            {[1, 2, 3, 4, 5, 6, 7].map((day) => (
              <div key={day} className={`flex flex-col items-center group cursor-pointer`}>
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm mb-2 transition-all border ${
                   day <= 3 
                   ? 'bg-amber-100 text-amber-700 border-amber-200' 
                   : 'bg-gray-50 text-gray-400 border-gray-100 group-hover:border-gray-200'
                }`}>
                   {day <= 3 ? '✓' : '🎁'}
                </div>
                <span className={`text-[10px] ${day <= 3 ? 'text-amber-600' : 'text-gray-400'}`}>Day {day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Task List */}
        <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="p-5 border-b border-gray-50">
             <h3 className="font-bold text-gray-800 flex items-center">
                <span className="w-1 h-4 bg-indigo-500 rounded-full mr-2"></span>
                每日任务
             </h3>
          </div>
          <div>
            {TASKS.map((task, index) => (
              <div key={task.id} className={`p-4 flex items-center justify-between hover:bg-gray-50 transition-colors ${index !== TASKS.length - 1 ? 'border-b border-gray-50' : ''}`}>
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-lg text-indigo-500">
                    {task.icon}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-800">{task.title}</h4>
                    <p className="text-xs text-amber-500 font-medium mt-0.5">+{task.reward}</p>
                  </div>
                </div>
                <button 
                  disabled={task.status === 'claimed'}
                  className={`text-xs px-4 py-2 rounded-full font-bold transition-all ${
                    task.status === 'completed' 
                      ? 'bg-indigo-600 text-white shadow-md hover:bg-indigo-700' 
                      : task.status === 'claimed'
                      ? 'bg-gray-100 text-gray-400 border border-gray-200'
                      : 'border border-indigo-500 text-indigo-600 hover:bg-indigo-50'
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
import React from 'react';
import { TASKS } from '../services/mockData';

const Welfare: React.FC = () => {
  return (
    <div className="bg-gray-50 min-h-full">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-6 text-white pb-12">
        <h1 className="text-2xl font-bold mb-1">福利中心</h1>
        <p className="text-indigo-200 text-sm">完成任务赢取积分，兑换超值好礼。</p>
        
        <div className="mt-6 flex items-center justify-between bg-white/10 rounded-lg p-4 backdrop-blur-sm">
          <div>
            <p className="text-xs text-indigo-200">我的积分</p>
            <p className="text-2xl font-bold">1,250</p>
          </div>
          <button className="bg-yellow-400 text-yellow-900 px-4 py-1.5 rounded-full text-xs font-bold shadow-md hover:bg-yellow-300">
            去兑换
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="-mt-6 px-4 pb-4">
        {/* Daily Sign In */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
          <h3 className="font-bold text-gray-800 mb-3">每日签到</h3>
          <div className="flex justify-between">
            {[1, 2, 3, 4, 5, 6, 7].map((day) => (
              <div key={day} className={`flex flex-col items-center p-2 rounded-lg ${day <= 3 ? 'bg-blue-50' : 'bg-gray-50'}`}>
                <span className="text-[10px] text-gray-500 mb-1">第{day}天</span>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${day <= 3 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                   {day <= 3 ? '✓' : '🎁'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Task List */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100">
             <h3 className="font-bold text-gray-800">每日任务</h3>
          </div>
          <div>
            {TASKS.map((task, index) => (
              <div key={task.id} className={`p-4 flex items-center justify-between ${index !== TASKS.length - 1 ? 'border-b border-gray-50' : ''}`}>
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{task.icon}</div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">{task.title}</h4>
                    <p className="text-xs text-yellow-600 font-medium">+{task.reward}</p>
                  </div>
                </div>
                <button 
                  disabled={task.status === 'claimed'}
                  className={`text-xs px-3 py-1.5 rounded-full border ${
                    task.status === 'completed' 
                      ? 'bg-blue-600 text-white border-blue-600' 
                      : task.status === 'claimed'
                      ? 'bg-gray-100 text-gray-400 border-gray-100'
                      : 'bg-white text-blue-600 border-blue-600'
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
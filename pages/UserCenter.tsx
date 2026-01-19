import React from 'react';
import { useNavigate } from 'react-router-dom';

const UserCenter: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-gray-50 min-h-full">
      {/* Profile Header */}
      <div className="bg-white p-6 pb-8">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-400 to-blue-600 p-0.5">
             <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                <img src="https://picsum.photos/100/100?random=user" alt="avatar" className="w-full h-full object-cover" />
             </div>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">玩家_8839</h2>
            <p className="text-xs text-gray-500 mb-2">ID: 8839201</p>
            <span className="bg-yellow-100 text-yellow-700 text-[10px] px-2 py-0.5 rounded-full font-bold">VIP 3</span>
          </div>
          <button className="text-gray-400" onClick={() => navigate('/set')}>
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </button>
        </div>
        
        {/* Stats */}
        <div className="flex justify-between mt-6 px-4">
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900">12</p>
            <p className="text-xs text-gray-500">游戏</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900">5</p>
            <p className="text-xs text-gray-500">关注</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900">128</p>
            <p className="text-xs text-gray-500">帖子</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900">2.5k</p>
            <p className="text-xs text-gray-500">粉丝</p>
          </div>
        </div>
      </div>

      {/* Assets */}
      <div className="px-4 -mt-4">
         <div className="bg-white rounded-xl shadow-sm p-4 flex justify-between items-center">
            <div>
              <p className="text-xs text-gray-500">平台币余额</p>
              <p className="text-xl font-bold text-gray-900">¥124.50</p>
            </div>
            <button className="bg-blue-600 text-white text-sm px-4 py-1.5 rounded-full hover:bg-blue-700">钱包</button>
         </div>
      </div>

      {/* Menu List */}
      <div className="p-4 space-y-3">
         {[
           { name: '我的游戏', icon: '🎮', path: '/user/game' },
           { name: '交易记录', icon: '📦', path: '/trade/record' },
           { name: '我的礼包', icon: '🎁', path: '/user/gift' },
           { name: '代金券', icon: '🎟', path: '/user/voucher' },
           { name: '实名认证', icon: '🆔', path: '/user/realname' },
           { name: '客服帮助', icon: '🎧', path: '/service' },
         ].map(item => (
           <div key={item.name} onClick={() => navigate(item.path)} className="bg-white p-3.5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                 <span className="text-lg">{item.icon}</span>
                 <span className="text-sm font-medium text-gray-700">{item.name}</span>
              </div>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
           </div>
         ))}
      </div>

      <div className="p-4">
        <button onClick={() => navigate('/login')} className="w-full bg-red-50 text-red-600 py-3 rounded-xl text-sm font-semibold hover:bg-red-100">
          退出登录
        </button>
      </div>
    </div>
  );
};

export default UserCenter;
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock login logic
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center px-8">
      <div className="mb-8">
        <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl mb-4">G</div>
        <h1 className="text-2xl font-bold text-gray-900">欢迎回来</h1>
        <p className="text-gray-500 text-sm mt-1">登录 GameBox 开启游戏之旅</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">账号 / 手机号</label>
          <input type="text" className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-blue-600 transition-colors" placeholder="请输入账号" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">密码</label>
          <input type="password" className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-blue-600 transition-colors" placeholder="••••••••" />
        </div>
        
        <div className="flex justify-end">
           <span className="text-xs text-blue-600">忘记密码？</span>
        </div>

        <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all">
          登 录
        </button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-xs text-gray-400">第三方登录</p>
        <div className="flex justify-center space-x-4 mt-4">
           <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200">微信</button>
           <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200">QQ</button>
        </div>
      </div>
      
      <div className="mt-8 text-center text-xs text-gray-500">
        还没有账号？ <span className="text-blue-600 font-bold">立即注册</span>
      </div>
    </div>
  );
};

export default Login;
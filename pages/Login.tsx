import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({ account: '', password: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.account || !formData.password) {
      setError('请输入账号和密码');
      return;
    }
    
    setError('');
    setIsSubmitting(true);

    try {
      await login(formData.account, formData.password);
      navigate('/user'); // Redirect to user center on success
    } catch (err: any) {
      setError(err.message || '登录失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center px-8">
      <div className="mb-8 animate-fade-in-up">
        <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mb-4 shadow-lg shadow-blue-200">G</div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">欢迎回来</h1>
        <p className="text-gray-500 text-sm mt-2">登录 GameBox Pro 开启游戏之旅</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-6 animate-fade-in-up delay-100">
        {error && (
          <div className="bg-red-50 text-red-500 text-xs px-4 py-3 rounded-xl border border-red-100 flex items-center">
            <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-900 mb-1.5 ml-1">账号 / 手机号</label>
            <div className="bg-gray-50 rounded-2xl px-4 py-3 border border-transparent focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-500/10 transition-all">
              <input 
                type="text" 
                value={formData.account}
                onChange={(e) => setFormData({...formData, account: e.target.value})}
                className="w-full bg-transparent border-none outline-none text-sm text-gray-900 placeholder-gray-400 font-medium" 
                placeholder="请输入用户名或手机号" 
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-900 mb-1.5 ml-1">密码</label>
            <div className="bg-gray-50 rounded-2xl px-4 py-3 border border-transparent focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-500/10 transition-all">
              <input 
                type="password" 
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full bg-transparent border-none outline-none text-sm text-gray-900 placeholder-gray-400 font-medium" 
                placeholder="••••••••" 
              />
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
           <button type="button" className="text-xs text-blue-600 font-semibold hover:text-blue-700">忘记密码？</button>
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting}
          className={`w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-2xl font-bold shadow-xl shadow-blue-200 transition-all flex items-center justify-center ${isSubmitting ? 'opacity-70 cursor-not-allowed scale-[0.98]' : 'hover:scale-[1.02] hover:shadow-2xl'}`}
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              登录中...
            </>
          ) : '登 录'}
        </button>
      </form>

      <div className="mt-10 text-center animate-fade-in-up delay-200">
        <p className="text-xs text-gray-400 mb-4">或者使用第三方账号</p>
        <div className="flex justify-center space-x-4">
           <button className="w-12 h-12 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-600 hover:bg-green-50 hover:text-green-600 hover:border-green-200 transition-colors">
              <span className="text-xs font-bold">微信</span>
           </button>
           <button className="w-12 h-12 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors">
              <span className="text-xs font-bold">QQ</span>
           </button>
        </div>
      </div>
      
      <div className="mt-8 text-center text-xs text-gray-500 pb-8">
        还没有账号？ <span onClick={() => navigate('/register')} className="text-blue-600 font-bold cursor-pointer hover:underline">立即注册</span>
      </div>
    </div>
  );
};

export default Login;
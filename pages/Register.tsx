import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [formData, setFormData] = useState({ 
    username: '', 
    phone: '', 
    password: '', 
    confirmPassword: '' 
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.username || !formData.phone || !formData.password) {
      setError('请填写所有必填项');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }
    if (formData.password.length < 6) {
      setError('密码长度至少为 6 位');
      return;
    }
    
    setIsSubmitting(true);

    try {
      await register(formData.username, formData.phone, formData.password);
      // Register logic automatically logs user in via AuthContext
      navigate('/user'); 
    } catch (err: any) {
      setError(err.message || '注册失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center px-8">
      {/* Back Button */}
      <button onClick={() => navigate('/login')} className="absolute top-6 left-6 text-gray-400 hover:text-gray-900 transition-colors">
         <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
      </button>

      <div className="mb-8 animate-fade-in-up">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">创建账号</h1>
        <p className="text-gray-500 text-sm mt-2">免费加入 GameBox Pro，畅享游戏世界</p>
      </div>

      <form onSubmit={handleRegister} className="space-y-5 animate-fade-in-up delay-100">
        {error && (
          <div className="bg-red-50 text-red-500 text-xs px-4 py-3 rounded-xl border border-red-100 flex items-center">
            <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {error}
          </div>
        )}

        <div>
           <label className="block text-xs font-bold text-gray-900 mb-1.5 ml-1">用户名</label>
           <div className="bg-gray-50 rounded-2xl px-4 py-3 border border-transparent focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-500/10 transition-all">
             <input 
               type="text" 
               value={formData.username}
               onChange={(e) => setFormData({...formData, username: e.target.value})}
               className="w-full bg-transparent border-none outline-none text-sm text-gray-900 placeholder-gray-400 font-medium" 
               placeholder="取个响亮的名字" 
             />
           </div>
        </div>

        <div>
           <label className="block text-xs font-bold text-gray-900 mb-1.5 ml-1">手机号</label>
           <div className="bg-gray-50 rounded-2xl px-4 py-3 border border-transparent focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-500/10 transition-all">
             <input 
               type="tel" 
               value={formData.phone}
               onChange={(e) => setFormData({...formData, phone: e.target.value})}
               className="w-full bg-transparent border-none outline-none text-sm text-gray-900 placeholder-gray-400 font-medium" 
               placeholder="用于登录和找回密码" 
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
               placeholder="至少6位" 
             />
           </div>
        </div>

        <div>
           <label className="block text-xs font-bold text-gray-900 mb-1.5 ml-1">确认密码</label>
           <div className="bg-gray-50 rounded-2xl px-4 py-3 border border-transparent focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-500/10 transition-all">
             <input 
               type="password" 
               value={formData.confirmPassword}
               onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
               className="w-full bg-transparent border-none outline-none text-sm text-gray-900 placeholder-gray-400 font-medium" 
               placeholder="再次输入密码" 
             />
           </div>
        </div>
        
        <div className="flex items-center pt-2">
           <input type="checkbox" id="terms" className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" required />
           <label htmlFor="terms" className="ml-2 text-xs text-gray-500">
             我已阅读并同意 <span className="text-blue-600 font-bold">《用户协议》</span> 和 <span className="text-blue-600 font-bold">《隐私政策》</span>
           </label>
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting}
          className={`w-full bg-slate-900 text-white py-4 rounded-2xl font-bold shadow-xl shadow-slate-200 transition-all flex items-center justify-center ${isSubmitting ? 'opacity-70 cursor-not-allowed scale-[0.98]' : 'hover:scale-[1.02] hover:shadow-2xl'}`}
        >
          {isSubmitting ? '注册中...' : '立即注册'}
        </button>
      </form>
      
      <div className="mt-8 text-center text-xs text-gray-500 pb-8">
        已有账号？ <span onClick={() => navigate('/login')} className="text-blue-600 font-bold cursor-pointer hover:underline">直接登录</span>
      </div>
    </div>
  );
};

export default Register;
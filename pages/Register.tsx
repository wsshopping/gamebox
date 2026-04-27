import React from 'react';
import { useNavigate } from 'react-router-dom';
import RegisterForm from '../components/RegisterForm';

const Register: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen app-bg flex flex-col justify-center px-8 transition-colors duration-500">
      <button onClick={() => navigate('/login')} className="absolute top-6 left-6 text-slate-400 hover:text-[var(--text-primary)] transition-colors">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
      </button>

      <RegisterForm onSuccess={() => navigate('/user')} />

      <div className="mt-8 text-center text-xs text-slate-500 pb-8">
        已有账号？ <span onClick={() => navigate('/login')} className="text-accent font-bold cursor-pointer hover:underline">直接登录</span>
      </div>
    </div>
  );
};

export default Register;

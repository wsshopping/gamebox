
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/auth';

type LoginHistoryItem = {
  phone: string;
  password: string;
  updatedAt: number;
};

const LOGIN_HISTORY_KEY = 'portal_login_history_v1';
const LOGIN_HISTORY_LIMIT = 8;

const readLoginHistory = (): LoginHistoryItem[] => {
  try {
    const raw = localStorage.getItem(LOGIN_HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item) => item && typeof item.phone === 'string' && typeof item.password === 'string')
      .map((item) => ({
        phone: String(item.phone).slice(0, 32),
        password: String(item.password).slice(0, 128),
        updatedAt: Number(item.updatedAt || 0)
      }))
      .filter((item) => item.phone)
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, LOGIN_HISTORY_LIMIT);
  } catch (e) {
    return [];
  }
};

const writeLoginHistory = (list: LoginHistoryItem[]) => {
  localStorage.setItem(LOGIN_HISTORY_KEY, JSON.stringify(list.slice(0, LOGIN_HISTORY_LIMIT)));
};

const upsertLoginHistory = (phone: string, password: string) => {
  const cleanPhone = phone.trim();
  if (!cleanPhone) return;
  const now = Date.now();
  const current = readLoginHistory();
  const next: LoginHistoryItem[] = [
    { phone: cleanPhone, password, updatedAt: now },
    ...current.filter((item) => item.phone !== cleanPhone)
  ].slice(0, LOGIN_HISTORY_LIMIT);
  writeLoginHistory(next);
};

const maskPhone = (phone: string) => {
  const p = phone.trim();
  if (p.length < 7) return p;
  return `${p.slice(0, 3)}****${p.slice(-4)}`;
};

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({ phone: '', password: '', captcha: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [captchaId, setCaptchaId] = useState('');
  const [captchaImg, setCaptchaImg] = useState('');
  const [historyOpen, setHistoryOpen] = useState(false);
  const [loginHistory, setLoginHistory] = useState<LoginHistoryItem[]>([]);

  const loadCaptcha = async () => {
    try {
      const data = await authService.getCaptcha();
      setCaptchaId(data.captchaId);
      setCaptchaImg(data.picPath);
    } catch (err: any) {
      setError(err.message || '验证码加载失败');
    }
  };

  useEffect(() => {
    loadCaptcha();
    setLoginHistory(readLoginHistory());
  }, []);

  const refreshHistory = () => {
    setLoginHistory(readLoginHistory());
  };

  const removeHistoryItem = (phone: string) => {
    const next = loginHistory.filter((item) => item.phone !== phone);
    setLoginHistory(next);
    writeLoginHistory(next);
  };

  const clearHistory = () => {
    setLoginHistory([]);
    localStorage.removeItem(LOGIN_HISTORY_KEY);
    setHistoryOpen(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.phone || !formData.password || !formData.captcha) {
      setError('请输入手机号、密码和验证码');
      return;
    }
    
    setError('');
    setIsSubmitting(true);

    try {
      await login(formData.phone, formData.password, formData.captcha, captchaId);
      upsertLoginHistory(formData.phone, formData.password);
      refreshHistory();
      navigate('/user'); // Redirect to user center on success
    } catch (err: any) {
      setError(err.message || '登录失败，请重试');
      loadCaptcha();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center px-5 sm:px-6 lg:px-0 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-20%] right-[-20%] w-[80%] h-[40%] bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="w-full max-w-[420px] mx-auto relative z-10">
      <div className="mb-8 animate-fade-in-up relative z-10">
        {/* Black Gold Logo */}
        <div className="w-14 h-14 bg-white rounded-[18px] flex items-center justify-center text-slate-700 mb-4 shadow-xl shadow-slate-200/70 relative overflow-hidden border border-slate-200">
             <div className="absolute top-0 right-0 w-8 h-8 bg-sky-500/10 rounded-full blur-md -mr-2 -mt-2"></div>
             <svg className="w-9 h-9 text-sky-500 relative z-10 drop-shadow-md" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 3L3.5 7.5V16.5L12 21L20.5 16.5V7.5L12 3Z" />
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 12L3.5 7.5" className="opacity-50"/>
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 12L20.5 7.5" className="opacity-50"/>
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 12V21" className="opacity-50"/>
             </svg>
        </div>
        <h1 className="text-[1.65rem] font-black text-slate-900 tracking-tight">欢迎回到 <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-indigo-500">贪玩盒子</span></h1>
        <p className="text-slate-500 text-sm mt-3 font-medium">登录账号，尊享至尊特权</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-5 animate-fade-in-up delay-100 relative z-10">
        {error && (
          <div className="bg-red-50 text-red-600 text-xs px-4 py-3 rounded-xl border border-red-200 flex items-center">
            <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {error}
          </div>
        )}

        <div className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">手机号</label>
            <div className="bg-white rounded-2xl px-4 py-2.5 border border-slate-200 focus-within:border-sky-500/50 focus-within:bg-white focus-within:ring-4 focus-within:ring-sky-500/10 transition-all flex items-center gap-2">
              <input 
                type="tel" 
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="flex-1 bg-transparent border-none outline-none text-sm text-slate-900 placeholder-slate-400 font-medium" 
                placeholder="请输入11位手机号" 
              />
              <button
                type="button"
                onClick={() => setHistoryOpen((v) => !v)}
                className="text-slate-400 hover:text-sky-500 transition-colors"
                aria-label="查看历史账号"
              >
                <svg className={`w-4 h-4 transition-transform ${historyOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
            {historyOpen && (
              <div className="mt-2 bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
                {loginHistory.length === 0 ? (
                  <div className="px-4 py-3 text-xs text-slate-400">暂无历史账号</div>
                ) : (
                  <>
                    <div className="max-h-48 overflow-y-auto">
                      {loginHistory.map((item) => (
                        <div key={item.phone} className="px-3 py-2.5 border-b border-slate-100 last:border-b-0 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setFormData((prev) => ({ ...prev, phone: item.phone, password: item.password }));
                              setHistoryOpen(false);
                            }}
                            className="flex-1 text-left hover:bg-slate-50 rounded-lg px-2 py-1.5 transition-colors"
                          >
                            <div className="text-sm text-slate-800 font-medium">{item.phone}</div>
                            <div className="text-[11px] text-slate-400">{maskPhone(item.phone)}</div>
                          </button>
                          <button
                            type="button"
                            onClick={() => removeHistoryItem(item.phone)}
                            className="text-[11px] text-rose-400 hover:text-rose-500 px-2 py-1"
                          >
                            删除
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="px-3 py-2 bg-slate-50 flex justify-end">
                      <button
                        type="button"
                        onClick={clearHistory}
                        className="text-[11px] text-slate-500 hover:text-slate-700"
                      >
                        清空历史
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">密码</label>
            <div className="bg-white rounded-2xl px-4 py-2.5 border border-slate-200 focus-within:border-sky-500/50 focus-within:bg-white focus-within:ring-4 focus-within:ring-sky-500/10 transition-all">
              <input 
                type="password" 
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full bg-transparent border-none outline-none text-sm text-slate-900 placeholder-slate-400 font-medium" 
                placeholder="••••••••" 
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">验证码</label>
            <div className="flex items-center gap-3">
              <div className="bg-white rounded-2xl px-4 py-2.5 border border-slate-200 focus-within:border-sky-500/50 focus-within:bg-white focus-within:ring-4 focus-within:ring-sky-500/10 transition-all flex-[0.65]">
                <input
                  type="text"
                  value={formData.captcha}
                  onChange={(e) => setFormData({ ...formData, captcha: e.target.value })}
                  className="w-full bg-transparent border-none outline-none text-sm text-slate-900 placeholder-slate-400 font-medium"
                  placeholder="请输入验证码"
                />
              </div>
              <button
                type="button"
                onClick={loadCaptcha}
                className="h-[46px] flex-[0.35] min-w-[120px] rounded-xl overflow-hidden border border-slate-200 bg-white flex items-center justify-center text-xs text-slate-500"
              >
                {captchaImg ? (
                  <img src={captchaImg} alt="captcha" className="w-full h-full object-cover" />
                ) : (
                  '刷新'
                )}
              </button>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
           <button type="button" className="text-xs text-sky-600 font-bold hover:text-sky-500">忘记密码？</button>
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting}
          className={`w-full bg-gradient-to-r from-sky-500 to-indigo-500 text-white py-3 rounded-2xl font-bold shadow-lg shadow-sky-300/60 transition-all flex items-center justify-center border border-sky-400/30 hover:shadow-sky-400/40 ${isSubmitting ? 'opacity-70 cursor-not-allowed scale-[0.98]' : 'hover:scale-[1.02] hover:shadow-sky-400/30'}`}
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              登录中...
            </>
          ) : '登 录'}
        </button>
      </form>
      
      <div className="mt-8 text-center text-xs text-slate-500 pb-8">
        还没有账号？ <span onClick={() => navigate('/register')} className="text-sky-600 font-bold cursor-pointer hover:underline">立即注册</span>
      </div>
      </div>
    </div>
  );
};

export default Login;

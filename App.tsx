
import React, { Suspense, useEffect, useState } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ImProvider } from './context/ImContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import Home from './pages/Home';
import GameCenter from './pages/GameCenter';
import Trade from './pages/Trade';
import TradeDetail from './pages/TradeDetail';
import TradeMyListings from './pages/TradeMyListings';
import TradeOrders from './pages/TradeOrders';
import TradePublish from './pages/TradePublish';
import Welfare from './pages/Welfare';
import UserCenter from './pages/UserCenter';
import Community from './pages/Community';
import Login from './pages/Login';
import Register from './pages/Register';
import GameDetail from './pages/GameDetail';
import Search from './pages/Search';
import MessageList from './pages/MessageList';
import Social from './pages/Social';
import Chat from './pages/Chat';
import GroupDetail from './pages/GroupDetail';
import GroupInvite from './pages/GroupInvite';
import GroupDiscover from './pages/GroupDiscover';
import Rank from './pages/Rank';
import Feedback from './pages/Feedback';
import Guide from './pages/Guide';
import BottomNav from './components/BottomNav';
const LazyAIAssistant = React.lazy(() => import('./components/AIAssistant'));
const VERSION_CHECK_INTERVAL_MS = 60 * 1000;
const GUIDE_WELCOME_VERSION = 'v1';

const buildGuideWelcomeKey = (userId: number | string) => `portal_guide_welcome_seen_${GUIDE_WELCOME_VERSION}_${userId}`;

const fetchRemoteBuildVersion = async () => {
  const response = await fetch(`/version.json?ts=${Date.now()}`, {
    cache: 'no-store'
  });
  if (!response.ok) return '';
  const data = await response.json();
  return String(data?.version || '');
};

const tabRoutes = [
  { path: '/', element: <Home /> },
  { path: '/game', element: <GameCenter /> },
  { path: '/social', element: <Social /> },
  { path: '/screen-welfare', element: <Welfare /> },
  { path: '/user', element: <UserCenter /> }
];

const tabPathSet = new Set(tabRoutes.map(route => route.path));
const tabRouteMap = new Map(tabRoutes.map(route => [route.path, route.element]));

const TabKeepAlive: React.FC<{ activePath: string }> = ({ activePath }) => {
  const [aliveTabs, setAliveTabs] = useState<string[]>([]);

  useEffect(() => {
    if (!activePath || !tabPathSet.has(activePath)) return;
    setAliveTabs(prev => (prev.includes(activePath) ? prev : [...prev, activePath]));
  }, [activePath]);

  return (
    <>
      {aliveTabs.map(path => {
        const element = tabRouteMap.get(path);
        if (!element) return null;
        const isActive = path === activePath;
        return (
          <div key={path} style={{ display: isActive ? 'block' : 'none' }} aria-hidden={!isActive}>
            {element}
          </div>
        );
      })}
    </>
  );
};

// Layout wrapper to conditionally show BottomNav
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showAssistant, setShowAssistant] = useState(false);
  const [hasNewVersion, setHasNewVersion] = useState(false);
  const [showGuideWelcome, setShowGuideWelcome] = useState(false);
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const hideNavPaths = ['/login', '/register', '/game/detail', '/search', '/chat', '/group/', '/newrank', '/user/feedback', '/chat/center', '/trade/', '/guide'];
  const showNav = !hideNavPaths.some(path => location.pathname.startsWith(path));
  const isAuthPage = location.pathname.startsWith('/login') || location.pathname.startsWith('/register');
  const roleId = Number(user?.role?.id ?? user?.roleId ?? 0);
  const canViewAgentGuide = [1, 2, 3, 4, 5, 7].includes(roleId);

  const dismissGuideWelcome = () => {
    if (user?.ID) {
      localStorage.setItem(buildGuideWelcomeKey(user.ID), '1');
    }
    setShowGuideWelcome(false);
  };

  const defaultGuideTab: 'player' | 'agent' = canViewAgentGuide ? 'agent' : 'player';

  const openGuide = () => {
    dismissGuideWelcome();
    navigate(`/guide?tab=${defaultGuideTab}`);
  };

  useEffect(() => {
    const validThemes = ['black-gold', 'quiet-luxury', 'light'];
    if (user?.theme && validThemes.includes(user.theme)) {
      setTheme(user.theme as any);
    }
  }, [user?.theme, setTheme]);

  useEffect(() => {
    let timeoutId: number | undefined;
    const show = () => setShowAssistant(true);
    if (typeof window !== 'undefined') {
      if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(show);
      } else {
        timeoutId = window.setTimeout(show, 300);
      }
    }
    return () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    html.classList.toggle('portal-pc-compact', !isAuthPage);
    return () => {
      html.classList.remove('portal-pc-compact');
    };
  }, [isAuthPage]);

  useEffect(() => {
    if (import.meta.env.DEV) return;

    let timer: number | undefined;
    let stopped = false;

    const checkVersion = async () => {
      try {
        const remoteVersion = await fetchRemoteBuildVersion();
        if (!remoteVersion) return false;
        if (remoteVersion !== __APP_VERSION__) {
          if (!stopped) setHasNewVersion(true);
          return true;
        }
      } catch {
        // Ignore temporary network/cache gateway errors.
      }
      return false;
    };

    const boot = async () => {
      const hasUpdate = await checkVersion();
      if (hasUpdate || stopped) return;
      timer = window.setInterval(async () => {
        const updated = await checkVersion();
        if (updated && timer) {
          window.clearInterval(timer);
          timer = undefined;
        }
      }, VERSION_CHECK_INTERVAL_MS);
    };

    boot();
    return () => {
      stopped = true;
      if (timer) window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (!user?.ID || isAuthPage) {
      setShowGuideWelcome(false);
      return;
    }
    const seen = localStorage.getItem(buildGuideWelcomeKey(user.ID)) === '1';
    setShowGuideWelcome(!seen);
  }, [user?.ID, isAuthPage]);

  return (
    // Updated: Use text-[var(--text-primary)] instead of text-slate-100 for global text color adaptation
    <div className="flex flex-col h-[100dvh] w-full app-bg overflow-hidden relative text-[var(--text-primary)] font-sans transition-colors duration-500 lg:max-w-md lg:mx-auto lg:border-x lg:border-theme">
      {hasNewVersion && (
        <div className="fixed top-3 left-1/2 -translate-x-1/2 z-[9999] card-bg border border-amber-500/30 shadow-lg rounded-xl px-3 py-2 flex items-center gap-2 text-xs">
          <span className="text-amber-400 font-semibold">检测到新版本</span>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-2 py-1 rounded-lg bg-amber-500 text-black font-semibold"
          >
            立即刷新
          </button>
          <button
            type="button"
            onClick={() => setHasNewVersion(false)}
            className="px-2 py-1 rounded-lg border border-theme text-slate-300"
          >
            稍后
          </button>
        </div>
      )}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-24 overscroll-contain">
        {children}
      </div>

      {showGuideWelcome && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center px-6">
          <button
            type="button"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={dismissGuideWelcome}
            aria-label="关闭首次引导"
          />
          <div className="relative w-full max-w-sm card-bg rounded-[24px] p-6 border border-theme shadow-2xl animate-fade-in-up">
            <div className="text-[10px] uppercase tracking-[0.2em] text-amber-400 font-bold">Welcome</div>
            <h3 className="text-lg font-black mt-2" style={{ color: 'var(--text-primary)' }}>首次登录使用说明</h3>
            <p className="text-xs text-slate-500 mt-2">
              建议先阅读说明再开始操作，避免注册、交易、代理结算等关键流程出错。
            </p>
            <div className="mt-5 space-y-2">
              <button
                type="button"
                onClick={openGuide}
                className="w-full py-2.5 rounded-xl bg-accent-gradient text-black text-sm font-bold"
              >
                {canViewAgentGuide ? '查看代理说明' : '查看玩家说明'}
              </button>
              <button
                type="button"
                onClick={dismissGuideWelcome}
                className="w-full py-2.5 rounded-xl border border-theme text-xs text-slate-400"
              >
                稍后再看
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Global AI Assistant - Persistent across pages */}
      {showAssistant && (
        <Suspense fallback={null}>
          <LazyAIAssistant />
        </Suspense>
      )}
      
      {showNav && <BottomNav />}
    </div>
  );
};

const AppRoutes: React.FC = () => {
  const location = useLocation();
  const activeTabPath = tabPathSet.has(location.pathname) ? location.pathname : '';
  const showNonTabRoutes = !activeTabPath;

  return (
    <Layout>
      <TabKeepAlive activePath={activeTabPath} />
      {showNonTabRoutes && (
        <Routes>
          {/* Game Routes */}
          <Route path="/game/:id" element={<GameDetail />} />
          <Route path="/screen-game" element={<Navigate to="/game" replace />} />
        
          {/* Rank Route */}
          <Route path="/newrank" element={<Rank />} />
        
          {/* Social/Trade/Message Routes */}
          <Route path="/trade" element={<Trade />} /> 
          <Route path="/trade/publish" element={<TradePublish />} />
          <Route path="/trade/my" element={<TradeMyListings />} />
          <Route path="/trade/orders" element={<TradeOrders />} />
          <Route path="/trade/:id" element={<TradeDetail />} />
          <Route path="/message/list" element={<MessageList />} />
          <Route path="/screen-trade" element={<Navigate to="/social" replace />} />

          {/* Chat Center */}
          <Route path="/chat/center" element={<GroupDiscover />} />
        
          {/* Welfare/Task Routes */}
          <Route path="/task" element={<Navigate to="/screen-welfare" replace />} />
          <Route path="/signgift" element={<Navigate to="/screen-welfare" replace />} />
        
          {/* Community Routes */}
          <Route path="/article" element={<Community />} />
          <Route path="/topic" element={<Community />} />
          <Route path="/index/video" element={<Navigate to="/article" replace />} />
        
          {/* User Routes */}
          <Route path="/user/feedback" element={<Feedback />} />
          <Route path="/screen-user" element={<Navigate to="/user" replace />} />
          <Route path="/user/*" element={<UserCenter />} />
        
          {/* Search */}
          <Route path="/search" element={<Search />} />
          <Route path="/guide" element={<Guide />} />
        
          {/* Chat & Group Detail */}
          <Route path="/chat" element={<Chat />} />
          <Route path="/chat/:id" element={<Chat />} />
          <Route path="/group/invite/:token" element={<GroupInvite />} />
          <Route path="/group/:id" element={<GroupDetail />} />
        
          {/* Auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      )}
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ImProvider>
        <ThemeProvider>
          <HashRouter>
            <AppRoutes />
          </HashRouter>
        </ThemeProvider>
      </ImProvider>
    </AuthProvider>
  );
};

export default App;

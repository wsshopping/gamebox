
import React, { Suspense, useEffect, useState } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ImProvider } from './context/ImContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import Home from './pages/Home';
import GameCenter from './pages/GameCenter';
import Trade from './pages/Trade';
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
import GroupDiscover from './pages/GroupDiscover';
import Rank from './pages/Rank';
import Feedback from './pages/Feedback';
import BottomNav from './components/BottomNav';
const LazyAIAssistant = React.lazy(() => import('./components/AIAssistant'));

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
  const [showAssistant, setShowAssistant] = useState(false);
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const hideNavPaths = ['/login', '/register', '/game/detail', '/search', '/chat', '/group/', '/newrank', '/user/feedback', '/groups/discover', '/chat/center'];
  const showNav = !hideNavPaths.some(path => location.pathname.startsWith(path));

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

  return (
    // Updated: Use text-[var(--text-primary)] instead of text-slate-100 for global text color adaptation
    <div className="flex flex-col h-[100dvh] w-full max-w-md mx-auto app-bg shadow-2xl overflow-hidden relative text-[var(--text-primary)] font-sans transition-colors duration-500">
      <div className="flex-1 overflow-y-auto no-scrollbar pb-24 overscroll-contain">
        {children}
      </div>
      
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
          <Route path="/message/list" element={<MessageList />} />
          <Route path="/screen-trade" element={<Navigate to="/social" replace />} />

          {/* Group Discovery */}
          <Route path="/groups/discover" element={<Navigate to="/chat/center" replace />} />
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
        
          {/* Chat & Group Detail */}
          <Route path="/chat" element={<Chat />} />
          <Route path="/chat/:id" element={<Chat />} />
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

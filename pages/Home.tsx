
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Game, Article, Banner } from '../types';
import GameCard from '../components/GameCard';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [games, setGames] = useState<Game[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const bannerTouchStartX = useRef<number | null>(null);
  const suppressNextBannerClick = useRef(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [gamesData, articlesData, bannerData] = await Promise.all([
          api.game.getHot(),
          api.community.getArticles(),
          api.banner.getHome().catch(() => [])
        ]);
        setGames(gamesData);
        setArticles(articlesData);
        setBanners(bannerData);
      } catch (e) {
        console.error("Failed to load home data", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (banners.length <= 1) {
      return;
    }
    const timer = window.setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
    }, 4500);
    return () => window.clearInterval(timer);
  }, [banners.length]);

  useEffect(() => {
    if (currentBannerIndex >= banners.length) {
      setCurrentBannerIndex(0);
    }
  }, [banners.length, currentBannerIndex]);

  const switchBanner = (nextIndex: number) => {
    if (banners.length === 0) {
      return;
    }
    const normalized = ((nextIndex % banners.length) + banners.length) % banners.length;
    setCurrentBannerIndex(normalized);
  };

  const handleBannerTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    bannerTouchStartX.current = e.touches[0]?.clientX ?? null;
  };

  const handleBannerTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (banners.length <= 1 || bannerTouchStartX.current === null) {
      bannerTouchStartX.current = null;
      return;
    }
    const endX = e.changedTouches[0]?.clientX;
    if (typeof endX !== 'number') {
      bannerTouchStartX.current = null;
      return;
    }
    const deltaX = bannerTouchStartX.current - endX;
    bannerTouchStartX.current = null;
    if (Math.abs(deltaX) < 40) {
      suppressNextBannerClick.current = true;
      handleHeroClick();
      return;
    }
    if (deltaX > 0) {
      switchBanner(currentBannerIndex + 1);
      return;
    }
    switchBanner(currentBannerIndex - 1);
  };

  const heroBanner = banners[currentBannerIndex] || banners[0];
  const heroTitleRaw = heroBanner?.title || 'BLACK MYTH';
  const heroTitle = heroTitleRaw.split(/[｜|丨:：]/)[0]?.trim() || heroTitleRaw;
  const normalizeBannerLink = (rawLink?: string) => {
    const link = (rawLink || '').trim();
    if (!link) {
      return '';
    }
    if (link.startsWith('#/')) {
      return link.slice(1);
    }
    if (link.startsWith('/#/')) {
      return link.slice(2);
    }
    if (link.startsWith('/content/portalGame')) {
      const gameId = link.match(/(?:\/|id=)(\d+)/)?.[1];
      return gameId ? `/game/${gameId}` : '/game';
    }
    if (link.startsWith('/content/portalWelfare')) {
      return '/screen-welfare';
    }
    return link;
  };
  const heroLink = normalizeBannerLink(heroBanner?.linkUrl);
  const handleHeroClick = () => {
    if (!heroLink) {
      navigate('/screen-welfare');
      return;
    }

    if (/^https?:\/\//i.test(heroLink)) {
      try {
        const url = new URL(heroLink);
        const hashPath = normalizeBannerLink(url.hash);
        if (typeof window !== 'undefined' && url.origin === window.location.origin && hashPath.startsWith('/')) {
          navigate(hashPath);
          return;
        }
      } catch {
        // no-op
      }
      window.open(heroLink, '_blank');
      return;
    }

    navigate(heroLink.startsWith('/') ? heroLink : `/${heroLink}`);
  };

  const handleHeroBannerClick = () => {
    if (suppressNextBannerClick.current) {
      suppressNextBannerClick.current = false;
      return;
    }
    handleHeroClick();
  };

  return (
    <div className="app-bg min-h-full pb-10 pt-[calc(5rem+env(safe-area-inset-top))] transition-colors duration-500">
      {/* Premium Header: Dark Glass */}
      <div className="px-6 py-5 pt-[calc(1.25rem+env(safe-area-inset-top))] fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md z-40 flex items-center justify-between glass-bg transition-all">
        <div className="flex items-center space-x-3">
          {/* Logo: Obsidian & Gold */}
          <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-[var(--bg-card)] to-[var(--bg-primary)] flex items-center justify-center shadow-[0_0_15px_rgba(251,191,36,0.15)] relative overflow-hidden group border border-theme">
            {/* Gold Shine */}
            <div className="absolute top-0 right-0 w-8 h-8 bg-accent-gradient opacity-20 rounded-full blur-md -mr-3 -mt-3"></div>
            {/* Icon */}
            <svg className="w-5 h-5 text-accent relative z-10 drop-shadow-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 3L3.5 7.5V16.5L12 21L20.5 16.5V7.5L12 3Z" />
            </svg>
          </div>
          
          <div className="flex flex-col justify-center">
             <h1 className="text-xl font-black tracking-tight font-sans leading-none flex items-center" style={{color: 'var(--text-primary)'}}>
               贪玩盒子
             </h1>
             <span className="text-[10px] text-accent font-bold tracking-[0.2em] uppercase scale-90 origin-left drop-shadow-[0_0_5px_rgba(245,158,11,0.5)]">PREMIUM</span>
          </div>
        </div>
        
        <button 
          onClick={() => navigate('/search')} 
          className="w-10 h-10 flex items-center justify-center rounded-full card-bg border border-theme text-slate-400 hover:text-accent hover:border-theme transition-all duration-300"
        >
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </button>
      </div>

      {/* Hero Banner: Pure poster carousel */}
      <div className="px-6 mt-6 relative z-0">
        <div
          onClick={handleHeroBannerClick}
          onTouchStart={handleBannerTouchStart}
          onTouchEnd={handleBannerTouchEnd}
          className="h-56 rounded-[24px] relative overflow-hidden cursor-pointer shadow-[0_14px_36px_-10px_rgba(0,0,0,0.45)] transition-transform duration-300 hover:scale-[1.01] border border-theme"
        >
          {heroBanner?.imageUrl ? (
            <img src={heroBanner.imageUrl} alt={heroTitle} className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 bg-slate-950 opacity-100"></div>
          )}
          <div className="absolute inset-0 bg-black/10"></div>

          <div className="absolute left-3 bottom-3 z-20 max-w-[70%] px-3 py-1.5 rounded-full bg-black/45 backdrop-blur-sm border border-white/15">
            <span className="block text-[12px] leading-none text-white font-semibold truncate">
              {heroTitle}
            </span>
          </div>

          {banners.length > 1 && (
            <div className="absolute left-1/2 -translate-x-1/2 bottom-3 z-20 flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/30 backdrop-blur-sm">
              {banners.map((_, index) => (
                <button
                  key={`home-banner-dot-${index}`}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    switchBanner(index);
                  }}
                  className={`rounded-full transition-all duration-300 ${index === currentBannerIndex ? 'w-5 h-1.5 bg-white' : 'w-2 h-1.5 bg-white/50 hover:bg-white/80'}`}
                  aria-label={`切换到第${index + 1}张Banner`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Access: Dark Icons */}
      <div className="flex justify-between px-8 mt-10 mb-10">
        {[
          { name: '排行榜', icon: '🏆', path: '/newrank' },
          { name: '新游', icon: '⚡', path: '/game' },
          { name: '视频', icon: '▶', path: '/index/video' },
          { name: '交易', icon: '❖', path: '/trade' },
        ].map((item) => (
          <div key={item.name} onClick={() => navigate(item.path)} className="flex flex-col items-center space-y-3 cursor-pointer group">
            <div className="w-[68px] h-[68px] rounded-[22px] card-bg flex items-center justify-center text-2xl shadow-lg shadow-black/5 border border-theme group-hover:bg-[var(--bg-primary)] group-hover:border-accent group-hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
               {/* Icon Color Change on Hover */}
               <span className="text-slate-400 group-hover:text-accent transition-colors duration-300 drop-shadow-sm relative z-10">{item.icon}</span>
               {/* Subtle background shine on hover */}
               <div className="absolute inset-0 bg-accent-gradient opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            </div>
            <span className="text-xs font-bold tracking-wide text-slate-500 group-hover:text-[var(--text-primary)] transition-colors">{item.name}</span>
          </div>
        ))}
      </div>

      {/* Recommended Games */}
      <div className="px-6 mb-10">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold tracking-tight flex items-center" style={{color: 'var(--text-primary)'}}>
             <span className="w-1 h-5 bg-accent-gradient rounded-full mr-2 shadow-[0_0_8px_rgba(251,191,36,0.5)]"></span>
             精选推荐
          </h3>
          <span onClick={() => navigate('/game')} className="text-xs font-bold text-slate-500 flex items-center cursor-pointer hover:text-accent transition-colors">
            查看全部 
            <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </span>
        </div>
        <div className="space-y-4 min-h-[200px]">
          {isLoading ? (
            // Skeleton
            [1, 2, 3].map(i => (
              <div key={i} className="card-bg rounded-[20px] p-4 flex space-x-4 animate-pulse border border-theme">
                <div className="w-18 h-18 bg-white/5 rounded-2xl w-[72px] h-[72px]"></div>
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-white/5 rounded w-3/4"></div>
                  <div className="h-3 bg-white/5 rounded w-1/4"></div>
                </div>
              </div>
            ))
          ) : (
            games.map(game => (
              <GameCard key={game.id} game={game} />
            ))
          )}
        </div>
      </div>

       {/* News */}
       <div className="px-6 pb-20">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold tracking-tight flex items-center" style={{color: 'var(--text-primary)'}}>
             <span className="w-1 h-5 bg-gradient-to-b from-slate-500 to-slate-700 rounded-full mr-2"></span>
             前沿资讯
          </h3>
        </div>
        <div className="flex overflow-x-auto space-x-4 no-scrollbar pb-4 -mx-6 px-6">
          {isLoading ? (
            [1, 2].map(i => (
               <div key={i} className="min-w-[280px] card-bg p-4 rounded-[24px] h-[250px] animate-pulse border border-theme"></div>
            ))
          ) : (
            articles.map(article => (
              <div 
                 key={article.id} 
                 onClick={() => navigate('/article')}
                 className="min-w-[280px] card-bg p-4 rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-theme cursor-pointer hover:border-accent transition-all group"
              >
                 <div className="relative h-36 rounded-2xl overflow-hidden mb-4 border border-theme">
                   <img src={article.image} alt={article.title} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" />
                   <div className="absolute top-2 left-2 bg-black/50 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10">
                      <span className="text-[10px] font-bold text-accent uppercase tracking-wide">{article.tag}</span>
                   </div>
                 </div>
                 <h4 className="text-[15px] font-bold leading-snug mb-2 line-clamp-2 group-hover:text-accent transition-colors" style={{color: 'var(--text-primary)'}}>{article.title}</h4>
                 <div className="flex items-center justify-between text-xs text-slate-500 group-hover:text-slate-400">
                    <span>{article.author}</span>
                    <span>{article.timestamp}</span>
                 </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;

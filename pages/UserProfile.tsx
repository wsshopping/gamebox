
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const UserProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const data = await api.user.getById(id);
        setProfile(data);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
  };

  if (isLoading) {
    return (
      <div className="app-bg min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="app-bg min-h-screen pb-20 transition-colors duration-500">
      {/* Header with Back Button */}
      <div className="absolute top-0 left-0 w-full p-4 z-50 flex justify-between items-center">
         <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center text-white border border-white/10 hover:bg-black/40 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
         </button>
         <button className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center text-white border border-white/10 hover:bg-black/40 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
         </button>
      </div>

      {/* Hero / Cover */}
      <div className="relative">
         <div className="h-64 overflow-hidden">
            <img src={profile.avatar} alt="cover" className="w-full h-full object-cover blur-md opacity-80 scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] via-transparent to-black/30"></div>
         </div>
         
         <div className="absolute -bottom-16 left-0 right-0 px-6 flex flex-col items-center">
            <div className="relative w-28 h-28 rounded-[30px] p-1 bg-[var(--bg-primary)] shadow-2xl">
               <img src={profile.avatar} alt={profile.username} className="w-full h-full rounded-[26px] object-cover border border-theme" />
               <div className="absolute bottom-0 right-0 w-6 h-6 bg-emerald-500 border-4 border-[var(--bg-primary)] rounded-full"></div>
            </div>
         </div>
      </div>

      {/* Profile Info */}
      <div className="mt-20 px-6 text-center">
         <h1 className="text-2xl font-black mb-1" style={{color: 'var(--text-primary)'}}>{profile.username}</h1>
         <div className="flex items-center justify-center space-x-2 text-xs text-slate-500 mb-4">
            <span className="font-mono">ID: {profile.id.toUpperCase()}</span>
            <span>•</span>
            <span className="text-accent font-bold">Lv.{profile.level}</span>
         </div>
         
         <p className="text-sm text-slate-400 mb-6 max-w-xs mx-auto leading-relaxed">
            {profile.bio}
         </p>

         <div className="flex justify-center space-x-4 mb-8">
            <button 
               onClick={() => navigate(`/chat/${profile.id}`)}
               className="flex-1 max-w-[140px] bg-accent-gradient text-black font-bold py-3 rounded-2xl shadow-lg active:scale-95 transition-transform"
            >
               发消息
            </button>
            <button 
               onClick={handleFollow}
               className={`flex-1 max-w-[140px] font-bold py-3 rounded-2xl border transition-all ${
                  isFollowing 
                  ? 'bg-transparent text-slate-500 border-slate-600' 
                  : 'bg-[var(--bg-card)] text-[var(--text-primary)] border-theme hover:border-accent'
               }`}
            >
               {isFollowing ? '已关注' : '关注'}
            </button>
         </div>

         {/* Stats */}
         <div className="card-bg rounded-[24px] p-6 border border-theme flex justify-between shadow-sm mb-6">
            <div className="text-center flex-1 border-r border-theme last:border-0">
               <div className="text-lg font-black" style={{color: 'var(--text-primary)'}}>{profile.following}</div>
               <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">关注</div>
            </div>
            <div className="text-center flex-1 border-r border-theme last:border-0">
               <div className="text-lg font-black" style={{color: 'var(--text-primary)'}}>{profile.followers}</div>
               <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">粉丝</div>
            </div>
            <div className="text-center flex-1">
               <div className="text-lg font-black" style={{color: 'var(--text-primary)'}}>{profile.games?.length || 0}</div>
               <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">游戏</div>
            </div>
         </div>

         {/* Playing Games */}
         <div className="text-left">
            <h3 className="text-sm font-bold mb-3 ml-1" style={{color: 'var(--text-primary)'}}>常玩游戏</h3>
            <div className="flex flex-wrap gap-3">
               {profile.games && profile.games.length > 0 ? (
                  profile.games.map((game: string, idx: number) => (
                     <div key={idx} className="card-bg px-4 py-2 rounded-xl border border-theme text-xs font-bold text-slate-400">
                        {game}
                     </div>
                  ))
               ) : (
                  <span className="text-xs text-slate-500 ml-1">暂无公开游戏记录</span>
               )}
            </div>
         </div>
      </div>
    </div>
  );
};

export default UserProfile;

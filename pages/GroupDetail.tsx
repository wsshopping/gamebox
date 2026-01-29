
import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useIm } from '../context/ImContext';
import { IMConversationType } from '../services/im/client';

const GroupDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [group, setGroup] = useState<{
    id: string;
    name: string;
    avatar: string;
    desc: string;
    category: string;
    tags: string[];
    members: number;
    level: string;
  } | null>(null);
  const [members, setMembers] = useState<Array<{ memberId: string; displayName?: string }>>([]);
  const [membersLoaded, setMembersLoaded] = useState(false);
  const { conversations, refreshConversations, getGroupInfo, getGroupMembers, ensureConnected } = useIm();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState('');

  const isJoined = useMemo(() => {
    if (!id) return false;
    return conversations.some((conv: any) => (
      conv.conversationId === id && conv.conversationType === IMConversationType.GROUP
    ));
  }, [conversations, id]);

  useEffect(() => {
    if (!id) return;
    let active = true;
    setIsLoading(true);
    setLoadError('');
    setMembersLoaded(false);

    const loadGroup = async () => {
      const [infoResult, membersResult] = await Promise.allSettled([
        getGroupInfo(id),
        getGroupMembers(id)
      ]);
      if (!active) return;

      const info = infoResult.status === 'fulfilled' ? infoResult.value : null;
      const memberResp = membersResult.status === 'fulfilled' ? membersResult.value : null;

      if (!info || !info.groupId) {
        const reason = infoResult.status === 'rejected' ? (infoResult.reason as any) : null;
        setGroup(null);
        setMembers([]);
        setMembersLoaded(false);
        setLoadError(reason?.message || '群组不存在');
        return;
      }

      const ext = info.extFields || {};
      const settings = info.settings || {};
      const rawTags = ext.tags || settings.tags || '';
      const tags = rawTags
        ? rawTags.split(/[, ]+/).map(tag => tag.trim()).filter(Boolean)
        : [];
      const desc = ext.desc || ext.description || ext.intro || ext.introduction || '';
      const category = ext.category || settings.category || '群聊';
      const levelValue = ext.level || settings.level;
      const levelLabel = levelValue ? `Lv.${levelValue}` : 'Lv.1';
      const memberItems = memberResp?.items || [];

      setMembers(memberItems.map(item => ({
        memberId: item.memberId,
        displayName: item.grpDisplayName
      })));
      setMembersLoaded(membersResult.status === 'fulfilled');
      setGroup({
        id: info.groupId,
        name: info.groupName || info.groupId,
        avatar: info.groupPortrait || `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(info.groupId)}`,
        desc: desc || '暂无介绍',
        category,
        tags,
        members: memberItems.length,
        level: levelLabel
      });
    };

    loadGroup()
      .catch((err: any) => {
        if (!active) return;
        setGroup(null);
        setMembers([]);
        setMembersLoaded(false);
        setLoadError(err?.message || '加载失败');
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [getGroupInfo, getGroupMembers, id]);

  const handleJoin = async () => {
    if (!id) return;
    setIsSubmitting(true);
    try {
      const ok = await ensureConnected();
      if (!ok) {
        window.alert('IM连接超时，请稍后重试')
        return
      }
      await api.im.joinGroup({
        groupId: id,
        groupName: group?.name,
        groupPortrait: group?.avatar
      });
      await refreshConversations().catch(() => null);
      navigate(`/chat/${id}`);
    } catch (e) {
      window.alert((e as any)?.message || '加入失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
       <div className="app-bg min-h-screen flex items-center justify-center">
         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
       </div>
    );
  }

  if (!group) {
    return (
      <div className="app-bg min-h-screen flex flex-col items-center justify-center">
         <p className="text-slate-500">{loadError || '群组不存在'}</p>
         <button onClick={() => navigate(-1)} className="mt-4 text-indigo-600">返回</button>
      </div>
    );
  }

  return (
    <div className="app-bg min-h-screen relative flex flex-col transition-colors duration-500">
       {/* Transparent Header */}
       <div className="absolute top-0 left-0 right-0 z-20 p-4 flex justify-between items-center">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/30 transition-colors border border-white/10">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/30 transition-colors border border-white/10">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
          </button>
       </div>

       {/* Banner Image */}
       <div className="h-60 relative w-full overflow-hidden">
          <img src={group.avatar} alt="cover" className="w-full h-full object-cover blur-sm scale-110" />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] via-[var(--bg-primary)]/50 to-transparent"></div>
       </div>

       {/* Main Content (Overlapping) */}
       <div className="-mt-20 px-4 relative z-10 pb-24 flex-1">
          <div className="card-bg rounded-3xl p-6 shadow-xl border border-theme">
             <div className="flex flex-col items-center -mt-16 mb-4">
                <img src={group.avatar} alt="avatar" className="w-24 h-24 rounded-full border-4 border-[var(--bg-card)] shadow-md object-cover" />
                <h1 className="text-xl font-black mt-3 text-center" style={{color: 'var(--text-primary)'}}>{group.name}</h1>
                <p className="text-xs text-slate-400 mt-1">ID: {String(group.id).toUpperCase()}</p>
             </div>

             <div className="flex justify-center space-x-8 py-4 border-b border-theme mb-4">
                <div className="text-center">
                   <p className="text-lg font-bold" style={{color: 'var(--text-primary)'}}>{group.members}</p>
                   <p className="text-[10px] text-slate-400 uppercase tracking-wide">成员</p>
                </div>
                <div className="text-center">
                   <p className="text-lg font-bold" style={{color: 'var(--text-primary)'}}>{membersLoaded ? members.length : '--'}</p>
                   <p className="text-[10px] text-slate-400 uppercase tracking-wide">在线</p>
                </div>
                <div className="text-center">
                   <p className="text-lg font-bold text-emerald-500">{group.level}</p>
                   <p className="text-[10px] text-slate-400 uppercase tracking-wide">等级</p>
                </div>
             </div>

             <div className="space-y-6">
                <div>
                   <h3 className="text-sm font-bold mb-2" style={{color: 'var(--text-primary)'}}>群介绍</h3>
                   <p className="text-sm text-slate-500 leading-relaxed">{group.desc}</p>
                </div>

                <div>
                   <h3 className="text-sm font-bold mb-2" style={{color: 'var(--text-primary)'}}>群标签</h3>
                   <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-indigo-500/10 text-indigo-500 rounded-full text-xs font-medium border border-indigo-500/20">{group.category}</span>
                      {group.tags.length > 0 ? (
                        group.tags.map(tag => (
                          <span key={tag} className="px-3 py-1 bg-[var(--bg-primary)] text-slate-500 rounded-full text-xs font-medium border border-theme">#{tag}</span>
                        ))
                      ) : (
                        <span className="px-3 py-1 bg-[var(--bg-primary)] text-slate-500 rounded-full text-xs font-medium border border-theme">暂无标签</span>
                      )}
                   </div>
                </div>

                <div>
                   <h3 className="text-sm font-bold mb-3 flex justify-between items-center" style={{color: 'var(--text-primary)'}}>
                      群成员
                      <span className="text-xs text-slate-400 font-normal">查看全部 &gt;</span>
                   </h3>
                   <div className="flex -space-x-2 overflow-hidden py-1">
                      {members.slice(0, 5).map((member) => (
                         <img
                           key={member.memberId}
                           className="inline-block h-8 w-8 rounded-full ring-2 ring-[var(--bg-card)] object-cover"
                           src={`https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(member.memberId)}`}
                           alt={member.displayName || member.memberId}
                         />
                      ))}
                      <div className="flex items-center justify-center h-8 w-8 rounded-full ring-2 ring-[var(--bg-card)] bg-[var(--bg-primary)] text-[10px] text-slate-500 font-bold border border-theme">
                        {membersLoaded ? (members.length > 5 ? `+${members.length - 5}` : '+0') : '--'}
                      </div>
                   </div>
                </div>
             </div>
          </div>
       </div>

       {/* Bottom Action Bar */}
       <div className="fixed bottom-0 left-0 right-0 card-bg border-t border-theme p-4 pb-8 z-30">
          <div className="max-w-md mx-auto">
             {isJoined ? (
                <button 
                  onClick={() => navigate(`/chat/${group.id}`)}
                  className="w-full bg-[var(--text-primary)] text-[var(--bg-primary)] font-bold py-3.5 rounded-xl shadow-lg"
                >
                  进入聊天
                </button>
             ) : (
                <button 
                  onClick={handleJoin}
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-500/20 active:scale-95 transition-transform"
                >
                  {isSubmitting ? '加入中...' : '加入群聊'}
                </button>
             )}
          </div>
       </div>
    </div>
  );
};

export default GroupDetail;

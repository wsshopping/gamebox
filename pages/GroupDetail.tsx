
import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useIm } from '../context/ImContext';
import { IMConversationType } from '../services/im/client';
import { useAuth } from '../context/AuthContext';

const AUTO_DELETE_OPTIONS = [
  { label: '关闭', value: 0 },
  { label: '24小时', value: 24 * 60 * 60 },
  { label: '7天', value: 7 * 24 * 60 * 60 },
  { label: '30天', value: 30 * 24 * 60 * 60 }
] as const;

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
    ownerId?: string;
    adminIds?: string[];
  } | null>(null);
  const [members, setMembers] = useState<Array<{ memberId: string; displayName?: string }>>([]);
  const [membersLoaded, setMembersLoaded] = useState(false);
  const { conversations, refreshConversations, getGroupInfo, getGroupMembers, ensureConnected } = useIm();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isActionSubmitting, setIsActionSubmitting] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [showActions, setShowActions] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'leave' | 'disband' | null>(null);
  const [actionError, setActionError] = useState('');
  const [showRename, setShowRename] = useState(false);
  const [renameDraft, setRenameDraft] = useState('');
  const [renameError, setRenameError] = useState('');
  const [isRenaming, setIsRenaming] = useState(false);
  const [showMembersSheet, setShowMembersSheet] = useState(false);
  const [autoDeleteSeconds, setAutoDeleteSeconds] = useState(0);
  const [canEditAutoDelete, setCanEditAutoDelete] = useState(false);
  const [isAutoDeleteLoading, setIsAutoDeleteLoading] = useState(false);
  const [autoDeleteError, setAutoDeleteError] = useState('');
  const [showAutoDeleteSheet, setShowAutoDeleteSheet] = useState(false);
  const [showMemberActions, setShowMemberActions] = useState(false);
  const [selectedMember, setSelectedMember] = useState<{ id: string; name?: string } | null>(null);
  const [memberIsFriend, setMemberIsFriend] = useState(false);
  const [memberActionError, setMemberActionError] = useState('');
  const [memberActionSuccess, setMemberActionSuccess] = useState('');
  const [isMemberLoading, setIsMemberLoading] = useState(false);
  const [isMemberRequesting, setIsMemberRequesting] = useState(false);
  const { user } = useAuth();

  const isJoined = useMemo(() => {
    if (!id) return false;
    return conversations.some((conv: any) => (
      conv.conversationId === id && conv.conversationType === IMConversationType.GROUP
    ));
  }, [conversations, id]);

  const isOwner = useMemo(() => {
    if (!group?.ownerId || !user?.ID) return false;
    return String(user.ID) === String(group.ownerId);
  }, [group?.ownerId, user?.ID]);

  const isAdmin = useMemo(() => {
    if (!group?.adminIds || !user?.ID) return false;
    return group.adminIds.includes(String(user.ID));
  }, [group?.adminIds, user?.ID]);

  const canRename = isOwner || isAdmin;
  const canManageMemberActions = isOwner || isAdmin;
  const autoDeleteLabel = useMemo(() => {
    const found = AUTO_DELETE_OPTIONS.find(item => item.value === autoDeleteSeconds);
    return found?.label || '关闭';
  }, [autoDeleteSeconds]);
  const currentUserId = user?.ID ? String(user.ID) : '';
  const selectedMemberId = selectedMember?.id || '';
  const selectedMemberNumericId = /^[0-9]+$/.test(selectedMemberId) ? Number(selectedMemberId) : 0;
  const isSelfSelected = currentUserId !== '' && String(selectedMemberNumericId) === currentUserId;
  const canStartPrivateChat = canManageMemberActions && selectedMemberNumericId > 0 && !isSelfSelected;
  const canAddFriend = canManageMemberActions && selectedMemberNumericId > 0 && !isSelfSelected;
  const memberDisplayName = selectedMember?.name
    || (selectedMemberNumericId ? `用户${selectedMemberNumericId}` : '群友');

  const parseGroupAdminIds = (value?: string) => {
    if (!value) return [];
    return value
      .split(/[,\s;|]+/)
      .map(item => item.trim())
      .filter(Boolean);
  };

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
      const ownerId = ext.grp_creator || settings.grp_creator || '';
      const adminRaw = ext.grp_administrators || settings.grp_administrators || '';
      const adminIds = parseGroupAdminIds(adminRaw);
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
        level: levelLabel,
        ownerId,
        adminIds
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

  useEffect(() => {
    if (!id) return;
    let active = true;
    setIsAutoDeleteLoading(true);
    setAutoDeleteError('');
    api.im.getAutoDeletePolicy({
      conversationType: IMConversationType.GROUP,
      conversationId: id
    }).then((res) => {
      if (!active) return;
      setAutoDeleteSeconds(res.seconds || 0);
      setCanEditAutoDelete(Boolean(res.canEdit));
    }).catch((err: any) => {
      if (!active) return;
      setAutoDeleteError(err?.message || '自动删除设置获取失败');
      setAutoDeleteSeconds(0);
      setCanEditAutoDelete(false);
    }).finally(() => {
      if (!active) return;
      setIsAutoDeleteLoading(false);
    });
    return () => {
      active = false;
    };
  }, [id]);

  const handleSetAutoDelete = async (seconds: number) => {
    if (!id || !canEditAutoDelete) return;
    setIsAutoDeleteLoading(true);
    setAutoDeleteError('');
    try {
      const res = await api.im.setAutoDeletePolicy({
        conversationType: IMConversationType.GROUP,
        conversationId: id,
        seconds
      });
      setAutoDeleteSeconds(res.seconds || 0);
      setCanEditAutoDelete(Boolean(res.canEdit));
      setShowAutoDeleteSheet(false);
    } catch (err: any) {
      setAutoDeleteError(err?.message || '自动删除设置更新失败');
    } finally {
      setIsAutoDeleteLoading(false);
    }
  };

  useEffect(() => {
    if (!showMemberActions || !canAddFriend) {
      setMemberIsFriend(false);
      return;
    }
    let active = true;
    setIsMemberLoading(true);
    setMemberActionError('');
    api.friend.listFriends(500)
      .then((res) => {
        if (!active) return;
        const isFriend = (res.items || []).some(item => item.id === selectedMemberNumericId);
        setMemberIsFriend(isFriend);
      })
      .catch((err: any) => {
        if (!active) return;
        setMemberActionError(err?.message || '好友信息获取失败');
        setMemberIsFriend(false);
      })
      .finally(() => {
        if (!active) return;
        setIsMemberLoading(false);
      });

    return () => {
      active = false;
    };
  }, [showMemberActions, canAddFriend, selectedMemberNumericId]);

  const handleMemberSelect = (member: { memberId: string; displayName?: string }) => {
    setSelectedMember({ id: member.memberId, name: member.displayName });
    setMemberActionError('');
    setMemberActionSuccess('');
    setMemberIsFriend(false);
    setShowMemberActions(true);
  };

  const handleMemberActionsClose = () => {
    if (isMemberRequesting) return;
    setShowMemberActions(false);
    setSelectedMember(null);
    setMemberActionError('');
    setMemberActionSuccess('');
    setMemberIsFriend(false);
  };

  const handleStartPrivateChat = () => {
    if (!canStartPrivateChat) {
      setMemberActionError('暂无权限发起对话');
      return;
    }
    if (!selectedMemberNumericId) {
      setMemberActionError('无法识别用户');
      return;
    }
    setShowMemberActions(false);
    navigate(`/chat/${selectedMemberNumericId}`);
  };

  const handleSendFriendRequest = async () => {
    if (!canAddFriend) {
      setMemberActionError('暂无权限发起好友申请');
      return;
    }
    if (!selectedMemberNumericId) {
      setMemberActionError('无法识别用户');
      return;
    }
    if (memberIsFriend) {
      setMemberActionSuccess('对方已经是好友');
      return;
    }
    setIsMemberRequesting(true);
    setMemberActionError('');
    setMemberActionSuccess('');
    try {
      await api.friend.createRequest(selectedMemberNumericId);
      setMemberActionSuccess('好友申请已发送');
      setMemberIsFriend(true);
    } catch (err: any) {
      setMemberActionError(err?.message || '发送失败');
    } finally {
      setIsMemberRequesting(false);
    }
  };

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

  const handleActionSelect = (action: 'leave' | 'disband') => {
    setShowActions(false);
    setActionError('');
    setConfirmAction(action);
  };

  const handleConfirmAction = async () => {
    if (!group || !confirmAction) return;
    setActionError('');
    setIsActionSubmitting(true);
    try {
      if (confirmAction === 'leave') {
        await api.im.leaveGroup({ groupId: group.id });
      } else {
        await api.im.disbandGroup({ groupId: group.id });
      }
      await refreshConversations().catch(() => null);
      setConfirmAction(null);
      navigate(-1);
    } catch (e: any) {
      setActionError(e?.message || '操作失败');
    } finally {
      setIsActionSubmitting(false);
    }
  };

  const validateGroupName = (value: string): string | null => {
    if (value.trim() !== value) {
      return '群名称不能包含空格';
    }
    const trimmed = value.trim();
    const length = Array.from(trimmed).length;
    if (length < 2 || length > 20) {
      return '群名称长度需为2-20字符';
    }
    if (!/^[A-Za-z0-9\u4e00-\u9fa5]+$/.test(trimmed)) {
      return '群名称仅支持中文、英文、数字';
    }
    return null;
  };

  const handleRenameOpen = () => {
    if (!group) return;
    setRenameDraft(group.name);
    setRenameError('');
    setShowRename(true);
  };

  const handleRenameSubmit = async () => {
    if (!group || isRenaming) return;
    const error = validateGroupName(renameDraft);
    if (error) {
      setRenameError(error);
      return;
    }
    setIsRenaming(true);
    setRenameError('');
    try {
      const res = await api.im.updateGroupName({
        groupId: group.id,
        groupName: renameDraft.trim()
      });
      setGroup(prev => (prev ? { ...prev, name: res.groupName } : prev));
      await refreshConversations().catch(() => null);
      setShowRename(false);
    } catch (e: any) {
      setRenameError(e?.message || '修改失败');
    } finally {
      setIsRenaming(false);
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
		       <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md z-40 p-4 flex justify-between items-center">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/30 transition-colors border border-white/10">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
	          <button
	            onClick={() => {
	              if (isJoined) {
	                setShowActions(true);
	              }
	            }}
            className={`w-10 h-10 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center text-white transition-colors border border-white/10 ${isJoined ? 'hover:bg-black/30' : 'opacity-50 cursor-not-allowed'}`}
          >
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
                <div className="flex items-center justify-center gap-2 mt-3">
                  <h1 className="text-xl font-black text-center" style={{color: 'var(--text-primary)'}}>{group.name}</h1>
                  {canRename && (
                    <button
                      onClick={handleRenameOpen}
                      className="p-1 rounded-full text-slate-400 hover:text-[var(--text-primary)] hover:bg-white/5 transition-colors"
                      aria-label="修改群名"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5h6m-6 4h6m-6 4h6M5 7h.01M5 11h.01M5 15h.01M4 19h16" />
                      </svg>
                    </button>
                  )}
                </div>
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
                      <button
                        type="button"
                        onClick={() => setShowMembersSheet(true)}
                        className="text-xs text-slate-400 font-normal hover:text-[var(--text-primary)] transition-colors"
                      >
                        查看全部 &gt;
                      </button>
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

	       {showActions && (
         <>
           <div className="fixed inset-0 z-40" onClick={() => setShowActions(false)}></div>
	           <div className="fixed top-16 right-4 z-50 card-bg border border-theme rounded-xl shadow-xl overflow-hidden w-40">
	             <button
	               onClick={() => {
	                 setShowActions(false);
	                 setShowAutoDeleteSheet(true);
	               }}
	               className="w-full text-left px-4 py-3 hover:bg-white/5 text-sm font-bold transition-colors"
	               style={{ color: 'var(--text-primary)' }}
	             >
	               自动删除消息
	             </button>
	             <div className="h-px bg-white/5 mx-2"></div>
	             <button
	               onClick={() => handleActionSelect('leave')}
	               className="w-full text-left px-4 py-3 hover:bg-white/5 text-sm font-bold transition-colors"
               style={{ color: 'var(--text-primary)' }}
             >
               退出群
             </button>
             <div className="h-px bg-white/5 mx-2"></div>
	             <button
	               onClick={() => handleActionSelect('disband')}
               disabled={!isOwner}
               className={`w-full text-left px-4 py-3 text-sm font-bold transition-colors ${isOwner ? 'hover:bg-white/5 text-rose-400' : 'text-slate-500 cursor-not-allowed'}`}
	             >
	               解散群
	             </button>
	           </div>
	         </>
	       )}

	       {showAutoDeleteSheet && (
	         <div className="fixed inset-0 z-[65] flex items-end sm:items-center justify-center">
	           <div
	             className="absolute inset-0 bg-black/50 backdrop-blur-sm"
	             onClick={() => !isAutoDeleteLoading && setShowAutoDeleteSheet(false)}
	           ></div>
	           <div className="relative w-full sm:max-w-sm card-bg rounded-t-2xl sm:rounded-2xl p-5 border border-theme shadow-2xl animate-fade-in-up">
	             <div className="flex items-start justify-between">
	               <div>
	                 <h3 className="text-sm font-semibold text-[var(--text-primary)]">自动删除消息</h3>
	                 <p className="text-xs text-slate-500 mt-1">当前：{isAutoDeleteLoading ? '加载中...' : autoDeleteLabel}</p>
	               </div>
	             </div>

	             {autoDeleteError && (
	               <div className="mt-3 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-3 py-2">
	                 {autoDeleteError}
	               </div>
	             )}

	             <div className="mt-4 space-y-2">
	               {AUTO_DELETE_OPTIONS.map((option) => {
	                 const active = autoDeleteSeconds === option.value;
	                 return (
	                   <button
	                     key={option.value}
	                     onClick={() => handleSetAutoDelete(option.value)}
	                     disabled={isAutoDeleteLoading || !canEditAutoDelete}
	                     className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-colors ${active ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400' : 'border-theme text-[var(--text-primary)] hover:bg-white/5'} ${isAutoDeleteLoading || !canEditAutoDelete ? 'opacity-60 cursor-not-allowed' : ''}`}
	                   >
	                     {option.label}
	                   </button>
	                 );
	               })}
	               {!canEditAutoDelete && (
	                 <div className="text-xs text-slate-500 bg-white/5 border border-theme rounded-xl px-3 py-2">
	                   仅群主/管理员可修改自动删除设置
	                 </div>
	               )}
	               <button
	                 onClick={() => setShowAutoDeleteSheet(false)}
	                 disabled={isAutoDeleteLoading}
	                 className="w-full py-2.5 rounded-xl border border-theme text-sm text-slate-400 hover:text-[var(--text-primary)] transition-colors"
	               >
	                 关闭
	               </button>
	             </div>
	           </div>
	         </div>
	       )}

       {confirmAction && (
         <div className="fixed inset-0 z-[60] flex items-center justify-center px-6">
           <div
             className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
             onClick={() => !isActionSubmitting && setConfirmAction(null)}
           ></div>

           <div className="relative w-full max-w-sm card-bg rounded-[24px] p-6 border border-theme shadow-2xl animate-fade-in-up">
             <div className="mb-4">
               <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>确认操作</h3>
               <p className="text-xs text-slate-500 mt-1">
                 {confirmAction === 'leave' ? '确定退出该群聊吗？' : '确定解散该群聊吗？'}
               </p>
             </div>

             {actionError && (
               <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-2 mb-4">
                 {actionError}
               </div>
             )}

             <div className="grid grid-cols-2 gap-3">
               <button
                 onClick={() => setConfirmAction(null)}
                 disabled={isActionSubmitting}
                 className="w-full py-3 rounded-xl border border-theme text-sm font-bold text-slate-200 hover:bg-white/5 disabled:opacity-60"
               >
                 取消
               </button>
               <button
                 onClick={handleConfirmAction}
                 disabled={isActionSubmitting || (confirmAction === 'disband' && !isOwner)}
                 className={`w-full py-3 rounded-xl text-sm font-bold text-black bg-accent-gradient ${isActionSubmitting ? 'opacity-60 cursor-not-allowed' : 'active:scale-95 transition-transform'}`}
               >
                 {isActionSubmitting ? '处理中...' : '确认'}
               </button>
             </div>
           </div>
         </div>
       )}

       {showRename && (
         <div className="fixed inset-0 z-[70] flex items-center justify-center px-6">
           <div
             className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
             onClick={() => !isRenaming && setShowRename(false)}
           ></div>

           <div className="relative w-full max-w-sm card-bg rounded-[24px] p-6 border border-theme shadow-2xl animate-fade-in-up">
             <div className="flex justify-between items-center mb-5">
               <div>
                 <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>修改群名称</h3>
                 <p className="text-xs text-slate-500 mt-1">2-20字，仅中文/英文/数字</p>
               </div>
               <button
                 onClick={() => setShowRename(false)}
                 disabled={isRenaming}
                 className="text-slate-500 hover:text-slate-300 p-1 disabled:opacity-60"
                 aria-label="关闭"
               >
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                 </svg>
               </button>
             </div>

             <div className="space-y-3">
               <input
                 type="text"
                 value={renameDraft}
                 onChange={(event) => {
                   setRenameDraft(event.target.value);
                   setRenameError('');
                 }}
                 placeholder="请输入群名称"
                 maxLength={20}
                 className="w-full bg-[var(--bg-primary)] border border-theme rounded-xl px-4 py-3.5 text-sm outline-none text-[var(--text-primary)] focus:border-accent/50 transition-colors"
                 autoFocus
               />
               {renameError && (
                 <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-2">
                   {renameError}
                 </div>
               )}
             </div>

             <div className="grid grid-cols-2 gap-3 mt-5">
               <button
                 onClick={() => setShowRename(false)}
                 disabled={isRenaming}
                 className="w-full py-3 rounded-xl border border-theme text-sm font-bold text-slate-200 hover:bg-white/5 disabled:opacity-60"
               >
                 取消
               </button>
               <button
                 onClick={handleRenameSubmit}
                 disabled={isRenaming}
                 className={`w-full py-3 rounded-xl text-sm font-bold text-black bg-accent-gradient ${isRenaming ? 'opacity-60 cursor-not-allowed' : 'active:scale-95 transition-transform'}`}
               >
                 {isRenaming ? '保存中...' : '保存'}
               </button>
             </div>
           </div>
         </div>
       )}

       {showMembersSheet && (
         <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center">
           <div
             className="absolute inset-0 bg-black/50 backdrop-blur-sm"
             onClick={() => setShowMembersSheet(false)}
           ></div>
           <div className="relative w-full sm:max-w-md card-bg rounded-t-2xl sm:rounded-2xl border border-theme shadow-2xl animate-fade-in-up">
             <div className="p-5 border-b border-theme flex items-center justify-between">
               <div>
                 <h3 className="text-sm font-semibold text-[var(--text-primary)]">群成员</h3>
                 <p className="text-xs text-slate-500 mt-1">
                   {membersLoaded ? `${members.length} 人` : '加载中...'}
                 </p>
               </div>
               <button
                 onClick={() => setShowMembersSheet(false)}
                 className="text-slate-500 hover:text-slate-300 p-1"
                 aria-label="关闭"
               >
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                 </svg>
               </button>
             </div>

             <div className="max-h-[60vh] overflow-y-auto p-4 space-y-3">
               {membersLoaded ? (
                 members.map(member => {
                   const displayName = member.displayName || `用户${member.memberId}`;
                   const isOwnerBadge = group?.ownerId && String(member.memberId) === String(group.ownerId);
                   const isAdminBadge = group?.adminIds?.includes(String(member.memberId));
                   return (
                     <button
                       key={member.memberId}
                       type="button"
                       onClick={() => handleMemberSelect(member)}
                       className="w-full flex items-center justify-between p-3 rounded-xl bg-[var(--bg-primary)] border border-theme hover:border-accent transition-colors"
                     >
                       <div className="flex items-center gap-3">
                         <img
                           src={`https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(member.memberId)}`}
                           alt={displayName}
                           className="w-10 h-10 rounded-full object-cover border border-theme"
                         />
                         <div>
                           <div className="text-sm font-semibold text-[var(--text-primary)]">{displayName}</div>
                           <div className="text-[10px] text-slate-500">ID: {member.memberId}</div>
                         </div>
                       </div>
                       <div className="flex items-center gap-2">
                         {isOwnerBadge && (
                           <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded-full">
                             群主
                           </span>
                         )}
                         {!isOwnerBadge && isAdminBadge && (
                           <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-full">
                             管理员
                           </span>
                         )}
                       </div>
                     </button>
                   );
                 })
               ) : (
                 <div className="text-sm text-slate-500 text-center py-8">成员加载中...</div>
               )}
             </div>
           </div>
         </div>
       )}

       {showMemberActions && (
         <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center">
           <div
             className="absolute inset-0 bg-black/50 backdrop-blur-sm"
             onClick={handleMemberActionsClose}
           ></div>
           <div className="relative w-full sm:max-w-sm card-bg rounded-t-2xl sm:rounded-2xl p-5 border border-theme shadow-2xl animate-fade-in-up">
             <div className="flex items-start justify-between">
               <div>
                 <h3 className="text-sm font-semibold text-[var(--text-primary)]">成员操作</h3>
                 <p className="text-xs text-slate-500 mt-1">{memberDisplayName}</p>
                 <p className="text-[10px] text-slate-600 mt-1">ID: {selectedMemberId || '-'}</p>
               </div>
               {isMemberLoading && (
                 <span className="text-[10px] text-slate-500">资料加载中...</span>
               )}
             </div>

             {memberActionError && (
               <div className="mt-3 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-3 py-2">
                 {memberActionError}
               </div>
             )}

             {memberActionSuccess && (
               <div className="mt-3 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2">
                 {memberActionSuccess}
               </div>
             )}

             <div className="mt-4 space-y-2">
               {canManageMemberActions ? (
                 <>
                   {canStartPrivateChat && (
                     <button
                       onClick={handleStartPrivateChat}
                       className="w-full py-3 rounded-xl border border-theme text-sm text-[var(--text-primary)] hover:bg-white/5 transition-colors"
                     >
                       私聊
                     </button>
                   )}
                   <button
                     onClick={handleSendFriendRequest}
                     disabled={isMemberRequesting || memberIsFriend || !canAddFriend}
                     className={`w-full text-white font-bold py-3 rounded-xl bg-emerald-500/90 ${isMemberRequesting || memberIsFriend || !canAddFriend ? 'opacity-60 cursor-not-allowed' : 'active:scale-95 transition-transform'}`}
                   >
                     {memberIsFriend ? '已是好友' : (isMemberRequesting ? '发送中...' : '加好友')}
                   </button>
                 </>
               ) : (
                 <div className="text-xs text-slate-500 bg-white/5 border border-theme rounded-xl px-3 py-2">
                   仅群主/管理员可操作
                 </div>
               )}
               <button
                 onClick={handleMemberActionsClose}
                 className="w-full py-3 rounded-xl border border-theme text-sm text-slate-400 hover:bg-white/5 transition-colors"
               >
                 关闭
               </button>
             </div>
           </div>
         </div>
       )}
    </div>
  );
};

export default GroupDetail;

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useIm } from '../context/ImContext';
import { friendApi, FriendItem, FriendProfile } from '../services/api/friend';
import { imApi, IMGroupAnnouncementResponse } from '../services/api/im';
import { IMConversationType, IMMessageType } from '../services/im/client';

interface ChatMessage {
  id: string;
  text: string;
  sender: 'me' | 'other';
  senderName?: string;
  senderId?: string;
  time: string;
  type: 'text' | 'image';
  imageUrl?: string;
  sentAt?: number;
  status?: 'failed' | 'sending';
  isLocal?: boolean;
}

const EMOJIS = ['😀', '😂', '🤣', '😍', '😭', '😡', '👍', '🙏', '🎉', '🔥', '❤️', '💔', '💩', '👻', '💀', '👽', '🤖', '🎃', '🎄', '🎁', '🎈', '💪', '👀', '👂', '👃', '🧠', '🦷', '🦴', '🤝', '👋'];

const ACTION_ITEMS = [
  { name: '相册', icon: '🖼️' },
  { name: '拍摄', icon: '📷' },
  { name: '位置', icon: '📍' },
  { name: '红包', icon: '🧧' },
  { name: '文件', icon: '📁' },
  { name: '收藏', icon: '⭐' },
  { name: '名片', icon: '🎫' },
  { name: '语音', icon: '🎤' }
];
const MAX_ANNOUNCEMENT_LENGTH = 100;

const Chat: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const endRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const cutoffTimeRef = useRef(Date.now() - 3 * 24 * 60 * 60 * 1000);
  const enableImDebug = false;
  const logIm = (...args: any[]) => {
    if (!enableImDebug) return;
    console.log('[IM Chat]', ...args);
  };
  const { user } = useAuth();
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [groupTitle, setGroupTitle] = useState('');
  const [memberCount, setMemberCount] = useState<number | null>(null);
  const [announcement, setAnnouncement] = useState<IMGroupAnnouncementResponse | null>(null);
  const [isAnnouncementLoading, setIsAnnouncementLoading] = useState(false);
  const [isAnnouncementEditorOpen, setIsAnnouncementEditorOpen] = useState(false);
  const [announcementDraft, setAnnouncementDraft] = useState('');
  const [announcementError, setAnnouncementError] = useState('');
  const [isAnnouncementSaving, setIsAnnouncementSaving] = useState(false);
  const [showFriendMenu, setShowFriendMenu] = useState(false);
  const [showFriendProfile, setShowFriendProfile] = useState(false);
  const [friendProfile, setFriendProfile] = useState<FriendItem | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isRemovingFriend, setIsRemovingFriend] = useState(false);
  const [friendActionError, setFriendActionError] = useState('');
  const [showMemberMenu, setShowMemberMenu] = useState(false);
  const [showMemberProfile, setShowMemberProfile] = useState(false);
  const [memberProfile, setMemberProfile] = useState<FriendProfile | null>(null);
  const [selectedMember, setSelectedMember] = useState<{ id: string; name?: string } | null>(null);
  const [memberIsFriend, setMemberIsFriend] = useState(false);
  const [memberActionError, setMemberActionError] = useState('');
  const [memberActionSuccess, setMemberActionSuccess] = useState('');
  const [isMemberLoading, setIsMemberLoading] = useState(false);
  const [isMemberRequesting, setIsMemberRequesting] = useState(false);
  const [groupOwnerId, setGroupOwnerId] = useState('');
  const [groupAdminIds, setGroupAdminIds] = useState<string[]>([]);
  const {
    ready,
    connected,
    conversations,
    messagesByConversation,
    loadMessages,
    loadMoreMessages,
    sendTextMessage,
    clearConversationUnread,
    refreshConversations,
    getGroupInfo,
    getGroupMembers
  } = useIm();

  const conversation = conversations.find((item: any) => item.conversationId === id);
  const isGroup = useMemo(() => (
    conversation?.conversationType === IMConversationType.GROUP || id?.startsWith('g') || id?.startsWith('ng')
  ), [conversation?.conversationType, id]);
  const conversationType = isGroup ? IMConversationType.GROUP : IMConversationType.PRIVATE;
  const conversationKey = id ? `${conversationType}:${id}` : '';
  const imMessages = conversationKey ? (messagesByConversation[conversationKey] || []) : [];
  const chatTitle = conversation?.conversationTitle || groupTitle || (isGroup ? '群聊' : '私聊');
  const friendId = !isGroup && id ? Number(id) : 0;
  const hasFriendId = Number.isFinite(friendId) && friendId > 0;
  const currentUserId = user?.ID ? String(user.ID) : '';
  const selectedMemberId = selectedMember?.id || '';
  const selectedMemberNumericId = /^[0-9]+$/.test(selectedMemberId) ? Number(selectedMemberId) : 0;
  const isGroupOwnerOrAdmin = Boolean(
    isGroup
      && currentUserId
      && (groupOwnerId === currentUserId || groupAdminIds.includes(currentUserId))
  );
  const canStartPrivateChat = isGroupOwnerOrAdmin && selectedMemberNumericId > 0;
  const friendDisplayName = friendProfile?.displayName
    || friendProfile?.username
    || friendProfile?.phone
    || (hasFriendId ? `用户${friendId}` : chatTitle);
  const memberDisplayName = memberProfile?.username
    || selectedMember?.name
    || (selectedMemberNumericId ? `用户${selectedMemberNumericId}` : '群友');
  const isOffline = !connected;

  const formatMessageText = (msg: any) => {
    if (!msg) return '';
    if (msg.name === IMMessageType.TEXT) {
      return msg.content?.text || msg.content?.content || '';
    }
    if (msg.name === IMMessageType.IMAGE) return '[图片]';
    if (msg.name === IMMessageType.FILE) return '[文件]';
    if (msg.name === IMMessageType.VOICE) return '[语音]';
    if (msg.name === IMMessageType.VIDEO) return '[视频]';
    return msg.content?.text || msg.content?.content || '[新消息]';
  };

  const formatAnnouncementTime = (value?: number) => {
    if (!value) return '';
    return new Date(value).toLocaleString();
  };

  const countAnnouncementChars = (value: string) => Array.from(value || '').length;
  const announcementLength = countAnnouncementChars(announcementDraft);
  const announcementRemaining = MAX_ANNOUNCEMENT_LENGTH - announcementLength;
  const parseGroupAdminIds = (value?: string) => {
    if (!value) return [];
    return value
      .split(/[,\s;|]+/)
      .map(item => item.trim())
      .filter(Boolean);
  };

  const loadFriendProfile = useCallback(async () => {
    if (!hasFriendId) {
      setFriendProfile(null);
      return;
    }
    setIsProfileLoading(true);
    setFriendActionError('');
    try {
      const res = await friendApi.listFriends(500);
      const match = (res.items || []).find((item) => item.id === friendId) || null;
      setFriendProfile(match);
    } catch (err: any) {
      setFriendProfile(null);
      setFriendActionError(err?.message || '好友信息获取失败');
    } finally {
      setIsProfileLoading(false);
    }
  }, [friendId, hasFriendId]);

  const loadMemberProfile = useCallback(async () => {
    if (!selectedMember) {
      setMemberProfile(null);
      setMemberIsFriend(false);
      return;
    }
    setIsMemberLoading(true);
    setMemberActionError('');
    setMemberActionSuccess('');
    try {
      let profile: FriendProfile | null = null;
      if (selectedMemberNumericId) {
        const res = await friendApi.search(String(selectedMemberNumericId));
        profile = res?.[0] || null;
      }
      let isFriend = false;
      if (selectedMemberNumericId) {
        const friendsRes = await friendApi.listFriends(500);
        isFriend = (friendsRes.items || []).some(item => item.id === selectedMemberNumericId);
      }
      setMemberProfile(profile);
      setMemberIsFriend(isFriend);
    } catch (err: any) {
      setMemberProfile(null);
      setMemberIsFriend(false);
      setMemberActionError(err?.message || '好友信息获取失败');
    } finally {
      setIsMemberLoading(false);
    }
  }, [selectedMember, selectedMemberNumericId]);

  useEffect(() => {
    if (!id || !ready) return;
    setIsLoading(true);
    setHasMore(true);
    setIsLoadingMore(false);
    cutoffTimeRef.current = Date.now() - 3 * 24 * 60 * 60 * 1000;
    loadMessages(id, conversationType)
      .catch(() => null)
      .finally(() => setIsLoading(false));
  }, [id, ready, conversationType, loadMessages]);

  useEffect(() => {
    if (!id || !ready) return;
    if (!conversation?.unreadCount) return;
    const latestUnread = Number(conversation?.latestUnreadIndex || 0);
    const latestRead = Number(conversation?.latestReadIndex || 0);
    const unreadCount = Number(conversation?.unreadCount || 0);
    const unreadIndex = latestUnread > 0 ? latestUnread : (latestRead > 0 && unreadCount > 0 ? latestRead + unreadCount : 0);
    if (!unreadIndex) return;
    clearConversationUnread(id, conversationType, unreadIndex).catch(() => null);
  }, [
    id,
    ready,
    conversationType,
    conversation?.unreadCount,
    conversation?.latestUnreadIndex,
    conversation?.latestReadIndex,
    clearConversationUnread
  ]);

  useEffect(() => {
    if (!id || !isGroup) {
      setGroupTitle('');
      setMemberCount(null);
      setGroupOwnerId('');
      setGroupAdminIds([]);
      return;
    }
    let active = true;
    Promise.all([
      getGroupInfo(id),
      getGroupMembers(id)
    ]).then(([info, members]) => {
      if (!active) return;
      if (info?.groupName) setGroupTitle(info.groupName);
      if (members?.items) setMemberCount(members.items.length);
      const ext = info?.extFields || {};
      const settings = info?.settings || {};
      const ownerId = (ext.grp_creator || settings.grp_creator || '').trim();
      const adminRaw = ext.grp_administrators || settings.grp_administrators || '';
      setGroupOwnerId(ownerId);
      setGroupAdminIds(parseGroupAdminIds(adminRaw));
    }).catch(() => null);

    return () => {
      active = false;
    };
  }, [getGroupInfo, getGroupMembers, id, isGroup]);

  useEffect(() => {
    if (!id || !isGroup) {
      setAnnouncement(null);
      return;
    }
    let active = true;
    setIsAnnouncementLoading(true);
    setAnnouncementError('');
    imApi.getGroupAnnouncement(id)
      .then((res) => {
        if (!active) return;
        setAnnouncement(res);
        setAnnouncementDraft(res.content || '');
      })
      .catch(() => {
        if (!active) return;
        setAnnouncement(null);
      })
      .finally(() => {
        if (!active) return;
        setIsAnnouncementLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id, isGroup]);

  useEffect(() => {
    setFriendProfile(null);
    setFriendActionError('');
    setShowFriendMenu(false);
    setShowFriendProfile(false);
    setSelectedMember(null);
    setMemberProfile(null);
    setMemberIsFriend(false);
    setMemberActionError('');
    setMemberActionSuccess('');
    setShowMemberMenu(false);
    setShowMemberProfile(false);
  }, [id]);

  useEffect(() => {
    if (!showFriendMenu && !showFriendProfile) return;
    loadFriendProfile().catch(() => null);
  }, [showFriendMenu, showFriendProfile, loadFriendProfile]);

  useEffect(() => {
    if (!showMemberMenu && !showMemberProfile) return;
    loadMemberProfile().catch(() => null);
  }, [showMemberMenu, showMemberProfile, loadMemberProfile]);

  useEffect(() => {
    const cutoffTime = cutoffTimeRef.current;
    const filtered = imMessages.filter((msg: any) => {
      const sentTime = msg?.sentTime || 0;
      return sentTime === 0 || sentTime >= cutoffTime;
    });
    logIm('messages updated', {
      total: imMessages.length,
      filtered: filtered.length,
      cutoffTime
    });
    const mapped = filtered.map((msg: any) => ({
      id: msg.messageId || msg.tid || String(msg.sentTime || Date.now()),
      text: formatMessageText(msg),
      sender: msg.isSender ? 'me' : 'other',
      senderName: msg.sender?.name || msg.senderName,
      senderId: msg.sender?.id || msg.senderId,
      time: msg.sentTime ? new Date(msg.sentTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
      type: msg.name === IMMessageType.IMAGE ? 'image' : 'text',
      imageUrl: msg.content?.imageUri || msg.content?.url,
      sentAt: msg.sentTime || 0
    }));
    const combined = [...mapped, ...localMessages].sort((a, b) => (a.sentAt || 0) - (b.sentAt || 0));
    setMessages(combined);
  }, [imMessages, localMessages]);

  useEffect(() => {
    setLocalMessages([]);
  }, [id]);

  useEffect(() => {
    if (!isLoading && !isLoadingMore) {
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isLoadingMore, showActionMenu, showEmojiPicker]);

  const getOldestTimeInWindow = (list: any[], cutoffTime: number) => {
    let oldest = 0;
    list.forEach((msg) => {
      const sentTime = msg?.sentTime || 0;
      if (sentTime <= 0 || sentTime < cutoffTime) return;
      if (!oldest || sentTime < oldest) {
        oldest = sentTime;
      }
    });
    return oldest;
  };

  const handleLoadMore = async () => {
    if (!id || isLoadingMore || !hasMore) return;
    const cutoffTime = cutoffTimeRef.current;
    const oldestTime = getOldestTimeInWindow(imMessages, cutoffTime);
    if (!oldestTime || oldestTime <= cutoffTime) {
      logIm('loadMore blocked', { reason: 'no older time in window', oldestTime, cutoffTime });
      setHasMore(false);
      return;
    }

    const container = scrollRef.current;
    const prevHeight = container?.scrollHeight || 0;
    const prevScrollTop = container?.scrollTop || 0;
    setIsLoadingMore(true);
    try {
      const beforeTime = Math.max(oldestTime - 1, 0);
      logIm('loadMore start', { beforeTime, oldestTime, cutoffTime, count: 30 });
      const { messages: moreMessages, isFinished } = await loadMoreMessages(id, conversationType, beforeTime, 30);
      logIm('loadMore done', { received: moreMessages?.length || 0, isFinished });
      if (!moreMessages || moreMessages.length === 0 || isFinished) {
        setHasMore(false);
      }
      const allTimes = [...imMessages, ...(moreMessages || [])]
        .map((msg: any) => msg?.sentTime || 0)
        .filter((value: number) => value >= cutoffTime);
      if (allTimes.length > 0) {
        const nextOldest = Math.min(...allTimes);
        if (nextOldest <= cutoffTime) {
          setHasMore(false);
        }
      }
    } finally {
      setIsLoadingMore(false);
      requestAnimationFrame(() => {
        if (!container) return;
        const newHeight = container.scrollHeight;
        const delta = newHeight - prevHeight;
        container.scrollTop = prevScrollTop + delta;
      });
    }
  };

  const handleScroll = () => {
    const container = scrollRef.current;
    if (!container || isLoadingMore || !hasMore) return;
    if (container.scrollTop <= 60) {
      logIm('scroll top reached', { scrollTop: container.scrollTop });
      handleLoadMore();
    }
  };

  const handleSend = async () => {
    const content = inputText.trim();
    if (!content || !id) return;
    setInputText('');
    setShowEmojiPicker(false);
    setShowActionMenu(false);
    if (isOffline) {
      const now = Date.now();
      setLocalMessages(prev => ([
        ...prev,
        {
          id: `local-${now}-${Math.random().toString(36).slice(2, 8)}`,
          text: content,
          sender: 'me',
          time: new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'text',
          sentAt: now,
          status: 'failed',
          isLocal: true
        }
      ]));
      return;
    }
    try {
      await sendTextMessage(id, conversationType, content);
    } catch (e) {
      const now = Date.now();
      setLocalMessages(prev => ([
        ...prev,
        {
          id: `local-${now}-${Math.random().toString(36).slice(2, 8)}`,
          text: content,
          sender: 'me',
          time: new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'text',
          sentAt: now,
          status: 'failed',
          isLocal: true
        }
      ]));
    }
  };

  const handleRetryMessage = async (msg: ChatMessage) => {
    if (!id || msg.status !== 'failed') return;
    setLocalMessages(prev => prev.map(item => (
      item.id === msg.id ? { ...item, status: 'sending' } : item
    )));
    try {
      await sendTextMessage(id, conversationType, msg.text);
      setLocalMessages(prev => prev.filter(item => item.id !== msg.id));
    } catch (e) {
      setLocalMessages(prev => prev.map(item => (
        item.id === msg.id ? { ...item, status: 'failed' } : item
      )));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  const handleHeaderRightClick = () => {
    if (!id) return;
    if (isGroup) {
      navigate(`/group/${id}`);
      return;
    }
    setFriendActionError('');
    setShowFriendMenu(true);
  };

  const handleViewFriendProfile = () => {
    setShowFriendMenu(false);
    setShowFriendProfile(true);
  };

  const handleRemoveFriend = async () => {
    if (!hasFriendId) {
      setFriendActionError('无法识别好友信息');
      return;
    }
    if (!window.confirm('确定删除好友？')) return;
    setIsRemovingFriend(true);
    setFriendActionError('');
    try {
      await friendApi.removeFriend(friendId);
      await refreshConversations().catch(() => null);
      setShowFriendMenu(false);
      setShowFriendProfile(false);
      navigate(-1);
    } catch (err: any) {
      setFriendActionError(err?.message || '删除失败');
    } finally {
      setIsRemovingFriend(false);
    }
  };

  const handleAvatarClick = (msg: ChatMessage) => {
    if (msg.sender === 'me') return;
    if (!isGroup) {
      setShowFriendMenu(false);
      setFriendActionError('');
      setShowFriendProfile(true);
      return;
    }
    const senderId = String(msg.senderId || '');
    setSelectedMember({
      id: senderId,
      name: msg.senderName || '群友'
    });
    setMemberActionError('');
    setMemberActionSuccess('');
    setShowMemberMenu(true);
  };

  const handleViewMemberProfile = () => {
    setShowMemberMenu(false);
    setShowMemberProfile(true);
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
    setShowMemberMenu(false);
    setShowMemberProfile(false);
    navigate(`/chat/${selectedMemberNumericId}`);
  };

  const handleSendFriendRequest = async () => {
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
      await friendApi.createRequest(selectedMemberNumericId);
      setMemberActionSuccess('好友申请已发送');
    } catch (err: any) {
      setMemberActionError(err?.message || '发送失败');
    } finally {
      setIsMemberRequesting(false);
    }
  };

  const handleHeaderDoubleClick = () => {
    const container = scrollRef.current;
    if (!container) return;
    container.scrollTo({ top: 0, behavior: 'smooth' });
    window.setTimeout(() => {
      handleLoadMore().catch(() => null);
    }, 120);
  };

  const openAnnouncementEditor = () => {
    setAnnouncementDraft(announcement?.content || '');
    setAnnouncementError('');
    setIsAnnouncementEditorOpen(true);
  };

  const closeAnnouncementEditor = () => {
    setIsAnnouncementEditorOpen(false);
    setAnnouncementError('');
  };

  const handleAnnouncementSave = async () => {
    if (!id || isAnnouncementSaving) return;
    const trimmed = announcementDraft.trim();
    if (countAnnouncementChars(trimmed) > MAX_ANNOUNCEMENT_LENGTH) {
      setAnnouncementError(`公告最多 ${MAX_ANNOUNCEMENT_LENGTH} 字`);
      return;
    }
    setIsAnnouncementSaving(true);
    setAnnouncementError('');
    try {
      const res = await imApi.setGroupAnnouncement({ groupId: id, content: trimmed });
      setAnnouncement(res);
      setAnnouncementDraft(res.content || '');
      setIsAnnouncementEditorOpen(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : '公告更新失败';
      setAnnouncementError(message);
    } finally {
      setIsAnnouncementSaving(false);
    }
  };

  const toggleActionMenu = () => {
    setShowActionMenu((prev) => !prev);
    setShowEmojiPicker(false);
  };

  const toggleEmojiPicker = () => {
    setShowEmojiPicker((prev) => !prev);
    setShowActionMenu(false);
  };

  const handleEmojiClick = (emoji: string) => {
    setInputText((prev) => prev + emoji);
  };

  const handleInputFocus = () => {
    setShowActionMenu(false);
    setShowEmojiPicker(false);
  };

  const handleUnsupported = (label: string) => {
    window.alert(`${label}暂不支持`);
    setShowActionMenu(false);
  };

  const statusLabel = isGroup
    ? (memberCount === null ? '群聊' : `${memberCount} 人在线`)
    : <span className="text-emerald-500">● 在线</span>;

  return (
    <div className="fixed inset-0 z-[50] app-bg flex flex-col transition-colors duration-500">
      {/* Header */}
      <div
        className="flex-none glass-bg p-4 shadow-sm flex items-center justify-between border-b border-theme transition-colors duration-500 relative z-20"
        onDoubleClick={handleHeaderDoubleClick}
      >
         <div className="flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="text-slate-500 hover:text-[var(--text-primary)] mr-3 p-2 -ml-2 rounded-full transition-colors active:bg-white/10 cursor-pointer"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
               <h1 className="text-lg font-bold leading-none max-w-[200px] truncate" style={{color: 'var(--text-primary)'}}>{chatTitle}</h1>
               <span className="text-[10px] text-slate-500 flex items-center mt-0.5">
                 {statusLabel}
               </span>
            </div>
         </div>
         <button
           onClick={handleHeaderRightClick}
           className="text-slate-500 hover:text-[var(--text-primary)] p-2 -mr-2 rounded-full active:bg-white/10 transition-colors"
         >
           {isGroup ? (
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
             </svg>
           ) : (
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
             </svg>
           )}
         </button>
      </div>

      {!connected && (
        <div className="flex-none bg-rose-500/10 border-b border-rose-500/20 text-rose-400 text-xs px-4 py-2 flex items-center gap-2">
          <span className="font-bold">离线</span>
          <span>消息发送失败可点击叹号重试</span>
        </div>
      )}

      {isGroup && (
        <div className="flex-none border-b border-theme bg-[var(--bg-card)]/80 backdrop-blur">
          <div className="px-4 py-2.5 flex items-start gap-3">
            <span className="text-[10px] uppercase tracking-wide text-slate-500 mt-1">公告</span>
            <div className="flex-1">
              {isAnnouncementLoading ? (
                <div className="text-xs text-slate-500">公告加载中...</div>
              ) : (
                <>
                  <div className={`text-sm leading-relaxed ${announcement?.content ? 'text-[var(--text-primary)]' : 'text-slate-500 italic'}`}>
                    {announcement?.content || '暂无公告'}
                  </div>
                  {announcement?.updatedAt ? (
                    <div className="text-[10px] text-slate-500 mt-1">
                      更新于 {formatAnnouncementTime(announcement.updatedAt)}
                    </div>
                  ) : null}
                </>
              )}
            </div>
            {announcement?.canEdit && !isAnnouncementLoading ? (
              <button
                onClick={openAnnouncementEditor}
                className="text-xs text-emerald-500 hover:text-emerald-400 transition-colors"
              >
                编辑
              </button>
            ) : null}
          </div>
        </div>
      )}

      {/* Message Area */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-transparent overscroll-contain"
        onClick={() => { setShowActionMenu(false); setShowEmojiPicker(false); }}
      >
         {isLoading ? (
            <div className="flex justify-center pt-10">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
            </div>
         ) : (
           <>
             {isLoadingMore && (
               <div className="text-center text-xs text-slate-500">加载中...</div>
             )}
             {!hasMore && (
               <div className="text-center text-xs text-slate-500">仅显示最近3天消息</div>
             )}
             <div className="text-center text-xs text-slate-500 my-4">昨天 10:00</div>
             {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'} mb-4 animate-fade-in-up`}>
                   {msg.sender === 'other' && (
                      <div className="flex-shrink-0 mr-2 flex flex-col items-center">
                        <div
                           className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden shadow-sm border border-theme cursor-pointer active:scale-95 transition-transform"
                           onClick={(e) => { e.stopPropagation(); handleAvatarClick(msg); }}
                        >
                           <img
                             src={`https://picsum.photos/50/50?random=${isGroup ? (msg.senderName?.length || 0) + 10 : id}`}
                             alt="avatar"
                             className="w-full h-full object-cover"
                           />
                        </div>
                      </div>
                   )}

                   <div className="flex flex-col">
                      {msg.sender === 'other' && isGroup && (
                         <span className="text-[10px] text-slate-500 mb-1 ml-1">{msg.senderName || '群友'}</span>
                      )}

                      {msg.type === 'image' && msg.imageUrl ? (
                        <div className={`rounded-xl overflow-hidden border border-theme shadow-sm max-w-[200px] ${msg.sender === 'me' ? 'rounded-tr-sm' : 'rounded-tl-sm'}`}>
                          <img src={msg.imageUrl} alt="sent" className="w-full h-auto" />
                        </div>
                      ) : (
                        <div
                          className={`max-w-[75vw] px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm break-words relative group ${
                             msg.sender === 'me'
                             ? 'bg-accent-gradient text-black rounded-tr-sm'
                             : 'card-bg text-[var(--text-primary)] border border-theme rounded-tl-sm'
                          }`}
                        >
                          {msg.text}
                          <div className={`text-[9px] mt-1 text-right opacity-60 ${msg.sender === 'me' ? 'text-black' : 'text-slate-400'}`}>
                             {msg.time}
                          </div>
                        </div>
                      )}
                   </div>

                   {msg.sender === 'me' && msg.status === 'failed' && (
                     <button
                       onClick={(e) => { e.stopPropagation(); handleRetryMessage(msg); }}
                       className="ml-2 w-6 h-6 rounded-full border border-rose-500/40 text-rose-400 flex items-center justify-center text-xs font-bold hover:bg-rose-500/10"
                       title="点击重发"
                     >
                       !
                     </button>
                   )}

                   {msg.sender === 'me' && (
                     <div className="flex-shrink-0 ml-2">
                        <div className="w-10 h-10 rounded-full bg-slate-800 overflow-hidden shadow-sm border border-theme">
                          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=User" className="w-full h-full object-cover" />
                        </div>
                     </div>
                   )}
                </div>
             ))}
             <div ref={endRef} />
           </>
         )}
      </div>

      {/* Input Area */}
      <div className="flex-none z-20">
        <div className="p-3 pb-4 glass-bg border-t border-theme">
          <div className="flex items-center space-x-2">
              <button
                onClick={toggleActionMenu}
                className={`p-2 rounded-full border transition-all duration-300 ${
                  showActionMenu
                  ? 'bg-accent-gradient text-black border-transparent rotate-45'
                  : 'card-bg text-slate-500 border-theme hover:text-accent'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
              <div className="flex-1 bg-[var(--bg-primary)] rounded-full px-4 py-2 border border-theme focus-within:border-accent/50 transition-all flex items-center">
                <input
                  type="text"
                  value={inputText}
                  onFocus={handleInputFocus}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="发送消息..."
                  className="flex-1 bg-transparent border-none outline-none text-sm text-[var(--text-primary)] placeholder-slate-500"
                />
                <button
                  onClick={toggleEmojiPicker}
                  className={`text-slate-400 hover:text-accent transition-colors ${showEmojiPicker ? 'text-accent' : ''}`}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </button>
              </div>
              <button
                onClick={handleSend}
                disabled={!inputText.trim()}
                className={`p-2.5 rounded-full transition-all shadow-lg ${
                  inputText.trim()
                  ? 'bg-accent-gradient text-black hover:scale-105 active:scale-95'
                  : 'card-bg text-slate-500 border border-theme'
                }`}
              >
                <svg className="w-5 h-5 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
          </div>
        </div>

        {/* Expandable Panel */}
        {(showActionMenu || showEmojiPicker) && (
          <div className="h-64 bg-[var(--bg-card)] border-t border-theme overflow-y-auto animate-fade-in-up no-scrollbar pb-6">
             {showActionMenu && (
               <div className="grid grid-cols-4 gap-6 p-6">
                  {ACTION_ITEMS.map((item) => (
                    <div key={item.name} onClick={() => handleUnsupported(item.name)} className="flex flex-col items-center gap-2 cursor-pointer group">
                       <div className="w-14 h-14 bg-[var(--bg-primary)] rounded-2xl flex items-center justify-center text-2xl border border-theme shadow-sm group-hover:bg-white/5 transition-colors group-active:scale-95">
                          {item.icon}
                       </div>
                       <span className="text-xs text-slate-500">{item.name}</span>
                    </div>
                  ))}
               </div>
             )}

             {showEmojiPicker && (
               <div className="p-4 grid grid-cols-8 gap-2">
                  {EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => handleEmojiClick(emoji)}
                      className="text-2xl hover:bg-white/10 rounded-lg p-2 transition-colors active:scale-90"
                    >
                      {emoji}
                    </button>
                  ))}
               </div>
             )}
          </div>
        )}
      </div>

      {showMemberMenu && isGroup && (
        <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowMemberMenu(false)}
          ></div>
          <div className="relative w-full sm:max-w-sm card-bg rounded-t-2xl sm:rounded-2xl p-5 border border-theme shadow-2xl animate-fade-in-up">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">成员操作</h3>
                <p className="text-xs text-slate-500 mt-1">{memberDisplayName}</p>
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
              <button
                onClick={handleViewMemberProfile}
                className="w-full bg-accent-gradient text-black font-bold py-3 rounded-xl shadow-lg active:scale-95 transition-transform"
              >
                查看资料
              </button>
              {canStartPrivateChat && (
                <button
                  onClick={handleStartPrivateChat}
                  className="w-full py-3 rounded-xl border border-theme text-sm text-[var(--text-primary)] hover:bg-white/5 transition-colors"
                >
                  发起对话
                </button>
              )}
              <button
                onClick={handleSendFriendRequest}
                disabled={isMemberRequesting || memberIsFriend || !selectedMemberNumericId}
                className={`w-full text-white font-bold py-3 rounded-xl bg-emerald-500/90 ${isMemberRequesting || memberIsFriend || !selectedMemberNumericId ? 'opacity-60 cursor-not-allowed' : 'active:scale-95 transition-transform'}`}
              >
                {memberIsFriend ? '已是好友' : (isMemberRequesting ? '发送中...' : '加好友')}
              </button>
              <button
                onClick={() => setShowMemberMenu(false)}
                className="w-full py-2.5 rounded-xl border border-theme text-sm text-slate-400 hover:text-[var(--text-primary)] transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {showMemberProfile && isGroup && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center px-6">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowMemberProfile(false)}
          ></div>
          <div className="relative w-full max-w-sm card-bg rounded-[24px] p-6 border border-theme shadow-2xl animate-fade-in-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>成员资料</h3>
              <button
                onClick={() => setShowMemberProfile(false)}
                className="text-slate-500 hover:text-slate-300 p-1"
              >
                关闭
              </button>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full overflow-hidden border border-theme">
                <img
                  src={memberProfile?.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${selectedMemberNumericId || 'member'}`}
                  alt="avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="text-base font-bold text-[var(--text-primary)]">{memberDisplayName}</div>
                <div className="text-xs text-slate-500">ID: {selectedMemberNumericId || '-'}</div>
              </div>
            </div>
            <div className="mt-4 space-y-2 text-xs text-slate-500">
              <div className="flex items-center justify-between">
                <span>用户名</span>
                <span className="text-[var(--text-primary)]">{memberProfile?.username || memberDisplayName}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {showFriendMenu && !isGroup && (
        <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowFriendMenu(false)}
          ></div>
          <div className="relative w-full sm:max-w-sm card-bg rounded-t-2xl sm:rounded-2xl p-5 border border-theme shadow-2xl animate-fade-in-up">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">好友操作</h3>
                <p className="text-xs text-slate-500 mt-1">{friendDisplayName}</p>
              </div>
              {isProfileLoading && (
                <span className="text-[10px] text-slate-500">资料加载中...</span>
              )}
            </div>

            {friendActionError && (
              <div className="mt-3 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-3 py-2">
                {friendActionError}
              </div>
            )}

            <div className="mt-4 space-y-2">
              <button
                onClick={handleViewFriendProfile}
                className="w-full bg-accent-gradient text-black font-bold py-3 rounded-xl shadow-lg active:scale-95 transition-transform"
              >
                查看资料
              </button>
              <button
                onClick={handleRemoveFriend}
                disabled={isRemovingFriend || !hasFriendId}
                className={`w-full text-white font-bold py-3 rounded-xl bg-rose-500/90 ${isRemovingFriend || !hasFriendId ? 'opacity-60 cursor-not-allowed' : 'active:scale-95 transition-transform'}`}
              >
                {isRemovingFriend ? '删除中...' : '删除好友'}
              </button>
              <button
                onClick={() => setShowFriendMenu(false)}
                className="w-full py-2.5 rounded-xl border border-theme text-sm text-slate-400 hover:text-[var(--text-primary)] transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {showFriendProfile && !isGroup && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center px-6">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowFriendProfile(false)}
          ></div>
          <div className="relative w-full max-w-sm card-bg rounded-[24px] p-6 border border-theme shadow-2xl animate-fade-in-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>好友资料</h3>
              <button
                onClick={() => setShowFriendProfile(false)}
                className="text-slate-500 hover:text-slate-300 p-1"
              >
                关闭
              </button>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full overflow-hidden border border-theme">
                <img
                  src={friendProfile?.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${friendId || 'friend'}`}
                  alt="avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="text-base font-bold text-[var(--text-primary)]">{friendDisplayName}</div>
                <div className="text-xs text-slate-500">ID: {hasFriendId ? friendId : '-'}</div>
              </div>
            </div>
            <div className="mt-4 space-y-2 text-xs text-slate-500">
              <div className="flex items-center justify-between">
                <span>用户名</span>
                <span className="text-[var(--text-primary)]">{friendProfile?.username || '-'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>手机号</span>
                <span className="text-[var(--text-primary)]">{friendProfile?.phone || '-'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {isAnnouncementEditorOpen && (
        <div className="fixed inset-0 z-[70] bg-black/40 flex items-end sm:items-center justify-center">
          <div className="w-full sm:max-w-md bg-[var(--bg-card)] border border-theme rounded-t-2xl sm:rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">编辑群公告</h2>
              <button
                onClick={closeAnnouncementEditor}
                className="text-slate-500 hover:text-[var(--text-primary)] transition-colors"
              >
                关闭
              </button>
            </div>
            <textarea
              value={announcementDraft}
              onChange={(e) => setAnnouncementDraft(e.target.value)}
              maxLength={MAX_ANNOUNCEMENT_LENGTH}
              rows={4}
              className="w-full bg-[var(--bg-primary)] border border-theme rounded-xl p-3 text-sm text-[var(--text-primary)] placeholder-slate-500 focus:outline-none focus:border-emerald-500/60 resize-none"
              placeholder="填写群公告（最多100字）"
            />
            <div className="flex items-center justify-between mt-2 text-[10px] text-slate-500">
              <span>{announcementError || '仅群主/管理员可修改公告'}</span>
              <span className={announcementRemaining < 0 ? 'text-rose-400' : ''}>
                {announcementRemaining} 字剩余
              </span>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={closeAnnouncementEditor}
                className="flex-1 py-2 rounded-full border border-theme text-sm text-slate-400 hover:text-[var(--text-primary)] transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleAnnouncementSave}
                disabled={announcementRemaining < 0 || isAnnouncementSaving}
                className={`flex-1 py-2 rounded-full text-sm font-semibold transition-all ${
                  announcementRemaining < 0 || isAnnouncementSaving
                    ? 'bg-slate-700/60 text-slate-400'
                    : 'bg-emerald-400 text-black hover:brightness-105'
                }`}
              >
                {isAnnouncementSaving ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;

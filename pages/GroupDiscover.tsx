import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIm } from '../context/ImContext';
import { useAuth } from '../context/AuthContext';
import { IMConversationType, IMMessageType } from '../services/im/client';
import { friendApi, FriendItem, FriendProfile, FriendRequestItem } from '../services/api/friend';

type ChatItem = {
  id: string;
  title: string;
  content: string;
  time: string;
  type: 'group' | 'social';
  read: boolean;
  avatar?: string;
  unreadCount?: number;
  conversationType: number;
  isTop?: boolean;
};

const GroupDiscover: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    ready,
    conversations,
    refreshConversations,
    removeConversation,
    setTopConversation,
    getGroupInfo,
    createGroup
  } = useIm();

  const [activeTab, setActiveTab] = useState<'chats' | 'contacts' | 'me'>('chats');
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddFriendModal, setShowAddFriendModal] = useState(false);
  const [headerSearch, setHeaderSearch] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [friendKeyword, setFriendKeyword] = useState('');
  const [friendError, setFriendError] = useState('');
  const [friendSuccess, setFriendSuccess] = useState('');
  const [friendResults, setFriendResults] = useState<FriendProfile[]>([]);
  const [friendSearchDone, setFriendSearchDone] = useState(false);
  const [friendSearchLoading, setFriendSearchLoading] = useState(false);
  const [friendRequestingId, setFriendRequestingId] = useState<number | null>(null);
  const [friendRemovingId, setFriendRemovingId] = useState<number | null>(null);
  const [selectedFriend, setSelectedFriend] = useState<FriendItem | null>(null);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [contactsError, setContactsError] = useState('');
  const [incomingRequests, setIncomingRequests] = useState<FriendRequestItem[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<FriendRequestItem[]>([]);
  const [friendList, setFriendList] = useState<FriendItem[]>([]);
  const [incomingPendingCount, setIncomingPendingCount] = useState(0);
  const [requestActionId, setRequestActionId] = useState<number | null>(null);
  const [createError, setCreateError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [openSwipeId, setOpenSwipeId] = useState<string | null>(null);
  const [swipeActionId, setSwipeActionId] = useState<string | null>(null);
  const swipeRef = useRef({ id: '', startX: 0, startY: 0, active: false });
  const [createFormData, setCreateFormData] = useState({
    name: '',
    category: '游戏交流',
    desc: '',
    tags: ''
  });

  useEffect(() => {
    if (!ready) {
      setIsLoading(true);
      return;
    }
    refreshConversations()
      .catch(() => null)
      .finally(() => setIsLoading(false));
  }, [ready, refreshConversations]);

  const loadContacts = useCallback(async () => {
    if (!user?.ID) {
      setContactsError('请先登录');
      setContactsLoading(false);
      setIncomingPendingCount(0);
      return;
    }
    setContactsLoading(true);
    setContactsError('');
    try {
      const [incomingRes, outgoingRes, friendsRes] = await Promise.all([
        friendApi.listRequests('incoming', 'pending', 1, 20),
        friendApi.listRequests('outgoing', 'pending', 1, 20),
        friendApi.listFriends(200)
      ]);
      setIncomingRequests(incomingRes.list || []);
      setOutgoingRequests(outgoingRes.list || []);
      setFriendList(friendsRes.items || []);
      setIncomingPendingCount(Number(incomingRes.total || (incomingRes.list || []).length));
    } catch (e: any) {
      setContactsError(e?.message || '加载失败');
    } finally {
      setContactsLoading(false);
    }
  }, [user?.ID]);

  const loadPendingRequestCount = useCallback(async () => {
    if (!user?.ID) {
      setIncomingPendingCount(0);
      return;
    }
    try {
      const incomingRes = await friendApi.listRequests('incoming', 'pending', 1, 1);
      setIncomingPendingCount(Number(incomingRes.total || (incomingRes.list || []).length));
    } catch {
      setIncomingPendingCount(0);
    }
  }, [user?.ID]);

  useEffect(() => {
    if (activeTab !== 'contacts') return;
    loadContacts();
  }, [activeTab, loadContacts]);

  useEffect(() => {
    loadPendingRequestCount();
  }, [loadPendingRequestCount]);

  const formatImTime = (timestamp?: number) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatImPreview = (message: any) => {
    if (!message) return '';
    if (message.name === IMMessageType.TEXT) {
      return message.content?.text || message.content?.content || '';
    }
    if (message.name === IMMessageType.IMAGE) return '[图片]';
    if (message.name === IMMessageType.FILE) return '[文件]';
    if (message.name === IMMessageType.VIDEO) return '[视频]';
    if (message.name === IMMessageType.VOICE) return '[语音]';
    return '[新消息]';
  };


  const chatList = useMemo<ChatItem[]>(() => {
    const list = conversations.map((conv: any) => {
      const isGroup = conv.conversationType === IMConversationType.GROUP;
      const latest = conv.latestMessage;
      return {
        id: conv.conversationId,
        title: conv.conversationTitle || (isGroup ? `群聊 ${conv.conversationId}` : conv.conversationId),
        content: formatImPreview(latest),
        time: formatImTime(latest?.sentTime || conv.sortTime),
        type: isGroup ? 'group' : 'social',
        read: !conv.unreadCount || conv.unreadCount === 0,
        avatar: conv.conversationPortrait,
        unreadCount: conv.unreadCount || 0,
        conversationType: conv.conversationType,
        isTop: Boolean(conv.isTop)
      };
    });

    const keyword = headerSearch.trim().toLowerCase();
    if (!keyword) return list;
    return list.filter(item => {
      const title = (item.title || '').toLowerCase();
      const id = (item.id || '').toLowerCase();
      return title.includes(keyword) || id.includes(keyword);
    });
  }, [conversations, headerSearch]);

  const handleChatClick = (chatId: string) => {
    if (openSwipeId === chatId) {
      setOpenSwipeId(null);
      return;
    }
    navigate(`/chat/${chatId}`);
  };

  const handleOpenJoinGroup = () => {
    setShowAddMenu(false);
    setSearchKeyword('');
    setSearchError('');
    setShowSearchModal(true);
  };

  const handleOpenAddFriend = () => {
    setShowAddMenu(false);
    setFriendKeyword('');
    setFriendError('');
    setFriendSuccess('');
    setFriendResults([]);
    setFriendSearchDone(false);
    setFriendSearchLoading(false);
    setFriendRequestingId(null);
    setShowAddFriendModal(true);
  };

  const handleOpenCreateGroup = () => {
    setShowAddMenu(false);
    setCreateError('');
    setCreateFormData({
      name: '',
      category: '游戏交流',
      desc: '',
      tags: ''
    });
    setShowCreateModal(true);
  };

  const handleSearchSubmit = async () => {
    const trimmed = searchKeyword.trim();
    if (!trimmed) {
      setSearchError('请输入群ID');
      return;
    }
    setIsSearching(true);
    setSearchError('');
    try {
      const info = await getGroupInfo(trimmed);
      if (!info || !info.groupId) {
        setSearchError('群组不存在');
        return;
      }
      setShowSearchModal(false);
      navigate(`/group/${info.groupId}`);
    } catch (e: any) {
      setSearchError(e?.message || '查询失败');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSwipeStart = (chatId: string, event: React.TouchEvent | React.MouseEvent) => {
    const point = 'touches' in event ? event.touches[0] : event;
    if (openSwipeId && openSwipeId !== chatId) {
      setOpenSwipeId(null);
    }
    swipeRef.current = {
      id: chatId,
      startX: point.clientX,
      startY: point.clientY,
      active: true
    };
  };

  const handleSwipeMove = (chatId: string, event: React.TouchEvent | React.MouseEvent) => {
    if (!swipeRef.current.active || swipeRef.current.id !== chatId) return;
    const point = 'touches' in event ? event.touches[0] : event;
    const deltaX = point.clientX - swipeRef.current.startX;
    const deltaY = point.clientY - swipeRef.current.startY;
    if (Math.abs(deltaY) > 28 && Math.abs(deltaY) > Math.abs(deltaX)) {
      swipeRef.current.active = false;
      return;
    }
    if (deltaX < -40) {
      setOpenSwipeId(chatId);
      swipeRef.current.active = false;
      return;
    }
    if (deltaX > 40 && openSwipeId === chatId) {
      setOpenSwipeId(null);
      swipeRef.current.active = false;
    }
  };

  const handleSwipeEnd = () => {
    swipeRef.current.active = false;
  };

  const handleFriendSearch = async () => {
    const trimmed = friendKeyword.trim();
    if (!trimmed) {
      setFriendError('请输入手机号或用户ID');
      return;
    }
    setFriendSearchLoading(true);
    setFriendError('');
    setFriendSuccess('');
    setFriendSearchDone(false);
    setFriendResults([]);
    try {
      const items = await friendApi.search(trimmed);
      setFriendResults(items);
      setFriendSearchDone(true);
      if (!items.length) {
        setFriendError('未找到用户');
      }
    } catch (e: any) {
      setFriendError(e?.message || '搜索失败');
    } finally {
      setFriendSearchLoading(false);
    }
  };

  const handleSendFriendRequest = async (targetId: number) => {
    setFriendRequestingId(targetId);
    setFriendError('');
    setFriendSuccess('');
    try {
      await friendApi.createRequest(targetId);
      setFriendSuccess('好友申请已发送');
      await loadContacts();
    } catch (e: any) {
      setFriendError(e?.message || '发送失败');
    } finally {
      setFriendRequestingId(null);
    }
  };

  const handleAcceptRequest = async (requestId: number) => {
    setRequestActionId(requestId);
    setContactsError('');
    try {
      await friendApi.acceptRequest(requestId);
      await loadContacts();
      await refreshConversations().catch(() => null);
    } catch (e: any) {
      setContactsError(e?.message || '操作失败');
    } finally {
      setRequestActionId(null);
    }
  };

  const handleRejectRequest = async (requestId: number) => {
    setRequestActionId(requestId);
    setContactsError('');
    try {
      await friendApi.rejectRequest(requestId);
      await loadContacts();
    } catch (e: any) {
      setContactsError(e?.message || '操作失败');
    } finally {
      setRequestActionId(null);
    }
  };

  const handleCancelRequest = async (requestId: number) => {
    setRequestActionId(requestId);
    setContactsError('');
    try {
      await friendApi.cancelRequest(requestId);
      await loadContacts();
    } catch (e: any) {
      setContactsError(e?.message || '操作失败');
    } finally {
      setRequestActionId(null);
    }
  };

  const handleRemoveFriend = async (friendId: number): Promise<boolean> => {
    setFriendRemovingId(friendId);
    setContactsError('');
    try {
      await friendApi.removeFriend(friendId);
      await loadContacts();
      await refreshConversations().catch(() => null);
      return true;
    } catch (e: any) {
      setContactsError(e?.message || '删除失败');
      return false;
    } finally {
      setFriendRemovingId(null);
    }
  };

  const handleFriendActionChat = (friend: FriendItem) => {
    setSelectedFriend(null);
    navigate(`/chat/${friend.id}`);
  };

  const handleFriendActionRemove = async (friend: FriendItem) => {
    const ok = await handleRemoveFriend(friend.id);
    if (ok) {
      setSelectedFriend(null);
    }
  };

  const handleCreateGroup = async () => {
    const name = createFormData.name.trim();
    if (!name) {
      setCreateError('请输入群名称');
      return;
    }
    setIsCreating(true);
    setCreateError('');
    try {
      const tags = createFormData.tags
        .split(/[, ]+/)
        .map(tag => tag.trim())
        .filter(Boolean);
      const payload = {
        groupName: name,
        category: createFormData.category.trim(),
        desc: createFormData.desc.trim(),
        tags
      };
      const res = await createGroup(payload);
      if (!res || !res.groupId) {
        setCreateError('创建失败');
        return;
      }
      setShowCreateModal(false);
      await refreshConversations().catch(() => null);
      window.alert(`创建成功，群ID：${res.groupId}`);
      navigate(`/group/${res.groupId}`);
    } catch (e: any) {
      setCreateError(e?.message || '创建失败');
    } finally {
      setIsCreating(false);
    }
  };

  const userName = user?.username || '游客';
  const userId = user?.ID ? String(user.ID) : '';
  const swipeOffset = 128;

  const handlePinToggle = async (chat: ChatItem) => {
    setSwipeActionId(chat.id);
    try {
      await setTopConversation(chat.id, chat.conversationType, !chat.isTop);
      await refreshConversations().catch(() => null);
    } finally {
      setSwipeActionId(null);
      setOpenSwipeId(null);
    }
  };

  const handleRemoveChat = async (chat: ChatItem) => {
    setSwipeActionId(chat.id);
    try {
      await removeConversation(chat.id, chat.conversationType);
      await refreshConversations().catch(() => null);
    } finally {
      setSwipeActionId(null);
      setOpenSwipeId(null);
    }
  };

  return (
    <div className="app-bg min-h-screen flex flex-col transition-colors duration-500 relative">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[var(--bg-primary)]/90 backdrop-blur-xl border-b border-theme transition-colors duration-500">
        <div className="flex items-center px-4 py-2 gap-3 h-14">
          <button
            onClick={() => navigate(-1)}
            className="relative z-10 text-slate-400 hover:text-[var(--text-primary)] transition-colors p-2 -ml-2 rounded-full active:bg-white/10"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="flex-1 relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={headerSearch}
              onChange={(e) => setHeaderSearch(e.target.value)}
              placeholder="搜索"
              className="w-full bg-[#0f172a] text-slate-100 border border-theme rounded-xl pl-10 pr-4 py-1.5 text-sm outline-none focus:border-accent/50 transition-all placeholder-slate-500"
            />
          </div>

          <div className="relative">
            <button
              onClick={() => setShowAddMenu(!showAddMenu)}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-accent-gradient text-black shadow-lg active:scale-95 transition-transform"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>

            {showAddMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowAddMenu(false)}></div>
                <div className="absolute right-0 top-12 w-40 card-bg border border-theme rounded-xl shadow-xl z-50 overflow-hidden py-1 animate-fade-in-up">
                  <button
                    onClick={handleOpenAddFriend}
                    className="w-full text-left px-4 py-3 hover:bg-white/5 flex items-center space-x-3 transition-colors"
                  >
                    <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>加好友</span>
                  </button>
                  <div className="h-px bg-white/5 mx-2"></div>
                  <button
                    onClick={handleOpenJoinGroup}
                    className="w-full text-left px-4 py-3 hover:bg-white/5 flex items-center space-x-3 transition-colors"
                  >
                    <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>加群组</span>
                  </button>
                  <div className="h-px bg-white/5 mx-2"></div>
                  <button
                    onClick={handleOpenCreateGroup}
                    className="w-full text-left px-4 py-3 hover:bg-white/5 flex items-center space-x-3 transition-colors"
                  >
                    <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>创建群组</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-20">
        {activeTab === 'chats' && (
          isLoading ? (
            <div className="px-4 space-y-4 mt-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-slate-800/50 rounded-xl animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col">
              {chatList.map((chat) => {
                const isOpen = openSwipeId === chat.id;
                return (
                  <div key={chat.id} className="relative overflow-hidden">
                  <div
                    className={`absolute inset-y-0 right-0 w-32 flex items-center justify-end gap-2 pr-2 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                  >
                      <button
                        onClick={() => handlePinToggle(chat)}
                        disabled={swipeActionId === chat.id}
                        className={`text-[10px] font-bold px-3 py-2 rounded-xl border border-theme text-slate-200 ${swipeActionId === chat.id ? 'opacity-60 cursor-not-allowed' : 'hover:bg-white/5'}`}
                      >
                        {chat.isTop ? '取消置顶' : '置顶'}
                      </button>
                      <button
                        onClick={() => handleRemoveChat(chat)}
                        disabled={swipeActionId === chat.id}
                        className={`text-[10px] font-bold px-3 py-2 rounded-xl bg-rose-500/90 text-white ${swipeActionId === chat.id ? 'opacity-60 cursor-not-allowed' : 'active:scale-95 transition-transform'}`}
                      >
                        删除
                      </button>
                    </div>

                    <div
                      onClick={() => handleChatClick(chat.id)}
                      onTouchStart={(event) => handleSwipeStart(chat.id, event)}
                      onTouchMove={(event) => handleSwipeMove(chat.id, event)}
                      onTouchEnd={handleSwipeEnd}
                      onMouseDown={(event) => handleSwipeStart(chat.id, event)}
                      onMouseMove={(event) => handleSwipeMove(chat.id, event)}
                      onMouseUp={handleSwipeEnd}
                      onMouseLeave={handleSwipeEnd}
                      style={{ transform: isOpen ? `translateX(-${swipeOffset}px)` : 'translateX(0px)' }}
                      className="flex items-center px-4 py-3 cursor-pointer transition-transform duration-200 active:bg-white/5 hover:bg-white/5 relative group"
                    >
                      <div className="relative mr-4">
                        <img
                          src={chat.avatar || `https://picsum.photos/100/100?random=${chat.id}`}
                          alt={chat.title}
                          className="w-14 h-14 rounded-full object-cover bg-slate-800 border border-theme/50"
                        />
                        {chat.type === 'group' && (
                          <div className="absolute bottom-0 right-0 bg-purple-500/80 text-white rounded-full p-0.5 border-2 border-[var(--bg-primary)] scale-75">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0 pr-2 py-1 border-b border-theme/30 group-last:border-none h-full flex flex-col justify-center">
                        <div className="flex justify-between items-center mb-1">
                          <div className="flex items-center gap-2 min-w-0">
                            <h3 className="text-[16px] font-bold text-[var(--text-primary)] truncate">{chat.title}</h3>
                            {chat.isTop && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
                                置顶
                              </span>
                            )}
                          </div>
                          <span className={`text-xs ${!chat.read ? 'text-accent font-bold' : 'text-slate-500'}`}>{chat.time}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-500 truncate text-xs max-w-[70%]">{chat.content}</span>
                          {!chat.read && (
                            <div className="bg-red-500 text-white text-[10px] font-bold px-1.5 h-4 min-w-[16px] flex items-center justify-center rounded-full">
                              {chat.unreadCount && chat.unreadCount > 99 ? '99+' : (chat.unreadCount || 1)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}

        {activeTab === 'contacts' && (
          <div className="px-4 py-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>通讯录</h3>
                <p className="text-[10px] text-slate-500 mt-1">新朋友与好友列表</p>
              </div>
              <button
                onClick={() => loadContacts()}
                className="text-xs font-bold text-slate-200 px-3 py-1.5 rounded-full border border-theme hover:bg-white/5"
              >
                刷新
              </button>
            </div>

            {contactsError && (
              <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-2">
                {contactsError}
              </div>
            )}

            {contactsLoading && (
              <div className="text-center text-slate-500 text-sm">加载中...</div>
            )}

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500">新朋友</h4>
                <span className="text-[10px] text-slate-500">{incomingRequests.length} 位</span>
              </div>
              {incomingRequests.length === 0 ? (
                <div className="text-sm text-slate-500 px-2">暂无新朋友</div>
              ) : (
                incomingRequests.map(item => {
                  const profile = item.requester;
                  const name = profile.username || `用户${profile.id}`;
                  return (
                    <div key={item.id} className="card-bg border border-theme rounded-xl p-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={profile.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.id}`}
                          className="w-12 h-12 rounded-full border border-theme object-cover"
                        />
                        <div className="min-w-0">
                          <div className="text-sm font-bold text-[var(--text-primary)] truncate">{name}</div>
                          <div className="text-[10px] text-slate-500 truncate">手机号: {profile.phone || '-'}</div>
                          <div className="text-[10px] text-slate-500">ID: {profile.id}</div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="text-[10px] text-slate-500">{item.time}</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAcceptRequest(item.id)}
                            disabled={requestActionId === item.id}
                            className={`text-[10px] font-bold px-3 py-1.5 rounded-full bg-accent-gradient text-black ${requestActionId === item.id ? 'opacity-60 cursor-not-allowed' : 'active:scale-95 transition-transform'}`}
                          >
                            通过
                          </button>
                          <button
                            onClick={() => handleRejectRequest(item.id)}
                            disabled={requestActionId === item.id}
                            className={`text-[10px] font-bold px-3 py-1.5 rounded-full border border-theme text-slate-200 ${requestActionId === item.id ? 'opacity-60 cursor-not-allowed' : 'hover:bg-white/5'}`}
                          >
                            拒绝
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500">我的申请</h4>
                <span className="text-[10px] text-slate-500">{outgoingRequests.length} 条</span>
              </div>
              {outgoingRequests.length === 0 ? (
                <div className="text-sm text-slate-500 px-2">暂无待处理申请</div>
              ) : (
                outgoingRequests.map(item => {
                  const profile = item.target;
                  const name = profile.username || `用户${profile.id}`;
                  return (
                    <div key={item.id} className="card-bg border border-theme rounded-xl p-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={profile.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.id}`}
                          className="w-12 h-12 rounded-full border border-theme object-cover"
                        />
                        <div className="min-w-0">
                          <div className="text-sm font-bold text-[var(--text-primary)] truncate">{name}</div>
                          <div className="text-[10px] text-slate-500 truncate">手机号: {profile.phone || '-'}</div>
                          <div className="text-[10px] text-slate-500">ID: {profile.id}</div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="text-[10px] text-slate-500">等待通过</span>
                        <button
                          onClick={() => handleCancelRequest(item.id)}
                          disabled={requestActionId === item.id}
                          className={`text-[10px] font-bold px-3 py-1.5 rounded-full border border-theme text-slate-200 ${requestActionId === item.id ? 'opacity-60 cursor-not-allowed' : 'hover:bg-white/5'}`}
                        >
                          取消
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500">好友列表</h4>
                <span className="text-[10px] text-slate-500">{friendList.length} 位</span>
              </div>
              {friendList.length === 0 ? (
                <div className="text-sm text-slate-500 px-2">暂无好友</div>
              ) : (
                friendList.map(item => {
                  const name = item.displayName || item.username || item.phone || `用户${item.id}`;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedFriend(item)}
                      className="card-bg border border-theme rounded-xl p-3 flex items-center justify-between gap-3 cursor-pointer hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={item.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.id}`}
                          className="w-12 h-12 rounded-full border border-theme object-cover"
                        />
                        <div className="min-w-0">
                          <div className="text-sm font-bold text-[var(--text-primary)] truncate">{name}</div>
                          <div className="text-[10px] text-slate-500 truncate">手机号: {item.phone || '-'}</div>
                          <div className="text-[10px] text-slate-500">ID: {item.id}</div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {activeTab === 'me' && (
          <div className="p-6 pt-10">
            <div className="flex flex-col items-center">
              <img
                src={user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=User'}
                className="w-24 h-24 rounded-full border-4 border-theme object-cover shadow-lg"
              />
              <h2 className="text-xl font-black mt-4" style={{ color: 'var(--text-primary)' }}>{userName}</h2>
              <p className="text-slate-500 text-[10px] mt-1 font-mono">ID: {userId || '000000'}</p>
            </div>

            <div className="mt-8 space-y-3">
              <div className="card-bg p-4 rounded-xl border border-theme flex items-center justify-between cursor-pointer hover:bg-white/5">
                <div className="flex items-center space-x-3">
                  <span className="text-xl">⭐</span>
                  <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>收藏夹</span>
                </div>
                <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <div className="card-bg p-4 rounded-xl border border-theme flex items-center justify-between cursor-pointer hover:bg-white/5">
                <div className="flex items-center space-x-3">
                  <span className="text-xl">⚙️</span>
                  <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>设置</span>
                </div>
                <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Tabs */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50">
        <div className="glass-bg border-t border-theme shadow-[0_-10px_30px_rgba(0,0,0,0.5)] flex justify-around px-4 py-2 pb-6 relative transition-colors duration-500">
          {[
            { id: 'chats', label: '对话' },
            { id: 'contacts', label: '通讯录' },
            { id: 'me', label: '我' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`relative flex flex-col items-center justify-center w-20 py-1 group ${activeTab === tab.id ? 'text-accent' : 'text-slate-500 hover:text-slate-300'}`}
            >
              {tab.id === 'contacts' && incomingPendingCount > 0 && (
                <span className="absolute -top-1 right-2 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
                  {incomingPendingCount > 99 ? '99+' : incomingPendingCount}
                </span>
              )}
              <span className={`text-[10px] font-medium tracking-wide mt-1 transition-all duration-300 ${activeTab === tab.id ? 'text-accent font-bold scale-105 drop-shadow-sm' : 'text-slate-600'}`}>
                {tab.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Add Friend Modal */}
      {showAddFriendModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-6">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setShowAddFriendModal(false)}
          ></div>

          <div className="relative w-full max-w-sm card-bg rounded-[24px] p-6 border border-theme shadow-2xl animate-fade-in-up">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>添加好友</h3>
              <button onClick={() => setShowAddFriendModal(false)} className="text-slate-500 hover:text-slate-300 p-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">手机号 / 用户ID</label>
                <input
                  type="text"
                  value={friendKeyword}
                  onChange={(e) => {
                    setFriendKeyword(e.target.value);
                    setFriendError('');
                    setFriendSuccess('');
                    setFriendSearchDone(false);
                    setFriendResults([]);
                  }}
                  placeholder="请输入手机号或用户ID"
                  className="w-full bg-[var(--bg-primary)] border border-theme rounded-xl px-4 py-3.5 text-sm outline-none text-[var(--text-primary)] focus:border-accent/50 transition-colors"
                  autoFocus
                />
              </div>

              <button
                onClick={handleFriendSearch}
                disabled={friendSearchLoading || !friendKeyword.trim()}
                className={`w-full bg-accent-gradient text-black font-bold py-3.5 rounded-xl shadow-lg mt-2 flex items-center justify-center ${friendSearchLoading || !friendKeyword.trim() ? 'opacity-70 cursor-not-allowed' : 'active:scale-95 transition-transform'}`}
              >
                {friendSearchLoading ? '搜索中...' : '搜索用户'}
              </button>

              {friendError && (
                <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-2">
                  {friendError}
                </div>
              )}

              {friendSuccess && (
                <div className="text-xs text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-2">
                  {friendSuccess}
                </div>
              )}

              {friendResults.length > 0 && (
                <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">搜索结果</div>
                  {friendResults.map(profile => {
                    const name = profile.username || `用户${profile.id}`;
                    return (
                      <div key={profile.id} className="flex items-center justify-between gap-3 p-3 rounded-xl border border-theme bg-[var(--bg-primary)]">
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={profile.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.id}`}
                            className="w-12 h-12 rounded-full border border-theme object-cover"
                          />
                          <div className="min-w-0">
                            <div className="text-sm font-bold text-[var(--text-primary)] truncate">{name}</div>
                            <div className="text-[10px] text-slate-500 truncate">手机号: {profile.phone || '-'}</div>
                            <div className="text-[10px] text-slate-500">ID: {profile.id}</div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleSendFriendRequest(profile.id)}
                          disabled={friendRequestingId === profile.id}
                          className={`text-[10px] font-bold px-3 py-1.5 rounded-full bg-accent-gradient text-black ${friendRequestingId === profile.id ? 'opacity-60 cursor-not-allowed' : 'active:scale-95 transition-transform'}`}
                        >
                          {friendRequestingId === profile.id ? '发送中...' : '添加'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {friendSearchDone && friendResults.length === 0 && !friendError && (
                <div className="text-xs text-slate-500 text-center">未找到匹配用户</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Friend Action Modal */}
      {selectedFriend && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-6">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedFriend(null)}
          ></div>

          <div className="relative w-full max-w-sm card-bg rounded-[24px] p-6 border border-theme shadow-2xl animate-fade-in-up">
            <div className="mb-4">
              <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>好友操作</h3>
              <p className="text-xs text-slate-500 mt-1">
                {selectedFriend.displayName || selectedFriend.username || selectedFriend.phone || `用户${selectedFriend.id}`}
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => handleFriendActionChat(selectedFriend)}
                className="w-full bg-accent-gradient text-black font-bold py-3.5 rounded-xl shadow-lg active:scale-95 transition-transform"
              >
                对话
              </button>
              <button
                onClick={() => handleFriendActionRemove(selectedFriend)}
                disabled={friendRemovingId === selectedFriend.id}
                className={`w-full text-white font-bold py-3.5 rounded-xl bg-rose-500/90 ${friendRemovingId === selectedFriend.id ? 'opacity-60 cursor-not-allowed' : 'active:scale-95 transition-transform'}`}
              >
                {friendRemovingId === selectedFriend.id ? '删除中...' : '删除'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Join Group Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-6">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => !isSearching && setShowSearchModal(false)}
          ></div>

          <div className="relative w-full max-w-sm card-bg rounded-[24px] p-6 border border-theme shadow-2xl animate-fade-in-up">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>加入群组</h3>
              <button onClick={() => setShowSearchModal(false)} className="text-slate-500 hover:text-slate-300 p-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">群组 ID</label>
                <input
                  type="text"
                  value={searchKeyword}
                  onChange={(e) => {
                    setSearchKeyword(e.target.value);
                    setSearchError('');
                  }}
                  placeholder="请输入群组 ID"
                  className="w-full bg-[var(--bg-primary)] border border-theme rounded-xl px-4 py-3.5 text-sm outline-none text-[var(--text-primary)] focus:border-accent/50 transition-colors"
                  autoFocus
                />
              </div>

              {searchError && (
                <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-2">
                  {searchError}
                </div>
              )}

              <button
                onClick={handleSearchSubmit}
                disabled={isSearching || !searchKeyword.trim()}
                className={`w-full bg-accent-gradient text-black font-bold py-3.5 rounded-xl shadow-lg mt-2 flex items-center justify-center ${isSearching || !searchKeyword.trim() ? 'opacity-70 cursor-not-allowed' : 'active:scale-95 transition-transform'}`}
              >
                {isSearching ? '查找中...' : '查找并查看'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-6">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => !isCreating && setShowCreateModal(false)}
          ></div>

          <div className="relative w-full max-w-sm card-bg rounded-[24px] p-6 border border-theme shadow-2xl animate-fade-in-up">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>创建群组</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-500 hover:text-slate-300 p-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">群名称</label>
                <input
                  type="text"
                  value={createFormData.name}
                  onChange={(e) => {
                    setCreateFormData({ ...createFormData, name: e.target.value });
                    setCreateError('');
                  }}
                  placeholder="给群组起个名字"
                  className="w-full bg-[var(--bg-primary)] border border-theme rounded-xl px-4 py-3 text-sm outline-none text-[var(--text-primary)] focus:border-accent/50 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">分类</label>
                  <select
                    value={createFormData.category}
                    onChange={(e) => setCreateFormData({ ...createFormData, category: e.target.value })}
                    className="w-full bg-[var(--bg-primary)] border border-theme rounded-xl px-3 py-3 text-sm outline-none text-[var(--text-primary)] focus:border-accent/50 transition-colors appearance-none"
                  >
                    <option value="游戏交流">游戏交流</option>
                    <option value="公会/战队">公会/战队</option>
                    <option value="兴趣爱好">兴趣爱好</option>
                    <option value="其他">其他</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">标签</label>
                  <input
                    type="text"
                    value={createFormData.tags}
                    onChange={(e) => setCreateFormData({ ...createFormData, tags: e.target.value })}
                    placeholder="空格分隔"
                    className="w-full bg-[var(--bg-primary)] border border-theme rounded-xl px-4 py-3 text-sm outline-none text-[var(--text-primary)] focus:border-accent/50 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">群介绍</label>
                <textarea
                  value={createFormData.desc}
                  onChange={(e) => setCreateFormData({ ...createFormData, desc: e.target.value })}
                  placeholder="简单介绍一下群组"
                  className="w-full bg-[var(--bg-primary)] border border-theme rounded-xl px-4 py-3 text-sm outline-none text-[var(--text-primary)] focus:border-accent/50 transition-colors min-h-[90px] resize-none"
                />
              </div>

              {createError && (
                <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-2">
                  {createError}
                </div>
              )}

              <button
                onClick={handleCreateGroup}
                disabled={isCreating || !createFormData.name.trim()}
                className={`w-full bg-accent-gradient text-black font-bold py-3.5 rounded-xl shadow-lg mt-2 flex items-center justify-center ${isCreating || !createFormData.name.trim() ? 'opacity-70 cursor-not-allowed' : 'active:scale-95 transition-transform'}`}
              >
                {isCreating ? '创建中...' : '创建群组'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupDiscover;

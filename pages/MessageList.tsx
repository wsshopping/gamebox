
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Message, SystemNotification, Interaction } from '../types';
import { useIm } from '../context/ImContext';
import { IMConversationType, IMMessageType } from '../services/im/client';

interface MessageListProps {
  isEmbedded?: boolean;
}

// TODO: 互动消息功能尚未完成，完成后将该开关改为 true 并恢复入口展示。
const INTERACTION_MESSAGES_ENABLED = false;

// Define the available views for this page
type ViewMode = 'main' | 'system' | 'interactions';

const MessageList: React.FC<MessageListProps> = ({ isEmbedded = false }) => {
  const navigate = useNavigate();
  const { conversations: imConversations, ready: imReady, refreshConversations, connected } = useIm();
  const [viewMode, setViewMode] = useState<ViewMode>('main');
  const [isLoading, setIsLoading] = useState(true);
  const [showOfflineBanner, setShowOfflineBanner] = useState(false);

  // Data States
  const [messages, setMessages] = useState<Message[]>([]);
  const [systemNotes, setSystemNotes] = useState<SystemNotification[]>([]);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const isOffline = !connected;

  useEffect(() => {
    if (!isOffline) {
      setShowOfflineBanner(false);
      return;
    }
    const timer = window.setTimeout(() => {
      setShowOfflineBanner(true);
    }, 1200);
    return () => window.clearTimeout(timer);
  }, [isOffline]);

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

  const formatNotificationDisplayTime = (value: string) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    const pad = (num: number) => String(num).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  const parseMessageTime = (value: string) => {
    if (!value) return 0;
    const normalized = value.replace(' ', 'T');
    const date = new Date(normalized);
    const ts = date.getTime();
    return Number.isNaN(ts) ? 0 : ts;
  };

  const buildInteractionPreview = (item: Interaction) => {
    switch (item.type) {
      case 'like':
        return `赞了你的${item.targetContent || '内容'}`;
      case 'comment':
        return `评论: "${item.targetContent || ''}"`;
      case 'follow':
        return '关注了你';
      case 'mention':
        return '在评论中提到了你';
      default:
        return item.targetContent || '';
    }
  };

  const mapImConversations = () => {
    return imConversations.map((conv: any) => {
      const isGroup = conv.conversationType === IMConversationType.GROUP;
      const latest = conv.latestMessage;
      const senderName = latest?.sender?.name || latest?.senderName || latest?.sender?.id || '';
      return {
        id: conv.conversationId,
        title: conv.conversationTitle || (isGroup ? `群聊 ${conv.conversationId}` : conv.conversationId),
        content: formatImPreview(latest),
        time: formatImTime(latest?.sentTime || conv.sortTime),
        sortTime: Number(latest?.sentTime || conv.sortTime || 0),
        type: isGroup ? 'group' : 'social',
        read: !conv.unreadCount || conv.unreadCount === 0,
        avatar: conv.conversationPortrait,
        members: conv.unreadCount,
        senderName: senderName ? String(senderName) : ''
      } as Message;
    });
  };

  useEffect(() => {
    fetchData();
  }, [viewMode, imConversations, imReady]);

  useEffect(() => {
    if (viewMode === 'main' && imReady) {
      refreshConversations().catch(() => null);
    }
  }, [viewMode, imReady, refreshConversations]);

  const fetchData = async () => {
    if (viewMode === 'main') {
      setIsLoading(true);
      const imItems = imReady ? mapImConversations() : [];
      try {
        const interactionPromise = INTERACTION_MESSAGES_ENABLED
          ? api.message.getInteractions('all', 1, 1)
          : Promise.resolve<Interaction[]>([]);
        const unreadPromise = api.message.getUnreadCount().catch(() => null);
        const [systemList, interactionList, unreadCounts] = await Promise.all([
          api.message.getSystemNotifications('all', 1, 1),
          interactionPromise,
          unreadPromise
        ]);
        const summaryItems: Message[] = [];
        const latestSystem = systemList[0];
        if (latestSystem) {
          summaryItems.push({
            id: `system-latest-${latestSystem.id}`,
            title: '系统通知',
            content: latestSystem.title || latestSystem.content,
            time: formatNotificationDisplayTime(latestSystem.time),
            sortTime: parseMessageTime(latestSystem.time),
            type: 'system',
            read: unreadCounts ? unreadCounts.system === 0 : latestSystem.read
          });
        }
        const latestInteraction = interactionList[0];
        if (INTERACTION_MESSAGES_ENABLED && latestInteraction) {
          summaryItems.push({
            id: `interaction-latest-${latestInteraction.id}`,
            title: '互动消息',
            content: `${latestInteraction.userName} ${buildInteractionPreview(latestInteraction)}`.trim(),
            time: formatNotificationDisplayTime(latestInteraction.time),
            sortTime: parseMessageTime(latestInteraction.time),
            type: 'activity',
            read: unreadCounts ? unreadCounts.interactions === 0 : latestInteraction.read
          });
        }
        const merged = [...summaryItems, ...imItems].sort((a, b) => (b.sortTime || 0) - (a.sortTime || 0));
        setMessages(merged);
      } catch (error) {
        console.error('Failed to load messages', error);
        setMessages(imItems);
      } finally {
        setIsLoading(false);
      }
      return;
    }
    setIsLoading(true);
    try {
      if (viewMode === 'system') {
        const data = await api.message.getSystemNotifications();
        setSystemNotes(data);
      } else if (viewMode === 'interactions') {
        const data = await api.message.getInteractions();
        setInteractions(data);
      }
    } catch (error) {
      console.error('Failed to load messages', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMessageClick = (type: string, id: string) => {
    if (type === 'system') {
      setViewMode('system');
      return;
    }
    if (type === 'activity') {
      setViewMode('interactions');
      return;
    }
    if (type === 'social' || type === 'group') {
      navigate(`/chat/${id}`);
    }
  };

  const handleSystemRead = async (note: SystemNotification) => {
    if (note.read) return;
    try {
      await api.message.markSystemRead([note.id]);
      setSystemNotes(prev => prev.map(item => (item.id === note.id ? { ...item, read: true } : item)));
    } catch (error) {
      console.error('Failed to mark system notification read', error);
    }
  };

  const handleInteractionRead = async (item: Interaction) => {
    if (item.read) return;
    try {
      await api.message.markInteractionRead([item.id]);
      setInteractions(prev => prev.map(entry => (entry.id === item.id ? { ...entry, read: true } : entry)));
    } catch (error) {
      console.error('Failed to mark interaction notification read', error);
    }
  };

  // Helper for message list icons
  const getIcon = (type: string) => {
    switch (type) {
      case 'system': return '🔔';
      case 'activity': return '🎉';
      case 'group': return '👥';
      case 'social': return '💬';
      default: return '📫';
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'system': return 'bg-blue-500/10 text-blue-500 border border-blue-500/20';
      case 'activity': return 'bg-amber-500/10 text-amber-500 border border-amber-500/20';
      case 'group': return 'bg-purple-500/10 text-purple-500 border border-purple-500/20';
      case 'social': return 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20';
      default: return 'bg-slate-500/10 text-slate-500 border border-slate-500/20';
    }
  };

  // --- Sub-View Renderers ---

  const renderSystemView = () => (
    <div className="p-4 space-y-4">
      {isLoading ? (
         [1,2].map(i => <div key={i} className="h-24 card-bg rounded-xl animate-pulse border border-theme"></div>)
      ) : (
        systemNotes.map(note => (
          <div
            key={note.id}
            onClick={() => handleSystemRead(note)}
            className="card-bg p-4 rounded-xl border border-theme shadow-sm flex items-start space-x-3 cursor-pointer hover:border-accent/30 transition-colors"
          >
             <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
               note.level === 'warning' ? 'bg-red-500/10 text-red-500' : 
               note.level === 'success' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'
             }`}>
               {note.level === 'warning' ? '⚠️' : note.level === 'success' ? '✅' : 'ℹ️'}
             </div>
             <div className="flex-1">
               <div className="flex justify-between items-start mb-1">
                 <h3 className="font-bold text-sm" style={{color: 'var(--text-primary)'}}>{note.title}</h3>
                 <span className="text-xs text-slate-500">{formatNotificationDisplayTime(note.time)}</span>
               </div>
               <p className="text-xs text-slate-400 leading-relaxed">{note.content}</p>
             </div>
             {!note.read && <div className="w-2 h-2 rounded-full bg-red-500 mt-2 shadow-[0_0_5px_rgba(239,68,68,0.5)]"></div>}
          </div>
        ))
      )}
    </div>
  );

  const renderInteractionsView = () => (
    <div className="p-4 space-y-3">
      {isLoading ? (
        [1,2,3].map(i => <div key={i} className="h-16 card-bg rounded-xl animate-pulse border border-theme"></div>)
      ) : (
        interactions.map(item => (
          <div
            key={item.id}
            onClick={() => handleInteractionRead(item)}
            className="card-bg p-4 rounded-xl border border-theme shadow-sm flex items-center space-x-3 hover:border-accent/30 transition-colors cursor-pointer"
          >
             <div className="relative">
               <img src={item.userAvatar} alt={item.userName} className="w-10 h-10 rounded-full object-cover border border-theme" />
               <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border-2 border-[var(--bg-card)] text-[10px] ${
                  item.type === 'like' ? 'bg-red-500 text-white' :
                  item.type === 'comment' ? 'bg-blue-500 text-white' :
                  item.type === 'follow' ? 'bg-amber-500 text-black' : 'bg-purple-500 text-white'
               }`}>
                  {item.type === 'like' ? '❤️' : item.type === 'comment' ? '💬' : item.type === 'follow' ? '➕' : '@'}
               </div>
             </div>
             <div className="flex-1 min-w-0">
               <div className="flex justify-between items-baseline">
                 <h3 className="text-sm font-bold truncate" style={{color: 'var(--text-primary)'}}>{item.userName}</h3>
                 <span className="text-[10px] text-slate-500">{formatNotificationDisplayTime(item.time)}</span>
               </div>
               <p className="text-xs text-slate-400 truncate">
                 {item.type === 'like' && `赞了你的${item.targetContent}`}
                 {item.type === 'comment' && `评论: "${item.targetContent}"`}
                 {item.type === 'follow' && `关注了你`}
                 {item.type === 'mention' && `在评论中提到了你`}
               </p>
             </div>
          </div>
        ))
      )}
    </div>
  );

  // --- Main Render ---

  const shouldPadTop = !isEmbedded;

  return (
    <div className={`app-bg min-h-full pb-20 transition-colors duration-500 ${shouldPadTop ? 'pt-[calc(5rem+env(safe-area-inset-top))]' : ''}`}>
      {/* Header for Standalone Mode */}
	      {!isEmbedded && (
	        <div className="glass-bg p-4 pt-[calc(1rem+env(safe-area-inset-top))] fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md z-40 shadow-sm flex items-center justify-between border-b border-theme transition-colors duration-500">
	           <div className="flex items-center space-x-2">
             {viewMode !== 'main' && (
               <button onClick={() => setViewMode('main')} className="mr-2 text-slate-400 hover:text-[var(--text-primary)] p-1 rounded-full transition-colors">
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
               </button>
             )}
             <h1 className="text-lg font-bold" style={{color: 'var(--text-primary)'}}>
               {viewMode === 'main' && '消息中心'}
               {viewMode === 'system' && '系统通知'}
	               {viewMode === 'interactions' && '互动消息'}
	             </h1>
	           </div>
	           <div className={`inline-flex items-center gap-1.5 text-xs font-medium ${isOffline ? 'text-slate-500' : 'text-emerald-500'}`}>
	             <span className={`inline-block h-1.5 w-1.5 rounded-full ${isOffline ? 'bg-slate-400' : 'bg-emerald-500'}`}></span>
	             <span>{isOffline ? '离线' : '在线'}</span>
	           </div>
	        </div>
	      )}

      {/* Header for Embedded Mode (System & Interactions only) */}
	      {isEmbedded && (viewMode === 'system' || viewMode === 'interactions') && (
	        <div className="glass-bg p-3 pt-[calc(0.75rem+env(safe-area-inset-top))] fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md z-40 shadow-sm flex items-center border-b border-theme transition-colors duration-500">
	           <button 
             onClick={() => setViewMode('main')} 
             className="mr-3 text-slate-400 hover:text-[var(--text-primary)] p-1.5 rounded-full transition-colors"
           >
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
           </button>
	           <h1 className="text-base font-bold" style={{color: 'var(--text-primary)'}}>
	             {viewMode === 'system' && '系统通知'}
	             {viewMode === 'interactions' && '互动消息'}
	           </h1>
	           <div className={`ml-auto inline-flex items-center gap-1.5 text-xs font-medium ${isOffline ? 'text-slate-500' : 'text-emerald-500'}`}>
	             <span className={`inline-block h-1.5 w-1.5 rounded-full ${isOffline ? 'bg-slate-400' : 'bg-emerald-500'}`}></span>
	             <span>{isOffline ? '离线' : '在线'}</span>
	           </div>
	        </div>
	      )}

      {showOfflineBanner && (
        <div className="bg-rose-500/10 border-b border-rose-500/20 text-rose-400 text-xs px-4 py-2 flex items-center gap-2">
          <span className="font-bold">离线</span>
          <span>网络异常，消息可能无法及时更新</span>
        </div>
      )}

      {/* Main View */}
      {viewMode === 'main' && (
        <>
           <div className="px-4 pt-1 pb-1">
             <div className={`inline-flex items-center gap-1.5 text-xs font-medium ${isOffline ? 'text-slate-500' : 'text-emerald-500'}`}>
               <span className={`inline-block h-2 w-2 rounded-full ${isOffline ? 'bg-slate-400' : 'bg-emerald-500'} shadow-[0_0_6px_rgba(16,185,129,0.35)]`}></span>
               <span>{isOffline ? '离线' : '在线'}</span>
             </div>
           </div>
           {/* Functional Grid */}
           <div className={`grid ${INTERACTION_MESSAGES_ENABLED ? 'grid-cols-3' : 'grid-cols-2'} gap-3 p-4 pb-2`}>
              <div 
                onClick={() => setViewMode('system')}
                className="flex flex-col items-center space-y-2 cursor-pointer group card-bg p-3 rounded-2xl border border-theme shadow-sm hover:border-blue-500/30 transition-all"
              >
                 <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center text-lg shadow-inner border border-blue-500/20">
                   🔔
                 </div>
                 <span className="text-xs font-bold text-slate-500 group-hover:text-[var(--text-primary)] transition-colors">系统通知</span>
              </div>
              
              <div 
                onClick={() => navigate('/chat/center')}
                className="flex flex-col items-center space-y-2 cursor-pointer group card-bg p-3 rounded-2xl border border-theme shadow-sm hover:border-indigo-500/30 transition-all"
              >
                 <div className="w-10 h-10 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center text-lg shadow-inner border border-indigo-500/20">
                   👥
                 </div>
                 <span className="text-xs font-bold text-slate-500 group-hover:text-[var(--text-primary)] transition-colors">聊天</span>
              </div>

              {INTERACTION_MESSAGES_ENABLED && (
                <div 
                  onClick={() => setViewMode('interactions')}
                  className="flex flex-col items-center space-y-2 cursor-pointer group card-bg p-3 rounded-2xl border border-theme shadow-sm hover:border-emerald-500/30 transition-all"
                >
                   <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-lg shadow-inner relative border border-emerald-500/20">
                     @
                     {/* Badge Mock */}
                     <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-[var(--bg-card)] text-[9px] text-white flex items-center justify-center shadow-sm">2</div>
                   </div>
                   <span className="text-xs font-bold text-slate-500 group-hover:text-[var(--text-primary)] transition-colors">互动消息</span>
                </div>
              )}
           </div>

           {/* Message List */}
           <div className="p-4 space-y-3 min-h-[300px]">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">最近消息</h3>
              {isLoading ? (
                 [1, 2, 3].map(i => (
                   <div key={i} className="card-bg p-4 rounded-xl border border-theme shadow-sm flex space-x-3 animate-pulse h-20"></div>
                 ))
              ) : (
                messages.map(msg => (
                  <div 
                    key={`${msg.type}-${msg.id}`} 
                    onClick={() => handleMessageClick(msg.type, msg.id)}
                    className="card-bg p-4 rounded-xl border border-theme shadow-sm flex space-x-3 cursor-pointer active:scale-[0.98] transition-all hover:border-accent/30"
                  >
                     {msg.avatar ? (
                       <div className="relative">
                          <img src={msg.avatar} alt={msg.title} className="w-12 h-12 rounded-xl object-cover ring-1 ring-theme shadow-sm" />
                          {msg.type === 'group' && (
                            <div className="absolute -bottom-1 -right-1 card-bg rounded-full p-0.5 border border-theme">
                               <div className="bg-purple-500 rounded-full w-4 h-4 flex items-center justify-center text-[8px] text-white">群</div>
                            </div>
                          )}
                       </div>
                     ) : (
                       <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${getColor(msg.type)}`}>
                          {getIcon(msg.type)}
                       </div>
                     )}
                     
                     <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-1">
                           <h3 className="text-sm font-bold truncate pr-2" style={{color: 'var(--text-primary)'}}>{msg.title}</h3>
                           <span className="text-xs text-slate-500 flex-shrink-0">{msg.time}</span>
                        </div>
                        <p className="text-xs text-slate-400 line-clamp-1">
                           {msg.type === 'group' && !msg.content.includes(':') ? (
                             <span className="text-slate-500 mr-1">{msg.senderName || '群友'}:</span>
                           ) : ''}
                           {msg.content}
                        </p>
                     </div>
                     {!msg.read && (
                       <div className="self-center flex flex-col items-end space-y-1">
                          <div className="w-2.5 h-2.5 bg-red-500 rounded-full shadow-[0_0_5px_rgba(239,68,68,0.5)]"></div>
                       </div>
                     )}
                  </div>
                ))
              )}
           </div>
        </>
      )}

      {/* Conditional Rendering of Sub-Views */}
      {viewMode === 'system' && renderSystemView()}
      {INTERACTION_MESSAGES_ENABLED && viewMode === 'interactions' && renderInteractionsView()}

    </div>
  );
};

export default MessageList;

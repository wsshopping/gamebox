import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useIm } from '../context/ImContext';
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

const Chat: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const endRef = useRef<HTMLDivElement>(null);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [groupTitle, setGroupTitle] = useState('');
  const [memberCount, setMemberCount] = useState<number | null>(null);
  const {
    ready,
    conversations,
    messagesByConversation,
    loadMessages,
    sendTextMessage,
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

  useEffect(() => {
    if (!id || !ready) return;
    setIsLoading(true);
    loadMessages(id, conversationType)
      .catch(() => null)
      .finally(() => setIsLoading(false));
  }, [id, ready, conversationType, loadMessages]);

  useEffect(() => {
    if (!id || !isGroup) {
      setGroupTitle('');
      setMemberCount(null);
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
    }).catch(() => null);

    return () => {
      active = false;
    };
  }, [getGroupInfo, getGroupMembers, id, isGroup]);

  useEffect(() => {
    const mapped = imMessages.map((msg: any) => ({
      id: msg.messageId || msg.tid || String(msg.sentTime || Date.now()),
      text: formatMessageText(msg),
      sender: msg.isSender ? 'me' : 'other',
      senderName: msg.sender?.name || msg.senderName,
      senderId: msg.sender?.id || msg.senderId,
      time: msg.sentTime ? new Date(msg.sentTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
      type: msg.name === IMMessageType.IMAGE ? 'image' : 'text',
      imageUrl: msg.content?.imageUri || msg.content?.url
    }));
    setMessages(mapped);
  }, [imMessages]);

  useEffect(() => {
    if (!isLoading) {
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, showActionMenu, showEmojiPicker]);

  const handleSend = async () => {
    if (!inputText.trim() || !id) return;
    try {
      await sendTextMessage(id, conversationType, inputText.trim());
      setInputText('');
      setShowEmojiPicker(false);
      setShowActionMenu(false);
    } catch (e) {
      console.error(e);
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
    window.alert('暂不支持查看资料');
  };

  const handleAvatarClick = (msg: ChatMessage) => {
    if (msg.sender === 'me') return;
    window.alert('暂不支持查看资料');
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
      <div className="flex-none glass-bg p-4 shadow-sm flex items-center justify-between border-b border-theme transition-colors duration-500 relative z-20">
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

      {/* Message Area */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-transparent overscroll-contain"
        onClick={() => { setShowActionMenu(false); setShowEmojiPicker(false); }}
      >
         {isLoading ? (
            <div className="flex justify-center pt-10">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
            </div>
         ) : (
           <>
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
    </div>
  );
};

export default Chat;

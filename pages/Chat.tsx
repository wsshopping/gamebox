import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { api } from '../services/api';
import { MESSAGES, GROUPS } from '../services/mockData';

interface ChatMessage {
  id: number;
  text: string;
  sender: 'me' | 'other';
  senderName?: string; // For group chats
  senderId?: string;   // For navigation to profile
  time: string;
  type: 'text' | 'image';
  imageUrl?: string; // For image messages
}

// Mock members for group simulation
const MOCK_MEMBERS = [
  { id: 'u_admin', name: '管理员', avatarId: 100 },
  { id: 'u1', name: '快乐风男', avatarId: 101 },
  { id: 'u2', name: '暴走萝莉', avatarId: 102 },
  { id: 'u_noman', name: '路人甲', avatarId: 103 },
  { id: 'u_rich', name: '氪金大佬', avatarId: 104 },
  { id: 'u_newbie', name: '萌新小白', avatarId: 105 },
];

const EMOJIS = ['😀', '😂', '🤣', '😍', '😭', '😡', '👍', '🙏', '🎉', '🔥', '❤️', '💔', '💩', '👻', '💀', '👽', '🤖', '🎃', '🎄', '🎁', '🎈', '💪', '👀', '👂', '👃', '🧠', '🦷', '🦴', '🤝', '👋'];

const Chat: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const endRef = useRef<HTMLDivElement>(null);
  
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // UI States for bottom panels
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  // Try to find group info from both MESSAGES (msg list) and GROUPS (recommendation list)
  const mockMsgInfo = MESSAGES.find(m => m.id === id);
  const mockGroupInfo = GROUPS.find(g => g.id === id);
  
  const isGroup = id?.startsWith('g') || id?.startsWith('ng') || mockMsgInfo?.type === 'group';
  
  // Determine Chat Title
  let chatTitle = '聊天';
  if (mockMsgInfo) chatTitle = mockMsgInfo.title;
  else if (mockGroupInfo) chatTitle = mockGroupInfo.name;
  else if (isGroup) chatTitle = '群聊';
  else chatTitle = `User_${id?.slice(0,4).toUpperCase()}`;

  const memberCount = mockMsgInfo?.members || mockGroupInfo?.members || 1;

  useEffect(() => {
    const fetchHistory = async () => {
       if (!id) return;
       setIsLoading(true);
       try {
         const history = await api.message.getChatHistory(id);
         setMessages(history);
       } finally {
         setIsLoading(false);
       }
    };
    fetchHistory();
  }, [id]);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!isLoading) {
      scrollToBottom();
    }
  }, [messages, isLoading, showActionMenu, showEmojiPicker]);

  const handleBack = () => {
    // Priority: Explicit state from -> Group Discover -> Default fallback
    if (location.state && (location.state as any).from) {
        navigate(-1);
    } else {
        // Default to GroupDiscover to ensure user goes back to the new social hub
        navigate('/groups/discover');
    }
  };

  const handleSend = () => {
    if (!inputText.trim()) return;
    const newMsg: ChatMessage = {
      id: Date.now(),
      text: inputText,
      sender: 'me',
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      type: 'text'
    };
    setMessages(prev => [...prev, newMsg]);
    setInputText('');
    setShowEmojiPicker(false);
    setShowActionMenu(false);
    
    // Simulation Logic
    if (isGroup) {
      const randomReplyCount = Math.floor(Math.random() * 2) + 1; 
      for (let i = 0; i < randomReplyCount; i++) {
         const delay = 1000 + (i * 1500) + Math.random() * 1000;
         setTimeout(() => {
            const member = MOCK_MEMBERS[Math.floor(Math.random() * MOCK_MEMBERS.length)];
            const replies = ['哈哈', '确实', '有人一起吗？', '666', '萌新求带', '这也太强了吧', '收到', '这就上线'];
            const replyText = replies[Math.floor(Math.random() * replies.length)];
            
            setMessages(prev => [...prev, {
              id: Date.now() + i + 10,
              text: replyText,
              sender: 'other',
              senderName: member.name,
              senderId: member.id, // Include Sender ID for navigation
              time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
              type: 'text'
            }]);
         }, delay);
      }
    } else {
      // Private Chat Simulation
      setTimeout(() => {
         const replies = [
             '好的，没问题。', 
             '确实如此。', 
             '哈哈哈哈', 
             '稍微等我一下哈。', 
             '下次一定！', 
             '我觉得可以。', 
             '收到。',
             '🐂🍺',
             '？？？'
         ];
         const randomReply = replies[Math.floor(Math.random() * replies.length)];
         
         setMessages(prev => [...prev, {
           id: Date.now() + 1,
           text: randomReply,
           sender: 'other',
           time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
           type: 'text'
         }]);
      }, 1500);
    }
  };

  // Mock sending an image from the action menu
  const handleSendImage = () => {
    const newMsg: ChatMessage = {
      id: Date.now(),
      text: '[图片]',
      sender: 'me',
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      type: 'image',
      imageUrl: 'https://picsum.photos/300/200?random=' + Date.now()
    };
    setMessages(prev => [...prev, newMsg]);
    setShowActionMenu(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  const handleHeaderRightClick = () => {
    if (isGroup) {
      navigate(`/group/${id}`);
    } else {
      // Navigate to user profile if it's a user chat
      if (id && !id.startsWith('t')) { // Assuming 't' is for trade temporary chats
          navigate(`/profile/${id}`);
      } else {
          console.log('Open chat settings');
      }
    }
  };

  // New Handler: Click on Avatar
  const handleAvatarClick = (msg: ChatMessage) => {
     // Prevent clicking on own avatar
     if (msg.sender === 'me') return;

     let targetId = '';
     if (isGroup) {
        // In group chat, click goes to sender's profile
        targetId = msg.senderId || 'u_unknown';
     } else {
        // In private chat, click goes to the person you are chatting with
        targetId = id || '';
     }
     
     if (targetId) {
        navigate(`/profile/${targetId}`);
     }
  };

  const toggleActionMenu = () => {
    setShowActionMenu(!showActionMenu);
    setShowEmojiPicker(false);
  };

  const toggleEmojiPicker = () => {
    setShowEmojiPicker(!showEmojiPicker);
    setShowActionMenu(false);
  };

  const handleEmojiClick = (emoji: string) => {
    setInputText(prev => prev + emoji);
  };

  const handleInputFocus = () => {
    // Close panels when typing
    setShowActionMenu(false);
    setShowEmojiPicker(false);
  };

  return (
    // Fixed layout breaks out of the App's scroll container, solving double scrollbar / no scroll issues
    <div className="fixed inset-0 z-[50] app-bg flex flex-col transition-colors duration-500">
      
      {/* Header - Flex None (Static Height) */}
      <div className="flex-none glass-bg p-4 shadow-sm flex items-center justify-between border-b border-theme transition-colors duration-500 relative z-20">
         <div className="flex items-center">
            <button 
                onClick={handleBack} 
                className="text-slate-500 hover:text-[var(--text-primary)] mr-3 p-2 -ml-2 rounded-full transition-colors active:bg-white/10 cursor-pointer"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <div>
               <h1 className="text-lg font-bold leading-none max-w-[200px] truncate" style={{color: 'var(--text-primary)'}}>{chatTitle}</h1>
               <span className="text-[10px] text-slate-500 flex items-center mt-0.5">
                 {isGroup ? `${memberCount} 人在线` : <span className="text-emerald-500">● 在线</span>}
               </span>
            </div>
         </div>
         <button 
           onClick={handleHeaderRightClick}
           className="text-slate-500 hover:text-[var(--text-primary)] p-2 -mr-2 rounded-full active:bg-white/10 transition-colors"
         >
           {isGroup ? (
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
           ) : (
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" /></svg>
           )}
         </button>
      </div>

      {/* Message Area - Flex 1 (Takes remaining height, handles own scroll) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-transparent overscroll-contain" onClick={() => {setShowActionMenu(false); setShowEmojiPicker(false)}}>
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
                             // Use chat ID (from URL) for consistent private chat avatar, or senderName length for groups
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
                          <img src={msg.imageUrl} alt="sent image" className="w-full h-auto" />
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

      {/* Input Area - Flex None (Stays at bottom) */}
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
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
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
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
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
                <svg className="w-5 h-5 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
              </button>
          </div>
        </div>

        {/* Expandable Panel */}
        {(showActionMenu || showEmojiPicker) && (
          <div className="h-64 bg-[var(--bg-card)] border-t border-theme overflow-y-auto animate-fade-in-up no-scrollbar pb-6">
             {/* Action Menu */}
             {showActionMenu && (
               <div className="grid grid-cols-4 gap-6 p-6">
                  {[
                    { name: '相册', icon: '🖼️', action: handleSendImage },
                    { name: '拍摄', icon: '📷', action: () => alert('调用摄像头功能') },
                    { name: '位置', icon: '📍', action: () => alert('发送位置') },
                    { name: '红包', icon: '🧧', action: () => alert('发红包') },
                    { name: '文件', icon: '📁', action: () => {} },
                    { name: '收藏', icon: '⭐', action: () => {} },
                    { name: '名片', icon: '🎫', action: () => {} },
                    { name: '语音', icon: '🎤', action: () => {} },
                  ].map((item, idx) => (
                    <div key={idx} onClick={item.action} className="flex flex-col items-center gap-2 cursor-pointer group">
                       <div className="w-14 h-14 bg-[var(--bg-primary)] rounded-2xl flex items-center justify-center text-2xl border border-theme shadow-sm group-hover:bg-white/5 transition-colors group-active:scale-95">
                          {item.icon}
                       </div>
                       <span className="text-xs text-slate-500">{item.name}</span>
                    </div>
                  ))}
               </div>
             )}

             {/* Emoji Picker */}
             {showEmojiPicker && (
               <div className="p-4 grid grid-cols-8 gap-2">
                  {EMOJIS.map((emoji, idx) => (
                    <button 
                      key={idx} 
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
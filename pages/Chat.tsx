
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../services/api';
import { MESSAGES, GROUPS } from '../services/mockData';

interface ChatMessage {
  id: number;
  text: string;
  sender: 'me' | 'other';
  senderName?: string; // For group chats
  time: string;
  type: 'text' | 'image';
}

// Mock members for group simulation
const MOCK_MEMBERS = [
  { name: '管理员', avatarId: 100 },
  { name: '快乐风男', avatarId: 101 },
  { name: '暴走萝莉', avatarId: 102 },
  { name: '路人甲', avatarId: 103 },
  { name: '氪金大佬', avatarId: 104 },
  { name: '萌新小白', avatarId: 105 },
];

const Chat: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const endRef = useRef<HTMLDivElement>(null);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Try to find group info from both MESSAGES (msg list) and GROUPS (recommendation list)
  const mockMsgInfo = MESSAGES.find(m => m.id === id);
  const mockGroupInfo = GROUPS.find(g => g.id === id);
  
  const isGroup = id?.startsWith('g') || id?.startsWith('ng') || mockMsgInfo?.type === 'group';
  const chatTitle = mockMsgInfo?.title || mockGroupInfo?.name || (isGroup ? '群聊' : 'ProGamer123');
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
  useEffect(() => {
    if (!isLoading) {
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

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
    
    // Simulation Logic
    if (isGroup) {
      // Simulate multiple replies for groups to feel "alive"
      const randomReplyCount = Math.floor(Math.random() * 2) + 1; // 1 or 2 replies
      
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
              time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
              type: 'text'
            }]);
         }, delay);
      }
    } else {
      // Single person auto-reply
      setTimeout(() => {
         setMessages(prev => [...prev, {
           id: Date.now() + 1,
           text: '对方正在输入...',
           sender: 'other',
           time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
           type: 'text'
         }]);
      }, 2000);
    }
  };

  return (
    <div className="app-bg h-screen flex flex-col transition-colors duration-500">
      {/* Header */}
      <div className="glass-bg p-4 shadow-sm flex items-center justify-between sticky top-0 z-20 border-b border-theme transition-colors duration-500">
         <div className="flex items-center">
            <button onClick={() => navigate(-1)} className="text-slate-500 hover:text-[var(--text-primary)] mr-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <div>
               <h1 className="text-lg font-bold leading-none max-w-[200px] truncate" style={{color: 'var(--text-primary)'}}>{chatTitle}</h1>
               <span className="text-[10px] text-slate-500 flex items-center mt-0.5">
                 {isGroup ? `${memberCount} 人在线` : <span className="text-emerald-500">● 在线</span>}
               </span>
            </div>
         </div>
         <button className="text-slate-500 hover:text-[var(--text-primary)]">
           {isGroup ? (
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
           ) : (
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" /></svg>
           )}
         </button>
      </div>

      {/* Message Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-transparent">
         {isLoading ? (
            <div className="flex justify-center pt-10">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
            </div>
         ) : (
           <>
             <div className="text-center text-xs text-slate-500 my-4">昨天 10:00</div>
             {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'} mb-4`}>
                   {msg.sender === 'other' && (
                      <div className="flex-shrink-0 mr-2 flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden shadow-sm border border-theme">
                           <img 
                             src={`https://picsum.photos/50/50?random=${msg.senderName ? msg.senderName.length + 10 : msg.id}`} 
                             alt="avatar" 
                             className="w-full h-full object-cover" 
                           />
                        </div>
                      </div>

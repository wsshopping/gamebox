
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MESSAGES } from '../services/mockData';

interface ChatMessage {
  id: number;
  text: string;
  sender: 'me' | 'other';
  senderName?: string; // For group chats
  time: string;
  type: 'text' | 'image';
}

const Chat: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const endRef = useRef<HTMLDivElement>(null);
  const [inputText, setInputText] = useState('');
  
  // Determine if it's a group chat based on ID prefix 'g' or finding it in mock data
  const mockInfo = MESSAGES.find(m => m.id === id);
  const isGroup = id?.startsWith('g') || mockInfo?.type === 'group';
  const chatTitle = mockInfo?.title || (isGroup ? '群聊' : 'ProGamer123');
  const memberCount = mockInfo?.members || 1;

  // Mock Messages Data
  const initialMessages: ChatMessage[] = isGroup ? [
    { id: 1, text: '欢迎大家加入本群！', sender: 'other', senderName: '管理员', time: '10:00', type: 'text' },
    { id: 2, text: '请问什么时候开新区？', sender: 'other', senderName: '路人甲', time: '10:05', type: 'text' },
    { id: 3, text: '大概下周二左右。', sender: 'other', senderName: '客服小美', time: '10:06', type: 'text' },
    { id: 4, text: '收到，谢谢！', sender: 'me', time: '10:08', type: 'text' },
  ] : [
    { id: 1, text: '你好，请问那个80级的账号还在吗？', sender: 'other', time: '10:00', type: 'text' },
    { id: 2, text: '我想买，可以便宜点吗？', sender: 'other', time: '10:01', type: 'text' },
    { id: 3, text: '你好，还在的。', sender: 'me', time: '10:05', type: 'text' },
    { id: 4, text: '价格已经是最低了哦，全套史诗装备很难得的。', sender: 'me', time: '10:06', type: 'text' },
    { id: 5, text: '好吧，那我再考虑一下。', sender: 'other', time: '10:10', type: 'text' },
  ];

  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);

  // Auto scroll to bottom
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    const newMsg: ChatMessage = {
      id: Date.now(),
      text: inputText,
      sender: 'me',
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      type: 'text'
    };
    setMessages([...messages, newMsg]);
    setInputText('');
    
    // Auto reply mock
    setTimeout(() => {
       setMessages(prev => [...prev, {
         id: Date.now() + 1,
         text: isGroup ? '大家注意安全交易。' : '对方正在输入...',
         sender: 'other',
         senderName: isGroup ? '系统机器人' : undefined,
         time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
         type: 'text'
       }]);
    }, 2000);
  };

  return (
    <div className="bg-gray-100 h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white p-4 shadow-sm flex items-center justify-between sticky top-0 z-20">
         <div className="flex items-center">
            <button onClick={() => navigate(-1)} className="text-gray-600 mr-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <div>
               <h1 className="text-lg font-bold text-gray-900 leading-none max-w-[200px] truncate">{chatTitle}</h1>
               <span className="text-[10px] text-gray-500 flex items-center mt-0.5">
                 {isGroup ? `${memberCount} 人在线` : <span className="text-green-500">● 在线</span>}
               </span>
            </div>
         </div>
         <button className="text-gray-600">
           {isGroup ? (
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
           ) : (
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" /></svg>
           )}
         </button>
      </div>

      {/* Message Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
         <div className="text-center text-xs text-gray-400 my-4">昨天 10:00</div>
         
         {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'} mb-4`}>
               {msg.sender === 'other' && (
                  <div className="flex-shrink-0 mr-2 flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-gray-300 overflow-hidden">
                       <img src={`https://picsum.photos/50/50?random=${msg.id}`} alt="avatar" className="w-full h-full object-cover" />
                    </div>
                  </div>
               )}
               
               <div className={`max-w-[70%] flex flex-col ${msg.sender === 'me' ? 'items-end' : 'items-start'}`}>
                  {isGroup && msg.sender === 'other' && msg.senderName && (
                    <span className="text-[10px] text-gray-500 mb-1 ml-1">{msg.senderName}</span>
                  )}
                  
                  <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm break-words relative group ${
                    msg.sender === 'me' 
                    ? 'bg-blue-600 text-white rounded-tr-sm' 
                    : 'bg-white text-gray-800 rounded-tl-sm'
                  }`}>
                     {msg.text}
                  </div>
                  <div className={`text-[10px] text-gray-400 mt-1 ${msg.sender === 'me' ? 'text-right' : 'text-left'}`}>
                     {msg.time}
                  </div>
               </div>

               {msg.sender === 'me' && (
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex-shrink-0 ml-2 overflow-hidden">
                     <img src="https://picsum.photos/50/50?random=user1" alt="avatar" className="w-full h-full object-cover" />
                  </div>
               )}
            </div>
         ))}
         <div ref={endRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white p-3 border-t border-gray-200 sticky bottom-0 z-20 pb-safe">
         <div className="flex items-center gap-2">
            <button className="text-gray-500 p-1">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
            </button>
            <div className="flex-1 bg-gray-100 rounded-full flex items-center px-4 py-2">
               <input 
                 type="text" 
                 className="flex-1 bg-transparent border-none outline-none text-sm"
                 placeholder={isGroup ? "在群里发言..." : "发消息..."}
                 value={inputText}
                 onChange={(e) => setInputText(e.target.value)}
                 onKeyDown={(e) => e.key === 'Enter' && handleSend()}
               />
               <button className="text-gray-400 ml-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
               </button>
            </div>
            {inputText ? (
              <button onClick={handleSend} className="bg-blue-600 text-white rounded-full p-2 w-10 h-10 flex items-center justify-center transition-all shadow-md">
                 <svg className="w-5 h-5 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
              </button>
            ) : (
              <button className="text-gray-500 p-1">
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              </button>
            )}
         </div>
      </div>
    </div>
  );
};

export default Chat;

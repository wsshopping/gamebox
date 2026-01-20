
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";

interface Message {
  role: 'user' | 'model';
  text: string;
}

const AIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: '嗨！我是你的 贪玩盒子 专属 AI 助手 👾。想找新游戏、查攻略、还是聊聊最新的电竞比赛？随时问我！' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Dragging State
  // Initial position: Bottom Right (approx)
  const [position, setPosition] = useState(() => ({
    x: window.innerWidth - 80,
    y: window.innerHeight - 150
  }));
  const isDragging = useRef(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<Chat | null>(null);

  // Initialize Chat Logic
  const initChat = () => {
    try {
      const apiKey = process.env.API_KEY;
      if (apiKey) {
        const ai = new GoogleGenAI({ apiKey });
        chatRef.current = ai.chats.create({
          model: 'gemini-3-flash-preview',
          config: {
            systemInstruction: '你是一个热情、专业的游戏社区助手“贪玩 AI”。你服务于“贪玩盒子”App。你了解各类热门游戏（如古剑奇谭、赛博飞车、原神、王者荣耀等）。你的回复应该简短有力，语气活泼，带有游戏玩家的“黑话”和幽默感。请始终使用中文回复。',
          },
        });
      }
    } catch (e) {
      console.error("Failed to init AI", e);
    }
  };

  useEffect(() => {
    if (!chatRef.current) {
      initChat();
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  // --- Drag Logic ---

  const handlePointerDown = (e: React.PointerEvent) => {
    // Only left click allows drag
    if (e.button !== 0) return;
    
    const target = e.target as HTMLElement;
    if (target.tagName === 'BUTTON' || target.closest('button')) {
    }

    isDragging.current = false;
    dragStartPos.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y
    };
    
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
    
    const newX = e.clientX - dragStartPos.current.x;
    const newY = e.clientY - dragStartPos.current.y;
    
    if (Math.abs(newX - position.x) > 5 || Math.abs(newY - position.y) > 5) {
        isDragging.current = true;
    }

    setPosition({ x: newX, y: newY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
  };

  const handleFABClick = () => {
    if (!isDragging.current) {
      setIsOpen(!isOpen);
    }
    isDragging.current = false;
  };

  const handleSend = async () => {
    if (!inputValue.trim()) return;
    if (isLoading) return;

    const userText = inputValue.trim();
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setInputValue('');
    setIsLoading(true);

    try {
      if (!chatRef.current) {
        initChat();
        if (!chatRef.current) throw new Error("AI not initialized");
      }

      const result: GenerateContentResponse = await chatRef.current.sendMessage({ message: userText });
      const text = result.text;
      
      setMessages(prev => [...prev, { role: 'model', text: text || '抱歉，我好像断线了，请稍后再试。' }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', text: '网络有点波动，请检查你的网络连接。' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div 
      className="fixed z-[100] touch-none"
      style={{ left: position.x, top: position.y }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* Chat Window */}
      {isOpen && (
        <div 
           className="absolute bottom-16 right-0 w-[90vw] max-w-[360px] bg-white rounded-[24px] shadow-2xl border border-white overflow-hidden flex flex-col transition-all origin-bottom-right animate-fade-in-up"
           style={{ height: '500px', maxHeight: '70vh' }}
           onPointerDown={(e) => e.stopPropagation()} 
        >
           {/* Header - Black Gold */}
           <div className="bg-slate-900 p-4 flex justify-between items-center text-white cursor-grab active:cursor-grabbing border-b border-slate-700">
              <div className="flex items-center space-x-2">
                 <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700">
                    🤖
                 </div>
                 <div>
                    <h3 className="font-bold text-sm text-amber-400">贪玩 AI 助手</h3>
                    <p className="text-[10px] text-slate-400">Powered by Gemini</p>
                 </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-slate-800 rounded-full transition-colors text-slate-400">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
           </div>
           
           {/* Messages */}
           <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 scroll-smooth">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                   {msg.role === 'model' && (
                     <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-xs mr-2 shadow-sm border border-slate-800 flex-shrink-0 text-amber-400">
                        AI
                     </div>
                   )}
                   <div 
                     className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                        msg.role === 'user' 
                        ? 'bg-slate-900 text-amber-50 rounded-tr-sm border border-slate-800' 
                        : 'bg-white text-slate-800 rounded-tl-sm border border-slate-100'
                     }`}
                   >
                     {msg.text}
                   </div>
                </div>
              ))}
              {isLoading && (
                 <div className="flex justify-start">
                    <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-xs mr-2 shadow-sm border border-slate-800 text-amber-400">AI</div>
                    <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm border border-slate-100 flex items-center space-x-1">
                       <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                       <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-75"></div>
                       <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-150"></div>
                    </div>
                 </div>
              )}
              <div ref={messagesEndRef} />
           </div>

           {/* Input */}
           <div className="p-3 bg-white border-t border-slate-100">
              <div className="flex items-center bg-slate-100 rounded-full px-4 py-2 focus-within:ring-2 focus-within:ring-slate-200 focus-within:bg-white transition-all">
                 <input 
                   type="text" 
                   value={inputValue}
                   onChange={(e) => setInputValue(e.target.value)}
                   onKeyDown={handleKeyDown}
                   placeholder="问问攻略、福利..."
                   className="flex-1 bg-transparent border-none outline-none text-sm text-slate-900 placeholder-slate-400"
                 />
                 <button 
                   onClick={handleSend}
                   disabled={!inputValue.trim() || isLoading}
                   className={`ml-2 p-1.5 rounded-full transition-all ${
                      inputValue.trim() && !isLoading
                      ? 'bg-slate-900 text-amber-400 shadow-md hover:bg-slate-800' 
                      : 'bg-slate-200 text-slate-400'
                   }`}
                 >
                    <svg className="w-4 h-4 transform -rotate-45 translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* FAB Button - Black Gold */}
      <button 
        onClick={handleFABClick}
        className="group relative w-14 h-14 rounded-full bg-slate-900 shadow-[0_8px_30px_rgba(15,23,42,0.4)] flex items-center justify-center text-amber-400 transition-transform active:scale-95 hover:scale-105 border border-slate-700"
      >
         <div className="relative z-10 text-2xl">
            {isOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            ) : (
                <span className="group-hover:animate-bounce inline-block">👾</span>
            )}
         </div>
      </button>
    </div>
  );
};

export default AIAssistant;

import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";

interface Message {
  role: 'user' | 'model';
  text: string;
}

const AIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: '嗨！我是你的 GameBox 专属 AI 助手 👾。想找新游戏、查攻略、还是聊聊最新的电竞比赛？随时问我！' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<Chat | null>(null);

  // Initialize Chat
  useEffect(() => {
    if (!chatRef.current) {
      try {
         // Using process.env.API_KEY as mandated
         const apiKey = process.env.API_KEY;
         if (apiKey) {
            const ai = new GoogleGenAI({ apiKey });
            chatRef.current = ai.chats.create({
              model: 'gemini-3-flash-preview',
              config: {
                systemInstruction: '你是一个热情、专业的游戏社区助手 GameBox AI。你了解各类热门游戏（如古剑奇谭、赛博飞车、原神、王者荣耀等）。你的回复应该简短有力，语气活泼，带有游戏玩家的“黑话”和幽默感。请始终使用中文回复。',
              },
            });
         }
      } catch (e) {
        console.error("Failed to init AI", e);
      }
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userText = inputValue;
    setInputValue('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setIsLoading(true);

    try {
      if (!chatRef.current) {
         // Fallback if key is missing or init failed. 
         // In a real app we might handle this gracefully, here we simulate a response if API key is missing for demo purposes,
         // or try to reconnect if possible.
         const apiKey = process.env.API_KEY;
         if (apiKey) {
             const ai = new GoogleGenAI({ apiKey });
             chatRef.current = ai.chats.create({ model: 'gemini-3-flash-preview' });
         } else {
             throw new Error("API Key missing");
         }
      }

      const response: GenerateContentResponse = await chatRef.current!.sendMessage({ message: userText });
      const aiText = response.text;
      
      setMessages(prev => [...prev, { role: 'model', text: aiText || "系统思考中..." }]);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "😵 服务器娘似乎断开了链接（请检查 API Key 配置）。" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Chat Window - Premium Glassmorphism Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 w-80 max-w-[calc(100vw-32px)] h-[500px] max-h-[60vh] bg-white/90 backdrop-blur-2xl rounded-[32px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-white/50 z-50 flex flex-col overflow-hidden animate-[fadeInUp_0.3s_ease-out]">
           {/* Header */}
           <div className="p-4 bg-gradient-to-r from-indigo-600 to-purple-600 flex justify-between items-center shrink-0 shadow-sm">
              <div className="flex items-center space-x-2">
                 <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md shadow-inner border border-white/10">
                    <span className="text-lg">✨</span>
                 </div>
                 <div>
                    <h3 className="text-white font-black text-sm tracking-wide">GameBox AI</h3>
                    <div className="flex items-center space-x-1">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                        <p className="text-indigo-100 text-[10px] font-medium">Online</p>
                    </div>
                 </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white p-1 transition-colors rounded-full hover:bg-white/10">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
           </div>
           
           {/* Messages Area */}
           <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-slate-50/50 to-white/50">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                   {msg.role === 'model' && (
                     <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center mr-2 mt-1 shrink-0 text-xs shadow-sm text-indigo-600 border border-indigo-200">AI</div>
                   )}
                   <div className={`px-4 py-2.5 rounded-2xl text-sm max-w-[85%] leading-relaxed shadow-sm backdrop-blur-sm ${
                      msg.role === 'user' 
                      ? 'bg-indigo-600 text-white rounded-tr-sm bg-gradient-to-br from-indigo-600 to-purple-700' 
                      : 'bg-white/80 text-slate-700 rounded-tl-sm border border-white/60'
                   }`}>
                      {msg.text}
                   </div>
                </div>
              ))}
              {isLoading && (
                 <div className="flex justify-start">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center mr-2 mt-1 shrink-0 text-xs shadow-sm border border-indigo-200">AI</div>
                    <div className="bg-white/80 px-4 py-3 rounded-2xl rounded-tl-sm border border-white/60 shadow-sm flex space-x-1 items-center h-10">
                       <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
                       <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-75"></div>
                       <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-150"></div>
                    </div>
                 </div>
              )}
              <div ref={messagesEndRef} />
           </div>

           {/* Input Area */}
           <div className="p-3 bg-white/60 backdrop-blur-md border-t border-white/50 shrink-0">
              <div className="flex items-center bg-white rounded-full px-4 py-2 border border-slate-200 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 transition-all shadow-sm">
                 <input 
                   type="text" 
                   value={inputValue}
                   onChange={(e) => setInputValue(e.target.value)}
                   onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                   placeholder="问点什么..." 
                   className="flex-1 bg-transparent border-none outline-none text-sm text-slate-800 placeholder-slate-400"
                 />
                 <button 
                   onClick={handleSend}
                   disabled={!inputValue.trim() || isLoading}
                   className={`ml-2 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                      inputValue.trim() && !isLoading
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md transform hover:scale-110 active:scale-95' 
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                   }`}
                 >
                    <svg className="w-4 h-4 transform rotate-90 translate-x-[1px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Floating Action Button (FAB) */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="fixed bottom-24 right-4 w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full shadow-[0_8px_30px_rgba(99,102,241,0.4)] flex items-center justify-center text-white z-40 group transition-all duration-300 hover:scale-110 hover:shadow-[0_15px_40px_rgba(99,102,241,0.6)] border-2 border-white/20 backdrop-blur-md"
        >
           <span className="text-2xl filter drop-shadow-md group-hover:rotate-12 transition-transform duration-300">🤖</span>
           {/* Pulse Effect */}
           <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500 border-2 border-indigo-600"></span>
           </span>
        </button>
      )}
      
      {/* Simple fade-in animation keyframes injection */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </>
  );
};

export default AIAssistant;
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MESSAGES } from '../services/mockData';

interface MessageListProps {
  isEmbedded?: boolean;
}

const MessageList: React.FC<MessageListProps> = ({ isEmbedded = false }) => {
  const navigate = useNavigate();

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
      case 'system': return 'bg-blue-50 text-blue-500';
      case 'activity': return 'bg-orange-50 text-orange-500';
      case 'group': return 'bg-purple-50 text-purple-500';
      case 'social': return 'bg-green-50 text-green-500';
      default: return 'bg-gray-50 text-gray-500';
    }
  };

  const handleMessageClick = (type: string, id: string) => {
    // Both social (private) and group chats go to the chat page
    if (type === 'social' || type === 'group') {
      navigate(`/chat/${id}`);
    } else {
      console.log('Clicked notification:', id);
    }
  };

  return (
    <div className="bg-[#f8fafc] min-h-full">
      {/* Header - Only show if not embedded */}
      {!isEmbedded && (
        <div className="bg-white p-4 sticky top-0 z-40 shadow-sm flex items-center justify-between border-b border-gray-100">
           <h1 className="text-lg font-bold text-gray-900">消息中心</h1>
           <button className="text-sm text-gray-500 hover:text-gray-900">清除未读</button>
        </div>
      )}

      {/* Message List */}
      <div className="p-4 space-y-3">
         {MESSAGES.map(msg => (
           <div 
             key={msg.id} 
             onClick={() => handleMessageClick(msg.type, msg.id)}
             className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex space-x-3 cursor-pointer active:scale-[0.98] transition-all hover:shadow-md hover:border-gray-200"
           >
              {msg.avatar ? (
                <div className="relative">
                   <img src={msg.avatar} alt={msg.title} className="w-12 h-12 rounded-xl object-cover ring-1 ring-gray-100 shadow-sm" />
                   {msg.type === 'group' && (
                     <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
                        <div className="bg-purple-600 rounded-full w-4 h-4 flex items-center justify-center text-[8px] text-white">群</div>
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
                    <h3 className="text-sm font-bold text-gray-800 truncate pr-2">{msg.title}</h3>
                    <span className="text-xs text-gray-400 flex-shrink-0">{msg.time}</span>
                 </div>
                 <p className="text-xs text-gray-500 line-clamp-1">
                    {msg.type === 'group' && !msg.content.includes(':') ? <span className="text-gray-600 mr-1">张三:</span> : ''}
                    {msg.content}
                 </p>
              </div>
              {!msg.read && (
                <div className="self-center flex flex-col items-end space-y-1">
                   <div className="w-2.5 h-2.5 bg-red-500 rounded-full shadow-sm"></div>
                </div>
              )}
           </div>
         ))}
      </div>
    </div>
  );
};

export default MessageList;
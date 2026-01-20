import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Message, SystemNotification, Interaction, GroupRecommendation } from '../types';

interface MessageListProps {
  isEmbedded?: boolean;
}

// Define the available views for this page
type ViewMode = 'main' | 'system' | 'interactions' | 'groups';

const MessageList: React.FC<MessageListProps> = ({ isEmbedded = false }) => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>('main');
  const [isLoading, setIsLoading] = useState(true);

  // Data States
  const [messages, setMessages] = useState<Message[]>([]);
  const [systemNotes, setSystemNotes] = useState<SystemNotification[]>([]);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [recommendedGroups, setRecommendedGroups] = useState<GroupRecommendation[]>([]);
  const [groupCategory, setGroupCategory] = useState('全部');
  const [joiningGroupId, setJoiningGroupId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [viewMode, groupCategory]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      if (viewMode === 'main') {
        const data = await api.message.getList();
        setMessages(data);
      } else if (viewMode === 'system') {
        const data = await api.message.getSystemNotifications();
        setSystemNotes(data);
      } else if (viewMode === 'interactions') {
        const data = await api.message.getInteractions();
        setInteractions(data);
      } else if (viewMode === 'groups') {
        const data = await api.message.getRecommendedGroups(groupCategory);
        setRecommendedGroups(data);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGroupClick = (groupId: string) => {
    navigate(`/group/${groupId}`);
  };

  const handleQuickJoin = async (groupId: string) => {
    if (joiningGroupId) return;
    setJoiningGroupId(groupId);
    try {
      await api.message.joinGroup(groupId, '');
      navigate(`/chat/${groupId}`);
    } catch (error) {
      console.error("Failed to join group", error);
    } finally {
      setJoiningGroupId(null);
    }
  };

  const handleMessageClick = (type: string, id: string) => {
    if (type === 'social' || type === 'group') {
      navigate(`/chat/${id}`);
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
      case 'system': return 'bg-blue-50 text-blue-500';
      case 'activity': return 'bg-orange-50 text-orange-500';
      case 'group': return 'bg-purple-50 text-purple-500';
      case 'social': return 'bg-green-50 text-green-500';
      default: return 'bg-gray-50 text-gray-500';
    }
  };

  // --- Sub-View Renderers ---

  const renderSystemView = () => (
    <div className="p-4 space-y-4">
      {isLoading ? (
         [1,2].map(i => <div key={i} className="h-24 bg-white rounded-xl animate-pulse"></div>)
      ) : (
        systemNotes.map(note => (
          <div key={note.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-start space-x-3">
             <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
               note.level === 'warning' ? 'bg-red-50 text-red-500' : 
               note.level === 'success' ? 'bg-green-50 text-green-500' : 'bg-blue-50 text-blue-500'
             }`}>
               {note.level === 'warning' ? '⚠️' : note.level === 'success' ? '✅' : 'ℹ️'}
             </div>
             <div className="flex-1">
               <div className="flex justify-between items-start mb-1">
                 <h3 className="font-bold text-gray-900 text-sm">{note.title}</h3>
                 <span className="text-xs text-gray-400">{note.time}</span>
               </div>
               <p className="text-xs text-gray-600 leading-relaxed">{note.content}</p>
             </div>
             {!note.read && <div className="w-2 h-2 rounded-full bg-red-500 mt-2"></div>}
          </div>
        ))
      )}
    </div>
  );

  const renderInteractionsView = () => (
    <div className="p-4 space-y-3">
      {isLoading ? (
        [1,2,3].map(i => <div key={i} className="h-16 bg-white rounded-xl animate-pulse"></div>)
      ) : (
        interactions.map(item => (
          <div key={item.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center space-x-3">
             <div className="relative">
               <img src={item.userAvatar} alt={item.userName} className="w-10 h-10 rounded-full object-cover" />
               <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border-2 border-white text-[10px] ${
                  item.type === 'like' ? 'bg-red-100 text-red-500' :
                  item.type === 'comment' ? 'bg-blue-100 text-blue-500' :
                  item.type === 'follow' ? 'bg-yellow-100 text-yellow-600' : 'bg-purple-100 text-purple-500'
               }`}>
                  {item.type === 'like' ? '❤️' : item.type === 'comment' ? '💬' : item.type === 'follow' ? '➕' : '@'}
               </div>
             </div>
             <div className="flex-1 min-w-0">
               <div className="flex justify-between items-baseline">
                 <h3 className="text-sm font-bold text-gray-900 truncate">{item.userName}</h3>
                 <span className="text-[10px] text-gray-400">{item.time}</span>
               </div>
               <p className="text-xs text-gray-600 truncate">
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

  const renderGroupsView = () => (
    <div className="min-h-full pb-20">
      {/* Search & Banner */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white pb-12 relative overflow-hidden">
         <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
         
         {/* Back Button for Embedded Mode */}
         {isEmbedded && (
            <div className="absolute top-6 left-4 z-20">
               <button 
                 onClick={() => setViewMode('main')} 
                 className="text-white hover:text-white/80 p-1.5 bg-white/20 backdrop-blur-md rounded-full shadow-sm border border-white/20 transition-all active:scale-95"
               >
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
               </button>
            </div>
         )}
         
         <div className={isEmbedded ? "mt-8" : ""}>
             <h2 className="text-xl font-black mb-1 relative z-10">发现精彩群聊</h2>
             <p className="text-indigo-100 text-xs relative z-10">找到志同道合的玩伴，一起开黑！</p>
             
             <div className="mt-4 bg-white/20 backdrop-blur-md rounded-full flex items-center px-4 py-2 border border-white/20 relative z-10">
                <svg className="w-4 h-4 text-white/70 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <input type="text" placeholder="搜索群号/关键词" className="bg-transparent border-none outline-none text-sm text-white placeholder-white/60 flex-1" />
             </div>
         </div>
      </div>

      <div className="-mt-6 bg-[#f8fafc] rounded-t-[24px] relative px-4 pt-6">
        {/* Categories */}
        <div className="flex overflow-x-auto space-x-2 pb-4 no-scrollbar">
           {['全部', '开放世界', '竞技射击', 'MOBA', '休闲模拟'].map(cat => (
             <button 
               key={cat}
               onClick={() => setGroupCategory(cat)}
               className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                 groupCategory === cat ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-gray-500 border border-gray-100'
               }`}
             >
               {cat}
             </button>
           ))}
        </div>

        {/* Group List */}
        <div className="space-y-3">
          {isLoading ? (
             [1,2,3].map(i => <div key={i} className="h-24 bg-white rounded-xl animate-pulse"></div>)
          ) : (
            recommendedGroups.map(group => (
              <div 
                key={group.id} 
                onClick={() => handleGroupClick(group.id)}
                className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-start space-x-4 cursor-pointer hover:shadow-md transition-all active:scale-[0.99]"
              >
                 <img src={group.avatar} alt={group.name} className="w-14 h-14 rounded-xl object-cover border border-gray-100" />
                 <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                       <h4 className="font-bold text-gray-900 text-sm truncate">{group.name}</h4>
                       <span className="text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">{group.category}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">{group.desc}</p>
                    <div className="mt-2 flex items-center justify-between">
                       <div className="flex space-x-1">
                          {group.tags.map(tag => (
                            <span key={tag} className="text-[9px] text-indigo-500 bg-indigo-50 px-1 rounded">{tag}</span>
                          ))}
                       </div>
                       <button 
                         onClick={(e) => {
                             e.stopPropagation();
                             if(group.id === 'g1') {
                                navigate(`/chat/${group.id}`);
                             } else {
                                handleQuickJoin(group.id);
                             }
                         }}
                         disabled={joiningGroupId === group.id}
                         className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                           group.id === 'g1' 
                           ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                           : 'bg-slate-900 text-white hover:bg-slate-800'
                         } ${joiningGroupId === group.id ? 'opacity-70 cursor-not-allowed' : ''}`}
                       >
                         {group.id === 'g1' ? '进入' : (joiningGroupId === group.id ? '加入中...' : '加入')}
                       </button>
                    </div>
                 </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );


  // --- Main Render ---

  return (
    <div className="bg-[#f8fafc] min-h-full pb-20">
      {/* Header for Standalone Mode */}
      {!isEmbedded && (
        <div className="bg-white p-4 sticky top-0 z-40 shadow-sm flex items-center justify-between border-b border-gray-100">
           <div className="flex items-center space-x-2">
             {viewMode !== 'main' && (
               <button onClick={() => setViewMode('main')} className="mr-2 text-gray-600 hover:bg-gray-100 p-1 rounded-full transition-colors">
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
               </button>
             )}
             <h1 className="text-lg font-bold text-gray-900">
               {viewMode === 'main' && '消息中心'}
               {viewMode === 'system' && '系统通知'}
               {viewMode === 'interactions' && '互动消息'}
               {viewMode === 'groups' && '发现群聊'}
             </h1>
           </div>
           {viewMode === 'main' && (
             <button className="text-sm text-gray-500 hover:text-gray-900">清除未读</button>
           )}
        </div>
      )}

      {/* Header for Embedded Mode (System & Interactions only, Groups handles itself) */}
      {isEmbedded && (viewMode === 'system' || viewMode === 'interactions') && (
        <div className="bg-white p-3 sticky top-0 z-40 shadow-sm flex items-center border-b border-gray-100">
           <button 
             onClick={() => setViewMode('main')} 
             className="mr-3 text-gray-600 hover:bg-gray-100 p-1.5 rounded-full transition-colors"
           >
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
           </button>
           <h1 className="text-base font-bold text-gray-900">
             {viewMode === 'system' && '系统通知'}
             {viewMode === 'interactions' && '互动消息'}
           </h1>
        </div>
      )}

      {/* Main View */}
      {viewMode === 'main' && (
        <>
           {/* Functional Grid */}
           <div className="grid grid-cols-3 gap-3 p-4 pb-2">
              <div 
                onClick={() => setViewMode('system')}
                className="flex flex-col items-center space-y-2 cursor-pointer group bg-white p-3 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all"
              >
                 <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-lg shadow-inner">
                   🔔
                 </div>
                 <span className="text-xs font-bold text-gray-700">系统通知</span>
              </div>
              
              <div 
                onClick={() => setViewMode('interactions')}
                className="flex flex-col items-center space-y-2 cursor-pointer group bg-white p-3 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all"
              >
                 <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-lg shadow-inner relative">
                   @
                   {/* Badge Mock */}
                   <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white text-[9px] text-white flex items-center justify-center">2</div>
                 </div>
                 <span className="text-xs font-bold text-gray-700">互动消息</span>
              </div>
              
              <div 
                onClick={() => setViewMode('groups')}
                className="flex flex-col items-center space-y-2 cursor-pointer group bg-white p-3 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all"
              >
                 <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-lg shadow-inner">
                   👥
                 </div>
                 <span className="text-xs font-bold text-gray-700">加入群聊</span>
              </div>
           </div>

           {/* Message List */}
           <div className="p-4 space-y-3 min-h-[300px]">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">最近消息</h3>
              {isLoading ? (
                 [1, 2, 3].map(i => (
                   <div key={i} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex space-x-3 animate-pulse h-20"></div>
                 ))
              ) : (
                messages.filter(m => !['system', 'activity'].includes(m.type)).map(msg => (
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
                ))
              )}
           </div>
        </>
      )}

      {/* Conditional Rendering of Sub-Views */}
      {viewMode === 'system' && renderSystemView()}
      {viewMode === 'interactions' && renderInteractionsView()}
      {viewMode === 'groups' && renderGroupsView()}

    </div>
  );
};

export default MessageList;

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Message } from '../types';
import { useAuth } from '../context/AuthContext';
import { ContactItem } from '../services/api/contact';

const STATUS_CONFIG = {
  online: { color: 'bg-emerald-500', label: '在线', ring: 'ring-emerald-500/30' },
  busy: { color: 'bg-red-500', label: '忙碌', ring: 'ring-red-500/30' },
  away: { color: 'bg-amber-500', label: '离开', ring: 'ring-amber-500/30' },
  offline: { color: 'bg-slate-500', label: '隐身', ring: 'ring-slate-500/30' },
};

const GroupDiscover: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateStatus } = useAuth(); // AuthContext still manages global user state
  const [isLoading, setIsLoading] = useState(true);
  const [chatList, setChatList] = useState<Message[]>([]);
  const [contacts, setContacts] = useState<ContactItem[]>([]);
  const [newRequestCount, setNewRequestCount] = useState(0);
  
  // Tabs: Chats (对话), Contacts (通讯录), Me (我)
  const [activeTab, setActiveTab] = useState<'chats' | 'contacts' | 'me'>('chats');
  
  // Dropdowns
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  // Search/Add Modal State
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchType, setSearchType] = useState<'friend' | 'group'>('friend');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Create Group Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    name: '',
    category: '游戏交流',
    desc: '',
    tags: ''
  });
  const [isCreating, setIsCreating] = useState(false);

  // Initial Data Fetch
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [recentChats, contactList, reqCount] = await Promise.all([
          api.message.getRecentChats(),
          api.contact.getList(),
          api.contact.getNewRequestCount()
      ]);
      setChatList(recentChats);
      setContacts(contactList);
      setNewRequestCount(reqCount);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChatClick = (chatId: string) => {
    navigate(`/chat/${chatId}`);
  };

  const toggleAddMenu = () => {
    setShowAddMenu(!showAddMenu);
  };

  const handleBack = () => {
    navigate('/social', { state: { tab: 'message' } });
  };

  const handleStatusChange = async (status: 'online' | 'busy' | 'away' | 'offline') => {
      // 1. Update via API
      await api.user.updateStatus(status);
      // 2. Update Context to reflect UI changes immediately
      await updateStatus(status);
      setShowStatusMenu(false);
  };

  // Open Add Friend Modal
  const handleOpenAddFriend = () => {
    setShowAddMenu(false);
    setSearchType('friend');
    setSearchKeyword('');
    setShowSearchModal(true);
  };

  // Open Join Group Modal
  const handleOpenJoinGroup = () => {
    setShowAddMenu(false);
    setSearchType('group');
    setSearchKeyword('');
    setShowSearchModal(true);
  };

  // Submit Search/Add Request
  const handleSearchSubmit = async () => {
    if (!searchKeyword.trim()) return;
    setIsSearching(true);
    try {
        if (searchType === 'friend') {
            // In a full app, you might search first, then click "Add" on a result.
            // Here we simulate sending a request directly to the ID/Name found.
            await api.contact.add(searchKeyword, '你好，我想加你为好友');
            alert(`已发送好友申请给 "${searchKeyword}"`);
        } else {
            // Join Group
            await api.group.join(searchKeyword, '申请加入');
            alert(`已发送入群申请给群组 "${searchKeyword}"`);
        }
        setShowSearchModal(false);
    } catch (e) {
        alert("操作失败，请检查ID是否正确");
    } finally {
        setIsSearching(false);
    }
  };

  const handleCreateGroup = async () => {
    if (!createFormData.name || !createFormData.desc) {
      alert("请填写群名称和群介绍");
      return;
    }
    
    setIsCreating(true);
    try {
      const tagsArray = createFormData.tags.split(' ').filter(t => t.trim() !== '');
      await api.group.create({
        name: createFormData.name,
        category: createFormData.category,
        desc: createFormData.desc,
        tags: tagsArray
      });
      setShowCreateModal(false);
      alert("群组创建成功！");
      setCreateFormData({ name: '', category: '游戏交流', desc: '', tags: '' });
    } catch (e) {
      alert("创建失败，请重试");
    } finally {
      setIsCreating(false);
    }
  };

  const userStatus = user?.status || 'online';
  const statusInfo = STATUS_CONFIG[userStatus as keyof typeof STATUS_CONFIG];

  // Group contacts by letter
  const groupedContacts: Record<string, ContactItem[]> = {};
  contacts.forEach(contact => {
      const letter = contact.group || '#';
      if (!groupedContacts[letter]) groupedContacts[letter] = [];
      groupedContacts[letter].push(contact);
  });
  const sortedLetters = Object.keys(groupedContacts).sort();

  return (
    <div className="app-bg min-h-screen flex flex-col transition-colors duration-500 relative">
      {/* Telegram-style Sticky Header */}
      <div className="sticky top-0 z-50 bg-[var(--bg-primary)]/90 backdrop-blur-xl border-b border-theme transition-colors duration-500">
        <div className="flex items-center px-4 py-2 gap-3 h-14">
           {/* Back Button */}
           <button 
             onClick={handleBack} 
             className="relative z-10 text-slate-400 hover:text-[var(--text-primary)] transition-colors p-2 -ml-2 rounded-full active:bg-white/10"
           >
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
           </button>
           
           <div className="flex-1 relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
              <input 
                type="text" 
                placeholder={activeTab === 'contacts' ? "搜索联系人" : "搜索"} 
                className="w-full bg-[#0f172a] dark:bg-black/20 text-[var(--text-primary)] border border-theme rounded-xl pl-10 pr-4 py-1.5 text-sm outline-none focus:border-accent/50 transition-all placeholder-slate-500"
              />
           </div>

           {/* Plus Button with Dropdown */}
           <div className="relative">
              <button 
                onClick={toggleAddMenu}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-accent-gradient text-black shadow-lg active:scale-95 transition-transform"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              </button>

              {showAddMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowAddMenu(false)}></div>
                  <div className="absolute right-0 top-12 w-40 card-bg border border-theme rounded-xl shadow-xl z-50 overflow-hidden py-1 animate-fade-in-up">
                    <button 
                        onClick={handleOpenAddFriend}
                        className="w-full text-left px-4 py-3 hover:bg-white/5 flex items-center space-x-3 transition-colors"
                    >
                       <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                       <span className="text-sm font-bold" style={{color: 'var(--text-primary)'}}>加好友</span>
                    </button>
                    <div className="h-px bg-white/5 mx-2"></div>
                    <button 
                        onClick={handleOpenJoinGroup}
                        className="w-full text-left px-4 py-3 hover:bg-white/5 flex items-center space-x-3 transition-colors"
                    >
                       <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                       <span className="text-sm font-bold" style={{color: 'var(--text-primary)'}}>加群组</span>
                    </button>
                    <div className="h-px bg-white/5 mx-2"></div>
                    <button 
                      onClick={() => { setShowAddMenu(false); setShowCreateModal(true); }}
                      className="w-full text-left px-4 py-3 hover:bg-white/5 flex items-center space-x-3 transition-colors"
                    >
                       <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                       <span className="text-sm font-bold" style={{color: 'var(--text-primary)'}}>创建群组</span>
                    </button>
                  </div>
                </>
              )}
           </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto pb-20">
        {/* Chats Tab */}
        {activeTab === 'chats' && (
          isLoading ? (
             <div className="px-4 space-y-4 mt-4">
               {[1,2,3].map(i => <div key={i} className="h-16 bg-slate-800/50 rounded-xl animate-pulse"></div>)}
             </div>
          ) : (
            <div className="flex flex-col">
              {chatList.map((chat) => (
                <div 
                  key={chat.id} 
                  onClick={() => handleChatClick(chat.id)}
                  className="flex items-center px-4 py-3 cursor-pointer transition-colors active:bg-white/5 hover:bg-white/5 relative group"
                >
                   {/* Large Avatar */}
                   <div className="relative mr-4">
                      <img src={chat.avatar || `https://picsum.photos/100/100?random=${chat.id}`} alt={chat.title} className="w-14 h-14 rounded-full object-cover bg-slate-800 border border-theme/50" />
                      
                      {/* Badge Logic */}
                      {chat.type === 'group' ? (
                          <div className="absolute bottom-0 right-0 bg-purple-500/80 text-white rounded-full p-0.5 border-2 border-[var(--bg-primary)] scale-75">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                          </div>
                      ) : (
                          // If private chat, check if user is in contacts and online
                          contacts.find(c => c.id === chat.id)?.status === 'online' && (
                            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-[var(--bg-primary)]"></div>
                          )
                      )}
                   </div>

                   {/* Text Info */}
                   <div className="flex-1 min-w-0 pr-2 py-1 border-b border-theme/30 group-last:border-none h-full flex flex-col justify-center">
                      <div className="flex justify-between items-center mb-1">
                         <h3 className="text-[16px] font-bold text-[var(--text-primary)] truncate">{chat.title}</h3>
                         <span className={`text-xs ${!chat.read ? 'text-accent font-bold' : 'text-slate-500'}`}>{chat.time}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                         <span className="text-slate-500 truncate text-xs max-w-[70%]">{chat.content}</span>
                         
                         {!chat.read ? (
                            <div className="bg-red-500 text-white text-[10px] font-bold px-1.5 h-4 min-w-[16px] flex items-center justify-center rounded-full">1</div>
                         ) : (
                            chat.members && (
                              <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded ml-2 whitespace-nowrap">
                                {chat.members > 1000 ? `${(chat.members/1000).toFixed(1)}k` : chat.members} 成员
                              </span>
                            )
                         )}
                      </div>
                   </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* Contacts Tab */}
        {activeTab === 'contacts' && (
           <div className="px-4 py-2">
              <div className="card-bg p-3 rounded-xl border border-theme flex items-center justify-between mb-4 mt-2 hover:bg-white/5 cursor-pointer">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-accent-gradient rounded-full flex items-center justify-center text-black">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                    </div>
                    <span className="text-sm font-bold" style={{color: 'var(--text-primary)'}}>新朋友</span>
                </div>
                {newRequestCount > 0 && (
                   <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold">{newRequestCount}</div>
                )}
              </div>

              {isLoading ? (
                  <div className="space-y-4">
                      <div className="h-4 bg-slate-800 rounded w-10"></div>
                      <div className="h-14 bg-slate-800/50 rounded-xl"></div>
                      <div className="h-14 bg-slate-800/50 rounded-xl"></div>
                  </div>
              ) : (
                 sortedLetters.map(letter => (
                    <div key={letter} className="mb-4">
                        <div className="text-xs font-bold text-slate-500 px-1 mb-2 sticky top-14 bg-[var(--bg-primary)]/80 backdrop-blur-sm z-10">{letter}</div>
                        <div className="space-y-2">
                            {groupedContacts[letter].map(contact => {
                                const status = STATUS_CONFIG[contact.status] || STATUS_CONFIG.offline;
                                return (
                                    <div key={contact.id} onClick={() => handleChatClick(contact.id)} className="card-bg p-3 rounded-xl border border-theme flex items-center space-x-3 cursor-pointer hover:bg-white/5 transition-colors group">
                                        <div className="relative">
                                            <img src={contact.avatar} className="w-10 h-10 rounded-full object-cover" alt={contact.name}/>
                                            <div className={`absolute bottom-0 right-0 w-3 h-3 ${status.color} rounded-full border-2 border-[var(--bg-card)]`}></div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <span className="font-bold text-sm block truncate" style={{color: 'var(--text-primary)'}}>{contact.name}</span>
                                            <span className="text-[10px] text-slate-500 truncate block">{contact.bio || status.label}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                 ))
              )}
           </div>
        )}

        {/* Me Tab */}
        {activeTab === 'me' && (
           <div className="p-4 pt-10">
              <div className="flex flex-col items-center">
                  <div className="relative">
                    <img src={user?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=User"} className="w-24 h-24 rounded-full border-4 border-theme object-cover shadow-lg" />
                    
                    {/* Status Toggle Button */}
                    <div className="absolute bottom-0 right-0">
                        <button 
                            onClick={() => setShowStatusMenu(!showStatusMenu)}
                            className={`w-8 h-8 rounded-full border-4 border-[var(--bg-primary)] flex items-center justify-center shadow-lg transition-transform active:scale-95 ${statusInfo.color}`}
                        >
                            <div className="w-2 h-2 bg-white rounded-full opacity-50"></div>
                        </button>
                        
                        {/* Status Menu */}
                        {showStatusMenu && (
                            <div className="absolute bottom-full right-0 mb-2 w-32 card-bg border border-theme rounded-xl shadow-xl overflow-hidden animate-fade-in-up z-20">
                                {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                                    <button
                                        key={key}
                                        onClick={() => handleStatusChange(key as any)}
                                        className="w-full flex items-center space-x-3 px-3 py-2.5 hover:bg-white/5 transition-colors text-left"
                                    >
                                        <div className={`w-3 h-3 rounded-full ${config.color}`}></div>
                                        <span className={`text-xs font-bold ${userStatus === key ? 'text-[var(--text-primary)]' : 'text-slate-500'}`}>{config.label}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                        {showStatusMenu && <div className="fixed inset-0 z-10" onClick={() => setShowStatusMenu(false)}></div>}
                    </div>
                  </div>
                  
                  <h2 className="text-xl font-black mt-4" style={{color: 'var(--text-primary)'}}>{user?.username || 'Guest'}</h2>
                  <div className={`mt-1 flex items-center space-x-2 px-3 py-1 rounded-full bg-[var(--bg-glass)] border border-theme`}>
                      <div className={`w-2 h-2 rounded-full ${statusInfo.color}`}></div>
                      <p className="text-slate-500 text-xs font-bold">{statusInfo.label}</p>
                  </div>
                  <p className="text-slate-500 text-[10px] mt-1 font-mono">ID: {user?.id.slice(-8) || '000000'}</p>
              </div>

              <div className="mt-8 space-y-3">
                 <div className="card-bg p-4 rounded-xl border border-theme flex items-center justify-between cursor-pointer hover:bg-white/5">
                    <div className="flex items-center space-x-3">
                       <span className="text-xl">⭐</span>
                       <span className="font-bold text-sm" style={{color: 'var(--text-primary)'}}>收藏夹</span>
                    </div>
                    <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                 </div>
                 <div className="card-bg p-4 rounded-xl border border-theme flex items-center justify-between cursor-pointer hover:bg-white/5">
                    <div className="flex items-center space-x-3">
                       <span className="text-xl">🖼️</span>
                       <span className="font-bold text-sm" style={{color: 'var(--text-primary)'}}>相册</span>
                    </div>
                    <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                 </div>
                 <div className="card-bg p-4 rounded-xl border border-theme flex items-center justify-between cursor-pointer hover:bg-white/5">
                    <div className="flex items-center space-x-3">
                       <span className="text-xl">⚙️</span>
                       <span className="font-bold text-sm" style={{color: 'var(--text-primary)'}}>设置</span>
                    </div>
                    <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                 </div>
              </div>
           </div>
        )}
      </div>

      {/* Specific Bottom Navigation */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50">
         <div className="glass-bg border-t border-theme shadow-[0_-10px_30px_rgba(0,0,0,0.5)] flex justify-around px-4 py-2 pb-6 relative transition-colors duration-500">
            
            {/* Chats Tab */}
            <button 
               onClick={() => setActiveTab('chats')} 
               className={`relative flex flex-col items-center justify-center w-20 py-1 group ${activeTab === 'chats' ? 'text-accent' : 'text-slate-500 hover:text-slate-300'}`}
            >
               <div className={`relative transition-all duration-300`}>
                  <div className={`absolute -inset-4 bg-gradient-to-tr from-accent-color to-transparent rounded-full blur-xl transition-all duration-500 ${activeTab === 'chats' ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}></div>
                  <div className={`relative z-10 transition-transform duration-300 ${activeTab === 'chats' ? 'scale-110 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)] -translate-y-0.5' : 'scale-100'}`}>
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                  </div>
               </div>
               <span className={`text-[10px] font-medium tracking-wide mt-1 transition-all duration-300 ${activeTab === 'chats' ? 'text-accent font-bold scale-105 drop-shadow-sm' : 'text-slate-600'}`}>对话</span>
            </button>

            {/* Contacts Tab */}
            <button 
               onClick={() => setActiveTab('contacts')} 
               className={`relative flex flex-col items-center justify-center w-20 py-1 group ${activeTab === 'contacts' ? 'text-accent' : 'text-slate-500 hover:text-slate-300'}`}
            >
               <div className={`relative transition-all duration-300`}>
                  <div className={`absolute -inset-4 bg-gradient-to-tr from-accent-color to-transparent rounded-full blur-xl transition-all duration-500 ${activeTab === 'contacts' ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}></div>
                  <div className={`relative z-10 transition-transform duration-300 ${activeTab === 'contacts' ? 'scale-110 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)] -translate-y-0.5' : 'scale-100'}`}>
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                  </div>
               </div>
               <span className={`text-[10px] font-medium tracking-wide mt-1 transition-all duration-300 ${activeTab === 'contacts' ? 'text-accent font-bold scale-105 drop-shadow-sm' : 'text-slate-600'}`}>通讯录</span>
            </button>

            {/* Me Tab */}
            <button 
               onClick={() => setActiveTab('me')} 
               className={`relative flex flex-col items-center justify-center w-20 py-1 group ${activeTab === 'me' ? 'text-accent' : 'text-slate-500 hover:text-slate-300'}`}
            >
               <div className={`relative transition-all duration-300`}>
                  <div className={`absolute -inset-4 bg-gradient-to-tr from-accent-color to-transparent rounded-full blur-xl transition-all duration-500 ${activeTab === 'me' ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}></div>
                  <div className={`relative z-10 transition-transform duration-300 ${activeTab === 'me' ? 'scale-110 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)] -translate-y-0.5' : 'scale-100'}`}>
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  </div>
               </div>
               <span className={`text-[10px] font-medium tracking-wide mt-1 transition-all duration-300 ${activeTab === 'me' ? 'text-accent font-bold scale-105 drop-shadow-sm' : 'text-slate-600'}`}>我</span>
            </button>

         </div>
      </div>
      
      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-6">
           <div 
             className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
             onClick={() => !isCreating && setShowCreateModal(false)}
           ></div>
           
           <div className="relative w-full max-w-sm card-bg rounded-[24px] p-6 border border-theme shadow-2xl animate-fade-in-up">
              <div className="flex justify-between items-center mb-6">
                 <h3 className="text-lg font-bold" style={{color: 'var(--text-primary)'}}>创建群组</h3>
                 <button onClick={() => setShowCreateModal(false)} className="text-slate-500 hover:text-slate-300 p-1">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                 </button>
              </div>

              <div className="space-y-4">
                 <div className="flex items-center space-x-4 mb-2">
                    <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-theme flex items-center justify-center text-2xl cursor-pointer hover:bg-slate-700 transition-colors">
                       📸
                    </div>
                    <div className="flex-1">
                       <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">群名称</label>
                       <input 
                         type="text" 
                         value={createFormData.name}
                         onChange={(e) => setCreateFormData({...createFormData, name: e.target.value})}
                         placeholder="给群组起个名字" 
                         className="w-full bg-[var(--bg-primary)] border border-theme rounded-xl px-4 py-2 text-sm outline-none text-[var(--text-primary)] focus:border-accent/50 transition-colors"
                       />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">分类</label>
                        <select 
                           value={createFormData.category}
                           onChange={(e) => setCreateFormData({...createFormData, category: e.target.value})}
                           className="w-full bg-[var(--bg-primary)] border border-theme rounded-xl px-3 py-2 text-sm outline-none text-[var(--text-primary)] focus:border-accent/50 transition-colors appearance-none"
                        >
                           <option value="游戏交流">游戏交流</option>
                           <option value="公会/战队">公会/战队</option>
                           <option value="兴趣爱好">兴趣爱好</option>
                           <option value="其他">其他</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">标签 (空格分隔)</label>
                        <input 
                           type="text" 
                           value={createFormData.tags}
                           onChange={(e) => setCreateFormData({...createFormData, tags: e.target.value})}
                           placeholder="如: 开黑 萌新" 
                           className="w-full bg-[var(--bg-primary)] border border-theme rounded-xl px-4 py-2 text-sm outline-none text-[var(--text-primary)] focus:border-accent/50 transition-colors"
                        />
                    </div>
                 </div>

                 <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">群介绍</label>
                    <textarea 
                       value={createFormData.desc}
                       onChange={(e) => setCreateFormData({...createFormData, desc: e.target.value})}
                       placeholder="介绍一下这个群组..." 
                       className="w-full h-24 bg-[var(--bg-primary)] border border-theme rounded-xl px-4 py-3 text-sm outline-none text-[var(--text-primary)] focus:border-accent/50 transition-colors resize-none"
                    ></textarea>
                 </div>

                 <button 
                   onClick={handleCreateGroup}
                   disabled={isCreating || !createFormData.name}
                   className={`w-full bg-accent-gradient text-black font-bold py-3.5 rounded-xl shadow-lg mt-2 flex items-center justify-center ${isCreating ? 'opacity-70 cursor-not-allowed' : 'active:scale-95 transition-transform'}`}
                 >
                   {isCreating ? (
                      <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                   ) : (
                      '立即创建'
                   )}
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Add Friend / Join Group Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-6">
           {/* Backdrop */}
           <div 
             className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
             onClick={() => !isSearching && setShowSearchModal(false)}
           ></div>
           
           <div className="relative w-full max-w-sm card-bg rounded-[24px] p-6 border border-theme shadow-2xl animate-fade-in-up">
              <div className="flex justify-between items-center mb-6">
                 <h3 className="text-lg font-bold" style={{color: 'var(--text-primary)'}}>
                    {searchType === 'friend' ? '添加好友' : '加入群组'}
                 </h3>
                 <button onClick={() => setShowSearchModal(false)} className="text-slate-500 hover:text-slate-300 p-1">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                 </button>
              </div>

              <div className="space-y-4">
                 <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">
                       {searchType === 'friend' ? '好友 ID / 昵称' : '群组 ID / 名称'}
                    </label>
                    <div className="relative">
                      <input 
                        type="text" 
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                        placeholder="请输入查找内容..." 
                        className="w-full bg-[var(--bg-primary)] border border-theme rounded-xl pl-11 pr-4 py-3.5 text-sm outline-none text-[var(--text-primary)] focus:border-accent/50 transition-colors"
                        autoFocus
                      />
                      <div className="absolute left-3.5 top-3.5 text-slate-500">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                      </div>
                    </div>
                 </div>

                 <button 
                   onClick={handleSearchSubmit}
                   disabled={isSearching || !searchKeyword.trim()}
                   className={`w-full bg-accent-gradient text-black font-bold py-3.5 rounded-xl shadow-lg mt-2 flex items-center justify-center ${isSearching || !searchKeyword.trim() ? 'opacity-70 cursor-not-allowed' : 'active:scale-95 transition-transform'}`}
                 >
                   {isSearching ? '查找中...' : '查找并申请'}
                 </button>
                 
                 <p className="text-center text-[10px] text-slate-500">
                    需要对方验证后才能{searchType === 'friend' ? '开始聊天' : '加入群聊'}
                 </p>
              </div>
           </div>
        </div>
      )}

    </div>
  );
};

export default GroupDiscover;

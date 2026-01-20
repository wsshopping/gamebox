import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { GroupRecommendation } from '../types';

const GroupDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [group, setGroup] = useState<GroupRecommendation | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState<'none' | 'joined'>('none');

  useEffect(() => {
    const loadGroup = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const data = await api.message.getGroupDetail(id);
        setGroup(data);
        
        // MOCK LOGIC: automatically mark 'g1' as joined for demonstration
        if (id === 'g1') {
          setApplicationStatus('joined');
        } else {
          setApplicationStatus('none');
        }
      } finally {
        setIsLoading(false);
      }
    };
    loadGroup();
  }, [id]);

  const handleJoin = async () => {
    if (!id) return;
    setIsSubmitting(true);
    try {
      // Direct join, no message needed
      await api.message.joinGroup(id, ''); 
      setApplicationStatus('joined');
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
       <div className="bg-white min-h-screen flex items-center justify-center">
         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
       </div>
    );
  }

  if (!group) {
    return (
      <div className="bg-white min-h-screen flex flex-col items-center justify-center">
         <p className="text-gray-500">群组不存在</p>
         <button onClick={() => navigate(-1)} className="mt-4 text-indigo-600">返回</button>
      </div>
    );
  }

  return (
    <div className="bg-[#f8fafc] min-h-screen relative flex flex-col">
       {/* Transparent Header */}
       <div className="absolute top-0 left-0 right-0 z-20 p-4 flex justify-between items-center">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/30 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/30 transition-colors">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
          </button>
       </div>

       {/* Banner Image */}
       <div className="h-60 relative w-full overflow-hidden">
          <img src={group.avatar} alt="cover" className="w-full h-full object-cover blur-sm scale-110" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#f8fafc] via-[#f8fafc]/50 to-transparent"></div>
       </div>

       {/* Main Content (Overlapping) */}
       <div className="-mt-20 px-4 relative z-10 pb-24 flex-1">
          <div className="bg-white rounded-3xl p-6 shadow-xl shadow-indigo-100 border border-white">
             <div className="flex flex-col items-center -mt-16 mb-4">
                <img src={group.avatar} alt="avatar" className="w-24 h-24 rounded-full border-4 border-white shadow-md object-cover" />
                <h1 className="text-xl font-black text-slate-900 mt-3 text-center">{group.name}</h1>
                <p className="text-xs text-slate-400 mt-1">ID: {group.id.toUpperCase()}</p>
             </div>

             <div className="flex justify-center space-x-8 py-4 border-b border-gray-50 mb-4">
                <div className="text-center">
                   <p className="text-lg font-bold text-slate-900">{group.members}</p>
                   <p className="text-[10px] text-slate-400 uppercase tracking-wide">成员</p>
                </div>
                <div className="text-center">
                   <p className="text-lg font-bold text-slate-900">482</p>
                   <p className="text-[10px] text-slate-400 uppercase tracking-wide">在线</p>
                </div>
                <div className="text-center">
                   <p className="text-lg font-bold text-emerald-500">Lv.5</p>
                   <p className="text-[10px] text-slate-400 uppercase tracking-wide">等级</p>
                </div>
             </div>

             <div className="space-y-6">
                <div>
                   <h3 className="text-sm font-bold text-slate-900 mb-2">群介绍</h3>
                   <p className="text-sm text-slate-600 leading-relaxed">{group.desc}</p>
                </div>

                <div>
                   <h3 className="text-sm font-bold text-slate-900 mb-2">群标签</h3>
                   <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-medium">{group.category}</span>
                      {group.tags.map(tag => (
                        <span key={tag} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">#{tag}</span>
                      ))}
                   </div>
                </div>

                <div>
                   <h3 className="text-sm font-bold text-slate-900 mb-3 flex justify-between items-center">
                      群成员
                      <span className="text-xs text-slate-400 font-normal">查看全部 &gt;</span>
                   </h3>
                   <div className="flex -space-x-2 overflow-hidden py-1">
                      {[1,2,3,4,5].map(i => (
                         <img key={i} className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover" src={`https://picsum.photos/50/50?random=${i+10}`} alt=""/>
                      ))}
                      <div className="flex items-center justify-center h-8 w-8 rounded-full ring-2 ring-white bg-gray-100 text-[10px] text-gray-500 font-bold">
                        +99
                      </div>
                   </div>
                </div>
             </div>
          </div>
       </div>

       {/* Bottom Action Bar */}
       <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 pb-8 z-30">
          <div className="max-w-md mx-auto">
             {applicationStatus === 'joined' ? (
                <button 
                  onClick={() => navigate(`/chat/${group.id}`)}
                  className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-slate-200"
                >
                  进入聊天
                </button>
             ) : (
                <button 
                  onClick={handleJoin}
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-200 active:scale-95 transition-transform"
                >
                  {isSubmitting ? '加入中...' : '加入群聊'}
                </button>
             )}
          </div>
       </div>
    </div>
  );
};

export default GroupDetail;
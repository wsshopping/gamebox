
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Feedback: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    type: 'bug',
    server: '',
    description: '',
    contact: user?.phone || '',
  });
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock Image Upload
  const handleImageUpload = () => {
    // Simulating a file selection
    const mockImage = `https://picsum.photos/200/200?random=${Date.now()}`;
    if (images.length < 3) {
      setImages([...images, mockImage]);
    }
  };

  const handleSubmit = async () => {
    if (!formData.description) return;
    
    setIsSubmitting(true);
    // Simulate API Call
    setTimeout(() => {
      setIsSubmitting(false);
      navigate(-1);
      // In a real app, show a toast here
      alert("反馈已提交，感谢您的建议！");
    }, 1500);
  };

  return (
    <div className="app-bg min-h-screen flex flex-col transition-colors duration-500">
      {/* Header - Minimalist */}
      <div className="glass-bg sticky top-0 z-40 px-6 py-4 flex items-center justify-between border-b border-theme transition-colors duration-500">
         <div className="flex items-center">
            <button 
              onClick={() => navigate(-1)} 
              className="mr-4 text-slate-500 hover:text-[var(--text-primary)] p-2 -ml-2 rounded-full transition-colors hover:bg-[var(--bg-card)]"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <h1 className="text-lg font-bold tracking-wide" style={{color: 'var(--text-primary)'}}>问题反馈</h1>
         </div>
         <button className="text-xs text-slate-500 hover:text-accent font-medium tracking-wide">
            历史记录
         </button>
      </div>

      <div className="flex-1 px-6 py-8 pb-24 overflow-y-auto">
        <div className="max-w-md mx-auto space-y-8 animate-fade-in-up">
          
          {/* Section 1: Issue Type (Chips) */}
          <div className="space-y-3">
             <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em] ml-1">反馈类型</label>
             <div className="flex space-x-3">
                {[
                  { id: 'bug', label: 'Bug 提交' },
                  { id: 'suggestion', label: '功能建议' },
                  { id: 'account', label: '账号问题' }
                ].map(type => (
                  <button
                    key={type.id}
                    onClick={() => setFormData({...formData, type: type.id})}
                    className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 border ${
                       formData.type === type.id
                       ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] border-transparent shadow-lg scale-105'
                       : 'bg-[var(--bg-glass)] text-slate-500 border-theme hover:border-slate-400'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
             </div>
          </div>

          {/* Section 2: Info Fields (Glassmorphism) */}
          <div className="space-y-4">
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                   <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em] ml-1">账号 ID</label>
                   <div className="card-bg px-4 py-3.5 rounded-2xl border border-theme flex items-center shadow-sm opacity-70 cursor-not-allowed">
                      <span className="text-sm font-mono font-medium opacity-60" style={{color: 'var(--text-primary)'}}>{user?.id.slice(-8) || 'Unknown'}</span>
                      <svg className="w-4 h-4 ml-auto text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                   </div>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em] ml-1">服务器 / 区域</label>
                   <div className="relative group">
                      <input 
                        type="text" 
                        value={formData.server}
                        onChange={(e) => setFormData({...formData, server: e.target.value})}
                        className="w-full bg-[var(--bg-glass)] border border-theme rounded-2xl px-4 py-3.5 text-sm outline-none text-[var(--text-primary)] placeholder-slate-600 focus:ring-1 focus:ring-accent/30 focus:border-accent/50 transition-all shadow-sm backdrop-blur-md"
                        placeholder="例如: S1-龙腾"
                      />
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-accent/0 via-accent/5 to-accent/0 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-500"></div>
                   </div>
                </div>
             </div>
          </div>

          {/* Section 3: Description (Recessed Look) */}
          <div className="space-y-3">
             <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em] ml-1">问题详情</label>
             <div className="relative">
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full h-40 bg-[var(--bg-primary)] border border-theme rounded-3xl p-5 text-sm leading-relaxed text-[var(--text-primary)] placeholder-slate-600 outline-none resize-none focus:shadow-[inset_0_2px_10px_rgba(0,0,0,0.2)] focus:border-accent/30 transition-all scrollbar-thin scrollbar-thumb-slate-700"
                  placeholder="请详细描述您遇到的问题或建议，以便我们更快地为您解决..."
                ></textarea>
                {/* Character Count */}
                <div className="absolute bottom-4 right-5 text-[10px] text-slate-600 font-medium">
                   {formData.description.length} / 500
                </div>
             </div>
          </div>

          {/* Section 4: Screenshot Upload (Elegant UI) */}
          <div className="space-y-3">
             <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em] ml-1">截图凭证 <span className="opacity-50 lowercase font-normal">(optional)</span></label>
             <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                {/* Upload Button */}
                <button 
                  onClick={handleImageUpload}
                  disabled={images.length >= 3}
                  className="flex-shrink-0 w-24 h-24 rounded-2xl border border-dashed border-theme bg-[var(--bg-glass)] flex flex-col items-center justify-center text-slate-500 hover:text-accent hover:border-accent/50 hover:bg-[var(--bg-card)] transition-all duration-300 group"
                >
                   <div className="w-8 h-8 mb-2 rounded-full bg-slate-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                   </div>
                   <span className="text-[9px] font-bold uppercase tracking-wider">Upload</span>
                </button>

                {/* Previews */}
                {images.map((img, index) => (
                   <div key={index} className="relative w-24 h-24 flex-shrink-0 rounded-2xl overflow-hidden border border-theme group animate-fade-in-up">
                      <img src={img} alt="preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                         <button 
                           onClick={() => setImages(images.filter((_, i) => i !== index))}
                           className="text-white hover:text-red-400 transition-colors"
                         >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                         </button>
                      </div>
                   </div>
                ))}
             </div>
          </div>

          {/* Section 5: Contact */}
          <div className="space-y-2 pt-2">
             <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em] ml-1">联系方式</label>
             <input 
               type="text" 
               value={formData.contact}
               onChange={(e) => setFormData({...formData, contact: e.target.value})}
               className="w-full bg-[var(--bg-primary)] border-b border-theme px-2 py-3 text-sm outline-none text-[var(--text-primary)] placeholder-slate-600 focus:border-accent transition-colors font-medium"
               placeholder="手机号 / 邮箱 / QQ"
             />
          </div>

          {/* Submit Button */}
          <div className="pt-6">
             <button 
               onClick={handleSubmit}
               disabled={isSubmitting || !formData.description}
               className={`w-full py-4 rounded-2xl font-bold text-sm tracking-widest uppercase transition-all duration-500 flex items-center justify-center shadow-lg group relative overflow-hidden ${
                 !formData.description 
                 ? 'bg-slate-800 text-slate-600 cursor-not-allowed border border-white/5' 
                 : 'bg-gradient-to-r from-slate-700 to-slate-800 text-white hover:shadow-[0_0_25px_rgba(255,255,255,0.1)] border border-white/10'
               }`}
             >
               {/* Shine Effect */}
               <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 group-hover:left-full transition-all duration-1000 ease-in-out"></div>
               
               <span className="relative z-10 flex items-center">
                 {isSubmitting ? (
                   <>
                     <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                     Submitting...
                   </>
                 ) : (
                   'Submit Feedback'
                 )}
               </span>
             </button>
             <p className="text-center text-[10px] text-slate-600 mt-4">
               我们会认真阅读每一条反馈，并在3个工作日内通过系统消息回复您。
             </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Feedback;

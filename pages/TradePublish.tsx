import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { TradeListing } from '../types';

const TradePublish: React.FC = () => {
  const [searchParams] = useSearchParams();
  const listingId = Number(searchParams.get('id') || '');
  const [editingListing, setEditingListing] = useState<TradeListing | null>(null);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState('');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [formState, setFormState] = useState({
    title: '',
    description: '',
    category: '',
    pricePoints: '0',
    stock: '1',
    images: [] as string[]
  });
  const noticeTimer = useRef<number | null>(null);
  const navigate = useNavigate();

  const showNotice = (message: string) => {
    setNotice(message);
    if (noticeTimer.current) {
      window.clearTimeout(noticeTimer.current);
    }
    noticeTimer.current = window.setTimeout(() => {
      setNotice('');
    }, 3000);
  };

  useEffect(() => {
    return () => {
      if (noticeTimer.current) {
        window.clearTimeout(noticeTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!listingId) {
      return;
    }
    let active = true;
    setLoading(true);
    api.trade.getListingDetail(listingId)
      .then(res => {
        if (!active) return;
        setEditingListing(res.listing);
        setFormState({
          title: res.listing.title,
          description: res.listing.description,
          category: res.listing.category,
          pricePoints: String(res.listing.pricePoints),
          stock: String(res.listing.stock),
          images: res.listing.images || []
        });
      })
      .catch((err: any) => {
        if (active) {
          showNotice(err?.message || '加载失败');
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [listingId]);

  const handleSubmit = async () => {
    let images = formState.images.map(item => item.trim()).filter(Boolean);
    if (imageFiles.length > 0) {
      try {
        showNotice('正在上传图片');
        const uploaded: string[] = [];
        for (const file of imageFiles) {
          const res = await api.trade.uploadImage(file);
          uploaded.push(res.url);
        }
        images = uploaded;
      } catch (e: any) {
        showNotice(e?.message || '图片上传失败');
        return;
      }
    }
    const payload = {
      title: formState.title.trim(),
      description: formState.description.trim(),
      category: formState.category.trim(),
      pricePoints: Number(formState.pricePoints),
      stock: Number(formState.stock),
      images
    };

    try {
      if (editingListing) {
        await api.trade.updateListing(editingListing.id, payload);
        showNotice('更新成功');
      } else {
        await api.trade.createListing(payload);
        showNotice('发布成功');
      }
      setImageFiles([]);
      navigate('/trade/my');
    } catch (e: any) {
      showNotice(e?.message || '保存失败');
    }
  };

  return (
    <div className="app-bg min-h-full transition-colors duration-500 pt-[calc(5rem+env(safe-area-inset-top))]">
      {notice && (
        <div className="fixed top-[calc(1rem+env(safe-area-inset-top))] left-1/2 -translate-x-1/2 z-50">
          <div className="card-bg rounded-[18px] border border-amber-400/30 bg-slate-900/90 px-4 py-2 shadow-2xl shadow-black/40">
            <div className="flex items-center gap-2">
              <span className="text-amber-300 text-sm">⚠️</span>
              <span className="text-xs font-semibold text-slate-100">{notice}</span>
            </div>
          </div>
        </div>
      )}

      <div className="glass-bg p-5 pt-[calc(1.25rem+env(safe-area-inset-top))] fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md z-40 shadow-sm flex items-center gap-3 border-b border-theme transition-colors duration-500">
        <button onClick={() => navigate(-1)} className="text-slate-400 hover:bg-white/10 p-1 rounded-full">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <h1 className="text-lg font-bold" style={{color: 'var(--text-primary)'}}>
          {editingListing ? '编辑商品' : '发布商品'}
        </h1>
      </div>

      <div className="px-5 pb-24 pt-6">
        {loading ? (
          <div className="card-bg rounded-2xl h-64 animate-pulse border border-theme"></div>
        ) : (
          <div className="card-bg rounded-[24px] border border-theme p-5 space-y-3 text-sm">
            <input
              value={formState.title}
              onChange={e => setFormState(prev => ({ ...prev, title: e.target.value }))}
              placeholder="标题"
              className="w-full bg-transparent border border-theme rounded-xl px-3 py-2 text-[var(--text-primary)] placeholder:text-slate-500"
            />
            <textarea
              value={formState.description}
              onChange={e => setFormState(prev => ({ ...prev, description: e.target.value }))}
              placeholder="描述"
              rows={3}
              className="w-full bg-transparent border border-theme rounded-xl px-3 py-2 text-[var(--text-primary)] placeholder:text-slate-500"
            />
            <div className="flex gap-2">
              <input
                value={formState.category}
                onChange={e => setFormState(prev => ({ ...prev, category: e.target.value }))}
                placeholder="分类(2-4字)"
                className="flex-1 bg-transparent border border-theme rounded-xl px-3 py-2 text-[var(--text-primary)] placeholder:text-slate-500"
              />
              <input
                value={formState.pricePoints}
                onChange={e => setFormState(prev => ({ ...prev, pricePoints: e.target.value }))}
                placeholder="积分价格"
                type="number"
                className="w-28 bg-transparent border border-theme rounded-xl px-3 py-2 text-[var(--text-primary)] placeholder:text-slate-500"
              />
            </div>
            <input
              value={formState.stock}
              onChange={e => setFormState(prev => ({ ...prev, stock: e.target.value }))}
              placeholder="库存"
              type="number"
              className="w-28 bg-transparent border border-theme rounded-xl px-3 py-2 text-[var(--text-primary)] placeholder:text-slate-500"
            />
            <div className="space-y-2">
              <div className="text-xs text-slate-500">上传图片（选填，JPG/PNG，最多3张）</div>
              <input
                type="file"
                accept="image/jpeg,image/png"
                multiple
                onChange={e => {
                  const files = Array.from(e.target.files || []);
                  if (files.length > 3) {
                    showNotice('最多上传3张');
                  }
                  setImageFiles(files.slice(0, 3));
                }}
                className="w-full text-xs text-slate-400 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-800 file:px-3 file:py-2 file:text-xs file:text-slate-200"
              />
              {formState.images.length > 0 && imageFiles.length === 0 && (
                <div className="flex gap-2 overflow-x-auto">
                  {formState.images.map((img, idx) => (
                    <div key={idx} className="w-16 h-16 rounded-lg overflow-hidden border border-theme">
                      <img src={img} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
              {imageFiles.length > 0 && (
                <div className="text-xs text-slate-500">
                  已选择 {imageFiles.length} 张图片{formState.images.length > 0 ? '（将替换原图）' : ''}
                </div>
              )}
            </div>
            <button onClick={handleSubmit} className="w-full py-2 rounded-xl bg-accent-gradient text-black font-bold">
              {editingListing ? '保存' : '发布'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TradePublish;

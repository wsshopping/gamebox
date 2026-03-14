import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { imApi, IMGroupInviteResolveResponse } from '../services/api/im'
import { useIm } from '../context/ImContext'

const GroupInvite: React.FC = () => {
  const { token = '' } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const { refreshConversations, ensureConnected } = useIm()

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [resolved, setResolved] = useState<IMGroupInviteResolveResponse | null>(null)

  useEffect(() => {
    let active = true
    const run = async () => {
      setLoading(true)
      setError('')
      try {
        const data = await imApi.resolveGroupInviteLink(token)
        if (!active) return
        setResolved(data)
      } catch (e: any) {
        if (!active) return
        setError(e?.message || '邀请链接解析失败')
      } finally {
        if (active) setLoading(false)
      }
    }
    run().catch(() => null)
    return () => {
      active = false
    }
  }, [token])

  const titleText = useMemo(() => {
    if (error) return '邀请链接不可用'
    if (!resolved) return '群邀请'
    if (resolved.status === 'valid') return '加入群聊'
    if (resolved.status === 'expired') return '邀请链接已过期'
    if (resolved.status === 'revoked') return '邀请链接已失效'
    if (resolved.status === 'forbidden') return '无权限加入'
    return '邀请链接无效'
  }, [error, resolved])

  const statusHint = useMemo(() => {
    if (error) return error
    if (!resolved) return ''
    if (resolved.status === 'valid' && resolved.alreadyJoined) return '你已在该群，可直接进入聊天'
    if (resolved.status === 'valid') return '确认后将直接加入该群聊'
    return resolved.message || '邀请链接不可用'
  }, [error, resolved])

  const buttonText = useMemo(() => {
    if (!resolved) return '返回'
    if (resolved.status !== 'valid') return '返回聊天中心'
    if (resolved.alreadyJoined) return '进入聊天'
    return '确认加入群聊'
  }, [resolved])

  const disabled = !resolved || submitting || loading

  const handleAction = async () => {
    if (!resolved) {
      navigate('/chat/center')
      return
    }
    if (resolved.status !== 'valid') {
      navigate('/chat/center')
      return
    }

    const groupId = resolved.group?.groupId
    if (resolved.alreadyJoined) {
      navigate(groupId ? `/chat/${groupId}` : '/chat/center')
      return
    }

    setSubmitting(true)
    setError('')
    try {
      const res = await imApi.joinGroupByInviteLink({ token })
      await ensureConnected(12000).catch(() => false)
      await refreshConversations().catch(() => null)
      navigate(`/chat/${res.groupId || groupId}`)
    } catch (e: any) {
      setError(e?.message || '加入失败')
    } finally {
      setSubmitting(false)
    }
  }

  const group = resolved?.group

  return (
    <div className="app-bg min-h-screen relative flex flex-col transition-colors duration-500">
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md z-40 p-4 flex justify-between items-center">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/30 transition-colors border border-white/10"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      <div className="h-56 relative w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-700/40 via-indigo-700/20 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] via-[var(--bg-primary)]/50 to-transparent"></div>
      </div>

      <div className="-mt-20 px-4 relative z-10 pb-28 flex-1">
        <div className="card-bg rounded-3xl p-6 shadow-xl border border-theme">
          {loading ? (
            <div className="space-y-3 animate-pulse">
              <div className="h-6 rounded bg-[var(--bg-primary)]"></div>
              <div className="h-20 rounded bg-[var(--bg-primary)]"></div>
              <div className="h-10 rounded bg-[var(--bg-primary)]"></div>
            </div>
          ) : (
            <>
              <div className="flex flex-col items-center">
                <img
                  src={group?.groupPortrait || `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(group?.groupId || token)}`}
                  alt={group?.groupName || 'group'}
                  className="w-20 h-20 rounded-full border-4 border-[var(--bg-card)] shadow-md object-cover"
                />
                <h1 className="text-xl font-black text-center mt-3" style={{ color: 'var(--text-primary)' }}>{titleText}</h1>
                <p className="text-xs text-slate-400 mt-1 text-center">{statusHint}</p>
              </div>

              {group?.groupId && (
                <div className="mt-6 rounded-2xl border border-theme bg-[var(--bg-primary)] p-4 space-y-2">
                  <div className="text-sm font-bold text-[var(--text-primary)]">{group.groupName || group.groupId}</div>
                  <div className="text-xs text-slate-500">群ID: {group.groupId}</div>
                  <div className="text-xs text-slate-500">成员: {group.memberCount || 0}</div>
                  <div className="text-xs text-slate-500">分类: {group.category || '群聊'}</div>
                  <div className="text-xs text-slate-500 leading-relaxed">简介: {group.desc || '暂无介绍'}</div>
                  {group.tags && group.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {group.tags.map(tag => (
                        <span key={tag} className="px-2.5 py-1 rounded-full border border-theme text-[10px] text-slate-400">#{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {error && (
                <div className="mt-4 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-2">
                  {error}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 card-bg border-t border-theme p-4 pb-8 z-30">
        <div className="max-w-md mx-auto grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate('/chat/center')}
            className="w-full py-3 rounded-xl border border-theme text-sm font-bold text-slate-200 hover:bg-white/5"
          >
            聊天中心
          </button>
          <button
            onClick={handleAction}
            disabled={disabled}
            className={`w-full text-black font-bold py-3 rounded-xl bg-accent-gradient ${disabled ? 'opacity-70 cursor-not-allowed' : 'active:scale-95 transition-transform'}`}
          >
            {submitting ? '处理中...' : buttonText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default GroupInvite

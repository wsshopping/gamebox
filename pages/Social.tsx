import React, { useEffect, useMemo, useState } from 'react';
import Trade from './Trade';
import MessageList from './MessageList';
import Agency, { SuperAdminPage } from './Agency';
import { useAuth } from '../context/AuthContext';
import PlayerMusicModal from '../components/PlayerMusicModal';
import PlayerVideoModal from '../components/PlayerVideoModal';
import { agencyApi } from '../services/api/agency';

const PlayerHub: React.FC<{ onOpenMusic: () => void; onOpenVideo: () => void }> = ({ onOpenMusic, onOpenVideo }) => {
  return (
    <>
      <div className="px-5 pt-6">
        <div className="card-bg rounded-[24px] p-6 shadow-sm border border-theme">
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={onOpenMusic}
              className="card-bg rounded-2xl border border-theme p-4 text-left group hover:border-accent/40 transition-all"
            >
              <div className="w-11 h-11 rounded-2xl bg-[var(--bg-primary)] border border-theme flex items-center justify-center text-xl mb-3 group-hover:text-accent">
                🎵
              </div>
              <div className="text-sm font-bold mb-1" style={{ color: 'var(--text-primary)' }}>听音乐</div>
              <div className="text-xs text-slate-500">开源播放器 · 随机播放</div>
            </button>

            <button
              onClick={onOpenVideo}
              className="card-bg rounded-2xl border border-theme p-4 text-left group hover:border-accent/40 transition-all"
            >
              <div className="w-11 h-11 rounded-2xl bg-[var(--bg-primary)] border border-theme flex items-center justify-center text-xl mb-3 group-hover:text-accent">
                🎬
              </div>
              <div className="text-sm font-bold mb-1" style={{ color: 'var(--text-primary)' }}>刷视频</div>
              <div className="text-xs text-slate-500">随机刷视频 · 自动下一条</div>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

const Social: React.FC = () => {
  const { user } = useAuth();
  const roleId = Number(user?.role?.id ?? user?.roleId ?? 0);
  const isSuperAdmin = roleId === 1;
  const isAgent = roleId === 2 || roleId === 3 || roleId === 4 || roleId === 5;
  const isBoss = roleId === 7;

  const tabs = useMemo(() => {
    const base = ['trade', 'message', 'player'];
    if (isSuperAdmin || isAgent || isBoss) {
      base.push('agency');
    }
    if (isSuperAdmin) {
      base.push('superadmin');
    }
    return base;
  }, [isAgent, isBoss, isSuperAdmin]);

  const defaultTab = useMemo(() => {
    if (tabs.includes('message')) {
      return 'message';
    }
    return tabs[0] as 'trade' | 'message' | 'player' | 'agency' | 'superadmin';
  }, [tabs]);

  const [activeTab, setActiveTab] = useState<'trade' | 'message' | 'player' | 'agency' | 'superadmin'>(defaultTab);
  const [musicOpen, setMusicOpen] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);
  const [super2FALoading, setSuper2FALoading] = useState(false);
  const [super2FABusy, setSuper2FABusy] = useState(false);
  const [super2FAEnabled, setSuper2FAEnabled] = useState(false);
  const [super2FAPassed, setSuper2FAPassed] = useState(false);
  const [super2FACooldown, setSuper2FACooldown] = useState(0);
  const [super2FACode, setSuper2FACode] = useState('');
  const [super2FASecret, setSuper2FASecret] = useState('');
  const [super2FAOtpAuthUrl, setSuper2FAOtpAuthUrl] = useState('');
  const [super2FAError, setSuper2FAError] = useState('');
  const tabCount = tabs.length;
  const activeIndex = tabs.indexOf(activeTab);

  useEffect(() => {
    if (activeIndex === -1) {
      setActiveTab(defaultTab);
    }
  }, [activeIndex, defaultTab]);

  const loadSuper2FAStatus = async () => {
    if (!isSuperAdmin) return;
    setSuper2FALoading(true);
    setSuper2FAError('');
    try {
      const status = await agencyApi.getSuper2FAStatus();
      setSuper2FAEnabled(Boolean(status.enabled));
      setSuper2FAPassed(Boolean(!status.enabled || status.verified));
      setSuper2FACooldown(Number(status.cooldownSeconds || 0));
    } catch (err: any) {
      setSuper2FAError(err?.message || '获取谷歌验证状态失败');
    } finally {
      setSuper2FALoading(false);
    }
  };

  useEffect(() => {
    if (!isSuperAdmin || activeTab !== 'superadmin') return;
    loadSuper2FAStatus();
  }, [activeTab, isSuperAdmin]);

  const handleSetupSuper2FA = async () => {
    setSuper2FABusy(true);
    setSuper2FAError('');
    try {
      const data = await agencyApi.setupSuper2FA();
      setSuper2FASecret(data.secret || '');
      setSuper2FAOtpAuthUrl(data.otpauthUrl || '');
    } catch (err: any) {
      setSuper2FAError(err?.message || '生成绑定信息失败');
    } finally {
      setSuper2FABusy(false);
    }
  };

  const handleEnableSuper2FA = async () => {
    setSuper2FABusy(true);
    setSuper2FAError('');
    try {
      await agencyApi.enableSuper2FA(super2FACode.trim());
      setSuper2FACode('');
      setSuper2FASecret('');
      setSuper2FAOtpAuthUrl('');
      await loadSuper2FAStatus();
    } catch (err: any) {
      setSuper2FAError(err?.message || '启用谷歌验证失败');
      await loadSuper2FAStatus();
    } finally {
      setSuper2FABusy(false);
    }
  };

  const handleVerifySuper2FA = async () => {
    setSuper2FABusy(true);
    setSuper2FAError('');
    try {
      await agencyApi.verifySuper2FA(super2FACode.trim());
      setSuper2FACode('');
      await loadSuper2FAStatus();
    } catch (err: any) {
      setSuper2FAError(err?.message || '谷歌验证失败');
      await loadSuper2FAStatus();
    } finally {
      setSuper2FABusy(false);
    }
  };

  const handleDisableSuper2FA = async () => {
    setSuper2FABusy(true);
    setSuper2FAError('');
    try {
      await agencyApi.disableSuper2FA();
      setSuper2FACode('');
      setSuper2FASecret('');
      setSuper2FAOtpAuthUrl('');
      await loadSuper2FAStatus();
    } catch (err: any) {
      setSuper2FAError(err?.message || '关闭谷歌验证失败');
    } finally {
      setSuper2FABusy(false);
    }
  };

  const handleStartEnableSuper2FA = () => {
    setSuper2FAError('');
    setSuper2FACode('');
    setSuper2FASecret('');
    setSuper2FAOtpAuthUrl('');
    setSuper2FAPassed(false);
  };

  const sliderWidth = `calc(${(100 / tabCount).toFixed(2)}% - 4px)`;
  const sliderLeft = `calc(${(100 / tabCount).toFixed(2)}% * ${activeIndex} + 2px)`;

  return (
    <div className="app-bg min-h-full pt-[calc(5rem+env(safe-area-inset-top))] flex flex-col transition-colors duration-500">
      <div className="glass-bg fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md z-40 border-b border-theme pt-[calc(1rem+env(safe-area-inset-top))] pb-3 transition-colors duration-500">
        <div className="px-4">
          <div className="relative flex w-full bg-[var(--bg-primary)] p-1 rounded-2xl border border-theme shadow-lg shadow-black/5">
            <div
              className="absolute top-1 bottom-1 bg-accent-color/20 rounded-xl shadow-sm border border-accent/20 transition-all duration-300 ease-out"
              style={{ width: sliderWidth, left: sliderLeft }}
            ></div>

            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`relative flex-1 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 z-10 ${
                  activeTab === tab
                    ? 'text-accent'
                    : 'text-slate-500 hover:text-[var(--text-primary)]'
                }`}
              >
                {tab === 'trade'
                  ? '市场交易'
                  : tab === 'message'
                    ? '消息中心'
                    : tab === 'player'
                      ? '玩家中心'
                      : tab === 'agency'
                        ? (isBoss ? '老板中心' : '代理中心')
                        : '超管中心'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1">
        {activeTab === 'trade' && <Trade isEmbedded={true} />}
        {activeTab === 'message' && <MessageList isEmbedded={true} />}
        {activeTab === 'player' && <PlayerHub onOpenMusic={() => setMusicOpen(true)} onOpenVideo={() => setVideoOpen(true)} />}
        {activeTab === 'agency' && <Agency />}
        {activeTab === 'superadmin' && (
          super2FAPassed ? (
            <>
              <div className="px-5 pt-6">
                <div className="card-bg rounded-[20px] p-4 shadow-sm border border-theme flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>超管认证状态</div>
                    <div className="text-xs text-slate-500 mt-1">
                      {super2FAEnabled ? '已开启谷歌认证，下次进入默认需要先校验。' : '谷歌认证已关闭，下次进入无需校验。'}
                    </div>
                  </div>
                  {super2FAEnabled ? (
                    <button
                      onClick={handleDisableSuper2FA}
                      disabled={super2FABusy}
                      className="px-4 py-2 rounded-xl border border-rose-300 text-rose-500 text-xs font-bold disabled:opacity-50"
                    >
                      {super2FABusy ? '关闭中...' : '关闭谷歌认证'}
                    </button>
                  ) : (
                    <button
                      onClick={handleStartEnableSuper2FA}
                      disabled={super2FABusy}
                      className="px-4 py-2 rounded-xl border border-emerald-300 text-emerald-500 text-xs font-bold disabled:opacity-50"
                    >
                      开启谷歌认证
                    </button>
                  )}
                </div>
              </div>
              <SuperAdminPage />
            </>
          ) : (
            <div className="px-5 pt-6">
              <div className="card-bg rounded-[24px] p-6 shadow-sm border border-theme">
                <h3 className="text-base font-bold mb-2" style={{ color: 'var(--text-primary)' }}>超管中心安全校验</h3>
                <p className="text-sm text-slate-500 mb-4">
                  {super2FAEnabled ? '请输入谷歌验证码后进入超管中心。' : '请先绑定谷歌验证器，再进入超管中心。'}
                </p>

                {super2FALoading && (
                  <div className="text-sm text-slate-400 mb-3">正在加载校验状态...</div>
                )}

                {!super2FALoading && !super2FAEnabled && (
                  <div className="space-y-3">
                    <button
                      onClick={handleSetupSuper2FA}
                      disabled={super2FABusy}
                      className="w-full py-2 rounded-xl bg-[var(--text-primary)] text-[var(--bg-primary)] text-sm font-bold disabled:opacity-50"
                    >
                      {super2FABusy ? '生成中...' : '生成谷歌绑定密钥'}
                    </button>
                    {super2FASecret && (
                      <div className="rounded-xl border border-theme p-3 bg-[var(--bg-primary)]">
                        <div className="text-xs text-slate-400 mb-1">密钥（Google Authenticator 手动输入）</div>
                        <div className="text-sm font-mono break-all" style={{ color: 'var(--text-primary)' }}>{super2FASecret}</div>
                        {super2FAOtpAuthUrl && (
                          <a
                            href={super2FAOtpAuthUrl}
                            className="mt-2 inline-block text-xs text-accent underline break-all"
                          >
                            打开 otpauth 链接
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {!super2FALoading && (
                  <div className="space-y-3 mt-4">
                    <input
                      value={super2FACode}
                      onChange={(e) => setSuper2FACode(e.target.value.replace(/\\D/g, '').slice(0, 6))}
                      placeholder="请输入6位谷歌验证码"
                      className="w-full px-3 py-2 rounded-xl border border-theme bg-[var(--bg-primary)] text-sm"
                    />
                    {!super2FAEnabled ? (
                      <button
                        onClick={handleEnableSuper2FA}
                        disabled={super2FABusy || super2FACode.length !== 6}
                        className="w-full py-2 rounded-xl bg-accent text-white text-sm font-bold disabled:opacity-50"
                      >
                        {super2FABusy ? '提交中...' : '完成绑定并进入'}
                      </button>
                    ) : (
                      <button
                        onClick={handleVerifySuper2FA}
                        disabled={super2FABusy || super2FACode.length !== 6}
                        className="w-full py-2 rounded-xl bg-accent text-white text-sm font-bold disabled:opacity-50"
                      >
                        {super2FABusy ? '校验中...' : '校验并进入超管中心'}
                      </button>
                    )}
                  </div>
                )}

                {super2FACooldown > 0 && (
                  <div className="mt-3 text-xs text-amber-400">尝试过多，请稍后重试（约 {super2FACooldown} 秒）。</div>
                )}
                {super2FAError && (
                  <div className="mt-3 text-xs text-rose-400">{super2FAError}</div>
                )}
              </div>
            </div>
          )
        )}
      </div>

      <PlayerMusicModal open={musicOpen} onClose={() => setMusicOpen(false)} />
      <PlayerVideoModal open={videoOpen} onClose={() => setVideoOpen(false)} />
    </div>
  );
};

export default Social;

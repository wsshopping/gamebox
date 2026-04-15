import React, { useEffect, useState } from 'react';
import { agencyApi } from '../services/api/agency';

const SuperAdminGate: React.FC<{ enabled: boolean; children: React.ReactNode }> = ({ enabled, children }) => {
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [gateEnabled, setGateEnabled] = useState(false);
  const [passed, setPassed] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [code, setCode] = useState('');
  const [secret, setSecret] = useState('');
  const [otpauthUrl, setOtpauthUrl] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const showError = (message: string, alertUser = false) => {
    setSuccess('');
    setError(message);
    if (alertUser && typeof window !== 'undefined') {
      window.alert(message);
    }
  };

  const showSuccess = (message: string, alertUser = false) => {
    setError('');
    setSuccess(message);
    if (alertUser && typeof window !== 'undefined') {
      window.alert(message);
    }
  };

  const loadStatus = async () => {
    if (!enabled) return;
    setLoading(true);
    setError('');
    try {
      const status = await agencyApi.getSuper2FAStatus();
      setGateEnabled(Boolean(status.enabled));
      setPassed(Boolean(!status.enabled || status.verified));
      setCooldown(Number(status.cooldownSeconds || 0));
    } catch (err: any) {
      showError(err?.message || '获取谷歌验证状态失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!enabled) return;
    let active = true;
    const resetAndLoad = async () => {
      setPassed(false);
      setCode('');
      setSecret('');
      setOtpauthUrl('');
      setError('');
      setSuccess('');
      try {
        await agencyApi.resetSuper2FAEntry();
      } catch (err: any) {
        if (active) {
          showError(err?.message || '重置谷歌验证状态失败');
        }
      }
      if (active) {
        await loadStatus();
      }
    };
    resetAndLoad();
    return () => {
      active = false;
    };
  }, [enabled]);

  const handleSetup = async () => {
    setBusy(true);
    setError('');
    setSuccess('');
    try {
      const data = await agencyApi.setupSuper2FA();
      setSecret(data.secret || '');
      setOtpauthUrl(data.otpauthUrl || '');
      showSuccess('谷歌绑定密钥已生成', true);
    } catch (err: any) {
      showError(err?.message || '生成绑定信息失败', true);
    } finally {
      setBusy(false);
    }
  };

  const handleEnable = async () => {
    setBusy(true);
    setError('');
    setSuccess('');
    try {
      await agencyApi.enableSuper2FA(code.trim());
      setCode('');
      setSecret('');
      setOtpauthUrl('');
      showSuccess('谷歌认证开启成功', true);
      await loadStatus();
    } catch (err: any) {
      showError(err?.message || '启用谷歌验证失败', true);
      await loadStatus();
    } finally {
      setBusy(false);
    }
  };

  const handleVerify = async () => {
    setBusy(true);
    setError('');
    setSuccess('');
    try {
      await agencyApi.verifySuper2FA(code.trim());
      setCode('');
      showSuccess('谷歌认证校验成功', true);
      await loadStatus();
    } catch (err: any) {
      showError(err?.message || '谷歌验证失败', true);
      await loadStatus();
    } finally {
      setBusy(false);
    }
  };

  const handleDisable = async () => {
    setBusy(true);
    setError('');
    setSuccess('');
    try {
      await agencyApi.disableSuper2FA();
      setCode('');
      setSecret('');
      setOtpauthUrl('');
      showSuccess('谷歌认证关闭成功', true);
      await loadStatus();
    } catch (err: any) {
      showError(err?.message || '关闭谷歌验证失败', true);
    } finally {
      setBusy(false);
    }
  };

  const handleStartEnable = () => {
    setError('');
    setSuccess('');
    setCode('');
    setSecret('');
    setOtpauthUrl('');
    setPassed(false);
  };

  const submitCode = async () => {
    if (busy || code.length !== 6) return;
    if (gateEnabled) {
      await handleVerify();
      return;
    }
    await handleEnable();
  };

  if (!enabled) {
    return <>{children}</>;
  }

  if (passed) {
    return (
      <>
        <div className="px-5 pt-6">
          <div className="card-bg rounded-[20px] p-4 shadow-sm border border-theme flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>超管认证状态</div>
              <div className="text-xs text-slate-500 mt-1">
                {gateEnabled ? '已开启谷歌认证，下次进入默认需要先校验。' : '谷歌认证已关闭，下次进入无需校验。'}
              </div>
            </div>
            {gateEnabled ? (
              <button
                onClick={handleDisable}
                disabled={busy}
                className="px-4 py-2 rounded-xl border border-rose-300 text-rose-500 text-xs font-bold disabled:opacity-50"
              >
                {busy ? '关闭中...' : '关闭谷歌认证'}
              </button>
            ) : (
              <button
                onClick={handleStartEnable}
                disabled={busy}
                className="px-4 py-2 rounded-xl border border-emerald-300 text-emerald-500 text-xs font-bold disabled:opacity-50"
              >
                开启谷歌认证
              </button>
            )}
          </div>
        </div>
        {children}
      </>
    );
  }

  return (
    <div className="px-5 pt-6">
      <div className="card-bg rounded-[24px] p-6 shadow-sm border border-theme">
        <h3 className="text-base font-bold mb-2" style={{ color: 'var(--text-primary)' }}>超管中心安全校验</h3>
        <p className="text-sm text-slate-500 mb-4">
          {gateEnabled ? '请输入谷歌验证码后进入超管中心。' : '请先绑定谷歌验证器，再进入超管中心。'}
        </p>

        {loading && (
          <div className="text-sm text-slate-400 mb-3">正在加载校验状态...</div>
        )}

        {!loading && !gateEnabled && (
          <div className="space-y-3">
            <button
              onClick={handleSetup}
              disabled={busy}
              className="w-full py-2 rounded-xl bg-[var(--text-primary)] text-[var(--bg-primary)] text-sm font-bold disabled:opacity-50"
            >
              {busy ? '生成中...' : '生成谷歌绑定密钥'}
            </button>
            {secret && (
              <div className="rounded-xl border border-theme p-3 bg-[var(--bg-primary)]">
                <div className="text-xs text-slate-400 mb-1">密钥（Google Authenticator 手动输入）</div>
                <div className="text-sm font-mono break-all" style={{ color: 'var(--text-primary)' }}>{secret}</div>
                {otpauthUrl && (
                  <a
                    href={otpauthUrl}
                    className="mt-2 inline-block text-xs text-accent underline break-all"
                  >
                    打开 otpauth 链接
                  </a>
                )}
              </div>
            )}
          </div>
        )}

        {!loading && (
          <form
            className="space-y-3 mt-4"
            onSubmit={(e) => {
              e.preventDefault();
              submitCode();
            }}
          >
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="请输入6位谷歌验证码"
              className="w-full px-3 py-2 rounded-xl border border-theme bg-[var(--bg-primary)] text-sm"
            />
            <div className="pt-2">
              {!gateEnabled ? (
                <button
                  type="submit"
                  disabled={busy || code.length !== 6}
                  className="block w-full py-3 rounded-xl text-sm font-bold"
                  style={{
                    background: busy || code.length !== 6 ? '#94a3b8' : '#f59e0b',
                    color: '#111827',
                    border: '2px solid #111827',
                    minHeight: '48px'
                  }}
                >
                  {busy ? '提交中...' : '完成绑定并进入'}
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={busy || code.length !== 6}
                  className="block w-full py-3 rounded-xl text-sm font-bold"
                  style={{
                    background: busy || code.length !== 6 ? '#94a3b8' : '#f59e0b',
                    color: '#111827',
                    border: '2px solid #111827',
                    minHeight: '48px'
                  }}
                >
                  {busy ? '校验中...' : '校验并进入超管中心'}
                </button>
              )}
            </div>
          </form>
        )}

        {cooldown > 0 && (
          <div className="mt-3 text-xs text-amber-400">尝试过多，请稍后重试（约 {cooldown} 秒）。</div>
        )}
        {success && (
          <div className="mt-3 text-xs text-emerald-400">{success}</div>
        )}
        {error && (
          <div className="mt-3 text-xs text-rose-400">{error}</div>
        )}
      </div>
    </div>
  );
};

export default SuperAdminGate;

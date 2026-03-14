import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

type GuideTab = 'player' | 'agent';

const PLAYER_STEPS = [
  { title: '完成登录', desc: '输入手机号、密码和验证码后进入“我的”页面。' },
  { title: '先做安全设置', desc: '先修改密码，再完善头像和用户名。' },
  { title: '开始高频功能', desc: '先看消息，再体验聊天、交易、福利。' }
];

const AGENT_STEPS = [
  { title: '确认角色入口', desc: '登录后进入社交页，确认代理/老板/超管入口可见。' },
  { title: '走通一条核心流程', desc: '优先完成一次创建下级或订单查询。' },
  { title: '检查结算状态', desc: '确认收款地址、提现限制和待处理项。' }
];

const PLAYER_TASKS = [
  { title: '去我的页面完善资料', desc: '修改头像、用户名、密码', path: '/user', action: '打开我的' },
  { title: '查看消息中心', desc: '先看系统通知再做操作', path: '/social', action: '进入社交' },
  { title: '去聊天中心', desc: '加好友、加群、创建群组', path: '/chat/center', action: '打开聊天中心' },
  { title: '浏览市场交易', desc: '先看商品再下单/发布', path: '/trade', action: '打开交易' },
  { title: '完成今日福利', desc: '签到、盲盒、积分流水', path: '/screen-welfare', action: '打开福利' }
];

const AGENT_TASKS = [
  { title: '代理管理', desc: '创建下级、维护直属', path: '/social', action: '进入代理中心' },
  { title: '玩家与订单查询', desc: '按手机号/状态/日期快速过滤', path: '/social', action: '去查询' },
  { title: '结算中心', desc: '收款地址、提现申请、提现记录', path: '/social', action: '去结算中心' },
  { title: '审批与通知（超管）', desc: '处理审批并发布通知', path: '/social', action: '去超管中心' }
];

const PLAYER_FAQ = [
  { q: '注册失败', a: '先检查代理码和手机号，确认密码满足长度要求。' },
  { q: '登录失败', a: '刷新验证码后重试，确认手机号和密码没有输错。' },
  { q: '聊天异常', a: '先确认网络，再回到聊天列表重新进入会话。' },
  { q: '交易状态不更新', a: '先刷新订单详情页，再核对当前状态。' }
];

const AGENT_FAQ = [
  { q: '看不到代理中心', a: '先确认账号类型是否为代理/老板/超管。' },
  { q: '不能提现', a: '先检查是否在冷却期，或存在未完成提现申请。' },
  { q: '改绑代理码失败', a: '先确认新代理码有效且可用。' },
  { q: '超管中心进不去', a: '先完成谷歌验证码校验，冷却后再重试。' }
];

const PLAYER_SECTIONS = [
  {
    title: '你现在最该做的',
    points: [
      '先改密码，再去聊天和交易',
      '先看消息，再做关键操作',
      '碰到问题优先看“问题快查”'
    ]
  }
];

const AGENT_SECTIONS = [
  {
    title: '你现在最该做的',
    points: [
      '先走通一条业务流程，不要只看页面',
      '提现前先确认地址和限制条件',
      '超管先完成 2FA 再处理审批'
    ]
  }
];

const Guide: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const roleId = Number(user?.role?.id ?? user?.roleId ?? 0);
  const canViewAgentGuide = [1, 2, 3, 4, 5, 7].includes(roleId);

  const activeTab: GuideTab = useMemo(() => (canViewAgentGuide ? 'agent' : 'player'), [canViewAgentGuide]);
  const sections = activeTab === 'agent' ? AGENT_SECTIONS : PLAYER_SECTIONS;
  const firstSteps = activeTab === 'agent' ? AGENT_STEPS : PLAYER_STEPS;
  const tasks = activeTab === 'agent' ? AGENT_TASKS : PLAYER_TASKS;
  const faqs = activeTab === 'agent' ? AGENT_FAQ : PLAYER_FAQ;

  return (
    <div className="app-bg min-h-full pt-[calc(5rem+env(safe-area-inset-top))] pb-10 transition-colors duration-500">
      <div className="glass-bg fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md z-40 border-b border-theme pt-[calc(1rem+env(safe-area-inset-top))] pb-3">
        <div className="px-4 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="text-slate-400 hover:text-[var(--text-primary)] transition-colors p-1"
            aria-label="返回"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-lg font-black" style={{ color: 'var(--text-primary)' }}>使用说明</h1>
            <p className="text-[10px] text-slate-500 mt-0.5">登录后可随时在“我的”中再次打开</p>
          </div>
        </div>
      </div>

      <div className="px-5 pt-6">
        <div className="card-bg rounded-[20px] p-4 border border-theme">
          <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
            {canViewAgentGuide ? '代理说明' : '玩家说明'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            系统已按你的账号类型自动匹配内容。
          </p>
        </div>
      </div>

      <div className="px-5 mt-5 space-y-4">
        <div className="card-bg rounded-[20px] border border-theme p-4">
          <div className="text-[10px] uppercase tracking-[0.18em] text-amber-400 font-bold">First Day</div>
          <h2 className="text-sm font-black mt-1" style={{ color: 'var(--text-primary)' }}>
            {activeTab === 'agent' ? '首日三步：先跑通业务流程' : '首日三步：先上手再扩展'}
          </h2>
          <div className="mt-3 space-y-2">
            {firstSteps.map((item, index) => (
              <div key={item.title} className="bg-[var(--bg-primary)] border border-theme rounded-xl px-3 py-2">
                <div className="text-[11px] font-bold" style={{ color: 'var(--text-primary)' }}>
                  {index + 1}. {item.title}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card-bg rounded-[20px] border border-theme p-4">
          <div className="text-[10px] uppercase tracking-[0.18em] text-emerald-400 font-bold">Tasks</div>
          <h3 className="text-sm font-black mt-1 mb-3" style={{ color: 'var(--text-primary)' }}>高频任务卡</h3>
          <div className="space-y-3">
            {tasks.map((task) => (
              <div key={task.title} className="bg-[var(--bg-primary)] border border-theme rounded-xl p-3">
                <div className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{task.title}</div>
                <div className="text-[11px] text-slate-500 mt-1">{task.desc}</div>
                <button
                  onClick={() => navigate(task.path)}
                  className="mt-2 px-3 py-1.5 rounded-lg text-[11px] font-bold bg-accent-gradient text-black"
                >
                  {task.action}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="card-bg rounded-[20px] border border-theme p-4">
          <div className="text-[10px] uppercase tracking-[0.18em] text-rose-400 font-bold">Troubleshoot</div>
          <h3 className="text-sm font-black mt-1 mb-3" style={{ color: 'var(--text-primary)' }}>问题快查</h3>
          <div className="space-y-2">
            {faqs.map((item) => (
              <div key={item.q} className="bg-[var(--bg-primary)] border border-theme rounded-xl p-3">
                <div className="text-[11px] font-bold text-amber-400">{item.q}</div>
                <div className="text-[11px] text-slate-500 mt-1">{item.a}</div>
              </div>
            ))}
          </div>
        </div>

        {sections.map((section) => (
          <div key={section.title} className="card-bg rounded-[20px] border border-theme p-4">
            <h3 className="text-sm font-bold mb-3" style={{ color: 'var(--text-primary)' }}>{section.title}</h3>
            <div className="space-y-2">
              {section.points.map((point) => (
                <div key={point} className="text-xs text-slate-400 flex items-start gap-2">
                  <span className="text-amber-400 leading-5">•</span>
                  <span className="leading-5">{point}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Guide;

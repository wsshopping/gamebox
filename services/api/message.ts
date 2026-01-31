import { delay, DELAY } from './core';
import { request } from '../http';
import { GROUPS } from '../mockData';
import { Message, SystemNotification, Interaction, GroupRecommendation } from '../../types';

type PageResult<T> = {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
};

type UnreadCountResponse = {
  system: number;
  interactions: number;
};

export const messageApi = {
  getList: async (): Promise<Message[]> => {
    const params = new URLSearchParams();
    params.set('page', '1');
    params.set('pageSize', '5');
    const [systemData, interactionData] = await Promise.all([
      request<PageResult<SystemNotification>>(`/portal/message/system?${params.toString()}`),
      request<PageResult<Interaction>>(`/portal/message/interactions?${params.toString()}`)
    ]);

    const systemMessages: Message[] = (systemData.list || []).map(item => ({
      id: `system-${item.id}`,
      title: item.title,
      content: item.content,
      time: item.time,
      type: 'system',
      read: item.read
    }));

    const interactionMessages: Message[] = (interactionData.list || []).map(item => ({
      id: `interaction-${item.id}`,
      title: item.userName,
      content: buildInteractionContent(item),
      time: item.time,
      type: 'activity',
      read: item.read,
      avatar: item.userAvatar
    }));

    return [...systemMessages, ...interactionMessages].sort((a, b) => parseMessageTime(b.time) - parseMessageTime(a.time));
  },
  getSystemNotifications: async (
    status: 'all' | 'unread' = 'all',
    page = 1,
    pageSize = 10
  ): Promise<SystemNotification[]> => {
    const params = new URLSearchParams();
    params.set('status', status);
    params.set('page', String(page));
    params.set('pageSize', String(pageSize));
    const data = await request<PageResult<SystemNotification>>(`/portal/message/system?${params.toString()}`);
    return data.list || [];
  },
  getInteractions: async (
    status: 'all' | 'unread' = 'all',
    page = 1,
    pageSize = 10
  ): Promise<Interaction[]> => {
    const params = new URLSearchParams();
    params.set('status', status);
    params.set('page', String(page));
    params.set('pageSize', String(pageSize));
    const data = await request<PageResult<Interaction>>(`/portal/message/interactions?${params.toString()}`);
    return data.list || [];
  },
  markSystemRead: async (ids: number[]): Promise<boolean> => {
    await request('/portal/message/system/read', {
      method: 'POST',
      body: JSON.stringify({ ids })
    });
    return true;
  },
  markSystemReadAll: async (): Promise<boolean> => {
    await request('/portal/message/system/read-all', {
      method: 'POST'
    });
    return true;
  },
  markInteractionRead: async (ids: number[]): Promise<boolean> => {
    await request('/portal/message/interactions/read', {
      method: 'POST',
      body: JSON.stringify({ ids })
    });
    return true;
  },
  getUnreadCount: async (): Promise<UnreadCountResponse> => {
    return request<UnreadCountResponse>('/portal/message/unread-count');
  },
  getRecommendedGroups: async (category?: string): Promise<GroupRecommendation[]> => {
    await delay(DELAY);
    if (category && category !== '全部') {
      return GROUPS.filter(g => g.category.includes(category) || g.tags.includes(category));
    }
    return [...GROUPS];
  },
  getGroupDetail: async (id: string): Promise<GroupRecommendation | undefined> => {
    await delay(DELAY);
    return GROUPS.find(g => g.id === id);
  },
  getChatHistory: async (chatId: string): Promise<any[]> => {
    await delay(DELAY);
    // Mock chat history based on ID
    
    if (chatId === 'g1') {
        return [
          { id: 1, text: '欢迎大家加入 GameBox 官方交流群！请查看群公告。', sender: 'other', senderName: '管理员', time: '09:00', type: 'text' },
          { id: 2, text: '这里可以讨论哪些游戏？', sender: 'other', senderName: '萌新小白', time: '09:12', type: 'text' },
          { id: 3, text: '所有已上架的游戏都可以讨论哦。', sender: 'other', senderName: '热心群友', time: '09:15', type: 'text' },
          { id: 4, text: '最近那个赛博飞车好难玩啊，有人带带吗？', sender: 'other', senderName: '老司机', time: '09:30', type: 'text' },
          { id: 5, text: '我可以，晚上8点上线。', sender: 'me', time: '09:35', type: 'text' },
          { id: 6, text: '加我一个 ID: 10086', sender: 'other', senderName: '暴走萝莉', time: '09:40', type: 'text' },
          { id: 7, text: '好的，晚上见。', sender: 'me', time: '09:42', type: 'text' },
        ];
    }

    const isGroup = chatId.startsWith('g') || chatId.startsWith('ng');
    if (isGroup) {
      return [
        { id: 1, text: '欢迎大家加入本群！', sender: 'other', senderName: '管理员', time: '10:00', type: 'text' },
        { id: 2, text: '请问什么时候开新区？', sender: 'other', senderName: '路人甲', time: '10:05', type: 'text' },
        { id: 3, text: '大概下周二左右。', sender: 'other', senderName: '客服小美', time: '10:06', type: 'text' },
        { id: 4, text: '收到，谢谢！', sender: 'me', time: '10:08', type: 'text' },
      ];
    } else {
      return [
        { id: 1, text: '你好，请问那个80级的账号还在吗？', sender: 'other', time: '10:00', type: 'text' },
        { id: 2, text: '我想买，可以便宜点吗？', sender: 'other', time: '10:01', type: 'text' },
        { id: 3, text: '你好，还在的。', sender: 'me', time: '10:05', type: 'text' },
        { id: 4, text: '价格已经是最低了哦，全套史诗装备很难得的。', sender: 'me', time: '10:06', type: 'text' },
        { id: 5, text: '好吧，那我再考虑一下。', sender: 'other', time: '10:10', type: 'text' },
      ];
    }
  },
  joinGroup: async (groupId: string, message?: string): Promise<boolean> => {
    await delay(500);
    console.log(`Applying to join group ${groupId} with message: ${message}`);
    return true;
  }
};

const buildInteractionContent = (item: Interaction) => {
  switch (item.type) {
    case 'like':
      return `赞了你的${item.targetContent || '内容'}`;
    case 'comment':
      return `评论: "${item.targetContent || ''}"`;
    case 'follow':
      return '关注了你';
    case 'mention':
      return '在评论中提到了你';
    default:
      return item.targetContent || '';
  }
};

const parseMessageTime = (value: string) => {
  if (!value) return 0;
  const normalized = value.replace(' ', 'T');
  const date = new Date(normalized);
  const ts = date.getTime();
  return Number.isNaN(ts) ? 0 : ts;
};

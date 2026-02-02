
import { client, delay, DELAY, USE_MOCK } from './core';
import { MESSAGES, SYSTEM_NOTIFICATIONS, INTERACTIONS } from '../mockData';
import { Message, SystemNotification, Interaction } from '../../types';

// Helper to parse fuzzy time strings for sorting mock data
const parseMockTime = (timeStr: string): number => {
  const now = new Date();
  const todayBase = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  
  if (timeStr === '刚刚') return now.getTime() + 1000;
  if (timeStr.includes('分钟前')) return now.getTime() - parseInt(timeStr) * 60 * 1000;
  if (timeStr.includes('小时前')) return now.getTime() - parseInt(timeStr) * 60 * 60 * 1000;
  
  if (timeStr.includes(':')) { 
    const [h, m] = timeStr.split(':').map(Number);
    return todayBase + h * 3600000 + m * 60000;
  }
  
  if (timeStr === '昨天') return todayBase - 86400000;
  if (timeStr === '前天') return todayBase - 86400000 * 2;
  if (timeStr.includes('天前')) return todayBase - parseInt(timeStr) * 86400000;
  if (timeStr.includes('周')) return todayBase - 86400000 * 3;
  
  return 0;
};

export const messageApi = {
  // --- Dashboard / Preview Logic ---

  // Get mixed preview for MessageList dashboard (System + Interaction + Chats), limit 3
  getMixedPreview: async (): Promise<Message[]> => {
    if (USE_MOCK) {
      await delay(DELAY);

      const sysMsg: Message = {
        id: SYSTEM_NOTIFICATIONS[0].id,
        title: SYSTEM_NOTIFICATIONS[0].title,
        content: SYSTEM_NOTIFICATIONS[0].content,
        time: '刚刚',
        type: 'system',
        read: false
      };

      const interactMsg: Message = {
        id: INTERACTIONS[0].id,
        title: INTERACTIONS[0].userName,
        content: INTERACTIONS[0].type === 'like' ? '赞了你的文章' : '在评论中提到了你',
        time: '5分钟前',
        type: 'activity',
        read: false,
        avatar: INTERACTIONS[0].userAvatar
      };

      const privateMsg: Message = {
          id: 'u2',
          title: '暴走萝莉',
          content: '今晚来炸街吗？',
          time: '10:20',
          type: 'social',
          read: false,
          avatar: 'https://picsum.photos/100/100?random=u2'
      };

      const groupMsg = MESSAGES.find(m => m.type === 'group');

      let mixedList = [sysMsg, privateMsg, interactMsg];
      if (groupMsg) mixedList.push(groupMsg);

      mixedList.sort((a, b) => parseMockTime(b.time) - parseMockTime(a.time));

      return mixedList.slice(0, 3);
    }
    return client.get<Message[]>('/messages/preview');
  },

  getSystemNotifications: async (): Promise<SystemNotification[]> => {
    if (USE_MOCK) {
        await delay(DELAY);
        return [...SYSTEM_NOTIFICATIONS];
    }
    return client.get<SystemNotification[]>('/messages/system');
  },

  getInteractions: async (): Promise<Interaction[]> => {
    if (USE_MOCK) {
        await delay(DELAY);
        return [...INTERACTIONS];
    }
    return client.get<Interaction[]>('/messages/interactions');
  },

  // --- Chat & Session Logic ---

  // Get recent chat list (Session List: Groups + Private DMs)
  getRecentChats: async (): Promise<Message[]> => {
    if (USE_MOCK) {
      await delay(DELAY);
      
      const privateChats: Message[] = [
          {
              id: 'u1',
              title: '快乐风男',
              content: '哈撒给！',
              time: '12:30',
              type: 'social',
              read: true,
              avatar: 'https://picsum.photos/100/100?random=u1'
          },
          {
              id: 'u2',
              title: '暴走萝莉',
              content: '今晚来炸街吗？',
              time: '昨天',
              type: 'social',
              read: false,
              avatar: 'https://picsum.photos/100/100?random=u2'
          },
          {
              id: 'u3',
              title: 'Faker001',
              content: '来solo一把？',
              time: '周一',
              type: 'social',
              read: true,
              avatar: 'https://picsum.photos/100/100?random=u3'
          }
      ];
      
      const groupChats = MESSAGES.filter(m => m.type === 'group');
      const allChats = [...groupChats, ...privateChats];
      
      return allChats.sort((a, b) => parseMockTime(b.time) - parseMockTime(a.time));
    }
    return client.get<Message[]>('/chats/recent');
  },

  // Get specific chat history
  getChatHistory: async (chatId: string): Promise<any[]> => {
    if (USE_MOCK) {
        await delay(DELAY);
        
        // 1. Specific Group Mock
        if (chatId === 'g1') {
            return [
            { id: 1, text: '欢迎大家加入 GameBox 官方交流群！请查看群公告。', sender: 'other', senderName: '管理员', senderId: 'u_admin', time: '09:00', type: 'text' },
            { id: 2, text: '这里可以讨论哪些游戏？', sender: 'other', senderName: '萌新小白', senderId: 'u_newbie', time: '09:12', type: 'text' },
            { id: 3, text: '所有已上架的游戏都可以讨论哦。', sender: 'other', senderName: '热心群友', senderId: 'u_helper', time: '09:15', type: 'text' },
            { id: 4, text: '最近那个赛博飞车好难玩啊，有人带带吗？', sender: 'other', senderName: '老司机', senderId: 'u_driver', time: '09:30', type: 'text' },
            { id: 5, text: '我可以，晚上8点上线。', sender: 'me', time: '09:35', type: 'text' },
            { id: 6, text: '加我一个 ID: 10086', sender: 'other', senderName: '暴走萝莉', senderId: 'u2', time: '09:40', type: 'text' },
            { id: 7, text: '好的，晚上见。', sender: 'me', time: '09:42', type: 'text' },
            ];
        }

        const isGroup = chatId.startsWith('g') || chatId.startsWith('ng');
        
        if (isGroup) {
        return [
            { id: 1, text: '欢迎大家加入本群！', sender: 'other', senderName: '管理员', senderId: 'u_admin', time: '10:00', type: 'text' },
            { id: 2, text: '请问什么时候开新区？', sender: 'other', senderName: '路人甲', senderId: 'u_noman', time: '10:05', type: 'text' },
            { id: 3, text: '大概下周二左右。', sender: 'other', senderName: '客服小美', senderId: 'u_cs', time: '10:06', type: 'text' },
            { id: 4, text: '收到，谢谢！', sender: 'me', time: '10:08', type: 'text' },
        ];
        } 
        
        switch(chatId) {
            case 'u1': return [
            { id: 101, text: '兄弟，疾风剑豪怎么出装伤害最高？', sender: 'other', time: '昨天 14:20', type: 'text' },
            { id: 102, text: '先出攻速鞋，然后无尽电刀，后面看情况转肉或者复活甲。', sender: 'me', time: '昨天 14:25', type: 'text' },
            { id: 103, text: 'E往无前就完事了！', sender: 'other', time: '昨天 14:26', type: 'text' },
            { id: 104, text: '哈撒给！', sender: 'me', time: '昨天 14:27', type: 'text' },
            { id: 105, text: '今晚一起开黑不？我亚索贼溜。', sender: 'other', time: '09:30', type: 'text' },
            ];
            case 'u2': return [
            { id: 201, text: '看到你在排行榜上了，太强了吧！', sender: 'other', time: '前天', type: 'text' },
            { id: 202, text: '运气好而已哈哈。', sender: 'me', time: '前天', type: 'text' },
            { id: 203, text: '有没有兴趣加入我们战队？缺个主力输出。', sender: 'other', time: '昨天 20:00', type: 'text' },
            { id: 204, text: '我考虑一下哈，最近比较忙。', sender: 'me', time: '昨天 21:30', type: 'text' },
            { id: 205, text: '好的，随时等你消息！我们福利很好的。', sender: 'other', time: '08:15', type: 'text' },
            ];
            case 't1': return [
            { id: 401, text: '你好，请问那个80级的账号还在吗？', sender: 'me', time: '10:00', type: 'text' },
            { id: 402, text: '还在的，老板。账号带全套史诗装备。', sender: 'other', time: '10:05', type: 'text' },
            { id: 403, text: '诚心要，价格可以少点吗？120出不出？', sender: 'me', time: '10:06', type: 'text' },
            { id: 404, text: '120太低了，这装备我花了很多心血。最低140。', sender: 'other', time: '10:10', type: 'text' },
            { id: 405, text: '行吧，那我拍了。', sender: 'me', time: '10:12', type: 'text' },
            ];
            default: return [
            { id: 1, text: '你好', sender: 'other', time: '12:00', type: 'text' },
            { id: 2, text: '在吗？', sender: 'other', time: '12:01', type: 'text' },
            { id: 3, text: '刚才那局游戏配合得不错！', sender: 'other', time: '12:02', type: 'text' },
            { id: 4, text: '哈哈，是的，下次再一起。', sender: 'me', time: '12:05', type: 'text' },
            ];
        }
    }
    return client.get<any[]>(`/chats/${chatId}/messages`);
  },

  // Send Message (Text, Image, etc.)
  sendMessage: async (chatId: string, content: any, type: 'text' | 'image' = 'text'): Promise<boolean> => {
      if (USE_MOCK) {
          // No delay to make UI feel responsive, or small delay
          return true;
      }
      return client.post<boolean>(`/chats/${chatId}/messages`, { type, content });
  }
};

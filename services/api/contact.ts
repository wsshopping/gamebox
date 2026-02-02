
import { client, delay, DELAY, USE_MOCK } from './core';

export interface ContactItem {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'busy' | 'away' | 'offline';
  group: string; // A, B, C... for sorting
  bio?: string;
}

export const contactApi = {
  // Get Friend List
  getList: async (): Promise<ContactItem[]> => {
    if (USE_MOCK) {
      await delay(DELAY);
      return [
        { id: '101', name: '阿狸', avatar: 'https://picsum.photos/50/50?random=101', status: 'online', group: 'A', bio: '想和我玩吗？' },
        { id: '102', name: '阿木木', avatar: 'https://picsum.photos/50/50?random=102', status: 'offline', group: 'A', bio: '我还以为你从来都不会选我呢...' },
        { id: '103', name: '盖伦', avatar: 'https://picsum.photos/50/50?random=103', status: 'busy', group: 'G', bio: '人在塔在！' },
        { id: '104', name: '格雷福斯', avatar: 'https://picsum.photos/50/50?random=104', status: 'away', group: 'G', bio: '瞎了你的狗眼！' },
        { id: '105', name: '卡特琳娜', avatar: 'https://picsum.photos/50/50?random=105', status: 'online', group: 'K', bio: '暴力可以解决一切。' },
        { id: '106', name: '卡依莎', avatar: 'https://picsum.photos/50/50?random=106', status: 'online', group: 'K', bio: '你就是我的猎物。' },
        { id: 'u1', name: '快乐风男', avatar: 'https://picsum.photos/50/50?random=u1', status: 'online', group: 'K', bio: '哈撒给' },
      ];
    }
    return client.get<ContactItem[]>('/contacts');
  },

  // Get New Friend Requests count or list
  getNewRequestCount: async (): Promise<number> => {
      if (USE_MOCK) {
          await delay(DELAY);
          return 2;
      }
      return client.get<{count: number}>('/contacts/requests/count').then(res => res.count);
  },

  // Search User to Add
  searchUser: async (keyword: string): Promise<any[]> => {
      if (USE_MOCK) {
          await delay(500);
          return [
              { id: '999', name: `User_${keyword}`, avatar: 'https://picsum.photos/50/50?random=999' }
          ];
      }
      return client.get<any[]>(`/users/search?q=${encodeURIComponent(keyword)}`);
  },

  // Add Friend Request
  add: async (userId: string, message?: string): Promise<boolean> => {
      if (USE_MOCK) {
          await delay(500);
          console.log(`API: Sent friend request to ${userId} saying: ${message}`);
          return true;
      }
      return client.post<boolean>(`/contacts/${userId}/add`, { message });
  }
};

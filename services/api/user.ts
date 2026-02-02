
import { client, delay, DELAY, USE_MOCK } from './core';

const MOCK_USERS = [
  { id: 'u1', username: '快乐风男', avatar: 'https://picsum.photos/100/100?random=u1', bio: '面对疾风吧！', level: 12, tags: ['LOL', '中单'], following: 12, followers: 340, games: ['英雄联盟', '原神'] },
  { id: 'u2', username: '暴走萝莉', avatar: 'https://picsum.photos/100/100?random=u2', bio: '规则就是用来打破的！', level: 25, tags: ['射手', '狂躁'], following: 5, followers: 890, games: ['英雄联盟', '瓦洛兰特'] },
  { id: 'u3', username: 'Faker001', avatar: 'https://picsum.photos/100/100?random=u3', bio: '大魔王在此。', level: 99, tags: ['职业', 'T1'], following: 0, followers: 10000, games: ['英雄联盟'] },
];

export const userApi = {
  // Get Public Profile of a user
  getById: async (id: string) => {
    if (USE_MOCK) {
        await delay(DELAY);
        const user = MOCK_USERS.find(u => u.id === id);
        return user || {
        id: id,
        username: `User_${id.slice(0,4)}`,
        avatar: `https://picsum.photos/100/100?random=${id}`,
        bio: '这个人很懒，什么都没写。',
        level: 1,
        tags: ['萌新'],
        following: 0,
        followers: 0,
        games: []
        };
    }
    return client.get(`/users/${id}`);
  },

  // Update My Online Status
  updateStatus: async (status: 'online' | 'busy' | 'away' | 'offline'): Promise<boolean> => {
      if (USE_MOCK) {
          await delay(300);
          console.log('API: Status updated to', status);
          return true;
      }
      return client.put<boolean>('/user/status', { status });
  },

  // Update My Profile Info
  updateProfile: async (data: { nickname?: string; bio?: string; avatar?: string }): Promise<boolean> => {
      if (USE_MOCK) {
          await delay(800);
          console.log('API: Profile updated', data);
          return true;
      }
      return client.put<boolean>('/user/profile', data);
  }
};

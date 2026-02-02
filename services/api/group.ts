
import { client, delay, DELAY, USE_MOCK } from './core';
import { GROUPS } from '../mockData';
import { GroupRecommendation } from '../../types';

export const groupApi = {
  // 1. Get Recommended Groups (Discovery)
  getRecommended: async (category?: string): Promise<GroupRecommendation[]> => {
    if (USE_MOCK) {
      await delay(DELAY);
      if (category && category !== '全部') {
        return GROUPS.filter(g => g.category.includes(category) || g.tags.includes(category));
      }
      return [...GROUPS];
    }
    const query = category && category !== '全部' ? `?category=${encodeURIComponent(category)}` : '';
    return client.get<GroupRecommendation[]>(`/groups/recommend${query}`);
  },

  // 2. Get Group Details
  getDetail: async (id: string): Promise<GroupRecommendation | undefined> => {
    if (USE_MOCK) {
      await delay(DELAY);
      return GROUPS.find(g => g.id === id);
    }
    return client.get<GroupRecommendation>(`/groups/${id}`);
  },

  // 3. Create Group
  create: async (data: { name: string; category: string; desc: string; tags: string[] }): Promise<boolean> => {
    if (USE_MOCK) {
      await delay(1500);
      console.log('API Call: Creating group with data:', data);
      return true;
    }
    return client.post<boolean>('/groups', data);
  },

  // 4. Join Group
  join: async (groupId: string, message?: string): Promise<boolean> => {
    if (USE_MOCK) {
      await delay(500);
      console.log(`API Call: Applying to join group ${groupId} with message: ${message}`);
      return true; 
    }
    return client.post<boolean>(`/groups/${groupId}/join`, { message });
  },
  
  // 5. Get Group Members (Placeholder for future)
  getMembers: async (groupId: string): Promise<any[]> => {
      if (USE_MOCK) {
          await delay(DELAY);
          return Array(10).fill(null).map((_, i) => ({
              id: `member_${i}`,
              name: `Member ${i}`,
              avatar: `https://picsum.photos/50/50?random=${i}`
          }));
      }
      return client.get<any[]>(`/groups/${groupId}/members`);
  }
};

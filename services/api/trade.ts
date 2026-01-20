import { delay, DELAY } from './core';
import { TRADE_ITEMS } from '../mockData';
import { TradeItem } from '../../types';

export const tradeApi = {
  getItems: async (category?: string): Promise<TradeItem[]> => {
    await delay(DELAY);
    // Simulate category filter
    if (category && category !== '全部') {
      const typeMap: Record<string, string> = { 
        '账号': 'Account', '道具': 'Item', '游戏币': 'Currency' 
      };
      const targetType = typeMap[category];
      return targetType ? TRADE_ITEMS.filter(i => i.type === targetType) : TRADE_ITEMS;
    }
    return [...TRADE_ITEMS];
  },
  publishItem: async (data: any): Promise<boolean> => {
    await delay(1000);
    console.log('Mock API: Item published', data);
    return true;
  }
};

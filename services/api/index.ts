import { delay, DELAY } from './core';
import { gameApi } from './game';
import { tradeApi } from './trade';
import { communityApi } from './community';
import { welfareApi } from './welfare';
import { messageApi } from './message';
import { agencyApi } from './agency';
import { GAMES, TRADE_ITEMS } from '../mockData';

export const api = {
  game: gameApi,
  trade: tradeApi,
  community: communityApi,
  welfare: welfareApi,
  message: messageApi,
  agency: agencyApi,
  
  // Search is cross-cutting, keeping it here or move to search.ts
  search: {
    query: async (term: string): Promise<any> => {
        await delay(800);
        return {
            games: GAMES.filter(g => g.title.includes(term)),
            items: TRADE_ITEMS.filter(t => t.title.includes(term))
        }
    }
  }
};

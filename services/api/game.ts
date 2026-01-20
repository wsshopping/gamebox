
import { delay, DELAY } from './core';
import { GAMES } from '../mockData';
import { Game } from '../../types';

export const gameApi = {
  getList: async (filter?: string): Promise<Game[]> => {
    await delay(DELAY);
    if (!GAMES) return [];
    if (filter === 'new') return [...GAMES].reverse();
    if (filter === 'reserve') return GAMES.slice(2, 5);
    return [...GAMES];
  },
  getById: async (id: string): Promise<Game | undefined> => {
    await delay(DELAY);
    if (!GAMES) return undefined;
    return GAMES.find(g => g.id === id);
  },
  getHot: async (): Promise<Game[]> => {
    await delay(DELAY);
    if (!GAMES) return [];
    return GAMES.slice(0, 3);
  },
  getRankings: async (type: 'hot' | 'new' | 'soaring'): Promise<Game[]> => {
    await delay(DELAY);
    if (!GAMES) return [];
    const sorted = [...GAMES];
    
    if (type === 'new') {
        // Sort by ID reverse (mocking newness)
        return sorted.sort((a, b) => {
            if (a.id < b.id) return 1;
            if (a.id > b.id) return -1;
            return 0;
        });
    }
    if (type === 'soaring') {
        // Shift mock
        if (sorted.length > 0) {
            const first = sorted.shift();
            if (first) sorted.push(first);
        }
        return sorted;
    }
    // hot: sort by rating descending
    return sorted.sort((a, b) => b.rating - a.rating);
  }
};

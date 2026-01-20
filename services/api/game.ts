
import { delay, DELAY } from './core';
import { GAMES } from '../mockData';
import { Game } from '../../types';

export const gameApi = {
  getList: async (filter?: string): Promise<Game[]> => {
    await delay(DELAY);
    // Simulate filtering on backend
    if (filter === 'new') return [...GAMES].reverse();
    if (filter === 'reserve') return GAMES.slice(2, 5);
    return [...GAMES];
  },
  getById: async (id: string): Promise<Game | undefined> => {
    await delay(DELAY);
    return GAMES.find(g => g.id === id);
  },
  getHot: async (): Promise<Game[]> => {
    await delay(DELAY);
    return GAMES.slice(0, 3);
  },
  getRankings: async (type: 'hot' | 'new' | 'soaring'): Promise<Game[]> => {
    await delay(DELAY);
    // Shuffle or sort GAMES based on type mock
    const sorted = [...GAMES];
    if (type === 'new') {
        // Mock: just reverse for variety
        return sorted.sort((a, b) => (b.id > a.id ? 1 : -1)); 
    }
    if (type === 'soaring') {
        // Mock: shift array
        const first = sorted.shift();
        if (first) sorted.push(first);
        return sorted;
    }
    // hot
    return sorted.sort((a, b) => b.rating - a.rating);
  }
};

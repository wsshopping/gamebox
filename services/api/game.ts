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
  }
};

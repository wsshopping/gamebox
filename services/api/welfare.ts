import { delay, DELAY } from './core';
import { TASKS } from '../mockData';
import { Task } from '../../types';

export const welfareApi = {
  getTasks: async (): Promise<Task[]> => {
    await delay(DELAY);
    return [...TASKS];
  },
  claimTask: async (taskId: string): Promise<boolean> => {
    await delay(800);
    return true;
  },
  drawBlindBox: async (): Promise<string> => {
    await delay(2000); // Longer delay for suspense
    const prizes = ['500 积分', '限定皮肤', '10 钻石', '经验加成卡 (1h)', '神秘碎片'];
    return prizes[Math.floor(Math.random() * prizes.length)];
  }
};

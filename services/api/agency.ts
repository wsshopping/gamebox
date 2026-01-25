
import { delay, DELAY } from './core';
import { request } from '../http';

// Mock Data for Agency
const MOCK_AGENTS = [
  { id: 1, account: '16666666633', role: '总代', inviteCode: 'QPHS', upline: '18812567888', status: '正常', time: '2026-01-20 17:50' },
  { id: 2, account: '13636363636', role: '总推', inviteCode: 'EMGP', upline: '13999999438', status: '正常', time: '2026-01-20 17:31' },
  { id: 3, account: '15347705566', role: '总代', inviteCode: '9TDD', upline: '18812567888', status: '正常', time: '2026-01-20 17:03' },
];

const MOCK_BOSSES = [
  { id: 1, account: '13777776662', nickname: 'Boss_Wang', status: '正常', game: '天龙八部怀旧版', time: '17:54' },
];

const MOCK_PLAYERS = [
  { id: 1, account: '13636363636', inviteCode: 'GNN7BE73', recharge: '648.00', time: '01-20' },
  { id: 2, account: '13000000009', inviteCode: 'GNN7BE73', recharge: '30.00', time: '01-13' },
  { id: 3, account: '19988998899', inviteCode: 'GNN7BE73', recharge: '0.00', time: '01-11' },
];

// Updated to match the screenshot numbers
const MOCK_STATS = {
  role: '超级管理员',
  code: 'GNN7BE73',
  level: '总推',
  creatable: '总推', // Added based on screenshot
  registerCount: 30, // "总注册数"
  
  // Finance Data
  totalFlow: '5060.00',
  totalProfit: '101.20',
  withdrawn: '0.00',
  withdrawable: '81.20'
};

export const agencyApi = {
  getStats: async () => {
    await delay(DELAY);
    return MOCK_STATS;
  },
  getAgents: async (filter?: any) => {
    await delay(DELAY);
    return MOCK_AGENTS;
  },
  createAgent: async (data: any) => {
    return request('/portal/agency/agents', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  getBosses: async () => {
    await delay(DELAY);
    return MOCK_BOSSES;
  },
  getPlayers: async (query?: string) => {
    await delay(DELAY);
    return MOCK_PLAYERS;
  }
};

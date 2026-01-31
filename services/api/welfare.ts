import { request } from '../http';
import {
  WelfareDrawResponse,
  WelfareLedgerResponse,
  WelfareOverview,
  WelfareSignInResponse
} from '../../types';

const generateRequestId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `req_${Date.now()}_${Math.random().toString(16).slice(2)}`;
};

export const welfareApi = {
  getOverview: async (): Promise<WelfareOverview> => {
    return request('/portal/welfare/overview');
  },
  signIn: async (): Promise<WelfareSignInResponse> => {
    return request('/portal/welfare/signin', {
      method: 'POST',
      body: JSON.stringify({ requestId: generateRequestId() })
    });
  },
  drawBlindBox: async (): Promise<WelfareDrawResponse> => {
    return request('/portal/welfare/blindbox/draw', {
      method: 'POST',
      body: JSON.stringify({ requestId: generateRequestId() })
    });
  },
  getLedger: async (cursor?: number, limit = 20): Promise<WelfareLedgerResponse> => {
    const query = new URLSearchParams();
    query.set('limit', String(limit));
    if (cursor) {
      query.set('cursor', String(cursor));
    }
    return request(`/portal/welfare/ledger?${query.toString()}`);
  }
};

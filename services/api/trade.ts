import { request } from '../http';
import {
  TradeListingDetailResponse,
  TradeListingListResponse,
  TradeOrderDetailResponse,
  TradeOrderListResponse
} from '../../types';

const generateRequestId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `req_${Date.now()}_${Math.random().toString(16).slice(2)}`;
};

export const tradeApi = {
  getListings: async (category = '', page = 1, pageSize = 20): Promise<TradeListingListResponse> => {
    const query = new URLSearchParams();
    query.set('page', String(page));
    query.set('pageSize', String(pageSize));
    if (category) {
      query.set('category', category);
    }
    return request(`/portal/trade/listings?${query.toString()}`);
  },
  getMyListings: async (status = '', page = 1, pageSize = 20): Promise<TradeListingListResponse> => {
    const query = new URLSearchParams();
    query.set('page', String(page));
    query.set('pageSize', String(pageSize));
    if (status) {
      query.set('status', status);
    }
    return request(`/portal/trade/listings/mine?${query.toString()}`);
  },
  getListingDetail: async (id: number): Promise<TradeListingDetailResponse> => {
    return request(`/portal/trade/listings/${id}`);
  },
  createListing: async (payload: {
    title: string;
    description: string;
    category: string;
    pricePoints: number;
    stock: number;
    images: string[];
  }): Promise<{ id: number }> => {
    return request('/portal/trade/listings', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },
  updateListing: async (id: number, payload: {
    title: string;
    description: string;
    category: string;
    pricePoints: number;
    stock: number;
    images: string[];
    status?: string;
  }): Promise<{ id: number }> => {
    return request(`/portal/trade/listings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  },
  deleteListing: async (id: number): Promise<void> => {
    await request(`/portal/trade/listings/${id}`, { method: 'DELETE' });
  },
  createOrder: async (listingId: number): Promise<TradeOrderDetailResponse> => {
    return request('/portal/trade/orders', {
      method: 'POST',
      body: JSON.stringify({ listingId, requestId: generateRequestId() })
    });
  },
  listOrders: async (role: 'buyer' | 'seller', status = '', page = 1, pageSize = 20): Promise<TradeOrderListResponse> => {
    const query = new URLSearchParams();
    query.set('page', String(page));
    query.set('pageSize', String(pageSize));
    query.set('role', role);
    if (status) {
      query.set('status', status);
    }
    return request(`/portal/trade/orders?${query.toString()}`);
  },
  getOrderDetail: async (id: number): Promise<TradeOrderDetailResponse> => {
    return request(`/portal/trade/orders/${id}`);
  },
  deliverOrder: async (id: number, deliveryText: string): Promise<TradeOrderDetailResponse> => {
    return request(`/portal/trade/orders/${id}/deliver`, {
      method: 'POST',
      body: JSON.stringify({ deliveryText })
    });
  },
  confirmOrder: async (id: number): Promise<TradeOrderDetailResponse> => {
    return request(`/portal/trade/orders/${id}/confirm`, { method: 'POST' });
  },
  cancelOrder: async (id: number): Promise<TradeOrderDetailResponse> => {
    return request(`/portal/trade/orders/${id}/cancel`, { method: 'POST' });
  },
  openDispute: async (id: number, reason: string): Promise<TradeOrderDetailResponse> => {
    return request(`/portal/trade/orders/${id}/dispute`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
  },
  uploadImage: async (file: File): Promise<{ url: string }> => {
    const form = new FormData();
    form.append('file', file);
    return request('/portal/trade/upload', {
      method: 'POST',
      body: form
    });
  }
};

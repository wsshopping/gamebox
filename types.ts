
export interface Game {
  id: string;
  title: string;
  category: string;
  icon: string;
  rating: number;
  downloads: string;
  tags: string[];
  description?: string; // Short summary
  intro?: string; // Detailed introduction
  images?: string[]; // Screenshots
  banner?: string; // Hero banner image
  downloadUrl?: string;
  size?: string;
  version?: string;
  developer?: string;
}

export interface TradeListing {
  id: number;
  title: string;
  description: string;
  category: string;
  pricePoints: number;
  stock: number;
  soldCount: number;
  status: string;
  sellerId: number;
  sellerName: string;
  sellerAvatar: string;
  coverImage: string;
  images: string[];
  createdAt: string;
}

export interface TradeListingListResponse {
  items: TradeListing[];
  total: number;
}

export interface TradeListingDetailResponse {
  listing: TradeListing;
}

export interface TradeOrder {
  id: number;
  listingId: number;
  listingTitle: string;
  listingImage: string;
  category: string;
  pricePoints: number;
  status: string;
  buyerId: number;
  buyerName: string;
  sellerId: number;
  sellerName: string;
  deliveryText?: string;
  deliveryAt?: string;
  confirmAt?: string;
  cancelAt?: string;
  autoCancelAt?: string;
  autoConfirmAt?: string;
  createdAt: string;
}

export interface TradeOrderListResponse {
  items: TradeOrder[];
  total: number;
}

export interface TradeOrderDetailResponse {
  order: TradeOrder;
}

export interface Article {
  id: string;
  title: string;
  author: string;
  views: number;
  comments: number;
  image: string;
  timestamp: string;
  tag: string;
}

export interface Task {
  id: string;
  title: string;
  reward: string;
  status: 'pending' | 'completed' | 'claimed';
  icon: string;
}

export interface WelfareOverview {
  balance: number;
  signinRewardPoints: number;
  signedIn: boolean;
  signedAt: string;
  blindboxCostPoints: number;
  blindboxDailyLimit: number;
  todayDrawCount: number;
}

export interface WelfareReward {
  type: 'points' | 'item';
  value: string;
}

export interface WelfareSignInResponse {
  rewardPoints: number;
  balance: number;
}

export interface WelfareDrawResponse {
  reward: WelfareReward;
  costPoints: number;
  balance: number;
}

export interface WelfareLedgerItem {
  id: number;
  amount: number;
  source: string;
  refType: string;
  refId: number;
  createdAt: string;
}

export interface WelfareLedgerResponse {
  items: WelfareLedgerItem[];
  nextCursor: number;
}

export interface Message {
  id: string;
  title: string;
  content: string;
  time: string;
  sortTime?: number;
  type: 'system' | 'social' | 'activity' | 'group';
  read: boolean;
  avatar?: string;
  members?: number;
  senderName?: string;
}

// New Types
export interface SystemNotification {
  id: number;
  title: string;
  content: string;
  time: string;
  level: 'info' | 'warning' | 'success'; // for icon/color differentiation
  read: boolean;
}

export interface Interaction {
  id: number;
  userAvatar: string;
  userName: string;
  type: 'like' | 'comment' | 'follow' | 'mention';
  targetContent?: string; // e.g., "your post", "your comment"
  time: string;
  read: boolean;
}

export interface GroupRecommendation {
  id: string;
  name: string;
  category: string;
  members: number;
  avatar: string;
  desc: string;
  tags: string[];
}

export interface Banner {
  id: number;
  title: string;
  imageUrl: string;
  linkUrl?: string;
}

export enum TabType {
  HOME = 'home',
  GAME = 'game',
  TRADE = 'trade',
  WELFARE = 'welfare',
  COMMUNITY = 'community',
  USER = 'user'
}

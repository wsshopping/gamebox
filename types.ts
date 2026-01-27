
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

export interface TradeItem {
  id: string;
  title: string;
  price: number;
  gameName: string;
  seller: string;
  image: string;
  server: string;
  type: 'Account' | 'Item' | 'Currency';
  // Added time property to support transaction history display
  time?: string;
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

export interface Message {
  id: string;
  title: string;
  content: string;
  time: string;
  type: 'system' | 'social' | 'activity' | 'group';
  read: boolean;
  avatar?: string;
  members?: number;
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

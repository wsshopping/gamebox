import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useIm } from '../context/ImContext';
import { friendApi, FriendItem, FriendProfile } from '../services/api/friend';
import {
  imApi,
  IMMediaDownloadRequest,
  IMAutoDeletePolicyResponse,
  IMGroupAnnouncementResponse,
  IMRedPacketClaimItem,
  IMRedPacketDetailResponse
} from '../services/api/im';
import { authStorage } from '../services/http';
import { IMConversationType, IMMessageType } from '../services/im/client';

const RED_PACKET_MESSAGE = 'jg:redpacket';
const RED_PACKET_CLAIM_TIP_MESSAGE = 'jg:redpacket:claimtip';
const AUTO_DELETE_TIP_MESSAGE = 'jg:auto_delete:tip';
const AUTO_DELETE_OPTIONS = [
  { label: '关闭', value: 0 },
  { label: '24小时', value: 24 * 60 * 60 },
  { label: '7天', value: 7 * 24 * 60 * 60 },
  { label: '30天', value: 30 * 24 * 60 * 60 }
] as const;

interface ChatMessage {
  id: string;
  text: string;
  sender: 'me' | 'other';
  senderName?: string;
  senderId?: string;
  time: string;
  type: 'text' | 'image' | 'video' | 'file' | 'redpacket' | 'tip';
  imageUrl?: string;
  videoUrl?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  isRead?: boolean;
  readCount?: number;
  unreadCount?: number;
  messageIndex?: number;
  unreadIndex?: number;
  redPacketId?: number;
  redPacketTitle?: string;
  redPacketAmount?: number;
  redPacketCount?: number;
  redPacketGreeting?: string;
  redPacketStatus?: string;
  redPacketClaimedAmount?: number;
  redPacketRemainingAmount?: number;
  redPacketRemainingCount?: number;
  redPacketClaiming?: boolean;
  redPacketError?: string;
  localFile?: File;
  sentAt?: number;
  status?: 'failed' | 'sending';
  isLocal?: boolean;
}

const isSameChatMessage = (left: ChatMessage, right: ChatMessage) => {
  return left.id === right.id
    && left.text === right.text
    && left.sender === right.sender
    && left.senderName === right.senderName
    && left.senderId === right.senderId
    && left.time === right.time
    && left.type === right.type
    && left.imageUrl === right.imageUrl
    && left.videoUrl === right.videoUrl
    && left.fileUrl === right.fileUrl
    && left.fileName === right.fileName
    && left.fileSize === right.fileSize
    && left.fileType === right.fileType
    && left.isRead === right.isRead
    && left.readCount === right.readCount
    && left.unreadCount === right.unreadCount
    && left.messageIndex === right.messageIndex
    && left.unreadIndex === right.unreadIndex
    && left.sentAt === right.sentAt
    && left.status === right.status
    && left.redPacketId === right.redPacketId
    && left.redPacketTitle === right.redPacketTitle
    && left.redPacketStatus === right.redPacketStatus
    && left.redPacketClaimedAmount === right.redPacketClaimedAmount
    && left.redPacketRemainingAmount === right.redPacketRemainingAmount
    && left.redPacketRemainingCount === right.redPacketRemainingCount
    && left.redPacketError === right.redPacketError
}

const EMOJIS = ['😀', '😂', '🤣', '😍', '😭', '😡', '👍', '🙏', '🎉', '🔥', '❤️', '💔', '💩', '👻', '💀', '👽', '🤖', '🎃', '🎄', '🎁', '🎈', '💪', '👀', '👂', '👃', '🧠', '🦷', '🦴', '🤝', '👋'];

const ACTION_ITEMS = [
  { name: '相册', icon: '🖼️', action: 'album' },
  { name: '红包', icon: '🧧', action: 'redpacket' }
];
const IMAGE_MAX_SIZE = 10 * 1024 * 1024;
const MAX_ANNOUNCEMENT_LENGTH = 100;
const RED_PACKET_MIN_AMOUNT = 1;
const RED_PACKET_MAX_AMOUNT = 20000;
const RED_PACKET_MIN_COUNT = 1;
const RED_PACKET_MAX_COUNT = 100;
const RED_PACKET_MAX_GREETING = 50;
const RED_PACKET_OPENING_MIN_MS = 1000;
const VIDEO_FILE_EXT_RE = /\.(mp4|mov|m4v|webm|ogg|ogv|avi|mkv)$/i;

const isVideoLikeFile = (content?: Record<string, any>) => {
  const mimeType = String(content?.type || '').toLowerCase();
  if (mimeType.startsWith('video/')) return true;
  const maybeName = String(content?.name || content?.fileName || content?.url || '');
  return VIDEO_FILE_EXT_RE.test(maybeName);
};
const RED_PACKET_OPENING_MAX_MS = 2000;

const Chat: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const endRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const initialScrollDoneRef = useRef(false);
  const cutoffTimeRef = useRef(Date.now() - 3 * 24 * 60 * 60 * 1000);
  const lastReadReceiptIndexRef = useRef<Record<string, number>>({});
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const localMessagesRef = useRef<ChatMessage[]>([]);
  const enableImDebug = false;
  const logIm = (...args: any[]) => {
    if (!enableImDebug) return;
    console.log('[IM Chat]', ...args);
  };
  const { user } = useAuth();
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');
  const [imagePreviewName, setImagePreviewName] = useState('');
  const imagePreviewOwnedUrlRef = useRef('');
  const [isVideoPreviewOpen, setIsVideoPreviewOpen] = useState(false);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState('');
  const [videoPreviewName, setVideoPreviewName] = useState('');
  const [videoPreviewSaveUrl, setVideoPreviewSaveUrl] = useState('');
  const videoPreviewOwnedUrlRef = useRef('');
  const [groupTitle, setGroupTitle] = useState('');
  const [memberCount, setMemberCount] = useState<number | null>(null);
  const [onlineCount, setOnlineCount] = useState<number | null>(null);
  const [privateOnline, setPrivateOnline] = useState<boolean | null>(null);
  const [announcement, setAnnouncement] = useState<IMGroupAnnouncementResponse | null>(null);
  const [isAnnouncementLoading, setIsAnnouncementLoading] = useState(false);
  const [isAnnouncementEditorOpen, setIsAnnouncementEditorOpen] = useState(false);
  const [announcementDraft, setAnnouncementDraft] = useState('');
  const [announcementError, setAnnouncementError] = useState('');
  const [isAnnouncementSaving, setIsAnnouncementSaving] = useState(false);
  const [showFriendMenu, setShowFriendMenu] = useState(false);
  const [showFriendProfile, setShowFriendProfile] = useState(false);
  const [friendProfile, setFriendProfile] = useState<FriendItem | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isRemovingFriend, setIsRemovingFriend] = useState(false);
  const [isUpdatingFriendRemark, setIsUpdatingFriendRemark] = useState(false);
  const [friendActionError, setFriendActionError] = useState('');
  const [showMemberMenu, setShowMemberMenu] = useState(false);
  const [showMemberProfile, setShowMemberProfile] = useState(false);
  const [memberProfile, setMemberProfile] = useState<FriendProfile | null>(null);
  const [selectedMember, setSelectedMember] = useState<{ id: string; name?: string } | null>(null);
  const [memberIsFriend, setMemberIsFriend] = useState(false);
  const [memberActionError, setMemberActionError] = useState('');
  const [memberActionSuccess, setMemberActionSuccess] = useState('');
  const [isMemberLoading, setIsMemberLoading] = useState(false);
  const [isMemberRequesting, setIsMemberRequesting] = useState(false);
  const [autoDeletePolicy, setAutoDeletePolicy] = useState<IMAutoDeletePolicyResponse | null>(null);
  const [isAutoDeleteLoading, setIsAutoDeleteLoading] = useState(false);
  const [showAutoDeleteSheet, setShowAutoDeleteSheet] = useState(false);
  const [autoDeleteError, setAutoDeleteError] = useState('');
  const [groupOwnerId, setGroupOwnerId] = useState('');
  const [groupAdminIds, setGroupAdminIds] = useState<string[]>([]);
  const [isRedPacketModalOpen, setIsRedPacketModalOpen] = useState(false);
  const [redPacketType, setRedPacketType] = useState<'fixed' | 'random'>('random');
  const [redPacketAmount, setRedPacketAmount] = useState('');
  const [redPacketCount, setRedPacketCount] = useState('');
  const [redPacketGreeting, setRedPacketGreeting] = useState('恭喜发财，大吉大利');
  const [redPacketError, setRedPacketError] = useState('');
  const [isRedPacketSending, setIsRedPacketSending] = useState(false);
  const [redPacketPatches, setRedPacketPatches] = useState<Record<number, Partial<ChatMessage>>>({});
  const redPacketLastSyncRef = useRef<Record<number, number>>({});
  const [isRedPacketDetailOpen, setIsRedPacketDetailOpen] = useState(false);
  const [redPacketDetailId, setRedPacketDetailId] = useState(0);
  const [redPacketDetailData, setRedPacketDetailData] = useState<IMRedPacketDetailResponse | null>(null);
  const [redPacketClaimItems, setRedPacketClaimItems] = useState<IMRedPacketClaimItem[]>([]);
  const [isRedPacketDetailLoading, setIsRedPacketDetailLoading] = useState(false);
  const [isRedPacketClaimsLoading, setIsRedPacketClaimsLoading] = useState(false);
  const [redPacketDetailError, setRedPacketDetailError] = useState('');
  const [isRedPacketOpenCardOpen, setIsRedPacketOpenCardOpen] = useState(false);
  const [redPacketOpenCardId, setRedPacketOpenCardId] = useState(0);
  const [redPacketOpenCardSenderName, setRedPacketOpenCardSenderName] = useState('');
  const {
    ready,
    connected,
    reconnect,
    conversations,
    messagesByConversation,
    loadMessages,
    loadMoreMessages,
    sendTextMessage,
    sendCustomMessage,
    sendImageMessage,
    sendFileMessage,
    clearConversationUnread,
    refreshConversations,
    getGroupInfo,
    getGroupMembers
  } = useIm();

  const conversation = conversations.find((item: any) => item.conversationId === id);
  const isGroup = useMemo(() => (
    conversation?.conversationType === IMConversationType.GROUP || id?.startsWith('g') || id?.startsWith('ng')
  ), [conversation?.conversationType, id]);
  const conversationType = isGroup ? IMConversationType.GROUP : IMConversationType.PRIVATE;
  const conversationKey = id ? `${conversationType}:${id}` : '';
  const imMessages = conversationKey ? (messagesByConversation[conversationKey] || []) : [];
  const chatTitle = conversation?.conversationTitle || groupTitle || (isGroup ? '群聊' : '私聊');
  const friendId = !isGroup && id ? Number(id) : 0;
  const hasFriendId = Number.isFinite(friendId) && friendId > 0;
  const currentUserId = user?.ID ? String(user.ID) : '';
  const selectedMemberId = selectedMember?.id || '';
  const selectedMemberNumericId = /^[0-9]+$/.test(selectedMemberId) ? Number(selectedMemberId) : 0;
  const isGroupOwnerOrAdmin = Boolean(
    isGroup
      && currentUserId
      && (groupOwnerId === currentUserId || groupAdminIds.includes(currentUserId))
  );
  const canStartPrivateChat = isGroupOwnerOrAdmin && selectedMemberNumericId > 0;
  const friendDisplayName = friendProfile?.displayName
    || friendProfile?.username
    || chatTitle
    || friendProfile?.phone
    || (hasFriendId ? `用户${friendId}` : '私聊');
  const memberDisplayName = memberProfile?.username
    || selectedMember?.name
    || (selectedMemberNumericId ? `用户${selectedMemberNumericId}` : '群友');
  const isOffline = !connected;
  const autoDeleteLabel = useMemo(() => {
    const sec = autoDeletePolicy?.seconds ?? 0;
    const found = AUTO_DELETE_OPTIONS.find(item => item.value === sec);
    return found?.label || '关闭';
  }, [autoDeletePolicy?.seconds]);
  const activeRedPacketMessage = useMemo(() => {
    if (!redPacketOpenCardId) return null;
    return messages.find(item => item.type === 'redpacket' && item.redPacketId === redPacketOpenCardId) || null;
  }, [messages, redPacketOpenCardId]);

  const formatMessageText = (msg: any) => {
    if (!msg) return '';
    if (msg.name === IMMessageType.TEXT) {
      return msg.content?.text || msg.content?.content || '';
    }
    if (msg.name === RED_PACKET_MESSAGE) {
      return msg.content?.greeting || '恭喜发财，大吉大利';
    }
    if (msg.name === RED_PACKET_CLAIM_TIP_MESSAGE) {
      return msg.content?.text || '';
    }
    if (msg.name === IMMessageType.IMAGE) return '[图片]';
    if (msg.name === IMMessageType.FILE) return '[文件]';
    if (msg.name === IMMessageType.VOICE) return '[语音]';
    if (msg.name === IMMessageType.VIDEO) return '[视频]';
    return msg.content?.text || msg.content?.content || '[新消息]';
  };

  const revokeImageUrl = (url?: string) => {
    if (url && url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  };

  const formatFileSize = (sizeInKB?: number) => {
    if (!sizeInKB || Number.isNaN(sizeInKB) || sizeInKB <= 0) return '';
    if (sizeInKB >= 1024) {
      return `${(sizeInKB / 1024).toFixed(2)} MB`;
    }
    return `${sizeInKB.toFixed(2)} KB`;
  };

  const isMessageRead = (msg: ChatMessage) => {
    if (msg.sender !== 'me') return false;
    if (isGroup) return false;
    if (msg.status === 'failed' || msg.status === 'sending') return false;
    if (msg.isRead) return true;

    const latestReadIndex = Number(conversation?.latestReadIndex || 0);
    if (!latestReadIndex) return false;

    const messageReadIndex = Number(msg.unreadIndex || msg.messageIndex || 0);
    if (messageReadIndex > 0) {
      return messageReadIndex <= latestReadIndex;
    }

    const latestMessage = conversation?.latestMessage;
    const latestMessageId = String(latestMessage?.messageId || latestMessage?.tid || '');
    if (latestMessageId && latestMessageId === msg.id && Boolean(latestMessage?.isRead)) {
      return true;
    }

    return false;
  };

  const getMessageReadIndicator = (msg: ChatMessage) => {
    if (msg.sender !== 'me') return '';
    if (isGroup) return '';
    if (msg.status === 'failed') return '';
    if (msg.status === 'sending') return '⌛';
    return isMessageRead(msg) ? '✓✓' : '✓';
  };

  const getMessageReadIndicatorClass = (msg: ChatMessage) => {
    if (msg.sender !== 'me') return '';
    const base = 'inline-flex items-center font-semibold text-[11px] leading-none select-none';
    if (msg.status === 'sending') return `${base} text-amber-300`;
    if (isMessageRead(msg)) return `${base} text-sky-400`;
    return `${base} text-slate-500/90`;
  };

  const guessFileName = (url: string, fallback = 'file') => {
    try {
      const parsed = new URL(url, window.location.origin);
      const byAttname = parsed.searchParams.get('attname');
      if (byAttname) return decodeURIComponent(byAttname);
      const pathName = parsed.pathname || '';
      const fileName = pathName.split('/').pop() || '';
      return fileName || fallback;
    } catch {
      return fallback;
    }
  };

  const triggerDownload = (url: string, fileName: string) => {
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };

  const downloadByUrl = async (url: string, fileName?: string) => {
    if (!url) return;
    const finalName = fileName || guessFileName(url);
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`download failed: ${response.status}`);
      }
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      triggerDownload(blobUrl, finalName);
      window.setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
      }, 5000);
      return;
    } catch {
      window.alert('保存失败：浏览器下载受限，请重试或更换浏览器。');
    }
  };

  const resolveMediaDownloadPayload = (url: string, fileName?: string): IMMediaDownloadRequest | null => {
    if (!url) return null;
    try {
      const parsed = new URL(url, window.location.origin);
      const objectKey = (parsed.searchParams.get('key') || '').trim() || parsed.pathname.replace(/^\/+/, '');
      if (!objectKey) return null;
      const fallbackName = fileName || parsed.searchParams.get('attname') || guessFileName(url, 'file');
      return {
        key: objectKey,
        fileName: fallbackName
      };
    } catch {
      return null;
    }
  };

  const downloadMediaByBackend = async (url: string, fileName?: string) => {
    const payload = resolveMediaDownloadPayload(url, fileName);
    if (!payload) {
      window.alert('保存失败：媒体地址无效');
      return;
    }
    const apiPath = imApi.getMediaDownloadUrl(payload);
    try {
      const response = await fetch(`/api/v1${apiPath}`, { headers: getAuthHeaders() });
      if (!response.ok) {
        throw new Error(`download failed: ${response.status}`);
      }
      const contentType = (response.headers.get('content-type') || '').toLowerCase();
      if (contentType.includes('application/json')) {
        throw new Error('response json');
      }
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      triggerDownload(blobUrl, payload.fileName || 'download');
      window.setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
      }, 5000);
    } catch {
      window.alert('保存失败：当前环境不支持直接保存，请联系管理员。');
    }
  };

  const getMediaPreviewBackendUrl = (url: string, fileName?: string) => {
    const payload = resolveMediaDownloadPayload(url, fileName);
    if (!payload) return '';
    return `/api/v1${imApi.getMediaPreviewUrl(payload)}`;
  };

  const getAuthHeaders = () => {
    const token = authStorage.getToken();
    const user = authStorage.getUser();
    const headers: Record<string, string> = {};
    if (token) {
      headers['x-token'] = token;
    }
    if (user?.ID) {
      headers['x-user-id'] = String(user.ID);
    }
    return headers;
  };

  const fetchMediaPreviewBlobUrl = async (url: string, fileName?: string, preferType?: string) => {
    const payload = resolveMediaDownloadPayload(url, fileName);
    if (!payload) {
      throw new Error('媒体地址无效');
    }
    const apiPath = imApi.getMediaPreviewUrl(payload);
    const response = await fetch(`/api/v1${apiPath}`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      throw new Error(`preview failed: ${response.status}`);
    }
    const contentType = (response.headers.get('content-type') || '').toLowerCase();
    if (contentType.includes('application/json')) {
      throw new Error('preview failed: json response');
    }
    let blob = await response.blob();
    if (preferType && preferType.startsWith('video/') && (!blob.type || blob.type === 'application/octet-stream')) {
      blob = new Blob([blob], { type: preferType });
    }
    return URL.createObjectURL(blob);
  };

  const openMediaInNewTab = (url?: string) => {
    if (!url) return;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const releaseImagePreviewOwnedUrl = () => {
    if (imagePreviewOwnedUrlRef.current) {
      URL.revokeObjectURL(imagePreviewOwnedUrlRef.current);
      imagePreviewOwnedUrlRef.current = '';
    }
  };

  const releaseVideoPreviewOwnedUrl = () => {
    if (videoPreviewOwnedUrlRef.current) {
      URL.revokeObjectURL(videoPreviewOwnedUrlRef.current);
      videoPreviewOwnedUrlRef.current = '';
    }
  };

  const formatAnnouncementTime = (value?: number) => {
    if (!value) return '';
    return new Date(value).toLocaleString();
  };

  const countAnnouncementChars = (value: string) => Array.from(value || '').length;
  const announcementLength = countAnnouncementChars(announcementDraft);
  const announcementRemaining = MAX_ANNOUNCEMENT_LENGTH - announcementLength;
  const parseGroupAdminIds = (value?: string) => {
    if (!value) return [];
    return value
      .split(/[,\s;|]+/)
      .map(item => item.trim())
      .filter(Boolean);
  };
  const parseOnlineFlag = (value: unknown): boolean | null => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value !== 0;
    if (typeof value === 'string') {
      const normalized = value.trim().toLowerCase();
      if (['1', 'true', 'online', 'yes', 'on'].includes(normalized)) return true;
      if (['0', 'false', 'offline', 'no', 'off'].includes(normalized)) return false;
    }
    return null;
  };

  const createRequestId = () => `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;

  const resolveRedPacketTitle = (status?: string, claimedAmount?: number) => {
    if (status === 'refunded' || status === 'expired') return '红包已过期';
    if (status === 'empty') return '红包已抢完';
    if (claimedAmount && claimedAmount > 0) return `已领取 ${claimedAmount} 积分`;
    return '领取红包';
  };

  const resolveRedPacketMessageText = (status?: string, claimedAmount?: number) => {
    if (status === 'refunded' || status === 'expired') return '红包已过期';
    if (status === 'empty') return '手慢了，红包已抢完';
    if (claimedAmount && claimedAmount > 0) return `你领取了 ${claimedAmount} 积分`;
    return '恭喜发财，大吉大利';
  };

  const resolveRedPacketStatusText = (status?: string) => {
    if (status === 'open') return '可领取';
    if (status === 'empty') return '已抢完';
    if (status === 'expired' || status === 'refunded') return '已过期';
    return '未知状态';
  };

  const buildClaimTipText = (claimerName: string, senderName: string, amount: number) => {
    return `${claimerName || '群友'} 领取了 ${senderName || '群友'} 的红包，抢到 ${amount} 积分`;
  };

  const formatRedPacketClaimTime = (item: IMRedPacketClaimItem) => {
    if (item.createdAt) return item.createdAt;
    if (!item.claimedAt) return '-';
    return new Date(item.claimedAt).toLocaleString();
  };

	const updateRedPacketMessage = useCallback((packetId: number, patch: Partial<ChatMessage>) => {
	  if (!packetId) return;
	  setRedPacketPatches(prev => {
	    const current = prev[packetId] || {};
	    const keys = Object.keys(patch) as Array<keyof ChatMessage>;
	    let changed = false;
	    for (const key of keys) {
	      if (current[key] !== patch[key]) {
          changed = true;
          break;
        }
      }
      if (!changed) {
        return prev;
      }
      return {
        ...prev,
        [packetId]: {
          ...current,
	        ...patch
	      }
	    };
	  });
	}, []);

  const toInt = (value: any) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return 0;
    return Math.max(0, Math.floor(parsed));
  };

  const syncRedPacketDetail = useCallback(async (packetId: number, force = false) => {
    if (!packetId || isOffline) return;
    const now = Date.now();
    const lastSyncAt = redPacketLastSyncRef.current[packetId] || 0;
    if (!force && now-lastSyncAt < 5000) {
      return;
    }
    redPacketLastSyncRef.current[packetId] = now;
    try {
      const detail: IMRedPacketDetailResponse = await imApi.getRedPacketDetail(packetId);
      const claimedAmount = detail.myClaimStatus === 'claimed' ? detail.myClaimedAmount : 0;
      updateRedPacketMessage(packetId, {
        redPacketStatus: detail.status,
        redPacketClaimedAmount: claimedAmount,
        redPacketRemainingAmount: detail.remainingAmount,
        redPacketRemainingCount: detail.remainingCount,
        redPacketGreeting: detail.greeting,
        redPacketTitle: resolveRedPacketTitle(detail.status, claimedAmount),
        text: resolveRedPacketMessageText(detail.status, claimedAmount),
        redPacketError: ''
      });
    } catch (error) {
      redPacketLastSyncRef.current[packetId] = 0;
    }
  }, [isOffline, updateRedPacketMessage]);

  const refreshRedPacketPanel = useCallback(async (packetId: number) => {
    if (!packetId) return;
    if (isOffline) {
      setRedPacketDetailError('离线状态暂不可查看红包详情');
      return;
    }
    setIsRedPacketDetailLoading(true);
    setIsRedPacketClaimsLoading(true);
    setRedPacketDetailError('');
    try {
      const [detailRes, claimsRes] = await Promise.all([
        imApi.getRedPacketDetail(packetId),
        imApi.getRedPacketClaims(packetId, 1, 50)
      ]);
      const claimItems = [...(claimsRes.items || [])].sort((a, b) => {
        if (a.amount === b.amount) {
          return (a.claimedAt || 0) - (b.claimedAt || 0);
        }
        return b.amount - a.amount;
      });
      setRedPacketDetailData(detailRes);
      setRedPacketClaimItems(claimItems);
      const claimedAmount = detailRes.myClaimStatus === 'claimed' ? detailRes.myClaimedAmount : 0;
      updateRedPacketMessage(packetId, {
        redPacketStatus: detailRes.status,
        redPacketClaimedAmount: claimedAmount,
        redPacketRemainingAmount: detailRes.remainingAmount,
        redPacketRemainingCount: detailRes.remainingCount,
        redPacketGreeting: detailRes.greeting,
        redPacketTitle: resolveRedPacketTitle(detailRes.status, claimedAmount),
        text: resolveRedPacketMessageText(detailRes.status, claimedAmount),
        redPacketError: ''
      });
    } catch (error: any) {
      setRedPacketDetailError(error?.message || '操作繁忙，请稍后重试');
    } finally {
      setIsRedPacketDetailLoading(false);
      setIsRedPacketClaimsLoading(false);
    }
  }, [isOffline, updateRedPacketMessage]);

  const claimRedPacketById = useCallback(async (packetId: number) => {
    if (!packetId) return false;
    if (isOffline) {
      updateRedPacketMessage(packetId, {
        redPacketError: '离线状态暂不可领取'
      });
      return false;
    }
    updateRedPacketMessage(packetId, { redPacketClaiming: true, redPacketError: '' });
    try {
      const waitMs = RED_PACKET_OPENING_MIN_MS + Math.floor(Math.random() * (RED_PACKET_OPENING_MAX_MS - RED_PACKET_OPENING_MIN_MS + 1));
      await new Promise((resolve) => {
        window.setTimeout(resolve, waitMs);
      });
      const res = await imApi.claimRedPacket({
        packetId,
        claimRequestId: createRequestId()
      });
      updateRedPacketMessage(packetId, {
        redPacketStatus: res.status,
        redPacketClaimedAmount: res.claimedAmount,
        redPacketRemainingAmount: res.remainingAmount,
        redPacketRemainingCount: res.remainingCount,
        redPacketClaiming: false,
        redPacketError: '',
        redPacketTitle: resolveRedPacketTitle(res.status, res.claimedAmount),
        text: resolveRedPacketMessageText(res.status, res.claimedAmount)
      });
      if (id && conversationType === IMConversationType.GROUP && res.claimedAmount > 0) {
        const packetMsg = messages.find(item => item.type === 'redpacket' && item.redPacketId === packetId);
        const senderName = packetMsg?.senderName || '群友';
        const claimerName = user?.username || '群友';
        sendCustomMessage(id, conversationType, RED_PACKET_CLAIM_TIP_MESSAGE, {
          packetId,
          claimerId: user?.ID || 0,
          claimerName,
          senderName,
          amount: res.claimedAmount,
          text: buildClaimTipText(claimerName, senderName, res.claimedAmount)
        }, {
          lifeTime: autoDeletePolicy?.seconds || 0
        }).catch(() => null);
      }
      syncRedPacketDetail(packetId, true).catch(() => null);
      return true;
    } catch (error: any) {
      const errMessage = error?.message || '操作繁忙，请稍后重试';
      if (errMessage.includes('抢完')) {
        updateRedPacketMessage(packetId, {
          redPacketStatus: 'empty',
          redPacketClaiming: false,
          redPacketError: '',
          redPacketTitle: resolveRedPacketTitle('empty', 0),
          text: resolveRedPacketMessageText('empty', 0)
        });
        return false;
      }
      if (errMessage.includes('过期')) {
        updateRedPacketMessage(packetId, {
          redPacketStatus: 'expired',
          redPacketClaiming: false,
          redPacketError: '',
          redPacketTitle: resolveRedPacketTitle('expired', 0),
          text: resolveRedPacketMessageText('expired', 0)
        });
        return false;
      }
      updateRedPacketMessage(packetId, {
        redPacketClaiming: false,
        redPacketError: errMessage
      });
      return false;
    }
  }, [
    conversationType,
    id,
    isOffline,
    messages,
    sendCustomMessage,
    syncRedPacketDetail,
    updateRedPacketMessage,
    user?.ID,
    user?.username
  ]);

  const handleClaimRedPacket = async (msg: ChatMessage) => {
    if (!msg.redPacketId || msg.redPacketClaiming) return;
    const success = await claimRedPacketById(msg.redPacketId);
    if (!success) {
      openRedPacketDetail(msg);
    }
  };

  const openRedPacketOpenCard = (msg: ChatMessage) => {
    if (!msg.redPacketId) return;
    setRedPacketOpenCardId(msg.redPacketId);
    setRedPacketOpenCardSenderName(msg.senderName || '群友');
    setIsRedPacketOpenCardOpen(true);
    setShowActionMenu(false);
    setShowEmojiPicker(false);
  };

  const closeRedPacketOpenCard = () => {
    if (activeRedPacketMessage?.redPacketClaiming) return;
    setIsRedPacketOpenCardOpen(false);
    setRedPacketOpenCardId(0);
    setRedPacketOpenCardSenderName('');
  };

  const handleOpenCardClaim = async () => {
    if (!activeRedPacketMessage) return;
    await handleClaimRedPacket(activeRedPacketMessage);
  };

  const handleOpenCardViewDetail = async () => {
    if (!activeRedPacketMessage) return;
    setIsRedPacketOpenCardOpen(false);
    openRedPacketDetail(activeRedPacketMessage);
  };

  const openRedPacketDetail = (msg: ChatMessage) => {
    if (!msg.redPacketId) return;
    setIsRedPacketDetailOpen(true);
    setRedPacketDetailId(msg.redPacketId);
    setRedPacketDetailData(null);
    setRedPacketClaimItems([]);
    setRedPacketDetailError('');
    refreshRedPacketPanel(msg.redPacketId).catch(() => null);
  };

  const closeRedPacketDetail = () => {
    setIsRedPacketDetailOpen(false);
    setRedPacketDetailId(0);
    setRedPacketDetailError('');
  };

  const validateRedPacketInput = () => {
    const amount = Number(redPacketAmount);
    const count = Number(redPacketCount);
    const greetingChars = Array.from(redPacketGreeting.trim()).length;
    if (!Number.isFinite(amount) || amount < RED_PACKET_MIN_AMOUNT || amount > RED_PACKET_MAX_AMOUNT) {
      return `红包总额需在 ${RED_PACKET_MIN_AMOUNT}-${RED_PACKET_MAX_AMOUNT} 之间`;
    }
    if (!Number.isFinite(count) || count < RED_PACKET_MIN_COUNT || count > RED_PACKET_MAX_COUNT) {
      return `红包份数需在 ${RED_PACKET_MIN_COUNT}-${RED_PACKET_MAX_COUNT} 之间`;
    }
    if (redPacketType === 'random' && amount < count) {
      return '拼手气红包总额不能小于份数';
    }
    if (greetingChars > RED_PACKET_MAX_GREETING) {
      return `祝福语最多 ${RED_PACKET_MAX_GREETING} 字`;
    }
    return '';
  };

  const openRedPacketModal = () => {
    if (!isGroup) {
      window.alert('群聊才支持发红包');
      return;
    }
    setRedPacketType('random');
    setRedPacketAmount('');
    setRedPacketCount('');
    setRedPacketGreeting('恭喜发财，大吉大利');
    setRedPacketError('');
    setIsRedPacketModalOpen(true);
    setShowActionMenu(false);
  };

  const closeRedPacketModal = () => {
    if (isRedPacketSending) return;
    setIsRedPacketModalOpen(false);
    setRedPacketError('');
  };

  const handleSendRedPacket = async () => {
    if (!id || !isGroup || isRedPacketSending) return;
    if (isOffline) {
      setRedPacketError('当前离线，无法发送红包');
      return;
    }
    const validationError = validateRedPacketInput();
    if (validationError) {
      setRedPacketError(validationError);
      return;
    }
    setRedPacketError('');
    setIsRedPacketSending(true);
    try {
      const createRes = await imApi.createRedPacket({
        groupId: id,
        packetType: redPacketType,
        totalAmount: Number(redPacketAmount),
        totalCount: Number(redPacketCount),
        greeting: redPacketGreeting.trim(),
        requestId: createRequestId()
      });

      await sendCustomMessage(id, conversationType, RED_PACKET_MESSAGE, {
        packetId: createRes.packetId,
        groupId: createRes.groupId,
        packetType: createRes.packetType,
        totalAmount: createRes.totalAmount,
        totalCount: createRes.totalCount,
        greeting: createRes.greeting,
        senderId: createRes.sender.userId,
        senderName: createRes.sender.username,
        senderAvatar: createRes.sender.avatar,
        status: createRes.status,
        remainingAmount: createRes.remainingAmount,
        remainingCount: createRes.remainingCount,
        expireAt: createRes.expireAt
      }, {
        lifeTime: autoDeletePolicy?.seconds || 0
      });

      setIsRedPacketModalOpen(false);
      setShowActionMenu(false);
    } catch (error: any) {
      setRedPacketError(error?.message || '操作繁忙，请稍后重试');
    } finally {
      setIsRedPacketSending(false);
    }
  };

  const loadFriendProfile = useCallback(async () => {
    if (!hasFriendId) {
      setFriendProfile(null);
      return;
    }
    setIsProfileLoading(true);
    setFriendActionError('');
    try {
      const res = await friendApi.listFriends(500);
      const match = (res.items || []).find((item) => item.id === friendId) || null;
      setFriendProfile(match);
    } catch (err: any) {
      setFriendProfile(null);
      setFriendActionError(err?.message || '好友信息获取失败');
    } finally {
      setIsProfileLoading(false);
    }
  }, [friendId, hasFriendId]);

  const loadMemberProfile = useCallback(async () => {
    if (!selectedMember) {
      setMemberProfile(null);
      setMemberIsFriend(false);
      return;
    }
    setIsMemberLoading(true);
    setMemberActionError('');
    setMemberActionSuccess('');
    try {
      let profile: FriendProfile | null = null;
      if (selectedMemberNumericId) {
        const res = await friendApi.search(String(selectedMemberNumericId));
        profile = res?.[0] || null;
      }
      let isFriend = false;
      if (selectedMemberNumericId) {
        const friendsRes = await friendApi.listFriends(500);
        isFriend = (friendsRes.items || []).some(item => item.id === selectedMemberNumericId);
      }
      setMemberProfile(profile);
      setMemberIsFriend(isFriend);
    } catch (err: any) {
      setMemberProfile(null);
      setMemberIsFriend(false);
      setMemberActionError(err?.message || '好友信息获取失败');
    } finally {
      setIsMemberLoading(false);
    }
  }, [selectedMember, selectedMemberNumericId]);

  useEffect(() => {
    if (!id || !ready) return;
    initialScrollDoneRef.current = false;
    setIsLoading(true);
    setHasMore(true);
    setIsLoadingMore(false);
    cutoffTimeRef.current = Date.now() - 3 * 24 * 60 * 60 * 1000;
    loadMessages(id, conversationType)
      .catch(() => null)
      .finally(() => setIsLoading(false));
  }, [id, ready, conversationType, loadMessages]);

  useEffect(() => {
    if (!id || !ready) return;
    if (!conversation?.unreadCount) return;
    const latestUnread = Number(conversation?.latestUnreadIndex || 0);
    const latestRead = Number(conversation?.latestReadIndex || 0);
    const unreadCount = Number(conversation?.unreadCount || 0);
    const unreadIndex = latestUnread > 0 ? latestUnread : (latestRead > 0 && unreadCount > 0 ? latestRead + unreadCount : 0);
    if (!unreadIndex) return;
    clearConversationUnread(id, conversationType, unreadIndex).catch(() => null);
  }, [
    id,
    ready,
    conversationType,
    conversation?.unreadCount,
    conversation?.latestUnreadIndex,
    conversation?.latestReadIndex,
    clearConversationUnread
  ]);

  useEffect(() => {
    if (!id || !ready || isGroup) return;
    const latestIncoming = [...imMessages].reverse().find((item: any) => !item?.isSender && Number(item?.unreadIndex || item?.messageIndex || 0) > 0);
    if (!latestIncoming) return;
    const readIndex = Number(latestIncoming?.unreadIndex || latestIncoming?.messageIndex || 0);
    if (!readIndex) return;
    const receiptKey = `${conversationType}:${id}`;
    const lastSent = Number(lastReadReceiptIndexRef.current[receiptKey] || 0);
    if (readIndex <= lastSent) return;
    lastReadReceiptIndexRef.current[receiptKey] = readIndex;
    clearConversationUnread(id, conversationType, readIndex).catch(() => null);
  }, [
    id,
    ready,
    isGroup,
    conversationType,
    imMessages,
    clearConversationUnread
  ]);

  useEffect(() => {
    if (!id || !ready || isGroup) return;
    const timer = window.setInterval(() => {
      refreshConversations().catch(() => null);
    }, 4000);
    return () => {
      window.clearInterval(timer);
    };
  }, [id, ready, isGroup, refreshConversations]);

  useEffect(() => {
    if (!id || isGroup) {
      setPrivateOnline(null);
      return;
    }
    const targetId = Number(id);
    if (!Number.isInteger(targetId) || targetId <= 0) {
      setPrivateOnline(null);
      return;
    }

    let active = true;
    const fetchStatus = () => {
      imApi.getUserOnlineStatus(targetId)
        .then(res => {
          if (!active) return;
          setPrivateOnline(parseOnlineFlag((res as any)?.isOnline));
        })
        .catch(() => {
          if (!active) return;
          setPrivateOnline(null);
        });
    };
    fetchStatus();
    const timer = window.setInterval(fetchStatus, 10000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [id, isGroup]);

  useEffect(() => {
    if (!id || !isGroup) {
      setGroupTitle('');
      setMemberCount(null);
      setOnlineCount(null);
      setGroupOwnerId('');
      setGroupAdminIds([]);
      return;
    }
    let active = true;
    Promise.allSettled([
      getGroupInfo(id),
      getGroupMembers(id),
      imApi.getGroupOnlineStats(id)
    ]).then(([infoResult, membersResult, onlineResult]) => {
      if (!active) return;
      const info = infoResult.status === 'fulfilled' ? infoResult.value : null;
      const members = membersResult.status === 'fulfilled' ? membersResult.value : null;
      const onlineStats = onlineResult.status === 'fulfilled' ? onlineResult.value : null;
      if (info?.groupName) setGroupTitle(info.groupName);
      if (onlineStats && typeof onlineStats.totalCount === 'number') {
        setMemberCount(onlineStats.totalCount);
      } else if (members?.items) {
        setMemberCount(members.items.length);
      } else {
        setMemberCount(null);
      }
      if (onlineStats && typeof onlineStats.onlineCount === 'number') {
        setOnlineCount(onlineStats.onlineCount);
      } else {
        setOnlineCount(null);
      }
      const ext = info?.extFields || {};
      const settings = info?.settings || {};
      const ownerId = (ext.grp_creator || settings.grp_creator || '').trim();
      const adminRaw = ext.grp_administrators || settings.grp_administrators || '';
      setGroupOwnerId(ownerId);
      setGroupAdminIds(parseGroupAdminIds(adminRaw));
    }).catch(() => null);

    return () => {
      active = false;
    };
  }, [getGroupInfo, getGroupMembers, id, isGroup]);

  useEffect(() => {
    if (!id || !isGroup) {
      setAnnouncement(null);
      return;
    }
    let active = true;
    setIsAnnouncementLoading(true);
    setAnnouncementError('');
    imApi.getGroupAnnouncement(id)
      .then((res) => {
        if (!active) return;
        setAnnouncement(res);
        setAnnouncementDraft(res.content || '');
      })
      .catch(() => {
        if (!active) return;
        setAnnouncement(null);
      })
      .finally(() => {
        if (!active) return;
        setIsAnnouncementLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id, isGroup]);

  useEffect(() => {
    loadAutoDeletePolicy().catch(() => null);
  }, [id, conversationType]);

  useEffect(() => {
    setFriendProfile(null);
    setFriendActionError('');
    setIsUpdatingFriendRemark(false);
    setShowFriendMenu(false);
    setShowFriendProfile(false);
    setSelectedMember(null);
    setMemberProfile(null);
    setMemberIsFriend(false);
    setMemberActionError('');
    setMemberActionSuccess('');
    setShowMemberMenu(false);
    setShowMemberProfile(false);
    setIsRedPacketModalOpen(false);
    setIsRedPacketOpenCardOpen(false);
    setRedPacketOpenCardId(0);
    setRedPacketOpenCardSenderName('');
    setRedPacketError('');
    setRedPacketPatches({});
    redPacketLastSyncRef.current = {};
  }, [id]);

  useEffect(() => {
    if (!showFriendMenu && !showFriendProfile) return;
    loadFriendProfile().catch(() => null);
  }, [showFriendMenu, showFriendProfile, loadFriendProfile]);

  useEffect(() => {
    if (!id || !ready || isGroup) return;
    loadFriendProfile().catch(() => null);
  }, [id, ready, isGroup, loadFriendProfile]);

  useEffect(() => {
    if (!showMemberMenu && !showMemberProfile) return;
    loadMemberProfile().catch(() => null);
  }, [showMemberMenu, showMemberProfile, loadMemberProfile]);

  useEffect(() => {
    const cutoffTime = cutoffTimeRef.current;
    let filtered = imMessages.filter((msg: any) => {
      const sentTime = msg?.sentTime || 0;
      return sentTime === 0 || sentTime >= cutoffTime;
    });
    if (filtered.length === 0 && imMessages.length > 0) {
      const latest = imMessages[imMessages.length - 1];
      if (latest) {
        filtered = [latest];
      }
    }
    logIm('messages updated', {
      total: imMessages.length,
      filtered: filtered.length,
      cutoffTime
    });
    const mapped = filtered.map((msg: any) => {
      const packetId = toInt(msg?.content?.packetId || msg?.content?.packet_id);
      const isRedPacket = msg.name === RED_PACKET_MESSAGE && packetId > 0;
      const patch = packetId ? (redPacketPatches[packetId] || {}) : {};
      if (isRedPacket) {
        const status = String(patch.redPacketStatus || msg.content?.status || 'open');
        const claimedAmount = toInt(patch.redPacketClaimedAmount ?? msg.content?.myClaimedAmount ?? 0);
        return {
          id: msg.messageId || msg.tid || `${packetId}-${msg.sentTime || Date.now()}`,
          text: String(patch.text || resolveRedPacketMessageText(status, claimedAmount)),
          sender: msg.isSender ? 'me' : 'other',
          senderName: msg.sender?.name || msg.senderName,
          senderId: msg.sender?.id || msg.senderId,
          time: msg.sentTime ? new Date(msg.sentTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
          type: 'redpacket' as const,
          redPacketId: packetId,
          redPacketTitle: String(patch.redPacketTitle || resolveRedPacketTitle(status, claimedAmount)),
          redPacketAmount: toInt(patch.redPacketAmount ?? msg.content?.totalAmount),
          redPacketCount: toInt(patch.redPacketCount ?? msg.content?.totalCount),
          redPacketGreeting: String(patch.redPacketGreeting || msg.content?.greeting || '恭喜发财，大吉大利'),
          redPacketStatus: status,
          redPacketClaimedAmount: claimedAmount,
          redPacketRemainingAmount: toInt(patch.redPacketRemainingAmount ?? msg.content?.remainingAmount),
          redPacketRemainingCount: toInt(patch.redPacketRemainingCount ?? msg.content?.remainingCount),
          redPacketClaiming: Boolean(patch.redPacketClaiming),
          redPacketError: String(patch.redPacketError || ''),
          sentAt: msg.sentTime || 0
        };
      }

      if (msg.name === RED_PACKET_CLAIM_TIP_MESSAGE) {
        return {
          id: msg.messageId || msg.tid || String(msg.sentTime || Date.now()),
          text: formatMessageText(msg),
          sender: 'other' as const,
          senderName: '',
          senderId: '',
          time: msg.sentTime ? new Date(msg.sentTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
          type: 'tip' as const,
          sentAt: msg.sentTime || 0
        };
      }

      if (msg.name === AUTO_DELETE_TIP_MESSAGE) {
        return {
          id: msg.messageId || msg.tid || String(msg.sentTime || Date.now()),
          text: formatMessageText(msg),
          sender: 'other' as const,
          senderName: '',
          senderId: '',
          time: msg.sentTime ? new Date(msg.sentTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
          type: 'tip' as const,
          sentAt: msg.sentTime || 0
        };
      }

      return {
        id: msg.messageId || msg.tid || String(msg.sentTime || Date.now()),
        text: formatMessageText(msg),
        sender: msg.isSender ? 'me' : 'other',
        senderName: msg.sender?.name || msg.senderName,
        senderId: msg.sender?.id || msg.senderId,
        time: msg.sentTime ? new Date(msg.sentTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
        type: msg.name === IMMessageType.IMAGE
          ? 'image'
          : (msg.name === IMMessageType.VIDEO || (msg.name === IMMessageType.FILE && isVideoLikeFile(msg.content))
            ? 'video'
            : (msg.name === IMMessageType.FILE ? 'file' : 'text')),
        imageUrl: msg.content?.imageUri || msg.content?.url,
        videoUrl: msg.content?.videoUri || msg.content?.url,
        fileUrl: msg.content?.url,
        fileName: msg.content?.name || msg.content?.fileName || '文件',
        fileSize: Number(msg.content?.size || 0),
        fileType: msg.content?.type || '',
        isRead: Boolean(msg.isRead),
        readCount: Number(msg.readCount || 0),
        unreadCount: Number(msg.unreadCount || 0),
        messageIndex: Number(msg.messageIndex || 0),
        unreadIndex: Number(msg.unreadIndex || 0),
        sentAt: msg.sentTime || 0
      };
    });
    const combined = [...mapped, ...localMessages].sort((a, b) => (a.sentAt || 0) - (b.sentAt || 0));
    setMessages(prev => {
      if (prev.length === combined.length && prev.every((item, index) => isSameChatMessage(item, combined[index]))) {
        return prev;
      }
      return combined;
    });
  }, [imMessages, localMessages, redPacketPatches]);

  useEffect(() => {
    if (isOffline) return;
    const packetIds = Array.from(new Set(
      messages
        .filter(item => item.type === 'redpacket' && item.redPacketId)
        .map(item => item.redPacketId as number)
    ));
    packetIds.forEach(packetId => {
      syncRedPacketDetail(packetId).catch(() => null);
    });
  }, [isOffline, messages, syncRedPacketDetail]);

  useEffect(() => {
    initialScrollDoneRef.current = false;
    setLocalMessages([]);
  }, [id]);

  useEffect(() => {
    localMessagesRef.current = localMessages;
  }, [localMessages]);

  useEffect(() => {
    return () => {
      releaseImagePreviewOwnedUrl();
      releaseVideoPreviewOwnedUrl();
      localMessagesRef.current.forEach((msg) => {
        if (msg.type === 'image') {
          revokeImageUrl(msg.imageUrl);
        }
      });
    };
  }, [id]);

  useEffect(() => {
    if (isLoading || isLoadingMore) return;
    const behavior: ScrollBehavior = initialScrollDoneRef.current ? 'smooth' : 'auto';
    endRef.current?.scrollIntoView({ behavior, block: 'end' });
    if (!initialScrollDoneRef.current) {
      initialScrollDoneRef.current = true;
    }
  }, [messages, isLoading, id]);

  useEffect(() => {
    const handleResume = () => {
      if (!connected) {
        reconnect();
      }
    };
    const handleVisibility = () => {
      if (!document.hidden) {
        handleResume();
      }
    };

    window.addEventListener('focus', handleResume);
    window.addEventListener('pageshow', handleResume);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('focus', handleResume);
      window.removeEventListener('pageshow', handleResume);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [connected, reconnect]);

  const getOldestTimeInWindow = (list: any[], cutoffTime: number) => {
    let oldest = 0;
    list.forEach((msg) => {
      const sentTime = msg?.sentTime || 0;
      if (sentTime <= 0 || sentTime < cutoffTime) return;
      if (!oldest || sentTime < oldest) {
        oldest = sentTime;
      }
    });
    return oldest;
  };

  const handleLoadMore = async () => {
    if (!id || isLoadingMore || !hasMore) return;
    const cutoffTime = cutoffTimeRef.current;
    const oldestTime = getOldestTimeInWindow(imMessages, cutoffTime);
    if (!oldestTime || oldestTime <= cutoffTime) {
      logIm('loadMore blocked', { reason: 'no older time in window', oldestTime, cutoffTime });
      setHasMore(false);
      return;
    }

    const container = scrollRef.current;
    const prevHeight = container?.scrollHeight || 0;
    const prevScrollTop = container?.scrollTop || 0;
    setIsLoadingMore(true);
    try {
      const beforeTime = Math.max(oldestTime - 1, 0);
      logIm('loadMore start', { beforeTime, oldestTime, cutoffTime, count: 30 });
      const { messages: moreMessages, isFinished } = await loadMoreMessages(id, conversationType, beforeTime, 30);
      logIm('loadMore done', { received: moreMessages?.length || 0, isFinished });
      if (!moreMessages || moreMessages.length === 0 || isFinished) {
        setHasMore(false);
      }
      const allTimes = [...imMessages, ...(moreMessages || [])]
        .map((msg: any) => msg?.sentTime || 0)
        .filter((value: number) => value >= cutoffTime);
      if (allTimes.length > 0) {
        const nextOldest = Math.min(...allTimes);
        if (nextOldest <= cutoffTime) {
          setHasMore(false);
        }
      }
    } finally {
      setIsLoadingMore(false);
      requestAnimationFrame(() => {
        if (!container) return;
        const newHeight = container.scrollHeight;
        const delta = newHeight - prevHeight;
        container.scrollTop = prevScrollTop + delta;
      });
    }
  };

  const handleScroll = () => {
    const container = scrollRef.current;
    if (!container || isLoading || isLoadingMore || !hasMore || !initialScrollDoneRef.current) return;
    if (container.scrollTop <= 60) {
      logIm('scroll top reached', { scrollTop: container.scrollTop });
      handleLoadMore();
    }
  };

  const handleSend = async () => {
    const content = inputText.trim();
    if (!content || !id) return;
    setInputText('');
    setShowEmojiPicker(false);
    setShowActionMenu(false);
    if (isOffline) {
      const now = Date.now();
      setLocalMessages(prev => ([
        ...prev,
        {
          id: `local-${now}-${Math.random().toString(36).slice(2, 8)}`,
          text: content,
          sender: 'me',
          time: new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'text',
          sentAt: now,
          status: 'failed',
          isLocal: true
        }
      ]));
      return;
    }
    try {
      await sendTextMessage(id, conversationType, content, {
        lifeTime: autoDeletePolicy?.seconds || 0
      });
    } catch (e) {
      const now = Date.now();
      setLocalMessages(prev => ([
        ...prev,
        {
          id: `local-${now}-${Math.random().toString(36).slice(2, 8)}`,
          text: content,
          sender: 'me',
          time: new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'text',
          sentAt: now,
          status: 'failed',
          isLocal: true
        }
      ]));
    }
  };

  const handleRetryMessage = async (msg: ChatMessage) => {
    if (!id || msg.status !== 'failed') return;
    setLocalMessages(prev => prev.map(item => (
      item.id === msg.id ? { ...item, status: 'sending' } : item
    )));
    try {
      if (msg.type === 'image') {
        if (!msg.localFile) {
          window.alert('图片已失效，请重新选择');
          setLocalMessages(prev => prev.map(item => (
            item.id === msg.id ? { ...item, status: 'failed' } : item
          )));
          return;
        }
        await sendImageMessage(id, conversationType, msg.localFile, {
          lifeTime: autoDeletePolicy?.seconds || 0
        });
      } else if (msg.type === 'video') {
        if (!msg.localFile) {
          window.alert('视频已失效，请重新选择');
          setLocalMessages(prev => prev.map(item => (
            item.id === msg.id ? { ...item, status: 'failed' } : item
          )));
          return;
        }
        await sendFileMessage(id, conversationType, msg.localFile, {
          lifeTime: autoDeletePolicy?.seconds || 0
        });
      } else if (msg.type === 'file') {
        if (!msg.localFile) {
          window.alert('文件已失效，请重新选择');
          setLocalMessages(prev => prev.map(item => (
            item.id === msg.id ? { ...item, status: 'failed' } : item
          )));
          return;
        }
        await sendFileMessage(id, conversationType, msg.localFile, {
          lifeTime: autoDeletePolicy?.seconds || 0
        });
      } else {
        await sendTextMessage(id, conversationType, msg.text, {
          lifeTime: autoDeletePolicy?.seconds || 0
        });
      }
      removeLocalMessage(msg.id);
    } catch (e) {
      setLocalMessages(prev => prev.map(item => (
        item.id === msg.id ? { ...item, status: 'failed' } : item
      )));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  const handleHeaderRightClick = () => {
    if (!id) return;
    if (isGroup) {
      navigate(`/group/${id}`);
      return;
    }
    setFriendActionError('');
    setShowFriendMenu(true);
  };

  const loadAutoDeletePolicy = useCallback(async () => {
    if (!id) return;
    setIsAutoDeleteLoading(true);
    try {
      const res = await imApi.getAutoDeletePolicy({
        conversationType,
        conversationId: id
      });
      setAutoDeletePolicy(res);
      setAutoDeleteError('');
    } catch (err: any) {
      setAutoDeleteError(err?.message || '自动删除设置获取失败');
      setAutoDeletePolicy(null);
    } finally {
      setIsAutoDeleteLoading(false);
    }
  }, [id, conversationType]);

  const handleOpenAutoDeleteSheet = async () => {
    await loadAutoDeletePolicy();
    setShowFriendMenu(false);
    setShowAutoDeleteSheet(true);
  };

  const handleSetAutoDelete = async (seconds: number) => {
    if (!id || !autoDeletePolicy?.canEdit) return;
    setIsAutoDeleteLoading(true);
    try {
      const res = await imApi.setAutoDeletePolicy({
        conversationType,
        conversationId: id,
        seconds
      });
      setAutoDeletePolicy(res);
      setAutoDeleteError('');
      setShowAutoDeleteSheet(false);
    } catch (err: any) {
      setAutoDeleteError(err?.message || '自动删除设置更新失败');
    } finally {
      setIsAutoDeleteLoading(false);
    }
  };

  const handleViewFriendProfile = () => {
    setShowFriendMenu(false);
    setShowFriendProfile(true);
  };

  const handleSetFriendRemark = async () => {
    if (!hasFriendId) {
      setFriendActionError('无法识别好友信息');
      return;
    }
    const currentRemark = friendProfile?.displayName || '';
    const input = window.prompt('请输入好友备注', currentRemark);
    if (input === null) return;
    const remark = input.trim();
    if (!remark) {
      setFriendActionError('备注不能为空');
      return;
    }

    setIsUpdatingFriendRemark(true);
    setFriendActionError('');
    try {
      await friendApi.setRemark(friendId, remark);
      await loadFriendProfile();
      await refreshConversations().catch(() => null);
    } catch (err: any) {
      setFriendActionError(err?.message || '备注设置失败');
    } finally {
      setIsUpdatingFriendRemark(false);
    }
  };

  const handleRemoveFriend = async () => {
    if (!hasFriendId) {
      setFriendActionError('无法识别好友信息');
      return;
    }
    if (!window.confirm('确定删除好友？')) return;
    setIsRemovingFriend(true);
    setFriendActionError('');
    try {
      await friendApi.removeFriend(friendId);
      await refreshConversations().catch(() => null);
      setShowFriendMenu(false);
      setShowFriendProfile(false);
      navigate(-1);
    } catch (err: any) {
      setFriendActionError(err?.message || '删除失败');
    } finally {
      setIsRemovingFriend(false);
    }
  };

  const handleAvatarClick = (msg: ChatMessage) => {
    if (msg.sender === 'me') return;
    if (!isGroup) {
      setShowFriendMenu(false);
      setFriendActionError('');
      setShowFriendProfile(true);
      return;
    }
    const senderId = String(msg.senderId || '');
    setSelectedMember({
      id: senderId,
      name: msg.senderName || '群友'
    });
    setMemberActionError('');
    setMemberActionSuccess('');
    setShowMemberMenu(true);
  };

  const handleViewMemberProfile = () => {
    setShowMemberMenu(false);
    setShowMemberProfile(true);
  };

  const handleStartPrivateChat = () => {
    if (!canStartPrivateChat) {
      setMemberActionError('暂无权限发起对话');
      return;
    }
    if (!selectedMemberNumericId) {
      setMemberActionError('无法识别用户');
      return;
    }
    setShowMemberMenu(false);
    setShowMemberProfile(false);
    navigate(`/chat/${selectedMemberNumericId}`);
  };

  const handleSendFriendRequest = async () => {
    if (!selectedMemberNumericId) {
      setMemberActionError('无法识别用户');
      return;
    }
    if (memberIsFriend) {
      setMemberActionSuccess('对方已经是好友');
      return;
    }
    setIsMemberRequesting(true);
    setMemberActionError('');
    setMemberActionSuccess('');
    try {
      await friendApi.createRequest(selectedMemberNumericId);
      setMemberActionSuccess('好友申请已发送');
    } catch (err: any) {
      setMemberActionError(err?.message || '发送失败');
    } finally {
      setIsMemberRequesting(false);
    }
  };

  const handleHeaderDoubleClick = () => {
    const container = scrollRef.current;
    if (!container) return;
    container.scrollTo({ top: 0, behavior: 'smooth' });
    window.setTimeout(() => {
      handleLoadMore().catch(() => null);
    }, 120);
  };

  const openAnnouncementEditor = () => {
    setAnnouncementDraft(announcement?.content || '');
    setAnnouncementError('');
    setIsAnnouncementEditorOpen(true);
  };

  const closeAnnouncementEditor = () => {
    setIsAnnouncementEditorOpen(false);
    setAnnouncementError('');
  };

  const handleAnnouncementSave = async () => {
    if (!id || isAnnouncementSaving) return;
    const trimmed = announcementDraft.trim();
    if (countAnnouncementChars(trimmed) > MAX_ANNOUNCEMENT_LENGTH) {
      setAnnouncementError(`公告最多 ${MAX_ANNOUNCEMENT_LENGTH} 字`);
      return;
    }
    setIsAnnouncementSaving(true);
    setAnnouncementError('');
    try {
      const res = await imApi.setGroupAnnouncement({ groupId: id, content: trimmed });
      setAnnouncement(res);
      setAnnouncementDraft(res.content || '');
      setIsAnnouncementEditorOpen(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : '公告更新失败';
      setAnnouncementError(message);
    } finally {
      setIsAnnouncementSaving(false);
    }
  };

  const toggleActionMenu = () => {
    setShowActionMenu((prev) => !prev);
    setShowEmojiPicker(false);
  };

  const toggleEmojiPicker = () => {
    setShowEmojiPicker((prev) => !prev);
    setShowActionMenu(false);
  };

  const handleEmojiClick = (emoji: string) => {
    setInputText((prev) => prev + emoji);
  };

  const handleInputFocus = () => {
    setShowActionMenu(false);
    setShowEmojiPicker(false);
  };

  const handleUnsupported = (label: string) => {
    window.alert(`${label}暂不支持`);
    setShowActionMenu(false);
  };

  const removeLocalMessage = (messageId: string) => {
    setLocalMessages(prev => {
      const target = prev.find(item => item.id === messageId);
      if (target?.type === 'image') {
        revokeImageUrl(target.imageUrl);
      }
      if (target?.type === 'video' && target.videoUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(target.videoUrl);
      }
      return prev.filter(item => item.id !== messageId);
    });
  };

  const handleAlbumClick = () => {
    setShowEmojiPicker(false);
    setShowActionMenu(false);
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
      imageInputRef.current.click();
    }
  };

  const handleFileClick = () => {
    setShowEmojiPicker(false);
    setShowActionMenu(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const validateImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      window.alert('仅支持图片文件');
      return false;
    }
    if (file.size > IMAGE_MAX_SIZE) {
      window.alert('图片大小不能超过 10MB');
      return false;
    }
    return true;
  };

  const addLocalImageMessage = (file: File, status: 'failed' | 'sending') => {
    const now = Date.now();
    const imageUrl = URL.createObjectURL(file);
    setLocalMessages(prev => ([
      ...prev,
      {
        id: `local-${now}-${Math.random().toString(36).slice(2, 8)}`,
        text: '',
        sender: 'me',
        time: new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'image',
        imageUrl,
        sentAt: now,
        status,
        isLocal: true,
        localFile: file
      }
    ]));
  };

  const addLocalVideoMessage = (file: File, status: 'failed' | 'sending') => {
    const now = Date.now();
    const videoUrl = URL.createObjectURL(file);
    setLocalMessages(prev => ([
      ...prev,
      {
        id: `local-${now}-${Math.random().toString(36).slice(2, 8)}`,
        text: '[视频]',
        sender: 'me',
        time: new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'video',
        videoUrl,
        fileName: file.name,
        fileSize: Number((file.size / 1024).toFixed(2)),
        fileType: file.type || 'video/mp4',
        sentAt: now,
        status,
        isLocal: true,
        localFile: file
      }
    ]));
  };

  const addLocalFileMessage = (file: File, status: 'failed' | 'sending') => {
    const now = Date.now();
    setLocalMessages(prev => ([
      ...prev,
      {
        id: `local-${now}-${Math.random().toString(36).slice(2, 8)}`,
        text: '[文件]',
        sender: 'me',
        time: new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'file',
        fileName: file.name,
        fileSize: Number((file.size / 1024).toFixed(2)),
        fileType: file.type || 'application/octet-stream',
        sentAt: now,
        status,
        isLocal: true,
        localFile: file
      }
    ]));
  };

  const handleSendImage = async (file: File) => {
    if (!id || !validateImageFile(file)) return;
    setShowEmojiPicker(false);
    setShowActionMenu(false);
    if (isOffline) {
      addLocalImageMessage(file, 'failed');
      return;
    }
    try {
      await sendImageMessage(id, conversationType, file, {
        lifeTime: autoDeletePolicy?.seconds || 0
      });
    } catch (e) {
      addLocalImageMessage(file, 'failed');
      const message = e instanceof Error ? e.message : '图片发送失败，请稍后重试';
      window.alert(message);
    }
  };

  const handleSendVideo = async (file: File) => {
    if (!id) return;
    if (!file.type.startsWith('video/')) {
      window.alert('仅支持视频文件');
      return;
    }
    setShowEmojiPicker(false);
    setShowActionMenu(false);
    if (isOffline) {
      addLocalVideoMessage(file, 'failed');
      return;
    }
    try {
      await sendFileMessage(id, conversationType, file, {
        lifeTime: autoDeletePolicy?.seconds || 0
      });
    } catch (e) {
      addLocalVideoMessage(file, 'failed');
      const message = e instanceof Error ? e.message : '视频发送失败，请稍后重试';
      window.alert(message);
    }
  };

  const handleSendFile = async (file: File) => {
    if (!id) return;
    setShowEmojiPicker(false);
    setShowActionMenu(false);
    if (isOffline) {
      addLocalFileMessage(file, 'failed');
      return;
    }
    try {
      await sendFileMessage(id, conversationType, file, {
        lifeTime: autoDeletePolicy?.seconds || 0
      });
    } catch (e) {
      addLocalFileMessage(file, 'failed');
      const message = e instanceof Error ? e.message : '文件发送失败，请稍后重试';
      window.alert(message);
    }
  };

  const handleImageInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (file.type.startsWith('video/')) {
      handleSendVideo(file);
      return;
    }
    if (file.type.startsWith('image/')) {
      handleSendImage(file);
      return;
    }
    window.alert('仅支持图片或视频文件');
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    handleSendFile(file);
  };

  const handleActionItemClick = (item: { name: string; action?: string }) => {
    if (item.action === 'album') {
      handleAlbumClick();
      return;
    }
    if (item.action === 'redpacket') {
      openRedPacketModal();
      return;
    }
    if (item.action === 'file') {
      handleFileClick();
      return;
    }
    handleUnsupported(item.name);
  };

  const handleOpenFile = (msg: ChatMessage) => {
    if (msg.fileUrl) {
      void downloadMediaByBackend(msg.fileUrl, msg.fileName);
      return;
    }
    if (!msg.localFile) return;
    const localUrl = URL.createObjectURL(msg.localFile);
    downloadByUrl(localUrl, msg.fileName || msg.localFile.name);
    window.setTimeout(() => {
      URL.revokeObjectURL(localUrl);
    }, 5000);
  };

  const closeImagePreview = () => {
    setIsImagePreviewOpen(false);
    setImagePreviewUrl('');
    setImagePreviewName('');
    releaseImagePreviewOwnedUrl();
  };

  const closeVideoPreview = () => {
    setIsVideoPreviewOpen(false);
    setVideoPreviewUrl('');
    setVideoPreviewName('');
    setVideoPreviewSaveUrl('');
    releaseVideoPreviewOwnedUrl();
  };

  const handleOpenImage = (msg: ChatMessage) => {
    releaseImagePreviewOwnedUrl();
    if (msg.imageUrl) {
      setImagePreviewUrl(msg.imageUrl);
      setImagePreviewName(msg.fileName || guessFileName(msg.imageUrl, 'image'));
      setIsImagePreviewOpen(true);
      return;
    }
    if (!msg.localFile) return;
    const localUrl = URL.createObjectURL(msg.localFile);
    imagePreviewOwnedUrlRef.current = localUrl;
    setImagePreviewUrl(localUrl);
    setImagePreviewName(msg.localFile.name || 'image');
    setIsImagePreviewOpen(true);
  };

  const handleOpenVideo = async (msg: ChatMessage) => {
    releaseVideoPreviewOwnedUrl();
    if (msg.videoUrl) {
      if (msg.videoUrl.startsWith('blob:')) {
        setVideoPreviewUrl(msg.videoUrl);
        setVideoPreviewName(msg.fileName || '视频预览');
        setVideoPreviewSaveUrl(msg.videoUrl);
        setIsVideoPreviewOpen(true);
        return;
      }
      try {
        const previewBlobUrl = await fetchMediaPreviewBlobUrl(msg.videoUrl, msg.fileName || 'video', msg.fileType);
        videoPreviewOwnedUrlRef.current = previewBlobUrl;
        setVideoPreviewUrl(previewBlobUrl);
        setVideoPreviewName(msg.fileName || '视频预览');
        setVideoPreviewSaveUrl(msg.videoUrl);
        setIsVideoPreviewOpen(true);
      } catch {
        const previewUrl = getMediaPreviewBackendUrl(msg.videoUrl, msg.fileName || 'video');
        if (!previewUrl) {
          window.alert('预览失败：媒体地址无效');
          return;
        }
        setVideoPreviewUrl(previewUrl);
        setVideoPreviewName(msg.fileName || '视频预览');
        setVideoPreviewSaveUrl(msg.videoUrl);
        setIsVideoPreviewOpen(true);
      }
      return;
    }
    if (!msg.localFile) return;
    const localUrl = URL.createObjectURL(msg.localFile);
    videoPreviewOwnedUrlRef.current = localUrl;
    setVideoPreviewUrl(localUrl);
    setVideoPreviewName(msg.localFile.name || '视频预览');
    setVideoPreviewSaveUrl(localUrl);
    setIsVideoPreviewOpen(true);
  };

  const handleSaveVideo = (msg: ChatMessage) => {
    if (msg.videoUrl) {
      if (msg.videoUrl.startsWith('blob:')) {
        void downloadByUrl(msg.videoUrl, msg.fileName || 'video');
        return;
      }
      void downloadMediaByBackend(msg.videoUrl, msg.fileName || 'video');
      return;
    }
    if (!msg.localFile) return;
    const localUrl = URL.createObjectURL(msg.localFile);
    downloadByUrl(localUrl, msg.localFile.name || 'video');
    window.setTimeout(() => {
      URL.revokeObjectURL(localUrl);
    }, 5000);
  };

  const canClaimRedPacket = (msg: ChatMessage) => {
    if (msg.type !== 'redpacket') return false;
    if ((msg.redPacketClaimedAmount || 0) > 0) return false;
    return msg.redPacketStatus === 'open';
  };

  const getRedPacketActionLabel = (msg: ChatMessage) => {
    if (msg.redPacketClaiming) return '开红包中...';
    if ((msg.redPacketClaimedAmount || 0) > 0) return `已领 ${msg.redPacketClaimedAmount} 积分`;
    if (msg.redPacketStatus === 'empty') return '已抢完';
    if (msg.redPacketStatus === 'expired' || msg.redPacketStatus === 'refunded') return '已过期';
    if (isOffline) return '离线不可领';
    return '立即抢红包';
  };

  const statusLabel = isGroup
    ? (onlineCount === null
      ? (memberCount === null ? '群聊' : `${memberCount} 人`)
      : `${onlineCount} 人在线`)
    : (
      <span className={`inline-flex items-center gap-1.5 ${privateOnline === true ? 'text-emerald-500' : 'text-slate-500'}`}>
        <span className={`inline-block h-1.5 w-1.5 rounded-full ${privateOnline === true ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
        <span>{privateOnline === true ? '在线' : privateOnline === false ? '离线' : '状态未知'}</span>
      </span>
    );

  return (
    <div className="fixed inset-0 z-[50] app-bg flex flex-col transition-colors duration-500">
      {/* Header */}
      <div
        className="flex-none glass-bg p-4 shadow-sm flex items-center justify-between border-b border-theme transition-colors duration-500 relative z-20"
        onDoubleClick={handleHeaderDoubleClick}
      >
         <div className="flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="text-slate-500 hover:text-[var(--text-primary)] mr-3 p-2 -ml-2 rounded-full transition-colors active:bg-white/10 cursor-pointer"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
               <h1 className="text-lg font-bold leading-none max-w-[200px] truncate" style={{color: 'var(--text-primary)'}}>{isGroup ? chatTitle : friendDisplayName}</h1>
               <span className="text-[10px] text-slate-500 flex items-center mt-0.5">
                 {statusLabel}
               </span>
            </div>
         </div>
         <button
           onClick={handleHeaderRightClick}
           className="text-slate-500 hover:text-[var(--text-primary)] p-2 -mr-2 rounded-full active:bg-white/10 transition-colors"
         >
           {isGroup ? (
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
             </svg>
           ) : (
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
             </svg>
           )}
         </button>
      </div>

      {!connected && !isImagePreviewOpen && !isVideoPreviewOpen && (
        <div className="flex-none bg-rose-500/10 border-b border-rose-500/20 text-rose-400 text-xs px-4 py-2 flex items-center gap-2">
          <span className="font-bold">离线</span>
          <span>消息发送失败可点击叹号重试</span>
        </div>
      )}

      {isGroup && (
        <div className="flex-none border-b border-theme bg-[var(--bg-card)]/80 backdrop-blur">
          <div className="px-4 py-2.5 flex items-start gap-3">
            <span className="text-[10px] uppercase tracking-wide text-slate-500 mt-1">公告</span>
            <div className="flex-1">
              {isAnnouncementLoading ? (
                <div className="text-xs text-slate-500">公告加载中...</div>
              ) : (
                <>
                  <div className={`text-sm leading-relaxed ${announcement?.content ? 'text-[var(--text-primary)]' : 'text-slate-500 italic'}`}>
                    {announcement?.content || '暂无公告'}
                  </div>
                  {announcement?.updatedAt ? (
                    <div className="text-[10px] text-slate-500 mt-1">
                      更新于 {formatAnnouncementTime(announcement.updatedAt)}
                    </div>
                  ) : null}
                </>
              )}
            </div>
            {announcement?.canEdit && !isAnnouncementLoading ? (
              <button
                onClick={openAnnouncementEditor}
                className="text-xs text-emerald-500 hover:text-emerald-400 transition-colors"
              >
                编辑
              </button>
            ) : null}
          </div>
        </div>
      )}

      {/* Message Area */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-transparent overscroll-contain"
        onClick={() => { setShowActionMenu(false); setShowEmojiPicker(false); }}
      >
         {isLoading ? (
            <div className="flex justify-center pt-10">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
            </div>
         ) : (
           <>
             {isLoadingMore && (
               <div className="text-center text-xs text-slate-500">加载中...</div>
             )}
             {!hasMore && (
               <div className="text-center text-xs text-slate-500">仅显示最近3天消息</div>
             )}
             <div className="text-center text-xs text-slate-500 my-4">昨天 10:00</div>
             {messages.map((msg) => (
               msg.type === 'tip' ? (
                 <div key={msg.id} className="flex justify-center mb-4 animate-fade-in-up">
                   <div className="px-3 py-1.5 rounded-full bg-white/10 border border-theme text-[11px] text-slate-300 max-w-[80%] text-center">
                     {msg.text}
                   </div>
                 </div>
               ) : (
                <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'} mb-4 animate-fade-in-up`}>
                   {msg.sender === 'other' && (
                      <div className="flex-shrink-0 mr-2 flex flex-col items-center">
                        <div
                           className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden shadow-sm border border-theme cursor-pointer active:scale-95 transition-transform"
                           onClick={(e) => { e.stopPropagation(); handleAvatarClick(msg); }}
                        >
                           <img
                             src={`https://picsum.photos/50/50?random=${isGroup ? (msg.senderName?.length || 0) + 10 : id}`}
                             alt="avatar"
                             className="w-full h-full object-cover"
                           />
                        </div>
                      </div>
                   )}

                   <div className="flex flex-col">
                      {msg.sender === 'other' && isGroup && (
                         <span className="text-[10px] text-slate-500 mb-1 ml-1">{msg.senderName || '群友'}</span>
                      )}

                      {msg.type === 'image' && msg.imageUrl ? (
                        <div className={`rounded-xl overflow-hidden border border-theme shadow-sm max-w-[220px] ${msg.sender === 'me' ? 'rounded-tr-sm' : 'rounded-tl-sm'}`}>
                          <button
                            type="button"
                            className="block w-full"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleOpenImage(msg);
                            }}
                          >
                            <img src={msg.imageUrl} alt="sent" className="w-full h-auto" />
                          </button>
                          <div className="px-2 py-1 bg-black/20 text-[10px] text-right text-slate-300 flex items-center justify-end gap-1">
                            {getMessageReadIndicator(msg) && (
                              <span className={getMessageReadIndicatorClass(msg)}>{getMessageReadIndicator(msg)}</span>
                            )}
                            <span>{msg.time}</span>
                          </div>
                        </div>
                      ) : msg.type === 'video' ? (
                        <div className={`max-w-[240px] rounded-xl overflow-hidden border border-theme shadow-sm ${msg.sender === 'me' ? 'rounded-tr-sm' : 'rounded-tl-sm'}`}>
                          <button
                            type="button"
                            className="w-full px-3 py-3 flex items-center gap-3 text-left bg-[var(--bg-card)]"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleOpenVideo(msg);
                            }}
                          >
                            <span className="text-2xl leading-none">🎬</span>
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-semibold truncate">视频消息</div>
                              <div className="text-[11px] text-slate-400 mt-1">点击打开播放</div>
                            </div>
                          </button>
                          <div className="flex items-center justify-end gap-3 px-2 py-1 bg-black/20 text-[10px]">
                            <button
                              type="button"
                              className="text-slate-200 hover:text-white"
                              onClick={(event) => {
                                event.stopPropagation();
                                handleSaveVideo(msg);
                              }}
                            >
                              保存
                            </button>
                            {getMessageReadIndicator(msg) && (
                              <span className={getMessageReadIndicatorClass(msg)}>{getMessageReadIndicator(msg)}</span>
                            )}
                            <span className="text-slate-300">{msg.time}</span>
                          </div>
                        </div>
                      ) : msg.type === 'file' ? (
                        <button
                          type="button"
                          className={`max-w-[75vw] px-4 py-3 rounded-2xl text-left shadow-sm border transition-all ${
                            msg.sender === 'me'
                              ? 'bg-accent-gradient text-black rounded-tr-sm border-transparent'
                              : 'card-bg text-[var(--text-primary)] border border-theme rounded-tl-sm'
                          } ${msg.fileUrl || msg.localFile ? 'hover:brightness-110 active:scale-[0.99]' : ''}`}
                          onClick={(event) => {
                            event.stopPropagation();
                            handleOpenFile(msg);
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-2xl leading-none">📁</span>
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-semibold break-all">{msg.fileName || '文件'}</div>
                              <div className={`text-[11px] mt-1 ${msg.sender === 'me' ? 'text-black/70' : 'text-slate-400'}`}>
                                {formatFileSize(msg.fileSize) || msg.fileType || '文件'}
                              </div>
                            </div>
                          </div>
                          <div className={`text-[9px] mt-2 text-right opacity-60 flex items-center justify-end gap-1 ${msg.sender === 'me' ? 'text-black' : 'text-slate-400'}`}>
                            {getMessageReadIndicator(msg) && (
                              <span className={getMessageReadIndicatorClass(msg)}>{getMessageReadIndicator(msg)}</span>
                            )}
                            <span>{msg.time}</span>
                          </div>
                        </button>
                      ) : msg.type === 'redpacket' ? (
                        <button
                          type="button"
                          className={`max-w-[75vw] px-4 py-3 rounded-2xl text-left shadow-sm border transition-all ${
                            msg.sender === 'me'
                              ? 'bg-gradient-to-br from-rose-500 to-orange-500 text-white border-transparent rounded-tr-sm'
                              : 'bg-gradient-to-br from-red-500/90 to-orange-500/90 text-white border-red-300/20 rounded-tl-sm'
                          } hover:brightness-110 active:scale-[0.99]`}
                          onClick={(event) => {
                            event.stopPropagation();
                            openRedPacketOpenCard(msg);
                          }}
                        >
                          <div className="flex items-start gap-3">
                            {msg.redPacketClaiming ? (
                              <span className="w-7 h-7 rounded-full border border-white/40 border-t-transparent animate-spin inline-block"></span>
                            ) : (
                              <span className="text-2xl leading-none">🧧</span>
                            )}
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-semibold truncate">{msg.redPacketGreeting || '恭喜发财，大吉大利'}</div>
                              <div className="text-[11px] mt-1 opacity-95">{msg.redPacketTitle || getRedPacketActionLabel(msg)}</div>
                            </div>
                          </div>
                          <div className="mt-2 pt-2 border-t border-white/20 flex items-center justify-between text-[10px]">
                            <span>{getRedPacketActionLabel(msg)}</span>
                            <span>{msg.time}</span>
                          </div>
                          {msg.redPacketError && (
                            <div className="mt-2 text-[10px] text-rose-100">{msg.redPacketError}</div>
                          )}
                        </button>
                      ) : (
                        <div
                          className={`max-w-[75vw] px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm break-words relative group ${
                             msg.sender === 'me'
                             ? 'bg-accent-gradient text-black rounded-tr-sm'
                             : 'card-bg text-[var(--text-primary)] border border-theme rounded-tl-sm'
                          }`}
                        >
                          {msg.text}
                          <div className={`text-[9px] mt-1 text-right opacity-60 flex items-center justify-end gap-1 ${msg.sender === 'me' ? 'text-black' : 'text-slate-400'}`}>
                             {getMessageReadIndicator(msg) && (
                               <span className={getMessageReadIndicatorClass(msg)}>{getMessageReadIndicator(msg)}</span>
                             )}
                             <span>{msg.time}</span>
                          </div>
                        </div>
                      )}
                   </div>

                   {msg.sender === 'me' && msg.status === 'failed' && (
                     <button
                       onClick={(e) => { e.stopPropagation(); handleRetryMessage(msg); }}
                       className="ml-2 w-6 h-6 rounded-full border border-rose-500/40 text-rose-400 flex items-center justify-center text-xs font-bold hover:bg-rose-500/10"
                       title="点击重发"
                     >
                       !
                     </button>
                   )}

                   {msg.sender === 'me' && (
                     <div className="flex-shrink-0 ml-2">
                        <div className="w-10 h-10 rounded-full bg-slate-800 overflow-hidden shadow-sm border border-theme">
                          <img
                            src={user?.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${user?.username || 'user'}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                     </div>
                   )}
                </div>
               )
             ))}
             <div ref={endRef} />
           </>
         )}
      </div>

      {/* Input Area */}
      <div className="flex-none z-20">
        <div className="p-3 pb-4 glass-bg border-t border-theme">
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={handleImageInputChange}
          />
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileInputChange}
          />
          <div className="flex items-center space-x-2">
              <button
                onClick={toggleActionMenu}
                className={`p-2 rounded-full border transition-all duration-300 ${
                  showActionMenu
                  ? 'bg-accent-gradient text-black border-transparent rotate-45'
                  : 'card-bg text-slate-500 border-theme hover:text-accent'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
              <div className="flex-1 bg-[var(--bg-primary)] rounded-full px-4 py-2 border border-theme focus-within:border-accent/50 transition-all flex items-center">
                <input
                  type="text"
                  value={inputText}
                  onFocus={handleInputFocus}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="发送消息..."
                  className="flex-1 bg-transparent border-none outline-none text-sm text-[var(--text-primary)] placeholder-slate-500"
                />
                <button
                  onClick={toggleEmojiPicker}
                  className={`text-slate-400 hover:text-accent transition-colors ${showEmojiPicker ? 'text-accent' : ''}`}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </button>
              </div>
              <button
                onClick={handleSend}
                disabled={!inputText.trim()}
                className={`p-2.5 rounded-full transition-all shadow-lg ${
                  inputText.trim()
                  ? 'bg-accent-gradient text-black hover:scale-105 active:scale-95'
                  : 'card-bg text-slate-500 border border-theme'
                }`}
              >
                <svg className="w-5 h-5 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
          </div>
        </div>

        {/* Expandable Panel */}
        {(showActionMenu || showEmojiPicker) && (
          <div className="h-64 bg-[var(--bg-card)] border-t border-theme overflow-y-auto animate-fade-in-up no-scrollbar pb-6">
             {showActionMenu && (
               <div className="grid grid-cols-4 gap-6 p-6">
                  {ACTION_ITEMS.map((item) => (
                    <div key={item.name} onClick={() => handleActionItemClick(item)} className="flex flex-col items-center gap-2 cursor-pointer group">
                       <div className="w-14 h-14 bg-[var(--bg-primary)] rounded-2xl flex items-center justify-center text-2xl border border-theme shadow-sm group-hover:bg-white/5 transition-colors group-active:scale-95">
                          {item.icon}
                       </div>
                       <span className="text-xs text-slate-500">{item.name}</span>
                    </div>
                  ))}
               </div>
             )}

             {showEmojiPicker && (
               <div className="p-4 grid grid-cols-8 gap-2">
                  {EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => handleEmojiClick(emoji)}
                      className="text-2xl hover:bg-white/10 rounded-lg p-2 transition-colors active:scale-90"
                    >
                      {emoji}
                    </button>
                  ))}
               </div>
             )}
          </div>
        )}
      </div>

      {isImagePreviewOpen && (
        <div className="fixed inset-0 z-[95] bg-black/95 flex flex-col" onClick={closeImagePreview}>
          <div className="flex-1 flex items-center justify-center p-4">
            {imagePreviewUrl ? (
              <img src={imagePreviewUrl} alt="preview" className="max-w-[92vw] max-h-[80vh] object-contain rounded-lg" />
            ) : null}
          </div>
        </div>
      )}

      {isVideoPreviewOpen && (
        <div className="fixed inset-0 z-[96] bg-black/95 flex flex-col" onClick={closeVideoPreview}>
          <div className="flex-1 flex items-center justify-center p-4">
            {videoPreviewUrl ? (
              <video
                src={videoPreviewUrl}
                controls
                playsInline
                preload="metadata"
                onClick={(event) => event.stopPropagation()}
                className="max-w-[92vw] max-h-[80vh] rounded-lg bg-black"
              />
            ) : null}
          </div>
        </div>
      )}

      {showMemberMenu && isGroup && (
        <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowMemberMenu(false)}
          ></div>
          <div className="relative w-full sm:max-w-sm card-bg rounded-t-2xl sm:rounded-2xl p-5 border border-theme shadow-2xl animate-fade-in-up">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">成员操作</h3>
                <p className="text-xs text-slate-500 mt-1">{memberDisplayName}</p>
              </div>
              {isMemberLoading && (
                <span className="text-[10px] text-slate-500">资料加载中...</span>
              )}
            </div>

            {memberActionError && (
              <div className="mt-3 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-3 py-2">
                {memberActionError}
              </div>
            )}

            {memberActionSuccess && (
              <div className="mt-3 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2">
                {memberActionSuccess}
              </div>
            )}

            <div className="mt-4 space-y-2">
              <button
                onClick={handleViewMemberProfile}
                className="w-full bg-accent-gradient text-black font-bold py-3 rounded-xl shadow-lg active:scale-95 transition-transform"
              >
                查看资料
              </button>
              {canStartPrivateChat && (
                <button
                  onClick={handleStartPrivateChat}
                  className="w-full py-3 rounded-xl border border-theme text-sm text-[var(--text-primary)] hover:bg-white/5 transition-colors"
                >
                  发起对话
                </button>
              )}
              <button
                onClick={handleSendFriendRequest}
                disabled={isMemberRequesting || memberIsFriend || !selectedMemberNumericId}
                className={`w-full text-white font-bold py-3 rounded-xl bg-emerald-500/90 ${isMemberRequesting || memberIsFriend || !selectedMemberNumericId ? 'opacity-60 cursor-not-allowed' : 'active:scale-95 transition-transform'}`}
              >
                {memberIsFriend ? '已是好友' : (isMemberRequesting ? '发送中...' : '加好友')}
              </button>
              <button
                onClick={() => setShowMemberMenu(false)}
                className="w-full py-2.5 rounded-xl border border-theme text-sm text-slate-400 hover:text-[var(--text-primary)] transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {showMemberProfile && isGroup && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center px-6">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowMemberProfile(false)}
          ></div>
          <div className="relative w-full max-w-sm card-bg rounded-[24px] p-6 border border-theme shadow-2xl animate-fade-in-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>成员资料</h3>
              <button
                onClick={() => setShowMemberProfile(false)}
                className="text-slate-500 hover:text-slate-300 p-1"
              >
                关闭
              </button>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full overflow-hidden border border-theme">
                <img
                  src={memberProfile?.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${selectedMemberNumericId || 'member'}`}
                  alt="avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="text-base font-bold text-[var(--text-primary)]">{memberDisplayName}</div>
                <div className="text-xs text-slate-500">ID: {selectedMemberNumericId || '-'}</div>
              </div>
            </div>
            <div className="mt-4 space-y-2 text-xs text-slate-500">
              <div className="flex items-center justify-between">
                <span>用户名</span>
                <span className="text-[var(--text-primary)]">{memberProfile?.username || memberDisplayName}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {showFriendMenu && !isGroup && (
        <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center px-3 pb-3 sm:px-0 sm:pb-0">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowFriendMenu(false)}
          ></div>
          <div className="relative w-full sm:max-w-md card-bg rounded-[22px] p-5 border border-theme shadow-2xl animate-fade-in-up">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 rounded-full overflow-hidden border border-theme flex-shrink-0">
                  <img
                    src={friendProfile?.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${friendId || 'friend'}`}
                    alt="friend-avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-[var(--text-primary)]">好友操作</h3>
                  <p className="text-sm font-medium text-[var(--text-primary)] truncate mt-0.5">{friendDisplayName}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">ID: {hasFriendId ? friendId : '-'}</p>
                </div>
              </div>
              {isProfileLoading && (
                <span className="text-[10px] text-slate-500 flex-shrink-0">资料加载中...</span>
              )}
            </div>

            {friendActionError && (
              <div className="mt-3 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-3 py-2">
                {friendActionError}
              </div>
            )}

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                onClick={handleViewFriendProfile}
                className="col-span-1 bg-accent-gradient text-black font-semibold py-3 rounded-xl shadow-lg active:scale-95 transition-transform"
              >
                查看资料
              </button>
              <button
                onClick={handleSetFriendRemark}
                disabled={isUpdatingFriendRemark || !hasFriendId}
                className={`col-span-1 py-3 rounded-xl border border-theme text-sm font-medium text-[var(--text-primary)] hover:bg-white/5 transition-colors ${isUpdatingFriendRemark || !hasFriendId ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                {isUpdatingFriendRemark ? '保存中...' : '好友备注'}
              </button>
            </div>
            <div className="mt-2 space-y-2">
              <button
                onClick={handleOpenAutoDeleteSheet}
                className="w-full py-3 rounded-xl border border-theme text-sm font-medium text-[var(--text-primary)] hover:bg-white/5 transition-colors flex items-center justify-between px-4"
              >
                <span>自动删除消息</span>
                <span className="text-slate-400 text-xs">{isAutoDeleteLoading ? '加载中...' : autoDeleteLabel}</span>
              </button>
              <button
                onClick={handleRemoveFriend}
                disabled={isRemovingFriend || !hasFriendId}
                className={`w-full text-white font-semibold py-3 rounded-xl bg-rose-500/90 ${isRemovingFriend || !hasFriendId ? 'opacity-60 cursor-not-allowed' : 'active:scale-95 transition-transform'}`}
              >
                {isRemovingFriend ? '删除中...' : '删除好友'}
              </button>
              <button
                onClick={() => setShowFriendMenu(false)}
                className="w-full py-2.5 rounded-xl border border-theme text-sm text-slate-400 hover:text-[var(--text-primary)] transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {showFriendProfile && !isGroup && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center px-6">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowFriendProfile(false)}
          ></div>
          <div className="relative w-full max-w-sm card-bg rounded-[24px] p-6 border border-theme shadow-2xl animate-fade-in-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>好友资料</h3>
              <button
                onClick={() => setShowFriendProfile(false)}
                className="text-slate-500 hover:text-slate-300 p-1"
              >
                关闭
              </button>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full overflow-hidden border border-theme">
                <img
                  src={friendProfile?.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${friendId || 'friend'}`}
                  alt="avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="text-base font-bold text-[var(--text-primary)]">{friendDisplayName}</div>
                <div className="text-xs text-slate-500">ID: {hasFriendId ? friendId : '-'}</div>
              </div>
            </div>
            <div className="mt-4 space-y-2 text-xs text-slate-500">
              <div className="flex items-center justify-between">
                <span>用户名</span>
                <span className="text-[var(--text-primary)]">{friendProfile?.username || '-'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>手机号</span>
                <span className="text-[var(--text-primary)]">{friendProfile?.phone || '-'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>备注</span>
                <span className="text-[var(--text-primary)]">{friendProfile?.displayName || '-'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAutoDeleteSheet && !isGroup && (
        <div className="fixed inset-0 z-[85] flex items-end sm:items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => !isAutoDeleteLoading && setShowAutoDeleteSheet(false)}
          ></div>
          <div className="relative w-full sm:max-w-sm card-bg rounded-t-2xl sm:rounded-2xl p-5 border border-theme shadow-2xl animate-fade-in-up">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">自动删除消息</h3>
                <p className="text-xs text-slate-500 mt-1">仅对后续新消息生效</p>
              </div>
              {isAutoDeleteLoading && (
                <span className="text-[10px] text-slate-500">处理中...</span>
              )}
            </div>

            {autoDeleteError && (
              <div className="mt-3 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-3 py-2">
                {autoDeleteError}
              </div>
            )}

            <div className="mt-4 space-y-2">
              {AUTO_DELETE_OPTIONS.map((option) => {
                const active = (autoDeletePolicy?.seconds || 0) === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => handleSetAutoDelete(option.value)}
                    disabled={isAutoDeleteLoading || !autoDeletePolicy?.canEdit}
                    className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-colors ${active ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400' : 'border-theme text-[var(--text-primary)] hover:bg-white/5'} ${isAutoDeleteLoading || !autoDeletePolicy?.canEdit ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    {option.label}
                  </button>
                );
              })}
              {!autoDeletePolicy?.canEdit && (
                <div className="text-xs text-slate-500 bg-white/5 border border-theme rounded-xl px-3 py-2">
                  当前会话无权修改自动删除设置
                </div>
              )}
              <button
                onClick={() => setShowAutoDeleteSheet(false)}
                disabled={isAutoDeleteLoading}
                className="w-full py-2.5 rounded-xl border border-theme text-sm text-slate-400 hover:text-[var(--text-primary)] transition-colors"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {isAnnouncementEditorOpen && (
        <div className="fixed inset-0 z-[70] bg-black/40 flex items-end sm:items-center justify-center">
          <div className="w-full sm:max-w-md bg-[var(--bg-card)] border border-theme rounded-t-2xl sm:rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">编辑群公告</h2>
              <button
                onClick={closeAnnouncementEditor}
                className="text-slate-500 hover:text-[var(--text-primary)] transition-colors"
              >
                关闭
              </button>
            </div>
            <textarea
              value={announcementDraft}
              onChange={(e) => setAnnouncementDraft(e.target.value)}
              maxLength={MAX_ANNOUNCEMENT_LENGTH}
              rows={4}
              className="w-full bg-[var(--bg-primary)] border border-theme rounded-xl p-3 text-sm text-[var(--text-primary)] placeholder-slate-500 focus:outline-none focus:border-emerald-500/60 resize-none"
              placeholder="填写群公告（最多100字）"
            />
            <div className="flex items-center justify-between mt-2 text-[10px] text-slate-500">
              <span>{announcementError || '仅群主/管理员可修改公告'}</span>
              <span className={announcementRemaining < 0 ? 'text-rose-400' : ''}>
                {announcementRemaining} 字剩余
              </span>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={closeAnnouncementEditor}
                className="flex-1 py-2 rounded-full border border-theme text-sm text-slate-400 hover:text-[var(--text-primary)] transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleAnnouncementSave}
                disabled={announcementRemaining < 0 || isAnnouncementSaving}
                className={`flex-1 py-2 rounded-full text-sm font-semibold transition-all ${
                  announcementRemaining < 0 || isAnnouncementSaving
                    ? 'bg-slate-700/60 text-slate-400'
                    : 'bg-emerald-400 text-black hover:brightness-105'
                }`}
              >
                {isAnnouncementSaving ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isRedPacketModalOpen && (
        <div className="fixed inset-0 z-[75] flex items-end sm:items-center justify-center">
          <div
            className="absolute inset-0 bg-black/55 backdrop-blur-sm"
            onClick={closeRedPacketModal}
          ></div>
          <div className="relative w-full sm:max-w-md card-bg rounded-t-2xl sm:rounded-2xl p-5 border border-theme shadow-2xl animate-fade-in-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-[var(--text-primary)]">发红包</h3>
              <button
                onClick={closeRedPacketModal}
                disabled={isRedPacketSending}
                className="text-xs text-slate-400 hover:text-[var(--text-primary)] transition-colors disabled:opacity-60"
              >
                关闭
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-xs text-slate-500 mb-2">红包类型</div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setRedPacketType('random')}
                    className={`py-2.5 rounded-xl border text-sm transition-colors ${redPacketType === 'random' ? 'bg-accent-gradient text-black border-transparent font-semibold' : 'border-theme text-[var(--text-primary)] hover:bg-white/5'}`}
                  >
                    拼手气
                  </button>
                  <button
                    onClick={() => setRedPacketType('fixed')}
                    className={`py-2.5 rounded-xl border text-sm transition-colors ${redPacketType === 'fixed' ? 'bg-accent-gradient text-black border-transparent font-semibold' : 'border-theme text-[var(--text-primary)] hover:bg-white/5'}`}
                  >
                    普通红包
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="text-xs text-slate-500 mb-1">总金额(积分)</div>
                  <input
                    type="number"
                    min={RED_PACKET_MIN_AMOUNT}
                    max={RED_PACKET_MAX_AMOUNT}
                    value={redPacketAmount}
                    onChange={(event) => setRedPacketAmount(event.target.value)}
                    className="w-full bg-[var(--bg-primary)] border border-theme rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-rose-400/60"
                    placeholder="如 100"
                  />
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">份数</div>
                  <input
                    type="number"
                    min={RED_PACKET_MIN_COUNT}
                    max={RED_PACKET_MAX_COUNT}
                    value={redPacketCount}
                    onChange={(event) => setRedPacketCount(event.target.value)}
                    className="w-full bg-[var(--bg-primary)] border border-theme rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-rose-400/60"
                    placeholder="如 10"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span>祝福语</span>
                  <span>{Array.from(redPacketGreeting).length}/{RED_PACKET_MAX_GREETING}</span>
                </div>
                <input
                  type="text"
                  maxLength={RED_PACKET_MAX_GREETING}
                  value={redPacketGreeting}
                  onChange={(event) => setRedPacketGreeting(event.target.value)}
                  className="w-full bg-[var(--bg-primary)] border border-theme rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-rose-400/60"
                  placeholder="恭喜发财，大吉大利"
                />
              </div>

              <div className="text-[11px] text-slate-500 bg-[var(--bg-primary)] border border-theme rounded-xl px-3 py-2">
                规则：金额 {RED_PACKET_MIN_AMOUNT}-{RED_PACKET_MAX_AMOUNT}，份数 {RED_PACKET_MIN_COUNT}-{RED_PACKET_MAX_COUNT}；抢完或过期后不可领取。
              </div>

              {redPacketError && (
                <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-3 py-2">
                  {redPacketError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={closeRedPacketModal}
                  disabled={isRedPacketSending}
                  className="py-2.5 rounded-xl border border-theme text-sm text-slate-400 hover:text-[var(--text-primary)] transition-colors disabled:opacity-60"
                >
                  取消
                </button>
                <button
                  onClick={handleSendRedPacket}
                  disabled={isRedPacketSending}
                  className={`py-2.5 rounded-xl text-sm font-bold transition-all ${isRedPacketSending ? 'bg-slate-700/60 text-slate-400' : 'bg-gradient-to-r from-rose-500 to-orange-500 text-white hover:brightness-105 active:scale-95'}`}
                >
                  {isRedPacketSending ? '发送中...' : '确认发送'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isRedPacketOpenCardOpen && activeRedPacketMessage && (
        <div className="fixed inset-0 z-[84] flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeRedPacketOpenCard}
          ></div>
          <div className="relative w-full max-w-sm rounded-[28px] overflow-hidden shadow-2xl border border-rose-300/20 bg-gradient-to-br from-rose-600 via-red-500 to-orange-500 text-white animate-fade-in-up">
            <div className="px-6 pt-8 pb-6 text-center">
              <div className="w-14 h-14 mx-auto rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-2xl mb-3">
                🧧
              </div>
              <div className="text-sm text-rose-100">{redPacketOpenCardSenderName || '群友'} 发出的红包</div>
              <div className="mt-2 text-lg font-semibold">{activeRedPacketMessage.redPacketGreeting || '恭喜发财，大吉大利'}</div>
              <div className="mt-2 text-xs text-rose-100">{activeRedPacketMessage.redPacketTitle || getRedPacketActionLabel(activeRedPacketMessage)}</div>
            </div>

            <div className="px-6 pb-7">
              <button
                onClick={handleOpenCardClaim}
                disabled={activeRedPacketMessage.redPacketClaiming || !canClaimRedPacket(activeRedPacketMessage)}
                className={`w-28 h-28 rounded-full mx-auto flex items-center justify-center text-3xl font-bold border-4 shadow-lg transition-all ${activeRedPacketMessage.redPacketClaiming ? 'bg-white/10 border-white/40 text-white/90' : (!canClaimRedPacket(activeRedPacketMessage) ? 'bg-white/10 border-white/30 text-white/60' : 'bg-white text-red-500 border-amber-300 hover:scale-105 active:scale-95')}`}
              >
                {activeRedPacketMessage.redPacketClaiming ? (
                  <span className="w-10 h-10 rounded-full border-4 border-red-200 border-t-transparent animate-spin inline-block"></span>
                ) : (
                  '抢'
                )}
              </button>

              <div className="mt-4 text-center text-sm text-rose-100">
                {activeRedPacketMessage.redPacketClaiming ? '开红包中...' : (canClaimRedPacket(activeRedPacketMessage) ? '点击“抢”立即开红包' : getRedPacketActionLabel(activeRedPacketMessage))}
              </div>

              {activeRedPacketMessage.redPacketError && (
                <div className="mt-3 text-center text-xs text-rose-100">{activeRedPacketMessage.redPacketError}</div>
              )}

              <div className="mt-5 pt-4 border-t border-white/20 flex items-center justify-center gap-6 text-sm">
                <button
                  onClick={closeRedPacketOpenCard}
                  className="text-rose-100 hover:text-white transition-colors"
                >
                  关闭
                </button>
                <button
                  onClick={handleOpenCardViewDetail}
                  className="text-rose-100 hover:text-white transition-colors"
                >
                  查看详情
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isRedPacketDetailOpen && (
        <div className="fixed inset-0 z-[85] flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeRedPacketDetail}
          ></div>
          <div className="relative w-full max-w-md card-bg rounded-2xl border border-theme shadow-2xl animate-fade-in-up max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">红包详情</h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => refreshRedPacketPanel(redPacketDetailId).catch(() => null)}
                  disabled={isRedPacketDetailLoading || isRedPacketClaimsLoading}
                  className="text-[11px] text-slate-400 hover:text-[var(--text-primary)] transition-colors disabled:opacity-60"
                >
                  刷新
                </button>
                <button
                  onClick={closeRedPacketDetail}
                  className="text-[11px] text-slate-400 hover:text-[var(--text-primary)] transition-colors"
                >
                  关闭
                </button>
              </div>
            </div>

            {redPacketDetailError && (
              <div className="mx-4 mb-3 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-3 py-2">
                {redPacketDetailError}
              </div>
            )}

            {isRedPacketDetailLoading && !redPacketDetailData ? (
              <div className="text-sm text-slate-500 py-8 text-center">加载中...</div>
            ) : redPacketDetailData ? (
              <>
                <div className="mx-4 rounded-xl border border-rose-300/20 bg-gradient-to-br from-rose-500 to-orange-500 px-4 py-4 mb-4 text-white">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-white/30 bg-white/20">
                      <img
                        src={redPacketDetailData.sender?.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${redPacketDetailData.sender?.userId || 'sender'}`}
                        alt="sender-avatar"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-xs text-rose-50 truncate max-w-[180px]">
                      {(redPacketDetailData.sender?.username || '群友')} 的红包
                    </span>
                  </div>

                  <div className="mt-3 text-center text-sm font-medium">{redPacketDetailData.greeting || '恭喜发财，大吉大利'}</div>

                  <div className="mt-4 text-center">
                    {redPacketDetailData.myClaimStatus === 'claimed' ? (
                      <>
                        <div className="text-[11px] text-rose-100">你已领取</div>
                        <div className="mt-1 text-3xl font-bold leading-none">
                          {redPacketDetailData.myClaimedAmount}
                          <span className="text-sm ml-1 font-medium">积分</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-[11px] text-rose-100">领取状态</div>
                        <div className="mt-1 text-lg font-semibold">{resolveRedPacketStatusText(redPacketDetailData.status)}</div>
                      </>
                    )}
                  </div>

                  <div className="mt-4 text-[11px] text-rose-50 flex items-center justify-between">
                    <span>已领 {redPacketDetailData.totalCount - redPacketDetailData.remainingCount}/{redPacketDetailData.totalCount} 份</span>
                    <span>剩余 {redPacketDetailData.remainingAmount} 积分</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-2 px-4">
                  <div className="text-sm font-medium text-[var(--text-primary)]">领取记录</div>
                  <div className="text-[10px] text-slate-500">金额从高到低</div>
                </div>

                {isRedPacketClaimsLoading ? (
                  <div className="text-xs text-slate-500 py-4 text-center">领取记录加载中...</div>
                ) : redPacketClaimItems.length === 0 ? (
                  <div className="text-xs text-slate-500 py-4 text-center">暂无领取记录</div>
                ) : (
                  <div className="space-y-2 px-4 pb-4">
                    {redPacketClaimItems.map((item, index) => (
                      <div key={`${item.claimerId}-${item.claimedAt}-${index}`} className="rounded-xl border border-theme px-3 py-2 bg-[var(--bg-primary)]">
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0 flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full overflow-hidden border border-theme bg-slate-700/30 flex-shrink-0">
                              <img
                                src={item.claimerAvatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${item.claimerId}`}
                                alt="claimer-avatar"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm text-[var(--text-primary)] truncate flex items-center gap-1">
                                <span>{item.claimerName || `用户${item.claimerId}`}</span>
                                {index === 0 && redPacketClaimItems.length > 1 && (
                                  <span className="text-[9px] px-1 py-[1px] rounded bg-amber-400/20 text-amber-300">手气最佳</span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-500">{formatRedPacketClaimTime(item)}</div>
                            </div>
                          </div>
                          <div className="text-sm font-semibold text-rose-400">{item.amount} 积分</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="text-sm text-slate-500 py-8 text-center">暂无红包详情</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;

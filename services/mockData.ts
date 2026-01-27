
import { Game, TradeItem, Article, Task, Message, SystemNotification, Interaction, GroupRecommendation } from '../types';

export const GAMES: Game[] = [
  {
    id: '1',
    title: '古剑奇谭在线版',
    category: 'MMORPG',
    icon: 'https://picsum.photos/100/100?random=1',
    rating: 4.8,
    downloads: '120万',
    tags: ['3D', '仙侠', '动作'],
    description: '沉浸式东方幻想MMORPG，拥有惊艳的画面和动态战斗系统。',
    intro: '《古剑奇谭在线版》是一款次世代国风仙侠网游。游戏采用了先进的引擎技术，打造了一个气势恢宏、生动真实的东方幻想世界。玩家可以选择不同的门派，习得绝世武功，与好友组队探索神秘的副本，挑战强大的上古神兽。游戏中还有丰富的休闲玩法，如烹饪、垂钓、抚琴等，让你在修仙之余也能享受片刻宁静。',
    images: ['https://picsum.photos/400/200?random=101', 'https://picsum.photos/400/200?random=102', 'https://picsum.photos/400/200?random=103', 'https://picsum.photos/400/200?random=104'],
    banner: 'https://picsum.photos/800/400?random=100',
    downloadUrl: 'https://example.com/download/gujian',
    size: '15.4 GB',
    version: '2.1.0',
    developer: '上海烛龙'
  },
  {
    id: '2',
    title: '赛博飞车 2077',
    category: '竞速',
    icon: 'https://picsum.photos/100/100?random=2',
    rating: 4.5,
    downloads: '85万',
    tags: ['科幻', '极速', '多人'],
    description: '在霓虹闪烁的未来都市中进行极速竞速。',
    intro: '欢迎来到2077年的夜之城，这里是极速者的天堂。驾驶经过深度改装的反重力赛车，在摩天大楼之间穿梭，体验肾上腺素飙升的快感。游戏支持多人在线竞技，你可以定制赛车的外观和性能，成为赛道上的传奇。',
    images: ['https://picsum.photos/400/200?random=201', 'https://picsum.photos/400/200?random=202'],
    banner: 'https://picsum.photos/800/400?random=200',
    downloadUrl: 'https://example.com/download/cyberracer',
    size: '4.2 GB',
    version: '1.0.5',
    developer: 'Neon Speed Studio'
  },
  {
    id: '3',
    title: '王国保卫战',
    category: '策略',
    icon: 'https://picsum.photos/100/100?random=3',
    rating: 4.7,
    downloads: '210万',
    tags: ['塔防', '休闲'],
    description: '抵御怪物大军，保卫你的王国。',
    intro: '经典的塔防游戏回归！指挥你的军队，建造防御塔，施放强大的法术，抵御兽人、巨魔、邪恶巫师和其他恶魔的进攻。游戏包含多个关卡和挑战模式，考验你的战略智慧。',
    images: ['https://picsum.photos/400/200?random=301', 'https://picsum.photos/400/200?random=302'],
    banner: 'https://picsum.photos/800/400?random=300',
    downloadUrl: 'https://example.com/download/kingdomrush',
    size: '800 MB',
    version: '4.2.1',
    developer: 'Ironhide'
  },
  {
    id: '4',
    title: '动漫高校模拟',
    category: '模拟',
    icon: 'https://picsum.photos/100/100?random=4',
    rating: 4.2,
    downloads: '50万',
    tags: ['二次元', '生活模拟'],
    description: '在这款动漫模拟游戏中体验梦想中的高中生活。',
    intro: '高度自由的校园模拟游戏。你可以上课、参加社团活动、结交朋友，甚至谈一场轰轰烈烈的恋爱。或者，你也可以装备喷气背包，在校园里大搞破坏。你的高中生活，由你自己定义。',
    images: ['https://picsum.photos/400/200?random=401', 'https://picsum.photos/400/200?random=402'],
    banner: 'https://picsum.photos/800/400?random=400',
    downloadUrl: 'https://example.com/download/schoolsim',
    size: '1.5 GB',
    version: '1.8.0',
    developer: 'Sakura Soft'
  },
  {
    id: '5',
    title: '太空指挥官',
    category: '科幻',
    icon: 'https://picsum.photos/100/100?random=5',
    rating: 4.9,
    downloads: '30万',
    tags: ['太空', '策略'],
    description: '率领你的舰队征服银河系。',
    intro: '在这款宏大的太空战略游戏中，你将扮演一名舰队指挥官。探索未知的星系，建立资源基地，组建无敌舰队。与全服玩家争夺星际霸权，组建联盟，改写银河系的历史。',
    images: ['https://picsum.photos/400/200?random=501', 'https://picsum.photos/400/200?random=502'],
    banner: 'https://picsum.photos/800/400?random=500',
    downloadUrl: 'https://example.com/download/spacecmd',
    size: '3.8 GB',
    version: '0.9.5',
    developer: 'Star Forge'
  }
];

export const TRADE_ITEMS: TradeItem[] = [
  {
    id: 't1',
    title: '80级狂战士 - 全套史诗装备',
    price: 150.00,
    gameName: '古剑奇谭在线版',
    seller: 'ProGamer123',
    image: 'https://picsum.photos/200/200?random=20',
    server: 'S1-龙腾',
    type: 'Account'
  },
  {
    id: 't2',
    title: '100万 金币',
    price: 10.50,
    gameName: '王国保卫战',
    seller: 'GoldFarmer',
    image: 'https://picsum.photos/200/200?random=21',
    server: '全区全服',
    type: 'Currency'
  },
  {
    id: 't3',
    title: '稀有龙坐骑皮肤',
    price: 45.00,
    gameName: '古剑奇谭在线版',
    seller: 'SkinTrader',
    image: 'https://picsum.photos/200/200?random=22',
    server: 'S1-龙腾',
    type: 'Item'
  }
];

export const ARTICLES: Article[] = [
  {
    id: 'a1',
    title: '2.0 版本更新公告：新增团队副本Boss',
    author: '官方团队',
    views: 12050,
    comments: 342,
    image: 'https://picsum.photos/300/150?random=30',
    timestamp: '2小时前',
    tag: '新闻'
  },
  {
    id: 'a2',
    title: '新手必看：十大策略技巧',
    author: '攻略大师',
    views: 5400,
    comments: 89,
    image: 'https://picsum.photos/300/150?random=31',
    timestamp: '1天前',
    tag: '攻略'
  },
  {
    id: 'a3',
    title: '社区同人画作大赛获奖名单',
    author: '社区经理',
    views: 8900,
    comments: 150,
    image: 'https://picsum.photos/300/150?random=32',
    timestamp: '3天前',
    tag: '活动'
  }
];

export const TASKS: Task[] = [
  {
    id: 'tk1',
    title: '每日登录',
    reward: '10 积分',
    status: 'claimed',
    icon: '📅'
  },
  {
    id: 'tk2',
    title: '试玩《古剑奇谭》10分钟',
    reward: '50 积分',
    status: 'pending',
    icon: '🎮'
  },
  {
    id: 'tk3',
    title: '分享游戏给好友',
    reward: '20 积分',
    status: 'completed',
    icon: '🔗'
  }
];

export const MESSAGES: Message[] = [
  {
    id: 'g1',
    title: '贪玩盒子 官方交流群',
    content: '管理员: 欢迎新加入的小伙伴！请查看群公告。',
    time: '10:25',
    type: 'group',
    read: false,
    members: 1205,
    avatar: 'https://picsum.photos/100/100?random=g1'
  },
  {
    id: 'm3',
    title: '交易助手',
    content: '您关注的商品价格已更新。',
    time: '09:15',
    type: 'social',
    read: true
  },
  {
    id: 'g2',
    title: '古剑奇谭-龙腾公会',
    content: '会长-龙傲天: 今晚8点公会战，准时上线！',
    time: '昨天',
    type: 'group',
    read: true,
    members: 88,
    avatar: 'https://picsum.photos/100/100?random=g2'
  }
];

export const SYSTEM_NOTIFICATIONS: SystemNotification[] = [
  { id: 1, title: '版本更新完成', content: '贪玩盒子 2.1 版本已上线，优化了交易体验。', time: '10:00', level: 'info', read: false },
  { id: 2, title: '安全警告', content: '检测到您的异地登录尝试，请确认是否为本人操作。', time: '昨天', level: 'warning', read: true },
  { id: 3, title: '充值成功', content: '您充值的 6480 钻石已到账。', time: '3天前', level: 'success', read: true }
];

export const INTERACTIONS: Interaction[] = [
  { id: 1, userAvatar: 'https://picsum.photos/50/50?random=u1', userName: '快乐风男', type: 'like', targetContent: '你的评论', time: '5分钟前', read: false },
  { id: 2, userAvatar: 'https://picsum.photos/50/50?random=u2', userName: '暴走萝莉', type: 'comment', targetContent: '这篇文章写的太好了！', time: '1小时前', read: false },
  { id: 3, userAvatar: 'https://picsum.photos/50/50?random=u3', userName: 'Faker001', type: 'follow', time: '2小时前', read: true },
  { id: 4, userAvatar: 'https://picsum.photos/50/50?random=u4', userName: '官方小助手', type: 'mention', targetContent: '恭喜你中奖了！', time: '昨天', read: true }
];

export const GROUPS: GroupRecommendation[] = [
  { id: 'g1', name: '贪玩盒子 官方交流群', category: '官方社区', members: 1205, avatar: 'https://picsum.photos/100/100?random=g1', desc: '贪玩盒子 官方唯一指定交流群，禁止广告。', tags: ['官方', '公告', '反馈'] },
  { id: 'ng1', name: '原神-提瓦特探索', category: '开放世界', members: 5420, avatar: 'https://picsum.photos/100/100?random=ng1', desc: '萌新指导，攻略分享，一起锄大地！', tags: ['攻略', '联机'] },
  { id: 'ng2', name: 'Apex 冠军小队', category: '竞技射击', members: 890, avatar: 'https://picsum.photos/100/100?random=ng2', desc: '寻找固定队友，上分车队。', tags: ['排位', '语音'] },
  { id: 'ng3', name: 'Steam 喜加一', category: '单机主机', members: 12050, avatar: 'https://picsum.photos/100/100?random=ng3', desc: '第一时间获取免费游戏资讯。', tags: ['福利', '资讯'] },
  { id: 'ng4', name: 'Switch 动森联机', category: '休闲模拟', members: 2300, avatar: 'https://picsum.photos/100/100?random=ng4', desc: '大头菜交易，家具互摸。', tags: ['交易', '互助'] },
  { id: 'ng5', name: '王者荣耀-巅峰赛', category: 'MOBA', members: 8840, avatar: 'https://picsum.photos/100/100?random=ng5', desc: '高端局交流，技术讨论。', tags: ['技术', '开黑'] },
];

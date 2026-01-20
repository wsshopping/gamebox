import { delay, DELAY } from './core';
import { ARTICLES } from '../mockData';
import { Article } from '../../types';

export const communityApi = {
  getArticles: async (tag?: string): Promise<Article[]> => {
    await delay(DELAY);
    if (tag && tag !== '推荐' && tag !== '综合') {
       return ARTICLES.filter(a => a.tag === tag);
    }
    return [...ARTICLES];
  },
  likeArticle: async (id: string): Promise<boolean> => {
    await delay(200);
    return true;
  }
};

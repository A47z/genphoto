import client from './client';
import type { Result, PageResult, Favorite } from '../types';

export const favoriteApi = {
  add: (imageId: number) =>
    client.post<Result<void>>('/api/favorites', { imageId }),

  remove: (imageId: number) =>
    client.delete<Result<void>>(`/api/favorites/${imageId}`),

  list: (page = 0, size = 999) =>
    client.get<Result<PageResult<Favorite>>>('/api/favorites', { params: { page, size } }),
};

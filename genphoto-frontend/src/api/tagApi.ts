import client from './client';
import type { Result, Tag } from '../types';

export const tagApi = {
  add: (imageId: number, tagName: string) =>
    client.post<Result<void>>('/api/tags', { imageId, tagName }),

  remove: (imageId: number, tagName: string) =>
    client.delete<Result<void>>(`/api/tags/${imageId}/${tagName}`),

  getAll: () =>
    client.get<Result<Tag[]>>('/api/tags'),

  getImageTags: (imageId: number) =>
    client.get<Result<Tag[]>>(`/api/tags/image/${imageId}`),

  getImagesByTag: (tag: string) =>
    client.get<Result<number[]>>('/api/images/by-tag', { params: { tag } }),
};

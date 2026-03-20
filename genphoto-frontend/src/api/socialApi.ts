import client from './client';
import type { Result, PageResult, ImageInfo, Comment } from '../types';

export const socialApi = {
  toggleVisibility: (imageId: number, isPublic: boolean) =>
    client.put<Result<void>>(`/api/share/${imageId}`, { isPublic }),

  getPublicImages: (page = 0, size = 12) =>
    client.get<Result<PageResult<ImageInfo>>>('/api/share/public', { params: { page, size } }),

  addComment: (imageId: number, content: string) =>
    client.post<Result<Comment>>(`/api/comments/${imageId}`, { content }),

  getComments: (imageId: number, page = 0, size = 20) =>
    client.get<Result<PageResult<Comment>>>(`/api/comments/${imageId}`, { params: { page, size } }),

  deleteComment: (commentId: number) =>
    client.delete<Result<void>>(`/api/comments/${commentId}`),
};

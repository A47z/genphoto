import client, { API_BASE } from './client';
import type { Result, PageResult, ImageInfo } from '../types';

export const imageApi = {
  getMyImages: (page = 0, size = 12) =>
    client.get<Result<PageResult<ImageInfo>>>('/api/images', { params: { page, size } }),

  getImageDetail: (id: number) =>
    client.get<Result<ImageInfo>>(`/api/images/${id}`),

  getImageFileUrl: (id: number) =>
    `${API_BASE}/api/images/${id}/file`,

  deleteImage: (id: number) =>
    client.delete<Result<void>>(`/api/images/${id}`),

  upload: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return client.post<Result<ImageInfo>>('/api/images/upload', formData);
  },
};

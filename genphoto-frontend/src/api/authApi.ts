import client from './client';
import type { Result, LoginResponse, UserProfile } from '../types';

export const authApi = {
  register: (email: string, password: string, nickname: string) =>
    client.post<Result<void>>('/api/user/register', { email, password, nickname }),

  login: (email: string, password: string) =>
    client.post<Result<LoginResponse>>('/api/user/login', { email, password }),

  getProfile: () =>
    client.get<Result<UserProfile>>('/api/user/profile'),

  updateProfile: (nickname?: string, avatarUrl?: string) =>
    client.put<Result<void>>('/api/user/profile', { nickname, avatarUrl }),

  changePassword: (oldPassword: string, newPassword: string) =>
    client.put<Result<void>>('/api/user/password', { oldPassword, newPassword }),
};

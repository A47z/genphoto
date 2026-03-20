import client from './client';
import type { Result, GenerateRequest, GenerateResponse } from '../types';

export const generationApi = {
  generate: (request: GenerateRequest) =>
    client.post<Result<GenerateResponse>>('/api/generation/generate', request),

  getModels: () =>
    client.get<Result<{ id: string; name: string; description: string }[]>>('/api/generation/models'),

  getStyles: () =>
    client.get<Result<{ id: string; name: string; description: string }[]>>('/api/generation/styles'),
};

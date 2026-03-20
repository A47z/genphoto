import client from './client';
import type { Result } from '../types';

export const aiApi = {
  getInspiration: () => client.post<Result<string>>('/api/ai/prompt/inspire'),
  optimizePrompt: (prompt: string) => client.post<Result<string>>('/api/ai/prompt/optimize', { prompt }),
};

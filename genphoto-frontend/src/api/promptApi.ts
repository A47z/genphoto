import client from './client';
import type { Result, PageResult, PromptTemplate, PromptHistory } from '../types';

export const promptApi = {
  getTemplates: (category?: string, page = 0, size = 10) =>
    client.get<Result<PageResult<PromptTemplate>>>('/api/prompts/templates', {
      params: { category: category || undefined, page, size },
    }),

  getTemplate: (id: number) =>
    client.get<Result<PromptTemplate>>(`/api/prompts/templates/${id}`),

  createTemplate: (name: string, templateText: string, category: string) =>
    client.post<Result<PromptTemplate>>('/api/prompts/templates', { name, templateText, category }),

  renderTemplate: (id: number, variables: Record<string, string>) =>
    client.post<Result<string>>(`/api/prompts/templates/${id}/render`, { variables }),

  deleteTemplate: (id: number) =>
    client.delete<Result<void>>(`/api/prompts/templates/${id}`),

  getHistory: (page = 0, size = 10) =>
    client.get<Result<PageResult<PromptHistory>>>('/api/prompts/history', { params: { page, size } }),

  deleteHistory: (id: number) =>
    client.delete<Result<void>>(`/api/prompts/history/${id}`),
};

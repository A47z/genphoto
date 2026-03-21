import { create } from 'zustand';

interface GenerateState {
  resultUrl: string;
  lastPrompt: string;
  setResult: (url: string, prompt: string) => void;
  clearResult: () => void;
}

export const useGenerateStore = create<GenerateState>((set) => ({
  resultUrl: '',
  lastPrompt: '',
  setResult: (url, prompt) => set({ resultUrl: url, lastPrompt: prompt }),
  clearResult: () => set({ resultUrl: '', lastPrompt: '' }),
}));

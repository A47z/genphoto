import { create } from 'zustand';
import { favoriteApi } from '../api/favoriteApi';

interface FavoriteStore {
  favoriteIds: Set<number>;
  loaded: boolean;
  loadFavorites: () => Promise<void>;
  toggle: (imageId: number) => Promise<void>;
  isFavorited: (imageId: number) => boolean;
  clear: () => void;
}

export const useFavoriteStore = create<FavoriteStore>((set, get) => ({
  favoriteIds: new Set(),
  loaded: false,

  loadFavorites: async () => {
    try {
      const res = await favoriteApi.list(0, 999);
      const ids = new Set(res.data.data.list.map((f) => f.imageId));
      set({ favoriteIds: ids, loaded: true });
    } catch {
      set({ loaded: true });
    }
  },

  toggle: async (imageId: number) => {
    const { favoriteIds } = get();
    const isFav = favoriteIds.has(imageId);
    // optimistic update
    const next = new Set(favoriteIds);
    if (isFav) {
      next.delete(imageId);
    } else {
      next.add(imageId);
    }
    set({ favoriteIds: next });
    try {
      if (isFav) {
        await favoriteApi.remove(imageId);
      } else {
        await favoriteApi.add(imageId);
      }
    } catch {
      // rollback
      set({ favoriteIds });
    }
  },

  isFavorited: (imageId: number) => get().favoriteIds.has(imageId),

  clear: () => set({ favoriteIds: new Set(), loaded: false }),
}));

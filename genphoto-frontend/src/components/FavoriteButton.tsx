import { Heart } from 'lucide-react';
import { useFavoriteStore } from '../store/favoriteStore';
import { useAuthStore } from '../store/authStore';

interface Props {
  imageId: number;
  size?: number;
}

export default function FavoriteButton({ imageId, size = 16 }: Props) {
  const { isLoggedIn } = useAuthStore();
  const { toggle, isFavorited } = useFavoriteStore();
  const favorited = isFavorited(imageId);

  if (!isLoggedIn) return null;

  return (
    <button
      className={`action-btn action-favorite ${favorited ? 'is-favorited' : ''}`}
      onClick={(e) => { e.stopPropagation(); toggle(imageId); }}
      title={favorited ? '取消收藏' : '收藏'}
    >
      <Heart size={size} fill={favorited ? '#fff' : 'none'} />
    </button>
  );
}

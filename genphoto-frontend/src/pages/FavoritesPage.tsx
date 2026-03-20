import { useState, useEffect, useCallback, useRef } from 'react';
import { favoriteApi } from '../api/favoriteApi';
import { imageApi } from '../api/imageApi';
import type { ImageInfo } from '../types';
import { Heart, ChevronLeft, ChevronRight, Cpu, Calendar, Eye } from 'lucide-react';
import ImageDetailModal from '../components/ImageDetailModal';
import FavoriteButton from '../components/FavoriteButton';

const favCache = new Map<string, boolean>();

function LazyImage({ src, alt }: { src: string; alt: string }) {
  const [loaded, setLoaded] = useState(() => favCache.has(src));
  const imgRef = useRef<HTMLImageElement>(null);
  const handleLoad = useCallback(() => { favCache.set(src, true); setLoaded(true); }, [src]);

  return (
    <>
      {!loaded && <div className="card-skeleton skeleton-shimmer" />}
      <img ref={imgRef} src={src} alt={alt} loading="lazy" onLoad={handleLoad}
        className={`card-img ${loaded ? 'card-img-visible' : 'card-img-hidden'}`} />
    </>
  );
}

export default function FavoritesPage() {
  const [images, setImages] = useState<ImageInfo[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<ImageInfo | null>(null);

  const loadFavorites = async () => {
    setLoading(true);
    try {
      const res = await favoriteApi.list(page, 12);
      const favs = res.data.data.list;
      setTotalPages(res.data.data.totalPages);
      if (favs.length === 0) {
        setImages([]);
        return;
      }
      const details = await Promise.all(
        favs.map((f) => imageApi.getImageDetail(f.imageId).then((r) => r.data.data).catch(() => null))
      );
      setImages(details.filter((d): d is ImageInfo => d !== null));
    } catch (err) {
      console.error('加载收藏失败', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadFavorites(); }, [page]);

  return (
    <div className="gallery-page animate-fade-in">
      <div className="gallery-header">
        <h2>
          <Heart size={28} color="var(--accent)" /> 我的收藏
        </h2>
        {!loading && images.length > 0 && (
          <span className="gallery-count">{images.length} 件收藏</span>
        )}
      </div>

      {loading ? (
        <div className="masonry-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="masonry-item">
              <div className="img-card skeleton-card skeleton-shimmer" style={{ paddingBottom: `${[100, 130, 80, 120, 90, 140, 100, 110][i]}%` }} />
            </div>
          ))}
        </div>
      ) : images.length === 0 ? (
        <div className="gallery-empty">
          <Eye size={48} style={{ opacity: 0.15 }} />
          <p>还没有收藏任何图片</p>
        </div>
      ) : (
        <div className="masonry-grid">
          {images.map((img, idx) => (
            <div key={img.id} className="masonry-item" style={{ animationDelay: `${idx * 40}ms` }} onClick={() => setSelectedImage(img)}>
              <div className="img-card">
                <LazyImage src={imageApi.getImageFileUrl(img.id)} alt={img.prompt} />
                <div className="card-info">
                  <p className="card-prompt">{img.prompt}</p>
                  <div className="card-meta">
                    <span className="card-model"><Cpu size={10} /> {img.model?.replace('gemini-', '').replace('-image', '')}</span>
                    <span className="card-date"><Calendar size={10} /> {new Date(img.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="card-actions">
                  <FavoriteButton imageId={img.id} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="gallery-pagination">
          <button disabled={page === 0} onClick={() => setPage(page - 1)} className="glass-button flex-center" style={{ padding: '8px 20px', gap: '6px' }}>
            <ChevronLeft size={18} /> 上一页
          </button>
          <span className="page-indicator">{page + 1} / {totalPages}</span>
          <button disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)} className="glass-button flex-center" style={{ padding: '8px 20px', gap: '6px' }}>
            下一页 <ChevronRight size={18} />
          </button>
        </div>
      )}

      {selectedImage && (
        <ImageDetailModal image={selectedImage} onClose={() => setSelectedImage(null)} />
      )}
    </div>
  );
}

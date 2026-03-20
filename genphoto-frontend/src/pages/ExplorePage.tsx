import { useState, useEffect, useCallback, useRef } from 'react';
import { socialApi } from '../api/socialApi';
import { imageApi } from '../api/imageApi';
import type { ImageInfo } from '../types';
import { Compass, ChevronLeft, ChevronRight, Cpu, Sparkles, Eye, User } from 'lucide-react';
import ImageDetailModal from '../components/ImageDetailModal';
import FavoriteButton from '../components/FavoriteButton';

const exploreCache = new Map<string, boolean>();

function LazyImage({ src, alt }: { src: string; alt: string }) {
  const [loaded, setLoaded] = useState(() => exploreCache.has(src));
  const imgRef = useRef<HTMLImageElement>(null);

  const handleLoad = useCallback(() => {
    exploreCache.set(src, true);
    setLoaded(true);
  }, [src]);

  return (
    <>
      {!loaded && <div className="card-skeleton skeleton-shimmer" />}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={handleLoad}
        className={`card-img ${loaded ? 'card-img-visible' : 'card-img-hidden'}`}
      />
    </>
  );
}

export default function ExplorePage() {
  const [images, setImages] = useState<ImageInfo[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<ImageInfo | null>(null);

  useEffect(() => {
    setLoading(true);
    socialApi.getPublicImages(page).then((res) => {
      setImages(res.data.data.list);
      setTotalPages(res.data.data.totalPages);
    }).finally(() => setLoading(false));
  }, [page]);

  return (
    <div className="gallery-page animate-fade-in">
      <div className="gallery-header">
        <h2>
          <Compass size={28} color="var(--accent)" /> 公开广场
        </h2>
        {!loading && images.length > 0 && (
          <span className="gallery-count">{images.length} 件公开作品</span>
        )}
      </div>

      {loading ? (
        <div className="masonry-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="masonry-item">
              <div className="img-card skeleton-card skeleton-shimmer" style={{ paddingBottom: `${[120, 90, 140, 100, 110, 80, 130, 100][i]}%` }} />
            </div>
          ))}
        </div>
      ) : images.length === 0 ? (
        <div className="gallery-empty">
          <Eye size={48} style={{ opacity: 0.15 }} />
          <p>广场暂时没有公开的作品</p>
        </div>
      ) : (
        <div className="masonry-grid">
          {images.map((img, idx) => (
            <div key={img.id} className="masonry-item" style={{ animationDelay: `${idx * 40}ms` }} onClick={() => setSelectedImage(img)}>
              <div className="img-card">
                <LazyImage src={imageApi.getImageFileUrl(img.id)} alt={img.prompt} />

                <div className="card-info">
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                    <Sparkles size={13} color="var(--accent-hover)" style={{ flexShrink: 0, marginTop: '3px' }} />
                    <p className="card-prompt">{img.prompt}</p>
                  </div>
                  <div className="card-meta">
                    <span className="card-model"><Cpu size={10} /> {img.model?.replace('gemini-', '').replace('-image', '')}</span>
                    {img.nickname && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        <User size={10} /> {img.nickname}
                      </span>
                    )}
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

      {images.length === 0 && !loading && null}

      {selectedImage && (
        <ImageDetailModal image={selectedImage} onClose={() => setSelectedImage(null)} />
      )}
    </div>
  );
}

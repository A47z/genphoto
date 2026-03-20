import { useState, useEffect, useCallback, useRef } from 'react';
import { imageApi } from '../api/imageApi';
import { socialApi } from '../api/socialApi';
import { tagApi } from '../api/tagApi';
import type { ImageInfo, Tag } from '../types';
import { LayoutGrid, Trash2, ChevronLeft, ChevronRight, Globe, Lock, Cpu, Calendar, MessageCircle, Eye, Upload, Loader2, Tag as TagIcon, X } from 'lucide-react';
import ImageDetailModal from '../components/ImageDetailModal';
import FavoriteButton from '../components/FavoriteButton';

/* ---------- cached images store (session-level) ---------- */
const imageCache = new Map<string, boolean>();

function LazyImage({ src, alt, onVisible }: { src: string; alt: string; onVisible?: () => void }) {
  const [loaded, setLoaded] = useState(() => imageCache.has(src));
  const imgRef = useRef<HTMLImageElement>(null);

  const handleLoad = useCallback(() => {
    imageCache.set(src, true);
    setLoaded(true);
  }, [src]);

  useEffect(() => {
    if (imageCache.has(src)) { setLoaded(true); return; }
    const el = imgRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { obs.disconnect(); onVisible?.(); }
    }, { rootMargin: '200px' });
    obs.observe(el);
    return () => obs.disconnect();
  }, [src, onVisible]);

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

export default function GalleryPage() {
  const [images, setImages] = useState<ImageInfo[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<ImageInfo | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [filteredImages, setFilteredImages] = useState<ImageInfo[] | null>(null);

  useEffect(() => {
    tagApi.getAll().then((res) => setAllTags(res.data.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!activeTag) { setFilteredImages(null); return; }
    setLoading(true);
    tagApi.getImagesByTag(activeTag).then(async (res) => {
      const ids = res.data.data;
      if (ids.length === 0) { setFilteredImages([]); setLoading(false); return; }
      const details = await Promise.all(
        ids.map((id) => imageApi.getImageDetail(id).then((r) => r.data.data).catch(() => null))
      );
      setFilteredImages(details.filter((d): d is ImageInfo => d !== null));
    }).catch(() => setFilteredImages([])).finally(() => setLoading(false));
  }, [activeTag]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await imageApi.upload(file);
      loadImages();
    } catch (err) {
      console.error('上传失败', err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const loadImages = async () => {
    setLoading(true);
    try {
      const res = await imageApi.getMyImages(page);
      setImages(res.data.data.list);
      setTotalPages(res.data.data.totalPages);
    } catch (err) {
      console.error('加载图片失败', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadImages(); }, [page]);

  /* preload next page images */
  useEffect(() => {
    if (page < totalPages - 1) {
      imageApi.getMyImages(page + 1).then(res => {
        res.data.data.list.forEach((img: ImageInfo) => {
          const url = imageApi.getImageFileUrl(img.id);
          if (!imageCache.has(url)) {
            const i = new Image();
            i.src = url;
            i.onload = () => imageCache.set(url, true);
          }
        });
      }).catch(() => {});
    }
  }, [page, totalPages]);

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('确定删除这张图片？')) return;
    await imageApi.deleteImage(id);
    loadImages();
  };

  const handleTogglePublic = async (img: ImageInfo, e: React.MouseEvent) => {
    e.stopPropagation();
    await socialApi.toggleVisibility(img.id, !img.isPublic);
    loadImages();
  };

  return (
    <div className="gallery-page animate-fade-in">
      <div className="gallery-header">
        <h2>
          <LayoutGrid size={28} color="var(--accent)" /> 我的图库
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {!loading && images.length > 0 && (
            <span className="gallery-count">{images.length} 张作品</span>
          )}
          <button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="glass-button flex-center" style={{ padding: '8px 16px', gap: '6px', fontSize: '0.9rem' }}>
            {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />} {uploading ? '上传中...' : '上传图片'}
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleUpload} />
        </div>
      </div>

      {/* Tag Filter */}
      {allTags.length > 0 && (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          <TagIcon size={14} color="var(--text-muted)" />
          {allTags.map((t) => (
            <button key={t.id} onClick={() => setActiveTag(activeTag === t.name ? null : t.name)}
              className="tag-pill" style={{ cursor: 'pointer', opacity: activeTag && activeTag !== t.name ? 0.5 : 1, background: activeTag === t.name ? 'rgba(56,189,248,0.3)' : undefined }}>
              {t.name}
            </button>
          ))}
          {activeTag && (
            <button onClick={() => setActiveTag(null)} className="glass-button flex-center" style={{ padding: '2px 10px', fontSize: '0.75rem', gap: '4px' }}>
              <X size={12} /> 清除筛选
            </button>
          )}
        </div>
      )}

      {(() => {
        const displayImages = filteredImages ?? images;
        return loading ? (
        <div className="masonry-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="masonry-item">
              <div className="img-card skeleton-card skeleton-shimmer" style={{ paddingBottom: `${[100, 130, 80, 120, 90, 140, 100, 110][i]}%` }} />
            </div>
          ))}
        </div>
      ) : displayImages.length === 0 ? (
        <div className="gallery-empty">
          <Eye size={48} style={{ opacity: 0.15 }} />
          <p>{activeTag ? '该标签下没有图片' : '图库空空如也，快去生成第一张图片吧！'}</p>
        </div>
      ) : (
        <div className="masonry-grid">
          {displayImages.map((img, idx) => (
            <div key={img.id} className="masonry-item" style={{ animationDelay: `${idx * 40}ms` }} onClick={() => setSelectedImage(img)}>
              <div className="img-card">
                {img.isPublic && (
                  <span className="card-badge card-badge-public">
                    <Globe size={10} /> 已公开
                  </span>
                )}

                <LazyImage src={imageApi.getImageFileUrl(img.id)} alt={img.prompt} />

                {/* Bottom info bar (always visible) */}
                <div className="card-info">
                  <p className="card-prompt">{img.prompt}</p>
                  <div className="card-meta">
                    <span className="card-model"><Cpu size={10} /> {img.model?.replace('gemini-', '').replace('-image', '')}</span>
                    <span className="card-date"><Calendar size={10} /> {new Date(img.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Hover action overlay */}
                <div className="card-actions">
                  <FavoriteButton imageId={img.id} />
                  <button className="action-btn action-public" onClick={(e) => handleTogglePublic(img, e)} title={img.isPublic ? '取消公开' : '公开到广场'}>
                    {img.isPublic ? <Lock size={16} /> : <Globe size={16} />}
                  </button>
                  <button className="action-btn action-comment" onClick={(e) => { e.stopPropagation(); setSelectedImage(img); }} title="查看评论">
                    <MessageCircle size={16} />
                  </button>
                  <button className="action-btn action-delete" onClick={(e) => handleDelete(img.id, e)} title="删除图片">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
      })()}

      {!activeTag && totalPages > 1 && (
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

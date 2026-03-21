import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { socialApi } from '../api/socialApi';
import { imageApi } from '../api/imageApi';
import { tagApi } from '../api/tagApi';
import { useAuthStore } from '../store/authStore';
import type { ImageInfo, Comment, Tag } from '../types';
import { X, Send, Trash2, Sparkles, MessageCircle, Cpu, Calendar, Tag as TagIcon, Plus } from 'lucide-react';
import FavoriteButton from './FavoriteButton';

interface Props {
  image: ImageInfo;
  onClose: () => void;
}

export default function ImageDetailModal({ image, onClose }: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [sending, setSending] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const { isLoggedIn, user } = useAuthStore();
  const listRef = useRef<HTMLDivElement>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const [newTag, setNewTag] = useState('');
  const isOwner = isLoggedIn && user && user.id === image.userId;

  const loadTags = async () => {
    try {
      const res = await tagApi.getImageTags(image.id);
      setTags(res.data.data);
    } catch { /* ignore */ }
  };

  const handleAddTag = async () => {
    const name = newTag.trim();
    if (!name) return;
    try {
      await tagApi.add(image.id, name);
      setNewTag('');
      loadTags();
    } catch { /* ignore */ }
  };

  const handleRemoveTag = async (tagName: string) => {
    try {
      await tagApi.remove(image.id, tagName);
      loadTags();
    } catch { /* ignore */ }
  };

  const loadComments = async (p = 0) => {
    try {
      const res = await socialApi.getComments(image.id, p, 20);
      setComments(res.data.data.list);
      setTotalPages(res.data.data.totalPages);
      setPage(p);
    } catch (err) {
      console.error('加载评论失败', err);
    }
  };

  useEffect(() => {
    loadComments();
    loadTags();
  }, [image.id]);

  const handleSend = async () => {
    if (!newComment.trim() || sending) return;
    setSending(true);
    try {
      await socialApi.addComment(image.id, newComment.trim());
      setNewComment('');
      loadComments(0);
      if (listRef.current) listRef.current.scrollTop = 0;
    } catch (err) {
      console.error('发表评论失败', err);
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (commentId: number) => {
    if (!confirm('确定删除这条评论？')) return;
    try {
      await socialApi.deleteComment(commentId);
      loadComments(page);
    } catch (err) {
      console.error('删除评论失败', err);
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes} 分钟前`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} 小时前`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} 天前`;
    return date.toLocaleDateString();
  };

  return createPortal(
    <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-content animate-fade-in">
        {/* Left: Image */}
        <div className="modal-image-side">
          <img src={imageApi.getImageFileUrl(image.id)} alt={image.prompt} />
        </div>

        {/* Right: Comments */}
        <div className="modal-comments-side">
          {/* Header */}
          <div className="modal-comments-header">
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-h)' }}>
              <MessageCircle size={18} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
              评论
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FavoriteButton imageId={image.id} size={18} />
              <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}>
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Image Info */}
          <div style={{ padding: '12px 24px', borderBottom: '1px solid var(--glass-border)', fontSize: '0.85rem' }}>
            <p style={{ margin: '0 0 8px 0', color: 'var(--text)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {image.prompt}
            </p>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
              {image.nickname && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}>
                  <span style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'var(--accent)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', color: '#fff', fontWeight: 600, flexShrink: 0 }}>
                    {image.nickname.charAt(0).toUpperCase()}
                  </span>
                  {image.nickname}
                </span>
              )}
              <span style={{ background: 'var(--accent)', color: '#fff', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Cpu size={10} /> {image.model}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}>
                <Calendar size={10} /> {new Date(image.createdAt).toLocaleDateString()}
              </span>
            </div>
            {/* Tags */}
            {(tags.length > 0 || isOwner) && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
                <TagIcon size={12} color="var(--text-muted)" />
                {tags.map((t) => (
                  <span key={t.id} className="tag-pill">
                    {t.name}
                    {isOwner && <button onClick={() => handleRemoveTag(t.name)}><X size={10} /></button>}
                  </span>
                ))}
                {isOwner && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                    <input className="glass-input" value={newTag} onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
                      placeholder="添加标签" maxLength={20}
                      style={{ padding: '2px 8px', fontSize: '0.75rem', width: '80px', height: '22px' }} />
                    <button onClick={handleAddTag} className="glass-button flex-center" style={{ padding: '2px 6px', minWidth: 0 }}>
                      <Plus size={12} />
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Comments List */}
          <div className="modal-comments-list" ref={listRef}>
            {comments.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '32px 0' }}>
                暂无评论，来说点什么吧
              </div>
            ) : (
              <>
                {comments.map((c) => (
                  <div key={c.id} className={`comment-item ${c.isAiReview ? 'ai-review' : ''}`}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {c.isAiReview ? (
                          <Sparkles size={14} color="var(--accent)" />
                        ) : (
                          <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: '#fff', fontWeight: 600, flexShrink: 0 }}>
                            {(c.nickname || '用户').charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span style={{ fontWeight: 500, fontSize: '0.85rem', color: c.isAiReview ? 'var(--accent-hover)' : 'var(--text-h)' }}>
                          {c.nickname || '用户'}
                          {c.isAiReview && <span style={{ fontSize: '0.7rem', marginLeft: '6px', background: 'rgba(168,85,247,0.2)', padding: '1px 6px', borderRadius: '8px' }}>AI</span>}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formatTime(c.createdAt)}</span>
                        {isLoggedIn && user && user.id === c.userId && (
                          <button onClick={() => handleDelete(c.id)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px' }}>
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text)', lineHeight: 1.6 }}>{c.content}</p>
                  </div>
                ))}
                {totalPages > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', padding: '12px 0' }}>
                    <button disabled={page === 0} onClick={() => loadComments(page - 1)} className="glass-button" style={{ padding: '4px 12px', fontSize: '0.8rem' }}>上一页</button>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', lineHeight: '28px' }}>{page + 1}/{totalPages}</span>
                    <button disabled={page >= totalPages - 1} onClick={() => loadComments(page + 1)} className="glass-button" style={{ padding: '4px 12px', fontSize: '0.8rem' }}>下一页</button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Comment Input */}
          {isLoggedIn ? (
            <div className="modal-comment-input">
              <input
                className="glass-input"
                placeholder="写下你的评论..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                style={{ flex: 1, padding: '8px 12px', fontSize: '0.9rem' }}
                maxLength={500}
              />
              <button onClick={handleSend} disabled={!newComment.trim() || sending} className="glass-button flex-center" style={{ padding: '8px 12px', flexShrink: 0 }}>
                <Send size={16} />
              </button>
            </div>
          ) : (
            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--glass-border)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              登录后可以发表评论
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

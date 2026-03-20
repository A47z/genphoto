import { useState, useEffect } from 'react';
import { generationApi } from '../api/generationApi';
import { aiApi } from '../api/aiApi';
import { promptApi } from '../api/promptApi';
import { API_BASE } from '../api/client';
import { useGenerateStore } from '../store/generateStore';
import type { PromptTemplate, PromptHistory } from '../types';
import { Sparkles, PenTool, Cpu, Palette, Maximize, Loader2, Image as ImageIcon, AlertCircle, Download, Lightbulb, Wand2, FileText, ChevronDown, ChevronUp, Clock, Trash2, Plus, X, Send } from 'lucide-react';

export default function GeneratePage() {
  const { resultUrl, lastPrompt, setResult } = useGenerateStore();
  const [prompt, setPrompt] = useState(lastPrompt);
  const [model, setModel] = useState('gemini-2.5-flash-image');
  const [style, setStyle] = useState('natural');
  const [width, setWidth] = useState(1024);
  const [height, setHeight] = useState(1024);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [models, setModels] = useState<{ id: string; name: string }[]>([]);
  const [styles, setStyles] = useState<{ id: string; name: string }[]>([]);
  const [inspiring, setInspiring] = useState(false);
  const [optimizing, setOptimizing] = useState(false);

  // Templates
  const [showTemplates, setShowTemplates] = useState(false);
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [tplPage, setTplPage] = useState(0);
  const [tplTotalPages, setTplTotalPages] = useState(0);
  const [showCreateTpl, setShowCreateTpl] = useState(false);
  const [tplName, setTplName] = useState('');
  const [tplText, setTplText] = useState('');
  const [tplCategory, setTplCategory] = useState('');
  const [renderVars, setRenderVars] = useState<Record<string, string>>({});
  const [renderingTpl, setRenderingTpl] = useState<PromptTemplate | null>(null);

  // History
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<PromptHistory[]>([]);
  const [histPage, setHistPage] = useState(0);
  const [histTotalPages, setHistTotalPages] = useState(0);

  useEffect(() => {
    generationApi.getModels().then((res) => setModels(res.data.data));
    generationApi.getStyles().then((res) => setStyles(res.data.data));
  }, []);

  const loadTemplates = async (p = 0) => {
    try {
      const res = await promptApi.getTemplates(undefined, p, 5);
      setTemplates(res.data.data.list);
      setTplTotalPages(res.data.data.totalPages);
      setTplPage(p);
    } catch { /* ignore */ }
  };

  const loadHistory = async (p = 0) => {
    try {
      const res = await promptApi.getHistory(p, 8);
      setHistory(res.data.data.list);
      setHistTotalPages(res.data.data.totalPages);
      setHistPage(p);
    } catch { /* ignore */ }
  };

  useEffect(() => { if (showTemplates) loadTemplates(0); }, [showTemplates]);
  useEffect(() => { if (showHistory) loadHistory(0); }, [showHistory]);

  const handleUseTemplate = (tpl: PromptTemplate) => {
    const vars = [...tpl.templateText.matchAll(/\{\{(\w+)\}\}/g)].map((m) => m[1]);
    if (vars.length > 0) {
      setRenderingTpl(tpl);
      setRenderVars(Object.fromEntries(vars.map((v) => [v, ''])));
    } else {
      setPrompt(tpl.templateText);
    }
  };

  const handleRenderTemplate = async () => {
    if (!renderingTpl) return;
    try {
      const res = await promptApi.renderTemplate(renderingTpl.id, renderVars);
      setPrompt(res.data.data);
      setRenderingTpl(null);
    } catch { /* ignore */ }
  };

  const handleCreateTemplate = async () => {
    if (!tplName.trim() || !tplText.trim()) return;
    try {
      await promptApi.createTemplate(tplName.trim(), tplText.trim(), tplCategory.trim() || '通用');
      setTplName(''); setTplText(''); setTplCategory(''); setShowCreateTpl(false);
      loadTemplates(0);
    } catch { /* ignore */ }
  };

  const handleDeleteTemplate = async (id: number) => {
    try {
      await promptApi.deleteTemplate(id);
      loadTemplates(tplPage);
    } catch { /* ignore */ }
  };

  const handleDeleteHistory = async (id: number) => {
    try {
      await promptApi.deleteHistory(id);
      loadHistory(histPage);
    } catch { /* ignore */ }
  };

  const handleInspire = async () => {
    setInspiring(true);
    try {
      const res = await aiApi.getInspiration();
      setPrompt(res.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || '灵感获取失败');
    } finally {
      setInspiring(false);
    }
  };

  const handleOptimize = async () => {
    if (!prompt.trim()) return;
    setOptimizing(true);
    try {
      const res = await aiApi.optimizePrompt(prompt);
      setPrompt(res.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || '优化失败');
    } finally {
      setOptimizing(false);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError('');
    setResult('', prompt);
    try {
      const res = await generationApi.generate({ prompt, model, width, height, style });
      const url = res.data.data.imageUrl;
      const fullUrl = url.startsWith('/') ? API_BASE + url : url;
      setResult(fullUrl, prompt);
    } catch (err: any) {
      setError(err.response?.data?.message || '生成失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 73px)', overflow: 'hidden' }} className="animate-fade-in">
      {/* Left Sidebar Control Panel */}
      <div className="glass-panel" style={{ width: '400px', flexShrink: 0, padding: '24px', overflowY: 'auto', borderRight: '1px solid var(--glass-border)', borderRadius: 0, height: '100%', borderTop: 'none', borderBottom: 'none', borderLeft: 'none' }}>
        <h2 style={{ marginBottom: '24px', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={24} color="var(--accent)" /> AI 创作中心
        </h2>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', color: 'var(--text)', marginBottom: '8px', fontWeight: 500 }}>
            <PenTool size={16} /> 提示词 (Prompt)
          </label>
          <textarea
            className="glass-input"
            placeholder="描述你想生成的画面细节..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={5}
            style={{ resize: 'vertical', fontSize: '0.95rem', lineHeight: 1.5 }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={handleInspire} disabled={inspiring} className="glass-button flex-center"
                style={{ padding: '6px 12px', fontSize: '0.8rem', gap: '4px', background: 'rgba(251, 191, 36, 0.15)', border: '1px solid rgba(251, 191, 36, 0.3)', color: '#fbbf24' }}>
                {inspiring ? <Loader2 size={13} className="animate-spin" /> : <Lightbulb size={13} />} 灵感
              </button>
              <button onClick={handleOptimize} disabled={optimizing || !prompt.trim()} className="glass-button flex-center"
                style={{ padding: '6px 12px', fontSize: '0.8rem', gap: '4px', background: 'rgba(168, 85, 247, 0.15)', border: '1px solid rgba(168, 85, 247, 0.3)', color: 'var(--accent-hover)' }}>
                {optimizing ? <Loader2 size={13} className="animate-spin" /> : <Wand2 size={13} />} 优化
              </button>
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{prompt.length} 字符</span>
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', color: 'var(--text)', marginBottom: '8px', fontWeight: 500 }}>
             <Cpu size={16} /> 模型 (Model)
          </label>
          <select value={model} onChange={(e) => setModel(e.target.value)} className="glass-input glass-select" style={{ cursor: 'pointer' }}>
            {models.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', color: 'var(--text)', marginBottom: '8px', fontWeight: 500 }}>
             <Palette size={16} /> 风格 (Style)
          </label>
          <select value={style} onChange={(e) => setStyle(e.target.value)} className="glass-input glass-select" style={{ cursor: 'pointer' }}>
            {styles.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        <div style={{ marginBottom: '32px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', color: 'var(--text)', marginBottom: '8px', fontWeight: 500 }}>
             <Maximize size={16} /> 比例 (Aspect Ratio)
          </label>
          <select value={`${width}x${height}`} onChange={(e) => {
            const [w, h] = e.target.value.split('x').map(Number);
            setWidth(w); setHeight(h);
          }} className="glass-input glass-select" style={{ cursor: 'pointer' }}>
            <option value="1024x1024">1:1 方形 (1024x1024)</option>
            <option value="1024x1792">9:16 竖屏 (1024x1792)</option>
            <option value="1792x1024">16:9 横屏 (1792x1024)</option>
          </select>
        </div>

        <button onClick={handleGenerate} disabled={loading || !prompt.trim()}
          className="glass-button flex-center" style={{ width: '100%', padding: '14px', fontSize: '1.05rem', gap: '8px' }}>
          {loading ? (
             <><Loader2 size={18} className="animate-spin" /> 生成中...</>
          ) : (
             <><ImageIcon size={18} /> 生成图片</>
          )}
        </button>

        {error && (
          <div style={{ padding: '12px', background: 'rgba(248, 113, 113, 0.1)', border: '1px solid rgba(248, 113, 113, 0.3)', borderRadius: '8px', marginTop: '16px', color: '#fca5a5', display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.9rem' }}>
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{error}</span>
          </div>
        )}

        {/* Divider */}
        <div style={{ borderTop: '1px solid var(--glass-border)', margin: '24px 0 16px' }} />

        {/* Prompt Templates */}
        <div>
          <button onClick={() => setShowTemplates(!showTemplates)} style={{ background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '0', fontSize: '0.95rem', fontWeight: 500 }}>
            <FileText size={16} color="var(--accent)" /> 提示词模板
            <span style={{ marginLeft: 'auto' }}>{showTemplates ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</span>
          </button>

          {showTemplates && (
            <div style={{ marginTop: '12px' }}>
              {/* Template List */}
              {templates.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '12px 0' }}>暂无模板</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {templates.map((tpl) => (
                    <div key={tpl.id} style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.2s' }}
                      onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                      onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                      onClick={() => handleUseTemplate(tpl)}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 500, fontSize: '0.85rem', color: 'var(--text-h)' }}>{tpl.name}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '0.7rem', padding: '1px 8px', borderRadius: '8px', background: 'rgba(168,85,247,0.15)', color: 'var(--accent-hover)' }}>{tpl.category}</span>
                          <button onClick={(e) => { e.stopPropagation(); handleDeleteTemplate(tpl.id); }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px' }}>
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tpl.templateText}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Template Pagination */}
              {tplTotalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '8px' }}>
                  <button disabled={tplPage === 0} onClick={() => loadTemplates(tplPage - 1)} className="glass-button" style={{ padding: '2px 10px', fontSize: '0.75rem' }}>上一页</button>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '24px' }}>{tplPage + 1}/{tplTotalPages}</span>
                  <button disabled={tplPage >= tplTotalPages - 1} onClick={() => loadTemplates(tplPage + 1)} className="glass-button" style={{ padding: '2px 10px', fontSize: '0.75rem' }}>下一页</button>
                </div>
              )}

              {/* Variable Render Form */}
              {renderingTpl && (
                <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.2)', borderRadius: '8px' }}>
                  <p style={{ margin: '0 0 8px', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-h)' }}>填写变量：{renderingTpl.name}</p>
                  {Object.keys(renderVars).map((key) => (
                    <div key={key} style={{ marginBottom: '6px' }}>
                      <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{`{{${key}}}`}</label>
                      <input className="glass-input" value={renderVars[key]} onChange={(e) => setRenderVars({ ...renderVars, [key]: e.target.value })}
                        placeholder={key} style={{ padding: '6px 10px', fontSize: '0.85rem' }} />
                    </div>
                  ))}
                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                    <button onClick={handleRenderTemplate} className="glass-button flex-center" style={{ padding: '6px 14px', fontSize: '0.8rem', gap: '4px' }}>
                      <Send size={12} /> 使用
                    </button>
                    <button onClick={() => setRenderingTpl(null)} className="glass-button flex-center" style={{ padding: '6px 14px', fontSize: '0.8rem', gap: '4px' }}>
                      <X size={12} /> 取消
                    </button>
                  </div>
                </div>
              )}

              {/* Create Template */}
              <button onClick={() => setShowCreateTpl(!showCreateTpl)} className="glass-button flex-center" style={{ width: '100%', padding: '8px', fontSize: '0.85rem', gap: '6px', marginTop: '10px' }}>
                <Plus size={14} /> 新建模板
              </button>
              {showCreateTpl && (
                <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <input className="glass-input" value={tplName} onChange={(e) => setTplName(e.target.value)} placeholder="模板名称" style={{ padding: '8px 12px', fontSize: '0.85rem' }} maxLength={50} />
                  <textarea className="glass-input" value={tplText} onChange={(e) => setTplText(e.target.value)} placeholder="模板内容，用 {{变量名}} 作为占位符" rows={3} style={{ fontSize: '0.85rem', resize: 'vertical' }} />
                  <input className="glass-input" value={tplCategory} onChange={(e) => setTplCategory(e.target.value)} placeholder="分类（默认：通用）" style={{ padding: '8px 12px', fontSize: '0.85rem' }} maxLength={20} />
                  <button onClick={handleCreateTemplate} disabled={!tplName.trim() || !tplText.trim()} className="glass-button flex-center" style={{ padding: '8px', fontSize: '0.85rem', gap: '6px' }}>
                    保存模板
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Prompt History */}
        <div style={{ marginTop: '12px' }}>
          <button onClick={() => setShowHistory(!showHistory)} style={{ background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '0', fontSize: '0.95rem', fontWeight: 500 }}>
            <Clock size={16} color="var(--accent)" /> 历史记录
            <span style={{ marginLeft: 'auto' }}>{showHistory ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</span>
          </button>

          {showHistory && (
            <div style={{ marginTop: '12px' }}>
              {history.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '12px 0' }}>暂无历史记录</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {history.map((h) => (
                    <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.2s' }}
                      onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                      onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                      onClick={() => setPrompt(h.prompt)}>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.prompt}</p>
                      <button onClick={(e) => { e.stopPropagation(); handleDeleteHistory(h.id); }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px', flexShrink: 0 }}>
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {histTotalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '8px' }}>
                  <button disabled={histPage === 0} onClick={() => loadHistory(histPage - 1)} className="glass-button" style={{ padding: '2px 10px', fontSize: '0.75rem' }}>上一页</button>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '24px' }}>{histPage + 1}/{histTotalPages}</span>
                  <button disabled={histPage >= histTotalPages - 1} onClick={() => loadHistory(histPage + 1)} className="glass-button" style={{ padding: '2px 10px', fontSize: '0.75rem' }}>下一页</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Main Preview Area */}
      <div style={{ flex: 1, padding: '32px', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-color-1)', overflowY: 'auto' }}>
        <div className="glass-panel" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.2)', border: '1px dashed var(--glass-border)', padding: '24px', overflow: 'auto' }}>
          {resultUrl ? (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
              <img src={resultUrl} alt="Generated" style={{ maxWidth: '100%', maxHeight: 'calc(100vh - 280px)', borderRadius: '12px', boxShadow: 'var(--shadow-lg)' }} />
              <div style={{ display: 'flex', gap: '16px' }}>
                <a href={resultUrl} target="_blank" rel="noreferrer" className="glass-button flex-center" style={{ padding: '8px 24px', gap: '8px', background: 'rgba(255,255,255,0.1)', color: 'var(--text-h)' }}>
                  <Download size={16} /> 保存图片
                </a>
              </div>
            </div>
          ) : loading ? (
             <div className="flex-center" style={{ flexDirection: 'column', gap: '16px', color: 'var(--accent-hover)' }}>
                <Loader2 size={48} className="animate-spin" />
                <p style={{ fontSize: '1.2rem', margin: 0 }}>AI 正在绘制您的想象...</p>
             </div>
          ) : (
            <div className="flex-center" style={{ flexDirection: 'column', gap: '16px', color: 'var(--text-muted)' }}>
              <ImageIcon size={64} style={{ opacity: 0.2 }} />
              <p style={{ fontSize: '1.1rem', margin: 0 }}>在左侧输入提示词，开始您的创作</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

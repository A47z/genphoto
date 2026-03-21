import { useState, useEffect } from 'react';
import client, { API_BASE } from '../api/client';
import type { MyStats } from '../types';
import { BarChart3, Image as ImageIcon, Calendar, Cpu, Palette, Download, TrendingUp } from 'lucide-react';

export default function StatsPage() {
  const [stats, setStats] = useState<MyStats | null>(null);
  const [modelStats, setModelStats] = useState<Record<string, number>>({});

  useEffect(() => {
    client.get('/api/stats/my').then((res) => setStats(res.data.data));
    client.get('/api/stats/my/models').then((res) => setModelStats(res.data.data));
  }, []);

  const handleExport = () => {
    const token = localStorage.getItem('token');
    window.open(`${API_BASE}/api/stats/export?token=${token}`, '_blank');
  };

  return (
    <div style={{ maxWidth: 1000, margin: '40px auto', padding: '0 24px' }} className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '12px', margin: '0 0 8px 0' }}>
            <BarChart3 size={32} color="var(--accent)" /> 数据看板
          </h2>
          <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.95rem' }}>总览您的 AI 创作历程与足迹</p>
        </div>
        <button onClick={handleExport} className="glass-button flex-center" style={{ gap: '8px', padding: '10px 20px' }}>
          <Download size={18} /> 导出 CSV
        </button>
      </div>

      {stats && (
        <div className="stats-bento-grid" style={{ marginBottom: '32px' }}>
          {/* Bento Cards */}
          <div className="glass-panel bento-card-large" style={{ display: 'flex', flexDirection: 'column', padding: '32px', background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.6), rgba(168, 85, 247, 0.15))', borderTop: '3px solid var(--accent-hover)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: 'auto', color: 'var(--text-muted)' }}>
              <ImageIcon size={24} color="var(--accent-hover)" /> <span style={{ fontSize: '1.2rem', fontWeight: 500, color: 'var(--text)' }}>总生成量</span>
            </div>
            <h3 style={{ fontSize: '4.5rem', margin: '24px 0 0 0', color: 'var(--text-h)', textShadow: '0 0 30px var(--accent-glow)', lineHeight: 1 }}>{stats.totalImages}</h3>
            <p style={{ margin: '16px 0 0 0', color: 'var(--text-muted)', fontSize: '1.05rem' }}>累计创作的灵感火花</p>
          </div>
          
          <div className="glass-panel bento-card-wide" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '24px 32px', background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.4), rgba(56, 189, 248, 0.05))', borderTop: '3px solid #38bdf8' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-muted)' }}>
                <Calendar size={20} color="#38bdf8" /> <span style={{ fontSize: '1.1rem', fontWeight: 500, color: 'var(--text)' }}>本周生成</span>
              </div>
              <h3 style={{ fontSize: '3.5rem', margin: 0, color: 'var(--text-h)', textShadow: '0 0 20px rgba(56, 189, 248, 0.3)', lineHeight: 1 }}>{stats.thisWeekImages}</h3>
            </div>
          </div>

          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', padding: '24px', background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.4), rgba(244, 114, 182, 0.05))', borderTop: '3px solid #f472b6' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', color: 'var(--text-muted)' }}>
              <Cpu size={20} color="#f472b6" /> <span style={{ fontWeight: 500, color: 'var(--text)' }}>最爱模型</span>
            </div>
            <h3 style={{ fontSize: '1.4rem', margin: 'auto 0 0 0', color: 'var(--text-h)', wordBreak: 'break-word', lineHeight: 1.3 }}>{stats.mostUsedModel || '暂无数据'}</h3>
          </div>

          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', padding: '24px', background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.4), rgba(52, 211, 153, 0.05))', borderTop: '3px solid #34d399' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', color: 'var(--text-muted)' }}>
              <Palette size={20} color="#34d399" /> <span style={{ fontWeight: 500, color: 'var(--text)' }}>常用风格</span>
            </div>
            <h3 style={{ fontSize: '1.4rem', margin: 'auto 0 0 0', color: 'var(--text-h)', wordBreak: 'break-word', lineHeight: 1.3 }}>{stats.mostUsedStyle || '暂无数据'}</h3>
          </div>
        </div>
      )}

      {/* Model Stats Section */}
      <div className="glass-panel" style={{ padding: '32px' }}>
         <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '16px' }}>
           <TrendingUp size={20} color="var(--accent)" /> 模型热度分布
         </h3>
         
         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
           {Object.entries(modelStats).map(([model, count]) => (
             <div key={model} style={{ padding: '16px 20px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-highlight)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'background 0.2s ease' }}
                  onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
             >
               <span style={{ fontWeight: 500, color: 'var(--text-h)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                 <Cpu size={14} color="var(--text-muted)"/> {model}
               </span>
               <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                 <div style={{ height: '4px', width: '60px', background: 'var(--glass-border)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.min(100, (count / (stats?.totalImages || 1)) * 100)}%`, background: 'var(--accent)' }} />
                 </div>
                 <span style={{ background: 'var(--glass-highlight)', padding: '4px 12px', borderRadius: '12px', fontSize: '0.85rem', color: 'var(--text-h)', minWidth: '40px', textAlign: 'center' }}>
                   {count}
                 </span>
               </div>
             </div>
           ))}
           {Object.keys(modelStats).length === 0 && (
             <div style={{ gridColumn: '1 / -1', padding: '32px', color: 'var(--text-muted)', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
               还没有生成过数据哦
             </div>
           )}
         </div>
      </div>
    </div>
  );
}

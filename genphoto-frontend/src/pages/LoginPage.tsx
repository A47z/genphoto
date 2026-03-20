import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { useAuthStore } from '../store/authStore';
import { Sparkles, Mail, Lock, User, ArrowRight, UserPlus } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegister) {
        await authApi.register(email, password, nickname);
        setIsRegister(false);
        setError('注册成功，请登录');
      } else {
        const res = await authApi.login(email, password);
        const data = res.data.data;
        setAuth(data.token, { id: data.userId, email: data.email, nickname: data.nickname, role: data.role } as any);
        navigate('/');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || '操作失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 73px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} className="animate-fade-in">
      <div className="glass-panel" style={{ width: '100%', maxWidth: '420px', padding: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
           <div className="flex-center" style={{ width: '64px', height: '64px', background: 'var(--glass-highlight)', borderRadius: '20px', margin: '0 auto 20px', boxShadow: 'inset 0 0 20px rgba(168, 85, 247, 0.2)' }}>
              <Sparkles size={32} color="var(--accent)" />
           </div>
           <h2 style={{ fontSize: '1.75rem', margin: '0 0 8px 0', color: 'var(--text-h)' }}>{isRegister ? '开启创作之旅' : '欢迎回来'}</h2>
           <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.95rem' }}>
              {!isRegister ? '登录以继续您的 AI 艺术探索' : '即刻注册，体验无限创意可能'}
           </p>
        </div>

        {error && (
          <div style={{ background: error.includes('成功') ? 'rgba(74, 222, 128, 0.1)' : 'rgba(239, 68, 68, 0.1)', border: `1px solid ${error.includes('成功') ? 'rgba(74, 222, 128, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`, color: error.includes('成功') ? '#4ade80' : '#fca5a5', padding: '12px', borderRadius: '8px', marginBottom: '24px', fontSize: '0.9rem', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {isRegister && (
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input type="text" placeholder="昵称 (Nickname)" value={nickname} onChange={(e) => setNickname(e.target.value)}
                className="glass-input" style={{ width: '100%', paddingLeft: '48px', boxSizing: 'border-box', height: '48px' }} required />
            </div>
          )}
          
          <div style={{ position: 'relative' }}>
            <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input type="email" placeholder="电子邮箱 (Email)" value={email} onChange={(e) => setEmail(e.target.value)}
              className="glass-input" style={{ width: '100%', paddingLeft: '48px', boxSizing: 'border-box', height: '48px' }} required />
          </div>
          
          <div style={{ position: 'relative' }}>
            <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input type="password" placeholder="密码 (Password)" value={password} onChange={(e) => setPassword(e.target.value)}
              className="glass-input" style={{ width: '100%', paddingLeft: '48px', boxSizing: 'border-box', height: '48px' }} required />
          </div>

          <button type="submit" disabled={loading} className="glass-button flex-center" style={{ width: '100%', padding: '14px', marginTop: '8px', fontSize: '1.05rem', gap: '8px' }}>
            {loading ? '请稍候...' : (!isRegister ? <><ArrowRight size={18} /> 登录系统</> : <><UserPlus size={18} /> 立即注册</>)}
          </button>
        </form>

        <div style={{ marginTop: '32px', textAlign: 'center' }}>
          <button type="button" onClick={() => { setIsRegister(!isRegister); setError(''); }}
            style={{ background: 'none', border: 'none', color: 'var(--accent-hover)', cursor: 'pointer', fontSize: '0.95rem', padding: '8px', transition: 'color 0.2s', textDecoration: 'none' }}
            onMouseOver={(e) => e.currentTarget.style.textDecoration = 'underline'}
            onMouseOut={(e) => e.currentTarget.style.textDecoration = 'none'}
          >
            {isRegister ? '已有账号？返回登录' : '还没账号？点此注册'}
          </button>
        </div>
      </div>
    </div>
  );
}

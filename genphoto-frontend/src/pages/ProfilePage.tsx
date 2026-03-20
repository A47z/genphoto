import { useState, useEffect } from 'react';
import { authApi } from '../api/authApi';
import { useAuthStore } from '../store/authStore';
import type { UserProfile } from '../types';
import { User, Mail, Shield, Calendar, Save, Lock, CheckCircle, AlertCircle } from 'lucide-react';

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [nickname, setNickname] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileMsg, setProfileMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [pwdMsg, setPwdMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);

  useEffect(() => {
    authApi.getProfile().then((res) => {
      const p = res.data.data;
      setProfile(p);
      setNickname(p.nickname || '');
    });
  }, []);

  const handleSaveProfile = async () => {
    if (!nickname.trim()) return;
    setSavingProfile(true);
    setProfileMsg(null);
    try {
      await authApi.updateProfile(nickname.trim());
      setProfileMsg({ type: 'ok', text: '资料更新成功' });
      if (user) setUser({ ...user, nickname: nickname.trim() });
    } catch (err: any) {
      setProfileMsg({ type: 'err', text: err.response?.data?.message || '更新失败' });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    setPwdMsg(null);
    if (!oldPassword || !newPassword) return;
    if (newPassword !== confirmPassword) {
      setPwdMsg({ type: 'err', text: '两次输入的新密码不一致' });
      return;
    }
    if (newPassword.length < 6) {
      setPwdMsg({ type: 'err', text: '新密码至少 6 个字符' });
      return;
    }
    setSavingPwd(true);
    try {
      await authApi.changePassword(oldPassword, newPassword);
      setPwdMsg({ type: 'ok', text: '密码修改成功' });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPwdMsg({ type: 'err', text: err.response?.data?.message || '密码修改失败' });
    } finally {
      setSavingPwd(false);
    }
  };

  if (!profile) return null;

  return (
    <div style={{ maxWidth: 560, margin: '40px auto', padding: '0 24px' }} className="animate-fade-in">
      {/* Profile Header */}
      <div className="glass-panel" style={{ padding: '32px', marginBottom: '24px', textAlign: 'center' }}>
        <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', color: '#fff', fontWeight: 600, margin: '0 auto 16px' }}>
          {(profile.nickname || '用').charAt(0).toUpperCase()}
        </div>
        <h2 style={{ margin: '0 0 8px 0', fontSize: '1.5rem' }}>{profile.nickname}</h2>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', color: 'var(--text-muted)', fontSize: '0.85rem', flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Mail size={14} /> {profile.email}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Shield size={14} /> {profile.role || 'USER'}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={14} /> {new Date(profile.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Edit Nickname */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <User size={18} color="var(--accent)" /> 修改昵称
        </h3>
        <div style={{ display: 'flex', gap: '12px' }}>
          <input className="glass-input" value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="输入新昵称" style={{ flex: 1, padding: '10px 14px' }} maxLength={20} />
          <button onClick={handleSaveProfile} disabled={savingProfile || !nickname.trim()} className="glass-button flex-center" style={{ padding: '10px 20px', gap: '6px', flexShrink: 0 }}>
            <Save size={16} /> 保存
          </button>
        </div>
        {profileMsg && (
          <div style={{ marginTop: '12px', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px', background: profileMsg.type === 'ok' ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.1)', border: `1px solid ${profileMsg.type === 'ok' ? 'rgba(52,211,153,0.3)' : 'rgba(248,113,113,0.3)'}`, color: profileMsg.type === 'ok' ? '#6ee7b7' : '#fca5a5' }}>
            {profileMsg.type === 'ok' ? <CheckCircle size={14} /> : <AlertCircle size={14} />} {profileMsg.text}
          </div>
        )}
      </div>

      {/* Change Password */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Lock size={18} color="var(--accent)" /> 修改密码
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input className="glass-input" type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} placeholder="当前密码" style={{ padding: '10px 14px' }} />
          <input className="glass-input" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="新密码（至少6位）" style={{ padding: '10px 14px' }} />
          <input className="glass-input" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="确认新密码" style={{ padding: '10px 14px' }} />
          <button onClick={handleChangePassword} disabled={savingPwd || !oldPassword || !newPassword || !confirmPassword} className="glass-button flex-center" style={{ padding: '10px 20px', gap: '6px', alignSelf: 'flex-end' }}>
            <Save size={16} /> 修改密码
          </button>
        </div>
        {pwdMsg && (
          <div style={{ marginTop: '12px', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px', background: pwdMsg.type === 'ok' ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.1)', border: `1px solid ${pwdMsg.type === 'ok' ? 'rgba(52,211,153,0.3)' : 'rgba(248,113,113,0.3)'}`, color: pwdMsg.type === 'ok' ? '#6ee7b7' : '#fca5a5' }}>
            {pwdMsg.type === 'ok' ? <CheckCircle size={14} /> : <AlertCircle size={14} />} {pwdMsg.text}
          </div>
        )}
      </div>
    </div>
  );
}

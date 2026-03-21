import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { useFavoriteStore } from './store/favoriteStore';
import { Sparkles, Image as ImageIcon, LayoutGrid, Compass, BarChart2, LogOut, User, Heart } from 'lucide-react';
import LoginPage from './pages/LoginPage';
import GeneratePage from './pages/GeneratePage';
import GalleryPage from './pages/GalleryPage';
import ExplorePage from './pages/ExplorePage';
import StatsPage from './pages/StatsPage';
import ProfilePage from './pages/ProfilePage';
import FavoritesPage from './pages/FavoritesPage';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  return isLoggedIn ? <>{children}</> : <Navigate to="/login" />;
}

function NavBar() {
  const { isLoggedIn, user, logout } = useAuthStore();
  const location = useLocation();

  const getLinkStyle = (path: string) => {
    const isActive = location.pathname === path || (path === '/generate' && location.pathname === '/');
    return {
      color: isActive ? 'var(--accent-hover)' : 'var(--text)',
      background: isActive ? 'var(--glass-highlight)' : 'transparent',
      display: 'flex', alignItems: 'center', gap: '6px'
    };
  };

  return (
    <nav className="glass-nav" style={{ padding: '1rem 2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', minWidth: '200px' }}>
        <Link to="/" className="logo-link flex-center" style={{ gap: '8px' }}>
          <Sparkles size={24} color="var(--accent)" />
          GenPhoto
        </Link>
      </div>

      <div style={{ display: 'flex', gap: '8px', flex: 1, justifyContent: 'center' }}>
        <Link to="/generate" style={getLinkStyle('/generate')}><ImageIcon size={18} /> 生成</Link>
        <Link to="/gallery" style={getLinkStyle('/gallery')}><LayoutGrid size={18} /> 图库</Link>
        <Link to="/favorites" style={getLinkStyle('/favorites')}><Heart size={18} /> 收藏</Link>
        <Link to="/explore" style={getLinkStyle('/explore')}><Compass size={18} /> 广场</Link>
        <Link to="/stats" style={getLinkStyle('/stats')}><BarChart2 size={18} /> 统计</Link>
      </div>

      <div style={{ display: 'flex', minWidth: '200px', justifyContent: 'flex-end' }}>
        {isLoggedIn ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link to="/profile" style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}>
              <User size={16} /> {user?.nickname || '用户'}
            </Link>
            <button onClick={logout} className="glass-button flex-center" style={{ padding: '0.4rem 1rem', fontSize: '0.9rem', gap: '6px' }}>
              <LogOut size={16} /> 退出
            </button>
          </div>
        ) : (
          <Link to="/login" className="glass-button flex-center" style={{ padding: '0.4rem 1.5rem', fontSize: '0.9rem', color: 'white', gap: '6px' }}>
            <User size={16} /> 登录
          </Link>
        )}
      </div>
    </nav>
  );
}

function FavoriteInit() {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const { loadFavorites, clear, loaded } = useFavoriteStore();
  useEffect(() => {
    if (isLoggedIn && !loaded) loadFavorites();
    if (!isLoggedIn) clear();
  }, [isLoggedIn]);
  return null;
}

function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <FavoriteInit />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/" element={<PrivateRoute><GeneratePage /></PrivateRoute>} />
        <Route path="/generate" element={<PrivateRoute><GeneratePage /></PrivateRoute>} />
        <Route path="/gallery" element={<PrivateRoute><GalleryPage /></PrivateRoute>} />
        <Route path="/stats" element={<PrivateRoute><StatsPage /></PrivateRoute>} />
        <Route path="/favorites" element={<PrivateRoute><FavoritesPage /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

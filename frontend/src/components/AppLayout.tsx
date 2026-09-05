import { Link } from 'react-router-dom';
import { Button } from 'antd';
import { useAuth } from '../context/AuthContext';

export function AppLayout({
  children,
  flush = false,
}: {
  children: React.ReactNode;
  flush?: boolean;
}) {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <div className="app-shell">
      <header className="app-nav">
        <Link to="/" className="app-brand">
          Evo<span>tec</span>
        </Link>
        <nav className="app-nav-actions">
          {!isAuthenticated && (
            <>
              <Link to="/register">
                <Button ghost style={{ color: '#f4faf7', borderColor: 'rgba(244,250,247,0.35)' }}>
                  Register
                </Button>
              </Link>
              <Link to="/login">
                <Button
                  type="primary"
                  style={{ background: '#1a9b7a', borderColor: '#1a9b7a' }}
                >
                  Customer login
                </Button>
              </Link>
              <Link to="/admin/login">
                <Button style={{ background: 'transparent', color: '#e8dcc8', borderColor: '#c4a574' }}>
                  Admin
                </Button>
              </Link>
            </>
          )}
          {user?.role === 'CUSTOMER' && (
            <Link to="/application">
              <Button type="primary" style={{ background: '#1a9b7a', borderColor: '#1a9b7a' }}>
                Application
              </Button>
            </Link>
          )}
          {user?.role === 'ADMIN' && (
            <Link to="/admin/dashboard">
              <Button type="primary" style={{ background: '#1a9b7a', borderColor: '#1a9b7a' }}>
                Dashboard
              </Button>
            </Link>
          )}
          {isAuthenticated && (
            <>
              <span className="app-nav-user" title={user?.email}>
                {user?.email}
              </span>
              <Button
                ghost
                onClick={logout}
                style={{ color: '#f4faf7', borderColor: 'rgba(244,250,247,0.35)' }}
              >
                Logout
              </Button>
            </>
          )}
        </nav>
      </header>
      <main className={flush ? 'app-main app-main--flush' : 'app-main'}>{children}</main>
      {!flush && (
        <footer className="app-footer">Evotec — form management technical assignment</footer>
      )}
    </div>
  );
}

export function PageIntro({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="page-intro rise">
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button, Drawer } from 'antd';
import { MenuOutlined, CloseOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';

export function AppLayout({
  children,
  flush = false,
}: {
  children: React.ReactNode;
  flush?: boolean;
}) {
  const { user, logout, isAuthenticated } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const closeMenu = () => setMenuOpen(false);

  const navLinks = (
    <>
      {!isAuthenticated && (
        <>
          <Link to="/register" className="nav-link" onClick={closeMenu}>
            Register
          </Link>
          <Link to="/login" className="nav-link" onClick={closeMenu}>
            Customer login
          </Link>
          <Link to="/admin/login" className="nav-link nav-link--accent" onClick={closeMenu}>
            Admin
          </Link>
        </>
      )}
      {user?.role === 'CUSTOMER' && (
        <Link to="/application" className="nav-link nav-link--primary" onClick={closeMenu}>
          Application
        </Link>
      )}
      {user?.role === 'ADMIN' && (
        <Link to="/admin/dashboard" className="nav-link nav-link--primary" onClick={closeMenu}>
          Dashboard
        </Link>
      )}
      {isAuthenticated && (
        <>
          <span className="app-nav-user" title={user?.email}>
            {user?.email}
          </span>
          <Button
            ghost
            className="nav-logout"
            onClick={() => {
              closeMenu();
              logout();
            }}
          >
            Logout
          </Button>
        </>
      )}
    </>
  );

  return (
    <div className="app-shell">
      <header className="app-nav">
        <Link to="/" className="app-brand">
          Evo<span>tec</span>
        </Link>

        <nav className="app-nav-actions app-nav-actions--desktop">{navLinks}</nav>

        <Button
          type="text"
          className="nav-menu-btn"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          icon={menuOpen ? <CloseOutlined /> : <MenuOutlined />}
          onClick={() => setMenuOpen((open) => !open)}
        />
      </header>

      <Drawer
        placement="right"
        open={menuOpen}
        onClose={closeMenu}
        size="default"
        className="nav-drawer"
        styles={{
          body: { padding: 20, background: '#0c1f1a' },
          header: { background: '#0c1f1a', borderBottom: '1px solid rgba(255,255,255,0.08)' },
        }}
        title={<span style={{ color: '#f4faf7', fontFamily: 'Syne, sans-serif' }}>Menu</span>}
      >
        <nav className="app-nav-actions app-nav-actions--drawer">{navLinks}</nav>
      </Drawer>

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

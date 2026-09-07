import { Link } from 'react-router-dom';
import { Button } from 'antd';
import { AppLayout } from '../components/AppLayout';
import { useAuth } from '../context/AuthContext';

export default function HomePage() {
  const { isAuthenticated, user } = useAuth();

  const primaryCta =
    user?.role === 'ADMIN' ? (
      <Link to="/admin/dashboard">
        <Button
          type="primary"
          size="large"
          className="hero-cta"
          style={{ height: 48, paddingInline: 28, background: '#1a9b7a', borderColor: '#1a9b7a' }}
        >
          Open dashboard
        </Button>
      </Link>
    ) : user?.role === 'CUSTOMER' ? (
      <Link to="/application">
        <Button
          type="primary"
          size="large"
          style={{ height: 48, paddingInline: 28, background: '#1a9b7a', borderColor: '#1a9b7a' }}
        >
          Continue application
        </Button>
      </Link>
    ) : (
      <Link to="/register">
        <Button
          type="primary"
          size="large"
          style={{ height: 48, paddingInline: 28, background: '#1a9b7a', borderColor: '#1a9b7a' }}
        >
          Get started
        </Button>
      </Link>
    );

  return (
    <AppLayout flush>
      <section className="hero">
        <div className="hero__orb hero__orb--a" aria-hidden />
        <div className="hero__orb hero__orb--b" aria-hidden />
        <div className="hero__inner">
          <h1 className="hero__brand rise">
            Evo<span>tec</span>
          </h1>
          <p className="hero__lead rise rise-delay-1">
            Submit applications securely, or manage every submission from one calm admin workspace.
          </p>
          <div className="hero__ctas rise rise-delay-2">
            {primaryCta}
            {!isAuthenticated && (
              <Link to="/admin/login">
                <Button
                  size="large"
                  ghost
                  style={{
                    height: 48,
                    paddingInline: 24,
                    color: '#e8dcc8',
                    borderColor: 'rgba(232, 220, 200, 0.55)',
                  }}
                >
                  Admin sign in
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>
    </AppLayout>
  );
}

import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ConfigProvider, Spin } from 'antd';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

const HomePage = lazy(() => import('./pages/HomePage'));
const CustomerRegisterPage = lazy(() => import('./pages/CustomerRegisterPage'));
const CustomerLoginPage = lazy(() => import('./pages/CustomerLoginPage'));
const ApplicationPage = lazy(() => import('./pages/ApplicationPage'));
const AdminLoginPage = lazy(() => import('./pages/AdminLoginPage'));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage'));

function PageLoader() {
  return (
    <div
      style={{
        minHeight: '50vh',
        display: 'grid',
        placeItems: 'center',
      }}
    >
      <Spin size="large" />
    </div>
  );
}

export default function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#0d6b56',
          colorLink: '#0d6b56',
          colorSuccess: '#1a9b7a',
          colorWarning: '#c4a574',
          colorError: '#b42318',
          colorText: '#0c1f1a',
          colorTextSecondary: '#2a4038',
          borderRadius: 10,
          fontFamily: '"Manrope", sans-serif',
          controlHeight: 40,
        },
        components: {
          Button: {
            primaryShadow: 'none',
            fontWeight: 600,
          },
          Input: {
            activeBorderColor: '#0d6b56',
            hoverBorderColor: '#1a9b7a',
          },
          Table: {
            headerBg: 'rgba(13, 107, 86, 0.06)',
            rowHoverBg: 'rgba(13, 107, 86, 0.04)',
          },
        },
      }}
    >
      <AuthProvider>
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/register" element={<CustomerRegisterPage />} />
              <Route path="/login" element={<CustomerLoginPage />} />
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route element={<ProtectedRoute role="CUSTOMER" />}>
                <Route path="/application" element={<ApplicationPage />} />
              </Route>
              <Route element={<ProtectedRoute role="ADMIN" />}>
                <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </ConfigProvider>
  );
}

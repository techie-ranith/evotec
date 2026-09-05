import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import CustomerRegisterPage from './pages/CustomerRegisterPage';
import CustomerLoginPage from './pages/CustomerLoginPage';
import ApplicationPage from './pages/ApplicationPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

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
        </BrowserRouter>
      </AuthProvider>
    </ConfigProvider>
  );
}

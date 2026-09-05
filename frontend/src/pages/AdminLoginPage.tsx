import { Form, Input, Button, Alert } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { AppLayout, PageIntro } from '../components/AppLayout';
import { useAuth } from '../context/AuthContext';

export default function AdminLoginPage() {
  const { loginAdmin } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: { email: string; password: string }) => {
    setError(null);
    setLoading(true);
    try {
      await loginAdmin(values.email, values.password);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <PageIntro
        title="Admin access"
        description="Sign in with an admin account to review and manage submissions."
      />
      <div className="panel panel--narrow rise rise-delay-1">
        {error && (
          <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} />
        )}
        <Form layout="vertical" onFinish={onFinish} requiredMark={false} size="large">
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Email is required' },
              { type: 'email', message: 'Enter a valid email' },
            ]}
          >
            <Input autoComplete="email" placeholder="admin@evotec.local" />
          </Form.Item>
          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: 'Password is required' }]}
          >
            <Input.Password autoComplete="current-password" placeholder="••••••••" />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Enter dashboard
          </Button>
        </Form>
      </div>
    </AppLayout>
  );
}

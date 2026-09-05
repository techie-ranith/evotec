import { Form, Input, Button, Alert } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { AppLayout, PageIntro } from '../components/AppLayout';
import { useAuth } from '../context/AuthContext';

export default function CustomerLoginPage() {
  const { loginCustomer } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: { email: string; password: string }) => {
    setError(null);
    setLoading(true);
    try {
      await loginCustomer(values.email, values.password);
      navigate('/application');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <PageIntro
        title="Customer sign in"
        description="Welcome back. Sign in to open your application form."
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
            <Input autoComplete="email" placeholder="you@example.com" />
          </Form.Item>
          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: 'Password is required' }]}
          >
            <Input.Password autoComplete="current-password" placeholder="••••••••" />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Sign in
          </Button>
        </Form>
        <p className="panel-meta">
          Need an account? <Link to="/register">Create one</Link>
        </p>
      </div>
    </AppLayout>
  );
}

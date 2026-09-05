import { Form, Input, Button, Alert } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { AppLayout, PageIntro } from '../components/AppLayout';
import { useAuth } from '../context/AuthContext';

export default function CustomerRegisterPage() {
  const { registerCustomer } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: {
    email: string;
    password: string;
    confirmPassword: string;
  }) => {
    setError(null);
    setLoading(true);
    try {
      await registerCustomer(values.email, values.password, values.confirmPassword);
      navigate('/application');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <PageIntro
        title="Create your account"
        description="Register as a customer to submit an application. Passwords need at least 4 characters."
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
            rules={[
              { required: true, message: 'Password is required' },
              { min: 4, message: 'Minimum 4 characters' },
            ]}
          >
            <Input.Password autoComplete="new-password" placeholder="••••••••" />
          </Form.Item>
          <Form.Item
            label="Confirm password"
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Confirm your password' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Passwords must match'));
                },
              }),
            ]}
          >
            <Input.Password autoComplete="new-password" placeholder="••••••••" />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Register
          </Button>
        </Form>
        <p className="panel-meta">
          Already registered? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </AppLayout>
  );
}

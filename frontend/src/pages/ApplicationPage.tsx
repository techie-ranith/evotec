import { Form, Input, Button, Alert, Select, Row, Col } from 'antd';
import { useState } from 'react';
import { AppLayout, PageIntro } from '../components/AppLayout';
import { apiRequest } from '../api/client';

export default function ApplicationPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const onFinish = async (values: {
    firstName: string;
    lastName: string;
    email: string;
    gender: 'MALE' | 'FEMALE' | 'OTHER';
    mobileNumber: string;
    address: string;
    feedback?: string;
  }) => {
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      await apiRequest('/api/forms', {
        method: 'POST',
        body: JSON.stringify(values),
      });
      setSuccess('Application submitted successfully.');
      form.resetFields();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <PageIntro
        title="Application"
        description="Tell us about yourself. Feedback is optional — everything else is required."
      />
      <div className="panel panel--form rise rise-delay-1">
        {error && (
          <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} />
        )}
        {success && (
          <Alert type="success" message={success} showIcon style={{ marginBottom: 16 }} />
        )}
        <Form layout="vertical" form={form} onFinish={onFinish} requiredMark size="large">
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="First name"
                name="firstName"
                rules={[{ required: true, message: 'First name is required' }]}
              >
                <Input placeholder="Jane" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Last name"
                name="lastName"
                rules={[{ required: true, message: 'Last name is required' }]}
              >
                <Input placeholder="Doe" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Email is required' },
              { type: 'email', message: 'Enter a valid email' },
            ]}
          >
            <Input placeholder="jane@example.com" />
          </Form.Item>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Gender"
                name="gender"
                rules={[{ required: true, message: 'Gender is required' }]}
              >
                <Select
                  placeholder="Select"
                  options={[
                    { value: 'MALE', label: 'Male' },
                    { value: 'FEMALE', label: 'Female' },
                    { value: 'OTHER', label: 'Other' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Mobile number"
                name="mobileNumber"
                rules={[
                  { required: true, message: 'Mobile number is required' },
                  {
                    pattern: /^(?:0|94|\+94)7\d{8}$/,
                    message: 'Use Sri Lankan format (e.g. 0771234567 or +94771234567)',
                  },
                ]}
              >
                <Input placeholder="0771234567" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            label="Address"
            name="address"
            rules={[{ required: true, message: 'Address is required' }]}
          >
            <Input.TextArea rows={3} placeholder="Street, city" />
          </Form.Item>
          <Form.Item label="Feedback" name="feedback">
            <Input.TextArea rows={3} placeholder="Anything else we should know?" />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Submit application
          </Button>
        </Form>
      </div>
    </AppLayout>
  );
}

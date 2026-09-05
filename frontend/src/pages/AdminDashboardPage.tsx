import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { AppLayout, PageIntro } from '../components/AppLayout';
import { apiRequest, type FormSubmission } from '../api/client';

export default function AdminDashboardPage() {
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gender, setGender] = useState<string | undefined>();
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<FormSubmission | null>(null);
  const [createAdminOpen, setCreateAdminOpen] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
  const [editForm] = Form.useForm();
  const [adminForm] = Form.useForm();

  const loadSubmissions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (gender) params.set('gender', gender);
      if (search.trim()) params.set('search', search.trim());
      const qs = params.toString();
      const data = await apiRequest<{ submissions: FormSubmission[] }>(
        `/api/forms${qs ? `?${qs}` : ''}`
      );
      setSubmissions(data.submissions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load submissions');
    } finally {
      setLoading(false);
    }
  }, [gender, search]);

  useEffect(() => {
    void loadSubmissions();
  }, [loadSubmissions]);

  const openEdit = (record: FormSubmission) => {
    setEditing(record);
    editForm.setFieldsValue({
      firstName: record.firstName,
      lastName: record.lastName,
      email: record.email,
      gender: record.gender,
      mobileNumber: record.mobileNumber,
      address: record.address,
      feedback: record.feedback,
    });
  };

  const saveEdit = async () => {
    if (!editing) return;
    try {
      const values = await editForm.validateFields();
      await apiRequest(`/api/forms/${editing._id}`, {
        method: 'PUT',
        body: JSON.stringify(values),
      });
      message.success('Submission updated');
      setEditing(null);
      await loadSubmissions();
    } catch (err) {
      if (err instanceof Error) {
        message.error(err.message);
      }
    }
  };

  const deleteSubmission = async (id: string) => {
    try {
      await apiRequest(`/api/forms/${id}`, { method: 'DELETE' });
      message.success('Submission deleted');
      await loadSubmissions();
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  const createAdmin = async () => {
    try {
      const values = await adminForm.validateFields();
      const data = await apiRequest<{
        generatedPassword: string;
        user: { email: string };
      }>('/api/auth/admin/create', {
        method: 'POST',
        body: JSON.stringify(values),
      });
      setGeneratedPassword(data.generatedPassword);
      message.success(`Admin created: ${data.user.email}`);
      adminForm.resetFields();
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Failed to create admin');
    }
  };

  const columns: ColumnsType<FormSubmission> = [
    {
      title: 'Name',
      key: 'name',
      render: (_, r) => (
        <span style={{ fontWeight: 600 }}>
          {r.firstName} {r.lastName}
        </span>
      ),
    },
    { title: 'Email', dataIndex: 'email' },
    {
      title: 'Gender',
      dataIndex: 'gender',
      width: 110,
      render: (g: string) => <Tag className="gender-tag">{g}</Tag>,
    },
    { title: 'Mobile', dataIndex: 'mobileNumber' },
    { title: 'Address', dataIndex: 'address', ellipsis: true },
    {
      title: 'Created',
      dataIndex: 'dateCreated',
      width: 170,
      render: (v: string) => new Date(v).toLocaleString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 160,
      render: (_, record) => (
        <Space>
          <Button size="small" type="link" onClick={() => openEdit(record)}>
            Edit
          </Button>
          <Popconfirm
            title="Delete this submission?"
            onConfirm={() => deleteSubmission(record._id)}
          >
            <Button size="small" type="link" danger>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <AppLayout>
      <PageIntro
        title="Submissions"
        description="Filter by gender, search by name, then edit or remove records as needed."
      />

      <div className="toolbar rise rise-delay-1">
        <Select
          allowClear
          placeholder="Gender"
          style={{ width: 150 }}
          value={gender}
          onChange={(v) => setGender(v)}
          options={[
            { value: 'MALE', label: 'Male' },
            { value: 'FEMALE', label: 'Female' },
            { value: 'OTHER', label: 'Other' },
          ]}
        />
        <Input.Search
          placeholder="Search name…"
          allowClear
          style={{ width: 240, maxWidth: '100%' }}
          onSearch={(value) => setSearch(value)}
          onChange={(e) => {
            if (!e.target.value) setSearch('');
          }}
        />
        <Button onClick={() => void loadSubmissions()}>Refresh</Button>
        <Button type="primary" ghost onClick={() => setCreateAdminOpen(true)}>
          Create admin
        </Button>
        <div className="dash-stat">
          <strong>{submissions.length}</strong>
          <span>shown</span>
        </div>
      </div>

      {error && (
        <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} />
      )}

      <div className="panel panel--wide rise rise-delay-2">
        <Table
          rowKey="_id"
          loading={loading}
          columns={columns}
          dataSource={submissions}
          scroll={{ x: true }}
          pagination={{ pageSize: 10, showSizeChanger: false }}
        />
      </div>

      <Modal
        title="Edit submission"
        open={Boolean(editing)}
        onCancel={() => setEditing(null)}
        onOk={() => void saveEdit()}
        okText="Save changes"
        destroyOnHidden
      >
        <Form layout="vertical" form={editForm} requiredMark={false}>
          <Form.Item
            label="First name"
            name="firstName"
            rules={[{ required: true, message: 'Required' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Last name"
            name="lastName"
            rules={[{ required: true, message: 'Required' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Required' },
              { type: 'email', message: 'Valid email required' },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Gender"
            name="gender"
            rules={[{ required: true, message: 'Required' }]}
          >
            <Select
              options={[
                { value: 'MALE', label: 'Male' },
                { value: 'FEMALE', label: 'Female' },
                { value: 'OTHER', label: 'Other' },
              ]}
            />
          </Form.Item>
          <Form.Item
            label="Mobile"
            name="mobileNumber"
            rules={[
              { required: true, message: 'Required' },
              {
                pattern: /^(?:0|94|\+94)7\d{8}$/,
                message: 'Sri Lankan mobile (e.g. 0771234567)',
              },
            ]}
          >
            <Input placeholder="0771234567" />
          </Form.Item>
          <Form.Item
            label="Address"
            name="address"
            rules={[{ required: true, message: 'Required' }]}
          >
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item label="Feedback" name="feedback">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Create admin"
        open={createAdminOpen}
        onCancel={() => {
          setCreateAdminOpen(false);
          setGeneratedPassword(null);
          adminForm.resetFields();
        }}
        onOk={() => void createAdmin()}
        okText="Create"
        destroyOnHidden
      >
        <Form layout="vertical" form={adminForm} requiredMark={false}>
          <Form.Item
            label="Admin email"
            name="email"
            rules={[
              { required: true, message: 'Email is required' },
              { type: 'email', message: 'Enter a valid email' },
            ]}
          >
            <Input placeholder="new.admin@evotec.local" />
          </Form.Item>
        </Form>
        {generatedPassword && (
          <Alert
            type="success"
            showIcon
            message="Generated password — copy it now"
            description={generatedPassword}
          />
        )}
      </Modal>
    </AppLayout>
  );
}

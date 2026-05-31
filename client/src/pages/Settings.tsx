import { Card, Form, Input, Button, message, Tabs, Divider, Descriptions } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useAuthStore } from '../stores/authStore'
import { useEffect, useState } from 'react'
import api from '../utils/api'

const Settings = () => {
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [passwordForm] = Form.useForm()
  const [profileForm] = Form.useForm()

  useEffect(() => {
    if (user) {
      profileForm.setFieldsValue({
        username: user.username,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
      })
    }
  }, [user, profileForm])

  const handleProfileUpdate = async (values: any) => {
    try {
      setLoading(true)
      await api.put(`/users/${user?.id}`, values)
      message.success('个人资料更新成功')
    } catch (error) {
      message.error('更新失败')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async (values: any) => {
    try {
      setLoading(true)
      await api.post(`/users/${user?.id}/change-password`, {
        current_password: values.current_password,
        new_password: values.new_password,
      })
      message.success('密码修改成功')
      passwordForm.resetFields()
    } catch (error) {
      message.error('密码修改失败')
    } finally {
      setLoading(false)
    }
  }

  const getRoleText = (role?: string) => {
    const texts: Record<string, string> = {
      admin: '管理员',
      manager: '经理',
      employee: '员工',
      viewer: '查看者',
    }
    return texts[role || ''] || role || '-'
  }

  const items = [
    {
      key: 'profile',
      label: '个人资料',
      children: (
        <Card>
          <Descriptions title="用户信息" bordered>
            <Descriptions.Item label="用户ID">{user?.id}</Descriptions.Item>
            <Descriptions.Item label="用户名">{user?.username}</Descriptions.Item>
            <Descriptions.Item label="角色">{getRoleText(user?.role)}</Descriptions.Item>
            <Descriptions.Item label="部门ID">{user?.department_id || '-'}</Descriptions.Item>
            <Descriptions.Item label="最后登录">
              {user?.last_login
                ? new Date(user.last_login).toLocaleString()
                : '从未登录'}
            </Descriptions.Item>
          </Descriptions>

          <Divider />

          <Form
            form={profileForm}
            layout="vertical"
            onFinish={handleProfileUpdate}
          >
            <Form.Item
              name="username"
              label="用户名"
              rules={[{ required: true, message: '请输入用户名' }]}
            >
              <Input prefix={<UserOutlined />} disabled />
            </Form.Item>

            <Form.Item
              name="email"
              label="邮箱"
              rules={[
                { required: true, message: '请输入邮箱' },
                { type: 'email', message: '请输入有效的邮箱地址' },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="first_name"
              label="名"
              rules={[{ required: true, message: '请输入名' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="last_name"
              label="姓"
              rules={[{ required: true, message: '请输入姓' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading}>
                更新资料
              </Button>
            </Form.Item>
          </Form>
        </Card>
      ),
    },
    {
      key: 'security',
      label: '安全设置',
      children: (
        <Card>
          <Form
            form={passwordForm}
            layout="vertical"
            onFinish={handlePasswordChange}
          >
            <Form.Item
              name="current_password"
              label="当前密码"
              rules={[{ required: true, message: '请输入当前密码' }]}
            >
              <Input.Password prefix={<LockOutlined />} />
            </Form.Item>

            <Form.Item
              name="new_password"
              label="新密码"
              rules={[
                { required: true, message: '请输入新密码' },
                { min: 6, message: '密码至少为6个字符' },
              ]}
            >
              <Input.Password prefix={<LockOutlined />} />
            </Form.Item>

            <Form.Item
              name="confirm_password"
              label="确认新密码"
              dependencies={['new_password']}
              rules={[
                { required: true, message: '请确认新密码' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('new_password') === value) {
                      return Promise.resolve()
                    }
                    return Promise.reject(new Error('两次输入的密码不一致'))
                  },
                }),
              ]}
            >
              <Input.Password prefix={<LockOutlined />} />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading}>
                修改密码
              </Button>
            </Form.Item>
          </Form>
        </Card>
      ),
    },
    {
      key: 'system',
      label: '系统信息',
      children: (
        <Card>
          <Descriptions title="系统信息" bordered column={1}>
            <Descriptions.Item label="系统名称">
              企业管理系统
            </Descriptions.Item>
            <Descriptions.Item label="版本">
              v1.0.0
            </Descriptions.Item>
            <Descriptions.Item label="环境">
              开发环境
            </Descriptions.Item>
            <Descriptions.Item label="技术栈">
              React + TypeScript + Ant Design + Node.js + Express + SQLite
            </Descriptions.Item>
            <Descriptions.Item label="创建时间">
              2026年
            </Descriptions.Item>
            <Descriptions.Item label="开发团队">
              一诺科技团队
            </Descriptions.Item>
          </Descriptions>

          <Divider />

          <Card
            type="inner"
            title="功能模块"
            style={{ marginTop: '16px' }}
          >
            <p>用户管理</p>
            <p>部门管理</p>
            <p>项目管理</p>
            <p>财务管理</p>
            <p>报表分析</p>
            <p>系统设置</p>
          </Card>
        </Card>
      ),
    },
  ]

  return (
    <div>
      <h1 style={{ marginBottom: '24px' }}>系统设置</h1>
      <Tabs items={items} />
    </div>
  )
}

export default Settings

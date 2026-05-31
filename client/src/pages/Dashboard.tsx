import { Card, Row, Col, Statistic, Table, Tag, Space } from 'antd'
import {
  UserOutlined,
  TeamOutlined,
  FolderOutlined,
  DollarOutlined,
} from '@ant-design/icons'
import { useEffect, useState } from 'react'
import api from '../utils/api'

interface DashboardStats {
  totalUsers: number
  totalDepartments: number
  totalProjects: number
  activeProjects: number
  totalRevenue: number
  totalExpenses: number
}

const Dashboard = () => {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalDepartments: 0,
    totalProjects: 0,
    activeProjects: 0,
    totalRevenue: 0,
    totalExpenses: 0,
  })
  const [recentActivities, setRecentActivities] = useState<any[]>([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      // Fetch basic stats
      const [usersRes, departmentsRes, projectsRes, financialRes] = await Promise.all([
        api.get('/users', { params: { limit: 1 } }),
        api.get('/departments'),
        api.get('/projects', { params: { limit: 1 } }),
        api.get('/financial/summary'),
      ])

      const financialData = financialRes.data.totals || { total_income: 0, total_expense: 0 }

      setStats({
        totalUsers: usersRes.data.pagination?.total || 0,
        totalDepartments: departmentsRes.data.length || 0,
        totalProjects: projectsRes.data.pagination?.total || 0,
        activeProjects: 0, // Will be updated when we filter by status
        totalRevenue: financialData.total_income || 0,
        totalExpenses: financialData.total_expense || 0,
      })

      // Fetch active projects count
      const activeProjectsRes = await api.get('/projects', {
        params: { status: 'active', limit: 1 },
      })
      setStats(prev => ({
        ...prev,
        activeProjects: activeProjectsRes.data.pagination?.total || 0,
      }))

      setRecentActivities([
        {
          id: 1,
          type: 'project',
          description: '新项目"ERP系统升级"已创建',
          time: '2小时前',
        },
        {
          id: 2,
          type: 'user',
          description: '新员工"张三"已加入公司',
          time: '5小时前',
        },
        {
          id: 3,
          type: 'financial',
          description: '收到客户付款$50,000',
          time: '1天前',
        },
        {
          id: 4,
          type: 'department',
          description: '研发部门已完成季度报告',
          time: '2天前',
        },
      ])
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const activityColumns = [
    {
      title: '活动',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '时间',
      dataIndex: 'time',
      key: 'time',
      width: 120,
    },
  ]

  const projectColumns = [
    {
      title: '项目名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusMap: Record<string, { color: string; text: string }> = {
          active: { color: 'green', text: '进行中' },
          planning: { color: 'blue', text: '计划中' },
          completed: { color: 'default', text: '已完成' },
          'on-hold': { color: 'orange', text: '暂停' },
        }
        const { color, text } = statusMap[status] || { color: 'default', text: status }
        return <Tag color={color}>{text}</Tag>
      },
    },
    {
      title: '进度',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress: number) => `${progress}%`,
    },
  ]

  return (
    <div>
      <h1 style={{ marginBottom: '24px' }}>工作台</h1>

      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总用户数"
              value={stats.totalUsers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="部门数"
              value={stats.totalDepartments}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="项目总数"
              value={stats.totalProjects}
              prefix={<FolderOutlined />}
              suffix={`/ ${stats.activeProjects} 进行中`}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="净收益"
              value={stats.totalRevenue - stats.totalExpenses}
              prefix={<DollarOutlined />}
              precision={2}
              valueStyle={{
                color: stats.totalRevenue - stats.totalExpenses >= 0 ? '#3f8600' : '#cf1322',
              }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="最近活动" loading={loading}>
            <Table
              dataSource={recentActivities}
              columns={activityColumns}
              pagination={false}
              size="small"
              rowKey="id"
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="项目概览" loading={loading}>
            <Table
              dataSource={[
                { key: 'erp', name: 'ERP系统升级', status: 'active', progress: 75 },
                { key: 'mobile', name: '移动应用开发', status: 'planning', progress: 0 },
                { key: 'web', name: '网站改版', status: 'active', progress: 45 },
                { key: 'db', name: '数据库迁移', status: 'completed', progress: 100 },
              ]}
              columns={projectColumns}
              pagination={false}
              size="small"
              rowKey="key"
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Dashboard

import { Card, Row, Col, Statistic, Table, Tag } from 'antd'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useEffect, useState } from 'react'
import api from '../utils/api'

const Reports = () => {
  const [loading, setLoading] = useState(false)
  const [departmentData, setDepartmentData] = useState<any[]>([])
  const [monthlyRevenue, setMonthlyRevenue] = useState<any[]>([])
  const [projectStatus, setProjectStatus] = useState<any[]>([])

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

  useEffect(() => {
    fetchReportData()
  }, [])

  const fetchReportData = async () => {
    try {
      setLoading(true)

      // Fetch department employee counts
      const deptRes = await api.get('/departments')
      const deptData = deptRes.data.map((dept: any) => ({
        name: dept.name,
        employees: dept.employee_count || 0,
        budget: dept.budget || 0,
      }))
      setDepartmentData(deptData)

      // Mock monthly revenue data (in real app, fetch from API)
      setMonthlyRevenue([
        { month: '1月', revenue: 45000, expenses: 32000 },
        { month: '2月', revenue: 52000, expenses: 28000 },
        { month: '3月', revenue: 48000, expenses: 35000 },
        { month: '4月', revenue: 61000, expenses: 40000 },
        { month: '5月', revenue: 55000, expenses: 38000 },
        { month: '6月', revenue: 67000, expenses: 42000 },
      ])

      // Mock project status data
      setProjectStatus([
        { name: '进行中', value: 8, color: '#52c41a' },
        { name: '计划中', value: 3, color: '#1890ff' },
        { name: '已完成', value: 12, color: '#8c8c8c' },
        { name: '暂停', value: 2, color: '#faad14' },
        { name: '已取消', value: 1, color: '#ff4d4f' },
      ])
    } catch (error) {
      console.error('Failed to fetch report data:', error)
    } finally {
      setLoading(false)
    }
  }

  const topProjectsColumns = [
    {
      title: '项目名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '预算',
      dataIndex: 'budget',
      key: 'budget',
      render: (budget: number) => `$${budget?.toLocaleString() || 0}`,
    },
    {
      title: '实际成本',
      dataIndex: 'actual_cost',
      key: 'actual_cost',
      render: (cost: number) => `$${cost?.toLocaleString() || 0}`,
    },
    {
      title: '进度',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress: number) => `${progress}%`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusMap: Record<string, { color: string; text: string }> = {
          active: { color: 'green', text: '进行中' },
          completed: { color: 'default', text: '已完成' },
        }
        const { color, text } = statusMap[status] || { color: 'default', text: status }
        return <Tag color={color}>{text}</Tag>
      },
    },
  ]

  return (
    <div>
      <h1 style={{ marginBottom: '24px' }}>报表分析</h1>

      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} lg={12}>
          <Card title="月度收支趋势" loading={loading}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#52c41a" name="收入" />
                <Line type="monotone" dataKey="expenses" stroke="#ff4d4f" name="支出" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="项目状态分布" loading={loading}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={projectStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {projectStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} lg={12}>
          <Card title="部门人数统计" loading={loading}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={departmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="employees" fill="#1890ff" name="员工数" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="部门预算对比" loading={loading}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={departmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="budget" fill="#52c41a" name="预算" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Card title="重点项目概览" loading={loading}>
        <Table
          columns={topProjectsColumns}
          dataSource={[
            {
              key: 1,
              name: 'ERP系统升级',
              budget: 150000,
              actual_cost: 120000,
              progress: 75,
              status: 'active',
            },
            {
              key: 2,
              name: '移动应用开发',
              budget: 80000,
              actual_cost: 85000,
              progress: 90,
              status: 'active',
            },
            {
              key: 3,
              name: '网站改版',
              budget: 45000,
              actual_cost: 42000,
              progress: 100,
              status: 'completed',
            },
            {
              key: 4,
              name: '数据库迁移',
              budget: 35000,
              actual_cost: 33000,
              progress: 100,
              status: 'completed',
            },
          ]}
          pagination={false}
          rowKey="key"
        />
      </Card>
    </div>
  )
}

export default Reports

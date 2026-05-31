import { useState, useEffect } from 'react'
import { Card, Row, Col, Table, Tag, Statistic, Progress } from 'antd'
import { TeamOutlined, DollarOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons'
import api from '../utils/api'

const HR = () => {
  const [employees, setEmployees] = useState([])
  const [leaveRequests, setLeaveRequests] = useState([])
  const [kpiData, setKpiData] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/hr/employees'),
      api.get('/hr/leave-requests'),
      api.get('/hr/kpi')
    ]).then(([employeesRes, leaveRes, kpiRes]) => {
      setEmployees(employeesRes.data.employees || [])
      setLeaveRequests(leaveRes.data.leave_requests || [])
      setKpiData(kpiRes.data || {})
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const employeeColumns = [
    { title: '工号', dataIndex: 'employee_code', key: 'employee_code' },
    { title: '姓名', key: 'name', render: (_, r) => `${r.first_name} ${r.last_name}` },
    { title: '部门', dataIndex: 'position', key: 'position' },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <Tag color={status === 'active' ? 'green' : 'red'}>{status === 'active' ? '在职' : '离职'}</Tag>,
    },
    {
      title: '薪资',
      dataIndex: 'salary',
      key: 'salary',
      render: (salary) => `¥${(salary || 0).toLocaleString()}`,
    },
    {
      title: '绩效评分',
      dataIndex: 'performance_score',
      key: 'performance_score',
      render: (score) => <Progress percent={(score || 0) * 20} size='small' format={() => score?.toFixed(1)} />,
    },
  ]

  const leaveColumns = [
    { title: '员工', dataIndex: 'employee_code', key: 'employee_code' },
    {
      title: '请假类型',
      dataIndex: 'leave_type',
      key: 'leave_type',
      render: (type) => {
        const typeMap = { annual: '年假', sick: '病假', personal: '事假' }
        return <Tag>{typeMap[type] || type}</Tag>
      },
    },
    { title: '开始日期', dataIndex: 'start_date', key: 'start_date' },
    { title: '结束日期', dataIndex: 'end_date', key: 'end_date' },
    { title: '天数', dataIndex: 'days', key: 'days', render: (days) => `${days}天` },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusMap = {
          pending: { color: 'orange', text: '待审批', icon: <ClockCircleOutlined /> },
          approved: { color: 'green', text: '已批准', icon: <CheckCircleOutlined /> },
          rejected: { color: 'red', text: '已拒绝' },
        }
        const config = statusMap[status] || statusMap.pending
        return <Tag color={config.color} icon={config.icon}>{config.text}</Tag>
      },
    },
  ]

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="员工总数" value={kpiData.total_employees || 0} prefix={<TeamOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="在职员工" value={kpiData.active_employees || 0} valueStyle={{ color: '#3f8600' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="薪资总额"
              value={kpiData.total_payroll || 0}
              prefix={<DollarOutlined />}
              precision={0}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="平均绩效"
              value={kpiData.avg_performance_score || 0}
              precision={1}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="员工管理" icon={<TeamOutlined />}>
            <Table
              columns={employeeColumns}
              dataSource={employees}
              loading={loading}
              rowKey="id"
              pagination={{ pageSize: 5 }}
              size="small"
            />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="请假管理">
            <Table
              columns={leaveColumns}
              dataSource={leaveRequests}
              loading={loading}
              rowKey="id"
              pagination={{ pageSize: 5 }}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default HR
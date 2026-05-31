import { useState, useEffect } from 'react'
import { Card, Row, Col, Table, Tag, Statistic, Rate } from 'antd'
import { CustomerServiceOutlined, DollarOutlined, TeamOutlined } from '@ant-design/icons'
import api from '../utils/api'

const CRM = () => {
  const [customers, setCustomers] = useState([])
  const [opportunities, setOpportunities] = useState([])
  const [kpiData, setKpiData] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/crm/customers'),
      api.get('/crm/opportunities'),
      api.get('/crm/kpi')
    ]).then(([customersRes, opportunitiesRes, kpiRes]) => {
      setCustomers(customersRes.data.customers || [])
      setOpportunities(opportunitiesRes.data.opportunities || [])
      setKpiData(kpiRes.data || {})
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const customerColumns = [
    { title: '客户编号', dataIndex: 'customer_code', key: 'customer_code' },
    { title: '公司名称', dataIndex: 'company_name', key: 'company_name' },
    { title: '联系人', dataIndex: 'contact_person', key: 'contact_person' },
    { title: '电话', dataIndex: 'phone', key: 'phone' },
    {
      title: '客户等级',
      dataIndex: 'tier',
      key: 'tier',
      render: (tier) => {
        const colorMap = { A: 'green', B: 'blue', C: 'orange' }
        return <Tag color={colorMap[tier]}>{tier}级客户</Tag>
      },
    },
    {
      title: '满意度',
      dataIndex: 'satisfaction_score',
      key: 'satisfaction_score',
      render: (score) => <Rate disabled defaultValue={score} />,
    },
    {
      title: '累计采购',
      dataIndex: 'total_purchases',
      key: 'total_purchases',
      render: (amount) => `¥${(amount || 0).toLocaleString()}`,
    },
  ]

  const opportunityColumns = [
    { title: '机会名称', dataIndex: 'opportunity_name', key: 'opportunity_name' },
    { title: '客户', dataIndex: 'customer_name', key: 'customer_name' },
    {
      title: '阶段',
      dataIndex: 'stage',
      key: 'stage',
      render: (stage) => {
        const stageMap = {
          prospecting: { color: 'blue', text: '初步接触' },
          proposal: { color: 'orange', text: '方案阶段' },
          negotiation: { color: 'purple', text: '商务谈判' },
          closed: { color: 'green', text: '已成交' },
        }
        const config = stageMap[stage] || stageMap.prospecting
        return <Tag color={config.color}>{config.text}</Tag>
      },
    },
    {
      title: '金额',
      dataIndex: 'value',
      key: 'value',
      render: (value) => `¥${(value || 0).toLocaleString()}`,
    },
    {
      title: '成交概率',
      dataIndex: 'probability',
      key: 'probability',
      render: (prob) => <Tag color={prob > 60 ? 'green' : prob > 30 ? 'orange' : 'blue'}>{prob}%</Tag>,
    },
    { title: '预计成交日期', dataIndex: 'expected_close_date', key: 'expected_close_date' },
  ]

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="客户总数" value={kpiData.total_customers || 0} prefix={<TeamOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="活跃客户" value={kpiData.active_customers || 0} valueStyle={{ color: '#3f8600' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="销售机会" value={kpiData.total_opportunities || 0} valueStyle={{ color: '#1890ff' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="机会总额"
              value={kpiData.total_opportunity_value || 0}
              prefix={<DollarOutlined />}
              precision={0}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="客户管理" icon={<CustomerServiceOutlined />}>
            <Table
              columns={customerColumns}
              dataSource={customers}
              loading={loading}
              rowKey="id"
              pagination={{ pageSize: 5 }}
              size="small"
            />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="销售机会">
            <Table
              columns={opportunityColumns}
              dataSource={opportunities}
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

export default CRM
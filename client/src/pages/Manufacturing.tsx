import { useState, useEffect } from 'react'
import { Card, Row, Col, Table, Tag, Statistic, Progress } from 'antd'
import { ToolOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons'
import api from '../utils/api'

const Manufacturing = () => {
  const [productionOrders, setProductionOrders] = useState([])
  const [kpiData, setKpiData] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/manufacturing/production-orders'),
      api.get('/manufacturing/kpi')
    ]).then(([ordersRes, kpiRes]) => {
      setProductionOrders(ordersRes.data.production_orders || [])
      setKpiData(kpiRes.data || {})
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const columns = [
    { title: '生产单号', dataIndex: 'order_number', key: 'order_number' },
    { title: '产品名称', dataIndex: 'product_name', key: 'product_name' },
    { title: '数量', dataIndex: 'quantity', key: 'quantity', render: (q, r) => `${q} ${r.unit}` },
    {
      title: '进度',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress) => <Progress percent={progress} size='small' />
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusMap = {
          planned: { color: 'blue', text: '计划中' },
          in_production: { color: 'green', text: '生产中' },
          completed: { color: 'green', text: '已完成' },
        }
        const config = statusMap[status] || statusMap.planned
        return <Tag color={config.color}>{config.text}</Tag>
      },
    },
    { title: '开始日期', dataIndex: 'start_date', key: 'start_date' },
    { title: '计划完成', dataIndex: 'planned_end_date', key: 'planned_end_date' },
  ]

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="生产订单总数" value={kpiData.total_orders || 0} prefix={<CheckCircleOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="生产中" value={kpiData.in_production || 0} valueStyle={{ color: '#1890ff' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="准时交付率" value={kpiData.on_time_delivery_rate || 0} suffix="%" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="产能利用率" value={kpiData.capacity_utilization || 0} suffix="%" />
          </Card>
        </Col>
      </Row>

      <Card title="生产订单管理" icon={<ToolOutlined />}>
        <Table
          columns={columns}
          dataSource={productionOrders}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  )
}

export default Manufacturing
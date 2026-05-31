import { useState, useEffect } from 'react'
import {
  Card,
  Row,
  Col,
  Table,
  Button,
  Tag,
  Space,
  Statistic,
  Progress,
  Alert,
  message,
} from 'antd'
import {
  InboxOutlined,
  WarningOutlined,
  DollarOutlined,
  StockOutlined,
} from '@ant-design/icons'
import api from '../utils/api'
import { logError } from '../utils/logger'

const Inventory = () => {
  const [inventoryItems, setInventoryItems] = useState([])
  const [kpiData, setKpiData] = useState({})
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchInventoryData()
  }, [])

  const fetchInventoryData = async () => {
    try {
      setLoading(true)
      const [itemsRes, kpiRes] = await Promise.all([
        api.get('/inventory/items'),
        api.get('/inventory/kpi'),
      ])

      setInventoryItems(itemsRes.data.inventory_items || [])
      setKpiData(kpiRes.data || {})

      // 生成预警信息
      const lowStockItems = (itemsRes.data.inventory_items || [])
        .filter(item => item.quantity <= item.min_stock)
        .map(item => ({
          item_id: item.id,
          item_name: item.item_name,
          current_quantity: item.quantity,
          min_quantity: item.min_stock,
          alert_type: 'low_stock',
          priority: item.quantity < item.min_stock * 0.5 ? 'high' : 'medium',
          recommendation: `建议补货至${item.max_stock}${item.unit}`
        }))
      setAlerts(lowStockItems)

    } catch (error) {
      logError('Failed to fetch inventory data', { error })
      message.error('获取库存数据失败')
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    {
      title: '物品编号',
      dataIndex: 'item_code',
      key: 'item_code',
    },
    {
      title: '物品名称',
      dataIndex: 'item_name',
      key: 'item_name',
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      render: (category) => <Tag color='blue'>{category}</Tag>,
    },
    {
      title: '当前库存',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (quantity, record) => (
        <Space>
          <span>{quantity} {record.unit}</span>
          {quantity <= record.min_stock && (
            <Tag color='red' icon={<WarningOutlined />}>低库存</Tag>
          )}
        </Space>
      ),
    },
    {
      title: '库存范围',
      key: 'stock_range',
      render: (_, record) => (
        <div style={{ width: '120px' }}>
          <Progress
            percent={(record.quantity / record.max_stock) * 100}
            size='small'
            status={record.quantity <= record.min_stock ? 'exception' : 'normal'}
          />
          <span style={{ fontSize: '12px' }}>
            {record.min_stock} - {record.max_stock} {record.unit}
          </span>
        </div>
      ),
    },
    {
      title: '单价',
      dataIndex: 'unit_cost',
      key: 'unit_cost',
      render: (cost) => `¥${cost.toLocaleString()}`,
    },
    {
      title: '库存总值',
      dataIndex: 'total_value',
      key: 'total_value',
      render: (value) => `¥${value.toLocaleString()}`,
    },
    {
      title: '位置',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusMap = {
          in_stock: { color: 'green', text: '库存正常' },
          low_stock: { color: 'orange', text: '库存偏低' },
          out_of_stock: { color: 'red', text: '缺货' },
        }
        const config = statusMap[status] || statusMap.in_stock
        return <Tag color={config.color}>{config.text}</Tag>
      },
    },
  ]

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title='库存物品总数'
              value={kpiData.total_items || 0}
              prefix={<StockOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title='低库存物品'
              value={kpiData.low_stock_items || 0}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title='库存总价值'
              value={kpiData.total_inventory_value || 0}
              prefix={<DollarOutlined />}
              precision={0}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title='库存周转率'
              value={kpiData.inventory_turnover_rate || 0}
              suffix='次/年'
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      {alerts.length > 0 && (
        <Alert
          message='库存预警'
          description={
            <div>
              {alerts.map((alert, index) => (
                <div key={index} style={{ marginBottom: '8px' }}>
                  <Tag color={alert.priority === 'high' ? 'red' : 'orange'}>
                    {alert.priority === 'high' ? '紧急' : '提醒'}
                  </Tag>
                  {alert.item_name} 当前库存{alert.current_quantity}，低于最低库存{alert.min_quantity}。
                  {alert.recommendation}
                </div>
              ))}
            </div>
          }
          type='warning'
          showIcon
          style={{ marginBottom: '24px' }}
        />
      )}

      <Card title='库存管理' icon={<InboxOutlined />}>
        <Table
          columns={columns}
          dataSource={inventoryItems}
          loading={loading}
          rowKey='id'
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
        />
      </Card>
    </div>
  )
}

export default Inventory
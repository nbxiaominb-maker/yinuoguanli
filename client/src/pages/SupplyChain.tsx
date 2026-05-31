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
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  message,
  Popconfirm,
} from 'antd'
import {
  PlusOutlined,
  ShoppingOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons'
import api from '../utils/api'
import { logDebug, logError } from '../utils/logger'
import { useAuthStore } from '../stores/authStore'

const SupplyChain = () => {
  const { user } = useAuthStore()
  const [suppliers, setSuppliers] = useState([])
  const [purchaseOrders, setPurchaseOrders] = useState([])
  const [kpiData, setKpiData] = useState({})
  const [loading, setLoading] = useState(true)
  const [modalVisible, setModalVisible] = useState(false)
  const [modalType, setModalType] = useState('') // 'supplier' or 'order'
  const [editingRecord, setEditingRecord] = useState(null)
  const [form] = Form.useForm()

  useEffect(() => {
    fetchSupplyChainData()
  }, [])

  // 权限检查函数
  const canEdit = () => {
    return user?.role === 'admin' || user?.role === 'manager'
  }

  const canDelete = () => {
    return user?.role === 'admin'
  }

  const fetchSupplyChainData = async () => {
    try {
      setLoading(true)

      const [suppliersRes, ordersRes, kpiRes] = await Promise.all([
        api.get('/supply-chain/suppliers'),
        api.get('/supply-chain/purchase-orders'),
        api.get('/supply-chain/kpi'),
      ])

      setSuppliers(suppliersRes.data.suppliers || [])
      setPurchaseOrders(
        suppliersRes.data.purchase_orders || []
      )
      setKpiData(kpiRes.data || {})
    } catch (error) {
      logError('Failed to fetch supply chain data', { error })
      message.error('获取供应链数据失败')
    } finally {
      setLoading(false)
    }
  }

  const handleModalOpen = (type, record = null) => {
    setModalType(type)
    setEditingRecord(record)
    if (record) {
      // 编辑模式：填充表单数据
      if (type === 'supplier') {
        form.setFieldsValue({
          name: record.name,
          code: record.code,
          contact: record.contact,
          phone: record.phone,
          email: record.email,
          category: record.category,
          rating: record.rating,
          address: record.address,
        })
      } else if (type === 'order') {
        form.setFieldsValue({
          supplier_id: record.supplier_id,
          order_date: record.order_date,
          delivery_date: record.delivery_date,
          total_amount: record.total_amount,
          priority: record.priority,
          status: record.status,
        })
      }
    } else {
      // 新建模式：重置表单
      form.resetFields()
    }
    setModalVisible(true)
  }

  const handleModalClose = () => {
    setModalVisible(false)
    form.resetFields()
    setEditingRecord(null)
  }

  const handleDelete = async (type, id) => {
    try {
      if (type === 'supplier') {
        await api.delete(`/supply-chain/suppliers/${id}`)
        message.success('供应商删除成功')
      } else if (type === 'order') {
        await api.delete(`/supply-chain/purchase-orders/${id}`)
        message.success('采购订单删除成功')
      }
      fetchSupplyChainData()
    } catch (error) {
      logError('Failed to delete record', { error })
      message.error('删除失败')
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()

      if (modalType === 'supplier') {
        if (editingRecord) {
          // 编辑供应商
          await api.put(`/supply-chain/suppliers/${editingRecord.id}`, values)
          message.success('供应商更新成功')
        } else {
          // 创建供应商
          await api.post('/supply-chain/suppliers', values)
          message.success('供应商创建成功')
        }
      } else if (modalType === 'order') {
        if (editingRecord) {
          // 编辑订单
          await api.put(`/supply-chain/purchase-orders/${editingRecord.id}`, values)
          message.success('采购订单更新成功')
        } else {
          // 创建订单
          await api.post('/supply-chain/purchase-orders', values)
          message.success('采购订单创建成功')
        }
      }

      handleModalClose()
      fetchSupplyChainData()
    } catch (error) {
      logError('Failed to save record', { error })
      message.error('保存失败')
    }
  }

  const supplierColumns = [
    {
      title: '供应商编号',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: '供应商名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '联系人',
      dataIndex: 'contact',
      key: 'contact',
    },
    {
      title: '电话',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      render: (category) => <Tag color='blue'>{category}</Tag>,
    },
    {
      title: '评级',
      dataIndex: 'rating',
      key: 'rating',
      render: (rating) => {
        const colorMap = {
          A: 'green',
          B: 'blue',
          C: 'orange',
        }
        return <Tag color={colorMap[rating] || 'default'}>{rating}级</Tag>
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? '活跃' : '停用'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size='small'>
          {canEdit() && (
            <Button
              type='link'
              size='small'
              icon={<EditOutlined />}
              onClick={() => handleModalOpen('supplier', record)}
            >
              编辑
            </Button>
          )}
          {canDelete() && (
            <Popconfirm
              title='确定要删除此供应商吗？'
              description='此操作不可恢复'
              onConfirm={() => handleDelete('supplier', record.id)}
              okText='确定'
              cancelText='取消'
            >
              <Button type='link' size='small' danger icon={<DeleteOutlined />}>
                删除
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ]

  const orderColumns = [
    {
      title: '订单号',
      dataIndex: 'order_number',
      key: 'order_number',
    },
    {
      title: '供应商',
      dataIndex: 'supplier_name',
      key: 'supplier_name',
    },
    {
      title: '订单日期',
      dataIndex: 'order_date',
      key: 'order_date',
    },
    {
      title: '金额',
      dataIndex: 'total_amount',
      key: 'total_amount',
      render: (amount) => `¥${amount.toLocaleString()}`,
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority) => {
        const colorMap = {
          high: 'red',
          medium: 'orange',
          low: 'green',
        }
        return <Tag color={colorMap[priority]}>{priority === 'high' ? '高' : priority === 'medium' ? '中' : '低'}</Tag>
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusMap = {
          pending: { color: 'orange', text: '待处理', icon: <ClockCircleOutlined /> },
          processing: { color: 'blue', text: '处理中', icon: <CheckCircleOutlined /> },
          completed: { color: 'green', text: '已完成', icon: <CheckCircleOutlined /> },
        }
        const config = statusMap[status] || statusMap.pending
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.text}
          </Tag>
        )
      },
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size='small'>
          {canEdit() && (
            <Button
              type='link'
              size='small'
              icon={<EditOutlined />}
              onClick={() => handleModalOpen('order', record)}
            >
              编辑
            </Button>
          )}
          {canDelete() && (
            <Popconfirm
              title='确定要删除此订单吗？'
              description='此操作不可恢复'
              onConfirm={() => handleDelete('order', record.id)}
              okText='确定'
              cancelText='取消'
            >
              <Button type='link' size='small' danger icon={<DeleteOutlined />}>
                删除
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ]

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title='供应商总数'
              value={kpiData.supplier_count || 0}
              prefix={<ShoppingOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title='活跃供应商'
              value={kpiData.active_suppliers || 0}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title='待处理订单'
              value={kpiData.pending_orders || 0}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title='采购总金额'
              value={kpiData.total_purchase_value || 0}
              prefix={<DollarOutlined />}
              precision={0}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card
            title='供应商管理'
            extra={
              <Button
                type='primary'
                icon={<PlusOutlined />}
                onClick={() => handleModalOpen('supplier')}
              >
                添加供应商
              </Button>
            }
          >
            <Table
              columns={supplierColumns}
              dataSource={suppliers}
              loading={loading}
              rowKey='id'
              pagination={{ pageSize: 5 }}
              size='small'
            />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title='采购订单'
            extra={
              <Button
                type='primary'
                icon={<PlusOutlined />}
                onClick={() => handleModalOpen('order')}
              >
                创建订单
              </Button>
            }
          >
            <Table
              columns={orderColumns}
              dataSource={purchaseOrders}
              loading={loading}
              rowKey='id'
              pagination={{ pageSize: 5 }}
              size='small'
            />
          </Card>
        </Col>
      </Row>

      <Modal
        title={
          modalType === 'supplier'
            ? editingRecord
              ? '编辑供应商'
              : '添加供应商'
            : editingRecord
              ? '编辑采购订单'
              : '创建采购订单'
        }
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={handleModalClose}
        width={600}
      >
        <Form form={form} layout='vertical'>
          {modalType === 'supplier' ? (
            <>
              <Form.Item
                name='name'
                label='供应商名称'
                rules={[{ required: true, message: '请输入供应商名称' }]}
              >
                <Input placeholder='请输入供应商名称' />
              </Form.Item>
              <Form.Item
                name='code'
                label='供应商编号'
                rules={[{ required: true, message: '请输入供应商编号' }]}
              >
                <Input placeholder='请输入供应商编号' />
              </Form.Item>
              <Form.Item
                name='contact'
                label='联系人'
                rules={[{ required: true, message: '请输入联系人' }]}
              >
                <Input placeholder='请输入联系人' />
              </Form.Item>
              <Form.Item
                name='phone'
                label='电话'
                rules={[{ required: true, message: '请输入电话' }]}
              >
                <Input placeholder='请输入电话' />
              </Form.Item>
              <Form.Item
                name='category'
                label='分类'
                rules={[{ required: true, message: '请选择分类' }]}
              >
                <Select placeholder='请选择分类'>
                  <Select.Option value='原材料'>原材料</Select.Option>
                  <Select.Option value='设备'>设备</Select.Option>
                  <Select.Option value='服务'>服务</Select.Option>
                </Select>
              </Form.Item>
            </>
          ) : (
            <>
              <Form.Item
                name='supplier_id'
                label='供应商'
                rules={[{ required: true, message: '请选择供应商' }]}
              >
                <Select placeholder='请选择供应商'>
                  {suppliers.map((supplier) => (
                    <Select.Option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                name='order_date'
                label='订单日期'
                rules={[{ required: true, message: '请选择订单日期' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item
                name='total_amount'
                label='总金额'
                rules={[{ required: true, message: '请输入总金额' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder='请输入总金额'
                  min={0}
                />
              </Form.Item>
              <Form.Item
                name='priority'
                label='优先级'
                rules={[{ required: true, message: '请选择优先级' }]}
              >
                <Select placeholder='请选择优先级'>
                  <Select.Option value='high'>高</Select.Option>
                  <Select.Option value='medium'>中</Select.Option>
                  <Select.Option value='low'>低</Select.Option>
                </Select>
              </Form.Item>
            </>
          )}
        </Form>
      </Modal>
    </div>
  )
}

export default SupplyChain
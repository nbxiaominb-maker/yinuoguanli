import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  DatePicker,
  message,
  Card,
  Popconfirm,
  Tag,
  Row,
  Col,
  Statistic,
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { useEffect, useState } from 'react'
import { financialAPI, departmentAPI, projectAPI } from '../utils/api'
import dayjs from 'dayjs'

const Financial = () => {
  const [loading, setLoading] = useState(false)
  const [transactions, setTransactions] = useState<any[]>([])
  const [departments, setDepartments] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [summary, setSummary] = useState<any>(null)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  })
  const [modalVisible, setModalVisible] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<any>(null)
  const [form] = Form.useForm()

  useEffect(() => {
    fetchTransactions()
    fetchDepartments()
    fetchProjects()
    fetchSummary()
  }, [pagination.current, pagination.pageSize])

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      const response = await financialAPI.getTransactions({
        page: pagination.current,
        limit: pagination.pageSize,
      })
      setTransactions(response.data.transactions)
      setPagination(prev => ({
        ...prev,
        total: response.data.pagination.total,
      }))
    } catch (error) {
      message.error('获取交易列表失败')
    } finally {
      setLoading(false)
    }
  }

  const fetchDepartments = async () => {
    try {
      const response = await departmentAPI.getDepartments()
      setDepartments(response.data)
    } catch (error) {
      console.error('Failed to fetch departments:', error)
    }
  }

  const fetchProjects = async () => {
    try {
      const response = await projectAPI.getProjects({ limit: 100 })
      setProjects(response.data.projects)
    } catch (error) {
      console.error('Failed to fetch projects:', error)
    }
  }

  const fetchSummary = async () => {
    try {
      const response = await financialAPI.getSummary()
      setSummary(response.data.totals)
    } catch (error) {
      console.error('Failed to fetch summary:', error)
    }
  }

  const handleAdd = () => {
    setEditingTransaction(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (transaction: any) => {
    setEditingTransaction(transaction)
    form.setFieldsValue({
      ...transaction,
      transaction_date: transaction.transaction_date
        ? dayjs(transaction.transaction_date)
        : null,
      department_id: transaction.department_id || undefined,
      project_id: transaction.project_id || undefined,
    })
    setModalVisible(true)
  }

  const handleDelete = async (id: number) => {
    try {
      await financialAPI.deleteTransaction(id)
      message.success('删除成功')
      fetchTransactions()
      fetchSummary()
    } catch (error) {
      message.error('删除失败')
    }
  }

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields()
      const formattedValues = {
        ...values,
        transaction_date: values.transaction_date?.format('YYYY-MM-DD'),
      }

      if (editingTransaction) {
        await financialAPI.updateTransaction(
          editingTransaction.id,
          formattedValues
        )
        message.success('更新成功')
      } else {
        await financialAPI.createTransaction(formattedValues)
        message.success('创建成功')
      }
      setModalVisible(false)
      fetchTransactions()
      fetchSummary()
    } catch (error) {
      message.error(editingTransaction ? '更新失败' : '创建失败')
    }
  }

  const getTypeColor = (type: string) => {
    return type === 'income' ? 'green' : 'red'
  }

  const getTypeText = (type: string) => {
    return type === 'income' ? '收入' : '支出'
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      completed: 'green',
      pending: 'orange',
      cancelled: 'red',
    }
    return colors[status] || 'default'
  }

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      completed: '已完成',
      pending: '待处理',
      cancelled: '已取消',
    }
    return texts[status] || status
  }

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '类型',
      dataIndex: 'transaction_type',
      key: 'transaction_type',
      render: (type: string) => (
        <Tag color={getTypeColor(type)}>{getTypeText(type)}</Tag>
      ),
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number, record: any) => (
        <span
          style={{
            color: record.transaction_type === 'income' ? '#52c41a' : '#ff4d4f',
            fontWeight: 600,
          }}
        >
          {record.transaction_type === 'income' ? '+' : '-'}
          ${amount.toLocaleString()}
        </span>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '项目',
      dataIndex: 'project_name',
      key: 'project_name',
      render: (name: string) => name || '-',
    },
    {
      title: '部门',
      dataIndex: 'department_name',
      key: 'department_name',
      render: (name: string) => name || '-',
    },
    {
      title: '交易日期',
      dataIndex: 'transaction_date',
      key: 'transaction_date',
      render: (date: string) => (date ? dayjs(date).format('YYYY-MM-DD') : '-'),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      ),
    },
    {
      title: '操作',
      key: 'actions',
      width: 150,
      render: (_: any, record: any) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这笔交易吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="link"
              size="small"
              danger
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      {summary && (
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="总收入"
                value={summary.total_income || 0}
                precision={2}
                valueStyle={{ color: '#3f8600' }}
                prefix="$"
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="总支出"
                value={summary.total_expense || 0}
                precision={2}
                valueStyle={{ color: '#cf1322' }}
                prefix="$"
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="净收益"
                value={(summary.total_income || 0) - (summary.total_expense || 0)}
                precision={2}
                valueStyle={{
                  color:
                    (summary.total_income || 0) - (summary.total_expense || 0) >=
                    0
                      ? '#3f8600'
                      : '#cf1322',
                }}
                prefix="$"
              />
            </Card>
          </Col>
        </Row>
      )}

      <Card
        title="财务管理"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            添加交易
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={transactions}
          loading={loading}
          rowKey="id"
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
            onChange: (page, pageSize) => {
              setPagination(prev => ({ ...prev, current: page, pageSize }))
            },
          }}
        />
      </Card>

      <Modal
        title={editingTransaction ? '编辑交易' : '添加交易'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        width={800}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="transaction_type"
            label="交易类型"
            rules={[{ required: true, message: '请选择交易类型' }]}
          >
            <Select>
              <Select.Option value="income">收入</Select.Option>
              <Select.Option value="expense">支出</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="category"
            label="分类"
            rules={[{ required: true, message: '请输入分类' }]}
          >
            <Input placeholder="例如：销售收入、工资支出、设备采购等" />
          </Form.Item>
          <Form.Item
            name="amount"
            label="金额"
            rules={[{ required: true, message: '请输入金额' }]}
          >
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item
            name="transaction_date"
            label="交易日期"
            rules={[{ required: true, message: '请选择交易日期' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="project_id" label="关联项目">
            <Select allowClear placeholder="选择项目">
              {projects.map(project => (
                <Select.Option key={project.id} value={project.id}>
                  {project.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="department_id" label="关联部门">
            <Select allowClear placeholder="选择部门">
              {departments.map(dept => (
                <Select.Option key={dept.id} value={dept.id}>
                  {dept.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select defaultValue="completed">
              <Select.Option value="completed">已完成</Select.Option>
              <Select.Option value="pending">待处理</Select.Option>
              <Select.Option value="cancelled">已取消</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="notes" label="备注">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default Financial

import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  InputNumber,
  message,
  Card,
  Popconfirm,
  Tag,
  Descriptions,
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, TeamOutlined } from '@ant-design/icons'
import { useEffect, useState } from 'react'
import { departmentAPI } from '../utils/api'
import api from '../utils/api'

const Departments = () => {
  const [loading, setLoading] = useState(false)
  const [departments, setDepartments] = useState<any[]>([])
  const [modalVisible, setModalVisible] = useState(false)
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [editingDept, setEditingDept] = useState<any>(null)
  const [selectedDept, setSelectedDept] = useState<any>(null)
  const [form] = Form.useForm()

  useEffect(() => {
    fetchDepartments()
  }, [])

  const fetchDepartments = async () => {
    try {
      setLoading(true)
      const response = await departmentAPI.getDepartments()
      setDepartments(response.data)
    } catch (error) {
      message.error('获取部门列表失败')
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setEditingDept(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (dept: any) => {
    setEditingDept(dept)
    form.setFieldsValue(dept)
    setModalVisible(true)
  }

  const handleDelete = async (id: number) => {
    try {
      await departmentAPI.deleteDepartment(id)
      message.success('删除成功')
      fetchDepartments()
    } catch (error) {
      message.error('删除失败')
    }
  }

  const handleViewDetails = async (dept: any) => {
    try {
      const response = await departmentAPI.getDepartment(dept.id)
      setSelectedDept(response.data)
      setDetailModalVisible(true)
    } catch (error) {
      message.error('获取部门详情失败')
    }
  }

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields()
      if (editingDept) {
        await departmentAPI.updateDepartment(editingDept.id, values)
        message.success('更新成功')
      } else {
        await departmentAPI.createDepartment(values)
        message.success('创建成功')
      }
      setModalVisible(false)
      fetchDepartments()
    } catch (error) {
      message.error(editingDept ? '更新失败' : '创建失败')
    }
  }

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '部门名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: any) => (
        <Space>
          <TeamOutlined />
          <a onClick={() => handleViewDetails(record)}>{text}</a>
        </Space>
      ),
    },
    {
      title: '部门代码',
      dataIndex: 'code',
      key: 'code',
      render: (code: string) => <Tag color="blue">{code}</Tag>,
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '部门经理',
      dataIndex: 'manager_name',
      key: 'manager_name',
      render: (name: string) => name || '-',
    },
    {
      title: '预算',
      dataIndex: 'budget',
      key: 'budget',
      render: (budget: number) =>
        budget ? `$${budget.toLocaleString()}` : '-',
    },
    {
      title: '员工数',
      dataIndex: 'employee_count',
      key: 'employee_count',
      render: (count: number) => (
        <Tag color="green">{count || 0} 人</Tag>
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
            title="确定要删除这个部门吗？"
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
      <Card
        title="部门管理"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            添加部门
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={departments}
          loading={loading}
          rowKey="id"
        />
      </Card>

      <Modal
        title={editingDept ? '编辑部门' : '添加部门'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="部门名称"
            rules={[{ required: true, message: '请输入部门名称' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="code"
            label="部门代码"
            rules={[{ required: true, message: '请输入部门代码' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="budget" label="预算">
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              placeholder="输入预算金额"
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="部门详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedDept && (
          <div>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="部门名称">
                {selectedDept.name}
              </Descriptions.Item>
              <Descriptions.Item label="部门代码">
                <Tag color="blue">{selectedDept.code}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="描述" span={2}>
                {selectedDept.description || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="部门经理">
                {selectedDept.manager_name || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="预算">
                {selectedDept.budget
                  ? `$${selectedDept.budget.toLocaleString()}`
                  : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="员工总数">
                <Tag color="green">{selectedDept.employee_count || 0} 人</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="创建时间">
                {new Date(selectedDept.created_at).toLocaleString()}
              </Descriptions.Item>
            </Descriptions>

            {selectedDept.employees && selectedDept.employees.length > 0 && (
              <div style={{ marginTop: '24px' }}>
                <h3>部门员工</h3>
                <Table
                  columns={[
                    {
                      title: '员工编号',
                      dataIndex: 'employee_code',
                      key: 'employee_code',
                    },
                    {
                      title: '姓名',
                      key: 'name',
                      render: (_: any, record: any) =>
                        `${record.first_name} ${record.last_name}`,
                    },
                    {
                      title: '职位',
                      dataIndex: 'position',
                      key: 'position',
                    },
                    {
                      title: '状态',
                      dataIndex: 'status',
                      key: 'status',
                      render: (status: string) => {
                        const statusMap: Record<
                          string,
                          { color: string; text: string }
                        > = {
                          active: { color: 'green', text: '在职' },
                          inactive: { color: 'red', text: '离职' },
                          'on-leave': { color: 'orange', text: '请假' },
                        }
                        const { color, text } =
                          statusMap[status] || {
                            color: 'default',
                            text: status,
                          }
                        return <Tag color={color}>{text}</Tag>
                      },
                    },
                  ]}
                  dataSource={selectedDept.employees}
                  rowKey="id"
                  pagination={false}
                  size="small"
                />
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

export default Departments

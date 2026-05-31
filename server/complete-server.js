// Complete backend server with all API routes
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = 5000;
const JWT_SECRET = 'your-secret-key-change-in-production';

// Mock database
let users = [
  { id: 1, username: 'admin', password: 'admin123', first_name: 'System', last_name: 'Administrator', role: 'admin', email: 'admin@yinuokeji.com', department_id: 1, is_active: true },
  { id: 2, username: 'john.manager', password: 'manager123', first_name: 'John', last_name: 'Manager', role: 'manager', email: 'john@yinuokeji.com', department_id: 2, is_active: true },
  { id: 3, username: 'dev1', password: 'employee123', first_name: 'Jane', last_name: 'Developer', role: 'employee', email: 'dev1@yinuokeji.com', department_id: 2, is_active: true }
];

let departments = [
  { id: 1, name: 'Executive', code: 'EXEC', description: 'Executive Management', manager_id: 1, budget: 1000000 },
  { id: 2, name: 'Engineering', code: 'ENG', description: 'Software Development', manager_id: 2, budget: 500000 },
  { id: 3, name: 'Sales', code: 'SALES', description: 'Sales and Marketing', manager_id: 3, budget: 300000 }
];

let projects = [
  { id: 1, name: 'ERP系统升级', code: 'ERP001', description: 'Enterprise Resource Planning System', status: 'active', priority: 'high', progress: 75, budget: 150000, department_id: 2 },
  { id: 2, name: '移动应用开发', code: 'MOB001', description: 'Mobile Application Development', status: 'planning', priority: 'medium', progress: 0, budget: 80000, department_id: 2 }
];

let transactions = [
  { id: 1, transaction_type: 'income', category: '销售收入', amount: 50000, description: '产品销售收入', transaction_date: '2024-01-15', status: 'completed' },
  { id: 2, transaction_type: 'expense', category: '工资支出', amount: 30000, description: '员工工资', transaction_date: '2024-01-16', status: 'completed' }
];

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Root route
app.get('/', (req, res) => {
  res.json({
    name: 'Enterprise Management System API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      auth: {
        login: 'POST /api/auth/login',
        getCurrentUser: 'GET /api/auth/me'
      },
      users: 'GET /api/users',
      departments: 'GET /api/departments',
      projects: 'GET /api/projects',
      financial: {
        summary: 'GET /api/financial/summary',
        transactions: 'GET /api/financial'
      },
      health: 'GET /health'
    },
    documentation: 'See /api-docs for detailed API documentation'
  });
});

// API documentation route
app.get('/api-docs', (req, res) => {
  res.json({
    title: 'Enterprise Management System API Documentation',
    version: '1.0.0',
    baseUrl: 'http://localhost:5000',
    authentication: {
      type: 'JWT Bearer Token',
      description: 'Include token in Authorization header: Bearer <token>'
    },
    endpoints: [
      {
        method: 'POST',
        path: '/api/auth/login',
        description: 'User authentication',
        body: {
          username: 'string (required)',
          password: 'string (required)'
        },
        response: {
          token: 'JWT token',
          user: 'user object with id, username, email, role, etc.'
        },
        examples: [
          {
            username: 'admin',
            password: 'admin123'
          },
          {
            username: 'john.manager',
            password: 'manager123'
          },
          {
            username: 'dev1',
            password: 'employee123'
          }
        ]
      },
      {
        method: 'GET',
        path: '/api/auth/me',
        description: 'Get current user information',
        headers: {
          Authorization: 'Bearer <token>'
        }
      },
      {
        method: 'GET',
        path: '/api/users',
        description: 'Get all users with pagination',
        headers: {
          Authorization: 'Bearer <token>'
        }
      },
      {
        method: 'GET',
        path: '/api/departments',
        description: 'Get all departments with employee counts',
        headers: {
          Authorization: 'Bearer <token>'
        }
      },
      {
        method: 'GET',
        path: '/api/projects',
        description: 'Get all projects with details',
        headers: {
          Authorization: 'Bearer <token>'
        }
      },
      {
        method: 'GET',
        path: '/api/financial/summary',
        description: 'Get financial summary (income, expense, balance)',
        headers: {
          Authorization: 'Bearer <token>'
        }
      },
      {
        method: 'GET',
        path: '/api/financial',
        description: 'Get all financial transactions with pagination',
        headers: {
          Authorization: 'Bearer <token>'
        }
      }
    ]
  });
});

// API Routes
app.post('/api/auth/login', (req, res) => {
  try {
    const { username, password } = req.body;

    console.log('Login attempt:', username);

    const user = users.find(u => u.username === username && u.password === password);
    if (!user) {
      console.log('Login failed: User not found');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({
      id: user.id,
      username: user.username,
      role: user.role,
      department_id: user.department_id
    }, JWT_SECRET, { expiresIn: '24h' });

    console.log('Login successful:', username);

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        department_id: user.department_id
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.get('/api/auth/me', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = users.find(u => u.id === decoded.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      department_id: user.department_id,
      last_login: new Date().toISOString()
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

app.get('/api/users', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const safeUsers = users.map(u => ({
      id: u.id,
      username: u.username,
      email: u.email,
      first_name: u.first_name,
      last_name: u.last_name,
      role: u.role,
      department_id: u.department_id,
      is_active: u.is_active
    }));

    res.json({
      users: safeUsers,
      pagination: { page: 1, limit: 10, total: users.length, pages: 1 }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve users' });
  }
});

app.get('/api/departments', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const deptsWithDetails = departments.map(d => {
      const manager = users.find(u => u.id === d.manager_id);
      const employeeCount = users.filter(u => u.department_id === d.id).length;
      return {
        ...d,
        manager_name: manager ? `${manager.first_name} ${manager.last_name}` : null,
        employee_count: employeeCount
      };
    });

    res.json(deptsWithDetails);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve departments' });
  }
});

app.get('/api/projects', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const projectsWithDetails = projects.map(p => {
      const dept = departments.find(d => d.id === p.department_id);
      return {
        ...p,
        department_name: dept ? dept.name : null,
        manager_name: 'John Manager'
      };
    });

    res.json({
      projects: projectsWithDetails,
      pagination: { page: 1, limit: 10, total: projects.length, pages: 1 }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve projects' });
  }
});

app.get('/api/financial/summary', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const total_income = transactions
      .filter(t => t.transaction_type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const total_expense = transactions
      .filter(t => t.transaction_type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    res.json({
      totals: {
        total_income,
        total_expense,
        net_balance: total_income - total_expense
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve financial summary' });
  }
});

app.get('/api/financial', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    res.json({
      transactions,
      pagination: { page: 1, limit: 10, total: transactions.length, pages: 1 }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve transactions' });
  }
});

// ERP扩展模块 - 供应链管理
const supplyChainData = {
  suppliers: [
    { id: 1, name: '一诺供应商A', code: 'S001', contact: '张三', phone: '13800138000', email: 'zhangsan@yinuokeji.com', category: '原材料', rating: 'A', status: 'active' },
    { id: 2, name: '科技设备供应商', code: 'S002', contact: '李四', phone: '13900139000', category: '设备', rating: 'B', status: 'active' }
  ],
  purchaseOrders: [
    { id: 1, order_number: 'PO202601001', supplier_id: 1, order_date: '2026-05-15', status: 'pending', total_amount: 50000, priority: 'high' }
  ]
};

app.get('/api/supply-chain/suppliers', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Authentication required' });
    res.json({ suppliers: supplyChainData.suppliers });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve suppliers' });
  }
});

app.get('/api/supply-chain/purchase-orders', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Authentication required' });
    res.json({ purchase_orders: supplyChainData.purchaseOrders });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve purchase orders' });
  }
});

app.get('/api/supply-chain/kpi', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Authentication required' });
    res.json({
      supplier_count: supplyChainData.suppliers.length,
      active_suppliers: supplyChainData.suppliers.filter(s => s.status === 'active').length,
      pending_orders: supplyChainData.purchaseOrders.filter(o => o.status === 'pending').length,
      total_purchase_value: supplyChainData.purchaseOrders.reduce((sum, o) => sum + o.total_amount, 0),
      on_time_delivery_rate: 85.5,
      quality_acceptance_rate: 92.3
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve supply chain KPI' });
  }
});

// 库存管理
const inventoryData = {
  items: [
    { id: 1, item_code: 'INV001', item_name: '原材料A', category: '原材料', quantity: 500, unit: 'kg', min_stock: 100, max_stock: 1000, unit_cost: 50, total_value: 25000, status: 'in_stock' },
    { id: 2, item_code: 'INV002', item_name: '电子元件B', category: '电子元件', quantity: 200, unit: '件', min_stock: 50, max_stock: 500, unit_cost: 120, total_value: 24000, status: 'in_stock' },
    { id: 3, item_code: 'INV003', item_name: '包装材料C', category: '包装材料', quantity: 30, unit: '箱', min_stock: 50, max_stock: 200, unit_cost: 80, total_value: 2400, status: 'low_stock' }
  ]
};

app.get('/api/inventory/items', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Authentication required' });
    res.json({ inventory_items: inventoryData.items });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve inventory items' });
  }
});

app.get('/api/inventory/kpi', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Authentication required' });
    const totalValue = inventoryData.items.reduce((sum, i) => sum + i.total_value, 0);
    res.json({
      total_items: inventoryData.items.length,
      low_stock_items: inventoryData.items.filter(i => i.status === 'low_stock').length,
      total_inventory_value: totalValue,
      inventory_turnover_rate: 4.2,
      stock_accuracy: 98.5,
      stockout_rate: 2.1
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve inventory KPI' });
  }
});

// 生产制造
const manufacturingData = {
  productionOrders: [
    { id: 1, order_number: 'PROD001', product_name: '产品A', quantity: 1000, status: 'in_production', progress: 45, priority: 'high', start_date: '2026-05-20', planned_end_date: '2026-06-10' }
  ],
  workCenters: [
    { id: 1, name: '车间A', capacity: 8, current_load: 6, utilization: 75 },
    { id: 2, name: '装配线B', capacity: 20, current_load: 15, utilization: 75 }
  ]
};

app.get('/api/manufacturing/production-orders', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Authentication required' });
    res.json({ production_orders: manufacturingData.productionOrders });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve production orders' });
  }
});

app.get('/api/manufacturing/kpi', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Authentication required' });
    res.json({
      total_orders: manufacturingData.productionOrders.length,
      in_production: manufacturingData.productionOrders.filter(o => o.status === 'in_production').length,
      on_time_delivery_rate: 92.5,
      production_efficiency: 87.3,
      capacity_utilization: 78.5,
      quality_rate: 96.8,
      work_center_utilization: 76.8
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve manufacturing KPI' });
  }
});

// 客户关系管理
const crmData = {
  customers: [
    { id: 1, customer_code: 'CUST001', company_name: '客户公司A', contact_person: '王经理', phone: '13600136000', industry: '制造业', tier: 'A', status: 'active', satisfaction_score: 4.5, total_purchases: 850000 },
    { id: 2, customer_code: 'CUST002', company_name: '科技公司B', contact_person: '李总', phone: '13700137000', industry: '科技', tier: 'B', status: 'active', satisfaction_score: 4.2, total_purchases: 450000 }
  ],
  opportunities: [
    { id: 1, opportunity_name: '大型设备采购项目', customer_id: 1, stage: 'proposal', value: 250000, probability: 60, expected_close_date: '2026-07-30' }
  ]
};

app.get('/api/crm/customers', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Authentication required' });
    res.json({ customers: crmData.customers });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve customers' });
  }
});

app.get('/api/crm/opportunities', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Authentication required' });
    res.json({ opportunities: crmData.opportunities });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve opportunities' });
  }
});

app.get('/api/crm/kpi', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Authentication required' });
    const avgSatisfaction = crmData.customers.reduce((sum, c) => sum + c.satisfaction_score, 0) / crmData.customers.length;
    res.json({
      total_customers: crmData.customers.length,
      active_customers: crmData.customers.filter(c => c.status === 'active').length,
      total_opportunities: crmData.opportunities.length,
      total_opportunity_value: crmData.opportunities.reduce((sum, o) => sum + o.value, 0),
      avg_satisfaction_score: Math.round(avgSatisfaction * 10) / 10,
      customer_retention_rate: 85.2,
      conversion_rate: 23.5
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve CRM KPI' });
  }
});

// 人力资源管理
const hrData = {
  employees: [
    { id: 1, employee_code: 'EMP001', first_name: 'System', last_name: 'Administrator', position: '系统管理员', department_id: 1, status: 'active', salary: 15000, performance_score: 4.5 },
    { id: 2, employee_code: 'EMP002', first_name: 'John', last_name: 'Manager', position: '部门经理', department_id: 2, status: 'active', salary: 25000, performance_score: 4.8 },
    { id: 3, employee_code: 'EMP003', first_name: 'Jane', last_name: 'Developer', position: '软件工程师', department_id: 2, status: 'active', salary: 18000, performance_score: 4.2 }
  ],
  leaveRequests: [
    { id: 1, employee_id: 3, leave_type: 'annual', start_date: '2026-06-01', end_date: '2026-06-05', days: 5, status: 'pending' }
  ]
};

app.get('/api/hr/employees', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Authentication required' });
    res.json({ employees: hrData.employees });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve employees' });
  }
});

app.get('/api/hr/leave-requests', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Authentication required' });
    res.json({ leave_requests: hrData.leaveRequests });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve leave requests' });
  }
});

app.get('/api/hr/kpi', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Authentication required' });
    const avgPerformance = hrData.employees.reduce((sum, e) => sum + e.performance_score, 0) / hrData.employees.length;
    const totalSalary = hrData.employees.reduce((sum, e) => sum + e.salary, 0);
    res.json({
      total_employees: hrData.employees.length,
      active_employees: hrData.employees.filter(e => e.status === 'active').length,
      avg_performance_score: Math.round(avgPerformance * 10) / 10,
      total_payroll: totalSalary,
      avg_salary: Math.round(totalSalary / hrData.employees.length),
      employee_retention_rate: 92.5,
      employee_satisfaction: 4.3
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve HR KPI' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    services: {
      database: 'connected',
      api: 'operational'
    }
  });
});

app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log(`🚀 一诺科技管理系统 - ERP增强版`);
  console.log('='.repeat(50));
  console.log(`✅ 服务器运行在端口 ${PORT}`);
  console.log(`✅ 环境: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✅ 健康检查: http://localhost:${PORT}/health`);
  console.log(`✅ API端点已就绪:`);
  console.log(`   核心模块:`);
  console.log(`   - POST   /api/auth/login`);
  console.log(`   - GET    /api/auth/me`);
  console.log(`   - GET    /api/users`);
  console.log(`   - GET    /api/departments`);
  console.log(`   - GET    /api/projects`);
  console.log(`   - GET    /api/financial/summary`);
  console.log(`   ERP扩展模块:`);
  console.log(`   - GET    /api/supply-chain/*`);
  console.log(`   - GET    /api/inventory/*`);
  console.log(`   - GET    /api/manufacturing/*`);
  console.log(`   - GET    /api/crm/*`);
  console.log(`   - GET    /api/hr/*`);
  console.log('='.repeat(50));
});
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
  console.log(`🚀 Enterprise Management System Backend Server`);
  console.log('='.repeat(50));
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`✅ Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✅ Health check: http://localhost:${PORT}/health`);
  console.log(`✅ API endpoints ready:`);
  console.log(`   - POST   /api/auth/login`);
  console.log(`   - GET    /api/auth/me`);
  console.log(`   - GET    /api/users`);
  console.log(`   - GET    /api/departments`);
  console.log(`   - GET    /api/projects`);
  console.log(`   - GET    /api/financial/summary`);
  console.log(`   - GET    /api/financial`);
  console.log('='.repeat(50));
});
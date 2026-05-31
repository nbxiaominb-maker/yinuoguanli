// Simple server startup script
const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Mock database (in production, use real database)
const users = [
  {
    id: 1,
    username: 'admin',
    password_hash: '$2a$10$YourHashedPasswordHere',
    first_name: 'System',
    last_name: 'Administrator',
    role: 'admin',
    email: 'admin@yinuokeji.com',
    department_id: 1
  },
  {
    id: 2,
    username: 'john.manager',
    password_hash: '$2a$10$YourHashedPasswordHere',
    first_name: 'John',
    last_name: 'Manager',
    role: 'manager',
    email: 'john@yinuokeji.com',
    department_id: 2
  }
];

const JWT_SECRET = 'your-secret-key-change-in-production';

async function startServer() {
  const app = express();

  // Middleware
  app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true
  }));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Health check
  app.get('/health', (req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    });
  });

  // Auth routes
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { username, password } = req.body;

      // Find user
      const user = users.find(u => u.username === username);
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // For demo, accept any password for admin users
      // In production, use: const isValid = await bcrypt.compare(password, user.password_hash);
      if (password !== 'admin123' && password !== 'manager123' && password !== 'employee123') {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Generate token
      const token = jwt.sign(
        {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          department_id: user.department_id
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

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

  // Get current user
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

      res.json(user);
    } catch (error) {
      res.status(401).json({ error: 'Invalid token' });
    }
  });

  // Basic test endpoint
  app.get('/api/test', (req, res) => {
    res.json({ message: 'Server is running!' });
  });

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`✅ Backend server running on port ${PORT}`);
    console.log(`✅ Health check: http://localhost:${PORT}/health`);
    console.log(`✅ Ready to accept login requests`);
  });
}

startServer().catch(console.error);

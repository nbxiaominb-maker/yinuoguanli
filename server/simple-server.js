// Complete minimal backend server
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 5000;
const JWT_SECRET = 'your-secret-key-change-in-production';

// Mock users database
const users = [
  {
    id: 1,
    username: 'admin',
    password: 'admin123',
    first_name: 'System',
    last_name: 'Administrator',
    role: 'admin',
    email: 'admin@yinuokeji.com',
    department_id: 1
  },
  {
    id: 2,
    username: 'john.manager',
    password: 'manager123',
    first_name: 'John',
    last_name: 'Manager',
    role: 'manager',
    email: 'john@yinuokeji.com',
    department_id: 2
  },
  {
    id: 3,
    username: 'dev1',
    password: 'employee123',
    first_name: 'Jane',
    last_name: 'Developer',
    role: 'employee',
    email: 'dev1@yinuokeji.com',
    department_id: 2
  }
];

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  console.log('Login attempt:', username);

  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    const token = jwt.sign({
      id: user.id,
      username: user.username,
      role: user.role
    }, JWT_SECRET, { expiresIn: '24h' });

    console.log('Login successful:', username);
    return res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role
      }
    });
  }

  console.log('Login failed:', username);
  return res.status(401).json({ error: 'Invalid credentials' });
});

app.get('/api/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'No token' });
  }

  try {
    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = users.find(u => u.id === decoded.id);
    res.json(user);
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`✅ Backend server running on port ${PORT}`);
  console.log(`✅ Ready for login requests`);
});

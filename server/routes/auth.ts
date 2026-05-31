import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { db, getQuery, runQuery, allQuery } from '../database/init;'
import { generateToken } from '../middleware/auth;'
import { validate, schemas } from '../middleware/validation;'
import { logger } from '../utils/logger;'

const router = Router();

// Login route
router.post('/login', validate(schemas.login), async (req: any, res) => {
  try {
    const { username, password } = req.body;

    const user = await getQuery(
      'SELECT * FROM users WHERE username = ? AND is_active = 1',
      [username]
    );

    if (!user) {
      logger.warn('Login failed: User not found', { username });
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      logger.warn('Login failed: Invalid password', { username });
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    await runQuery(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
      [user.id]
    );

    const token = generateToken(user);

    logger.info('User logged in successfully', {
      userId: user.id,
      username: user.username,
      role: user.role
    });

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
    logger.error('Login error', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    res.status(500).json({ error: 'Login failed' });
  }
});

// Register route (admin only)
router.post('/register', validate(schemas.register), async (req: any, res) => {
  try {
    const { username, email, password, first_name, last_name, role, department_id } = req.body;

    // Check if user already exists
    const existingUser = await getQuery(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existingUser) {
      logger.warn('Registration failed: User already exists', { username, email });
      return res.status(400).json({ error: 'Username or email already exists' });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const result = await runQuery(
      `INSERT INTO users (username, email, password_hash, first_name, last_name, role, department_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [username, email, password_hash, first_name, last_name, role, department_id || null]
    );

    logger.info('User registered successfully', {
      userId: result.id,
      username,
      role
    });

    res.status(201).json({
      message: 'User registered successfully',
      userId: result.id
    });
  } catch (error) {
    logger.error('Registration error', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Get current user
router.get('/me', async (req: any, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const jwt = require('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await getQuery(
      'SELECT id, username, email, first_name, last_name, role, department_id, last_login FROM users WHERE id = ?',
      [decoded.id]
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    logger.error('Get user error', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    res.status(500).json({ error: 'Failed to get user' });
  }
});

export default router;

import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { authenticate, authorize } from '../middleware/auth;'
import { validate, schemas } from '../middleware/validation;'
import { logger } from '../utils/logger;'
import { getQuery, allQuery, runQuery } from '../database/init;'

const router = Router();

// All user routes require authentication
router.use(authenticate);

// Get all users (with pagination and filtering)
router.get('/', async (req: any, res) => {
  try {
    const { page = 1, limit = 10, role, department_id, search } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT id, username, email, first_name, last_name, role, department_id, is_active, created_at, last_login FROM users WHERE 1=1';
    const params: any[] = [];

    if (role) {
      query += ' AND role = ?';
      params.push(role);
    }

    if (department_id) {
      query += ' AND department_id = ?';
      params.push(department_id);
    }

    if (search) {
      query += ' AND (username LIKE ? OR first_name LIKE ? OR last_name LIKE ? OR email LIKE ?)';
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const users = await allQuery(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM users WHERE 1=1';
    const countParams: any[] = [];

    if (role) {
      countQuery += ' AND role = ?';
      countParams.push(role);
    }

    if (department_id) {
      countQuery += ' AND department_id = ?';
      countParams.push(department_id);
    }

    if (search) {
      countQuery += ' AND (username LIKE ? OR first_name LIKE ? OR last_name LIKE ? OR email LIKE ?)';
      const searchPattern = `%${search}%`;
      countParams.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }

    const countResult = await getQuery(countQuery, countParams);

    logger.info('Users retrieved', {
      userId: req.user.id,
      count: users.length,
      total: countResult.total
    });

    res.json({
      users,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: countResult.total,
        pages: Math.ceil(countResult.total / limit)
      }
    });
  } catch (error) {
    logger.error('Get users error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: req.user.id
    });
    res.status(500).json({ error: 'Failed to retrieve users' });
  }
});

// Get single user
router.get('/:id', async (req: any, res) => {
  try {
    const user = await getQuery(
      'SELECT id, username, email, first_name, last_name, role, department_id, is_active, created_at, last_login FROM users WHERE id = ?',
      [req.params.id]
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    logger.info('User retrieved', {
      userId: req.user.id,
      retrievedUserId: req.params.id
    });

    res.json(user);
  } catch (error) {
    logger.error('Get user error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: req.user.id
    });
    res.status(500).json({ error: 'Failed to retrieve user' });
  }
});

// Update user
router.put('/:id', authorize(['admin', 'manager']), validate(schemas.updateUser), async (req: any, res) => {
  try {
    const { email, first_name, last_name, role, department_id, is_active } = req.body;

    const updates = [];
    const params = [];

    if (email !== undefined) {
      updates.push('email = ?');
      params.push(email);
    }
    if (first_name !== undefined) {
      updates.push('first_name = ?');
      params.push(first_name);
    }
    if (last_name !== undefined) {
      updates.push('last_name = ?');
      params.push(last_name);
    }
    if (role !== undefined) {
      updates.push('role = ?');
      params.push(role);
    }
    if (department_id !== undefined) {
      updates.push('department_id = ?');
      params.push(department_id);
    }
    if (is_active !== undefined) {
      updates.push('is_active = ?');
      params.push(is_active);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(req.params.id);

    await runQuery(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    logger.info('User updated', {
      userId: req.user.id,
      updatedUserId: req.params.id,
      updates
    });

    res.json({ message: 'User updated successfully' });
  } catch (error) {
    logger.error('Update user error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: req.user.id
    });
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete user (admin only)
router.delete('/:id', authorize(['admin']), async (req: any, res) => {
  try {
    await runQuery('DELETE FROM users WHERE id = ?', [req.params.id]);

    logger.info('User deleted', {
      userId: req.user.id,
      deletedUserId: req.params.id
    });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    logger.error('Delete user error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: req.user.id
    });
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Change password
router.post('/:id/change-password', authenticate, async (req: any, res) => {
  try {
    const { current_password, new_password } = req.body;

    // Users can only change their own password unless they're admin
    if (req.user.id !== parseInt(req.params.id) && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const user = await getQuery('SELECT * FROM users WHERE id = ?', [req.params.id]);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isValid = await bcrypt.compare(current_password, user.password_hash);
    if (!isValid) {
      logger.warn('Password change failed: Invalid current password', {
        userId: req.user.id,
        targetUserId: req.params.id
      });
      return res.status(401).json({ error: 'Invalid current password' });
    }

    const password_hash = await bcrypt.hash(new_password, 10);

    await runQuery(
      'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [password_hash, req.params.id]
    );

    logger.info('Password changed', {
      userId: req.user.id,
      targetUserId: req.params.id
    });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    logger.error('Change password error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: req.user.id
    });
    res.status(500).json({ error: 'Failed to change password' });
  }
});

export default router;

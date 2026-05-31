import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth;'
import { validate, schemas } from '../middleware/validation;'
import { logger } from '../utils/logger;'
import { getQuery, allQuery, runQuery } from '../database/init;'

const router = Router();

// All department routes require authentication
router.use(authenticate);

// Get all departments
router.get('/', async (req: any, res) => {
  try {
    const departments = await allQuery(`
      SELECT d.*, u.first_name || ' ' || u.last_name as manager_name,
             (SELECT COUNT(*) FROM users WHERE department_id = d.id) as employee_count
      FROM departments d
      LEFT JOIN users u ON d.manager_id = u.id
      ORDER BY d.name
    `);

    logger.info('Departments retrieved', {
      userId: req.user.id,
      count: departments.length
    });

    res.json(departments);
  } catch (error) {
    logger.error('Get departments error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: req.user.id
    });
    res.status(500).json({ error: 'Failed to retrieve departments' });
  }
});

// Get single department
router.get('/:id', async (req: any, res) => {
  try {
    const department = await getQuery(`
      SELECT d.*, u.first_name || ' ' || u.last_name as manager_name,
             (SELECT COUNT(*) FROM users WHERE department_id = d.id) as employee_count
      FROM departments d
      LEFT JOIN users u ON d.manager_id = u.id
      WHERE d.id = ?
    `, [req.params.id]);

    if (!department) {
      return res.status(404).json({ error: 'Department not found' });
    }

    // Get employees in this department
    const employees = await allQuery(`
      SELECT u.id, u.username, u.email, u.first_name, u.last_name, u.role,
             e.employee_code, e.position, e.status
      FROM users u
      LEFT JOIN employees e ON u.id = e.user_id
      WHERE u.department_id = ?
      ORDER BY u.last_name, u.first_name
    `, [req.params.id]);

    logger.info('Department retrieved', {
      userId: req.user.id,
      departmentId: req.params.id
    });

    res.json({
      ...department,
      employees
    });
  } catch (error) {
    logger.error('Get department error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: req.user.id
    });
    res.status(500).json({ error: 'Failed to retrieve department' });
  }
});

// Create department
router.post('/', authorize(['admin', 'manager']), validate(schemas.department), async (req: any, res) => {
  try {
    const { name, code, description, manager_id, parent_department_id, budget } = req.body;

    const result = await runQuery(
      `INSERT INTO departments (name, code, description, manager_id, parent_department_id, budget)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, code, description, manager_id || null, parent_department_id || null, budget || null]
    );

    logger.info('Department created', {
      userId: req.user.id,
      departmentId: result.id,
      name
    });

    res.status(201).json({
      message: 'Department created successfully',
      departmentId: result.id
    });
  } catch (error) {
    logger.error('Create department error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: req.user.id
    });
    res.status(500).json({ error: 'Failed to create department' });
  }
});

// Update department
router.put('/:id', authorize(['admin', 'manager']), validate(schemas.department), async (req: any, res) => {
  try {
    const { name, code, description, manager_id, parent_department_id, budget } = req.body;

    await runQuery(
      `UPDATE departments
       SET name = ?, code = ?, description = ?, manager_id = ?, parent_department_id = ?, budget = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [name, code, description, manager_id || null, parent_department_id || null, budget || null, req.params.id]
    );

    logger.info('Department updated', {
      userId: req.user.id,
      departmentId: req.params.id
    });

    res.json({ message: 'Department updated successfully' });
  } catch (error) {
    logger.error('Update department error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: req.user.id
    });
    res.status(500).json({ error: 'Failed to update department' });
  }
});

// Delete department
router.delete('/:id', authorize(['admin']), async (req: any, res) => {
  try {
    // Check if department has users
    const usersCount = await getQuery(
      'SELECT COUNT(*) as count FROM users WHERE department_id = ?',
      [req.params.id]
    );

    if (usersCount.count > 0) {
      return res.status(400).json({
        error: 'Cannot delete department with assigned users'
      });
    }

    await runQuery('DELETE FROM departments WHERE id = ?', [req.params.id]);

    logger.info('Department deleted', {
      userId: req.user.id,
      departmentId: req.params.id
    });

    res.json({ message: 'Department deleted successfully' });
  } catch (error) {
    logger.error('Delete department error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: req.user.id
    });
    res.status(500).json({ error: 'Failed to delete department' });
  }
});

export default router;

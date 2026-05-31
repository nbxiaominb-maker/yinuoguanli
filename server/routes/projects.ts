import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth;'
import { validate, schemas } from '../middleware/validation;'
import { logger } from '../utils/logger;'
import { getQuery, allQuery, runQuery } from '../database/init;'

const router = Router();

// All project routes require authentication
router.use(authenticate);

// Get all projects
router.get('/', async (req: any, res) => {
  try {
    const { status, department_id, manager_id, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT p.*, d.name as department_name, u.first_name || ' ' || u.last_name as manager_name
      FROM projects p
      LEFT JOIN departments d ON p.department_id = d.id
      LEFT JOIN users u ON p.manager_id = u.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (status) {
      query += ' AND p.status = ?';
      params.push(status);
    }

    if (department_id) {
      query += ' AND p.department_id = ?';
      params.push(department_id);
    }

    if (manager_id) {
      query += ' AND p.manager_id = ?';
      params.push(manager_id);
    }

    query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const projects = await allQuery(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM projects WHERE 1=1';
    const countParams: any[] = [];

    if (status) {
      countQuery += ' AND status = ?';
      countParams.push(status);
    }

    if (department_id) {
      countQuery += ' AND department_id = ?';
      countParams.push(department_id);
    }

    if (manager_id) {
      countQuery += ' AND manager_id = ?';
      countParams.push(manager_id);
    }

    const countResult = await getQuery(countQuery, countParams);

    logger.info('Projects retrieved', {
      userId: req.user.id,
      count: projects.length
    });

    res.json({
      projects,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: countResult.total,
        pages: Math.ceil(countResult.total / limit)
      }
    });
  } catch (error) {
    logger.error('Get projects error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: req.user.id
    });
    res.status(500).json({ error: 'Failed to retrieve projects' });
  }
});

// Get single project
router.get('/:id', async (req: any, res) => {
  try {
    const project = await getQuery(`
      SELECT p.*, d.name as department_name, u.first_name || ' ' || u.last_name as manager_name
      FROM projects p
      LEFT JOIN departments d ON p.department_id = d.id
      LEFT JOIN users u ON p.manager_id = u.id
      WHERE p.id = ?
    `, [req.params.id]);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Get project members
    const members = await allQuery(`
      SELECT pm.*, e.employee_code, u.first_name || ' ' || u.last_name as name
      FROM project_members pm
      LEFT JOIN employees e ON pm.employee_id = e.id
      LEFT JOIN users u ON e.user_id = u.id
      WHERE pm.project_id = ?
    `, [req.params.id]);

    // Get project financial transactions
    const transactions = await allQuery(`
      SELECT * FROM financial_transactions
      WHERE project_id = ?
      ORDER BY transaction_date DESC
    `, [req.params.id]);

    logger.info('Project retrieved', {
      userId: req.user.id,
      projectId: req.params.id
    });

    res.json({
      ...project,
      members,
      transactions
    });
  } catch (error) {
    logger.error('Get project error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: req.user.id
    });
    res.status(500).json({ error: 'Failed to retrieve project' });
  }
});

// Create project
router.post('/', authorize(['admin', 'manager']), validate(schemas.project), async (req: any, res) => {
  try {
    const {
      name, code, description, client_name, start_date, end_date,
      budget, status, priority, department_id, manager_id
    } = req.body;

    const result = await runQuery(
      `INSERT INTO projects (name, code, description, client_name, start_date, end_date, budget, status, priority, department_id, manager_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name, code, description, client_name, start_date, end_date,
        budget || null, status || 'planning', priority || 'medium',
        department_id || null, manager_id || null
      ]
    );

    logger.info('Project created', {
      userId: req.user.id,
      projectId: result.id,
      name
    });

    res.status(201).json({
      message: 'Project created successfully',
      projectId: result.id
    });
  } catch (error) {
    logger.error('Create project error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: req.user.id
    });
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// Update project
router.put('/:id', authorize(['admin', 'manager']), validate(schemas.project), async (req: any, res) => {
  try {
    const {
      name, code, description, client_name, start_date, end_date,
      budget, status, priority, department_id, manager_id, progress
    } = req.body;

    await runQuery(
      `UPDATE projects
       SET name = ?, code = ?, description = ?, client_name = ?, start_date = ?, end_date = ?,
           budget = ?, status = ?, priority = ?, department_id = ?, manager_id = ?, progress = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        name, code, description, client_name, start_date, end_date,
        budget || null, status, priority,
        department_id || null, manager_id || null,
        progress || 0, req.params.id
      ]
    );

    logger.info('Project updated', {
      userId: req.user.id,
      projectId: req.params.id
    });

    res.json({ message: 'Project updated successfully' });
  } catch (error) {
    logger.error('Update project error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: req.user.id
    });
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// Add project member
router.post('/:id/members', authorize(['admin', 'manager']), async (req: any, res) => {
  try {
    const { employee_id, role = 'member' } = req.body;

    await runQuery(
      'INSERT INTO project_members (project_id, employee_id, role) VALUES (?, ?, ?)',
      [req.params.id, employee_id, role]
    );

    logger.info('Project member added', {
      userId: req.user.id,
      projectId: req.params.id,
      employeeId: employee_id
    });

    res.status(201).json({ message: 'Member added to project successfully' });
  } catch (error) {
    logger.error('Add project member error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: req.user.id
    });
    res.status(500).json({ error: 'Failed to add member to project' });
  }
});

// Remove project member
router.delete('/:id/members/:employeeId', authorize(['admin', 'manager']), async (req: any, res) => {
  try {
    await runQuery(
      'DELETE FROM project_members WHERE project_id = ? AND employee_id = ?',
      [req.params.id, req.params.employeeId]
    );

    logger.info('Project member removed', {
      userId: req.user.id,
      projectId: req.params.id,
      employeeId: req.params.employeeId
    });

    res.json({ message: 'Member removed from project successfully' });
  } catch (error) {
    logger.error('Remove project member error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: req.user.id
    });
    res.status(500).json({ error: 'Failed to remove member from project' });
  }
});

// Delete project
router.delete('/:id', authorize(['admin']), async (req: any, res) => {
  try {
    await runQuery('DELETE FROM projects WHERE id = ?', [req.params.id]);

    logger.info('Project deleted', {
      userId: req.user.id,
      projectId: req.params.id
    });

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    logger.error('Delete project error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: req.user.id
    });
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

export default router;

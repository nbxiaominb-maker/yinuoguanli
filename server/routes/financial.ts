import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth;'
import { validate, schemas } from '../middleware/validation;'
import { logger } from '../utils/logger;'
import { getQuery, allQuery, runQuery } from '../database/init;'

const router = Router();

// All financial routes require authentication
router.use(authenticate);

// Get all financial transactions
router.get('/', async (req: any, res) => {
  try {
    const {
      transaction_type, category, department_id, project_id,
      start_date, end_date, page = 1, limit = 10
    } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT ft.*, d.name as department_name, p.name as project_name,
             u.first_name || ' ' || u.last_name as created_by_name
      FROM financial_transactions ft
      LEFT JOIN departments d ON ft.department_id = d.id
      LEFT JOIN projects p ON ft.project_id = p.id
      LEFT JOIN users u ON ft.created_by = u.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (transaction_type) {
      query += ' AND ft.transaction_type = ?';
      params.push(transaction_type);
    }

    if (category) {
      query += ' AND ft.category = ?';
      params.push(category);
    }

    if (department_id) {
      query += ' AND ft.department_id = ?';
      params.push(department_id);
    }

    if (project_id) {
      query += ' AND ft.project_id = ?';
      params.push(project_id);
    }

    if (start_date) {
      query += ' AND ft.transaction_date >= ?';
      params.push(start_date);
    }

    if (end_date) {
      query += ' AND ft.transaction_date <= ?';
      params.push(end_date);
    }

    query += ' ORDER BY ft.transaction_date DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const transactions = await allQuery(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM financial_transactions WHERE 1=1';
    const countParams: any[] = [];

    if (transaction_type) {
      countQuery += ' AND transaction_type = ?';
      countParams.push(transaction_type);
    }

    if (category) {
      countQuery += ' AND category = ?';
      countParams.push(category);
    }

    if (department_id) {
      countQuery += ' AND department_id = ?';
      countParams.push(department_id);
    }

    if (project_id) {
      countQuery += ' AND project_id = ?';
      countParams.push(project_id);
    }

    if (start_date) {
      countQuery += ' AND transaction_date >= ?';
      countParams.push(start_date);
    }

    if (end_date) {
      countQuery += ' AND transaction_date <= ?';
      countParams.push(end_date);
    }

    const countResult = await getQuery(countQuery, countParams);

    logger.info('Financial transactions retrieved', {
      userId: req.user.id,
      count: transactions.length
    });

    res.json({
      transactions,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: countResult.total,
        pages: Math.ceil(countResult.total / limit)
      }
    });
  } catch (error) {
    logger.error('Get financial transactions error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: req.user.id
    });
    res.status(500).json({ error: 'Failed to retrieve financial transactions' });
  }
});

// Get financial summary
router.get('/summary', async (req: any, res) => {
  try {
    const { start_date, end_date, department_id } = req.query;

    let dateFilter = '';
    const params: any[] = [];

    if (start_date && end_date) {
      dateFilter = 'AND transaction_date BETWEEN ? AND ?';
      params.push(start_date, end_date);
    }

    let deptFilter = '';
    if (department_id) {
      deptFilter = 'AND department_id = ?';
      params.push(department_id);
    }

    const summary = await getQuery(`
      SELECT
        transaction_type,
        category,
        COUNT(*) as count,
        SUM(amount) as total
      FROM financial_transactions
      WHERE status = 'completed' ${dateFilter} ${deptFilter}
      GROUP BY transaction_type, category
      ORDER BY transaction_type, category
    `, params);

    const totalSummary = await getQuery(`
      SELECT
        SUM(CASE WHEN transaction_type = 'income' THEN amount ELSE 0 END) as total_income,
        SUM(CASE WHEN transaction_type = 'expense' THEN amount ELSE 0 END) as total_expense,
        SUM(CASE WHEN transaction_type = 'income' THEN amount ELSE 0 END) -
        SUM(CASE WHEN transaction_type = 'expense' THEN amount ELSE 0 END) as net_balance
      FROM financial_transactions
      WHERE status = 'completed' ${dateFilter} ${deptFilter}
    `, params);

    logger.info('Financial summary retrieved', {
      userId: req.user.id
    });

    res.json({
      summary,
      totals: totalSummary
    });
  } catch (error) {
    logger.error('Get financial summary error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: req.user.id
    });
    res.status(500).json({ error: 'Failed to retrieve financial summary' });
  }
});

// Get single transaction
router.get('/:id', async (req: any, res) => {
  try {
    const transaction = await getQuery(`
      SELECT ft.*, d.name as department_name, p.name as project_name,
             u.first_name || ' ' || u.last_name as created_by_name
      FROM financial_transactions ft
      LEFT JOIN departments d ON ft.department_id = d.id
      LEFT JOIN projects p ON ft.project_id = p.id
      LEFT JOIN users u ON ft.created_by = u.id
      WHERE ft.id = ?
    `, [req.params.id]);

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    logger.info('Financial transaction retrieved', {
      userId: req.user.id,
      transactionId: req.params.id
    });

    res.json(transaction);
  } catch (error) {
    logger.error('Get financial transaction error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: req.user.id
    });
    res.status(500).json({ error: 'Failed to retrieve transaction' });
  }
});

// Create transaction
router.post('/', authorize(['admin', 'manager']), validate(schemas.transaction), async (req: any, res) => {
  try {
    const {
      transaction_type, category, amount, description, project_id,
      department_id, transaction_date, notes
    } = req.body;

    // Generate reference number
    const reference_number = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const result = await runQuery(
      `INSERT INTO financial_transactions
       (transaction_type, category, amount, description, reference_number, project_id, department_id, transaction_date, created_by, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        transaction_type, category, amount, description, reference_number,
        project_id || null, department_id || null, transaction_date,
        req.user.id, notes || null
      ]
    );

    logger.info('Financial transaction created', {
      userId: req.user.id,
      transactionId: result.id,
      type: transaction_type,
      amount
    });

    res.status(201).json({
      message: 'Transaction created successfully',
      transactionId: result.id,
      reference_number
    });
  } catch (error) {
    logger.error('Create financial transaction error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: req.user.id
    });
    res.status(500).json({ error: 'Failed to create transaction' });
  }
});

// Update transaction
router.put('/:id', authorize(['admin', 'manager']), validate(schemas.transaction), async (req: any, res) => {
  try {
    const {
      transaction_type, category, amount, description, project_id,
      department_id, transaction_date, status, notes
    } = req.body;

    await runQuery(
      `UPDATE financial_transactions
       SET transaction_type = ?, category = ?, amount = ?, description = ?,
           project_id = ?, department_id = ?, transaction_date = ?, status = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        transaction_type, category, amount, description,
        project_id || null, department_id || null, transaction_date, status, notes || null,
        req.params.id
      ]
    );

    logger.info('Financial transaction updated', {
      userId: req.user.id,
      transactionId: req.params.id
    });

    res.json({ message: 'Transaction updated successfully' });
  } catch (error) {
    logger.error('Update financial transaction error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: req.user.id
    });
    res.status(500).json({ error: 'Failed to update transaction' });
  }
});

// Delete transaction
router.delete('/:id', authorize(['admin']), async (req: any, res) => {
  try {
    await runQuery('DELETE FROM financial_transactions WHERE id = ?', [req.params.id]);

    logger.info('Financial transaction deleted', {
      userId: req.user.id,
      transactionId: req.params.id
    });

    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    logger.error('Delete financial transaction error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: req.user.id
    });
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
});

export default router;

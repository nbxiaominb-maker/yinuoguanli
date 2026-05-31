// 客户关系管理路由
import express from 'express';
import { Request, Response } from 'express';

const router = express.Router();

// 模拟CRM数据
let customers = [
  {
    id: 1,
    customer_code: 'CUST001',
    company_name: '客户公司A',
    contact_person: '王经理',
    phone: '13600136000',
    email: 'wang@clienta.com',
    industry: '制造业',
    region: '华东',
    tier: 'A',
    status: 'active',
    address: '上海市浦东新区',
    credit_limit: 500000,
    current_balance: 120000,
    total_purchases: 850000,
    last_order_date: '2026-05-20',
    satisfaction_score: 4.5,
    created_at: '2026-01-10'
  },
  {
    id: 2,
    customer_code: 'CUST002',
    company_name: '科技公司B',
    contact_person: '李总',
    phone: '13700137000',
    email: 'li@clientb.com',
    industry: '科技',
    region: '华南',
    tier: 'B',
    status: 'active',
    address: '深圳市南山区',
    credit_limit: 300000,
    current_balance: 80000,
    total_purchases: 450000,
    last_order_date: '2026-05-15',
    satisfaction_score: 4.2,
    created_at: '2026-02-15'
  }
];

let salesOpportunities = [
  {
    id: 1,
    opportunity_name: '大型设备采购项目',
    customer_id: 1,
    stage: 'proposal',
    value: 250000,
    probability: 60,
    expected_close_date: '2026-07-30',
    owner: 2,
    source: 'outbound_call',
    description: '客户需要采购新的生产设备',
    activities: [
      { date: '2026-05-25', type: 'call', notes: '技术需求沟通' },
      { date: '2026-05-28', type: 'meeting', notes: '现场考察' }
    ],
    created_at: '2026-05-01'
  }
];

let customerInteractions = [
  {
    id: 1,
    customer_id: 1,
    interaction_type: 'call',
    subject: '技术支持跟进',
    notes: '客户反馈设备运行情况良好，希望增加维护服务',
    interaction_date: '2026-05-25',
    created_by: 2,
    next_follow_up: '2026-06-01'
  }
];

// 客户管理
router.get('/customers', (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    res.json({
      customers,
      pagination: { page: 1, limit: 10, total: customers.length, pages: 1 }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve customers' });
  }
});

router.post('/customers', (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const newCustomer = {
      id: customers.length + 1,
      customer_code: `CUST${String(customers.length + 1).padStart(3, '0')}`,
      ...req.body,
      tier: req.body.tier || 'C',
      status: 'active',
      credit_limit: req.body.credit_limit || 100000,
      current_balance: 0,
      total_purchases: 0,
      satisfaction_score: 4.0,
      created_at: new Date().toISOString().split('T')[0]
    };

    customers.push(newCustomer);
    res.status(201).json(newCustomer);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create customer' });
  }
});

// 销售机会管理
router.get('/opportunities', (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const opportunitiesWithDetails = salesOpportunities.map(opp => {
      const customer = customers.find(c => c.id === opp.customer_id);
      return {
        ...opp,
        customer_name: customer ? customer.company_name : 'Unknown'
      };
    });

    res.json({
      opportunities: opportunitiesWithDetails,
      pagination: { page: 1, limit: 10, total: opportunitiesWithDetails.length, pages: 1 }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve opportunities' });
  }
});

router.post('/opportunities', (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const newOpportunity = {
      id: salesOpportunities.length + 1,
      ...req.body,
      stage: 'prospecting',
      probability: 20,
      activities: [],
      created_at: new Date().toISOString().split('T')[0]
    };

    salesOpportunities.push(newOpportunity);
    res.status(201).json(newOpportunity);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create opportunity' });
  }
});

// 客户互动记录
router.get('/interactions', (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const interactionsWithDetails = customerInteractions.map(interaction => {
      const customer = customers.find(c => c.id === interaction.customer_id);
      return {
        ...interaction,
        customer_name: customer ? customer.company_name : 'Unknown'
      };
    });

    res.json({
      interactions: interactionsWithDetails,
      pagination: { page: 1, limit: 10, total: interactionsWithDetails.length, pages: 1 }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve interactions' });
  }
});

router.post('/interactions', (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const newInteraction = {
      id: customerInteractions.length + 1,
      ...req.body,
      interaction_date: req.body.interaction_date || new Date().toISOString().split('T')[0],
      created_by: 1,
      created_at: new Date().toISOString().split('T')[0]
    };

    customerInteractions.push(newInteraction);
    res.status(201).json(newInteraction);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create interaction' });
  }
});

// CRM KPI指标
router.get('/kpi', (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const totalCustomers = customers.length;
    const activeCustomers = customers.filter(c => c.status === 'active').length;
    const totalOpportunities = salesOpportunities.length;
    const totalOpportunityValue = salesOpportunities.reduce((sum, o) => sum + o.value, 0);
    const avgSatisfactionScore = customers.reduce((sum, c) => sum + c.satisfaction_score, 0) / customers.length;
    const customerRetentionRate = 85.2;
    const customerAcquisitionCost = 3500;

    res.json({
      total_customers: totalCustomers,
      active_customers: activeCustomers,
      total_opportunities: totalOpportunities,
      total_opportunity_value: totalOpportunityValue,
      avg_satisfaction_score: Math.round(avgSatisfactionScore * 10) / 10,
      customer_retention_rate: customerRetentionRate,
      customer_acquisition_cost: customerAcquisitionCost,
      sales_cycle_length: 45, // 天数
      conversion_rate: 23.5 // 百分比
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve CRM KPI' });
  }
});

export default router;
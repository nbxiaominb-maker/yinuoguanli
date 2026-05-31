// 生产制造管理路由
import express from 'express';
import { Request, Response } from 'express';

const router = express.Router();

// 模拟生产数据
let productionOrders = [
  {
    id: 1,
    order_number: 'PROD001',
    product_name: '产品A',
    product_code: 'P001',
    quantity: 1000,
    unit: '件',
    status: 'in_production',
    priority: 'high',
    start_date: '2026-05-20',
    planned_end_date: '2026-06-10',
    actual_end_date: null,
    progress: 45,
    work_center: '车间A',
    assigned_to: [2, 3],
    materials: [
      { item_id: 1, item_name: '原材料A', quantity: 500, unit: 'kg' },
      { item_id: 2, item_name: '电子元件B', quantity: 200, unit: '件' }
    ],
    estimated_cost: 80000,
    actual_cost: 35000,
    quality_checks: 0,
    defects: 0,
    created_by: 1
  }
];

let workCenters = [
  {
    id: 1,
    name: '车间A',
    code: 'WC-A',
    location: '生产区A栋',
    capacity: 8,
    current_load: 6,
    supervisor: 'john.manager',
    status: 'active',
    equipment: [
      { name: 'CNC机床-01', status: 'running', utilization: 85 },
      { name: 'CNC机床-02', status: 'maintenance', utilization: 0 }
    ]
  },
  {
    id: 2,
    name: '装配线B',
    code: 'WC-B',
    location: '生产区B栋',
    capacity: 20,
    current_load: 15,
    supervisor: 'sarah.sales',
    status: 'active',
    equipment: [
      { name: '装配台-01', status: 'running', utilization: 90 },
      { name: '装配台-02', status: 'running', utilization: 75 }
    ]
  }
];

// 生产订单管理
router.get('/production-orders', (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    res.json({
      production_orders: productionOrders,
      pagination: { page: 1, limit: 10, total: productionOrders.length, pages: 1 }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve production orders' });
  }
});

router.post('/production-orders', (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const newOrder = {
      id: productionOrders.length + 1,
      order_number: `PROD${String(productionOrders.length + 1).padStart(3, '0')}`,
      ...req.body,
      status: 'planned',
      progress: 0,
      actual_end_date: null,
      actual_cost: 0,
      quality_checks: 0,
      defects: 0,
      created_by: 1,
      created_at: new Date().toISOString().split('T')[0]
    };

    productionOrders.push(newOrder);
    res.status(201).json(newOrder);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create production order' });
  }
});

router.put('/production-orders/:id', (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const order = productionOrders.find(o => o.id === parseInt(req.params.id));
    if (!order) {
      return res.status(404).json({ error: 'Production order not found' });
    }

    Object.assign(order, req.body);
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update production order' });
  }
});

// 工作中心管理
router.get('/work-centers', (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    res.json({ work_centers: workCenters });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve work centers' });
  }
});

// 生产KPI指标
router.get('/kpi', (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const totalOrders = productionOrders.length;
    const inProductionOrders = productionOrders.filter(o => o.status === 'in_production').length;
    const completedOrders = productionOrders.filter(o => o.status === 'completed').length;
    const avgProgress = productionOrders.reduce((sum, o) => sum + o.progress, 0) / totalOrders;

    res.json({
      total_orders: totalOrders,
      in_production: inProductionOrders,
      completed: completedOrders,
      planning_orders: totalOrders - inProductionOrders - completedOrders,
      on_time_delivery_rate: 92.5,
      production_efficiency: 87.3,
      capacity_utilization: 78.5,
      quality_rate: 96.8,
      defect_rate: 1.2,
      avg_progress: Math.round(avgProgress),
      work_center_utilization: 76.8
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve manufacturing KPI' });
  }
});

// 生产调度建议
router.get('/schedule-suggestions', (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const suggestions = [
      {
        type: 'capacity_optimization',
        priority: 'high',
        title: '车间A产能优化',
        description: '车间A当前负荷75%，建议重新分配订单到车间B以提高效率',
        estimated_benefit: '提升产能利用率15%'
      },
      {
        type: 'material_shortage',
        priority: 'urgent',
        title: '原材料不足预警',
        description: '生产订单PROD001所需原材料库存不足，建议紧急采购',
        affected_orders: ['PROD001'],
        recommended_action: '立即联系供应商S001'
      }
    ];

    res.json({ suggestions });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve schedule suggestions' });
  }
});

export default router;
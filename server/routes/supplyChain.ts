// 供应链管理路由
import express from 'express';
import { Request, Response } from 'express';

const router = express.Router();

// 模拟供应链数据
let suppliers = [
  {
    id: 1,
    name: '一诺供应商A',
    code: 'S001',
    contact: '张三',
    phone: '13800138000',
    email: 'zhangsan@yinuokeji.com',
    address: '北京市朝阳区',
    category: '原材料',
    rating: 'A',
    status: 'active',
    created_at: '2026-01-15'
  },
  {
    id: 2,
    name: '科技设备供应商',
    code: 'S002',
    contact: '李四',
    phone: '13900139000',
    email: 'lisi@supplier.com',
    address: '上海市浦东区',
    category: '设备',
    rating: 'B',
    status: 'active',
    created_at: '2026-02-10'
  }
];

let purchaseOrders = [
  {
    id: 1,
    order_number: 'PO202601001',
    supplier_id: 1,
    order_date: '2026-05-15',
    delivery_date: '2026-05-30',
    status: 'pending',
    total_amount: 50000,
    items: [
      { product_name: '原材料A', quantity: 100, unit_price: 500, total: 50000 }
    ],
    priority: 'high',
    created_by: 1
  }
];

// 供应商管理
router.get('/suppliers', (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    res.json({
      suppliers,
      pagination: { page: 1, limit: 10, total: suppliers.length, pages: 1 }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve suppliers' });
  }
});

router.post('/suppliers', (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const newSupplier = {
      id: suppliers.length + 1,
      ...req.body,
      status: 'active',
      created_at: new Date().toISOString().split('T')[0]
    };

    suppliers.push(newSupplier);
    res.status(201).json(newSupplier);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create supplier' });
  }
});

// 采购订单管理
router.get('/purchase-orders', (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const ordersWithDetails = purchaseOrders.map(order => {
      const supplier = suppliers.find(s => s.id === order.supplier_id);
      return {
        ...order,
        supplier_name: supplier ? supplier.name : 'Unknown'
      };
    });

    res.json({
      purchase_orders: ordersWithDetails,
      pagination: { page: 1, limit: 10, total: ordersWithDetails.length, pages: 1 }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve purchase orders' });
  }
});

router.post('/purchase-orders', (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const newOrder = {
      id: purchaseOrders.length + 1,
      order_number: `PO${new Date().getFullYear()}${String(purchaseOrders.length + 1).padStart(3, '0')}`,
      ...req.body,
      status: 'pending',
      created_by: 1,
      created_at: new Date().toISOString().split('T')[0]
    };

    purchaseOrders.push(newOrder);
    res.status(201).json(newOrder);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create purchase order' });
  }
});

// 供应链KPI指标
router.get('/kpi', (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const kpiData = {
      supplier_count: suppliers.length,
      active_suppliers: suppliers.filter(s => s.status === 'active').length,
      pending_orders: purchaseOrders.filter(o => o.status === 'pending').length,
      total_purchase_value: purchaseOrders.reduce((sum, o) => sum + o.total_amount, 0),
      avg_supplier_rating: suppliers.length > 0 ? 'A' : 'N/A',
      on_time_delivery_rate: 85.5,
      quality_acceptance_rate: 92.3
    };

    res.json(kpiData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve KPI data' });
  }
});

export default router;
// 库存管理路由
import express from 'express';
import { Request, Response } from 'express';

const router = express.Router();

// 模拟库存数据
let inventoryItems = [
  {
    id: 1,
    item_code: 'INV001',
    item_name: '原材料A',
    category: '原材料',
    quantity: 500,
    unit: 'kg',
    min_stock: 100,
    max_stock: 1000,
    unit_cost: 50,
    total_value: 25000,
    location: '仓库A-01',
    supplier_id: 1,
    status: 'in_stock',
    last_updated: '2026-05-30'
  },
  {
    id: 2,
    item_code: 'INV002',
    item_name: '电子元件B',
    category: '电子元件',
    quantity: 200,
    unit: '件',
    min_stock: 50,
    max_stock: 500,
    unit_cost: 120,
    total_value: 24000,
    location: '仓库A-02',
    supplier_id: 2,
    status: 'in_stock',
    last_updated: '2026-05-28'
  },
  {
    id: 3,
    item_code: 'INV003',
    item_name: '包装材料C',
    category: '包装材料',
    quantity: 30,
    unit: '箱',
    min_stock: 50,
    max_stock: 200,
    unit_cost: 80,
    total_value: 2400,
    location: '仓库B-01',
    supplier_id: 1,
    status: 'low_stock',
    last_updated: '2026-05-25'
  }
];

let stockMovements = [
  {
    id: 1,
    item_id: 1,
    movement_type: 'in',
    quantity: 100,
    reference: 'PO202601001',
    movement_date: '2026-05-15',
    operator: 'admin',
    notes: '采购入库'
  },
  {
    id: 2,
    item_id: 2,
    movement_type: 'out',
    quantity: 50,
    reference: 'PROD001',
    movement_date: '2026-05-20',
    operator: 'admin',
    notes: '生产领料'
  }
];

// 库存物品管理
router.get('/items', (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    res.json({
      inventory_items: inventoryItems,
      pagination: { page: 1, limit: 10, total: inventoryItems.length, pages: 1 }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve inventory items' });
  }
});

router.get('/items/:id', (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const item = inventoryItems.find(i => i.id === parseInt(req.params.id));
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const movements = stockMovements.filter(m => m.item_id === item.id);
    res.json({ item, movements });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve item details' });
  }
});

// 库存盘点
router.post('/items/:id/adjust', (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const item = inventoryItems.find(i => i.id === parseInt(req.params.id));
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const { quantity, reason } = req.body;
    const difference = quantity - item.quantity;

    // 更新库存数量
    item.quantity = quantity;
    item.total_value = quantity * item.unit_cost;
    item.last_updated = new Date().toISOString().split('T')[0];

    // 创建库存移动记录
    const movement = {
      id: stockMovements.length + 1,
      item_id: item.id,
      movement_type: difference >= 0 ? 'adjustment_in' : 'adjustment_out',
      quantity: Math.abs(difference),
      reference: 'MANUAL',
      movement_date: new Date().toISOString().split('T')[0],
      operator: 'admin',
      notes: reason || '手动调整'
    };
    stockMovements.push(movement);

    res.json({ item, movement });
  } catch (error) {
    res.status(500).json({ error: 'Failed to adjust inventory' });
  }
});

// 库存移动记录
router.get('/movements', (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const movementsWithDetails = stockMovements.map(movement => {
      const item = inventoryItems.find(i => i.id === movement.item_id);
      return {
        ...movement,
        item_name: item ? item.item_name : 'Unknown',
        item_code: item ? item.item_code : 'Unknown'
      };
    });

    res.json({
      movements: movementsWithDetails,
      pagination: { page: 1, limit: 10, total: movementsWithDetails.length, pages: 1 }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve stock movements' });
  }
});

// 库存KPI指标
router.get('/kpi', (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const totalItems = inventoryItems.length;
    const lowStockItems = inventoryItems.filter(i => i.status === 'low_stock').length;
    const totalInventoryValue = inventoryItems.reduce((sum, i) => sum + i.total_value, 0);
    const inventoryTurnoverRate = 4.2; // 库存周转率
    const stockAccuracy = 98.5; // 库存准确率

    res.json({
      total_items: totalItems,
      low_stock_items: lowStockItems,
      total_inventory_value: totalInventoryValue,
      inventory_turnover_rate: inventoryTurnoverRate,
      stock_accuracy: stockAccuracy,
      stockout_rate: 2.1,
      carrying_cost_rate: 15.8
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve inventory KPI' });
  }
});

// 预警信息
router.get('/alerts', (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const alerts = inventoryItems
      .filter(item => item.quantity <= item.min_stock)
      .map(item => ({
        item_id: item.id,
        item_name: item.item_name,
        current_quantity: item.quantity,
        min_quantity: item.min_stock,
        alert_type: 'low_stock',
        priority: item.quantity < item.min_stock * 0.5 ? 'high' : 'medium',
        recommendation: `建议补货至${item.max_stock}${item.unit}`
      }));

    res.json({ alerts });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve inventory alerts' });
  }
});

export default router;
// 人力资源管理路由
import express from 'express';
import { Request, Response } from 'express';

const router = express.Router();

// 模拟HR数据
let employees = [
  {
    id: 1,
    employee_code: 'EMP001',
    user_id: 1,
    first_name: 'System',
    last_name: 'Administrator',
    department_id: 1,
    position: '系统管理员',
    employment_type: 'full_time',
    hire_date: '2020-01-15',
    status: 'active',
    salary: 15000,
    manager_id: null,
    skills: ['系统管理', '技术支持'],
    education: '本科',
    performance_score: 4.5,
    last_evaluation: '2026-01-15'
  },
  {
    id: 2,
    employee_code: 'EMP002',
    user_id: 2,
    first_name: 'John',
    last_name: 'Manager',
    department_id: 2,
    position: '部门经理',
    employment_type: 'full_time',
    hire_date: '2019-06-01',
    status: 'active',
    salary: 25000,
    manager_id: 1,
    skills: ['项目管理', '团队管理', '技术架构'],
    education: '硕士',
    performance_score: 4.8,
    last_evaluation: '2026-03-20'
  },
  {
    id: 3,
    employee_code: 'EMP003',
    user_id: 3,
    first_name: 'Jane',
    last_name: 'Developer',
    department_id: 2,
    position: '软件工程师',
    employment_type: 'full_time',
    hire_date: '2021-03-10',
    status: 'active',
    salary: 18000,
    manager_id: 2,
    skills: ['React开发', 'Node.js', '数据库'],
    education: '本科',
    performance_score: 4.2,
    last_evaluation: '2026-02-10'
  }
];

let leaveRequests = [
  {
    id: 1,
    employee_id: 3,
    leave_type: 'annual',
    start_date: '2026-06-01',
    end_date: '2026-06-05',
    days: 5,
    reason: '家庭事务',
    status: 'pending',
    applied_date: '2026-05-25',
    approved_by: null,
    approved_date: null
  }
];

let recruitments = [
  {
    id: 1,
    position: '前端开发工程师',
    department_id: 2,
    vacancies: 2,
    employment_type: 'full_time',
    salary_range: '15000-20000',
    status: 'open',
    posted_date: '2026-05-10',
    applications: 15,
    requirements: ['React经验2年以上', 'TypeScript熟练', '团队协作能力'],
    responsibilities: ['前端页面开发', '组件维护', '代码优化']
  }
];

// 员工管理
router.get('/employees', (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const employeesWithDetails = employees.map(emp => {
      const department = { id: 1, name: 'Executive' }; // 简化的部门信息
      return {
        ...emp,
        department_name: department ? department.name : 'Unknown'
      };
    });

    res.json({
      employees: employeesWithDetails,
      pagination: { page: 1, limit: 10, total: employeesWithDetails.length, pages: 1 }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve employees' });
  }
});

router.get('/employees/:id', (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const employee = employees.find(e => e.id === parseInt(req.params.id));
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json(employee);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve employee details' });
  }
});

// 请假管理
router.get('/leave-requests', (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const requestsWithDetails = leaveRequests.map(request => {
      const employee = employees.find(e => e.id === request.employee_id);
      return {
        ...request,
        employee_name: employee ? `${employee.first_name} ${employee.last_name}` : 'Unknown',
        employee_code: employee ? employee.employee_code : 'Unknown'
      };
    });

    res.json({
      leave_requests: requestsWithDetails,
      pagination: { page: 1, limit: 10, total: requestsWithDetails.length, pages: 1 }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve leave requests' });
  }
});

router.post('/leave-requests', (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const newRequest = {
      id: leaveRequests.length + 1,
      ...req.body,
      status: 'pending',
      applied_date: new Date().toISOString().split('T')[0],
      approved_by: null,
      approved_date: null
    };

    leaveRequests.push(newRequest);
    res.status(201).json(newRequest);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create leave request' });
  }
});

router.put('/leave-requests/:id/approve', (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const request = leaveRequests.find(lr => lr.id === parseInt(req.params.id));
    if (!request) {
      return res.status(404).json({ error: 'Leave request not found' });
    }

    request.status = 'approved';
    request.approved_by = 1;
    request.approved_date = new Date().toISOString().split('T')[0];

    res.json(request);
  } catch (error) {
    res.status(500).json({ error: 'Failed to approve leave request' });
  }
});

// 招聘管理
router.get('/recruitments', (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    res.json({
      recruitments,
      pagination: { page: 1, limit: 10, total: recruitments.length, pages: 1 }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve recruitments' });
  }
});

router.post('/recruitments', (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const newRecruitment = {
      id: recruitments.length + 1,
      ...req.body,
      status: 'open',
      posted_date: new Date().toISOString().split('T')[0],
      applications: 0
    };

    recruitments.push(newRecruitment);
    res.status(201).json(newRecruitment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create recruitment' });
  }
});

// HR KPI指标
router.get('/kpi', (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const totalEmployees = employees.length;
    const activeEmployees = employees.filter(e => e.status === 'active').length;
    const avgPerformanceScore = employees.reduce((sum, e) => sum + e.performance_score, 0) / employees.length;
    const employeeRetentionRate = 92.5;
    const avgTenure = 3.2; // 年
    const trainingHoursPerEmployee = 40;
    const openPositions = recruitments.filter(r => r.status === 'open').length;
    const timeToHire = 28; // 天数

    res.json({
      total_employees: totalEmployees,
      active_employees: activeEmployees,
      avg_performance_score: Math.round(avgPerformanceScore * 10) / 10,
      employee_retention_rate: employeeRetentionRate,
      avg_tenure: avgTenure,
      training_hours_per_employee: trainingHoursPerEmployee,
      open_positions: openPositions,
      time_to_hire: timeToHire,
      employee_satisfaction: 4.3,
      absenteeism_rate: 2.1
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve HR KPI' });
  }
});

// 薪资统计
router.get('/salary-stats', (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const totalSalary = employees.reduce((sum, e) => sum + e.salary, 0);
    const avgSalary = totalSalary / employees.length;
    const salaryByDept = {
      'Executive': 15000,
      'Engineering': 21500,
      'Sales': 18000
    };

    res.json({
      total_payroll: totalSalary,
      avg_salary: Math.round(avgSalary),
      salary_by_department: salaryByDept,
      salary_range: {
        min: 15000,
        max: 25000,
        median: 18000
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve salary statistics' });
  }
});

export default router;
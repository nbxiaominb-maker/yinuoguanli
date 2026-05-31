# 开发文档

## 项目架构

### 前端架构

```
src/
├── components/          # 可复用组件
│   ├── Layout.tsx      # 主布局组件
│   └── Layout.css      # 布局样式
├── pages/              # 页面组件
│   ├── Login.tsx      # 登录页
│   ├── Dashboard.tsx  # 工作台
│   ├── Users.tsx      # 用户管理
│   ├── Departments.tsx # 部门管理
│   ├── Projects.tsx   # 项目管理
│   ├── Financial.tsx  # 财务管理
│   ├── Reports.tsx    # 报表分析
│   └── Settings.tsx   # 系统设置
├── stores/            # 状态管理
│   └── authStore.ts  # 认证状态
├── utils/             # 工具函数
│   ├── api.ts        # API客户端
│   └── logger.ts     # 日志系统
├── App.tsx           # 应用根组件
├── main.tsx          # 应用入口
└── index.css         # 全局样式
```

### 后端架构

```
src/
├── database/          # 数据库相关
│   └── init.ts       # 数据库初始化
├── middleware/        # 中间件
│   ├── auth.ts       # 认证中间件
│   └── validation.ts # 验证中间件
├── routes/          # API路由
│   ├── auth.ts      # 认证路由
│   ├── users.ts     # 用户路由
│   ├── departments.ts # 部门路由
│   ├── projects.ts  # 项目路由
│   └── financial.ts # 财务路由
├── utils/           # 工具函数
│   └── logger.ts    # 日志系统
└── index.ts         # 服务器入口
```

## 数据库设计

### 核心表结构

#### users (用户表)
- id: 主键
- username: 用户名（唯一）
- email: 邮箱（唯一）
- password_hash: 密码哈希
- first_name: 名
- last_name: 姓
- role: 角色（admin/manager/employee/viewer）
- department_id: 部门ID（外键）
- is_active: 是否激活
- created_at: 创建时间
- updated_at: 更新时间
- last_login: 最后登录时间

#### departments (部门表)
- id: 主键
- name: 部门名称
- code: 部门代码（唯一）
- description: 描述
- manager_id: 部门经理ID（外键）
- parent_department_id: 父部门ID（自关联外键）
- budget: 预算
- created_at: 创建时间
- updated_at: 更新时间

#### projects (项目表)
- id: 主键
- name: 项目名称
- code: 项目代码（唯一）
- description: 描述
- client_name: 客户名称
- start_date: 开始日期
- end_date: 结束日期
- budget: 预算
- actual_cost: 实际成本
- status: 状态（planning/active/on-hold/completed/cancelled）
- priority: 优先级（low/medium/high/urgent）
- progress: 进度（0-100）
- department_id: 部门ID（外键）
- manager_id: 项目经理ID（外键）
- created_at: 创建时间
- updated_at: 更新时间

#### financial_transactions (财务交易表)
- id: 主键
- transaction_type: 交易类型（income/expense）
- category: 分类
- amount: 金额
- description: 描述
- reference_number: 参考编号（唯一）
- project_id: 项目ID（外键）
- department_id: 部门ID（外键）
- transaction_date: 交易日期
- created_by: 创建人ID（外键）
- status: 状态（pending/completed/cancelled）
- attachment_path: 附件路径
- notes: 备注
- created_at: 创建时间
- updated_at: 更新时间

## API设计规范

### RESTful原则

1. **URL设计**
   - 使用名词复数：`/users`, `/departments`
   - 层级结构：`/projects/:id/members`

2. **HTTP方法**
   - GET: 获取资源
   - POST: 创建资源
   - PUT: 更新资源
   - DELETE: 删除资源

3. **状态码**
   - 200: 成功
   - 201: 创建成功
   - 400: 请求错误
   - 401: 未授权
   - 403: 权限不足
   - 404: 资源不存在
   - 500: 服务器错误

4. **响应格式**
   ```json
   {
     "data": {},
     "message": "success",
     "error": null
   }
   ```

### 错误处理

```typescript
// 统一错误响应
{
  "error": "错误信息",
  "details": [
    {
      "field": "字段名",
      "message": "错误详情"
    }
  ]
}
```

## 状态管理

### Zustand Store

```typescript
// authStore.ts
interface AuthState {
  token: string | null
  user: User | null
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  checkAuth: () => Promise<void>
}
```

## 组件设计模式

### 页面组件结构

```typescript
const PageName = () => {
  // 状态管理
  const [state, setState] = useState()

  // 副作用
  useEffect(() => {
    fetchData()
  }, [])

  // 事件处理
  const handleAction = () => {
    // 处理逻辑
  }

  // 渲染
  return (
    <div>
      {/* 组件内容 */}
    </div>
  )
}
```

## 日志系统

### 前端日志

```typescript
import { logInfo, logError, logAction } from '@/utils/logger'

// 信息日志
logInfo('页面加载完成')

// 错误日志
logError('操作失败', { error: err.message })

// 用户操作日志
logAction('点击按钮', { buttonId: 'submit' })
```

### 后端日志

```typescript
import { logger, logError, logInfo } from './utils/logger'

// 信息日志
logger.info('用户登录', { userId: user.id })

// 错误日志
logError(error, { context: '用户登录失败' })
```

## 开发工作流

### 1. 功能开发流程

1. **需求分析**
   - 明确功能需求
   - 设计数据模型
   - 规划API接口

2. **数据库设计**
   - 创建表结构
   - 定义关系
   - 添加索引

3. **后端开发**
   - 创建路由
   - 实现业务逻辑
   - 添加验证
   - 编写测试

4. **前端开发**
   - 创建页面组件
   - 实现UI界面
   - 集成API
   - 添加交互

5. **测试验证**
   - 功能测试
   - 集成测试
   - 性能测试

### 2. 代码规范

**命名规范**
- 组件：PascalCase `UserManagement`
- 函数：camelCase `getUserById`
- 常量：UPPER_SNAKE_CASE `API_BASE_URL`
- 类型：PascalCase `UserProfile`

**文件组织**
- 一个文件一个组件/函数
- 相关文件放在同一目录
- 使用index.ts导出

### 3. Git工作流

```bash
# 创建功能分支
git checkout -b feature/new-feature

# 提交更改
git add .
git commit -m "feat: 添加新功能"

# 推送分支
git push origin feature/new-feature

# 创建Pull Request
```

**提交信息规范**
- `feat:` 新功能
- `fix:` 修复bug
- `docs:` 文档更新
- `style:` 代码格式
- `refactor:` 重构
- `test:` 测试
- `chore:` 构建/工具

## 性能优化

### 前端优化

1. **代码分割**
   ```typescript
   const Dashboard = lazy(() => import('./pages/Dashboard'))
   ```

2. **组件优化**
   ```typescript
   const MemoizedComponent = memo(Component)
   ```

3. **请求优化**
   - 请求去重
   - 批量请求
   - 缓存策略

### 后端优化

1. **数据库优化**
   - 添加索引
   - 查询优化
   - 连接池

2. **API优化**
   - 分页查询
   - 数据压缩
   - 缓存机制

## 测试策略

### 单元测试

```typescript
describe('User Component', () => {
  it('should render user list', () => {
    render(<Users />)
    expect(screen.getByText('用户管理')).toBeInTheDocument()
  })
})
```

### 集成测试

```typescript
test('user login flow', async () => {
  render(<Login />)
  await userEvent.type(screen.getByLabelText('用户名'), 'admin')
  await userEvent.type(screen.getByLabelText('密码'), 'admin123')
  await userEvent.click(screen.getByText('登录'))
  expect(window.location.pathname).toBe('/')
})
```

## 部署检查清单

### 前置检查
- [ ] 环境变量配置正确
- [ ] 数据库迁移完成
- [ ] 依赖包安装完整
- [ ] 构建成功无错误
- [ ] 测试通过
- [ ] 日志系统正常

### 生产部署
- [ ] 代码压缩混淆
- [ ] 静态资源CDN
- [ ] HTTPS配置
- [ ] 备份策略
- [ ] 监控告警
- [ ] 日志收集

---

**开发团队**

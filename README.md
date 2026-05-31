# 企业管理系统 (Enterprise Management System)

一个功能完整的企业级管理系统，采用React + TypeScript + Ant Design前端，Node.js + Express后端，SQLite数据库。

## 功能特性

### 核心模块
- **用户管理** - 用户CRUD、角色权限管理
- **部门管理** - 组织架构管理、部门详情查看
- **项目管理** - 项目跟踪、成员管理、进度监控
- **财务管理** - 收支记录、财务报表、预算管理
- **报表分析** - 数据可视化、统计分析
- **系统设置** - 个人资料管理、密码修改

### 技术特性
- 🔐 JWT身份认证和授权
- 📊 完整的日志记录系统（前后端）
- 🎨 现代化UI界面（Ant Design）
- 📱 响应式设计
- 🔍 输入验证和错误处理
- 📈 数据可视化图表
- 🔄 RESTful API设计
- 💾 SQLite数据库存储

## 技术栈

### 前端
- React 18
- TypeScript
- Vite
- Ant Design 5
- React Router 6
- Zustand (状态管理)
- Recharts (图表)
- Axios (HTTP客户端)

### 后端
- Node.js
- Express
- TypeScript
- SQLite3
- JWT认证
- Winston日志系统
- Joi验证
- Bcrypt密码加密

## 项目结构

```
enterprise-management-system/
├── client/                 # React前端
│   ├── src/
│   │   ├── components/    # 组件
│   │   ├── pages/         # 页面
│   │   ├── stores/        # 状态管理
│   │   ├── utils/         # 工具函数
│   │   └── main.tsx       # 入口文件
│   ├── package.json
│   └── vite.config.ts
├── server/                # Node.js后端
│   ├── src/
│   │   ├── database/      # 数据库
│   │   ├── middleware/    # 中间件
│   │   ├── routes/        # 路由
│   │   ├── utils/         # 工具函数
│   │   └── index.ts       # 入口文件
│   ├── database/          # 数据库文件
│   ├── logs/             # 日志文件
│   └── package.json
├── shared/                # 共享类型定义
├── docs/                  # 文档
└── README.md
```

## 快速开始

### 前置要求
- Node.js >= 16
- npm >= 8
- Git

### 安装依赖

```bash
# 安装根目录依赖
npm install

# 或分别安装
cd client && npm install
cd ../server && npm install
```

### 初始化数据库

```bash
cd server
npm run db:init
```

### 启动开发服务器

```bash
# 启动前后端（推荐）
npm run dev

# 或分别启动
npm run server:dev  # 后端: http://localhost:5000
npm run client:dev  # 前端: http://localhost:3000
```

### 生产构建

```bash
npm run build
```

### 启动生产服务器

```bash
npm start
```

## 默认账户

系统初始化后会创建以下默认账户：

**管理员账户:**
- 用户名: `admin`
- 密码: `admin123`
- 角色: 管理员

**经理账户:**
- 用户名: `john.manager`
- 密码: `manager123`
- 角色: 经理

**员工账户:**
- 用户名: `dev1`
- 密码: `employee123`
- 角色: 员工

## API文档

### 认证接口
- `POST /auth/login` - 用户登录
- `POST /auth/register` - 用户注册
- `GET /auth/me` - 获取当前用户信息

### 用户管理
- `GET /users` - 获取用户列表
- `GET /users/:id` - 获取单个用户
- `PUT /users/:id` - 更新用户信息
- `DELETE /users/:id` - 删除用户
- `POST /users/:id/change-password` - 修改密码

### 部门管理
- `GET /departments` - 获取部门列表
- `GET /departments/:id` - 获取部门详情
- `POST /departments` - 创建部门
- `PUT /departments/:id` - 更新部门
- `DELETE /departments/:id` - 删除部门

### 项目管理
- `GET /projects` - 获取项目列表
- `GET /projects/:id` - 获取项目详情
- `POST /projects` - 创建项目
- `PUT /projects/:id` - 更新项目
- `DELETE /projects/:id` - 删除项目
- `POST /projects/:id/members` - 添加项目成员
- `DELETE /projects/:id/members/:employeeId` - 移除项目成员

### 财务管理
- `GET /financial` - 获取交易列表
- `GET /financial/summary` - 获取财务汇总
- `GET /financial/:id` - 获取交易详情
- `POST /financial` - 创建交易
- `PUT /financial/:id` - 更新交易
- `DELETE /financial/:id` - 删除交易

## 环境变量

### 服务端 (.env)
```
NODE_ENV=development
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
DB_PATH=./data/enterprise.db
LOG_LEVEL=info
FRONTEND_URL=http://localhost:3000
```

### 客户端 (.env)
```
VITE_API_URL=http://localhost:5000
```

## 日志系统

### 前端日志
- 自动捕获未处理的错误和Promise拒绝
- 记录用户操作和API调用
- 开发环境输出到控制台
- 生产环境发送到服务器

### 后端日志
- 按日期轮转的日志文件
- 分级日志（ERROR、WARN、INFO、DEBUG）
- HTTP请求日志
- 错误堆栈跟踪

日志文件位置:
- `server/logs/application-YYYY-MM-DD.log`
- `server/logs/error-YYYY-MM-DD.log`

## 开发指南

### 添加新功能模块

1. **数据库设计**
   - 在 `server/database/schema.sql` 添加表结构
   - 运行 `npm run db:init` 重新初始化数据库

2. **后端API**
   - 在 `server/routes/` 创建路由文件
   - 在 `server/index.ts` 注册路由

3. **前端界面**
   - 在 `client/src/pages/` 创建页面组件
   - 在 `client/src/components/Layout.tsx` 添加菜单项
   - 在 `client/src/App.tsx` 添加路由

### 代码规范

- 使用TypeScript类型定义
- 遵循ESLint规则
- 组件使用函数式组件和Hooks
- API调用使用async/await
- 错误处理使用try-catch

## 部署指南

### Docker部署（推荐）

```bash
# 构建镜像
docker build -t enterprise-management-system .

# 运行容器
docker run -p 3000:3000 -p 5000:5000 enterprise-management-system
```

### 手动部署

1. 构建前端和后端
2. 设置环境变量
3. 启动服务器: `npm start`
4. 配置反向代理（Nginx/Apache）

## 测试

```bash
# 运行所有测试
npm test

# 运行前端测试
npm run client:test

# 运行后端测试
npm run server:test
```

## 故障排除

### 常见问题

**数据库连接失败**
- 检查数据库文件是否存在
- 确认数据库路径配置正确

**前端无法连接后端**
- 确认后端服务器正在运行
- 检查CORS配置
- 验证API URL设置

**登录失败**
- 确认用户名和密码正确
- 检查JWT密钥配置
- 查看后端日志错误信息

## 贡献指南

1. Fork项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建Pull Request

## 许可证

MIT License

## 联系方式

- 项目地址: https://github.com/your-org/enterprise-management-system
- 问题反馈: https://github.com/your-org/enterprise-management-system/issues

## 更新日志

### v1.0.0 (2024)
- ✨ 初始版本发布
- 🎉 完成所有核心功能模块
- 📊 实现数据可视化
- 🔒 完善权限管理
- 📝 完整日志系统

---

**Enterprise Development Team** © 2024

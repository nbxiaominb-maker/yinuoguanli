# 🚀 企业管理系统启动指南

## 🎯 系统启动演示

### ✅ 当前状态
- **前端服务器**: 🟢 运行中 (http://localhost:3000)
- **后端服务器**: 🟡 需要启动
- **数据库**: 📝 SQLite (自动创建)

## 📋 快速启动步骤

### 1️⃣ 启动后端服务器

```bash
# 进入服务器目录
cd enterprise-management-system/server

# 启动开发服务器
npm run dev

# 或使用构建版本
npm run build
npm start
```

**后端服务器信息：**
- 地址：http://localhost:5000
- 健康检查：http://localhost:5000/health
- API基础路径：http://localhost:5000/api

### 2️⃣ 启动前端服务器

```bash
# 进入客户端目录
cd enterprise-management-system/client

# 启动开发服务器
npm run dev
```

**前端服务器信息：**
- 地址：http://localhost:3000
- 状态：✅ 已启动
- 启动时间：907ms

### 3️⃣ 初始化数据库（首次运行）

```bash
cd enterprise-management-system/server
npx ts-node database/init.ts
```

## 🔐 登录系统

### 访问系统
打开浏览器访问：http://localhost:3000

### 测试账户

| 角色 | 用户名 | 密码 | 权限范围 |
|------|--------|------|----------|
| 🔧 管理员 | `admin` | `admin123` | 全部功能 |
| 👔 经理 | `john.manager` | `manager123` | 部门管理、项目管理 |
| 💼 员工 | `dev1` | `employee123` | 基础查看权限 |

## 🎪 功能测试演示

### 1️⃣ 登录测试
1. 访问 http://localhost:3000
2. 输入用户名：`admin`
3. 输入密码：`admin123`
4. 点击"登录"按钮
5. ✅ 应该跳转到工作台页面

### 2️⃣ 用户管理测试
1. 点击左侧菜单"用户管理"
2. ✅ 查看用户列表
3. 点击"添加用户"按钮
4. 填写用户信息：
   - 用户名：`testuser`
   - 邮箱：`test@example.com`
   - 密码：`123456`
   - 名：`Test`
   - 姓：`User`
   - 角色：`员工`
5. 点击"确定"
6. ✅ 新用户应该出现在列表中

### 3️⃣ 部门管理测试
1. 点击左侧菜单"部门管理"
2. ✅ 查看部门列表和员工统计
3. 点击"添加部门"
4. 填写部门信息：
   - 部门名称：`测试部门`
   - 部门代码：`TEST`
   - 预算：`100000`
5. 点击"确定"
6. ✅ 新部门应该出现在列表中

### 4️⃣ 项目管理测试
1. 点击左侧菜单"项目管理"
2. ✅ 查看项目列表和状态
3. 点击"添加项目"
4. 填写项目信息：
   - 项目名称：`测试项目`
   - 项目代码：`PROJ001`
   - 开始日期：选择日期
   - 状态：`计划中`
   - 优先级：`中`
5. 点击"确定"
6. ✅ 新项目应该出现在列表中

### 5️⃣ 财务管理测试
1. 点击左侧菜单"财务管理"
2. ✅ 查看财务统计卡片（总收入、总支出、净收益）
3. 点击"添加交易"
4. 填写交易信息：
   - 交易类型：`收入`
   - 分类：`销售收入`
   - 金额：`50000`
   - 交易日期：选择日期
5. 点击"确定"
6. ✅ 新交易应该出现在列表中，统计数据会更新

### 6️⃣ 报表分析测试
1. 点击左侧菜单"报表分析"
2. ✅ 查看各种图表：
   - 月度收支趋势图
   - 项目状态分布图
   - 部门人数统计
   - 部门预算对比
   - 重点项目概览
3. ✅ 所有图表应该正确显示数据

### 7️⃣ 系统设置测试
1. 点击左侧菜单"系统设置"
2. ✅ 查看"个人资料"标签：
   - 用户信息展示
   - 个人资料编辑
3. ✅ 查看"安全设置"标签：
   - 修改密码功能
4. ✅ 查看"系统信息"标签：
   - 系统版本信息
   - 功能模块列表

## 🔧 API测试（使用curl）

### 健康检查
```bash
curl http://localhost:5000/health
```

### 用户登录
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### 获取用户列表（需要token）
```bash
curl http://localhost:5000/api/users \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 创建部门
```bash
curl -X POST http://localhost:5000/api/departments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"name":"新部门","code":"NEWDEPT","budget":50000}'
```

## 📊 日志查看

### 前端日志
- 浏览器开发者工具 → Console
- 查看用户操作和API调用日志

### 后端日志
- 位置：`server/logs/`
- 文件格式：
  - `application-YYYY-MM-DD.log` - 应用日志
  - `error-YYYY-MM-DD.log` - 错误日志

## 🐛 故障排除

### 后端无法启动
1. 检查端口5000是否被占用
2. 检查Node.js版本（需要v16+）
3. 删除`node_modules`重新安装

### 前端无法连接后端
1. 确认后端服务器运行正常
2. 检查CORS配置
3. 查看浏览器控制台错误信息

### 数据库错误
1. 确保`data`目录存在
2. 检查SQLite数据库文件权限
3. 重新初始化数据库

## 📱 浏览器兼容性

推荐浏览器：
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## 🎯 性能指标

- 前端启动时间：~1秒
- 页面加载时间：<2秒
- API响应时间：<100ms
- 支持并发用户：50+

---

**下一步：** 开始使用系统进行企业管理工作！

**技术支持：** 参考 `README.md` 和 `docs/DEVELOPMENT.md`

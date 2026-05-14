# 旅行攻略网站发展计划

## 一、当前已实现功能

- [x] AI 生成旅行攻略（行程规划、景点推荐、餐饮建议）
- [x] AI 生成行李清单
- [x] 设备 UUID 标识
- [x] 后台管理系统（登录、记录查看、搜索、删除）
- [x] 数据持久化（Supabase）
- [x] 规划上报功能
- [x] 用户注册/登录系统
- [x] 每日生成次数限制（免费用户 3 次/天）
- [x] 会员状态展示
- [x] 历史记录与用户关联
- [x] 会员等级体系（免费/月度/年度）
- [x] 订单管理系统
- [x] 模拟支付（可替换为真实支付）
- [x] 会员购买页面

---

## 二、待实现功能

### Phase 1: 用户系统 ✅ 已完成

- [x] 用户注册/登录系统
- [x] 用户表数据结构
- [x] 每日生成次数限制（免费用户 3 次/天）
- [x] 会员状态展示
- [x] 历史记录与用户关联

### Phase 2: 会员与支付系统 ✅ 已完成

- [x] 会员等级体系（免费/月度/年度）
- [x] 订单表数据结构
- [x] 会员权益配置
- [ ] 微信支付对接（已有代码框架）
- [ ] 支付宝支付对接（已有代码框架）
- [x] 模拟支付（开发测试用）
- [x] 订单管理后台

### Phase 3: 功能增强（优先级：中）

- [ ] 导出 PDF 功能
- [ ] 导出图片功能
- [ ] 分享功能（生成分享链接）
- [ ] 收藏攻略功能
- [ ] 地图集成（景点位置可视化）
- [ ] 实时天气查询

### Phase 4: 商业化变现（优先级：中）

- [ ] 携程联盟对接（酒店/机票佣金）
- [ ] 景点门票推荐（佣金链接）
- [ ] 收益统计后台

### Phase 5: 体验优化（优先级：低）

- [ ] PWA 离线支持
- [ ] 多语言支持
- [ ] 行程拖拽调整
- [ ] 费用估算器
- [ ] 埋点分析

---

## 三、会员体系设计

### 会员等级与权益

| 等级 | 价格 | 每日生成 | 导出 | 云同步 | 专属客服 |
|------|------|----------|------|--------|----------|
| 免费用户 | ¥0 | 3 次 | ❌ | ❌ | ❌ |
| 月度会员 | ¥19/月 | 无限 | ✅ | ✅ | ❌ |
| 年度会员 | ¥168/年 | 无限 | ✅ | ✅ | ✅ |

### 数据库表设计

```sql
-- 用户表
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  nickname TEXT,
  avatar_url TEXT,
  membership_type TEXT DEFAULT 'free',
  membership_expire_at TIMESTAMPTZ,
  daily_generate_count INTEGER DEFAULT 0,
  last_generate_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 订单表
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  order_no TEXT UNIQUE NOT NULL,
  product_type TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending',
  payment_method TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 会员权益配置
CREATE TABLE membership_benefits (
  id SERIAL PRIMARY KEY,
  type TEXT NOT NULL,
  daily_limit INTEGER DEFAULT 3,
  can_export BOOLEAN DEFAULT FALSE,
  can_sync BOOLEAN DEFAULT FALSE,
  has_priority_support BOOLEAN DEFAULT FALSE
);
```

---

## 四、API 接口规划

### 用户认证
- `POST /api/auth/register` - 注册
- `POST /api/auth/login` - 登录
- `POST /api/auth/logout` - 登出
- `GET /api/auth/me` - 获取当前用户

### 用户管理
- `GET /api/user/profile` - 获取用户信息
- `PUT /api/user/profile` - 更新用户信息
- `GET /api/user/membership` - 获取会员状态

### 订单管理
- `POST /api/order/create` - 创建订单
- `POST /api/order/pay` - 发起支付
- `GET /api/order/status/:id` - 查询订单状态
- `GET /api/order/list` - 用户订单列表

### 支付回调
- `POST /api/pay/wechat/notify` - 微信支付回调
- `POST /api/pay/alipay/notify` - 支付宝支付回调

---

## 五、预估收益

### 假设条件
- 日活用户：1000 人
- 付费转化率：5%
- 月度会员占比：60%
- 年度会员占比：40%

### 月收益计算
```
付费用户 = 1000 × 5% = 50 人
月度收入 = 50 × 60% × ¥19 = ¥570
年度摊销 = 50 × 40% × ¥168 ÷ 12 = ¥280
会员月收入 ≈ ¥850
佣金收入 ≈ ¥125
月总收益 ≈ ¥975
```

---

## 六、技术栈

- 前端：Next.js 16 + React 19 + TypeScript
- UI：shadcn/ui + Tailwind CSS
- 数据库：Supabase PostgreSQL
- 支付：微信支付 + 支付宝
- AI：豆包大模型 (doubao-seed-2-0-lite)

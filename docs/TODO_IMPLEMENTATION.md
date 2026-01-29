# Agent OTP - 待实现功能清单

> 生成日期：2026-01-29
> 状态：v0.1.0 发布后审计

---

## 概览

| 组件 | 状态 | 严重程度 | 说明 |
|------|------|----------|------|
| **Core SDK** | ✅ 完成 | - | 完全实现 |
| **API Routes** | ✅ 基本完成 | 低 | MVP 级别认证，需生产环境加固 |
| **Website 页面** | ⚠️ 部分完成 | 高 | 18+ 文档页面缺失 |
| **表单功能** | ❌ 仅 UI | 高 | 联系表单和订阅表单无后端 |
| **Dashboard 应用** | ❌ 缺失 | 严重 | 整个 `/apps/dashboard` 不存在 |
| **文档导航** | ❌ 断链 | 高 | 侧边栏 19 个死链接 |
| **认证系统** | ⚠️ MVP | 中 | X-User-ID header 认证，非生产级别 |

---

## 一、网站 (apps/website)

### 1.1 缺失的页面（点击会 404）

| 路径 | 类型 | 引用位置 |
|------|------|----------|
| `/signup` | 注册页面 | header.tsx, page.tsx |
| `/login` | 登录页面 | header.tsx |
| `/docs/installation` | 文档 | docs/layout.tsx |
| `/docs/configuration` | 文档 | docs/layout.tsx |
| `/docs/concepts/tokens` | 文档 | docs/layout.tsx, permissions/page.tsx |
| `/docs/concepts/scopes` | 文档 | docs/layout.tsx, permissions/page.tsx |
| `/docs/sdk/python` | 文档 | docs/layout.tsx |
| `/docs/sdk/errors` | 文档 | docs/layout.tsx, typescript/page.tsx |
| `/docs/api/authentication` | 文档 | docs/layout.tsx |
| `/docs/api/permissions` | 文档 | docs/layout.tsx |
| `/docs/api/policies` | 文档 | docs/layout.tsx, policies/page.tsx |
| `/docs/api/agents` | 文档 | docs/layout.tsx |
| `/docs/api/audit` | 文档 | docs/layout.tsx |
| `/docs/integrations/langchain` | 文档 | docs/layout.tsx |
| `/docs/integrations/crewai` | 文档 | docs/layout.tsx |
| `/docs/integrations/autogen` | 文档 | docs/layout.tsx |
| `/docs/integrations/custom` | 文档 | docs/layout.tsx |
| `/docs/guides/policies` | 文档 | docs/layout.tsx, policies/page.tsx |
| `/docs/guides/telegram` | 文档 | docs/layout.tsx, quickstart/page.tsx |
| `/docs/guides/self-hosting` | 文档 | docs/layout.tsx |
| `/docs/guides/security` | 文档 | docs/layout.tsx |

### 1.2 未实现的表单功能

#### 联系表单 - `apps/website/src/app/contact/page.tsx`
- **位置**：Lines 31-104
- **问题**：表单 UI 完整，但无 `onSubmit` 处理或 API 端点
- **需要**：
  - [ ] 创建 API 端点处理表单提交
  - [ ] 添加表单验证
  - [ ] 集成邮件发送服务（如 Resend, SendGrid）

#### 订阅表单 - `apps/website/src/app/blog/page.tsx`
- **位置**：Lines 104-123
- **问题**：邮件订阅表单无后端
- **需要**：
  - [ ] 创建订阅 API 端点
  - [ ] 集成邮件列表服务（如 ConvertKit, Mailchimp）

### 1.3 占位符内容

| 文件 | 位置 | 问题 |
|------|------|------|
| `contact/page.tsx` | Line 146 | GitHub URL 仍为 `yourusername` |
| `docs/layout.tsx` | Lines 118-120 | TOC 注释占位，未实现动态目录 |

---

## 二、API 服务 (apps/api)

### 2.1 认证系统 - MVP 级别

**文件**：`apps/api/src/routes/agents.ts` (Lines 23-37)

```typescript
// 当前实现 - 仅用于 MVP
function getUserId(c): string {
  const userId = c.req.header('X-User-ID');
  // ...
}
```

**需要生产环境实现**：
- [ ] JWT token 验证
- [ ] Session 管理
- [ ] OAuth 集成（Google, GitHub）
- [ ] API Key 认证完善
- [ ] Rate limiting 按用户

### 2.2 通知服务 - 部分实现

**文件**：`apps/api/src/services/notification-service.ts`
- [ ] Telegram Bot 集成
- [ ] Email 通知
- [ ] Webhook 回调

---

## 三、缺失的应用

### 3.1 Dashboard 应用 - 完全缺失

**引用位置**：
- `docs/RELEASE_GUIDE.md` Lines 216-238
- `package.json` 中曾有 `dev:dashboard` 脚本

**需要实现的功能**：
- [ ] 用户注册/登录界面
- [ ] Agent 管理界面
- [ ] Policy 配置界面
- [ ] 权限请求审批队列
- [ ] 审计日志查看
- [ ] API Key 管理
- [ ] 账户设置

### 3.2 Telegram Bot - 未实现

**设计文档**：`docs/RELEASE_GUIDE.md` 中有设计
**需要实现**：
- [ ] Bot 注册和配置
- [ ] 权限请求通知
- [ ] 审批按钮交互
- [ ] 用户账号关联

---

## 四、文档问题

### 4.1 占位符文本

| 文件 | 位置 | 内容 |
|------|------|------|
| `docs/RELEASE_GUIDE.md` | Line 510 | `[Your Name]` 占位符 |

### 4.2 无效引用

`docs/RELEASE_GUIDE.md` 中引用不存在的：
- `apps/dashboard` 目录
- Dashboard 部署步骤（Line 216-238）

---

## 五、优先级排序

### P0 - 阻塞性问题（发布前必须修复）

- [ ] 修复 `contact/page.tsx` 中的 GitHub URL
- [ ] 移除或禁用无后端的表单提交按钮
- [ ] 更新 RELEASE_GUIDE.md 移除 dashboard 引用

### P1 - 高优先级（1-2 周内）

- [ ] 实现 `/signup` 和 `/login` 页面
- [ ] 实现用户认证系统（Supabase Auth）
- [ ] 创建缺失的核心文档页面：
  - `/docs/installation`
  - `/docs/configuration`
  - `/docs/concepts/tokens`
  - `/docs/concepts/scopes`
  - `/docs/api/authentication`
  - `/docs/api/permissions`

### P2 - 中优先级（1 个月内）

- [ ] 实现联系表单后端
- [ ] 实现订阅表单后端
- [ ] 完成 API 文档页面
- [ ] 添加集成指南（LangChain, CrewAI）
- [ ] 实现 Dashboard 基础版

### P3 - 低优先级（后续迭代）

- [ ] Python SDK 及文档
- [ ] Telegram Bot 集成
- [ ] 自托管指南
- [ ] 安全最佳实践指南
- [ ] 高级 Policy 指南

---

## 六、快速修复清单

以下是可以快速修复的小问题：

```bash
# 1. 修复 contact 页面的 GitHub URL
# File: apps/website/src/app/contact/page.tsx, Line 146
# 将 "yourusername" 改为 "orrisai"

# 2. 更新 RELEASE_GUIDE.md 的 Technical Lead
# File: docs/RELEASE_GUIDE.md, Line 510
# 将 "[Your Name]" 改为实际姓名

# 3. 禁用无后端的表单按钮（临时方案）
# 添加 disabled 属性或显示 "Coming Soon"
```

---

## 更新记录

| 日期 | 更新内容 |
|------|----------|
| 2026-01-29 | 初始审计，v0.1.0 发布后 |

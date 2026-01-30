# Agent OTP

[![npm version](https://badge.fury.io/js/%40orrisai%2Fagent-otp-sdk.svg)](https://www.npmjs.com/package/@orrisai/agent-otp-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)

**[English](./README.md) | [中文](./README.zh-CN.md)**

为 AI Agent 提供安全的 OTP 中继服务。通过端到端加密、用户审批和自动删除机制，帮助你的 AI Agent 安全地接收验证码（短信/邮件 OTP）。

## 问题背景

AI Agent 经常需要验证码来完成任务，比如帮用户注册服务或登录账号。传统方案存在安全风险：

| 方案 | 风险 |
|-----|------|
| 给 Agent 完整邮箱访问权限 | Agent 可读取所有邮件（银行、医疗、个人隐私等） |
| 给 Agent 短信转发权限 | Agent 可拦截所有短信（2FA、验证码等） |
| 用户手动复制粘贴 | 破坏自动化体验，造成用户疲劳 |

## 解决方案

Agent OTP 提供**安全的验证码中继**：

- **端到端加密**：OTP 使用 Agent 的公钥加密，只有 Agent 能解密
- **用户审批**：你控制哪些 OTP 可以被 Agent 访问
- **一次性读取**：OTP 消费后自动删除
- **多来源捕获**：短信（Android App）、邮件（Gmail/IMAP）
- **最小暴露**：Agent 只能获取特定发件人的特定 OTP，而不是全部消息

## 工作流程

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              用户环境                                    │
│  ┌──────────────┐                              ┌──────────────────────┐ │
│  │   Android    │  捕获短信 OTP                 │   邮箱 (Gmail)       │ │
│  │   手机 App   │ ─────────────┐               │   Email Integration  │ │
│  └──────────────┘              │               └──────────┬───────────┘ │
│                                │                          │             │
│                                ▼                          ▼             │
│                    ┌─────────────────────────────────────────┐          │
│                    │        Agent OTP Service                │          │
│                    │  (存储加密后的 OTP，用户审批)            │          │
│                    └─────────────────┬───────────────────────┘          │
│                                      │                                  │
│                                      │ 用户通过 Telegram/Dashboard 审批 │
│                                      │                                  │
└──────────────────────────────────────┼──────────────────────────────────┘
                                       │
                                       │ 加密的 OTP
                                       ▼
                             ┌──────────────────┐
                             │    AI Agent      │
                             │  (使用私钥解密)   │
                             └──────────────────┘
```

### 详细步骤

#### 1. Agent 生成密钥对

Agent 生成 RSA 密钥对，私钥自己保管，公钥发给 Agent OTP 服务：

```typescript
import { generateKeyPair, exportPublicKey } from '@orrisai/agent-otp-sdk';

// 生成密钥对（每个 Agent 会话只需一次）
const { publicKey, privateKey } = await generateKeyPair();

// 私钥存储在 Agent 本地，永远不发送出去
```

#### 2. Agent 请求 OTP

当 Agent 需要验证码时（比如帮用户注册某个服务）：

```typescript
const client = new AgentOTPClient({ apiKey: 'ak_xxx' });

const request = await client.requestOTP({
  reason: '帮你注册 Acme 网站账号',      // 告诉用户为什么需要
  expectedSender: 'Acme',               // 预期发送方
  filter: {
    sources: ['email'],                 // 只要邮件 OTP
    senderPattern: '*@acme.com',        // 只接受来自 acme.com 的
  },
  publicKey: await exportPublicKey(publicKey),
  waitForOTP: true,
  timeout: 120000,
});
```

#### 3. 用户收到审批请求

用户通过 Telegram Bot 或 Dashboard 收到通知：

```
🔔 Agent 请求 OTP 访问

原因: 帮你注册 Acme 网站账号
期望发送方: Acme
来源: 邮件

[✅ 批准]  [❌ 拒绝]
```

#### 4. 系统等待 OTP

用户批准后，Agent OTP 服务开始监听：

- **短信**：Android App 监听短信，匹配 `senderPattern`
- **邮件**：Email 集成监听邮箱，匹配发件人

#### 5. OTP 到达并加密

当 Acme 发送验证码邮件后：

```
From: noreply@acme.com
Subject: Your verification code
Body: Your code is 847291
```

Agent OTP 服务：
1. 捕获这封邮件
2. 提取验证码 `847291`
3. **用 Agent 的公钥加密**（只有 Agent 能解密）
4. 存储加密后的数据

#### 6. Agent 消费 OTP

```typescript
if (request.status === 'otp_received') {
  // 用私钥解密获取验证码
  const { code } = await client.consumeOTP(request.id, privateKey);

  console.log('验证码:', code);  // 847291

  // 使用验证码完成注册
  await completeRegistration(code);
}
```

#### 7. OTP 自动删除

消费后，OTP 立即从服务器删除，无法再次读取。

## 安全设计

| 安全特性 | 实现方式 |
|---------|---------|
| **端到端加密** | OTP 用 Agent 公钥加密，只有持有私钥的 Agent 能解密 |
| **服务端不可读** | Agent OTP 服务存储的是加密数据，无法读取明文验证码 |
| **用户审批** | 每次 OTP 请求都需要用户明确批准 |
| **一次性读取** | 消费后立即删除，无法重放 |
| **最小暴露** | Agent 只能获取特定发件人的特定 OTP，不是全部短信/邮件 |

## 实现状态

> 最后更新: 2025-01-30

| 组件 | 状态 | 说明 |
|-----|------|------|
| **TypeScript SDK** | ✅ 已完成 | `requestOTP()`, `consumeOTP()`, 加密工具等 |
| **Shared 包** | ✅ 已完成 | 类型定义、常量、Zod schemas |
| **API 服务** | ⚠️ 部分完成 | 路由结构存在，部分端点是占位符 |
| **文档网站** | ✅ 已完成 | 35 个页面，完整文档 |
| **Telegram Bot** | ❌ 未开始 | 用户审批通知 |
| **Android App (React Native)** | ❌ 未开始 | 短信 OTP 捕获 |
| **Email 集成** | ❌ 未开始 | Gmail/IMAP OTP 捕获 |
| **Web Dashboard** | ❌ 未开始 | Web 端审批和管理 |

### 当前已实现

```
┌──────────────────────────────────────────────────────────────┐
│  AI Agent  ←──→  SDK  ←──→  API 服务  ←──→  数据库/Redis    │
└──────────────────────────────────────────────────────────────┘
```

### 待开发

```
┌──────────────────────────────────────────────────────────────┐
│  Android App (短信捕获)                                       │
│  Email 集成 (邮件捕获)                                        │
│  Telegram Bot / Dashboard (用户审批)                          │
└──────────────────────────────────────────────────────────────┘
```

## 快速开始

### 1. 安装 SDK

```bash
npm install @orrisai/agent-otp-sdk
# 或
bun add @orrisai/agent-otp-sdk
```

### 2. 获取 API Key

运行自托管实例并创建 API key：

```bash
docker compose exec api bun run cli agent:create --name "my-assistant"
```

### 3. 请求 OTP

```typescript
import {
  AgentOTPClient,
  generateKeyPair,
  exportPublicKey,
} from '@orrisai/agent-otp-sdk';

const client = new AgentOTPClient({
  apiKey: process.env.AGENT_OTP_API_KEY,
});

// 生成加密密钥
const { publicKey, privateKey } = await generateKeyPair();

// 请求 OTP
const request = await client.requestOTP({
  reason: 'Acme 网站注册验证',
  expectedSender: 'Acme',
  filter: {
    sources: ['email'],
    senderPattern: '*@acme.com',
  },
  publicKey: await exportPublicKey(publicKey),
  waitForOTP: true,
  timeout: 120000,
});

// 消费 OTP
if (request.status === 'otp_received') {
  const { code } = await client.consumeOTP(request.id, privateKey);
  console.log('收到验证码:', code);
}
```

## OTP 请求状态

| 状态 | 说明 |
|------|------|
| `pending_approval` | 等待用户批准 |
| `approved` | 用户已批准，等待 OTP 到达 |
| `otp_received` | OTP 已捕获，可以消费 |
| `consumed` | OTP 已读取并删除 |
| `denied` | 用户拒绝了请求 |
| `expired` | 请求在完成前过期 |
| `cancelled` | 请求被取消 |

## 项目结构

```
agent-otp/
├── apps/
│   ├── api/              # 主 API 服务 (Hono + Cloudflare Workers)
│   ├── website/          # 文档网站 (Next.js)
│   ├── dashboard/        # Web Dashboard (Next.js) - 待开发
│   ├── telegram-bot/     # Telegram 审批机器人 - 待开发
│   └── mobile/           # React Native 短信 App - 待开发
├── packages/
│   ├── sdk/              # TypeScript SDK
│   └── shared/           # 共享类型和工具
├── docs/                 # 内部文档
└── docker-compose.yml    # 本地开发配置
```

## 文档

完整文档请访问 [agentotp.com/docs](https://agentotp.com/docs)。

- [快速开始](https://agentotp.com/docs/quickstart)
- [SDK 参考](https://agentotp.com/docs/sdk/typescript)
- [工作原理](https://agentotp.com/docs/concepts/how-it-works)
- [端到端加密](https://agentotp.com/docs/concepts/encryption)
- [OTP 来源](https://agentotp.com/docs/concepts/sources)

## 本地开发

### 前置要求

- [Bun](https://bun.sh/) >= 1.1.0
- [Docker](https://www.docker.com/) 和 Docker Compose

### 设置

```bash
git clone https://github.com/orristech/agent-otp.git
cd agent-otp
bun install
docker compose up -d
cp .env.example .env
bun dev
```

API 将在 `http://localhost:8787` 可用。

### 运行测试

```bash
bun test              # 运行所有测试
bun test --run        # 单次运行（无 watch）
bun test:coverage     # 带覆盖率
```

## SDK API 参考

### 客户端方法

```typescript
requestOTP(options: RequestOTPOptions): Promise<OTPRequestResult>
getOTPStatus(requestId: string): Promise<OTPStatus>
consumeOTP(requestId: string, privateKey: CryptoKey): Promise<OTPConsumeResult>
cancelOTPRequest(requestId: string): Promise<void>
```

### 加密工具

```typescript
generateKeyPair(): Promise<CryptoKeyPair>
exportPublicKey(key: CryptoKey): Promise<string>
importPrivateKey(keyData: string): Promise<CryptoKey>
decryptOTPPayload(encrypted: string, privateKey: CryptoKey): Promise<string>
```

## 贡献

欢迎贡献！请阅读 [贡献指南](CONTRIBUTING.md) 了解详情。

## 许可证

MIT License - 详见 [LICENSE](LICENSE)。

## 支持

- [文档](https://agentotp.com/docs)
- [GitHub Issues](https://github.com/orristech/agent-otp/issues)
- [邮件支持](mailto:support@agentotp.com)

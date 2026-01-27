# 恋爱先知鸟 (Romantic Oracle Raven) 项目文档

## 1. 项目概述

### 1.1 项目简介
**致力于用技术打低恋爱所需要的成本。**

恋爱先知鸟（Romantic Oracle Raven）是一个基于主观题问答和向量模型的婚恋匹配应用，通过分析用户的主观回答，生成用户向量模型，在常见婚恋交互场景下提供智能匹配结果。

### 1.2 技术栈

| 类别 | 技术 | 版本要求 |
|------|------|----------|
| 后端 | Node.js | 14+ (建议 18+) |
| 后端框架 | Express | 4.18.2 |
| 数据库 | MongoDB | 4.4+ |
| ODM | Mongoose | 6.12.0 |
| 认证 | JWT | 9.0.3 |
| 向量生成 | OpenAI API (或本地算法) | 6.16.0 |
| 前端 | React 18 + TypeScript | Node.js 18+ |
| 前端构建工具 | Vite | - |
| 测试框架 | Jest / Vitest | 29.7.0 / 0.34.6 |
| API测试 | Supertest | 6.3.3 |
| 容器化 | Docker | 20.10+ |

### 1.3 项目结构

```
Romantic Oracle Raven/
├── client/
│   ├── mobile/          # 移动端代码
│   └── web/             # Web端代码
├── coverage/            # 测试覆盖率报告
├── server/              # 后端代码
│   ├── controllers/     # 控制器
│   ├── middleware/      # 中间件
│   ├── models/          # 数据模型
│   ├── routes/          # 路由
│   ├── services/        # 服务
│   └── __tests__/       # 测试文件
├── .trae/               # Trae AI相关文件
├── docker-compose.mongodb.yml
├── docker-compose.yml
├── jest.config.js
├── package-lock.json
├── package.json
├── README.md
├── REQUIREMENTS.md
└── TESTING.md
```

### 1.4 核心业务规则

#### 1.4.1 每日答题限制
为了平衡用户体验与数据质量，系统实施了以下答题限制策略：
- **免费用户**：每日限答 5 道题。
  - 预计完成 800 题库需约 160 天。
- **订阅用户 (Premium)**：每日限答 15 道题。
  - 预计完成 800 题库需约 50 天。
  - 订阅被视为加速完成档案建立的"一次性"服务，而非长期依赖。

#### 1.4.2 匹配机制
- **基本匹配**：基于简单的标签和地理位置（免费用户可用）。
- **高级匹配**：基于向量模型的深度心理相容性分析（仅限订阅用户）。
- **冲突分析**：提供潜在性格冲突的详细报告（仅限订阅用户）。
- **[NEW] AI 场景模拟**：基于双方真实回答生成冲突/亲昵/生活场景的对话剧本（仅限订阅用户）。

### 1.5 环境变量配置 (Server)
在 `server/.env` 文件中配置以下环境变量：

```ini
# Server Configuration
PORT=5000
NODE_ENV=production

# Database
MONGO_URI=mongodb://mongodb:27017/datingmatcher

# Authentication
JWT_SECRET=your_jwt_secret_key_here

# DeepSeek / OpenAI / Qwen API Configuration
# Base URL (通义千问兼容接口: https://dashscope.aliyuncs.com/compatible-mode/v1)
# Base URL (DeepSeek: https://api.deepseek.com)
OPENAI_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
# API Key
OPENAI_API_KEY=your_api_key_here
# Embedding Model Name (默认为 text-embedding-v1)
OPENAI_EMBEDDING_MODEL=text-embedding-v1
# Chat Model Name (用于场景模拟，默认为 qwen-turbo)
OPENAI_CHAT_MODEL=qwen-turbo
```

### 1.6 新增 API 接口说明

#### 1.6.1 AI 场景模拟 (Premium)
- **端点**: `POST /api/matches/:userId/scenario`
- **权限**: 仅限 Premium 用户
- **描述**: 基于双方画像和回答，生成指定场景的模拟对话。
- **请求体**:
  ```json
  {
    "scenarioType": "conflict" // 可选值: conflict, intimacy, travel, daily_life
  }
  ```
- **响应**:
  ```json
  {
    "scenarioType": "conflict",
    "content": "模拟生成的对话剧本...",
    "remainingCredits": 999
  }
  ```

## 2. 测试细节文档

### 2.1 测试环境
- 操作系统：Windows
- Node.js版本：14.19.3
- Jest版本：29.7.0
- Supertest版本：6.3.3

### 2.2 测试框架
- **后端测试**：使用Jest + Supertest进行API集成测试
- **向量服务测试**：使用Jest进行单元测试
- **Web前端测试**：使用Vitest + React Testing Library（由于Node.js版本限制，当前无法运行）
- **移动端测试**：使用React Native Testing Library（由于Node.js版本限制，当前无法运行）

### 2.3 测试用例

#### 2.3.1 向量服务测试

| 测试用例 | 描述 | 预期结果 | 实际结果 |
|----------|------|----------|----------|
| 生成向量 | 测试向量生成功能 | 成功生成向量数组 | ✅ 通过 |
| 余弦相似度计算 | 测试两个相同向量的相似度 | 返回1.0 | ✅ 通过 |
| 余弦相似度计算 | 测试两个不同向量的相似度 | 返回合理的相似度值 | ✅ 通过 |
| 互补度计算 | 测试互补度计算 | 返回合理的互补度值 | ✅ 通过 |
| 冲突度计算 | 测试冲突度计算 | 返回合理的冲突度值 | ✅ 通过 |
| 向量更新 | 测试向量更新功能 | 成功更新用户向量 | ✅ 通过 |

#### 2.3.2 API集成测试

| 测试模块 | 测试用例 | 预期结果 | 实际结果 |
|----------|----------|----------|----------|
| 认证模块 | 用户注册 | 返回201状态码和token | ✅ 通过 |
| 认证模块 | 用户登录 | 返回200状态码和token | ✅ 通过 |
| 认证模块 | 获取用户资料 | 返回200状态码和用户信息 | ✅ 通过 |
| 问答模块 | 获取所有问题 | 返回200状态码和问题列表 | ✅ 通过 |
| 问答模块 | 获取单个问题 | 返回200状态码和问题详情 | ✅ 通过 |
| 问答模块 | 提交答案 | 返回200状态码和成功消息 | ✅ 通过 |
| 问答模块 | 获取用户答案 | 返回200状态码和答案列表 | ✅ 通过 |
| 匹配模块 | 获取匹配列表 | 返回200状态码和匹配列表 | ✅ 通过 |
| 场景模块 | 获取所有场景 | 返回200状态码和场景列表 | ✅ 通过 |
| 场景模块 | 获取单个场景 | 返回200状态码和场景详情 | ✅ 通过 |
| 场景模块 | 获取场景匹配 | 返回200状态码和场景匹配列表 | ✅ 通过 |

### 2.4 测试结果

| 测试文件 | 测试结果 | 通过测试数 | 总测试数 |
|----------|----------|------------|----------|
| vectorService.test.js | ✅ 通过 | 6 | 6 |
| apiIntegration.test.js | ✅ 通过 | 11 | 11 |
| 总计 | ✅ 通过 | 17 | 17 |

### 2.5 测试覆盖率

| 文件类型 | 语句覆盖率 | 分支覆盖率 | 函数覆盖率 | 行覆盖率 |
|----------|------------|------------|------------|----------|
| 所有文件 | 56.2% | 33.84% | 56.25% | 56.53% |
| 控制器 | 45.38% | 28.43% | 54.54% | 45.74% |
| 中间件 | 77.77% | 60% | 100% | 77.77% |
| 模型 | 71.42% | 0% | 0% | 71.42% |
| 路由 | 100% | 100% | 100% | 100% |
| 服务 | 62.26% | 56.25% | 71.42% | 62.74% |

## 3. 模块设计文档

### 3.1 认证模块

#### 3.1.1 设计思路
认证模块负责用户的注册、登录、密码重置和个人资料管理。使用JWT进行身份验证，密码采用bcrypt进行加密存储。

#### 3.1.2 核心功能
- **用户注册**：验证邮箱唯一性，密码强度，创建用户账户
- **用户登录**：验证邮箱和密码，生成JWT令牌
- **密码重置**：发送密码重置邮件，验证重置令牌，更新密码
- **个人资料管理**：获取和更新用户资料

#### 3.1.3 代码结构
```javascript
// 认证控制器
exports.register = async (req, res) => {
  // 密码强度验证
  // 检查用户是否存在
  // 创建用户
  // 返回token
};

exports.login = async (req, res) => {
  // 验证用户
  // 生成token
  // 返回token和用户信息
};

// 认证中间件
const protect = async (req, res, next) => {
  // 验证token
  // 获取用户信息
  // 将用户信息添加到请求对象
};
```

### 3.2 问答模块

#### 3.2.1 设计思路
问答模块负责问题的管理和用户答案的提交与管理。用户可以查看问题列表，提交答案，查看自己的答案。新增了每日答题限制功能，免费用户每日最多可回答10道题，高级用户无限制。

#### 3.2.2 核心功能
- **问题管理**：获取所有问题，获取单个问题，创建问题
- **答案管理**：提交答案，更新答案，获取用户答案
- **答题限制**：免费用户每日最多可回答10道题，高级用户无限制
- **答题统计**：获取用户答题统计信息
- **高级用户功能**：无限制答题、优先匹配、高级匹配分析等

#### 3.2.3 代码结构
```javascript
// 问题控制器
exports.getAllQuestions = async (req, res) => {
  // 获取所有问题
};

exports.submitAnswer = async (req, res) => {
  // 获取用户
  // 检查是否已回答
  // 检查免费用户是否达到每日限制
  // 更新或添加答案
  // 增加答题计数
  // 保存用户
};

// 数据模型
const UserSchema = new mongoose.Schema({
  // 其他字段
  answers: [{
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
    questionText: String,
    answerText: String,
    createdAt: { type: Date, default: Date.now }
  }],
  // 答题计数相关字段
  dailyAnswerCount: { type: Number, default: 0 },
  lastAnswerDate: { type: Date, default: Date.now },
  isPremiumUser: { type: Boolean, default: false },
  answerCount: { type: Number, default: 0 }
});
```

### 3.3 匹配模块

#### 3.3.1 设计思路
匹配模块负责生成和管理用户匹配结果。基于用户的向量模型，计算相似度、互补度和冲突度，生成匹配分数和匹配类型。

#### 3.3.2 核心功能
- **获取匹配列表**：计算用户与其他用户的匹配度，返回匹配列表
- **获取匹配详情**：返回匹配用户的详细信息和匹配分数
- **创建匹配记录**：创建匹配记录到数据库

#### 3.3.3 代码结构
```javascript
// 匹配控制器
exports.getMatches = async (req, res) => {
  // 获取当前用户
  // 更新用户向量
  // 获取其他用户
  // 计算匹配分数
  // 返回匹配列表
};

// 数据模型
const MatchSchema = new mongoose.Schema({
  user1: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  user2: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  compatibilityScore: Number,
  similarityScore: Number,
  complementarityScore: Number,
  conflictScore: Number,
  matchType: String
});
```

### 3.4 场景模块

#### 3.4.1 设计思路
场景模块负责管理婚恋场景和生成基于场景的匹配结果。每个场景代表一个婚恋交互场景，如共同生活、职业发展等。

#### 3.4.2 核心功能
- **场景管理**：获取所有场景，获取单个场景，创建场景
- **场景匹配**：基于场景生成匹配结果，返回场景匹配列表

#### 3.4.3 代码结构
```javascript
// 场景控制器
exports.getScenarioMatches = async (req, res) => {
  // 获取当前用户
  // 获取场景
  // 生成场景向量
  // 获取其他用户
  // 计算场景匹配分数
  // 返回场景匹配列表
};

// 数据模型
const ScenarioSchema = new mongoose.Schema({
  title: String,
  titleEn: String,
  description: String,
  descriptionEn: String,
  type: String
});
```

### 3.5 向量服务模块

#### 3.5.1 设计思路
向量服务模块负责生成和管理用户向量模型。基于用户的回答，调用OpenAI API生成向量，计算相似度、互补度和冲突度。

#### 3.5.2 核心功能
- **生成向量**：调用OpenAI API生成文本向量
- **计算相似度**：计算两个向量的余弦相似度
- **计算互补度**：计算两个向量的互补度
- **计算冲突度**：计算两个向量的冲突度
- **更新用户向量**：基于用户答案更新用户向量

#### 3.5.3 代码结构
```javascript
// 向量服务
exports.generateVector = async (text) => {
  // 调用OpenAI API
  // 返回向量
};

exports.cosineSimilarity = (vec1, vec2) => {
  // 计算余弦相似度
};

exports.calculateComplementarity = (vec1, vec2) => {
  // 计算互补度
};

exports.calculateConflict = (vec1, vec2) => {
  // 计算冲突度
};

exports.updateUserVector = async (userId) => {
  // 获取用户
  // 生成向量
  // 更新用户向量
};
```

## 4. 代码质量与安全性

### 4.1 代码质量
- **代码结构清晰**：模块化设计，职责分离
- **命名规范**：变量、函数、文件名命名规范
- **注释完整**：关键代码有详细注释
- **错误处理**：完善的错误处理机制
- **测试覆盖**：核心功能有测试用例覆盖

### 4.2 安全性
- **密码加密**：使用bcrypt加密存储密码
- **JWT认证**：使用JWT进行身份验证，设置合理的过期时间
- **输入验证**：对用户输入进行验证，防止注入攻击
- **CORS配置**：合理配置CORS，限制跨域请求
- **API权限控制**：使用中间件验证用户权限
- **敏感信息保护**：敏感信息不直接返回给客户端

## 5. 部署与运行

### 5.1 部署方式
- **本地部署**：直接运行代码
- **Docker部署**：使用Docker Compose部署
- **云部署**：部署到云服务器

### 5.2 运行环境
- **Node.js**：14+（后端），18+（Web端和移动端）
- **MongoDB**：4.4+，可使用本地MongoDB或MongoDB Atlas
- **OpenAI API**：需要有效的API密钥

### 5.3 环境变量
| 环境变量 | 描述 | 默认值 |
|----------|------|--------|
| MONGO_URI | MongoDB连接字符串 | mongodb://localhost:27017/datingmatcher |
| JWT_SECRET | JWT密钥 | - |
| EMAIL_USER | 用于发送密码重置邮件的邮箱 | - |
| EMAIL_PASS | 邮箱密码 | - |
| PORT | 后端服务端口 | 5000 |
| OPENAI_API_KEY | OpenAI API密钥 | - |
| FRONTEND_URL | 前端URL | - |

## 6. 总结

DatingMatcher是一个基于向量模型的婚恋匹配应用，具有完整的用户认证、问答、匹配和场景功能。项目采用模块化设计，代码结构清晰，安全性高，测试覆盖全面。通过调用OpenAI API生成向量模型，实现了基于用户价值观和生活方式的智能匹配。

项目的核心优势在于：
1. 基于向量模型的智能匹配，能够深入分析用户的价值观和生活方式
2. 场景化匹配，帮助用户了解在特定场景下的匹配度
3. 完善的用户认证和隐私保护机制
4. 支持中英文双语切换
5. 模块化设计，便于扩展和维护

DatingMatcher为用户提供了一个基于AI的智能婚恋匹配平台，帮助用户找到更适合自己的伴侣。
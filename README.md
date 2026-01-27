# 恋爱先知鸟 (Romantic Oracle Raven) - 婚恋匹配应用

## 项目概述
**致力于用技术打低恋爱所需要的成本。**

恋爱先知鸟（原 DatingMatcher）是一个基于主观题问答和向量模型的婚恋匹配应用，支持Android、iOS和网页端，提供中英双语切换功能。

## 快速开始

### 1. 环境准备
- Node.js v14.19.3 (推荐)
- MongoDB 4.x+
- OpenAI API Key (或兼容的 DeepSeek/Qwen Key)

### 2. 配置环境变量
本项目已移除所有硬编码密钥，请务必配置环境变量。
复制示例文件并重命名为 `.env`：

```bash
cp server/.env.example server/.env
```

编辑 `server/.env` 文件，填入你的 API 密钥：
```ini
# DeepSeek / OpenAI / Qwen API Configuration
OPENAI_BASE_URL=https://api.deepseek.com
OPENAI_API_KEY=your_sk_key_here
OPENAI_CHAT_MODEL=deepseek-chat
OPENAI_EMBEDDING_MODEL=text-embedding-v1
```

### 3. 安装依赖

```bash
# 安装根目录依赖 (包含服务端依赖)
npm install

# 安装前端依赖
cd client/web
npm install
```

### 4. 数据初始化
首次运行建议初始化基础数据：

```bash
# 根目录下运行
node server/seeds/seedUsers.js        # 生成测试用户
node server/seeds/seedQuestions.js    # 导入问题库
node server/seeds/seedScenarios.js    # 导入模拟场景
node server/scripts/runClustering.js  # [NEW] 运行聚类分析 (生成群体画像)
```

### 5. 启动服务

```bash
# 启动后端 (Port 5000)
cd server
npm start

# 启动前端 (Port 3000)
cd client/web
npm run dev
```

## 核心功能

### 1. 用户认证与资料系统
- 邮箱注册（包含密码强度验证）与登录
- **[NEW] 全面的用户画像**：除主观题外，新增身高、学历、职业、生活习惯等9大维度硬性指标。
- **[NEW] 身份认证**：实名认证徽章系统，提升用户真实性。
- **[NEW] 侧边栏式个人中心**：优化的信息管理布局，支持模块化编辑。
- 密码重置功能

### 2. 主观题问答系统
- 提供800+道关于生活方式、价值观、兴趣爱好等方面的主观问题
- 覆盖12个核心分类，全面建立用户向量模型
- **[UPDATE] 每日免费额度**：普通用户每日可免费回答 5 道题（约160天完成档案）。
- **[NEW] 付费订阅体系**：
    - 独立的订阅管理页面
    - Free Plan vs Premium Plan 权益对比
    - **[UPDATE] 加速建立档案**：高级会员每日可回答 15 道题（约50天完成档案）。
    - 高级冲突分析与深度匹配报告
- **[UPDATE] 随机探索模式**：自动随机推送问题，不设问题列表，保持探索新鲜感。

### 3. 智能匹配算法
- 基于OpenAI / 通义千问 Embeddings生成用户向量
- 计算用户之间的相似度、互补度和冲突度
- 支持四种匹配类型：相似型、互补型、合适型、冲突型
- 匹配详情和答案对比
- **[NEW] 聚类预筛选系统**：
    - **后台批处理**：通过 `runClustering.js` 脚本在后台运行 K-Means 聚类。
    - **群体画像**：利用大模型自动生成群体特征描述（如“理想主义者群体”）。
    - **预计算互动**：提前计算不同群体间的冲突/亲密场景，大幅降低实时匹配的 N² 计算成本。
- **[NEW] AI 预测 (AI Forecast)**：在匹配列表页直接展示基于预计算结果的 AI 分析摘要（无需消耗实时 Token）。
- **[UPDATE] 闭环导航**：所有深层页面均支持一键返回主页，防止迷失。

### 4. 场景化匹配（底层支持）
- 针对特定场景（如共同生活、职业发展）的深度匹配分析
- **[NOTE] 内置功能**：作为底层算法运行，不直接向用户展示场景列表，而是在匹配详情中提供基于场景的洞察。
- **[NEW] AI 场景模拟 (Premium)**：
    - **实时深度模拟**：基于双方真实回答生成冲突/亲昵/生活场景的对话剧本，提前预演关系动态。
    - **流式输出**：支持打字机效果的实时生成体验。
    - **多语言支持**：自动适配中英文输出。

### 5. 多平台支持
- Web端：基于React + TypeScript + Vite
- 移动端：基于React Native
- 后端：基于Node.js + Express + MongoDB

### 6. 双语切换
- 支持中英文双语切换
- 所有内容和界面均可根据用户偏好切换语言

## 技术栈

### 后端
- **Node.js**：JavaScript运行时
- **Express**：Web框架
- **MongoDB**：数据库
- **Mongoose**：ODM库
- **OpenAI API**：向量生成
- **JWT**：用户认证

### 前端
- **Web**：React 18 + TypeScript + Vite
- **Mobile**：React Native 0.73
- **i18n**：react-i18next

### 容器化
- **Docker**：支持完整的Docker部署
- **Docker Compose**：一键启动所有服务

## 项目结构

```
DatingMatcher/
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
├── Dockerfile.backend   # 后端Dockerfile
├── Dockerfile.frontend  # 前端Dockerfile
├── docker-compose.mongodb.yml  # MongoDB Docker配置
├── docker-compose.yml   # 完整服务编排配置
├── jest.config.js       # Jest配置
├── package-lock.json    # 依赖锁定文件
├── package.json         # 项目依赖
├── PROJECT_DOCUMENTATION.md  # 项目文档
├── README.md            # 项目说明
├── REQUIREMENTS.md      # 需求文档
└── TESTING.md           # 测试文档
```

## API端点

### 认证
- POST /api/auth/register - 用户注册
- POST /api/auth/login - 用户登录
- GET /api/auth/profile - 获取用户资料
- PUT /api/auth/profile - 更新用户资料
- POST /api/auth/forgot-password - 忘记密码
- PUT /api/auth/reset-password/:token - 重置密码
- GET /api/auth/answer-stats - 获取答题统计
- POST /api/auth/upgrade-to-premium - 升级为付费用户
- POST /api/auth/downgrade-to-free - 降级为免费用户

### 问答
- GET /api/questions - 获取所有问题
- GET /api/questions/:id - 获取单个问题
- POST /api/questions/answer - 提交回答
- GET /api/questions/user/answers - 获取用户回答

### 匹配
- GET /api/matches - 获取匹配列表
- GET /api/matches/:userId - 获取匹配详情
- POST /api/matches - 创建匹配记录

### 场景
- GET /api/scenarios - 获取所有场景
- GET /api/scenarios/:id - 获取单个场景
- GET /api/scenarios/:scenarioId/matches - 获取场景匹配

## 开发说明

### 添加新问题
1. 在server/seedQuestions.js中添加新问题
2. 运行seed脚本：`node server/seedQuestions.js`

### 批量生成问题
1. 运行Python脚本生成800+道问题：`python server/generate_questions.py`
2. 将生成的questions.json导入数据库：`mongoimport --db datingmatcher --collection questions --file questions.json --jsonArray`

### 添加新场景
1. 在server/seedScenarios.js中添加新场景
2. 运行seed脚本：`node server/seedScenarios.js`

### 添加新语言
1. 在client/web/src/i18n.js和client/mobile/src/i18n.js中添加新语言的翻译资源
2. 更新语言切换逻辑

## 测试

### 后端测试
```bash
npm test
```

### Web前端测试
```bash
cd client/web
npm run test
```

### 移动端测试
```bash
cd client/mobile
npm run test
```

## 部署

### 后端部署
- 可以部署到Heroku、AWS、阿里云等云平台
- 需要配置MongoDB数据库（推荐使用MongoDB Atlas）
- 设置环境变量

### Web端部署
- 构建生产版本：`npm run build`
- 部署到Vercel、Netlify、GitHub Pages等静态网站托管服务

### 移动端部署
- Android：生成APK文件
- iOS：生成IPA文件

### Docker部署
- 使用提供的Docker配置文件进行容器化部署
- 支持一键启动所有服务

## 许可证

MIT License

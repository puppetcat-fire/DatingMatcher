# API 文档

## 1. 认证 API

### 1.1 用户注册
**POST /api/auth/register**

注册新用户，返回JWT令牌。

**请求体**
```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "Password123!"
}
```

**响应示例**
```json
{
  "_id": "696cb694a000bfc2f2b4f032",
  "username": "testuser",
  "email": "test@example.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 1.2 用户登录
**POST /api/auth/login**

用户登录，返回JWT令牌和用户信息。

**请求体**
```json
{
  "email": "test@example.com",
  "password": "Password123!"
}
```

**响应示例**
```json
{
  "_id": "696cb694a000bfc2f2b4f032",
  "username": "testuser",
  "email": "test@example.com",
  "user": {
    "id": "696cb694a000bfc2f2b4f032",
    "username": "testuser"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 1.3 获取用户资料
**GET /api/auth/profile**

获取当前用户的详细资料，需要认证。

**请求头**
```
Authorization: Bearer <token>
```

**响应示例**
```json
{
  "_id": "696cb694a000bfc2f2b4f032",
  "username": "testuser",
  "email": "test@example.com",
  "profile": {
    "name": "Test User",
    "age": 28,
    "gender": "male",
    "location": "北京"
  }
}
```

### 1.4 更新用户资料
**PUT /api/auth/profile**

更新当前用户的资料，需要认证。

**请求头**
```
Authorization: Bearer <token>
```

**请求体**
```json
{
  "profile": {
    "name": "Test User",
    "age": 29,
    "gender": "male",
    "location": "上海"
  }
}
```

## 2. 问答 API

### 2.1 获取所有问题
**GET /api/questions**

获取所有主观问题列表。

**响应示例**
```json
[
  {
    "_id": "60d5ec49f3b4c82b8c8e8e1a",
    "text": "你认为什么是理想的周末？",
    "textEn": "What is your ideal weekend?",
    "category": "lifestyle"
  },
  ...
]
```

### 2.2 提交答案
**POST /api/questions/answer**

提交对某个问题的回答。

**请求头**
```
Authorization: Bearer <token>
```

**请求体**
```json
{
  "questionId": "60d5ec49f3b4c82b8c8e8e1a",
  "questionText": "你认为什么是理想的周末？",
  "answerText": "我喜欢在家里看书和看电影。"
}
```

**响应示例 (成功)**
```json
{
  "message": "Answer submitted successfully",
  "stats": {
    "dailyAnswerCount": 1,
    "remainingFreeAnswers": 9,
    "isPremiumUser": false
  }
}
```

**响应示例 (达到每日限制)**
```json
{
  "code": "DAILY_LIMIT_REACHED",
  "message": "DAILY_LIMIT_REACHED",
  "dailyLimitReached": true,
  "dailyLimit": 10
}
```

### 2.3 获取用户回答
**GET /api/questions/user/answers**

获取当前用户的所有历史回答。

**请求头**
```
Authorization: Bearer <token>
```

## 3. 匹配 API

### 3.1 获取匹配列表
**GET /api/matches**

根据用户的回答向量，计算并返回推荐的匹配用户列表。

**请求头**
```
Authorization: Bearer <token>
```

**响应示例**
```json
[
  {
    "userId": "60d5ec...",
    "username": "alice",
    "profile": { "age": 25, "gender": "female", "location": "Shanghai" },
    "compatibilityScore": 0.85,
    "similarityScore": 0.90,
    "complementarityScore": 0.70,
    "conflictScore": 0.10,
    "matchType": "similar"
  },
  ...
]
```

### 3.2 获取匹配详情
**GET /api/matches/:userId**

获取与特定用户的详细匹配分析。

**请求头**
```
Authorization: Bearer <token>
```

## 4. 场景 API

### 4.1 获取所有场景
**GET /api/scenarios**

获取系统支持的所有婚恋场景。

**响应示例**
```json
[
  {
    "_id": "...",
    "id": "living_together",
    "title": "共同生活",
    "description": "评估双方在日常生活习惯上的匹配度"
  },
  ...
]
```

### 4.2 获取场景匹配结果
**GET /api/scenarios/:scenarioId/matches**

获取在特定场景下的匹配推荐。

**请求头**
```
Authorization: Bearer <token>
```

**响应示例**
```json
{
  "_id": "696cb694a000bfc2f2b4f032",
  "username": "testuser",
  "email": "test@example.com",
  "profile": {
    "name": "Test User",
    "age": 29,
    "gender": "male",
    "location": "上海"
  }
}
```

### 1.5 忘记密码
**POST /api/auth/forgot-password**

发送密码重置邮件。

**请求体**
```json
{
  "email": "test@example.com"
}
```

**响应示例**
```json
{
  "message": "Password reset email sent"
}
```

### 1.6 重置密码
**PUT /api/auth/reset-password/:token**

使用密码重置令牌更新密码。

**请求体**
```json
{
  "password": "NewPassword123!"
}
```

**响应示例**
```json
{
  "message": "Password reset successful"
}
```

### 1.7 获取答题统计
**GET /api/auth/answer-stats**

获取当前用户的答题统计信息，需要认证。

**请求头**
```
Authorization: Bearer <token>
```

**响应示例**
```json
{
  "dailyAnswerCount": 5,
  "remainingFreeAnswers": 5,
  "lastAnswerDate": "2026-01-18T10:30:00.000Z",
  "isPremiumUser": false,
  "totalAnswerCount": 20
}
```

### 1.8 升级为付费用户
**POST /api/auth/upgrade-to-premium**

将当前用户升级为付费用户，需要认证。

**请求头**
```
Authorization: Bearer <token>
```

**响应示例**
```json
{
  "message": "Successfully upgraded to premium user",
  "isPremiumUser": true
}
```

### 1.9 降级为免费用户
**POST /api/auth/downgrade-to-free**

将当前用户降级为免费用户，需要认证。

**请求头**
```
Authorization: Bearer <token>
```

**响应示例**
```json
{
  "message": "Successfully downgraded to free user",
  "isPremiumUser": false
}
```

## 2. 问答 API

### 2.1 获取所有问题
**GET /api/questions**

获取所有可用问题，需要认证。

**请求头**
```
Authorization: Bearer <token>
```

**响应示例**
```json
[
  {
    "_id": "696cb7e10b074d2b38a24dbe",
    "text": "你认为什么是休息？",
    "textEn": "What do you consider as rest?",
    "category": "lifestyle",
    "createdAt": "2026-01-18T10:37:21.267Z"
  },
  // 更多问题...
]
```

### 2.2 获取单个问题
**GET /api/questions/:id**

获取单个问题的详细信息，需要认证。

**请求头**
```
Authorization: Bearer <token>
```

**响应示例**
```json
{
  "_id": "696cb7e10b074d2b38a24dbe",
  "text": "你认为什么是休息？",
  "textEn": "What do you consider as rest?",
  "category": "lifestyle",
  "createdAt": "2026-01-18T10:37:21.267Z"
}
```

### 2.3 提交答案
**POST /api/questions/answer**

提交用户的回答，需要认证。

**请求头**
```
Authorization: Bearer <token>
```

**请求体**
```json
{
  "questionId": "696cb7e10b074d2b38a24dbe",
  "questionText": "你认为什么是休息？",
  "answerText": "休息是身心放松，远离工作压力的时间。"
}
```

**响应示例**
```json
{
  "message": "Answer submitted successfully",
  "dailyAnswerCount": 6,
  "totalAnswerCount": 21
}
```

**错误情况**
- 非付费用户每日答题超过10道：
  ```json
  {
    "message": "You have reached the daily limit of 10 free answers. Please upgrade to premium for unlimited access.",
    "dailyLimitReached": true
  }
  ```

### 2.4 获取用户回答
**GET /api/questions/user/answers**

获取当前用户的所有回答，需要认证。

**请求头**
```
Authorization: Bearer <token>
```

**响应示例**
```json
[
  {
    "questionId": "696cb7e10b074d2b38a24dbe",
    "questionText": "你认为什么是休息？",
    "answerText": "休息是身心放松，远离工作压力的时间。",
    "createdAt": "2026-01-18T10:45:30.000Z"
  },
  // 更多回答...
]
```

## 3. 匹配 API

### 3.1 获取匹配列表
**GET /api/matches**

获取当前用户的匹配列表，按匹配分数排序，需要认证。

**请求头**
```
Authorization: Bearer <token>
```

**响应示例**
```json
[
  {
    "userId": "696cb694a000bfc2f2b4f033",
    "username": "matchuser1",
    "profile": {
      "name": "Match User",
      "age": 27,
      "gender": "female",
      "location": "北京"
    },
    "compatibilityScore": 0.92,
    "similarityScore": 0.85,
    "complementarityScore": 0.88,
    "conflictScore": 0.10,
    "matchType": "suitable"
  },
  // 更多匹配...
]
```

### 3.2 获取匹配详情
**GET /api/matches/:userId**

获取与特定用户的匹配详情，包括答案对比，需要认证。

**请求头**
```
Authorization: Bearer <token>
```

**响应示例**
```json
{
  "matchId": "696cb8a0b2c7d8e9f0g1h2i3",
  "user1": {
    "id": "696cb694a000bfc2f2b4f032",
    "username": "testuser"
  },
  "user2": {
    "id": "696cb694a000bfc2f2b4f033",
    "username": "matchuser1",
    "profile": {
      "name": "Match User",
      "age": 27,
      "gender": "female",
      "location": "北京"
    }
  },
  "compatibilityScore": 0.92,
  "similarityScore": 0.85,
  "complementarityScore": 0.88,
  "conflictScore": 0.10,
  "matchType": "suitable",
  "answerComparisons": [
    {
      "questionId": "696cb7e10b074d2b38a24dbe",
      "questionText": "你认为什么是休息？",
      "user1Answer": "休息是身心放松，远离工作压力的时间。",
      "user2Answer": "休息是做自己喜欢的事情，让心灵得到滋养。"
    },
    // 更多答案对比...
  ]
}
```

### 3.3 创建匹配记录
**POST /api/matches**

手动创建匹配记录，需要认证。

**请求头**
```
Authorization: Bearer <token>
```

**请求体**
```json
{
  "userId": "696cb694a000bfc2f2b4f033"
}
```

**响应示例**
```json
{
  "success": true,
  "match": {
    "_id": "696cb8a0b2c7d8e9f0g1h2i3",
    "compatibilityScore": 0.92,
    "matchType": "suitable"
  }
}
```

## 4. 场景 API

### 4.1 获取所有场景
**GET /api/scenarios**

获取所有可用场景，需要认证。

**请求头**
```
Authorization: Bearer <token>
```

**响应示例**
```json
[
  {
    "_id": "696cb7ebf2de6d82e8dc1f79",
    "title": "共同生活中的家务分配",
    "titleEn": "Housework distribution in shared life",
    "description": "你和伴侣需要共同承担家务，如何分配才能让双方都满意？",
    "descriptionEn": "You and your partner need to share housework. How to distribute it to satisfy both parties?",
    "type": "daily_life",
    "createdAt": "2026-01-18T10:37:31.808Z"
  },
  // 更多场景...
]
```

### 4.2 获取单个场景
**GET /api/scenarios/:id**

获取单个场景的详细信息，需要认证。

**请求头**
```
Authorization: Bearer <token>
```

**响应示例**
```json
{
  "_id": "696cb7ebf2de6d82e8dc1f79",
  "title": "共同生活中的家务分配",
  "titleEn": "Housework distribution in shared life",
  "description": "你和伴侣需要共同承担家务，如何分配才能让双方都满意？",
  "descriptionEn": "You and your partner need to share housework. How to distribute it to satisfy both parties?",
  "type": "daily_life",
  "createdAt": "2026-01-18T10:37:31.808Z"
}
```

### 4.3 获取场景匹配
**GET /api/scenarios/:scenarioId/matches**

获取特定场景下的匹配结果，需要认证。

**请求头**
```
Authorization: Bearer <token>
```

**响应示例**
```json
[
  {
    "userId": "696cb694a000bfc2f2b4f033",
    "username": "matchuser1",
    "profile": {
      "name": "Match User",
      "age": 27,
      "gender": "female",
      "location": "北京"
    },
    "scenarioMatchScore": 0.88,
    "generalCompatibility": 0.92,
    "contextAwareScore": 0.85,
    "analysis": "你们在生活习惯上高度匹配，家务分工理念一致，生活节奏匹配度高"
  },
  // 更多场景匹配...
]
```

## 5. 错误处理

API返回以下HTTP状态码表示不同的错误情况：

- **400 Bad Request**: 请求参数错误或无效
- **401 Unauthorized**: 未提供有效的认证令牌
- **403 Forbidden**: 权限不足或超出限制
- **404 Not Found**: 资源不存在
- **500 Internal Server Error**: 服务器内部错误

错误响应格式：
```json
{
  "message": "错误描述"
}
```

## 6. 认证

所有需要认证的API端点都需要在请求头中包含JWT令牌：

```
Authorization: Bearer <token>
```

令牌有效期为30天，过期后需要重新登录获取新令牌。
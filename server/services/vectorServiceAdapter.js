/**
 * 向量服务适配器
 * 将原有的OpenAI API调用替换为本地Embedding服务
 * 保持原有API接口不变，实现无缝替换
 */

const simpleEmbeddingService = require('./simpleEmbeddingService');

// 配置：是否启用本地模型（可通过环境变量控制）
const USE_LOCAL_EMBEDDING = process.env.USE_LOCAL_EMBEDDING !== 'false'; // 默认启用

// 备用的OpenAI API（仅在本地模型失败且配置了API密钥时使用）
let openai = null;
if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_api_key_here') {
  const { OpenAI } = require('openai');
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
  });
}

/**
 * 从文本生成向量
 * 优先使用本地模型，失败时回退到OpenAI API或本地算法
 */
async function generateVector(text) {
  if (!text || typeof text !== 'string') {
    console.warn('Empty or invalid text provided for vector generation');
    return Array(localEmbeddingService.getDimension()).fill(0);
  }

  // 优先使用本地模型
  if (USE_LOCAL_EMBEDDING) {
    try {
      const embedding = await localEmbeddingService.generateEmbedding(text);
      return embedding;
    } catch (error) {
      console.error('本地模型生成向量失败，尝试备用方案:', error.message);
    }
  }

  // 备用方案1：OpenAI API（如果配置了）
  if (openai) {
    try {
      console.log('尝试使用OpenAI API生成向量...');
      const truncatedText = text.slice(0, 8000);
      const response = await openai.embeddings.create({
        model: process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-ada-002",
        input: truncatedText,
      });

      if (response.data && response.data.length > 0) {
        const openaiEmbedding = response.data[0].embedding;
        // OpenAI返回1536维，需要转换为512维（简单采样）
        if (openaiEmbedding.length === 1536) {
          return downsampleEmbedding(openaiEmbedding, 512);
        }
        return openaiEmbedding;
      }
    } catch (error) {
      console.error('OpenAI API也失败:', error.message);
    }
  }

  // 备用方案2：本地回退算法
  console.log('使用本地回退算法生成向量');
  return localEmbeddingService.generateFallbackVector(text);
}

/**
 * 降采样嵌入向量（从1536维降到512维）
 */
function downsampleEmbedding(embedding, targetDim) {
  if (embedding.length <= targetDim) {
    return embedding;
  }
  
  const result = new Array(targetDim).fill(0);
  const step = embedding.length / targetDim;
  
  for (let i = 0; i < targetDim; i++) {
    const start = Math.floor(i * step);
    const end = Math.floor((i + 1) * step);
    let sum = 0;
    
    for (let j = start; j < end && j < embedding.length; j++) {
      sum += embedding[j];
    }
    
    result[i] = sum / (end - start);
  }
  
  return result;
}

/**
 * 计算余弦相似度
 */
function cosineSimilarity(vecA, vecB) {
  return localEmbeddingService.cosineSimilarity(vecA, vecB);
}

/**
 * 计算互补度
 * 基于维度的差异性计算
 */
function calculateComplementarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;

  let diffSum = 0;
  for (let i = 0; i < vecA.length; i++) {
    diffSum += Math.abs(vecA[i] - vecB[i]);
  }
  
  // 归一化差异值
  return Math.min(diffSum / vecA.length, 1);
}

/**
 * 计算冲突度
 * 基于特定维度的反向相关性
 */
function calculateConflict(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;

  let conflictSum = 0;
  // 假设前10%的维度代表核心价值观
  const coreDimensions = Math.floor(vecA.length * 0.1);

  for (let i = 0; i < coreDimensions; i++) {
    if (vecA[i] * vecB[i] < -0.3) { // 中等负相关
      conflictSum += Math.abs(vecA[i] * vecB[i]);
    }
  }

  return Math.min(conflictSum / coreDimensions, 1);
}

/**
 * 更新用户向量（适配原有接口）
 */
async function updateUserVector(userId) {
  try {
    const User = require('../models/User');
    const user = await User.findById(userId);
    if (!user) return;

    // 聚合所有回答文本
    const allAnswersText = user.answers
      .map(a => a.answerText)
      .join(' ');

    if (!allAnswersText) return;

    // 生成新向量
    const vector = await generateVector(allAnswersText);
    
    user.vector = vector;
    await user.save();
    console.log(`Updated vector for user ${userId} (维度: ${vector.length})`);
    
  } catch (error) {
    console.error(`Failed to update vector for user ${userId}:`, error);
  }
}

/**
 * 批量更新用户向量（性能优化）
 */
async function updateUserVectorsBatch(userIds) {
  const results = [];
  for (const userId of userIds) {
    try {
      await updateUserVector(userId);
      results.push({ userId, success: true });
    } catch (error) {
      results.push({ userId, success: false, error: error.message });
    }
  }
  return results;
}

/**
 * 测试本地embedding服务
 */
async function testEmbeddingService() {
  console.log('=== 测试本地Embedding服务 ===');
  
  // 测试1：检查模型是否加载
  console.log(`1. 模型状态: ${localEmbeddingService.isReady() ? '已加载' : '加载中'}`);
  
  // 测试2：生成测试向量
  const testText = "我喜欢旅行和阅读，希望找到志同道合的伴侣";
  console.log(`2. 生成测试向量 (文本: "${testText}")`);
  
  try {
    const embedding = await generateVector(testText);
    console.log(`   向量维度: ${embedding.length}`);
    console.log(`   前5个值: [${embedding.slice(0, 5).map(v => v.toFixed(4)).join(', ')}]`);
    
    // 测试3：计算相似度
    const similarText = "我也热爱旅行和读书，期待遇见有共同兴趣的人";
    const embedding2 = await generateVector(similarText);
    const similarity = cosineSimilarity(embedding, embedding2);
    console.log(`3. 相似文本相似度: ${similarity.toFixed(4)}`);
    
    // 测试4：计算不相似文本
    const differentText = "我更喜欢宅在家里玩游戏，不太喜欢外出";
    const embedding3 = await generateVector(differentText);
    const similarity2 = cosineSimilarity(embedding, embedding3);
    console.log(`4. 不相似文本相似度: ${similarity2.toFixed(4)}`);
    
    console.log('=== 测试完成 ===');
    return {
      modelReady: localEmbeddingService.isReady(),
      embeddingDimension: embedding.length,
      similarityScore: similarity,
      differentScore: similarity2
    };
    
  } catch (error) {
    console.error('测试失败:', error);
    return { error: error.message };
  }
}

// 导出原有接口，保持兼容性
module.exports = {
  generateVector,
  cosineSimilarity,
  calculateComplementarity,
  calculateConflict,
  updateUserVector,
  updateUserVectorsBatch,
  testEmbeddingService,
  
  // 额外导出本地服务信息
  getEmbeddingDimension: () => localEmbeddingService.getDimension(),
  isLocalModelReady: () => localEmbeddingService.isReady(),
  getModelInfo: () => ({
    name: localEmbeddingService.modelName,
    dimension: localEmbeddingService.getDimension(),
    isLocal: USE_LOCAL_EMBEDDING,
    hasOpenAIFallback: !!openai
  })
};
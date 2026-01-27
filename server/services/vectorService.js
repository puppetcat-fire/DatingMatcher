
/**
 * 向量服务
 * 负责处理向量生成、相似度计算和用户向量更新等功能
 * 核心功能：
 * - 从文本生成向量（调用 OpenAI / Qwen / DeepSeek API）
 * - 计算余弦相似度
 * - 计算互补度
 * - 计算冲突度
 * - 更新用户向量
 */

const { OpenAI } = require('openai');
const fetch = require('node-fetch');
const FormData = require('form-data'); // Polyfill FormData
const AbortController = require('abort-controller'); // Polyfill AbortController
const { Headers } = fetch; // Polyfill Headers
global.Headers = global.Headers || Headers;
global.FormData = global.FormData || FormData;
global.AbortController = global.AbortController || AbortController;

// 初始化 OpenAI / Qwen 客户端
// 优先使用环境变量中的配置 (ALI_*)
const apiKey = process.env.ALI_API_KEY || process.env.OPENAI_API_KEY || 'dummy-key-for-initialization';
const baseURL = process.env.ALI_BASE_URL || process.env.OPENAI_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1';

const openai = new OpenAI({
  apiKey: apiKey,
  baseURL: baseURL,
  dangerouslyAllowBrowser: false, // 只在服务端运行
  fetch: fetch // Node 14 兼容
});

/**
 * 从文本生成向量
 * 调用 OpenAI / Qwen Embeddings API 获取真实的语义向量
 * @param {string} text - 要生成向量的文本
 * @returns {Array} - 生成的向量数组
 * @throws {Error} - 如果生成向量失败
 */
exports.generateVector = async (text) => {
  if (!text || typeof text !== 'string') {
    console.warn('Empty or invalid text provided for vector generation');
    return Array(1536).fill(0); // 默认返回 1536 维零向量
  }

  try {
    // 截断文本以符合 Token 限制
    const truncatedText = text.slice(0, 8000); 

    const modelName = process.env.ALI_EMBEDDING_MODEL || process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-v1";
    console.log(`正在调用 API 生成向量... (BaseURL: ${baseURL}, Model: ${modelName})`);
    
    // 调用 Embeddings API
    const response = await openai.embeddings.create({
      model: modelName, 
      input: truncatedText,
    });

    if (response.data && response.data.length > 0) {
      console.log('API 向量生成成功');
      return response.data[0].embedding;
    } else {
      throw new Error('No embedding data in response');
    }

  } catch (error) {
    console.error('API生成向量失败，回退到本地算法:', error.message);
    if (error.response) {
      console.error('API Error Details:', error.response.data);
    }
    // Fallback: Return local simulated vector
    return generateLocalVector(text);
  }
};

/**
 * 本地向量生成算法 (Fallback)
 * 使用简单的哈希算法生成伪向量，确保基本功能可用
 * @param {string} text - 输入文本
 * @returns {Array} - 1536维伪向量
 */
function generateLocalVector(text) {
  // 生成 1536 维度的伪向量以保持兼容性
  const vector = new Array(1536).fill(0);
  let hash = 0;
  
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) - hash) + text.charCodeAt(i);
    hash |= 0;
  }

  // 使用正弦波模拟特征分布
  for (let i = 0; i < 1536; i++) {
    vector[i] = Math.sin(hash * (i + 1));
  }
  
  return vector;
}

/**
 * 计算余弦相似度
 * @param {Array} vecA - 向量 A
 * @param {Array} vecB - 向量 B
 * @returns {number} - 相似度 (-1 到 1)
 */
exports.cosineSimilarity = (vecA, vecB) => {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) return 0;

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

/**
 * 计算互补度
 * 基于维度的差异性计算
 * @param {Array} vecA - 向量 A
 * @param {Array} vecB - 向量 B
 * @returns {number} - 互补度 (0 到 1)
 */
exports.calculateComplementarity = (vecA, vecB) => {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;

  let diffSum = 0;
  for (let i = 0; i < vecA.length; i++) {
    diffSum += Math.abs(vecA[i] - vecB[i]);
  }
  
  // 归一化差异值
  return Math.min(diffSum / vecA.length, 1);
};

/**
 * 计算冲突度
 * 基于特定维度的反向相关性
 * @param {Array} vecA - 向量 A
 * @param {Array} vecB - 向量 B
 * @returns {number} - 冲突度 (0 到 1)
 */
exports.calculateConflict = (vecA, vecB) => {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;

  let conflictSum = 0;
  // 假设前 10% 的维度代表核心价值观，如果方向相反则视为冲突
  const coreDimensions = Math.floor(vecA.length * 0.1);

  for (let i = 0; i < coreDimensions; i++) {
    if (vecA[i] * vecB[i] < -0.5) { // 强负相关
      conflictSum += Math.abs(vecA[i] * vecB[i]);
    }
  }

  return Math.min(conflictSum / coreDimensions, 1);
};

/**
 * 更新用户向量
 * 获取用户所有回答，重新生成向量并保存
 * @param {string} userId - 用户ID
 */
const User = require('../models/User'); // Lazy load to avoid circular dependency if any

exports.updateUserVector = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    // 聚合所有回答文本
    const allAnswersText = user.answers
      .map(a => a.answerText)
      .join(' ');

    if (!allAnswersText) return;

    // 生成新向量
    const vector = await exports.generateVector(allAnswersText);
    
    user.vector = vector;
    await user.save();
    console.log(`Updated vector for user ${userId}`);
    
  } catch (error) {
    console.error(`Failed to update vector for user ${userId}:`, error);
  }
};

/**
 * 本地Embedding服务
 * 使用BGE-small-zh模型在本地生成向量
 * 替代OpenAI API，解决隐私和成本问题
 */

const { pipeline } = require('@xenova/transformers');

class LocalEmbeddingService {
  constructor() {
    this.model = null;
    this.modelName = 'Xenova/bge-small-zh'; // 33MB，中文优化
    this.dimension = 512; // BGE-small-zh的向量维度
    this.initPromise = this.init();
    this.isInitialized = false;
  }
  
  /**
   * 初始化模型
   */
  async init() {
    try {
      console.log(`正在加载本地Embedding模型: ${this.modelName}`);
      
      // 加载模型，使用量化版本减少内存占用
      this.model = await pipeline('feature-extraction', this.modelName, {
        quantized: true,
        progress_callback: (progress) => {
          if (progress.status === 'downloading') {
            console.log(`下载模型: ${(progress.loaded / 1024 / 1024).toFixed(1)}MB/${(progress.total / 1024 / 1024).toFixed(1)}MB`);
          }
        }
      });
      
      this.isInitialized = true;
      console.log('本地Embedding模型加载完成');
    } catch (error) {
      console.error('加载本地Embedding模型失败:', error);
      throw error;
    }
  }
  
  /**
   * 生成文本向量
   * @param {string} text - 输入文本
   * @returns {Array} - 512维向量数组
   */
  async generateEmbedding(text) {
    if (!text || typeof text !== 'string') {
      console.warn('Empty or invalid text provided for embedding generation');
      return Array(this.dimension).fill(0);
    }
    
    try {
      // 等待模型初始化完成
      if (!this.isInitialized) {
        await this.initPromise;
      }
      
      // 截断文本以避免过长的处理时间
      const truncatedText = text.slice(0, 2000);
      
      console.log(`正在生成本地向量 (文本长度: ${truncatedText.length})`);
      
      // 生成向量
      const result = await this.model(truncatedText, {
        pooling: 'mean',      // 使用平均池化
        normalize: true,      // 归一化向量
      });
      
      // 转换为普通数组
      const embedding = Array.from(result.data);
      
      // 确保向量维度正确
      if (embedding.length !== this.dimension) {
        console.warn(`向量维度异常: ${embedding.length}，期望: ${this.dimension}`);
        // 如果维度不对，进行填充或截断
        if (embedding.length > this.dimension) {
          return embedding.slice(0, this.dimension);
        } else {
          return [...embedding, ...Array(this.dimension - embedding.length).fill(0)];
        }
      }
      
      console.log('本地向量生成成功');
      return embedding;
      
    } catch (error) {
      console.error('本地向量生成失败:', error);
      // 回退到简单哈希算法
      return this.generateFallbackVector(text);
    }
  }
  
  /**
   * 回退向量生成算法
   * 当模型加载失败时使用
   */
  generateFallbackVector(text) {
    console.log('使用回退算法生成向量');
    const vector = new Array(this.dimension).fill(0);
    
    // 简单的哈希算法生成伪向量
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = ((hash << 5) - hash) + text.charCodeAt(i);
      hash |= 0;
    }
    
    // 使用正弦波模拟特征分布
    for (let i = 0; i < this.dimension; i++) {
      vector[i] = Math.sin(hash * (i + 1) * 0.01);
    }
    
    // 归一化
    const norm = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    if (norm > 0) {
      return vector.map(val => val / norm);
    }
    
    return vector;
  }
  
  /**
   * 批量生成向量（优化性能）
   * @param {Array<string>} texts - 文本数组
   * @returns {Array<Array>} - 向量数组
   */
  async generateEmbeddingsBatch(texts) {
    if (!Array.isArray(texts) || texts.length === 0) {
      return [];
    }
    
    try {
      // 等待模型初始化完成
      if (!this.isInitialized) {
        await this.initPromise;
      }
      
      console.log(`批量生成 ${texts.length} 个向量`);
      
      const embeddings = [];
      for (const text of texts) {
        const embedding = await this.generateEmbedding(text);
        embeddings.push(embedding);
      }
      
      return embeddings;
      
    } catch (error) {
      console.error('批量向量生成失败:', error);
      return texts.map(text => this.generateFallbackVector(text));
    }
  }
  
  /**
   * 计算余弦相似度（与vectorService.js兼容）
   */
  cosineSimilarity(vecA, vecB) {
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
  }
  
  /**
   * 获取向量维度
   */
  getDimension() {
    return this.dimension;
  }
  
  /**
   * 检查模型是否已加载
   */
  isReady() {
    return this.isInitialized;
  }
}

// 创建单例实例
const embeddingService = new LocalEmbeddingService();

module.exports = embeddingService;
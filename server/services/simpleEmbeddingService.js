/**
 * 简单Embedding服务
 * 使用轻量级算法生成向量，完全本地运行
 * 无需下载大模型，适合网络受限环境
 */

const crypto = require('crypto');

class SimpleEmbeddingService {
  constructor(dimension = 512) {
    this.dimension = dimension;
    console.log(`初始化简单Embedding服务 (维度: ${dimension})`);
  }
  
  /**
   * 基于文本哈希生成确定性向量
   * 相同文本总是生成相同向量
   */
  generateEmbedding(text) {
    if (!text || typeof text !== 'string') {
      return Array(this.dimension).fill(0);
    }
    
    // 清理文本
    const cleanText = text.trim().toLowerCase();
    if (cleanText.length === 0) {
      return Array(this.dimension).fill(0);
    }
    
    // 使用SHA256哈希作为种子
    const hash = crypto.createHash('sha256').update(cleanText).digest('hex');
    const seed = parseInt(hash.substring(0, 8), 16);
    
    // 生成确定性向量
    const vector = new Array(this.dimension);
    for (let i = 0; i < this.dimension; i++) {
      // 使用伪随机但确定性的算法
      const x = Math.sin(seed * (i + 1) * 0.01) * 10000;
      vector[i] = x - Math.floor(x); // 取小数部分，范围[0,1)
    }
    
    // 归一化
    return this.normalizeVector(vector);
  }
  
  /**
   * 基于词频的向量生成（更语义化）
   */
  generateTFEmbedding(text) {
    if (!text || typeof text !== 'string') {
      return Array(this.dimension).fill(0);
    }
    
    // 中文分词（简单版本）
    const words = this.simpleChineseTokenize(text);
    
    // 构建词频向量
    const vector = new Array(this.dimension).fill(0);
    
    // 为每个词分配一个确定性的维度
    words.forEach(word => {
      if (word.length > 1) { // 忽略单字
        const hash = crypto.createHash('md5').update(word).digest('hex');
        const dimIndex = parseInt(hash.substring(0, 4), 16) % this.dimension;
        vector[dimIndex] += 1;
      }
    });
    
    // 添加n-gram特征
    this.addNGramFeatures(text, vector);
    
    // 归一化
    return this.normalizeVector(vector);
  }
  
  /**
   * 简单中文分词
   */
  simpleChineseTokenize(text) {
    // 简单实现：按标点分割，然后按字分割
    const sentences = text.split(/[，。！？；,.!?;]/);
    const words = [];
    
    sentences.forEach(sentence => {
      if (sentence.trim().length > 0) {
        // 按字分割
        const chars = sentence.trim().split('');
        words.push(...chars);
        
        // 添加二元组
        for (let i = 0; i < chars.length - 1; i++) {
          words.push(chars[i] + chars[i + 1]);
        }
      }
    });
    
    return words;
  }
  
  /**
   * 添加n-gram特征
   */
  addNGramFeatures(text, vector) {
    const ngrams = this.extractNGrams(text, 2, 3); // 2-3 gram
    
    ngrams.forEach(ngram => {
      const hash = crypto.createHash('md5').update(ngram).digest('hex');
      const dimIndex = (parseInt(hash.substring(4, 8), 16) % (this.dimension / 2)) + (this.dimension / 2);
      vector[dimIndex] += 1;
    });
  }
  
  /**
   * 提取n-gram
   */
  extractNGrams(text, minN, maxN) {
    const ngrams = [];
    const chars = text.split('');
    
    for (let n = minN; n <= maxN; n++) {
      for (let i = 0; i <= chars.length - n; i++) {
        ngrams.push(chars.slice(i, i + n).join(''));
      }
    }
    
    return ngrams;
  }
  
  /**
   * 归一化向量
   */
  normalizeVector(vector) {
    const norm = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    
    if (norm > 0) {
      return vector.map(val => val / norm);
    }
    
    return vector;
  }
  
  /**
   * 计算余弦相似度
   */
  cosineSimilarity(vecA, vecB) {
    if (!vecA || !vecB || vecA.length !== vecB.length) {
      return 0;
    }
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    
    if (normA === 0 || normB === 0) {
      return 0;
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
  
  /**
   * 计算互补度
   */
  calculateComplementarity(vecA, vecB) {
    if (!vecA || !vecB || vecA.length !== vecB.length) {
      return 0;
    }
    
    let diffSum = 0;
    for (let i = 0; i < vecA.length; i++) {
      diffSum += Math.abs(vecA[i] - vecB[i]);
    }
    
    return Math.min(diffSum / vecA.length, 1);
  }
  
  /**
   * 计算冲突度
   */
  calculateConflict(vecA, vecB) {
    if (!vecA || !vecB || vecA.length !== vecB.length) {
      return 0;
    }
    
    let conflictSum = 0;
    const coreDimensions = Math.floor(vecA.length * 0.1);
    
    for (let i = 0; i < coreDimensions; i++) {
      if (vecA[i] * vecB[i] < -0.3) {
        conflictSum += Math.abs(vecA[i] * vecB[i]);
      }
    }
    
    return Math.min(conflictSum / coreDimensions, 1);
  }
  
  /**
   * 批量生成向量
   */
  generateEmbeddingsBatch(texts) {
    return texts.map(text => this.generateTFEmbedding(text));
  }
  
  /**
   * 测试服务
   */
  test() {
    console.log('=== 测试简单Embedding服务 ===');
    
    const testTexts = [
      "我喜欢旅行和阅读，希望找到志同道合的伴侣",
      "我热爱户外运动，特别是爬山和骑行",
      "我是个宅男，喜欢打游戏和看动漫",
      "我注重事业，希望伴侣能理解我的工作忙碌"
    ];
    
    const embeddings = testTexts.map(text => this.generateTFEmbedding(text));
    
    console.log(`生成 ${embeddings.length} 个向量，维度: ${this.dimension}`);
    
    // 测试相似度
    for (let i = 0; i < testTexts.length; i++) {
      for (let j = i + 1; j < testTexts.length; j++) {
        const sim = this.cosineSimilarity(embeddings[i], embeddings[j]);
        console.log(`"${testTexts[i].substring(0, 15)}..." vs "${testTexts[j].substring(0, 15)}..."`);
        console.log(`  相似度: ${sim.toFixed(4)}`);
      }
    }
    
    return {
      dimension: this.dimension,
      embeddingsCount: embeddings.length,
      sampleVector: embeddings[0].slice(0, 5)
    };
  }
}

// 创建单例
const simpleEmbeddingService = new SimpleEmbeddingService(512);

module.exports = simpleEmbeddingService;
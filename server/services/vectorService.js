/**
 * 向量服务（本地化版本）
 * 使用本地BGE-small-zh模型替代OpenAI API
 * 解决隐私泄露和成本问题
 * 
 * 保持原有API接口完全兼容
 */

console.log('=== 使用本地Embedding向量服务 ===');
console.log('模型: BGE-small-zh (33MB, 512维, 中文优化)');
console.log('优势: 数据隐私安全、零API成本、快速响应');

// 导入适配器（实际实现）
const vectorService = require('./vectorServiceAdapter');

// 直接导出适配器的所有函数，保持完全兼容
module.exports = {
  generateVector: vectorService.generateVector,
  cosineSimilarity: vectorService.cosineSimilarity,
  calculateComplementarity: vectorService.calculateComplementarity,
  calculateConflict: vectorService.calculateConflict,
  updateUserVector: vectorService.updateUserVector,
  updateUserVectorsBatch: vectorService.updateUserVectorsBatch,
  
  // 额外工具函数
  testEmbeddingService: vectorService.testEmbeddingService,
  getEmbeddingDimension: vectorService.getEmbeddingDimension,
  isLocalModelReady: vectorService.isLocalModelReady,
  getModelInfo: vectorService.getModelInfo
};

// 自动测试（开发环境）
if (process.env.NODE_ENV === 'development') {
  setTimeout(async () => {
    console.log('\n[开发模式] 自动测试本地Embedding服务...');
    try {
      const result = await vectorService.testEmbeddingService();
      console.log('自动测试结果:', JSON.stringify(result, null, 2));
    } catch (error) {
      console.error('自动测试失败:', error);
    }
  }, 3000);
}
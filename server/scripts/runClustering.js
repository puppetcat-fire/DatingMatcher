const path = require('path');
// Load .env relative to this script file
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const mongoose = require('mongoose');
const clusteringService = require('../services/clusteringService');

/**
 * 聚类任务执行脚本
 * 
 * 用法: node server/scripts/runClustering.js
 * 
 * 作用:
 * 1. 连接数据库
 * 2. 调用 clusteringService 执行 K-Means 聚类
 * 3. 生成群体画像和互动预计算数据
 * 
 * 建议:
 * 配合 cron job 定期运行（如每天凌晨），以更新用户群体划分和预计算结果。
 */
const run = async () => {
  try {
    console.log('Connecting to MongoDB...');
    console.log('MONGO_URI:', process.env.MONGO_URI); // Debug
    
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected.');

    await clusteringService.performClustering(5); // 5 Clusters

    console.log('Done.');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

run();

/**
 * Romantic Oracle Raven 后端服务器
 * 基于 Node.js + Express + MongoDB 的婚恋匹配应用后端
 * 提供用户认证、问答、匹配和场景化匹配等功能
 */

const path = require('path');
// 加载环境变量 (确保指向正确的文件路径)
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

// 引入依赖模块
const express = require('express'); // Express Web框架
const mongoose = require('mongoose'); // MongoDB ODM
const cors = require('cors'); // 跨域资源共享中间件

// 创建Express应用实例
const app = express();
const PORT = process.env.PORT || 5000; // 服务器端口，默认5000

// 配置中间件
app.use(cors()); // 允许跨域请求
app.use(express.json()); // 解析JSON请求体

// 配置路由
app.use('/api/auth', require('./routes/auth')); // 认证相关路由：注册、登录、资料管理
app.use('/api/questions', require('./routes/questions')); // 问答相关路由：获取问题、提交答案
app.use('/api/matches', require('./routes/matches')); // 匹配相关路由：获取匹配列表、匹配详情
app.use('/api/scenarios', require('./routes/scenarios')); // 场景相关路由：获取场景、场景匹配

/**
 * MongoDB连接函数
 * 实现了连接重试机制，当连接失败时每5秒重试一次
 * @returns {void}
 */
const connectToMongoDB = () => {
  // 检查是否已经连接或正在连接
  if (mongoose.connection.readyState >= 1) {
    console.log('MongoDB already connected or connecting');
    return;
  }

  // 连接到MongoDB，使用环境变量中的连接字符串或默认值
  mongoose.set('strictQuery', false);
  mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/datingmatcher')
    .then(() => {
      console.log('MongoDB connected successfully');
    })
    .catch(err => {
      console.error(`MongoDB connection error: ${err.message}`);
      console.log('Retrying connection in 5 seconds...');
      setTimeout(connectToMongoDB, 5000); // 5秒后重试连接
    });
};

/**
 * 启动服务器函数
 * 在指定端口上启动Express服务器，并开始连接MongoDB
 * @returns {void}
 */
const startServer = () => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('Waiting for MongoDB connection...');
    connectToMongoDB(); // 启动MongoDB连接
  });
};

// 仅在非测试模式下启动服务器
// 测试模式下由测试框架控制服务器启动
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

// 导出应用实例，用于测试
module.exports = app;

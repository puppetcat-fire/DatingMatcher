/**
 * 更新所有用户向量脚本
 * 用于为所有用户生成向量
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') }); // 加载环境变量

// 引入依赖
const mongoose = require('mongoose');
const User = require('../models/User');
const { updateUserVector } = require('../services/vectorService');

// 连接数据库
const connectDB = async () => {
  try {
    // 使用直接的MongoDB连接字符串
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/datingmatcher';
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error('MongoDB连接失败:', err.message);
    process.exit(1);
  }
};

// 更新所有用户向量
const updateAllUserVectors = async () => {
  try {
    await connectDB();
    
    // 获取所有用户
    const users = await User.find();
    console.log(`找到 ${users.length} 个用户`);
    
    // 为每个用户更新向量
    for (const user of users) {
      try {
        console.log(`正在更新用户 ${user.username} 的向量...`);
        await updateUserVector(user._id);
        console.log(`用户 ${user.username} 的向量已更新`);
      } catch (error) {
        console.error(`更新用户 ${user.username} 的向量失败:`, error.message);
      }
    }
    
    console.log('所有用户向量已更新');
    process.exit(0);
  } catch (err) {
    console.error('更新用户向量失败:', err.message);
    process.exit(1);
  }
};

updateAllUserVectors();
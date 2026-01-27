const mongoose = require('mongoose');
const path = require('path');
const Scenario = require('./models/Scenario');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/datingmatcher')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Initial scenarios data
const scenarios = [
  {
    title: '共同生活中的家务分配',
    titleEn: 'Housework distribution in shared life',
    description: '你和伴侣需要共同承担家务，如何分配才能让双方都满意？',
    descriptionEn: 'You and your partner need to share housework. How to distribute it to satisfy both parties?',
    type: 'daily_life'
  },
  {
    title: '职业发展与家庭的平衡',
    titleEn: 'Balance between career development and family',
    description: '一方获得了外地的工作机会，另一方需要做出牺牲，你们会如何决定？',
    descriptionEn: 'One party gets a job opportunity in another city, and the other party needs to make sacrifices. How would you decide?',
    type: 'decision'
  },
  {
    title: '财务管理方式',
    titleEn: 'Financial management method',
    description: '你们计划合并财务，如何制定预算和支出规则？',
    descriptionEn: 'You plan to merge finances. How to set up budget and expenditure rules?',
    type: 'values'
  },
  {
    title: '处理与对方家庭的关系',
    titleEn: 'Handling relationships with each other\'s families',
    description: '伴侣的家人频繁干涉你们的生活，你们会如何应对？',
    descriptionEn: 'Your partner\'s family frequently interferes in your life. How would you respond?',
    type: 'conflict'
  },
  {
    title: '未来生育计划',
    titleEn: 'Future fertility plan',
    description: '你们对生育孩子的数量和时间有不同看法，如何达成共识？',
    descriptionEn: 'You have different views on the number and timing of having children. How to reach a consensus?',
    type: 'future_planning'
  },
  {
    title: '休闲时间的安排',
    titleEn: 'Arrangement of leisure time',
    description: '你喜欢安静的活动，而伴侣喜欢热闹的聚会，如何平衡？',
    descriptionEn: 'You like quiet activities, while your partner likes lively parties. How to balance?',
    type: 'daily_life'
  },
  {
    title: '面对生活中的重大挫折',
    titleEn: 'Facing major setbacks in life',
    description: '一方遭遇事业失败或健康问题，你们会如何互相支持？',
    descriptionEn: 'One party encounters career failure or health problems. How would you support each other?',
    type: 'values'
  },
  {
    title: '文化差异的处理',
    titleEn: 'Handling cultural differences',
    description: '你们来自不同的文化背景，如何尊重和融合彼此的文化习惯？',
    descriptionEn: 'You come from different cultural backgrounds. How to respect and integrate each other\'s cultural habits?',
    type: 'values'
  }
];

// Insert initial scenarios
const seedScenarios = async () => {
  try {
    // Delete existing scenarios
    await Scenario.deleteMany();
    console.log('Deleted existing scenarios');

    // Insert new scenarios
    await Scenario.insertMany(scenarios);
    console.log('Inserted initial scenarios');

    // Close connection
    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding scenarios:', error);
    mongoose.connection.close();
  }
};

seedScenarios();

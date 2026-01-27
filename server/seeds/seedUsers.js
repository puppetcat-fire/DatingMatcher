/**
 * 用户种子数据脚本
 * 用于在系统中内置几个有特色的用户
 * 包含不同年龄、性别、职业和兴趣爱好的用户
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') }); // 加载环境变量

// 引入依赖
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// 连接数据库
const connectDB = async () => {
  try {
    // 使用直接的MongoDB连接字符串，因为docker-compose.yml中配置的端口是27017
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

// 生成加密密码
const generatePassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// 问题模板 - 用于生成用户回答
const questionTemplates = [
  { questionText: '你认为什么是幸福？', category: 'values' },
  { questionText: '你周末喜欢做什么？', category: 'lifestyle' },
  { questionText: '你的职业目标是什么？', category: 'career' },
  { questionText: '你喜欢旅行吗？', category: 'interests' },
  { questionText: '你认为爱情需要经营吗？', category: 'relationship' },
  { questionText: '你想要孩子吗？', category: 'family' },
  { questionText: '你喜欢独立工作还是团队合作？', category: 'personality' },
  { questionText: '你通常几点睡觉？', category: 'lifestyle' },
  { questionText: '你重视饮食健康吗？', category: 'lifestyle' },
  { questionText: '你定期锻炼吗？', category: 'lifestyle' },
  { questionText: '你喜欢阅读吗？', category: 'interests' },
  { questionText: '你喜欢什么类型的音乐？', category: 'interests' },
  { questionText: '你认为工作与生活的平衡重要吗？', category: 'career' },
  { questionText: '你如何处理恋爱中的冲突？', category: 'relationship' },
  { questionText: '你认为婚姻是必要的吗？', category: 'family' },
  { questionText: '你多久参加一次社交活动？', category: 'social' },
  { questionText: '你做决定时更理性还是更感性？', category: 'thinking' },
  { questionText: '你需要他人的认可吗？', category: 'emotion' },
  { questionText: '你的成长经历对你有什么影响？', category: 'experience' },
  { questionText: '你对未来5年有什么规划？', category: 'future' }
];

// 生成用户回答
const generateUserAnswers = (userProfile, questionTemplates) => {
  // 根据用户资料生成个性化回答
  const answers = [];
  
  for (const template of questionTemplates) {
    let answerText = '';
    
    switch (template.questionText) {
      case '你认为什么是幸福？':
        if (userProfile.bio.includes('旅行')) {
          answerText = '幸福是和喜欢的人一起旅行，探索世界的美好。';
        } else if (userProfile.bio.includes('家庭')) {
          answerText = '幸福是有一个温馨的家庭，家人健康快乐。';
        } else if (userProfile.bio.includes('职业')) {
          answerText = '幸福是在职业上取得成功，实现自己的价值。';
        } else if (userProfile.bio.includes('艺术')) {
          answerText = '幸福是能够自由地创作，表达自己的情感。';
        } else {
          answerText = '幸福是做自己喜欢的事情，和志同道合的人在一起。';
        }
        break;
        
      case '你周末喜欢做什么？':
        if (userProfile.bio.includes('旅行')) {
          answerText = '我喜欢在周末去郊外徒步，或者计划下一次旅行。';
        } else if (userProfile.bio.includes('健身')) {
          answerText = '我会去健身房锻炼，或者在家学习新的健身技巧。';
        } else if (userProfile.bio.includes('烹饪')) {
          answerText = '我喜欢在家做饭，或者去市场购买新鲜食材。';
        } else if (userProfile.bio.includes('艺术')) {
          answerText = '我会去美术馆看展览，或者在家画画、听音乐。';
        } else {
          answerText = '我喜欢在周末放松身心，读书、看电影或者和朋友聚会。';
        }
        break;
        
      case '你的职业目标是什么？':
        if (userProfile.bio.includes('旅行博主')) {
          answerText = '我希望成为一名成功的旅行博主，分享我的旅行经历。';
        } else if (userProfile.bio.includes('产品经理')) {
          answerText = '我希望在科技行业有所建树，成为一名优秀的产品经理。';
        } else if (userProfile.bio.includes('艺术家')) {
          answerText = '我希望成为一名职业艺术家，举办自己的画展。';
        } else if (userProfile.bio.includes('冲浪教练')) {
          answerText = '我希望能够成为一名专业的冲浪教练，分享我的热爱。';
        } else {
          answerText = '我希望在自己的领域不断成长，实现自己的职业价值。';
        }
        break;
        
      case '你喜欢旅行吗？':
        if (userProfile.bio.includes('旅行')) {
          answerText = '是的，我非常喜欢旅行，已经去过很多国家和地区。';
        } else {
          answerText = '我喜欢旅行，但目前因为工作原因，旅行的机会比较少。';
        }
        break;
        
      case '你认为爱情需要经营吗？':
        answerText = '是的，我认为爱情需要双方共同经营，需要沟通、理解和包容。';
        break;
        
      case '你想要孩子吗？':
        if (userProfile.age > 30) {
          answerText = '是的，我希望在未来几年内有自己的孩子。';
        } else {
          answerText = '我还没有想好，我希望先专注于自己的事业。';
        }
        break;
        
      case '你喜欢独立工作还是团队合作？':
        if (userProfile.bio.includes('专注')) {
          answerText = '我更喜欢独立工作，这样可以更专注于自己的任务。';
        } else {
          answerText = '我喜欢团队合作，这样可以学习他人的经验，提高工作效率。';
        }
        break;
        
      case '你通常几点睡觉？':
        if (userProfile.bio.includes('专注')) {
          answerText = '我通常在晚上11点左右睡觉，保持良好的作息习惯。';
        } else {
          answerText = '我通常在晚上12点左右睡觉，有时候会更晚。';
        }
        break;
        
      case '你重视饮食健康吗？':
        answerText = '是的，我非常重视饮食健康，尽量少吃垃圾食品。';
        break;
        
      case '你定期锻炼吗？':
        if (userProfile.bio.includes('健身')) {
          answerText = '是的，我每周锻炼4-5次，保持身体健康。';
        } else {
          answerText = '我会尽量定期锻炼，但有时候因为工作原因会中断。';
        }
        break;
        
      case '你喜欢阅读吗？':
        if (userProfile.bio.includes('阅读')) {
          answerText = '是的，我非常喜欢阅读，尤其是文学和历史类书籍。';
        } else {
          answerText = '我偶尔会阅读，但阅读的时间不是很多。';
        }
        break;
        
      case '你喜欢什么类型的音乐？':
        if (userProfile.bio.includes('艺术')) {
          answerText = '我喜欢古典音乐和爵士乐，这些音乐可以让我放松身心。';
        } else {
          answerText = '我喜欢流行音乐和摇滚音乐，这些音乐很有活力。';
        }
        break;
        
      case '你认为工作与生活的平衡重要吗？':
        answerText = '是的，我认为工作与生活的平衡非常重要，这样才能保持身心健康。';
        break;
        
      case '你如何处理恋爱中的冲突？':
        answerText = '我会尽量保持冷静，与对方沟通，寻找解决问题的方法。';
        break;
        
      case '你认为婚姻是必要的吗？':
        answerText = '我认为婚姻不是必要的，但如果遇到合适的人，我会考虑结婚。';
        break;
        
      case '你多久参加一次社交活动？':
        if (userProfile.bio.includes('社交')) {
          answerText = '我每周都会参加社交活动，认识新朋友。';
        } else {
          answerText = '我偶尔参加社交活动，更喜欢独处或和亲密朋友在一起。';
        }
        break;
        
      case '你做决定时更理性还是更感性？':
        if (userProfile.bio.includes('专注')) {
          answerText = '我做决定时更理性，会考虑各种因素。';
        } else if (userProfile.bio.includes('艺术')) {
          answerText = '我做决定时更感性，会跟随自己的内心。';
        } else {
          answerText = '我会平衡理性和感性，根据不同的情况做出决定。';
        }
        break;
        
      case '你需要他人的认可吗？':
        answerText = '我会在意他人的认可，但不会因此改变自己的原则。';
        break;
        
      case '你的成长经历对你有什么影响？':
        answerText = '我的成长经历让我变得更加独立和坚强，学会了如何面对困难。';
        break;
        
      case '你对未来5年有什么规划？':
        if (userProfile.bio.includes('旅行博主')) {
          answerText = '我希望在未来5年内成为一名知名的旅行博主，出版自己的旅行书籍。';
        } else if (userProfile.bio.includes('产品经理')) {
          answerText = '我希望在未来5年内晋升为高级产品经理，负责重要的产品项目。';
        } else if (userProfile.bio.includes('艺术家')) {
          answerText = '我希望在未来5年内举办自己的个人画展，得到艺术界的认可。';
        } else {
          answerText = '我希望在未来5年内在职业上有所突破，同时保持身心健康。';
        }
        break;
        
      default:
        answerText = '这是一个很好的问题，我需要认真思考一下。';
    }
    
    answers.push({
      questionText: template.questionText,
      answerText,
      questionId: new mongoose.Types.ObjectId().toString() // 生成假的questionId
    });
  }
  
  return answers;
};

// 内置用户数据
const users = [
  {
    username: 'traveler_jane',
    email: 'jane@example.com',
    password: 'Password123!',
    profile: {
      name: 'Jane Smith',
      age: 28,
      gender: 'female',
      location: 'New York',
      bio: '热爱旅行和阅读，喜欢探索不同的文化和美食。希望找到一个志同道合的伴侣，一起看世界。',
      avatar: 'https://i.pravatar.cc/150?img=1'
    },
    isPremiumUser: true,
    answerCount: 20,
    answers: [] // 将通过generateUserAnswers函数生成
  },
  {
    username: 'career_mike',
    email: 'mike@example.com',
    password: 'Password123!',
    profile: {
      name: 'Mike Johnson',
      age: 32,
      gender: 'male',
      location: 'San Francisco',
      bio: '专注于职业发展，喜欢技术和创新。平时喜欢健身和看科技博客。',
      avatar: 'https://i.pravatar.cc/150?img=2'
    },
    isPremiumUser: false,
    answerCount: 20,
    answers: [] // 将通过generateUserAnswers函数生成
  },
  {
    username: 'family_anna',
    email: 'anna@example.com',
    password: 'Password123!',
    profile: {
      name: 'Anna Davis',
      age: 35,
      gender: 'female',
      location: 'Chicago',
      bio: '注重家庭观念，喜欢烹饪和园艺。希望找到一个稳重、有责任心的伴侣。',
      avatar: 'https://i.pravatar.cc/150?img=3'
    },
    isPremiumUser: true,
    answerCount: 20,
    answers: [] // 将通过generateUserAnswers函数生成
  },
  {
    username: 'adventurer_tom',
    email: 'tom@example.com',
    password: 'Password123!',
    profile: {
      name: 'Tom Wilson',
      age: 26,
      gender: 'male',
      location: 'Los Angeles',
      bio: '喜欢运动和冒险，热爱户外活动。平时喜欢冲浪、攀岩和露营。',
      avatar: 'https://i.pravatar.cc/150?img=4'
    },
    isPremiumUser: false,
    answerCount: 20,
    answers: [] // 将通过generateUserAnswers函数生成
  },
  {
    username: 'artist_emma',
    email: 'emma@example.com',
    password: 'Password123!',
    profile: {
      name: 'Emma Brown',
      age: 29,
      gender: 'female',
      location: 'Seattle',
      bio: '热爱艺术和创作，喜欢画画、摄影和音乐。希望找到一个有创意、懂生活的伴侣。',
      avatar: 'https://i.pravatar.cc/150?img=5'
    },
    isPremiumUser: true,
    answerCount: 20,
    answers: [] // 将通过generateUserAnswers函数生成
  }
];

// 为每个用户生成20个回答
for (let user of users) {
  user.answers = generateUserAnswers(user.profile, questionTemplates);
};

// 插入种子数据
const seedUsers = async () => {
  try {
    await connectDB();
    
    // 清空现有用户数据
    await User.deleteMany({});
    console.log('已清空现有用户数据');
    
    // 生成加密密码并插入用户
    for (const userData of users) {
      const hashedPassword = await generatePassword(userData.password);
      const user = new User({
        ...userData,
        password: hashedPassword
      });
      await user.save();
      console.log(`已创建用户: ${user.username}`);
    }
    
    console.log('所有用户种子数据已插入');
    process.exit(0);
  } catch (err) {
    console.error('插入种子数据失败:', err.message);
    process.exit(1);
  }
};

seedUsers();

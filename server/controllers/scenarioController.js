
const User = require('../models/User');
const Scenario = require('../models/Scenario');
const { cosineSimilarity, calculateComplementarity, calculateConflict } = require('../services/vectorService');
const { OpenAI } = require('openai');
const fetch = require('node-fetch');

// Node 14 环境兼容补丁
const FormData = require('form-data');
const AbortController = require('abort-controller');
const { Headers } = fetch;
global.Headers = global.Headers || Headers;
global.FormData = global.FormData || FormData;
global.AbortController = global.AbortController || AbortController;

// 初始化 OpenAI / DeepSeek 客户端 (用于聊天/模拟)
// 优先使用 DEEPSEEK_* 配置
const apiKey = process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY || 'dummy-key-for-initialization';
const baseURL = process.env.DEEPSEEK_BASE_URL || process.env.OPENAI_BASE_URL || 'https://api.deepseek.com';

const openai = new OpenAI({
  apiKey: apiKey,
  baseURL: baseURL,
  fetch: fetch
});

/**
 * 模拟两个用户之间的特定场景互动 (实时深度模拟)
 * 
 * 功能特性：
 * 1. 权限检查：仅限 Premium 用户。
 * 2. 每日限制：Premium 用户每日限 20 次模拟。
 * 3. 模型集成：使用配置的大模型 (e.g., Qwen/DeepSeek) 进行生成。
 * 4. 流式响应 (SSE)：通过 Server-Sent Events 实现打字机效果，极大降低首字延迟。
 * 5. 多语言支持：根据前端 `language` 参数 ('zh' | 'en') 自动调整 Prompt 输出语言。
 * 6. 智能回退：若 API 调用超时或失败，自动降级为本地规则生成的模拟内容。
 * 
 * 注意：
 * 此接口消耗较多 Token，用于用户点击详情后的深度体验。
 * 对于列表页的快速筛选，请参考 matchController 中的 clusterPrediction (基于预计算)。
 * 
 * @route POST /api/matches/:userId/scenario
 * @access Private (Premium Only)
 */
exports.simulateScenario = async (req, res) => {
  try {
    // 1. 检查付费会员状态
    if (!req.user.isPremiumUser) {
      return res.status(403).json({ 
        message: '此功能仅限高级会员使用',
        code: 'PREMIUM_REQUIRED'
      });
    }

    const { userId } = req.params;
    const { scenarioType, language } = req.body; // 例如: 'conflict', 'intimacy', 'travel', 'daily_life'

    if (!scenarioType) {
      return res.status(400).json({ message: 'Scenario type is required' });
    }

    // Determine output language
    const outputLang = language === 'zh' ? 'Chinese (Simplified)' : 'English';

    // 2. 获取用户信息
    const currentUser = await User.findById(req.user._id);
    const targetUser = await User.findById(userId);

    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check Daily Limit for Simulations
    const today = new Date();
    const lastDate = new Date(currentUser.lastSimulationDate);
    
    // Reset count if new day
    if (today.toDateString() !== lastDate.toDateString()) {
      currentUser.dailySimulationCount = 0;
      currentUser.lastSimulationDate = today;
    }

    const SIMULATION_LIMIT = 20; // Premium user limit
    if (currentUser.dailySimulationCount >= SIMULATION_LIMIT) {
      return res.status(429).json({ 
        message: 'Daily simulation limit reached (20/day)',
        remainingCredits: 0
      });
    }

    // 3. 准备 AI 上下文数据
    // 发送用户资料和前 10 个回答作为背景信息
    const userA = {
      name: currentUser.profile?.name || currentUser.username,
      age: currentUser.profile?.age,
      bio: currentUser.profile?.bio,
      answers: currentUser.answers.slice(0, 10).map(a => ({ // 限制为 10 个回答以节省 Token
        question: a.questionText,
        answer: a.answerText
      }))
    };

    const userB = {
      name: targetUser.profile?.name || targetUser.username,
      age: targetUser.profile?.age,
      bio: targetUser.profile?.bio,
      answers: targetUser.answers.slice(0, 10).map(a => ({
        question: a.questionText,
        answer: a.answerText
      }))
    };

    // 4. 构建提示词 (Prompt)
    const systemPrompt = `
You are a relationship simulator AI.
I will provide you with profiles of two people (User A and User B).
Your task is to simulate a realistic interaction between them based on the scenario provided.
Capture their personalities, potential conflicts, and chemistry based on their answers.

User A: ${JSON.stringify(userA)}
User B: ${JSON.stringify(userB)}

Output format:
- A short setting description.
- A dialogue script (User A vs User B).
- A concluding thought on their dynamic in this scenario.

IMPORTANT: Please generate the entire response in ${outputLang}.
`;

    let userPrompt = "";
    switch (scenarioType) {
      case 'conflict':
        userPrompt = `Simulate a disagreement between them. Pick a topic where their values might clash. Output language: ${outputLang}`;
        break;
      case 'intimacy':
        userPrompt = `Simulate a romantic or deep connection moment. Where do they find common ground? Output language: ${outputLang}`;
        break;
      case 'travel':
        userPrompt = `They are planning a 3-day trip together. Simulate the planning process or a moment during the trip. Output language: ${outputLang}`;
        break;
      case 'daily_life':
        userPrompt = `Simulate a mundane Tuesday evening after work. How do they interact regarding chores, dinner, or relaxation? Output language: ${outputLang}`;
        break;
      default:
        userPrompt = `Simulate a scenario regarding: ${scenarioType}. Output language: ${outputLang}`;
    }

    console.log(`正在为用户 ${currentUser._id} 和 ${targetUser._id} 生成场景: ${scenarioType}...`);

    // 设置 SSE 响应头
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    // 某些代理需要这个头来禁用缓冲
    res.setHeader('X-Accel-Buffering', 'no');

    // 立即发送一个初始包，测试连接是否通畅
    res.write(`data: ${JSON.stringify({ content: "Thinking...\n" })}\n\n`);

    let fullScenarioText = "";

    try {
      console.log('开始调用 OpenAI Stream API...');
      // 5. 调用 AI 接口 (流式)
      const stream = await openai.chat.completions.create({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        model: process.env.OPENAI_CHAT_MODEL || "deepseek-chat", 
        temperature: 1.3, // DeepSeek 建议温度稍高以获得更生动的对话
        stream: true, // 开启流式输出
      }, { timeout: 30000 }); // 设置 30秒 连接超时

      console.log('OpenAI Stream API 连接成功，准备接收 chunk...');

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          fullScenarioText += content;
          res.write(`data: ${JSON.stringify({ content })}\n\n`);
          // 在 Node 14 中，如果使用了某些中间件，可能需要手动 flush，但标准 express response 是 stream，通常会自动 flush
        }
      }
      console.log('OpenAI Stream API 接收完成');

      // Increment count and save after successful generation
      currentUser.dailySimulationCount += 1;
      await currentUser.save();
      
      // 发送结束信号和剩余额度
      res.write(`data: ${JSON.stringify({ 
        done: true, 
        remainingCredits: SIMULATION_LIMIT - currentUser.dailySimulationCount 
      })}\n\n`);
      res.end();

    } catch (apiError) {
      console.error('API调用失败，使用本地回退方案:', apiError.message);
      
      // 如果还没有发送任何内容，可以使用回退方案
      if (!fullScenarioText) {
         // 本地回退逻辑
        const userAName = userA.name || 'User A';
        const userBName = userB.name || 'User B';
        
        let fallbackContent = `[System Notice: AI Service is temporarily unavailable. Using local fallback simulation.]\n\n`;
        fallbackContent += `**Setting**: A simulated environment based on ${scenarioType}.\n\n`;
        fallbackContent += `**Dialogue**:\n`;
        fallbackContent += `${userAName}: "Based on our profiles, we seem to have different views on this."\n`;
        fallbackContent += `${userBName}: "Yes, but I think we can find common ground."\n`;
        fallbackContent += `${userAName}: "I appreciate your perspective."\n\n`;
        fallbackContent += `**Conclusion**:\nWhile the AI could not generate a detailed scenario, your compatibility scores suggest you would navigate this interaction constructively.`;
        
        // 模拟流式输出回退内容
        const lines = fallbackContent.split('\n');
        for (const line of lines) {
           res.write(`data: ${JSON.stringify({ content: line + '\n' })}\n\n`);
           // 稍微延迟一下模拟打字效果（可选，但在后端做延迟会阻塞，这里直接发）
        }

        // Increment count and save for fallback too
        currentUser.dailySimulationCount += 1;
        await currentUser.save();

        res.write(`data: ${JSON.stringify({ 
          done: true, 
          remainingCredits: SIMULATION_LIMIT - currentUser.dailySimulationCount 
        })}\n\n`);
        res.end();
      } else {
        // 如果已经发送了一部分但失败了，只能中断
        res.write(`data: ${JSON.stringify({ error: 'Stream interrupted' })}\n\n`);
        res.end();
      }
    }


  } catch (error) {
    console.error('场景生成失败:', error);
    res.status(500).json({ message: 'Failed to generate scenario' });
  }
};

exports.getAllScenarios = async (req, res) => {
  try {
    const scenarios = await Scenario.find();
    res.json(scenarios);
  } catch (error) {
    console.error('Error fetching scenarios:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getScenario = async (req, res) => {
  try {
    const scenario = await Scenario.findById(req.params.id);
    if (!scenario) {
      return res.status(404).json({ message: 'Scenario not found' });
    }
    res.json(scenario);
  } catch (error) {
    console.error('Error fetching scenario:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createScenario = async (req, res) => {
  try {
    const scenario = await Scenario.create(req.body);
    res.status(201).json(scenario);
  } catch (error) {
    console.error('Error creating scenario:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getScenarioMatches = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);
    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check Premium
    if (!currentUser.isPremiumUser) {
      return res.status(403).json({ 
        message: '此功能仅限高级会员使用',
        code: 'PREMIUM_REQUIRED'
      });
    }

    const scenario = await Scenario.findById(req.params.scenarioId);
    if (!scenario) {
      return res.status(404).json({ message: 'Scenario not found' });
    }

    // Get all other users
    const otherUsers = await User.find({ _id: { $ne: currentUser._id } });
    const candidates = [];

    for (const user of otherUsers) {
      if (!user.vector || user.vector.length === 0) continue;
      
      const similarityScore = cosineSimilarity(currentUser.vector, user.vector);
      const complementarityScore = calculateComplementarity(currentUser.vector, user.vector);
      const conflictScore = calculateConflict(currentUser.vector, user.vector);
      
      // Weighted score
      const compatibilityScore = (similarityScore * 0.4) + (complementarityScore * 0.4) - (conflictScore * 0.2);
      
      candidates.push({
        user,
        score: compatibilityScore
      });
    }

    // Sort by score descending and take top 3
    candidates.sort((a, b) => b.score - a.score);
    const topMatches = candidates.slice(0, 3);

    const results = [];
    
    // Generate simulation for top matches
    for (const match of topMatches) {
      let simulation = "Simulation unavailable";
      
      if (process.env.OPENAI_API_KEY) {
        try {
          const systemPrompt = `You are a relationship expert. Simulate a brief interaction (2-3 sentences) between User A and User B in the scenario: "${scenario.title}".`;
          const userPrompt = `
Scenario Description: ${scenario.description}
User A (Bio: ${currentUser.profile.bio || 'N/A'})
User B (Bio: ${match.user.profile.bio || 'N/A'})
Describe how they might interact.`;

          const completion = await openai.chat.completions.create({
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt }
            ],
            model: process.env.OPENAI_CHAT_MODEL || "qwen-turbo",
            temperature: 0.7,
            max_tokens: 150
          });
          simulation = completion.choices[0].message.content;
        } catch (e) {
          console.error(`Simulation failed for user ${match.user._id}:`, e.message);
          simulation = "AI simulation temporarily unavailable. They seem like a good match based on their profile compatibility.";
        }
      } else {
        simulation = "AI simulation requires API key. Based on compatibility scores, this user is a good match.";
      }

      results.push({
        userId: match.user._id,
        username: match.user.username,
        avatar: match.user.profile.avatar,
        compatibilityScore: parseFloat(match.score.toFixed(2)),
        simulation: simulation
      });
    }

    res.json(results);
  } catch (error) {
    console.error('Error fetching scenario matches:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

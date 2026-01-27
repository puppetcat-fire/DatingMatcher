#!/usr/bin/env python3
"""
问题批量生成脚本
用于生成600-1000道符合分类体系的问题
支持中英文双语

设计理念：
1. 深度心理洞察：通过多维度问题设计，隐性揭示用户的思维习惯（理性/感性、宏观/微观）、依赖关系（依恋风格、家庭分化）及恋爱心理特质。
2. 非冒犯性原则：问题措辞保持中立、开放，避免诱导性或评判性语言，确保用户在回答敏感话题（如金钱、性、家庭冲突）时感到安全和被尊重。
3. 全面覆盖：覆盖12个核心生活与心理维度，构建完整的用户人格画像。
"""

import json
import random
from datetime import datetime

# 问题分类体系
CATEGORIES = {
    "personality": "人格特质",
    "values": "价值观",
    "lifestyle": "生活方式",
    "interests": "兴趣爱好",
    "career": "职业规划",
    "relationship": "亲密关系",
    "family": "家庭观念",
    "social": "社交偏好",
    "thinking": "思维模式",
    "emotion": "情绪需求",
    "experience": "人生经验",
    "future": "未来展望"
}

# 问题模板 - 按分类组织
QUESTION_TEMPLATES = {
    "personality": [
        # 性格倾向
        ("你认为自己是内向型还是外向型性格？", "Do you consider yourself an introvert or extrovert?"),
        ("你通常如何处理自己的情绪？", "How do you usually handle your emotions?"),
        ("你喜欢独立工作还是团队合作？", "Do you prefer working independently or in a team?"),
        ("你是一个比较理性还是感性的人？", "Are you more rational or emotional?"),
        ("你如何描述自己的沟通风格？", "How would you describe your communication style?"),
        ("你在压力下通常表现如何？", "How do you typically perform under pressure?"),
        ("你喜欢计划还是随遇而安？", "Do you prefer planning or going with the flow?"),
        ("你是一个喜欢冒险的人吗？", "Are you an adventurous person?"),
        ("你如何处理生活中的不确定性？", "How do you handle uncertainty in life?"),
        ("你认为自己的创造力如何？", "How would you rate your creativity?"),
        # 情绪管理
        ("你如何应对愤怒情绪？", "How do you cope with anger?"),
        ("你通常需要多长时间从负面情绪中恢复？", "How long does it usually take you to recover from negative emotions?"),
        ("你会向他人倾诉你的情绪吗？", "Do you share your emotions with others?"),
        ("你通过什么方式缓解压力？", "What do you do to relieve stress?"),
        ("你认为自己的情绪稳定性如何？", "How would you rate your emotional stability?"),
        # 沟通风格
        ("你更倾向于直接还是间接的沟通方式？", "Do you prefer direct or indirect communication?"),
        ("你如何表达对他人的赞赏？", "How do you express appreciation to others?"),
        ("当你不同意他人观点时，你会如何表达？", "How do you express disagreement with others?"),
        ("你擅长倾听吗？", "Are you a good listener?"),
        ("你如何处理沟通中的误解？", "How do you handle misunderstandings in communication?"),
        # 决策方式
        ("你做决定时通常依赖什么？", "What do you typically rely on when making decisions?"),
        ("你是一个快速决策者还是谨慎决策者？", "Are you a quick decision-maker or a cautious one?"),
        ("你会考虑他人的意见吗？", "Do you consider others' opinions?"),
        ("你如何处理决策带来的后果？", "How do you handle the consequences of your decisions?"),
        ("你会为自己的决定后悔吗？", "Do you regret your decisions?"),
    ],
    "values": [
        # 人生目标
        ("你认为人生最重要的是什么？", "What do you think is the most important thing in life?"),
        ("你希望通过什么方式实现自我价值？", "How do you want to realize your self-worth?"),
        ("你如何定义成功？", "How do you define success?"),
        ("你认为幸福是什么？", "What do you think happiness is?"),
        ("你希望给世界留下什么？", "What do you hope to leave to the world?"),
        # 道德观念
        ("你认为诚实是绝对的吗？", "Do you think honesty is absolute?"),
        ("你如何看待撒谎？", "How do you view lying?"),
        ("你会为了多数人的利益牺牲少数人的利益吗？", "Would you sacrifice the interests of a few for the benefit of the majority?"),
        ("你认为什么是正义？", "What do you think justice is?"),
        ("你如何看待公平？", "How do you view fairness?"),
        # 金钱观
        ("你认为金钱的重要性如何？", "How important do you think money is?"),
        ("你会为了钱做违背原则的事吗？", "Would you do something against your principles for money?"),
        ("你如何看待消费主义？", "How do you view consumerism?"),
        ("你有储蓄习惯吗？", "Do you have saving habits?"),
        ("你如何投资你的钱？", "How do you invest your money?"),
        # 家庭观
        ("你认为家庭在生活中的地位如何？", "What role do you think family plays in life?"),
        ("你如何看待婚姻？", "How do you view marriage?"),
        ("你想要孩子吗？", "Do you want children?"),
        ("你认为父母应该如何教育孩子？", "How do you think parents should educate their children?"),
        ("你如何处理与家人的矛盾？", "How do you handle conflicts with family members?"),
    ],
    "lifestyle": [
        # 作息习惯
        ("你通常几点睡觉？", "What time do you usually go to bed?"),
        ("你通常几点起床？", "What time do you usually get up?"),
        ("你有午休习惯吗？", "Do you have a habit of taking naps?"),
        ("你周末的作息与工作日有什么不同？", "How is your weekend schedule different from weekdays?"),
        ("你认为良好的作息习惯重要吗？", "Do you think good sleep habits are important?"),
        # 饮食习惯
        ("你是素食主义者吗？", "Are you a vegetarian?"),
        ("你有饮食禁忌吗？", "Do you have any dietary restrictions?"),
        ("你喜欢在家做饭还是外出就餐？", "Do you prefer cooking at home or eating out?"),
        ("你重视饮食健康吗？", "Do you value healthy eating?"),
        ("你通常每天喝多少水？", "How much water do you usually drink per day?"),
        # 健康观念
        ("你定期锻炼吗？", "Do you exercise regularly?"),
        ("你每年进行体检吗？", "Do you have annual physical examinations?"),
        ("你如何看待心理健康？", "How do you view mental health?"),
        ("你有健康的生活习惯吗？", "Do you have healthy living habits?"),
        ("你吸烟吗？", "Do you smoke?"),
        # 消费习惯
        ("你是冲动型消费者还是理性型消费者？", "Are you an impulsive consumer or a rational one?"),
        ("你购物时更看重品牌还是性价比？", "Do you value brand or cost-effectiveness more when shopping?"),
        ("你会为了环保而改变消费习惯吗？", "Would you change your consumption habits for environmental protection?"),
        ("你有购买奢侈品的习惯吗？", "Do you have a habit of buying luxury goods?"),
        ("你如何看待分期付款？", "How do you view installment payments?"),
    ],
    "interests": [
        # 休闲活动
        ("你周末喜欢做什么？", "What do you like to do on weekends?"),
        ("你有什么爱好？", "What hobbies do you have?"),
        ("你喜欢阅读吗？", "Do you like reading?"),
        ("你喜欢看电影还是追剧？", "Do you prefer watching movies or TV series?"),
        ("你喜欢听什么类型的音乐？", "What type of music do you like to listen to?"),
        # 运动健身
        ("你喜欢什么运动？", "What sports do you like?"),
        ("你通常如何健身？", "How do you usually exercise?"),
        ("你参加过马拉松吗？", "Have you ever participated in a marathon?"),
        ("你喜欢户外运动还是室内运动？", "Do you prefer outdoor sports or indoor sports?"),
        ("你认为运动对你的生活重要吗？", "Do you think sports are important to your life?"),
        # 旅行偏好
        ("你喜欢旅行吗？", "Do you like traveling?"),
        ("你更喜欢国内旅行还是国外旅行？", "Do you prefer domestic travel or international travel?"),
        ("你喜欢独自旅行还是和他人一起旅行？", "Do you prefer traveling alone or with others?"),
        ("你旅行时喜欢自由行还是跟团游？", "Do you prefer free travel or group tours when traveling?"),
        ("你去过哪些地方旅行？", "Where have you traveled?"),
        # 艺术欣赏
        ("你喜欢什么类型的艺术？", "What type of art do you like?"),
        ("你参观过艺术展览吗？", "Have you visited art exhibitions?"),
        ("你会演奏乐器吗？", "Can you play any musical instruments?"),
        ("你喜欢绘画吗？", "Do you like painting?"),
        ("你如何看待现代艺术？", "How do you view modern art?"),
    ],
    "career": [
        # 职业目标
        ("你的职业目标是什么？", "What are your career goals?"),
        ("你希望在未来5年内达到什么职业水平？", "What career level do you hope to achieve in the next 5 years?"),
        ("你考虑过创业吗？", "Have you considered starting a business?"),
        ("你希望在什么行业发展？", "In which industry do you hope to develop?"),
        ("你如何定义职业成功？", "How do you define career success?"),
        # 工作价值观
        ("你在选择工作时最看重什么？", "What do you value most when choosing a job?"),
        ("你认为工作与生活的平衡重要吗？", "Do you think work-life balance is important?"),
        ("你如何看待加班？", "How do you view working overtime?"),
        ("你重视工作中的人际关系吗？", "Do you value interpersonal relationships at work?"),
        ("你愿意为了工作牺牲个人时间吗？", "Would you sacrifice personal time for work?"),
        # 学习意愿
        ("你有持续学习的习惯吗？", "Do you have a habit of continuous learning?"),
        ("你如何提升自己的专业技能？", "How do you improve your professional skills?"),
        ("你愿意学习新的知识和技能吗？", "Are you willing to learn new knowledge and skills?"),
        ("你参加过职业培训吗？", "Have you participated in professional training?"),
        ("你认为学历重要吗？", "Do you think academic qualifications are important?"),
    ],
    "relationship": [
        # 爱情观
        ("你如何定义爱情？", "How do you define love?"),
        ("你相信一见钟情吗？", "Do you believe in love at first sight?"),
        ("你认为爱情需要经营吗？", "Do you think love needs to be maintained?"),
        ("你认为爱情中的信任重要吗？", "Do you think trust is important in love?"),
        ("你会为了爱情牺牲什么？", "What would you sacrifice for love?"),
        # 相处模式
        ("你希望在恋爱中保持怎样的相处模式？", "What kind of relationship model do you hope to maintain in love?"),
        ("你如何表达对伴侣的爱？", "How do you express love to your partner?"),
        ("你希望伴侣在你身边扮演什么角色？", "What role do you want your partner to play by your side?"),
        ("你认为恋爱中应该保持个人空间吗？", "Do you think you should maintain personal space in a relationship?"),
        ("你如何处理恋爱中的平淡期？", "How do you handle the平淡 period in a relationship?"),
        # 冲突处理
        ("你如何处理恋爱中的冲突？", "How do you handle conflicts in a relationship?"),
        ("你会主动道歉吗？", "Would you take the initiative to apologize?"),
        ("你会冷战吗？", "Would you give the silent treatment?"),
        ("你认为吵架对恋爱关系有好处吗？", "Do you think quarreling is good for a relationship?"),
        ("你如何修复破裂的关系？", "How do you repair a broken relationship?"),
        # 信任与忠诚
        ("你如何建立对伴侣的信任？", "How do you build trust with your partner?"),
        ("你认为忠诚在恋爱中重要吗？", "Do you think loyalty is important in love?"),
        ("你会查看伴侣的手机吗？", "Would you check your partner's phone?"),
        ("你如何处理伴侣的欺骗？", "How do you handle your partner's deception?"),
        ("你认为异地恋能成功吗？", "Do you think long-distance relationships can succeed?"),
    ],
    "family": [
        # 婚姻态度
        ("你认为婚姻是必要的吗？", "Do you think marriage is necessary?"),
        ("你希望什么时候结婚？", "When do you hope to get married?"),
        ("你认为婚姻需要爱情吗？", "Do you think marriage needs love?"),
        ("你如何看待离婚？", "How do you view divorce?"),
        ("你认为婚姻应该门当户对吗？", "Do you think marriage should be between people of similar social status?"),
        # 育儿观念
        ("你想要几个孩子？", "How many children do you want?"),
        ("你认为父母应该如何教育孩子？", "How do you think parents should educate their children?"),
        ("你会全职照顾孩子吗？", "Would you take care of your children full-time?"),
        ("你重视孩子的教育吗？", "Do you value your children's education?"),
        ("你认为孩子应该从小培养什么品质？", "What qualities do you think children should develop from an early age?"),
        # 家庭角色
        ("你认为家庭中男女角色应该如何分工？", "How do you think gender roles should be divided in the family?"),
        ("你愿意承担家庭经济责任吗？", "Are you willing to take on family financial responsibilities?"),
        ("你如何看待家庭主妇/主夫？", "How do you view housewives/husbands?"),
        ("你认为家庭决策应该由谁来做？", "Who do you think should make family decisions?"),
        ("你如何处理与伴侣父母的关系？", "How do you handle relationships with your partner's parents?"),
    ],
    "social": [
        # 社交频率
        ("你多久参加一次社交活动？", "How often do you participate in social activities?"),
        ("你喜欢社交活动吗？", "Do you like social activities?"),
        ("你有多少亲密朋友？", "How many close friends do you have?"),
        ("你会主动结交新朋友吗？", "Would you take the initiative to make new friends?"),
        ("你认为社交对生活重要吗？", "Do you think socializing is important to life?"),
        # 社交场合偏好
        ("你喜欢大型聚会还是小型聚会？", "Do you prefer large gatherings or small parties?"),
        ("你喜欢安静的场合还是热闹的场合？", "Do you prefer quiet occasions or lively ones?"),
        ("你在社交场合中通常扮演什么角色？", "What role do you usually play in social situations?"),
        ("你会感到社交疲惫吗？", "Do you feel socially exhausted?"),
        ("你如何应对不喜欢的社交场合？", "How do you deal with social situations you don't like?"),
        # 交友价值观
        ("你交友时最看重什么品质？", "What qualities do you value most when making friends?"),
        ("你会与不同价值观的人成为朋友吗？", "Would you be friends with people with different values?"),
        ("你认为朋友之间应该保持联系吗？", "Do you think friends should keep in touch?"),
        ("你如何处理朋友之间的矛盾？", "How do you handle conflicts between friends?"),
        ("你会借钱给朋友吗？", "Would you lend money to friends?"),
    ],
    "thinking": [
        # 理性vs感性
        ("你做决定时更理性还是更感性？", "Are you more rational or emotional when making decisions?"),
        ("你认为理性思考重要吗？", "Do you think rational thinking is important?"),
        ("你会被情绪影响判断吗？", "Would you be influenced by emotions in your judgments?"),
        ("你如何平衡理性和感性？", "How do you balance rationality and emotion?"),
        ("你认为感性的人更容易幸福吗？", "Do you think emotional people are more likely to be happy?"),
        # 长期vs短期
        ("你做决定时更看重长期利益还是短期利益？", "Do you value long-term interests or short-term interests more when making decisions?"),
        ("你会为了长期目标牺牲短期利益吗？", "Would you sacrifice short-term interests for long-term goals?"),
        ("你有长期规划吗？", "Do you have long-term plans?"),
        ("你如何看待眼前的享乐？", "How do you view immediate pleasure?"),
        ("你认为人应该活在当下还是为未来打算？", "Do you think people should live in the present or plan for the future?"),
        # 全局vs细节
        ("你看问题时更注重全局还是细节？", "Do you focus more on the big picture or details when looking at problems?"),
        ("你认为细节决定成败吗？", "Do you think details determine success or failure?"),
        ("你擅长发现细节吗？", "Are you good at noticing details?"),
        ("你如何处理复杂问题？", "How do you handle complex problems?"),
        ("你认为全局思维重要吗？", "Do you think holistic thinking is important?"),
    ],
    "emotion": [
        # 安全感需求
        ("你在关系中需要安全感吗？", "Do you need a sense of security in relationships?"),
        ("什么能给你安全感？", "What can give you a sense of security?"),
        ("你如何建立安全感？", "How do you build a sense of security?"),
        ("你会因为缺乏安全感而焦虑吗？", "Would you feel anxious due to lack of security?"),
        ("你认为安全感来自哪里？", "Where do you think a sense of security comes from?"),
        # 认可需求
        ("你需要他人的认可吗？", "Do you need recognition from others?"),
        ("他人的评价会影响你吗？", "Would others' evaluations affect you?"),
        ("你如何看待他人的赞美？", "How do you view others' compliments?"),
        ("你会为了获得认可而改变自己吗？", "Would you change yourself to gain recognition?"),
        ("你更在意自己的感受还是他人的评价？", "Do you care more about your own feelings or others' evaluations?"),
        # 自主需求
        ("你重视个人自主权吗？", "Do you value personal autonomy?"),
        ("你喜欢被他人控制吗？", "Do you like being controlled by others?"),
        ("你如何平衡自主和依赖？", "How do you balance autonomy and dependence?"),
        ("你喜欢独自做决定吗？", "Do you like making decisions alone?"),
        ("你认为人应该独立吗？", "Do you think people should be independent?"),
    ],
    "experience": [
        # 成长经历
        ("你的成长经历对你有什么影响？", "How have your growth experiences influenced you?"),
        ("你认为童年经历重要吗？", "Do you think childhood experiences are important?"),
        ("你有什么难忘的成长经历？", "What unforgettable growth experiences do you have?"),
        ("你如何看待过去的经历？", "How do you view past experiences?"),
        ("你的成长环境如何？", "What was your growth environment like?"),
        # 重大挑战
        ("你遇到过什么重大挑战？", "What major challenges have you encountered?"),
        ("你是如何克服这些挑战的？", "How did you overcome these challenges?"),
        ("这些挑战对你有什么影响？", "What impact did these challenges have on you?"),
        ("你认为挑战对成长有好处吗？", "Do you think challenges are good for growth?"),
        ("你现在如何看待过去的挑战？", "How do you view past challenges now?"),
        # 成功经验
        ("你认为什么是成功？", "What do you think success is?"),
        ("你有过什么成功经验？", "What successful experiences have you had?"),
        ("你认为成功需要什么条件？", "What conditions do you think are needed for success?"),
        ("你如何定义自己的成功？", "How do you define your own success?"),
        ("你会为了成功牺牲什么？", "What would you sacrifice for success?"),
    ],
    "future": [
        # 5年规划
        ("你对未来5年有什么规划？", "What are your plans for the next 5 years?"),
        ("你希望在未来5年内实现什么目标？", "What goals do you hope to achieve in the next 5 years?"),
        ("你认为未来5年会发生什么变化？", "What changes do you think will happen in the next 5 years?"),
        ("你会为未来规划做准备吗？", "Would you prepare for future plans?"),
        ("你认为规划对未来重要吗？", "Do you think planning is important for the future?"),
        # 10年愿景
        ("你希望10年后的自己是什么样子？", "What do you hope to be like in 10 years?"),
        ("你对未来10年有什么期望？", "What expectations do you have for the next 10 years?"),
        ("你认为10年后的世界会是什么样子？", "What do you think the world will be like in 10 years?"),
        ("你会为了10年愿景而努力吗？", "Would you work hard for a 10-year vision?"),
        ("你认为10年愿景能实现吗？", "Do you think a 10-year vision can be achieved?"),
        # 人生理想
        ("你的人生理想是什么？", "What is your life ideal?"),
        ("你认为人生理想能实现吗？", "Do you think life ideals can be realized?"),
        ("你会为了人生理想而奋斗吗？", "Would you strive for your life ideals?"),
        ("你如何看待没有实现的人生理想？", "How do you view unfulfilled life ideals?"),
        ("你认为人生理想重要吗？", "Do you think life ideals are important?"),
    ]
}

# 问题数量配置 - 总共800道题
QUESTION_COUNT = {
    "personality": 80,
    "values": 80,
    "lifestyle": 80,
    "interests": 80,
    "career": 80,
    "relationship": 80,
    "family": 80,
    "social": 80,
    "thinking": 40,
    "emotion": 40,
    "experience": 40,
    "future": 40
}

def generate_questions():
    """生成问题"""
    questions = []
    
    for category, count in QUESTION_COUNT.items():
        print(f"生成 {count} 道 {CATEGORIES[category]} 类问题...")
        
        # 获取该分类的模板
        templates = QUESTION_TEMPLATES.get(category, [])
        
        # 如果模板不够，复制模板
        if len(templates) < count:
            # 扩展模板
            extended_templates = []
            while len(extended_templates) < count:
                extended_templates.extend(templates)
            templates = extended_templates[:count]
        else:
            templates = random.sample(templates, count)
        
        # 生成问题
        for i in range(count):
            # 从模板中选择问题
            if i < len(templates):
                zh, en = templates[i]
            else:
                # 如果模板不够，生成随机问题
                zh = f"关于{category}的问题{i+1}"
                en = f"Question {i+1} about {category}"
            
            question = {
                "text": zh,
                "textEn": en,
                "category": category,
                "createdAt": datetime.now().isoformat()
            }
            questions.append(question)
    
    # 打乱问题顺序
    random.shuffle(questions)
    return questions

def save_to_json(questions, filename="questions.json"):
    """保存问题到JSON文件"""
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(questions, f, ensure_ascii=False, indent=2)
    print(f"\n生成了 {len(questions)} 道问题，保存到 {filename}")

def main():
    """主函数"""
    print("=== 问题批量生成脚本 ===")
    print(f"将生成 {sum(QUESTION_COUNT.values())} 道问题")
    print("分类: " + ", ".join([f"{CATEGORIES[cat]}({count})" for cat, count in QUESTION_COUNT.items()]))
    
    # 生成问题
    questions = generate_questions()
    
    # 保存到JSON文件
    save_to_json(questions)
    
    print("\n=== 生成完成 ===")
    print(f"总共生成: {len(questions)} 道问题")
    print("分类统计:")
    for category in CATEGORIES:
        cat_count = len([q for q in questions if q["category"] == category])
        print(f"- {CATEGORIES[category]}: {cat_count} 道")
    
    print("\n使用说明:")
    print("1. 问题已保存到 questions.json 文件")
    print("2. 可以使用以下命令导入到MongoDB:")
    print("   mongoimport --db datingmatcher --collection questions --file questions.json --jsonArray")
    print("3. 或者使用seed脚本导入")

if __name__ == "__main__":
    main()
const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const app = require('../server');
const User = require('../models/User');
const Question = require('../models/Question');
const Scenario = require('../models/Scenario');

// Mock mongoose connect
jest.spyOn(mongoose, 'connect').mockImplementation(() => {
  return Promise.resolve();
});

// Mock JWT verify
jest.spyOn(jwt, 'verify').mockImplementation(() => {
  return {
    id: 'test-user-id'
  };
});

// Mock mongoose models
jest.spyOn(User, 'findOne').mockImplementation(() => {
  return Promise.resolve(null);
});

jest.spyOn(User, 'create').mockImplementation(() => {
  return Promise.resolve({
    _id: 'test-user-id',
    username: 'testuser',
    email: 'test@example.com',
    password: 'hashed-password',
    profile: {},
    answers: [],
    vector: [0.1, 0.2, 0.3, 0.4, 0.5],
    createdAt: new Date(),
    matchPassword: () => Promise.resolve(true)
  });
});

jest.spyOn(User, 'findById').mockImplementation(() => {
  const userObj = {
    _id: 'test-user-id',
    username: 'testuser',
    email: 'test@example.com',
    password: 'hashed-password',
    profile: {},
    answers: [],
    vector: [0.1, 0.2, 0.3, 0.4, 0.5],
    createdAt: new Date(),
    isPremiumUser: true,
    dailySimulationCount: 0,
    lastSimulationDate: new Date(),
    save: () => Promise.resolve(),
    matchPassword: () => Promise.resolve(true)
  };
  
  // Return a thenable object that also has select method
  return {
    then: function(resolve, reject) {
      resolve(userObj);
    },
    select: function() {
      // Return user object without password
      const { password, ...userWithoutPassword } = userObj;
      return Promise.resolve(userWithoutPassword);
    }
  };
});

jest.spyOn(User, 'find').mockImplementation(() => {
  return Promise.resolve([]);
});

jest.spyOn(User, 'deleteMany').mockImplementation(() => {
  return Promise.resolve({});
});

jest.spyOn(Question, 'find').mockImplementation(() => {
  return Promise.resolve([{
    _id: 'test-question-id',
    text: '你认为什么是幸福？',
    textEn: 'What do you think happiness is?',
    category: 'values',
    createdAt: new Date()
  }]);
});

jest.spyOn(Question, 'findById').mockImplementation(() => {
  return Promise.resolve({
    _id: 'test-question-id',
    text: '你认为什么是幸福？',
    textEn: 'What do you think happiness is?',
    category: 'values',
    createdAt: new Date()
  });
});

jest.spyOn(Question, 'create').mockImplementation(() => {
  return Promise.resolve({
    _id: 'test-question-id',
    text: '你认为什么是幸福？',
    textEn: 'What do you think happiness is?',
    category: 'values',
    createdAt: new Date()
  });
});

jest.spyOn(Question, 'deleteMany').mockImplementation(() => {
  return Promise.resolve({});
});

jest.spyOn(Scenario, 'find').mockImplementation(() => {
  return Promise.resolve([{
    _id: 'test-scenario-id',
    title: '共同生活',
    titleEn: 'Living Together',
    description: '评估你们在日常生活习惯、家务分工、生活节奏等方面的匹配度',
    descriptionEn: 'Evaluate your compatibility in daily habits, housework division, life rhythm, etc.',
    type: 'daily_life',
    createdAt: new Date()
  }]);
});

jest.spyOn(Scenario, 'findById').mockImplementation(() => {
  return Promise.resolve({
    _id: 'test-scenario-id',
    title: '共同生活',
    titleEn: 'Living Together',
    description: '评估你们在日常生活习惯、家务分工、生活节奏等方面的匹配度',
    descriptionEn: 'Evaluate your compatibility in daily habits, housework division, life rhythm, etc.',
    type: 'daily_life',
    createdAt: new Date()
  });
});

jest.spyOn(Scenario, 'create').mockImplementation(() => {
  return Promise.resolve({
    _id: 'test-scenario-id',
    title: '共同生活',
    titleEn: 'Living Together',
    description: '评估你们在日常生活习惯、家务分工、生活节奏等方面的匹配度',
    descriptionEn: 'Evaluate your compatibility in daily habits, housework division, life rhythm, etc.',
    type: 'daily_life',
    createdAt: new Date()
  });
});

jest.spyOn(Scenario, 'deleteMany').mockImplementation(() => {
  return Promise.resolve({});
});

// Mock OpenAI API
jest.mock('openai', () => {
  return {
    OpenAI: jest.fn().mockImplementation(() => ({
      embeddings: {
        create: jest.fn().mockResolvedValue({
          data: [{ embedding: [0.1, 0.2, 0.3, 0.4, 0.5] }]
        })
      },
      chat: {
        completions: {
          create: jest.fn().mockImplementation((args) => {
            if (args.stream) {
              return Promise.resolve({
                [Symbol.asyncIterator]: async function* () {
                  yield { choices: [{ delta: { content: 'Simulated ' } }] };
                  yield { choices: [{ delta: { content: 'scenario ' } }] };
                  yield { choices: [{ delta: { content: 'content' } }] };
                }
              });
            }
            return Promise.resolve({
              choices: [{
                message: {
                  content: 'Simulated scenario content'
                }
              }]
            });
          })
        }
      }
    }))
  };
});

// Mock environment variables
process.env.JWT_SECRET = 'test-jwt-secret';

describe('API Integration Tests', () => {
  let token = 'test-jwt-token';
  let userId;
  let questionId = 'test-question-id';
  let scenarioId = 'test-scenario-id';

  beforeAll(async () => {
    // No need to connect to real database
    // We're using mocks instead
  });

  afterAll(async () => {
    // No need to clear real database
    // We're using mocks instead
  });

  describe('Auth API', () => {
    test('should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'Password123!'
        });
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('token');
    });

    test('should login an existing user', async () => {
      // Mock User.findOne to return a user
      User.findOne.mockImplementation(() => {
        return Promise.resolve({
          _id: 'test-user-id',
          username: 'testuser',
          email: 'test@example.com',
          password: 'hashed-password',
          profile: {},
          answers: [],
          vector: [0.1, 0.2, 0.3, 0.4, 0.5],
          createdAt: new Date(),
          matchPassword: () => Promise.resolve(true)
        });
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Password123!'
        });
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
      userId = res.body.user.id;
    });

    test('should get user profile', async () => {
      const res = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('email', 'test@example.com');
    });
  });

  describe('Questions API', () => {
    test('should get all questions', async () => {
      const res = await request(app)
        .get('/api/questions')
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    test('should get a single question', async () => {
      const res = await request(app)
        .get(`/api/questions/${questionId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('_id', questionId);
    });

    test('should submit an answer', async () => {
      const res = await request(app)
        .post('/api/questions/answer')
        .set('Authorization', `Bearer ${token}`)
        .send({
          questionId: questionId,
          questionText: '你认为什么是幸福？',
          answerText: '幸福是和家人朋友在一起，做自己喜欢的事情。'
        });
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message', 'Answer submitted successfully');
    });

    test('should get user answers', async () => {
      // Mock User.findById to return user with answers
      User.findById.mockImplementation(() => {
        return Promise.resolve({
          _id: 'test-user-id',
          username: 'testuser',
          email: 'test@example.com',
          password: 'hashed-password',
          profile: {},
          answers: [{
            questionId: questionId,
            questionText: '你认为什么是幸福？',
            answerText: '幸福是和家人朋友在一起，做自己喜欢的事情。',
            createdAt: new Date()
          }],
          vector: [0.1, 0.2, 0.3, 0.4, 0.5],
          createdAt: new Date(),
          isPremiumUser: true,
          save: () => Promise.resolve(),
          matchPassword: () => Promise.resolve(true)
        });
      });

      const res = await request(app)
        .get('/api/questions/user/answers')
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  describe('Matches API', () => {
    test('should get matches', async () => {
      // Mock User.find to return another user
      User.find.mockImplementation(() => {
        return Promise.resolve([{
          _id: 'test-user-id-2',
          username: 'testuser2',
          email: 'test2@example.com',
          password: 'hashed-password',
          profile: {},
          answers: [{
            questionId: questionId,
            questionText: '你认为什么是幸福？',
            answerText: '幸福是和家人朋友在一起，做自己喜欢的事情。',
            createdAt: new Date()
          }],
          vector: [0.1, 0.2, 0.3, 0.4, 0.5],
          createdAt: new Date()
        }]);
      });

      const res = await request(app)
        .get('/api/matches')
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('Scenarios API', () => {
    test('should get all scenarios', async () => {
      const res = await request(app)
        .get('/api/scenarios')
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    test('should get a single scenario', async () => {
      const res = await request(app)
        .get(`/api/scenarios/${scenarioId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('_id', scenarioId);
    });

    test('should get scenario matches', async () => {
      // Mock User.find to return another user
      User.find.mockImplementation(() => {
        return Promise.resolve([{
          _id: 'test-user-id-2',
          username: 'testuser2',
          email: 'test2@example.com',
          password: 'hashed-password',
          profile: {},
          answers: [{
            questionId: questionId,
            questionText: '你认为什么是幸福？',
            answerText: '幸福是和家人朋友在一起，做自己喜欢的事情。',
            createdAt: new Date()
          }],
          vector: [0.1, 0.2, 0.3, 0.4, 0.5],
          createdAt: new Date()
        }]);
      });

      const res = await request(app)
        .get(`/api/scenarios/${scenarioId}/matches`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    test('should simulate scenario', async () => {
      const res = await request(app)
        .post(`/api/matches/test-user-id-2/scenario`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          scenarioType: 'travel'
        });
      
      expect(res.statusCode).toBe(200);
      expect(res.header['content-type']).toMatch(/text\/event-stream/);
      expect(res.text).toContain('Simulated');
      expect(res.text).toContain('scenario');
      expect(res.text).toContain('content');
    });
  });
});

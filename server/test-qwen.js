require('dotenv').config();
const { OpenAI } = require('openai');
const fetch = require('node-fetch');
const FormData = require('form-data');
const AbortController = require('abort-controller');
const { Headers } = fetch;
global.Headers = global.Headers || Headers;
global.FormData = global.FormData || FormData;
global.AbortController = global.AbortController || AbortController;

const apiKey = process.env.OPENAI_API_KEY;
const baseURL = process.env.OPENAI_BASE_URL;
const embeddingModel = process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-v1';

console.log('Testing Qwen (Tongyi Qianwen) API...');
console.log(`Base URL: ${baseURL}`);
console.log(`API Key: ${apiKey ? apiKey.slice(0, 8) + '...' : 'Not Set'}`);
console.log(`Embedding Model: ${embeddingModel}`);

const openai = new OpenAI({
  apiKey: apiKey,
  baseURL: baseURL,
  fetch: fetch
});

async function testQwen() {
  // Test 1: Chat Completion
  console.log('\n--- Test 1: Chat Completion ---');
  try {
    const chatCompletion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: 'Hello! Are you Qwen?' }],
      model: 'qwen-turbo', // Qwen standard chat model
    });
    console.log('Chat Success:', chatCompletion.choices[0].message.content);
  } catch (error) {
    console.error('Chat Failed:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }

  // Test 2: Embeddings
  console.log('\n--- Test 2: Embeddings (Vector Generation) ---');
  try {
    const embedding = await openai.embeddings.create({
      model: embeddingModel,
      input: 'The quick brown fox jumps over the lazy dog',
    });
    
    if (embedding.data && embedding.data.length > 0) {
      const vector = embedding.data[0].embedding;
      console.log('Embedding Success!');
      console.log(`Vector Dimensions: ${vector.length}`);
      console.log(`Sample (first 5): [${vector.slice(0, 5).join(', ')}...]`);
    } else {
      console.error('Embedding Failed: No data returned');
    }
  } catch (error) {
    console.error('Embedding Failed:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testQwen();

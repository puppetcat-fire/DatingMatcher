
require('dotenv').config();
const { OpenAI } = require('openai');
const fetch = require('node-fetch');
// Polyfills for Node 14
const FormData = require('form-data');
const AbortController = require('abort-controller');
const { Headers } = fetch;
global.Headers = global.Headers || Headers;
global.FormData = global.FormData || FormData;
global.AbortController = global.AbortController || AbortController;

// Init OpenAI/Qwen Client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL,
  fetch: fetch
});

// Mock User Profiles (Simulating data from DB)
const userA = {
  name: "Alex",
  bio: "I love hiking, early mornings, and strict planning. I save 50% of my income.",
  answers: [
    { question: "What is your ideal weekend?", answer: "Wake up at 6am, go for a 10km run, then organize my week." },
    { question: "How do you handle money?", answer: "I am very frugal. I track every penny." }
  ]
};

const userB = {
  name: "Sam",
  bio: "Night owl, love video games and spontaneous trips. Money is for enjoying life.",
  answers: [
    { question: "What is your ideal weekend?", answer: "Sleep until noon, order pizza, and play games all night." },
    { question: "How do you handle money?", answer: "I spend what I earn. Life is short!" }
  ]
};

async function simulateScenario(scenarioType) {
  console.log(`\n--- Simulating Scenario: ${scenarioType} ---`);
  
  const systemPrompt = `
You are a relationship simulator AI.
I will provide you with profiles of two people (User A and User B).
Your task is to simulate a realistic interaction between them based on the scenario provided.
Capture their personalities, potential conflicts, and chemistry.

User A: ${JSON.stringify(userA)}
User B: ${JSON.stringify(userB)}
`;

  let userPrompt = "";
  if (scenarioType === "conflict") {
    userPrompt = "Simulate a disagreement between them about planning a vacation. Alex wants a budget hiking trip, Sam wants a luxury resort. Write a short dialogue.";
  } else if (scenarioType === "intimacy") {
    userPrompt = "Simulate a romantic moment where they find common ground despite their differences. Write a short dialogue.";
  }

  try {
    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      model: "qwen-turbo", // Using Qwen for chat
    });

    console.log(completion.choices[0].message.content);
  } catch (error) {
    console.error("Simulation failed:", error.message);
  }
}

async function run() {
  await simulateScenario("conflict");
  await simulateScenario("intimacy");
}

run();

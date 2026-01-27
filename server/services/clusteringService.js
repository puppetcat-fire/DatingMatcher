const mongoose = require('mongoose');
const { OpenAI } = require('openai');
const fetch = require('node-fetch');
const User = require('../models/User');
const Cluster = require('../models/Cluster');
const ClusterInteraction = require('../models/ClusterInteraction');
const { cosineSimilarity } = require('./vectorService');

/**
 * 聚类与预计算服务
 * 
 * 功能：
 * 1. 执行K-Means算法将用户划分为不同的群体（Cluster）
 * 2. 使用大模型生成每个群体的画像（Summary）
 * 3. 预计算群体两两之间的互动结果（Conflict, Intimacy等场景）
 * 
 * 目的：
 * 解决 N^2 匹配成本过高的问题。通过预计算群体互动，在实时匹配时直接查表，
 * 无需实时调用大模型进行模拟，大幅降低 Token 消耗并提升响应速度。
 */

// Polyfills
const FormData = require('form-data');
const AbortController = require('abort-controller');
const { Headers } = fetch;
global.Headers = global.Headers || Headers;
global.FormData = global.FormData || FormData;
global.AbortController = global.AbortController || AbortController;

// Initialize OpenAI (Using DeepSeek for Analysis)
const apiKey = process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY;
const baseURL = process.env.DEEPSEEK_BASE_URL || process.env.OPENAI_BASE_URL || 'https://api.deepseek.com';

const openai = new OpenAI({
  apiKey: apiKey,
  baseURL: baseURL,
  fetch: fetch
});

/**
 * Calculate Euclidean Distance between two vectors
 * 计算两个向量之间的欧几里得距离
 */
function euclideanDistance(vecA, vecB) {
  let sum = 0;
  for (let i = 0; i < vecA.length; i++) {
    sum += Math.pow(vecA[i] - vecB[i], 2);
  }
  return Math.sqrt(sum);
}

/**
 * Calculate average vector of a list of vectors
 * 计算向量列表的中心点（平均向量）
 */
function calculateCentroid(vectors) {
  if (vectors.length === 0) return [];
  const dim = vectors[0].length;
  const centroid = new Array(dim).fill(0);
  
  for (const vec of vectors) {
    for (let i = 0; i < dim; i++) {
      centroid[i] += vec[i];
    }
  }
  
  for (let i = 0; i < dim; i++) {
    centroid[i] /= vectors.length;
  }
  
  return centroid;
}

/**
 * Perform K-Means Clustering on Users
 * 执行 K-Means 聚类算法
 * @param {number} k - Number of clusters (聚类数量，默认为5)
 */
exports.performClustering = async (k = 5) => {
  console.log('Starting Clustering Process...');
  
  // 1. Fetch all users with vectors
  // 获取所有拥有有效向量的用户
  
  if (users.length < k) {
    console.warn(`Not enough users (${users.length}) for ${k} clusters.`);
    return;
  }

  // 2. Initialize Centroids (Randomly pick k users)
  let centroids = [];
  const shuffled = users.sort(() => 0.5 - Math.random());
  for (let i = 0; i < k; i++) {
    centroids.push(shuffled[i].vector);
  }

  let clusters = [];
  let userAssignments = {};

  // 3. K-Means Loop
  const MAX_ITER = 10;
  for (let iter = 0; iter < MAX_ITER; iter++) {
    console.log(`Clustering Iteration ${iter + 1}/${MAX_ITER}`);
    clusters = Array.from({ length: k }, () => []);
    let changes = 0;

    // Assignment Step
    for (const user of users) {
      let minDist = Infinity;
      let clusterIdx = -1;

      for (let i = 0; i < k; i++) {
        const dist = euclideanDistance(user.vector, centroids[i]);
        if (dist < minDist) {
          minDist = dist;
          clusterIdx = i;
        }
      }

      clusters[clusterIdx].push(user);
      
      if (userAssignments[user._id] !== clusterIdx) {
        userAssignments[user._id] = clusterIdx;
        changes++;
      }
    }

    // Update Step
    const newCentroids = [];
    for (let i = 0; i < k; i++) {
      if (clusters[i].length > 0) {
        const vectors = clusters[i].map(u => u.vector);
        newCentroids.push(calculateCentroid(vectors));
      } else {
        // Handle empty cluster by keeping old centroid or re-initializing
        newCentroids.push(centroids[i]); 
      }
    }

    centroids = newCentroids;

    if (changes === 0) {
      console.log('Clustering converged.');
      break;
    }
  }

  // 4. Save Clusters to DB
  console.log('Saving clusters to DB...');
  await Cluster.deleteMany({}); // Clear old clusters
  
  const savedClusters = [];
  for (let i = 0; i < k; i++) {
    if (clusters[i].length === 0) continue;

    const cluster = await Cluster.create({
      centroid: centroids[i],
      users: clusters[i].map(u => u._id)
    });
    savedClusters.push(cluster);

    // Update Users
    await User.updateMany(
      { _id: { $in: clusters[i].map(u => u._id) } },
      { $set: { clusterId: cluster._id } }
    );
  }

  console.log(`Clustering complete. Created ${savedClusters.length} clusters.`);
  
  // 5. Trigger Post-Processing
  await exports.generateClusterSummaries(savedClusters);
  await exports.generateClusterInteractions(savedClusters);
};

/**
 * Generate Summaries for Clusters using LLM
 */
exports.generateClusterSummaries = async (clusters) => {
  console.log('Generating Cluster Summaries...');
  
  for (const cluster of clusters) {
    // Get sample users (up to 3)
    const sampleUserIds = cluster.users.slice(0, 3);
    const sampleUsers = await User.find({ _id: { $in: sampleUserIds } });
    
    if (sampleUsers.length === 0) continue;

    const profiles = sampleUsers.map(u => JSON.stringify(u.profile || {}) + " " + u.answers.map(a=>a.answerText).join(" ")).join("\n---\n");

    try {
      const response = await openai.chat.completions.create({
        model: process.env.DEEPSEEK_CHAT_MODEL || process.env.OPENAI_CHAT_MODEL || "deepseek-chat", // or appropriate model
        messages: [
          { role: "system", content: "You are a psychologist analyzing a group of people. Summarize the common personality traits, values, and lifestyle of this group in one paragraph (Chinese)." },
          { role: "user", content: `Here are profiles of users in this cluster:\n${profiles}` }
        ]
      });

      const summary = response.choices[0].message.content;
      cluster.summary = summary;
      await cluster.save();
      console.log(`Cluster ${cluster._id} summary generated.`);
    } catch (err) {
      console.error(`Failed to generate summary for cluster ${cluster._id}:`, err.message);
    }
  }
};

/**
 * Generate Interactions between Clusters
 */
exports.generateClusterInteractions = async (clusters) => {
  console.log('Generating Cluster Interactions...');
  await ClusterInteraction.deleteMany({}); // Clear old interactions

  const scenarios = ['conflict', 'intimacy', 'travel', 'daily_life'];

  for (let i = 0; i < clusters.length; i++) {
    for (let j = i; j < clusters.length; j++) { // Includes self-interaction? Maybe not useful for dating, but ok for logic.
      const cA = clusters[i];
      const cB = clusters[j];

      // Skip if no summary
      if (!cA.summary || !cB.summary) continue;

      for (const scenario of scenarios) {
        try {
          const prompt = `
            Analyze the compatibility of two groups of people based on their summaries in a '${scenario}' scenario.
            
            Group A: ${cA.summary}
            Group B: ${cB.summary}
            
            Provide a JSON response with:
            - matchScore (0-100)
            - complementarityScore (0-100)
            - conflictScore (0-100)
            - analysis (Short summary)
          `;

          const response = await openai.chat.completions.create({
            model: process.env.DEEPSEEK_CHAT_MODEL || process.env.OPENAI_CHAT_MODEL || "deepseek-chat",
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" }
          });

          const result = JSON.parse(response.choices[0].message.content);

          await ClusterInteraction.create({
            clusterA: cA._id,
            clusterB: cB._id,
            scenario,
            matchScore: result.matchScore,
            complementarityScore: result.complementarityScore,
            conflictScore: result.conflictScore,
            analysis: result.analysis
          });

          // If i != j, create reverse entry or handle query logic to look up both ways. 
          // For simplicity, we query { $or: [ {clusterA: id1, clusterB: id2}, {clusterA: id2, clusterB: id1} ] }
          
        } catch (err) {
          console.error(`Failed interaction ${cA._id} vs ${cB._id} for ${scenario}:`, err.message);
        }
      }
    }
  }
  console.log('Cluster Interactions generated.');
};

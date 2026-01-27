import { Match, MatchDetail } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * 获取当前用户的匹配列表
 * @param token 用户认证令牌
 * @returns 匹配用户列表
 */
export const getMatches = async (token: string): Promise<Match[]> => {
  const response = await fetch(`${API_URL}/matches`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to get matches');
  }

  return response.json();
};

/**
 * 获取特定用户的匹配详情
 * 包含相似度、互补度、冲突度等详细分析
 * @param token 用户认证令牌
 * @param userId 目标用户ID
 * @returns 匹配详情对象
 */
export const getMatchDetails = async (token: string, userId: string): Promise<MatchDetail> => {
  const response = await fetch(`${API_URL}/matches/${userId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to get match details');
  }

  return response.json();
};

/**
 * 创建新的匹配记录
 * 通常在用户完成答题或主动发起匹配时调用
 * @param token 用户认证令牌
 * @param userId 目标用户ID
 * @returns 新创建的匹配记录
 */
export const createMatch = async (token: string, userId: string): Promise<MatchDetail> => {
  const response = await fetch(`${API_URL}/matches`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ userId }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to create match');
  }

  return response.json();
};

/**
 * [Premium] 生成 AI 场景模拟 (流式)
 * 调用后端 API 基于双方画像生成特定场景的互动剧本
 * @param token 用户认证令牌
 * @param userId 目标用户ID
 * @param scenarioType 场景类型 (conflict | intimacy | travel | daily_life)
 * @param language 输出语言 (e.g., 'zh', 'en')
 * @param onChunk 接收数据块的回调函数
 * @param onDone 完成时的回调函数
 */
export const simulateScenarioStream = async (
  token: string, 
  userId: string, 
  scenarioType: string,
  language: string,
  onChunk: (content: string) => void,
  onDone: (remainingCredits: number) => void,
  onError: (error: string) => void
): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/matches/${userId}/scenario`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ scenarioType, language }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to generate scenario');
    }

    if (!response.body) {
      throw new Error('No response body');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    console.log('Stream connection established, starting to read...');

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        console.log('Stream reading completed');
        break;
      }

      const chunk = decoder.decode(value, { stream: true });
      console.log('Received chunk:', chunk); // Debug log

      const lines = chunk.split('\n');
      
      for (const line of lines) {
        // 去除空白字符
        const trimmedLine = line.trim();
        if (!trimmedLine || !trimmedLine.startsWith('data: ')) continue;

        try {
          const dataStr = trimmedLine.slice(6);
          if (dataStr === '[DONE]') continue;

          const data = JSON.parse(dataStr);
          
          if (data.content) {
            onChunk(data.content);
          }
          
          if (data.done) {
            onDone(data.remainingCredits);
          }
          
          if (data.error) {
            onError(data.error);
          }
        } catch (e) {
          console.error('Error parsing SSE data:', e, 'Line:', trimmedLine);
        }
      }
    }
  } catch (error) {
    onError(error instanceof Error ? error.message : 'Unknown error');
  }
};


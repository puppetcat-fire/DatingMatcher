import { Question, Answer } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const getQuestions = async (token: string): Promise<Question[]> => {
  const response = await fetch(`${API_URL}/questions`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to get questions');
  }

  return response.json();
};

export const getQuestion = async (token: string, questionId: string): Promise<Question> => {
  const response = await fetch(`${API_URL}/questions/${questionId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to get question');
  }

  return response.json();
};

export const submitAnswer = async (
  token: string,
  questionId: string,
  questionText: string,
  answerText: string
): Promise<Answer[]> => {
  const response = await fetch(`${API_URL}/questions/answer`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ questionId, questionText, answerText }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to submit answer');
  }

  return response.json();
};

export const getUserAnswers = async (token: string): Promise<Answer[]> => {
  const response = await fetch(`${API_URL}/questions/user/answers`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to get user answers');
  }

  return response.json();
};

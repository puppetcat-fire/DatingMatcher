import { User } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const register = async (username: string, email: string, password: string): Promise<{ user: User; token: string }> => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, email, password }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Registration failed');
  }

  return response.json();
};

export const login = async (email: string, password: string): Promise<{ user: User; token: string }> => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Login failed');
  }

  return response.json();
};

export const getProfile = async (token: string): Promise<User> => {
  const response = await fetch(`${API_URL}/auth/profile`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to get profile');
  }

  return response.json();
};

export const updateProfile = async (token: string, profile: User['profile']): Promise<User> => {
  const response = await fetch(`${API_URL}/auth/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(profile),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to update profile');
  }

  return response.json();
};

export const getAnswerStats = async (
  token: string
): Promise<{
  dailyAnswerCount: number;
  remainingFreeAnswers: number;
  lastAnswerDate: string;
  isPremiumUser: boolean;
  totalAnswerCount: number;
}> => {
  const response = await fetch(`${API_URL}/auth/answer-stats`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to get answer stats');
  }

  return response.json();
};

export const upgradeToPremium = async (
  token: string
): Promise<{ message: string; isPremiumUser: boolean }> => {
  const response = await fetch(`${API_URL}/auth/upgrade`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to upgrade to premium');
  }

  return response.json();
};

export const downgradeToFree = async (
  token: string
): Promise<{ message: string; isPremiumUser: boolean }> => {
  const response = await fetch(`${API_URL}/auth/downgrade`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to downgrade to free');
  }

  return response.json();
};

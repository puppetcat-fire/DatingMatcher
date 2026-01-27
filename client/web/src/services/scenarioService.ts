import { Scenario, ScenarioMatch } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const getScenarios = async (token: string): Promise<Scenario[]> => {
  const response = await fetch(`${API_URL}/scenarios`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to get scenarios');
  }

  return response.json();
};

export const getScenario = async (token: string, scenarioId: string): Promise<Scenario> => {
  const response = await fetch(`${API_URL}/scenarios/${scenarioId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to get scenario');
  }

  return response.json();
};

export const getScenarioMatches = async (token: string, scenarioId: string): Promise<ScenarioMatch[]> => {
  const response = await fetch(`${API_URL}/scenarios/${scenarioId}/matches`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to get scenario matches');
  }

  return response.json();
};

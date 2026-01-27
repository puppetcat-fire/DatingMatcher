import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// Mock i18next for testing
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: vi.fn(),
      language: 'en'
    }
  }),
  initReactI18next: {
    type: '3rdParty',
    init: vi.fn()
  }
}));

// Mock any other global dependencies as needed

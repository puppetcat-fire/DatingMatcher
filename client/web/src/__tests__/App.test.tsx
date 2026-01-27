import { describe, test, expect } from 'vitest';
import { render } from '@testing-library/react';
import App from '../App';

describe('App Component', () => {
  test('should render successfully', () => {
    const { container } = render(<App />);
    expect(container).toBeTruthy();
  });
});

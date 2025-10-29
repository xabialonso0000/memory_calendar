import { render, screen } from '@testing-library/react';
import App from './App';

test('renders diary and schedule titles', () => {
  render(<App />);
  const diaryTitle = screen.getByText(/My Diary/i);
  const scheduleTitle = screen.getByText(/My Schedule/i);
  expect(diaryTitle).toBeInTheDocument();
  expect(scheduleTitle).toBeInTheDocument();
});

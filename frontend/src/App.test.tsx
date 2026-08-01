import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock('react-quill', () => {
  return { __esModule: true, default: function MockQuill() { return <div data-testid="editor" />; } };
});

jest.mock('./ScheduleCalendar', () => {
  return { __esModule: true, default: function MockCalendar() { return <div data-testid="schedule-calendar" />; } };
});

beforeEach(() => {
  global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => [] });
});

afterEach(() => jest.restoreAllMocks());

test('現行画面の日記とスケジュールを表示する', async () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: '日記・スケジュール' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'スケジュール' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: '日記一覧' })).toBeInTheDocument();
  expect(screen.getByTestId('schedule-calendar')).toBeInTheDocument();
  expect(await screen.findByText('新しい日記')).toBeInTheDocument();
});

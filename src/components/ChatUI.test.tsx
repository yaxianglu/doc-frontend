import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../services/chatApi', () => ({
  sendChat: vi.fn()
}));

vi.mock('../services/streamWriter', () => ({
  simulateStream: (text: string, options: { onChunk: (chunk: string) => void; onDone?: () => void }) => {
    options.onChunk(text);
    options.onDone?.();
    return { cancel: vi.fn() };
  }
}));

import App from '../App';
import { sendChat } from '../services/chatApi';
import { useChatStore } from '../store/chatStore';

function resetStore() {
  useChatStore.setState(useChatStore.getInitialState(), true);
}

describe('Chat UI', () => {
  beforeEach(() => {
    localStorage.clear();
    resetStore();
    vi.clearAllMocks();
  });

  it('sends message and renders assistant answer with evidence', async () => {
    vi.mocked(sendChat).mockResolvedValue({
      answer: '这是回答',
      mode: 'data_query',
      data: { total: 10 },
      evidence: { sql: 'SELECT COUNT(*)' }
    });

    render(<App />);

    const input = screen.getByPlaceholderText('输入你的问题...');
    await userEvent.type(input, '2026年以来发生了多少预警信息？');
    await userEvent.keyboard('{Enter}');

    await waitFor(() => {
      expect(screen.getByText('这是回答')).toBeInTheDocument();
    });

    expect(screen.getByText(/data_query/)).toBeInTheDocument();
    expect(screen.getByText(/SELECT COUNT\(\*\)/)).toBeInTheDocument();
  });

  it('disables send button while pending', async () => {
    vi.mocked(sendChat).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ answer: 'ok', mode: 'unknown', data: null, evidence: null }), 60))
    );

    render(<App />);

    const input = screen.getByPlaceholderText('输入你的问题...');
    await userEvent.type(input, 'hello');
    const button = screen.getByRole('button', { name: '发送' });
    await userEvent.click(button);

    expect(button).toBeDisabled();
  });

  it('supports Enter send and Shift+Enter newline', async () => {
    vi.mocked(sendChat).mockResolvedValue({ answer: 'ok', mode: 'unknown', data: null, evidence: null });

    render(<App />);

    const input = screen.getByPlaceholderText('输入你的问题...');

    fireEvent.keyDown(input, { key: 'Enter', shiftKey: true });
    await userEvent.type(input, 'line1');
    await userEvent.keyboard('{Shift>}{Enter}{/Shift}');
    await userEvent.type(input, 'line2');
    expect((input as HTMLTextAreaElement).value).toContain('line2');

    await userEvent.keyboard('{Enter}');

    await waitFor(() => {
      expect(screen.getByText('ok')).toBeInTheDocument();
    });
  });
});

import { act, renderHook, waitFor } from '@testing-library/react';
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

import { useChatActions } from './useChatActions';
import { sendChat } from '../services/chatApi';
import { useChatStore } from '../store/chatStore';

function resetStore() {
  useChatStore.setState(useChatStore.getInitialState(), true);
}

describe('useChatActions', () => {
  beforeEach(() => {
    localStorage.clear();
    resetStore();
    vi.clearAllMocks();
  });

  it('creates session, adds user+assistant, and stores evidence on success', async () => {
    vi.mocked(sendChat).mockResolvedValue({
      answer: '回答A',
      mode: 'advice',
      data: { tags: ['wind'] },
      evidence: { refs: ['doc'] }
    });

    const { result } = renderHook(() => useChatActions());

    await act(async () => {
      await result.current.sendQuestion('台风后怎么处理？');
    });

    const state = useChatStore.getState();
    expect(state.sessions).toHaveLength(1);
    expect(state.sessions[0].messages).toHaveLength(2);
    expect(state.sessions[0].messages[1].meta?.mode).toBe('advice');
    expect(result.current.isSending).toBe(false);
  });

  it('marks assistant message as error on failure', async () => {
    vi.mocked(sendChat).mockRejectedValue(new Error('网络异常'));

    const { result } = renderHook(() => useChatActions());

    await act(async () => {
      await result.current.sendQuestion('会失败的问题');
    });

    const state = useChatStore.getState();
    const assistant = state.sessions[0].messages[1];
    expect(assistant.status).toBe('error');
    expect(assistant.content).toContain('网络异常');
    expect(result.current.error).toContain('网络异常');
  });

  it('retries from a user message', async () => {
    vi.mocked(sendChat).mockResolvedValue({
      answer: 'ok',
      mode: 'unknown',
      data: null,
      evidence: null
    });

    const sid = useChatStore.getState().createSession('重试会话');
    const userMsgId = useChatStore.getState().addMessage(sid, {
      role: 'user',
      content: '再次尝试',
      status: 'done'
    });

    const userMessage = useChatStore
      .getState()
      .sessions.find((session) => session.id === sid)!
      .messages.find((message) => message.id === userMsgId)!;

    const { result } = renderHook(() => useChatActions());

    await act(async () => {
      await result.current.retryForMessage(sid, userMessage);
    });

    await waitFor(() => {
      expect(useChatStore.getState().sessions[0].messages.length).toBeGreaterThan(1);
    });
  });
});

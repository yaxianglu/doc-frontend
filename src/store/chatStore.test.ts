import { beforeEach, describe, expect, it } from 'vitest';
import { useChatStore } from './chatStore';

function resetStore() {
  useChatStore.setState(useChatStore.getInitialState(), true);
}

describe('chatStore', () => {
  beforeEach(() => {
    localStorage.clear();
    resetStore();
  });

  it('creates and switches sessions', () => {
    const first = useChatStore.getState().createSession('第一个会话');
    const second = useChatStore.getState().createSession('第二个会话');

    expect(useChatStore.getState().sessions).toHaveLength(2);
    expect(useChatStore.getState().activeSessionId).toBe(second);

    useChatStore.getState().switchSession(first);
    expect(useChatStore.getState().activeSessionId).toBe(first);
  });

  it('appends user and assistant messages', () => {
    const sid = useChatStore.getState().createSession('问答');

    const userMessageId = useChatStore.getState().addMessage(sid, {
      role: 'user',
      content: '你好',
      status: 'done'
    });

    const assistantId = useChatStore.getState().addMessage(sid, {
      role: 'assistant',
      content: '',
      status: 'streaming'
    });

    useChatStore.getState().updateMessage(sid, assistantId, {
      content: '结论',
      status: 'done',
      meta: {
        mode: 'data_query',
        data: { total: 1 },
        evidence: { source: 'sql' }
      }
    });

    const session = useChatStore.getState().sessions.find((s) => s.id === sid)!;
    expect(session.messages.map((m) => m.id)).toEqual([userMessageId, assistantId]);
    expect(session.messages[1].content).toBe('结论');
    expect(session.messages[1].meta?.mode).toBe('data_query');
  });

  it('persists and restores sessions', () => {
    const sid = useChatStore.getState().createSession('持久化');
    useChatStore.getState().addMessage(sid, {
      role: 'user',
      content: '保存',
      status: 'done'
    });

    useChatStore.persist.rehydrate();

    expect(useChatStore.getState().sessions[0]?.title).toBe('持久化');
    expect(useChatStore.getState().sessions[0]?.messages[0]?.content).toBe('保存');
  });
});

import { describe, expect, it, vi, afterEach } from 'vitest';
import { sendChat } from './chatApi';

describe('sendChat', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('posts question payload and maps response', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          answer: '结论内容',
          mode: 'data_query',
          data: { total: 42 },
          evidence: { sql_template: 'SELECT ...' }
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    );

    const result = await sendChat('测试问题');

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/chat',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: '测试问题' })
      })
    );

    expect(result).toEqual({
      answer: '结论内容',
      mode: 'data_query',
      data: { total: 42 },
      evidence: { sql_template: 'SELECT ...' }
    });
  });

  it('throws timeout error when aborted', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new DOMException('timeout', 'AbortError'));

    await expect(sendChat('超时测试')).rejects.toThrow('请求超时');
  });

  it('throws api error on non-2xx response', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ error: 'question is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    );

    await expect(sendChat('')).rejects.toThrow('question is required');
  });
});

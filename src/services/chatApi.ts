import type { ChatResponse, ChatApiErrorPayload } from '../types/chat';

const DEFAULT_TIMEOUT_MS = 30000;

function extractError(payload: unknown): string {
  if (payload && typeof payload === 'object' && 'error' in payload) {
    const candidate = (payload as ChatApiErrorPayload).error;
    if (candidate) {
      return candidate;
    }
  }
  return '请求失败，请稍后重试';
}

export async function sendChat(question: string, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<ChatResponse> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
      signal: controller.signal
    });

    const json = (await response.json()) as unknown;

    if (!response.ok) {
      throw new Error(extractError(json));
    }

    if (!json || typeof json !== 'object') {
      throw new Error('响应格式不正确');
    }

    const parsed = json as Partial<ChatResponse>;
    return {
      answer: typeof parsed.answer === 'string' ? parsed.answer : '',
      mode: typeof parsed.mode === 'string' ? parsed.mode : 'unknown',
      data: parsed.data ?? null,
      evidence: parsed.evidence ?? null
    };
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('请求超时，请稍后重试');
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('未知错误');
  } finally {
    clearTimeout(timer);
  }
}

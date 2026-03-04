import { describe, expect, it, vi } from 'vitest';
import { simulateStream } from './streamWriter';

describe('simulateStream', () => {
  it('writes text in chunks and completes', async () => {
    vi.useFakeTimers();
    const chunks: string[] = [];
    const done = vi.fn();

    simulateStream('abcdef', {
      chunkSize: 2,
      intervalMs: 20,
      onChunk: (chunk) => chunks.push(chunk),
      onDone: done
    });

    await vi.advanceTimersByTimeAsync(60);

    expect(chunks).toEqual(['ab', 'cd', 'ef']);
    expect(done).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it('can be cancelled', async () => {
    vi.useFakeTimers();
    const chunks: string[] = [];
    const done = vi.fn();

    const control = simulateStream('abcdef', {
      chunkSize: 1,
      intervalMs: 10,
      onChunk: (chunk) => chunks.push(chunk),
      onDone: done
    });

    await vi.advanceTimersByTimeAsync(25);
    control.cancel();
    await vi.advanceTimersByTimeAsync(100);

    expect(chunks.length).toBeLessThan(6);
    expect(done).not.toHaveBeenCalled();
    vi.useRealTimers();
  });
});

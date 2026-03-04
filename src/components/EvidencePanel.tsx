import type { Message } from '../types/chat';

interface EvidencePanelProps {
  message: Message | null;
}

function toPrettyJson(input: unknown): string {
  if (input === null || input === undefined) return 'null';
  if (typeof input === 'string') return input;
  try {
    return JSON.stringify(input, null, 2);
  } catch {
    return String(input);
  }
}

export function EvidencePanel({ message }: EvidencePanelProps) {
  return (
    <aside className="evidence-panel">
      <h3>证据视图</h3>
      {message?.meta ? (
        <>
          <p>
            <strong>mode:</strong> {message.meta.mode ?? 'unknown'}
          </p>
          <pre>{toPrettyJson(message.meta.data)}</pre>
          <pre>{toPrettyJson(message.meta.evidence)}</pre>
        </>
      ) : (
        <p>暂无证据数据</p>
      )}
    </aside>
  );
}

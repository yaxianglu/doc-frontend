import type { Message, Session } from '../types/chat';

interface ChatPanelProps {
  session: Session | null;
  error: string | null;
  onRetry: (message: Message) => Promise<void>;
}

function findPreviousUserMessage(messages: Message[], index: number): Message | null {
  for (let i = index - 1; i >= 0; i -= 1) {
    if (messages[i].role === 'user') {
      return messages[i];
    }
  }
  return null;
}

export function ChatPanel({ session, error, onRetry }: ChatPanelProps) {
  if (!session) {
    return (
      <section className="chat-panel empty">
        <h2>Doc Cloud Chat</h2>
        <p>从左侧创建会话后开始提问</p>
      </section>
    );
  }

  return (
    <section className="chat-panel">
      <div className="messages" aria-label="消息列表">
        {session.messages.map((message, index) => {
          const retryMessage = message.status === 'error' ? findPreviousUserMessage(session.messages, index) : null;

          return (
            <article key={message.id} className={`message ${message.role}`}>
              <header>{message.role === 'user' ? '你' : '助手'}</header>
              <p>{message.content || (message.status === 'streaming' ? '...' : '')}</p>
              {message.status === 'error' && retryMessage ? (
                <button className="retry" onClick={() => onRetry(retryMessage)}>
                  重试
                </button>
              ) : null}
            </article>
          );
        })}
      </div>
      {error ? <p className="error-tip">{error}</p> : null}
    </section>
  );
}

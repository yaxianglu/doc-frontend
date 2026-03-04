import type { Session } from '../types/chat';

interface SessionSidebarProps {
  sessions: Session[];
  activeSessionId: string | null;
  onCreateSession: () => void;
  onSwitchSession: (sessionId: string) => void;
}

export function SessionSidebar({ sessions, activeSessionId, onCreateSession, onSwitchSession }: SessionSidebarProps) {
  return (
    <aside className="sidebar">
      <button className="new-chat" onClick={onCreateSession}>
        + 新建会话
      </button>
      <div className="session-list" aria-label="会话列表">
        {sessions.map((session) => (
          <button
            key={session.id}
            className={`session-item ${session.id === activeSessionId ? 'active' : ''}`}
            onClick={() => onSwitchSession(session.id)}
          >
            {session.title}
          </button>
        ))}
      </div>
    </aside>
  );
}

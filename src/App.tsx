import { ChatPanel } from './components/ChatPanel';
import { Composer } from './components/Composer';
import { EvidencePanel } from './components/EvidencePanel';
import { SessionSidebar } from './components/SessionSidebar';
import { useChatActions } from './hooks/useChatActions';
import { useChatStore } from './store/chatStore';

export default function App() {
  const { sessions, activeSessionId, createSession, switchSession } = useChatStore();
  const { activeSession, error, isSending, latestEvidenceMessage, retryForMessage, sendQuestion } = useChatActions();

  return (
    <div className="layout">
      <SessionSidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onCreateSession={() => createSession()}
        onSwitchSession={switchSession}
      />
      <main className="main">
        <ChatPanel session={activeSession} error={error} onRetry={async (message) => retryForMessage(activeSessionId!, message)} />
        <Composer isSending={isSending} onSend={sendQuestion} />
      </main>
      <EvidencePanel message={latestEvidenceMessage} />
    </div>
  );
}

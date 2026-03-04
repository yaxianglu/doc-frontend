import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Message, MessageMeta, MessageRole, MessageStatus, Session } from '../types/chat';

interface AddMessageInput {
  role: MessageRole;
  content: string;
  status: MessageStatus;
  meta?: MessageMeta;
}

interface UpdateMessageInput {
  content?: string;
  status?: MessageStatus;
  meta?: MessageMeta;
}

interface ChatState {
  sessions: Session[];
  activeSessionId: string | null;
  createSession: (title?: string) => string;
  switchSession: (sessionId: string) => void;
  addMessage: (sessionId: string, input: AddMessageInput) => string;
  updateMessage: (sessionId: string, messageId: string, patch: UpdateMessageInput) => void;
}

const STORAGE_KEY = 'doc-frontend-chat';

function id() {
  return crypto.randomUUID();
}

function withSessionUpdate(sessions: Session[], sessionId: string, fn: (session: Session) => Session): Session[] {
  return sessions.map((session) => {
    if (session.id !== sessionId) return session;
    return fn(session);
  });
}

const initialState = {
  sessions: [] as Session[],
  activeSessionId: null as string | null
};

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      ...initialState,
      createSession: (title = '新会话') => {
        const sessionId = id();
        const now = Date.now();
        const session: Session = {
          id: sessionId,
          title,
          createdAt: now,
          updatedAt: now,
          messages: []
        };
        set((state) => ({
          sessions: [...state.sessions, session],
          activeSessionId: sessionId
        }));
        return sessionId;
      },
      switchSession: (sessionId: string) => {
        set({ activeSessionId: sessionId });
      },
      addMessage: (sessionId, input) => {
        const messageId = id();
        const nextMessage: Message = {
          id: messageId,
          role: input.role,
          content: input.content,
          status: input.status,
          createdAt: Date.now(),
          meta: input.meta
        };

        set((state) => ({
          sessions: withSessionUpdate(state.sessions, sessionId, (session) => ({
            ...session,
            updatedAt: Date.now(),
            messages: [...session.messages, nextMessage]
          }))
        }));

        return messageId;
      },
      updateMessage: (sessionId, messageId, patch) => {
        set((state) => ({
          sessions: withSessionUpdate(state.sessions, sessionId, (session) => ({
            ...session,
            updatedAt: Date.now(),
            messages: session.messages.map((message) => {
              if (message.id !== messageId) return message;
              return {
                ...message,
                content: patch.content ?? message.content,
                status: patch.status ?? message.status,
                meta: patch.meta ?? message.meta
              };
            })
          }))
        }));
      }
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({
        sessions: state.sessions,
        activeSessionId: state.activeSessionId
      })
    }
  )
);

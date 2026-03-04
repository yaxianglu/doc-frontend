export type ChatMode = 'data_query' | 'advice' | 'unknown';
export type MessageRole = 'user' | 'assistant';
export type MessageStatus = 'pending' | 'streaming' | 'done' | 'error';

export interface MessageMeta {
  mode?: ChatMode | string;
  data?: unknown;
  evidence?: unknown;
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  status: MessageStatus;
  createdAt: number;
  meta?: MessageMeta;
}

export interface Session {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: Message[];
}

export interface ChatResponse {
  answer: string;
  mode: ChatMode | string;
  data: unknown;
  evidence: unknown;
}

export interface ChatApiErrorPayload {
  error?: string;
}

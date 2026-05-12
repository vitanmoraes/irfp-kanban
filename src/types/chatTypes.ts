export interface KnowledgeSource {
  title: string;
  filename: string;
  page?: string;
  snippet?: string;
  score?: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
  sources?: KnowledgeSource[];
}

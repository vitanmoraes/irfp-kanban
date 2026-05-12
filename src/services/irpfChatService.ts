import { supabase } from '../lib/supabase';
import type { ChatMessage, KnowledgeSource } from '../types/chatTypes';

export interface ChatResponse {
  answer: string;
  sources: KnowledgeSource[];
}

export const sendIRPFChatMessage = async (
  history: ChatMessage[],
  question: string
): Promise<ChatResponse> => {
  try {
    const { data, error } = await supabase.functions.invoke('irpf-chat', {
      body: {
        question,
        history: history.slice(-6).map(m => ({
          role: m.role,
          content: m.content
        }))
      }
    });

    if (error) throw error;

    return {
      answer: data?.answer || 'Desculpe, não consegui processar sua pergunta.',
      sources: data?.sources || []
    };
  } catch (error: any) {
    console.error('Erro ao chamar irpf-chat:', error);
    throw new Error(error.message || 'Falha na comunicação com o assistente de IA.');
  }
};

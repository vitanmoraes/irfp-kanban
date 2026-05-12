import React, { useState, useEffect, useRef } from 'react';

import { 
  BookOpen, MessageSquare, 
  Sparkles, Send, Trash2, HelpCircle,
  FileText, ChevronRight, ArrowLeft,
  ShieldCheck, Lightbulb
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

import knowledgeIndex from '../data/knowledge_index.json';
import { IRPF_KNOWLEDGE_BASE } from '../data/knowledgeBase';
import type { ChatMessage } from '../types/chatTypes';
import { sendIRPFChatMessage } from '../services/irpfChatService';

const SUGGESTED_QUESTIONS = [
  "Como declarar conta bancária no exterior?",
  "Como tratar renda variável no IRPF?",
  "Quais documentos solicitar para imóvel?",
  "Como analisar variação patrimonial?",
  "Quando usar declaração completa ou simplificada?",
  "Como declarar participação societária?",
  "Como tratar livro caixa?",
  "O que observar em pró-labore e lucros?"
];

export const IntelligenceTab: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [knowledgeData, setKnowledgeData] = useState<Record<string, string>>({});

  const [viewingFile, setViewingFile] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Carregar todos os arquivos markdown na inicialização (para fallback e visualização)
  useEffect(() => {
    const loadKnowledge = async () => {
      try {
        const data: Record<string, string> = {};
        await Promise.all(knowledgeIndex.map(async (item) => {
          const res = await fetch(`/knowledge_md/${item.filename}`);
          if (res.ok) {
            data[item.filename] = await res.text();
          }
        }));
        setKnowledgeData(data);
      } catch (error) {
        console.error("Erro ao carregar base de conhecimento:", error);
      } finally {

      }
    };
    loadKnowledge();
  }, []);

  // Auto-scroll para o final do chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSendMessage = async (text: string = input) => {
    if (!text.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      createdAt: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await sendIRPFChatMessage(messages, text);
      
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.answer,
        createdAt: new Date().toISOString(),
        sources: response.sources
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (error: any) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `❌ **Erro:** ${error.message || 'Não foi possível obter resposta da IA.'}`,
        createdAt: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const clearChat = () => {
    if (confirm('Deseja limpar todo o histórico da conversa?')) {
      setMessages([]);
    }
  };

  if (viewingFile) {
    const fileInfo = knowledgeIndex.find(f => f.filename === viewingFile);
    return (
      <div className="flex-1 flex flex-col h-full bg-[#0f172a]">
        <header className="p-4 border-b border-white/5 bg-slate-900/60 flex items-center justify-between">
          <button onClick={() => setViewingFile(null)} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft size={18} />
            <span className="font-medium">Voltar ao Chat</span>
          </button>
          <div className="flex flex-col items-center">
            <h2 className="text-sm font-bold text-white">{fileInfo?.title}</h2>
            <span className="text-[10px] text-emerald-400 flex items-center gap-1">
              <ShieldCheck size={10} /> Fonte Original (Markdown)
            </span>
          </div>
          <div className="w-10" />
        </header>
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-4xl mx-auto bg-white/5 border border-white/10 rounded-3xl p-10 prose prose-invert prose-emerald">
            <ReactMarkdown>{knowledgeData[viewingFile] || ''}</ReactMarkdown>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0f172a] overflow-hidden relative">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-[100px] -mr-48 -mt-48 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] -ml-32 -mb-32 pointer-events-none" />

      {/* ── Chat Header ── */}
      <header className="p-6 border-b border-white/5 bg-slate-900/40 backdrop-blur-xl z-10 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-purple-500 rounded-xl shadow-lg shadow-purple-500/20">
            <Sparkles className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight outfit">Assistente <span className="text-purple-400">Inteligente</span></h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Base de Conhecimento IRPF 2025</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {messages.length > 0 && (
            <button 
              onClick={clearChat}
              className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
              title="Limpar Conversa"
            >
              <Trash2 size={18} />
            </button>
          )}
          <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-400 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Online
          </div>
        </div>
      </header>

      {/* ── Chat Content ── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <div 
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-6"
          >
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center max-w-2xl mx-auto space-y-8">
                <div className="p-6 rounded-[2.5rem] bg-white/5 border border-white/10 shadow-2xl">
                  <MessageSquare size={48} className="text-purple-400 mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-bold text-white mb-2">Como posso ajudar hoje?</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Faça perguntas sobre legislação de IRPF, investimentos no exterior, renda variável ou qualquer dúvida técnica.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
                  {SUGGESTED_QUESTIONS.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendMessage(q)}
                      className="p-4 text-left text-xs text-slate-400 bg-white/5 border border-white/5 rounded-2xl hover:border-purple-500/30 hover:bg-white/10 transition-all flex items-center gap-3 group"
                    >
                      <HelpCircle size={14} className="text-purple-500 group-hover:scale-110 transition-transform" />
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg) => (
                <div 
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] ${msg.role === 'user' ? 'order-1' : 'order-2'}`}>
                    <div className={`p-5 rounded-3xl border shadow-lg ${
                      msg.role === 'user' 
                        ? 'bg-purple-600 border-purple-500 text-white rounded-tr-none' 
                        : 'bg-white/5 border-white/10 text-slate-200 rounded-tl-none'
                    }`}>
                      <div className="prose prose-sm prose-invert max-w-none">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>

                      {msg.sources && msg.sources.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <BookOpen size={10} /> Fontes Consultadas
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {msg.sources.map((source, idx) => (
                              <button
                                key={idx}
                                onClick={() => setViewingFile(source.filename)}
                                className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-[9px] text-slate-400 hover:bg-white/10 hover:border-white/20 transition-all flex items-center gap-2"
                              >
                                <FileText size={12} className="text-emerald-400" />
                                {source.title} {source.page && `(Pág. ${source.page})`}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <span className="text-[9px] text-slate-600 font-bold mt-1.5 block px-2 uppercase tracking-tighter">
                      {msg.role === 'user' ? 'Você' : 'Assistente IRPF'} • {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))
            )}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white/5 border border-white/10 p-4 rounded-3xl rounded-tl-none shadow-lg">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce"></span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Chat Input Area */}
          <div className="p-6 bg-slate-900/60 border-t border-white/5">
            <div className="max-w-4xl mx-auto relative group">
              <input 
                type="text" 
                placeholder="Pergunte sobre IRPF 2025..." 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-6 pr-14 py-4 text-sm text-white focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500/40 transition-all placeholder:text-slate-600"
              />
              <button 
                onClick={() => handleSendMessage()}
                disabled={!input.trim() || isTyping}
                className={`absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-xl transition-all ${
                  input.trim() && !isTyping 
                    ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20 hover:scale-105' 
                    : 'bg-white/5 text-slate-600'
                }`}
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar: Biblioteca & Topics */}
        <div className="w-80 border-l border-white/5 bg-slate-900/20 hidden xl:flex flex-col">
          <div className="p-6 space-y-8 overflow-y-auto custom-scrollbar flex-1">
            <section>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <BookOpen size={14} /> Biblioteca Original
              </h3>
              <div className="space-y-2">
                {knowledgeIndex.map((file, i) => (
                  <button 
                    key={i} 
                    onClick={() => setViewingFile(file.filename)}
                    className="w-full p-3 text-left bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 hover:border-white/10 transition-all group flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <FileText size={14} className="text-slate-500 shrink-0" />
                      <span className="text-xs text-slate-300 truncate group-hover:text-white transition-colors">{file.title}</span>
                    </div>
                    <ChevronRight size={12} className="text-slate-600 shrink-0" />
                  </button>
                ))}
              </div>
            </section>

            <section>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Lightbulb size={14} /> Consultoria Rápida
              </h3>
              <div className="space-y-3">
                {IRPF_KNOWLEDGE_BASE.slice(0, 3).map(topic => (
                  <div key={topic.id} className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                    <h4 className="text-[11px] font-bold text-white mb-1">{topic.title}</h4>
                    <p className="text-[10px] text-slate-500 line-clamp-2">{topic.summary}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};


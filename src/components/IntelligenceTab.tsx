import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Sparkles, FileText, Download, ChevronRight, MessageSquare, BookOpen, ExternalLink, Lightbulb, X, ArrowLeft, Loader2, ShieldCheck } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { INTELLIGENCE_SKILLS, QUICK_TIPS } from '../data/intelligenceSkills';
import knowledgeIndex from '../data/knowledge_index.json';

interface SearchMatch {
  filename: string;
  title: string;
  content: string;
  page: string;
  snippet: string;
}

export const IntelligenceTab: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [knowledgeData, setKnowledgeData] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [viewingFile, setViewingFile] = useState<string | null>(null);

  // Carregar todos os arquivos markdown na inicialização
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
        setIsLoading(false);
      }
    };
    loadKnowledge();
  }, []);

  // Motor de busca exata sobre o conteúdo bruto
  const searchResults = useMemo(() => {
    if (search.length < 3) return [];
    
    const results: SearchMatch[] = [];
    const query = search.toLowerCase();

    Object.entries(knowledgeData).forEach(([filename, content]) => {
      const fileInfo = knowledgeIndex.find(f => f.filename === filename);
      if (!fileInfo) return;

      // Dividir por páginas para dar contexto
      const pages = content.split('## Página ');
      pages.forEach((pageContent, idx) => {
        if (pageContent.toLowerCase().includes(query)) {
          const pageNum = idx === 0 ? "Início" : pageContent.split('\n')[0].trim();
          const cleanPageContent = pageContent.split('\n').slice(1).join('\n');
          
          // Pegar um snippet ao redor do termo
          const pos = cleanPageContent.toLowerCase().indexOf(query);
          const start = Math.max(0, pos - 60);
          const end = Math.min(cleanPageContent.length, pos + 100);
          let snippet = cleanPageContent.substring(start, end);
          if (start > 0) snippet = '...' + snippet;
          if (end < cleanPageContent.length) snippet = snippet + '...';

          results.push({
            filename,
            title: fileInfo.title,
            content: cleanPageContent,
            page: pageNum,
            snippet: snippet
          });
        }
      });
    });

    return results.slice(0, 20); // Limitar a 20 resultados
  }, [search, knowledgeData]);

  const filteredSkills = INTELLIGENCE_SKILLS.filter(s => 
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    s.description.toLowerCase().includes(search.toLowerCase())
  );

  const filteredTips = QUICK_TIPS.filter(t => {
    const matchesSearch = t.question.toLowerCase().includes(search.toLowerCase()) ||
                         t.answer.toLowerCase().includes(search.toLowerCase());
    if (!selectedCategory) return matchesSearch;
    const skill = INTELLIGENCE_SKILLS.find(s => s.id === selectedCategory);
    return matchesSearch && (skill ? (t as any).category === skill.category : true);
  });

  if (viewingFile) {
    const fileInfo = knowledgeIndex.find(f => f.filename === viewingFile);
    return (
      <div className="flex-1 flex flex-col h-full bg-[#0f172a]">
        <header className="p-4 border-b border-white/5 bg-slate-900/60 flex items-center justify-between">
          <button onClick={() => setViewingFile(null)} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft size={18} />
            <span className="font-medium">Voltar</span>
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
            <ReactMarkdown>{knowledgeData[viewingFile]}</ReactMarkdown>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0f172a] overflow-hidden">
      {/* ── Header / Search ── */}
      <header className="p-8 border-b border-white/5 bg-slate-900/40 backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] -mr-48 -mt-48 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] -ml-32 -mb-32 pointer-events-none" />
        
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-purple-500 rounded-2xl shadow-lg shadow-purple-500/20">
              <Sparkles className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight outfit">Inteligência <span className="text-purple-400">IRPF</span></h1>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-slate-400 text-sm">Pesquisa exata em base de conhecimento Markdown.</p>
                {isLoading && <Loader2 className="text-purple-400 animate-spin" size={14} />}
              </div>
            </div>
          </div>

          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-purple-400 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Pesquise termos exatos na legislação... (ex: 'isenção 20 mil', 'dividendos avenue')" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 py-4 text-lg focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500/40 transition-all placeholder:text-slate-600"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                <X size={18} />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="max-w-7xl mx-auto space-y-12">
          
          {/* Resultados da Busca Exata */}
          <AnimatePresence>
            {search.length >= 3 && (
              <motion.section
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <ShieldCheck size={20} className="text-emerald-400" />
                    Resultados Oficiais (Exatos)
                  </h2>
                  <span className="text-xs text-slate-500">{searchResults.length} correspondências encontradas</span>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {searchResults.length > 0 ? (
                    searchResults.map((result, i) => (
                      <motion.div
                        key={i}
                        whileHover={{ x: 5 }}
                        onClick={() => setViewingFile(result.filename)}
                        className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-all cursor-pointer group"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-emerald-500/10 rounded text-emerald-400">
                              <FileText size={14} />
                            </div>
                            <span className="text-sm font-bold text-white">{result.title}</span>
                            <span className="text-[10px] bg-white/10 text-slate-400 px-1.5 py-0.5 rounded">Pág. {result.page}</span>
                          </div>
                          <ChevronRight size={16} className="text-slate-600 group-hover:text-white transition-colors" />
                        </div>
                        <p className="text-sm text-slate-400 leading-relaxed italic border-l-2 border-emerald-500/30 pl-4 bg-emerald-500/5 py-2 rounded-r-xl">
                          {result.snippet}
                        </p>
                      </motion.div>
                    ))
                  ) : (
                    <div className="p-12 text-center bg-white/5 rounded-3xl border border-dashed border-white/10">
                      <p className="text-slate-500">Nenhum termo exato encontrado nos documentos originais.</p>
                    </div>
                  )}
                </div>
              </motion.section>
            )}
          </AnimatePresence>

          {/* Módulos (Skills) e Dicas Rápidas (Só aparecem se não estiver buscando ou se houver pouca busca) */}
          {search.length < 3 && (
            <>
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <BookOpen size={20} className="text-purple-400" />
                    Módulos de Conhecimento
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {filteredSkills.map(skill => (
                    <motion.div
                      key={skill.id}
                      whileHover={{ y: -5 }}
                      onClick={() => setSelectedCategory(selectedCategory === skill.id ? null : skill.id)}
                      className={`bg-white/5 border rounded-2xl p-6 transition-all cursor-pointer group ${selectedCategory === skill.id ? 'border-purple-500 bg-purple-500/10' : 'border-white/10 hover:bg-white/[0.08]'}`}
                    >
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: `${skill.color}20`, color: skill.color }}>
                        <skill.icon size={24} />
                      </div>
                      <h3 className="font-bold text-white mb-2">{skill.title}</h3>
                      <p className="text-slate-400 text-sm leading-relaxed">{skill.description}</p>
                    </motion.div>
                  ))}
                </div>
              </section>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Lightbulb size={20} className="text-amber-400" />
                    Dicas Rápidas
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredTips.map((tip, i) => (
                      <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all">
                        <h4 className="font-bold text-slate-200 mb-2 text-sm">{tip.question}</h4>
                        <p className="text-xs text-slate-400 leading-relaxed">{tip.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <FileText size={20} className="text-emerald-400" />
                    Biblioteca Original
                  </h2>
                  <div className="bg-slate-900/60 border border-white/10 rounded-2xl overflow-hidden divide-y divide-white/5">
                    {knowledgeIndex.map((file, i) => (
                      <div key={i} onClick={() => setViewingFile(file.filename)} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer group">
                        <div className="flex items-center gap-3">
                          <FileText size={16} className="text-slate-500" />
                          <span className="text-sm text-slate-300 group-hover:text-white">{file.title}</span>
                        </div>
                        <ChevronRight size={14} className="text-slate-600" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

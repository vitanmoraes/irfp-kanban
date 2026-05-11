import { useState } from 'react';
import { Layout, ClipboardList, Columns, BarChart3, Brain, Settings } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { PreparationTab } from './components/PreparationTab';
import { KanbanBoard } from './components/KanbanBoard';
import { IntelligenceTab } from './components/IntelligenceTab';
import { SettingsTab } from './components/SettingsTab';
import { useIRPFData } from './hooks/useIRPFData';

function App() {
  const { 
    data, loading, error, groups, collaborators,
    addCard, updateCard, moveCard, deleteCard, updateSubTask, addSubTask,
    addCommunication, addAuditEntry, addGroup, updateGroup, deleteGroup,
    addCollaborator, updateCollaborator, deleteCollaborator 
  } = useIRPFData();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'preparacao' | 'kanban' | 'inteligencia' | 'configuracoes'>('dashboard');

  if (loading) {
    return (
      <div className="h-screen w-full bg-[#0f172a] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
        <p className="text-slate-400 font-bold animate-pulse">Sincronizando com Supabase...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-full bg-[#0f172a] flex flex-col items-center justify-center gap-4 p-8 text-center">
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 max-w-md">
          <h2 className="font-bold mb-2">Erro de Conexão</h2>
          <p className="text-sm">{error}</p>
        </div>
        <button onClick={() => window.location.reload()} className="px-6 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-bold transition-all">Tentar Novamente</button>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-[#0f172a] text-slate-200 overflow-hidden">
      {/* Sidebar de Navegação */}
      <aside className="w-20 lg:w-64 border-r border-white/5 bg-slate-900/50 backdrop-blur-xl flex flex-col items-center lg:items-start p-6 gap-8 z-20">
        <div className="flex items-center gap-3 px-2 mb-4">
          <div className="bg-emerald-500 p-2.5 rounded-2xl shadow-lg shadow-emerald-500/20">
            <Layout className="text-white" size={24} />
          </div>
          <h1 className="text-xl font-bold tracking-tight hidden lg:block outfit">IRPF<span className="text-emerald-400">Kanban</span></h1>
        </div>

        <nav className="flex flex-col w-full gap-2">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-3 p-3 rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-400 hover:bg-white/5'}`}
          >
            <BarChart3 size={20} />
            <span className="font-medium hidden lg:block">Dashboard</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('preparacao')}
            className={`flex items-center gap-3 p-3 rounded-xl transition-all ${activeTab === 'preparacao' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-400 hover:bg-white/5'}`}
          >
            <ClipboardList size={20} />
            <span className="font-medium hidden lg:block">Preparação</span>
          </button>

          <button 
            onClick={() => setActiveTab('kanban')}
            className={`flex items-center gap-3 p-3 rounded-xl transition-all ${activeTab === 'kanban' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-400 hover:bg-white/5'}`}
          >
            <Columns size={20} />
            <span className="font-medium hidden lg:block">Kanban</span>
          </button>

          <div className="my-2 border-t border-white/5 w-full" />

          <button 
            onClick={() => setActiveTab('inteligencia')}
            className={`flex items-center gap-3 p-3 rounded-xl transition-all ${activeTab === 'inteligencia' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-lg shadow-purple-500/5' : 'text-slate-400 hover:bg-white/5'}`}
          >
            <Brain size={20} />
            <span className="font-medium hidden lg:block">Inteligência</span>
          </button>

          <button 
            onClick={() => setActiveTab('configuracoes')}
            className={`flex items-center gap-3 p-3 rounded-xl transition-all mt-auto ${activeTab === 'configuracoes' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-lg shadow-indigo-500/5' : 'text-slate-400 hover:bg-white/5'}`}
          >
            <Settings size={20} />
            <span className="font-medium hidden lg:block">Configurações</span>
          </button>
        </nav>
      </aside>

      {/* Área Principal com Conteúdo Dinâmico */}
      <main className="flex-1 flex flex-col overflow-hidden relative z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-purple-500/5 pointer-events-none" />
        
        {activeTab === 'dashboard' && <Dashboard data={data} collaborators={collaborators} />}
        {activeTab === 'preparacao' && (
          <PreparationTab 
            data={data} 
            onAddCard={addCard} 
            onDeleteCard={deleteCard}
            onMoveCard={moveCard}
          />
        )}
        {activeTab === 'kanban' && (
          <KanbanBoard 
            data={data} 
            onUpdateCard={updateCard}
            onMoveCard={moveCard}
            onDeleteCard={deleteCard}
            onAddCommunication={addCommunication}
            onAddAuditEntry={addAuditEntry}
            onToggleTask={updateSubTask}
            onUpdateSubTask={updateSubTask}
            onAddSubTask={addSubTask}
            groups={groups}
            collaborators={collaborators}
          />
        )}
        {activeTab === 'inteligencia' && <IntelligenceTab />}
        {activeTab === 'configuracoes' && (
          <SettingsTab 
            groups={groups} 
            collaborators={collaborators}
            onAddGroup={addGroup} 
            onUpdateGroup={updateGroup} 
            onDeleteGroup={deleteGroup} 
            onAddCollaborator={addCollaborator}
            onUpdateCollaborator={updateCollaborator}
            onDeleteCollaborator={deleteCollaborator}
          />
        )}
      </main>
    </div>
  );
}

export default App;

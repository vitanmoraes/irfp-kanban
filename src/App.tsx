import React, { useState } from 'react';
import { initialData } from './mockData';
import { Layout, ClipboardList, Columns, BarChart3, Brain, Settings } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { PreparationTab } from './components/PreparationTab';
import { KanbanBoard } from './components/KanbanBoard';
import { IntelligenceTab } from './components/IntelligenceTab';
import { SettingsTab } from './components/SettingsTab';
import type { IRPFAppState, IRPFCard } from './types';

function App() {
  const [data, setData] = useState<IRPFAppState>(initialData);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'preparacao' | 'kanban' | 'inteligencia' | 'configuracoes'>('dashboard');

  const updateData = (update: IRPFAppState | ((prev: IRPFAppState) => IRPFAppState)) => {
    setData(update);
  };

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
        
        {activeTab === 'dashboard' && <Dashboard data={data} />}
        {activeTab === 'preparacao' && <PreparationTab data={data} setData={updateData} />}
        {activeTab === 'kanban' && <KanbanBoard data={data} setData={updateData} />}
        {activeTab === 'inteligencia' && <IntelligenceTab />}
        {activeTab === 'configuracoes' && <SettingsTab />}
      </main>
    </div>
  );
}

export default App;

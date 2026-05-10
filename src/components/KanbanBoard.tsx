import React, { useState } from 'react';
import { Column } from './Column';
import { Search, Filter, AlertTriangle, Users, Clock, Keyboard, Send } from 'lucide-react';
import { ProcessDetailsModal } from './ProcessDetailsModal';
import type { IRPFCard, SubTask, IRPFAppState } from '../types';

interface Props {
  data: IRPFAppState;
  setData: (newData: IRPFAppState) => void;
}

export const KanbanBoard: React.FC<Props> = ({ data, setData }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterResponsible, setFilterResponsible] = useState<string>('all');
  const [filterRisk, setFilterRisk] = useState<string>('all');
  const [filterComplexity, setFilterComplexity] = useState<string>('all');
  const [selectedCard, setSelectedCard] = useState<IRPFCard | null>(null);
  const [alert, setAlert] = useState<string | null>(null);

  // Exibir todas as colunas no Kanban
  const kanbanColumns = data.columns;

  const moveCard = (cardId: string, targetColumnId: string) => {
    setData({
      ...data,
      columns: data.columns.map(col => {
        const card = col.cards.find(c => c.id === cardId);
        if (card) {
          // Remove da coluna atual
          const newSourceCards = col.cards.filter(c => c.id !== cardId);
          // Se for a coluna destino, adicionamos (tratado no próximo map item)
          return { ...col, cards: newSourceCards };
        }
        if (col.id === targetColumnId) {
          // Adiciona na coluna destino
          const sourceCol = data.columns.find(c => c.cards.some(card => card.id === cardId));
          const movingCard = sourceCol?.cards.find(c => c.id === cardId);
          return movingCard ? { ...col, cards: [movingCard, ...col.cards] } : col;
        }
        return col;
      })
    });
  };

  const updateCardDetails = (cardId: string, updates: Partial<IRPFCard>) => {
    setData({
      ...data,
      columns: data.columns.map(col => ({
        ...col,
        cards: col.cards.map(card => 
          card.id === cardId ? { ...card, ...updates } : card
        )
      }))
    });
    
    if (selectedCard?.id === cardId) {
      setSelectedCard(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  const deleteCard = (cardId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este cliente?')) return;
    setData({
      ...data,
      columns: data.columns.map(col => ({
        ...col,
        cards: col.cards.filter(card => card.id !== cardId)
      }))
    });
  };

  const filteredColumns = data.columns.map(col => ({
    ...col,
    cards: col.cards.filter(card => {
      const matchSearch = card.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || card.cpf.includes(searchTerm);
      const matchResp = filterResponsible === 'all' || card.responsible === filterResponsible;
      const matchRisk = filterRisk === 'all' || card.riskLevel === filterRisk;
      const matchComp = filterComplexity === 'all' || card.complexityScore.classification === filterComplexity;
      
      return matchSearch && matchResp && matchRisk && matchComp;
    })
  }));

  const totalClients = data.columns.reduce((acc, col) => acc + col.cards.length, 0);

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      {/* Header do Kanban */}
      <header className="p-6 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/20 backdrop-blur-md">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input 
              type="text" 
              placeholder="Buscar cliente ou CPF..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs w-48 lg:w-64 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all"
            />
          </div>

          <div className="flex items-center gap-2 border-l border-white/10 pl-4">
            <select 
              value={filterResponsible}
              onChange={(e) => setFilterResponsible(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-[10px] font-bold text-slate-300 focus:outline-none"
            >
              <option value="all">Todos Responsáveis</option>
              {COLLABORATORS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>

            <select 
              value={filterRisk}
              onChange={(e) => setFilterRisk(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-[10px] font-bold text-slate-300 focus:outline-none"
            >
              <option value="all">Todos os Riscos</option>
              <option value="BAIXO">Risco Baixo</option>
              <option value="MEDIO">Risco Médio</option>
              <option value="ALTO">Risco Alto</option>
              <option value="CRITICO">Risco Crítico</option>
            </select>

            <select 
              value={filterComplexity}
              onChange={(e) => setFilterComplexity(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-[10px] font-bold text-slate-300 focus:outline-none"
            >
              <option value="all">Todas Complexidades</option>
              <option value="SIMPLES">Simples</option>
              <option value="MEDIA">Média</option>
              <option value="COMPLEXA">Complexa</option>
              <option value="CRITICA">Crítica</option>
            </select>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-6 border-l border-white/10 pl-6">
          {[
            { label: 'Total', value: totalClients, color: 'text-blue-400' },
            { label: 'Em Risco', value: data.columns.reduce((acc, c) => acc + c.cards.filter(card => card.riskLevel === 'CRITICO').length, 0), color: 'text-red-400' },
          ].map((stat, i) => (
            <div key={i} className="flex flex-col">
              <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">{stat.label}</span>
              <span className={`text-sm font-black ${stat.color}`}>{stat.value}</span>
            </div>
          ))}
        </div>
      </header>

      {alert && (
        <div className="bg-emerald-500 text-white px-6 py-2 flex items-center gap-2 animate-fade-in absolute top-20 left-1/2 -translate-x-1/2 z-50 rounded-full shadow-2xl shadow-emerald-500/40">
          <AlertTriangle size={18} />
          <span className="text-sm font-bold">{alert}</span>
        </div>
      )}

      {/* Área do Kanban */}
      <main className="flex-1 overflow-x-auto p-6 custom-scrollbar bg-slate-900/10">
        <div className="flex h-full gap-6 items-start">
          {filteredColumns.map(column => (
            <Column 
              key={column.id} 
              column={column} 
              onCardClick={(card) => setSelectedCard({ ...card, columnId: column.id } as any)}
              onCardDrop={(cardId) => moveCard(cardId, column.id)}
              onDeleteCard={deleteCard}
            />
          ))}
        </div>
      </main>

      {selectedCard && (
        <ProcessDetailsModal 
          card={selectedCard} 
          columnId={(selectedCard as any).columnId}
          isOpen={!!selectedCard}
          onClose={() => setSelectedCard(null)}
          onUpdateCard={(updates) => updateCardDetails(selectedCard.id, updates)}
          onToggleTask={(taskId) => {
            const newTasks = selectedCard.subTasks.map(t => 
              t.id === taskId ? { ...t, completed: !t.completed } : t
            );
            updateCardDetails(selectedCard.id, { subTasks: newTasks });
          }}
        />
      )}
    </div>
  );
};

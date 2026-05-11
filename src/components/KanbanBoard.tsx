import React, { useState } from 'react';
import { Column } from './Column';
import { Search, Filter, AlertTriangle, Users, Clock, Keyboard, Send } from 'lucide-react';
import { ProcessDetailsModal } from './ProcessDetailsModal';
import type { IRPFCard, SubTask, IRPFAppState } from '../types';

interface Props {
  data: IRPFAppState;
  onMoveCard: (cardId: string, targetColumnId: string) => void;
  onUpdateCard: (cardId: string, updates: Partial<IRPFCard>) => void;
  onDeleteCard: (cardId: string) => void;
  onAddCommunication: (cardId: string, entry: any) => void;
  onToggleTask: (taskId: string, completed: boolean) => void;
  groups: any[];
  collaborators: any[];
}

export const KanbanBoard: React.FC<Props> = ({ 
  data, onMoveCard, onUpdateCard, onDeleteCard, onAddCommunication, onAddAuditEntry, onToggleTask, groups, collaborators
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterResponsible, setFilterResponsible] = useState<string>('all');
  const [filterGroup, setFilterGroup] = useState<string>('all');
  const [filterRisk, setFilterRisk] = useState<string>('all');
  const [filterComplexity, setFilterComplexity] = useState<string>('all');
  const [selectedCard, setSelectedCard] = useState<IRPFCard | null>(null);
  const [alert, setAlert] = useState<string | null>(null);

  // Exibir todas as colunas no Kanban
  const kanbanColumns = data.columns;

  const moveCard = (cardId: string, targetColumnId: string) => {
    onMoveCard(cardId, targetColumnId);
  };

  const updateCardDetails = (cardId: string, updates: Partial<IRPFCard>) => {
    onUpdateCard(cardId, updates);
  };

  const deleteCard = (cardId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este cliente?')) return;
    onDeleteCard(cardId);
  };

  const filteredColumns = data.columns.map(col => ({
    ...col,
    cards: col.cards.filter(card => {
      const matchSearch = card.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || card.cpf.includes(searchTerm);
      const matchResp = filterResponsible === 'all' || card.responsible === filterResponsible;
      const matchGroup = filterGroup === 'all' || card.groupId === filterGroup;
      const matchRisk = filterRisk === 'all' || card.riskLevel === filterRisk;
      const matchComp = filterComplexity === 'all' || card.complexityScore.classification === filterComplexity;
      
      return matchSearch && matchResp && matchGroup && matchRisk && matchComp;
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
              {collaborators.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>

            <select 
              value={filterGroup}
              onChange={(e) => setFilterGroup(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-[10px] font-bold text-slate-300 focus:outline-none"
            >
              <option value="all">Todos os Grupos</option>
              {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
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
              onUpdateCard={updateCardDetails}
              onAddCommunication={onAddCommunication}
              onAddAuditEntry={onAddAuditEntry}
              collaborators={collaborators}
            />
          ))}
        </div>
      </main>

      {selectedCard && (
        <ProcessDetailsModal 
          card={data.columns.flatMap(c => c.cards).find(c => c.id === selectedCard.id) || selectedCard} 
          columnId={(selectedCard as any).columnId}
          isOpen={!!selectedCard}
          onClose={() => setSelectedCard(null)}
          onUpdateCard={(updates) => updateCardDetails(selectedCard.id, updates)}
          onToggleTask={(taskId) => {
            const currentCard = data.columns.flatMap(c => c.cards).find(c => c.id === selectedCard.id) || selectedCard;
            const task = currentCard.subTasks.find(t => t.id === taskId);
            if (task) {
              onToggleTask(taskId, !task.completed);
            }
          }}
          onAddAuditEntry={onAddAuditEntry}
          groups={groups}
          collaborators={collaborators}
        />
      )}
    </div>
  );
};

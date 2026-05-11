import React from 'react';
import type { KanbanColumn, IRPFCard } from '../types';
import { TaskCard } from './TaskCard';
import * as Icons from 'lucide-react';

interface Props {
  column: KanbanColumn;
  onCardClick: (card: IRPFCard) => void;
  onCardDrop: (cardId: string) => void;
  onDeleteCard: (cardId: string) => void;
  collaborators: any[];
}

export const Column: React.FC<Props> = ({ column, onCardClick, onCardDrop, onDeleteCard, collaborators }) => {
  // @ts-ignore
  const Icon = Icons[column.icon] || Icons.HelpCircle;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    const cardId = e.dataTransfer.getData('cardId');
    onCardDrop(cardId);
  };

  return (
    <div 
      className="flex flex-col w-80 min-w-[320px] h-full"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
            <Icon size={18} />
          </div>
          <h2 className="font-bold text-sm text-slate-200 uppercase tracking-wider">
            {column.title}
          </h2>
        </div>
        <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full border border-white/5">
          {column.cards.length}
        </span>
      </div>

      <div className="flex-1 bg-slate-900/30 rounded-2xl p-2 border border-white/5 overflow-y-auto custom-scrollbar">
        {column.cards.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-slate-600 border-2 border-dashed border-white/5 rounded-xl m-2">
            <Icons.Plus size={20} className="mb-1 opacity-20" />
            <span className="text-[10px] uppercase font-medium">Vazio</span>
          </div>
        ) : (
          column.cards.map(card => (
            <TaskCard 
              key={card.id} 
              card={card} 
              columnId={column.id}
              collaborators={collaborators}
              onClick={() => onCardClick(card)} 
              onDelete={() => onDeleteCard(card.id)}
            />
          ))
        )}
      </div>
    </div>
  );
};

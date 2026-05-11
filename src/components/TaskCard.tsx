import React from 'react';
import type { IRPFCard } from '../types';
import { motion } from 'framer-motion';
import {
  Clock, CheckSquare, User, Trash2,
  FileText, Wrench, MessageCircle, DollarSign,
  AlertTriangle, ShieldAlert, MessageSquare
} from 'lucide-react';
import {
  COMPLEXITY_COLORS, COMPLEXITY_LABELS,
  RISK_COLORS, RISK_LABELS,
  DOC_STATUS_COLORS, DOC_STATUS_LABELS,
  calculateComplexityScore
} from '../utils/scoreCalculator';
import { getAlertStatus } from '../utils/communicationManager';

interface Props {
  card: IRPFCard;
  columnId: string;
  onClick?: () => void;
  onDelete?: () => void;
  collaborators: any[];
}

// ---- helpers de cor por status ----

const DEADLINE_STYLES: Record<string, string> = {
  NO_PRAZO: 'text-emerald-400',
  ATENCAO: 'text-amber-400',
  ATRASADO: 'text-red-400',
};

const DEADLINE_LABELS: Record<string, string> = {
  NO_PRAZO: 'No prazo',
  ATENCAO: 'Atenção',
  ATRASADO: 'Atrasado',
};

const TECH_COLORS: Record<string, string> = {
  NAO_INICIADO: 'text-slate-500',
  EM_DIGITACAO: 'text-blue-400',
  CONFERIDO: 'text-purple-400',
  REVISADO: 'text-emerald-400',
};

const CLIENT_COLORS: Record<string, string> = {
  AGUARDANDO: 'text-amber-400',
  APROVADO: 'text-emerald-400',
  QUESTIONADO: 'text-orange-400',
};

// ============================================================
// Componente
// ============================================================

export const TaskCard: React.FC<Props> = ({ card, columnId, onClick, onDelete, collaborators }) => {
  const complexity = calculateComplexityScore(card.clientProfile);
  const alert = getAlertStatus(card, columnId);

  const completedTasks = card.subTasks.filter(t => t.completed).length;
  const totalTasks = card.subTasks.length;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  // Mapeamento dinâmico do executor baseado na coluna atual do Kanban
  const stageToExecutorKey: Record<string, keyof NonNullable<IRPFCard['executors']>> = {
    preparacao: 'preparation',
    aguardando: 'preparation',
    recepcao: 'preparation',
    digitacao: 'typing',
    conferir: 'conference',
    analise: 'analysis',
    planejamento: 'analysis',
    transmissao: 'transmission',
  };

  const executorKey = stageToExecutorKey[columnId];
  // Prioridade: Executor da etapa técnica -> Fallback: Responsável Geral
  const stageResponsibleId = (executorKey && card.executors && card.executors[executorKey])
    ? card.executors[executorKey]
    : card.responsible;

  const stageResponsible = collaborators.find(c => c.id === stageResponsibleId);

  const isStuck = card.daysActive > 7;
  const isCritical = card.riskLevel === 'CRITICO' || card.riskLevel === 'ALTO';

  const pendingRequired = card.subTasks.filter(t => t.required && !t.completed).length;

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('cardId', card.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div draggable onDragStart={handleDragStart} className="mb-3">
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -3, boxShadow: '0 12px 24px rgba(0,0,0,0.25)' }}
        onClick={onClick}
        className={`glass-morphism p-4 rounded-xl cursor-grab active:cursor-grabbing group transition-all flex flex-col gap-2 relative overflow-hidden
          ${isStuck ? 'border border-amber-500/20' : 'border border-white/5'}
          ${isCritical ? 'border border-red-500/30' : ''}
        `}
      >
        {/* Faixa de risco crítico */}
        {card.riskLevel === 'CRITICO' && (
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-500 to-orange-500" />
        )}

        {/* Alerta de Comunicação */}
        {alert.level !== 'normal' && (
          <div className={`mb-1 p-2 rounded-lg flex items-center gap-2 text-xs border ${alert.level === 'danger'
              ? 'bg-red-500/10 text-red-400 border-red-500/20'
              : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
            }`}>
            <MessageSquare size={14} />
            <span className="font-medium">{alert.message}</span>
          </div>
        )}

        {/* ---- Linha 1: Nome + Badges topo ---- */}
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm group-hover:text-emerald-400 transition-colors truncate">
              {card.clientName}
            </h3>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5">{card.cpf}</p>
          </div>

          <div className="flex flex-col items-end gap-1 shrink-0">
            {/* Tipo SIMPLIFICADA / COMPLETA */}
            <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-bold tracking-wider border ${card.type === 'COMPLETA'
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/20'
                : 'bg-blue-500/20 text-blue-300 border-blue-500/20'
              }`}>
              {card.type}
            </span>

            {/* Botão excluir */}
            <button
              onClick={e => { e.stopPropagation(); onDelete?.(); }}
              className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 p-1 transition-all rounded-md hover:bg-red-400/10"
              title="Excluir"
            >
              <Trash2 size={11} />
            </button>
          </div>
        </div>

        {/* ---- Linha 2: Score + Risco ---- */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Complexidade */}
          <span className={`text-[9px] px-1.5 py-0.5 rounded border font-bold tracking-wider ${COMPLEXITY_COLORS[card.complexityScore.classification]
            }`}>
            {COMPLEXITY_LABELS[card.complexityScore.classification]} ({card.complexityScore.total}pts)
          </span>

          {/* Risco */}
          {card.riskLevel !== 'BAIXO' && (
            <span className={`text-[9px] px-1.5 py-0.5 rounded border font-bold tracking-wider flex items-center gap-0.5 ${RISK_COLORS[card.riskLevel]
              }`}>
              <ShieldAlert size={9} />
              {RISK_LABELS[card.riskLevel]}
            </span>
          )}

          {/* Atrasado */}
          {card.deadlineStatus && card.deadlineStatus !== 'NO_PRAZO' && (
            <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${DEADLINE_STYLES[card.deadlineStatus]}`}>
              ⏰ {DEADLINE_LABELS[card.deadlineStatus]}
            </span>
          )}
        </div>

        {/* ---- Tags ---- */}
        {card.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {card.tags.map(tag => (
              <span
                key={tag.id}
                className="text-[9px] px-1.5 py-0.5 rounded border border-white/10"
                style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
              >
                {tag.label}
              </span>
            ))}
          </div>
        )}

        {/* ---- Status Bar (4 dimensões) ---- */}
        <div className="grid grid-cols-4 gap-1 border-t border-white/5 pt-2">
          {/* Documental */}
          <div className="flex flex-col items-center gap-0.5" title={`Documental: ${DOC_STATUS_LABELS[card.statusDoc]}`}>
            <FileText size={12} className={DOC_STATUS_COLORS[card.statusDoc].split(' ')[0]} />
            <span className="text-[8px] text-slate-500 leading-none">Doc</span>
          </div>

          {/* Técnico */}
          <div className="flex flex-col items-center gap-0.5" title={`Técnico: ${card.statusTech}`}>
            <Wrench size={12} className={TECH_COLORS[card.statusTech]} />
            <span className="text-[8px] text-slate-500 leading-none">Téc</span>
          </div>

          {/* Cliente */}
          <div className="flex flex-col items-center gap-0.5" title={`Cliente: ${card.statusClient}`}>
            <MessageCircle size={12} className={CLIENT_COLORS[card.statusClient]} />
            <span className="text-[8px] text-slate-500 leading-none">Cli</span>
          </div>

          {/* Financeiro */}
          <div className="flex flex-col items-center gap-0.5" title={`Financeiro: ${card.statusFinancial}`}>
            <DollarSign size={12} className={
              card.statusFinancial === 'PAGO' ? 'text-emerald-400' :
                card.statusFinancial === 'GERADO' ? 'text-blue-400' :
                  card.statusFinancial === 'CORTESIA' ? 'text-slate-400' :
                    'text-slate-600'
            } />
            <span className="text-[8px] text-slate-500 leading-none">Fin</span>
          </div>
        </div>

        {/* ---- Progresso do Checklist ---- */}
        {totalTasks > 0 && (
          <div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
              <div className="flex items-center gap-1">
                <CheckSquare size={11} className="text-emerald-500" />
                <span>{completedTasks}/{totalTasks}</span>
              </div>
              {pendingRequired > 0 && (
                <span className="text-red-400 flex items-center gap-0.5">
                  <AlertTriangle size={9} />
                  {pendingRequired} obrig.
                </span>
              )}
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className={`h-full rounded-full ${pendingRequired > 0 ? 'bg-amber-500' : 'bg-emerald-500'}`}
              />
            </div>
          </div>
        )}

        {/* ---- Rodapé: Responsável + Dias ---- */}
        <div className="flex items-center justify-between pt-1.5 border-t border-white/5">
          <div className="flex items-center gap-1.5">
            {stageResponsible ? (
              <>
                <div className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center text-[8px] font-bold text-purple-400 border border-purple-500/30">
                  {stageResponsible.name.charAt(0)}
                </div>
                <span className="text-[10px] text-slate-400">{stageResponsible.name}</span>
              </>
            ) : (
              <div className="flex items-center gap-1 text-slate-600">
                <User size={11} />
                <span className="text-[10px]">Sem responsável</span>
              </div>
            )}
          </div>

          <div className={`flex items-center gap-1 text-[10px] font-bold ${isStuck ? 'text-amber-400' : 'text-slate-500'}`}>
            <Clock size={11} className={isStuck ? 'text-amber-400' : 'text-slate-500'} />
            {card.daysActive}d
            {isStuck && <AlertTriangle size={9} />}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

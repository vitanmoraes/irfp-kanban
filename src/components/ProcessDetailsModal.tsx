import React, { useState } from 'react';
import type { IRPFCard, BillingModal, SubTask, ExtraService, CommunicationEntry, GateItem } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, CheckCircle2, Info, FileText, MessageCircle, User, 
  Shield, Target, Clock, Layout, ListChecks, Keyboard, 
  Search, Scale, CreditCard, Send, PlusCircle, History,
  AlertTriangle, ShieldAlert, DollarSign
} from 'lucide-react';
import { IRPF_PROCESS } from '../data/irpfProcess';
import { COLLABORATORS } from '../data/collaborators';
import { 
  COMPLEXITY_COLORS, COMPLEXITY_LABELS, 
  RISK_COLORS, RISK_LABELS,
  DOC_STATUS_COLORS, DOC_STATUS_LABELS 
} from '../utils/scoreCalculator';
import { gateProgress } from '../utils/gateValidator';
import { COMMUNICATION_TEMPLATES } from '../utils/communicationManager';
import { calculateSuggestedFee } from '../utils/financialManager';

interface Props {
  card: IRPFCard;
  columnId: string;
  isOpen: boolean;
  onClose: () => void;
  onToggleTask: (taskId: string) => void;
  onUpdateCard: (updates: Partial<IRPFCard>) => void;
  onAddCommunication: (cardId: string, entry: any) => void;
  onAddAuditEntry: (cardId: string, action: string, details?: string) => void;
}

type TabId = 'resumo' | 'documentos' | 'checklist' | 'digitacao' | 'conferencia' | 'analise' | 'cliente' | 'financeiro' | 'transmissao' | 'extras' | 'auditoria';

export const ProcessDetailsModal: React.FC<Props> = ({ 
  card, columnId, isOpen, onClose, onToggleTask, onUpdateCard, onAddCommunication, onAddAuditEntry 
}) => {
  const [activeTab, setActiveTab] = useState<TabId>('resumo');

  if (!isOpen) return null;

  const currentStep = IRPF_PROCESS[columnId];

  const tabs: { id: TabId; label: string; icon: any }[] = [
    { id: 'resumo', label: 'Resumo', icon: Layout },
    { id: 'documentos', label: 'Documentos', icon: FileText },
    { id: 'checklist', label: 'Checklist', icon: ListChecks },
    { id: 'digitacao', label: 'Digitação', icon: Keyboard },
    { id: 'conferencia', label: 'Conferência', icon: Search },
    { id: 'analise', label: 'Análise', icon: Scale },
    { id: 'cliente', label: 'Cliente', icon: MessageCircle },
    { id: 'financeiro', label: 'Financeiro', icon: DollarSign },
    { id: 'transmissao', label: 'Transmissão', icon: Send },
    { id: 'auditoria', label: 'Histórico', icon: History },
    { id: 'extras', label: 'Extras', icon: PlusCircle },
  ];

  // Componentes de Conteúdo das Abas (Simplificados para esta etapa)
  const renderTabContent = () => {
    switch (activeTab) {
      case 'resumo':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="glass-morphism p-6 rounded-3xl border border-white/5">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Complexidade</h4>
                <div className={`p-4 rounded-2xl border ${COMPLEXITY_COLORS[card.complexityScore.classification]}`}>
                  <p className="text-lg font-bold">{COMPLEXITY_LABELS[card.complexityScore.classification]}</p>
                  <p className="text-xs opacity-80 mt-1">{card.complexityScore.total} pontos acumulados</p>
                </div>
              </div>
              <div className="glass-morphism p-6 rounded-3xl border border-white/5">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Nível de Risco</h4>
                <div className={`p-4 rounded-2xl border ${RISK_COLORS[card.riskLevel]}`}>
                  <p className="text-lg font-bold">{RISK_LABELS[card.riskLevel]}</p>
                  <p className="text-xs opacity-80 mt-1">Status: {card.riskLevel === 'CRITICO' ? 'Exige revisão imediata' : 'Normal'}</p>
                </div>
              </div>
              <div className="glass-morphism p-6 rounded-3xl border border-white/5">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Status de Entrega</h4>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <p className="text-lg font-bold text-white">{card.daysActive} Dias Ativos</p>
                  <p className="text-xs text-slate-400 mt-1">Prazo: {card.deadline || 'Não definido'}</p>
                </div>
              </div>
            </div>

            <div className="glass-morphism p-8 rounded-3xl border border-white/5">
               <h4 className="text-sm font-bold text-white mb-6 flex items-center gap-2">
                 <Target size={18} className="text-emerald-400" /> Detalhes do Perfil Fiscal
               </h4>
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 {Object.entries(card.clientProfile).map(([key, value]) => (
                   <div key={key} className={`p-3 rounded-xl border text-[10px] font-bold transition-all ${value ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-white/5 border-white/5 text-slate-600'}`}>
                     {key.replace('has', '').replace(/([A-Z])/g, ' $1').trim()}
                   </div>
                 ))}
               </div>
            </div>
          </div>
        );
      
      case 'documentos':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Checklist de Documentação</h3>
              <div className={`px-4 py-1.5 rounded-full text-[10px] font-bold ${DOC_STATUS_COLORS[card.statusDoc]}`}>
                {DOC_STATUS_LABELS[card.statusDoc]}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {card.subTasks.map((task) => (
                <div 
                  key={task.id}
                  onClick={() => onToggleTask(task.id)}
                  className={`group flex items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer ${task.completed ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-white/5 border-white/10 hover:border-white/20'}`}
                >
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center border-2 transition-all ${task.completed ? 'bg-emerald-500 border-emerald-500' : 'border-slate-600 group-hover:border-blue-500/50'}`}>
                    {task.completed && <CheckCircle2 size={12} className="text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-[11px] font-bold leading-tight ${task.completed ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                      {task.title} {task.required && <span className="text-red-400 ml-1">*</span>}
                    </p>
                    {task.instruction && !task.completed && (
                      <p className="text-[10px] text-slate-400 mt-1 italic leading-snug">
                        {task.instruction}
                      </p>
                    )}
                    <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest mt-1 block">{task.category}</span>
                  </div>

                </div>
              ))}
            </div>
          </div>
        );

      case 'digitacao':
        const { pct: pctDig } = gateProgress(card.gatesDigitacao);
        return (
          <div className="space-y-8">
            <div className="p-6 rounded-3xl bg-amber-500/5 border border-amber-500/20 flex flex-col gap-4">
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                   <Shield className="text-amber-500" size={24} />
                   <div>
                     <h4 className="text-white font-bold">Gate de Digitação</h4>
                     <p className="text-xs text-slate-400">Liberação para início dos lançamentos fiscais</p>
                   </div>
                 </div>
                 <div className="text-right">
                    <span className="text-2xl font-bold text-white">{pctDig}%</span>
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Concluído</p>
                 </div>
               </div>
               <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                 <div className="h-full bg-amber-500 transition-all duration-1000" style={{ width: `${pctDig}%` }} />
               </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {card.gatesDigitacao.map((gate, idx) => (
                <div key={gate.id} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                  <button 
                    onClick={() => {
                      const newGates = card.gatesDigitacao.map(g => g.id === gate.id ? { ...g, completed: !g.completed } : g);
                      onUpdateCard({ gatesDigitacao: newGates });
                    }}
                    className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${gate.completed ? 'bg-emerald-500 border-emerald-500' : 'border-slate-600'}`}
                  >
                    {gate.completed && <CheckCircle2 size={14} className="text-white" />}
                  </button>
                  <div className="flex-1">
                    <p className={`text-sm font-semibold ${gate.completed ? 'text-slate-500 line-through' : 'text-slate-200'}`}>{gate.label}</p>
                    {gate.required && <span className="text-[8px] text-red-400 font-bold uppercase">Obrigatório</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'analise':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-morphism p-8 rounded-[2.5rem] border border-white/5">
                <h4 className="text-sm font-bold text-white mb-6 flex items-center gap-2">
                  <Scale size={18} className="text-indigo-400" /> Variação Patrimonial
                </h4>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] text-slate-500 font-bold uppercase block mb-2">Ano Anterior</label>
                      <input 
                        type="number" 
                        value={card.fiscalAnalysis.previousYearAssets || ''}
                        onChange={(e) => onUpdateCard({ fiscalAnalysis: { ...card.fiscalAnalysis, previousYearAssets: Number(e.target.value) } })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 font-bold uppercase block mb-2">Ano Atual</label>
                      <input 
                        type="number" 
                        value={card.fiscalAnalysis.currentYearAssets || ''}
                        onChange={(e) => onUpdateCard({ fiscalAnalysis: { ...card.fiscalAnalysis, currentYearAssets: Number(e.target.value) } })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                      />
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
                    <p className="text-[10px] text-indigo-400 font-bold uppercase">Variação Calculada</p>
                    <p className="text-xl font-bold text-white mt-1">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format((card.fiscalAnalysis.currentYearAssets || 0) - (card.fiscalAnalysis.previousYearAssets || 0))}
                    </p>
                  </div>
                </div>
              </div>

              <div className="glass-morphism p-8 rounded-[2.5rem] border border-white/5">
                <h4 className="text-sm font-bold text-white mb-6 flex items-center gap-2">
                  <AlertTriangle size={18} className="text-amber-400" /> Alertas e Inconsistências
                </h4>
                <div className="space-y-3">
                  {card.fiscalAnalysis.autoAlerts.length > 0 ? (
                    card.fiscalAnalysis.autoAlerts.map((alert, i) => (
                      <div key={i} className="flex gap-3 p-3 rounded-xl bg-red-500/5 border border-red-500/20 text-red-400 text-xs">
                        <AlertTriangle size={14} className="shrink-0" />
                        <span>{alert}</span>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-slate-600 italic border-2 border-dashed border-white/5 rounded-2xl">
                      Nenhuma inconsistência detectada
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="glass-morphism p-8 rounded-[2.5rem] border border-white/5">
              <h4 className="text-sm font-bold text-white mb-4">Notas Técnicas da Análise</h4>
              <textarea 
                value={card.fiscalAnalysis.technicalNotes || ''}
                onChange={(e) => onUpdateCard({ fiscalAnalysis: { ...card.fiscalAnalysis, technicalNotes: e.target.value } })}
                placeholder="Descreva pontos de atenção encontrados na análise patrimonial e de caixa..."
                className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 resize-none"
              />
            </div>
          </div>
        );

      case 'cliente':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                <div className="glass-morphism p-8 rounded-[2.5rem] border border-white/5">
                  <h4 className="text-sm font-bold text-white mb-6 flex items-center gap-2">
                    <MessageCircle size={18} className="text-emerald-400" /> Histórico de Comunicação
                  </h4>
                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {card.communications.length > 0 ? (
                      card.communications.map((comm) => (
                        <div key={comm.id} className={`p-4 rounded-2xl border ${comm.direction === 'ENVIADO' ? 'bg-emerald-500/5 border-emerald-500/10 ml-8' : 'bg-white/5 border-white/10 mr-8'}`}>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] font-bold text-slate-500">{new Date(comm.timestamp).toLocaleString('pt-BR')}</span>
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-slate-400 font-bold">{comm.type}</span>
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed">{comm.message}</p>
                          <p className="text-[9px] text-slate-600 mt-2 font-bold uppercase">Por: {comm.userName}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-slate-600 py-10 italic">Nenhuma comunicação registrada</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="glass-morphism p-6 rounded-[2.5rem] border border-white/5">
                  <h4 className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-4">Ações Rápidas</h4>
                  <div className="space-y-2">
                    <button className="w-full p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all text-xs font-bold flex items-center justify-center gap-2">
                      <MessageCircle size={16} /> Cobrar WhatsApp
                    </button>
                    <button className="w-full p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-all text-xs font-bold flex items-center justify-center gap-2">
                      <FileText size={16} /> Enviar Resumo PDF
                    </button>
                  </div>
                </div>

                <div className="glass-morphism p-6 rounded-[2.5rem] border border-white/5">
                  <h4 className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-4">Aprovação do Fechamento</h4>
                  <select 
                    value={card.statusClient}
                    onChange={(e) => onUpdateCard({ statusClient: e.target.value as any })}
                    className={`w-full p-3 rounded-xl border text-xs font-bold transition-all focus:outline-none ${
                      card.statusClient === 'APROVADO' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                      card.statusClient === 'QUESTIONADO' ? 'bg-orange-500/10 border-orange-500/20 text-orange-400' :
                      'bg-white/5 border-white/10 text-slate-400'
                    }`}
                  >
                    <option value="AGUARDANDO">Aguardando Resposta</option>
                    <option value="APROVADO">Aprovado pelo Cliente</option>
                    <option value="QUESTIONADO">Questionado / Pendente</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        );

      case 'financeiro':
        const suggestion = calculateSuggestedFee(card);
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                <div className="glass-morphism p-8 rounded-[2.5rem] border border-white/5">
                  <h4 className="text-sm font-bold text-white mb-6 flex items-center gap-2">
                    <DollarSign size={18} className="text-emerald-400" /> Gestão de Honorários
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-6 mb-8">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                      <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Valor Ano Anterior</p>
                      <p className="text-lg font-bold text-slate-400">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(card.financial.previousYearValue || 0)}
                      </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                      <p className="text-[10px] text-emerald-400 font-bold uppercase mb-1">Sugestão do Sistema</p>
                      <p className="text-xl font-bold text-white">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(suggestion.total)}
                      </p>
                    </div>
                  </div>

                  <div className="mb-8">
                    <h5 className="text-[10px] text-slate-500 font-bold uppercase mb-3">Composição do Valor Sugerido</h5>
                    <div className="space-y-2">
                      {suggestion.reasons.map((reason, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs text-slate-400 p-2 rounded-lg bg-white/5">
                          <span>{reason.split(': ')[0]}</span>
                          <span className="font-mono text-emerald-400">{reason.split(': ')[1] || ''}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] text-slate-500 font-bold uppercase block mb-2">Valor Final Acordado</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">R$</span>
                        <input 
                          type="number" 
                          value={card.financial.approvedValue || ''}
                          onChange={(e) => onUpdateCard({ financial: { ...card.financial, approvedValue: Number(e.target.value) } })}
                          className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-lg font-bold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="glass-morphism p-6 rounded-[2.5rem] border border-white/5">
                  <h4 className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-4">Modalidade</h4>
                  <select 
                    value={card.financial.modality}
                    onChange={(e) => onUpdateCard({ financial: { ...card.financial, modality: e.target.value as any } })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  >
                    <option value="SIMPLIFICADA">Simplificada</option>
                    <option value="COMPLETA">Completa</option>
                    <option value="NEGOCIACAO">Negociação Especial</option>
                    <option value="CORTESIA">Cortesia</option>
                    <option value="RESIDENTE">Residente</option>
                  </select>
                </div>

                <div className="glass-morphism p-6 rounded-[2.5rem] border border-white/5">
                  <h4 className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-4">Status Financeiro</h4>
                  <div className="grid grid-cols-1 gap-2">
                    {['NAO_GERADO', 'GERADO', 'PAGO'].map(status => (
                      <button 
                        key={status}
                        onClick={() => onUpdateCard({ financial: { ...card.financial, status: status as any } })}
                        className={`p-3 rounded-xl text-[10px] font-bold border transition-all text-center ${
                          card.financial.status === status ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'bg-white/5 border-white/5 text-slate-500'
                        }`}
                      >
                        {status.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'cliente':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <MessageCircle size={24} className="text-blue-400" /> Régua de Comunicação
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  {COMMUNICATION_TEMPLATES.map(template => (
                    <button
                      key={template.id}
                      onClick={() => {
                        const body = template.body(card);
                        navigator.clipboard.writeText(body);
                        onAddCommunication(card.id, { type: template.title, message: body });
                        onAddAuditEntry(card.id, 'COMUNICACAO', `Mensagem copiada: ${template.title}`);
                        alert('Mensagem copiada para o clipboard!');
                      }}
                      className="p-6 text-left glass-morphism rounded-3xl border border-white/5 hover:border-blue-500/30 transition-all group"
                    >
                      <p className="text-sm font-bold text-white group-hover:text-blue-400 mb-1">{template.title}</p>
                      <p className="text-xs text-slate-500 line-clamp-2">Clique para copiar e enviar via WhatsApp/E-mail.</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-xl font-bold text-white mb-6">Histórico de Contatos</h3>
                <div className="space-y-4">
                  {card.communications && card.communications.length > 0 ? (
                    card.communications.map((comm, idx) => (
                      <div key={idx} className="p-4 rounded-2xl bg-white/5 border border-white/5">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-[10px] font-bold text-blue-400 uppercase">{comm.type}</span>
                          <span className="text-[10px] text-slate-500">{new Date(comm.timestamp).toLocaleString()}</span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed italic line-clamp-2">"{comm.message}"</p>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center glass-morphism rounded-3xl border border-dashed border-white/10">
                      <p className="text-xs text-slate-500 font-medium">Nenhuma comunicação registrada ainda.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 'auditoria':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
             <div className="space-y-4">
                {card.auditTrail && card.auditTrail.length > 0 ? (
                  card.auditTrail.map((log, idx) => (
                    <div key={idx} className="flex gap-4 p-4 rounded-2xl hover:bg-white/5 transition-all border-b border-white/5">
                      <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center shrink-0">
                         <History size={16} className="text-slate-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                           <p className="text-sm font-bold text-white">{log.action}</p>
                           <span className="text-[10px] text-slate-500">{new Date(log.timestamp).toLocaleString()}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{log.details}</p>
                        <p className="text-[10px] text-slate-600 mt-2">Usuário: {log.user_name}</p>
                      </div>
                    </div>
                  ))
                ) : (
                   <p className="text-sm text-slate-500 text-center py-10">Nenhum histórico disponível.</p>
                )}
             </div>
          </div>
        );

      default:
        return <div className="text-center py-20 text-slate-500">Conteúdo em desenvolvimento...</div>;
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-[#0f172a] border border-white/10 w-full max-w-7xl h-[90vh] rounded-[3rem] overflow-hidden flex flex-col shadow-2xl"
        >
          {/* Header */}
          <header className="p-8 border-b border-white/5 flex justify-between items-center bg-slate-900/50">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 shadow-lg shadow-emerald-500/5">
                <Target size={32} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{card.clientName}</h2>
                <div className="flex items-center gap-4 mt-1">
                   <p className="text-slate-400 text-sm font-mono">{card.cpf}</p>
                   <span className="w-1 h-1 rounded-full bg-slate-700" />
                   <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest">{currentStep?.title}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
               <button className="p-4 hover:bg-white/5 rounded-2xl text-slate-400 transition-all hover:text-white border border-white/5">
                 <History size={20} />
               </button>
               <button onClick={onClose} className="p-4 hover:bg-red-500/20 rounded-2xl text-slate-400 transition-all hover:text-red-400 border border-white/5">
                 <X size={24} />
               </button>
            </div>
          </header>

          {/* Navegação por Abas */}
          <nav className="flex overflow-x-auto px-8 py-2 border-b border-white/5 bg-slate-900/30 custom-scrollbar shrink-0">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 rounded-2xl transition-all whitespace-nowrap text-sm font-bold relative group
                    ${activeTab === tab.id ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  <Icon size={18} />
                  {tab.label}
                  {activeTab === tab.id && (
                    <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500 rounded-t-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Área de Conteúdo */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-10 bg-slate-900/10 relative">
             <div className="max-w-5xl mx-auto">
               {renderTabContent()}
             </div>
          </div>

          {/* Rodapé */}
          <footer className="p-8 border-t border-white/5 bg-slate-900/80 flex justify-between items-center shrink-0">
             <div className="flex items-center gap-8">
                <div className="flex flex-col">
                   <span className="text-[10px] text-slate-500 font-bold uppercase mb-1">Status Técnico</span>
                   <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                      <span className="text-sm font-bold text-white">{card.statusTech}</span>
                   </div>
                </div>
                <div className="flex flex-col">
                   <span className="text-[10px] text-slate-500 font-bold uppercase mb-1">Responsável</span>
                   <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-[10px] font-bold">
                        {COLLABORATORS.find(c => c.id === card.responsible)?.name?.charAt(0) || 'U'}
                      </div>
                      <span className="text-sm font-bold text-slate-300">
                        {COLLABORATORS.find(c => c.id === card.responsible)?.name || 'Sem responsável'}
                      </span>
                   </div>
                </div>
             </div>
             <div className="flex items-center gap-4">
                <button className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl border border-white/10 transition-all font-bold text-sm">
                  Salvar Rascunho
                </button>
                <button 
                  onClick={onClose}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-10 py-4 rounded-2xl text-sm font-bold transition-all shadow-lg shadow-emerald-500/20"
                >
                  Concluir Visualização
                </button>
             </div>
          </footer>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

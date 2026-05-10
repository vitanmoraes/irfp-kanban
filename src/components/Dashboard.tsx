import React from 'react';
import type { IRPFAppState } from '../types';
import { 
  Users, Clock, Keyboard, Send, CheckCircle2, TrendingUp, 
  AlertCircle, Search, Scale, DollarSign, ShieldAlert,
  BarChart3, PieChart, Activity
} from 'lucide-react';
import { motion } from 'framer-motion';
import { COLLABORATORS } from '../data/collaborators';

interface Props {
  data: IRPFAppState;
}

export const Dashboard: React.FC<Props> = ({ data }) => {
  const allCards = data.columns.flatMap(col => col.cards);
  const totalClients = allCards.length;
  
  // Métricas de Risco e Gargalo
  const criticalRiskCount = allCards.filter(c => c.riskLevel === 'CRITICO').length;
  const highRiskCount = allCards.filter(c => c.riskLevel === 'ALTO').length;
  const stuckCards = allCards.filter(c => c.daysActive > 7).length;

  // Métricas Financeiras
  const totalHonoraries = allCards.reduce((acc, c) => acc + (c.financial.approvedValue || 0), 0);
  const paidHonoraries = allCards.filter(c => c.financial.status === 'PAGO').reduce((acc, c) => acc + (c.financial.approvedValue || 0), 0);

  const stats = [
    { label: 'Total de Clientes', value: totalClients, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Risco Crítico', value: criticalRiskCount, icon: ShieldAlert, color: 'text-red-400', bg: 'bg-red-500/10' },
    { label: 'Cards Parados', value: stuckCards, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'Honorários Totais', value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(totalHonoraries), icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Taxa de Recebimento', value: totalHonoraries > 0 ? `${Math.round((paidHonoraries / totalHonoraries) * 100)}%` : '0%', icon: Activity, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
  ];

  return (
    <div className="flex-1 p-8 overflow-y-auto custom-scrollbar animate-fade-in relative">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2 outfit">IRPF <span className="text-emerald-400">Control Center</span></h2>
            <p className="text-slate-400 text-sm">Monitoramento de produção, risco e qualidade em tempo real</p>
          </div>
          <div className="flex gap-2 bg-white/5 p-1 rounded-xl border border-white/5">
            <button className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-lg shadow-emerald-500/20">Safra 2026</button>
            <button className="px-4 py-2 text-slate-400 hover:text-white rounded-lg text-xs font-bold transition-all">Comparativo 2025</button>
          </div>
        </header>

        {/* Grid de KPIs Principais */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-12">
          {stats.map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-morphism p-6 rounded-[2rem] border border-white/5 relative overflow-hidden group hover:border-white/10 transition-all"
            >
              <div className={`absolute top-0 right-0 w-20 h-20 ${stat.bg} blur-3xl opacity-20 -mr-6 -mt-6 transition-all group-hover:scale-150`} />
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                  <stat.icon size={20} />
                </div>
                <div className="text-[10px] font-bold text-emerald-500 flex items-center gap-1">
                  <TrendingUp size={12} /> +12%
                </div>
              </div>
              <div className="text-2xl font-black text-white mb-1 tracking-tight">{stat.value}</div>
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Funil Operacional */}
          <div className="lg:col-span-2 glass-morphism p-8 rounded-[2.5rem] border border-white/5">
            <h3 className="text-lg font-bold text-white mb-8 flex items-center gap-2">
              <BarChart3 size={20} className="text-emerald-400" /> Funil Operacional
            </h3>
            <div className="space-y-6">
              {data.columns.map((column, i) => {
                const count = column.cards.length;
                const percentage = totalClients > 0 ? (count / totalClients) * 100 : 0;
                const isGargalo = count > 5; // Exemplo de regra de gargalo

                return (
                  <div key={column.id} className="relative">
                    <div className="flex justify-between text-xs mb-2">
                      <div className="flex items-center gap-2">
                         <span className="text-slate-300 font-bold">{column.title}</span>
                         {isGargalo && <span className="text-[8px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-500 font-black">GARGALO</span>}
                      </div>
                      <span className="text-slate-500 font-bold">{count}</span>
                    </div>
                    <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1, delay: i * 0.1 }}
                        className={`h-full rounded-full ${isGargalo ? 'bg-amber-500' : 'bg-emerald-500'}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Distribuição de Complexidade */}
          <div className="glass-morphism p-8 rounded-[2.5rem] border border-white/5 flex flex-col">
            <h3 className="text-lg font-bold text-white mb-8 flex items-center gap-2">
              <PieChart size={20} className="text-indigo-400" /> Complexidade da Carteira
            </h3>
            <div className="flex-1 flex flex-col justify-center gap-6">
               {['SIMPLES', 'MEDIA', 'COMPLEXA', 'CRITICA'].map((level) => {
                 const count = allCards.filter(c => c.complexityScore.classification === level).length;
                 const pct = totalClients > 0 ? Math.round((count / totalClients) * 100) : 0;
                 const colors: any = { SIMPLES: 'bg-emerald-500', MEDIA: 'bg-blue-500', COMPLEXA: 'bg-amber-500', CRITICA: 'bg-red-500' };

                 return (
                   <div key={level} className="flex items-center gap-4">
                     <div className={`w-3 h-3 rounded-full ${colors[level]}`} />
                     <div className="flex-1">
                        <div className="flex justify-between text-[10px] font-bold mb-1">
                           <span className="text-slate-400">{level}</span>
                           <span className="text-white">{pct}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full">
                           <div className={`h-full rounded-full ${colors[level]}`} style={{ width: `${pct}%` }} />
                        </div>
                     </div>
                   </div>
                 );
               })}
            </div>
          </div>
        </div>

        {/* Alertas Críticos */}
        <div className="glass-morphism p-8 rounded-[2.5rem] border border-white/5 mb-12">
           <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <AlertCircle size={20} className="text-red-400" /> Atenção Prioritária
              </h3>
              <button className="text-[10px] font-bold text-slate-500 hover:text-white uppercase tracking-widest">Ver Todos</button>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allCards.filter(c => c.riskLevel === 'CRITICO' || c.daysActive > 10).slice(0, 6).map((card) => (
                <div key={card.id} className="p-4 rounded-2xl bg-white/5 border border-red-500/10 hover:border-red-500/30 transition-all flex items-start gap-4">
                   <div className="p-2 rounded-xl bg-red-500/10 text-red-500">
                      <ShieldAlert size={16} />
                   </div>
                   <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-white truncate">{card.clientName}</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {card.riskLevel === 'CRITICO' ? 'Risco Crítico' : `Parado há ${card.daysActive} dias`}
                      </p>
                   </div>
                   <button className="text-[10px] font-bold text-emerald-400 hover:underline">Agir</button>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

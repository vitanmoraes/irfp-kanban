import React from 'react';
import type { IRPFAppState } from '../types';
import { 
  Users, Clock, TrendingUp, DollarSign, ShieldAlert, Activity
} from 'lucide-react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

interface Props {
  data: IRPFAppState;
  collaborators: any[];
}

export const Dashboard: React.FC<Props> = ({ data, collaborators }) => {
  const [isMounted, setIsMounted] = React.useState(false);
  
  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const allCards = data.columns.flatMap(col => col.cards);
  const totalClients = allCards.length;
  
  // Métricas de Risco e Gargalo
  const criticalRiskCount = allCards.filter(c => c.riskLevel === 'CRITICO').length;
  const stuckCards = allCards.filter(c => c.daysActive > 7).length;

  // Métricas Financeiras
  const totalApproved = allCards.reduce((acc, c) => acc + (c.financial?.approvedValue || 0), 0);
  const totalSuggested = allCards.reduce((acc, c) => acc + (c.complexityScore?.total * 25 + 350 || 0), 0);

  // Estatísticas de Produtividade por Colaborador
  const productivityStats = collaborators.map(col => {
    const stats = {
      name: col.name,
      preparation: allCards.filter(c => c.executors?.preparation === col.id).length,
      typing: allCards.filter(c => c.executors?.typing === col.id).length,
      conference: allCards.filter(c => c.executors?.conference === col.id).length,
      analysis: allCards.filter(c => c.executors?.analysis === col.id).length,
      transmission: allCards.filter(c => c.executors?.transmission === col.id).length,
    };
    return {
      ...stats,
      total: stats.preparation + stats.typing + stats.conference + stats.analysis + stats.transmission
    };
  }).sort((a, b) => b.total - a.total);

  const stats = [
    { label: 'Total de Clientes', value: totalClients, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Risco Crítico', value: criticalRiskCount, icon: ShieldAlert, color: 'text-red-400', bg: 'bg-red-500/10' },
    { label: 'Cards Parados', value: stuckCards, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'Honorários Totais', value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(totalApproved), icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Faturamento Sugerido', value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(totalSuggested), icon: TrendingUp, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
  ];


  // Dados para os Gráficos
  const riskData = [
    { name: 'Baixo', value: allCards.filter(c => c.riskLevel === 'BAIXO').length, color: '#10b981' },
    { name: 'Médio', value: allCards.filter(c => c.riskLevel === 'MEDIO').length, color: '#f59e0b' },
    { name: 'Alto', value: allCards.filter(c => c.riskLevel === 'ALTO').length, color: '#f97316' },
    { name: 'Crítico', value: allCards.filter(c => c.riskLevel === 'CRITICO').length, color: '#ef4444' },
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
              className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 p-5 rounded-3xl border border-white/10 relative overflow-hidden group hover:border-emerald-500/20 hover:-translate-y-1 transition-all duration-300 shadow-xl"
            >
              <div className={`absolute -right-4 -top-4 w-24 h-24 ${stat.bg} blur-[64px] opacity-20 group-hover:opacity-40 transition-opacity`} />
              
              <div className="flex justify-between items-start mb-6">
                <div className={`w-10 h-10 rounded-full ${stat.bg} ${stat.color} flex items-center justify-center border border-white/5 shadow-inner`}>
                  <stat.icon size={18} />
                </div>
                <div className="text-[10px] font-bold text-emerald-500/60 bg-emerald-500/5 px-2 py-1 rounded-full border border-emerald-500/10">
                  +12%
                </div>
              </div>

              <div>
                <div className="text-3xl font-black text-white leading-none mb-2 tabular-nums tracking-tighter">
                  {stat.value}
                </div>
                <div className="text-[9px] text-slate-500 font-black uppercase tracking-[0.15em] leading-none">
                  {stat.label}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Gráfico de Risco - Donut Robusto */}
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/80 p-8 rounded-[2rem] border border-white/10 h-[440px] flex flex-col group">
            <div className="mb-2">
              <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                Distribuição de Risco
              </h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Análise de Criticidade</p>
            </div>
            
            <div className="flex-1 relative min-h-[200px] flex items-center justify-center">
              {isMounted && totalClients > 0 && (
                <>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={riskData}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={90}
                        paddingAngle={8}
                        dataKey="value"
                        stroke="none"
                      >
                        {riskData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Centro do Donut */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <div className="text-4xl font-black text-white leading-none">{totalClients}</div>
                    <div className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter mt-1">Total</div>
                  </div>
                </>
              )}
              {totalClients === 0 && (
                <div className="text-slate-600 text-xs font-bold uppercase tracking-widest">Sem dados</div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-3 mt-auto pt-6 border-t border-white/5">
               {riskData.map(r => (
                 <div key={r.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.1)]" style={{ backgroundColor: r.color }} />
                      <span className="text-[10px] text-slate-400 font-bold uppercase">{r.name}</span>
                    </div>
                    <span className="text-xs font-mono text-white font-bold">{r.value}</span>
                 </div>
               ))}
            </div>
          </div>

          {/* Funil Operacional - Mais Compacto e Visual */}
          <div className="lg:col-span-2 bg-gradient-to-br from-slate-800/50 to-slate-900/80 p-8 rounded-[2rem] border border-white/10">
            <div className="flex justify-between items-center mb-1">
               <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Fluxo de Produção
              </h3>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <Activity size={12} className="text-emerald-400" />
                <span className="text-[10px] font-black text-emerald-400 uppercase">Live</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-8">Status por Coluna do Kanban</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
              {data.columns.map((column) => {
                const count = column.cards.length;
                const percentage = totalClients > 0 ? (count / totalClients) * 100 : 0;
                const isGargalo = count > 5;

                return (
                  <div key={column.id} className="group">
                    <div className="flex justify-between text-[11px] mb-2 font-bold uppercase tracking-tight">
                      <span className={count > 0 ? 'text-slate-200' : 'text-slate-600 transition-colors group-hover:text-slate-400'}>
                        {column.title}
                      </span>
                      <span className={count > 0 ? 'text-white' : 'text-slate-700'}>{count}</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        className={`h-full rounded-full ${isGargalo ? 'bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.4)]' : 'bg-emerald-500'}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Ranking e Produtividade - Tabela Refinada */}
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/80 p-8 rounded-[2rem] border border-white/10 mb-12">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">Ranking de Produtividade</h3>
              <p className="text-xs text-slate-500">Distribuição de ações técnicas por colaborador</p>
            </div>
            <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
              <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500" /> Baixa</span>
              <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Ativa</span>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5">
                  <th className="pb-4">Colaborador</th>
                  <th className="pb-4 text-center">Prep</th>
                  <th className="pb-4 text-center">Digit</th>
                  <th className="pb-4 text-center">Conf</th>
                  <th className="pb-4 text-center">Anal</th>
                  <th className="pb-4 text-center">Trans</th>
                  <th className="pb-4 text-right pr-4">Total Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {productivityStats.map((col, i) => (
                  <tr key={i} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-[11px] font-bold text-slate-400 group-hover:border-emerald-500/30 transition-colors">
                          {col.name.charAt(0)}
                        </div>
                        <span className={`text-sm font-bold ${col.total > 0 ? 'text-white' : 'text-slate-600'}`}>{col.name}</span>
                      </div>
                    </td>
                    {[col.preparation, col.typing, col.conference, col.analysis, col.transmission].map((val, idx) => (
                      <td key={idx} className="py-4 text-center">
                        <span className={`text-xs font-mono font-bold ${val > 0 ? 'text-emerald-400' : 'text-slate-800'}`}>
                          {val}
                        </span>
                      </td>
                    ))}
                    <td className="py-4 text-right pr-4">
                      <div className="inline-flex items-center gap-3">
                        <span className={`text-sm font-black ${col.total > 10 ? 'text-emerald-400' : col.total > 0 ? 'text-white' : 'text-slate-800'}`}>
                          {col.total}
                        </span>
                        <div className="w-12 h-1 bg-white/5 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-emerald-500/50" 
                            style={{ width: `${(col.total / (Math.max(...productivityStats.map(s => s.total)) || 1)) * 100}%` }} 
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

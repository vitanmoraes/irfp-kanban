import React from 'react';
import type { IRPFAppState } from '../types';
import { 
  Users, Clock, Keyboard, Send, CheckCircle2, TrendingUp, 
  AlertCircle, Search, Scale, DollarSign, ShieldAlert,
  BarChart3, PieChart as PieIcon, Activity, Layout
} from 'lucide-react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

interface Props {
  data: IRPFAppState;
  groups: any[];
  collaborators: any[];
}

export const Dashboard: React.FC<Props> = ({ data, groups, collaborators }) => {
  const [isMounted, setIsMounted] = React.useState(false);
  
  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const allCards = data.columns.flatMap(col => col.cards);
  const totalClients = allCards.length;
  
  // Métricas de Risco e Gargalo
  const criticalRiskCount = allCards.filter(c => c.riskLevel === 'CRITICO').length;
  const highRiskCount = allCards.filter(c => c.riskLevel === 'ALTO').length;
  const stuckCards = allCards.filter(c => c.daysActive > 7).length;

  // Métricas Financeiras
  const totalApproved = allCards.reduce((acc, c) => acc + (c.financial?.approvedValue || 0), 0);
  const paidHonoraries = allCards.filter(c => c.financial?.status === 'PAGO').reduce((acc, c) => acc + (c.financial?.approvedValue || 0), 0);
  const totalSuggested = allCards.reduce((acc, c) => acc + (c.complexityScore?.total * 25 + 350 || 0), 0);

  // Métricas por Grupo
  const groupStats = groups.map(group => {
    const groupCards = allCards.filter(c => c.groupId === group.id);
    const groupRevenue = groupCards.reduce((acc, c) => acc + (c.financial?.approvedValue || 0), 0);
    return {
      name: group.name.replace('Team ', ''),
      cards: groupCards.length,
      faturamento: groupRevenue,
      color: '#6366f1'
    };
  });

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
          {/* Gráfico de Risco */}
          <div className="glass-morphism p-8 rounded-[2.5rem] border border-white/5 h-[400px] flex flex-col">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <ShieldAlert size={20} className="text-red-400" /> Distribuição de Risco
            </h3>
            <div className="flex-1">
              {isMounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={riskData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={8}
                      dataKey="value"
                    >
                      {riskData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem' }}
                      itemStyle={{ color: '#fff', fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
               {riskData.map(r => (
                 <div key={r.name} className="flex items-center gap-2 text-[10px] text-slate-500 font-bold">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: r.color }} />
                    {r.name.toUpperCase()}: {r.value}
                 </div>
               ))}
            </div>
          </div>

          {/* Funil Operacional */}
          <div className="lg:col-span-2 glass-morphism p-8 rounded-[2.5rem] border border-white/5">
            <div className="flex justify-between items-center mb-8">
               <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <BarChart3 size={20} className="text-emerald-400" /> Funil Operacional
              </h3>
              <Layout size={18} className="text-slate-600" />
            </div>
            <div className="space-y-6">
              {data.columns.map((column, i) => {
                const count = column.cards.length;
                const percentage = totalClients > 0 ? (count / totalClients) * 100 : 0;
                const isGargalo = count > 5;

                return (
                  <div key={column.id} className="relative">
                    <div className="flex justify-between text-xs mb-2">
                      <div className="flex items-center gap-2">
                         <span className="text-slate-300 font-bold">{column.title}</span>
                         {isGargalo && <span className="text-[8px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-500 font-black tracking-tighter">ALTA DEMANDA</span>}
                      </div>
                      <span className="text-white font-mono">{count}</span>
                    </div>
                    <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-0.5">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className={`h-full rounded-full ${isGargalo ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-gradient-to-r from-emerald-500 to-blue-500'}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Performance por Time */}
        <div className="glass-morphism p-8 rounded-[2.5rem] border border-white/5 mb-12">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <BarChart3 size={20} className="text-indigo-400" /> Performance por Time
            </h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold">
                <div className="w-2 h-2 rounded bg-indigo-500" /> CLIENTES
              </div>
              <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold">
                <div className="w-2 h-2 rounded bg-emerald-500" /> FATURAMENTO
              </div>
            </div>
          </div>
          <div className="h-[300px] w-full">
            {isMounted && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={groupStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 10 }}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem' }}
                    itemStyle={{ fontSize: '12px' }}
                  />
                  <Bar dataKey="cards" fill="#6366f1" radius={[4, 4, 0, 0]} name="Clientes" />
                  <Bar dataKey="faturamento" fill="#10b981" radius={[4, 4, 0, 0]} name="Faturamento (R$)" />
                </BarChart>
              </ResponsiveContainer>
            )}
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

        {/* Ranking de Produtividade por Etapa */}
        <div className="glass-morphism p-8 rounded-[2.5rem] border border-white/5 mb-12">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Activity size={20} className="text-emerald-400" /> Ranking de Produtividade Individual
            </h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Total de Ações Técnicas</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="pb-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Colaborador</th>
                  <th className="pb-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Preparação</th>
                  <th className="pb-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Digitação</th>
                  <th className="pb-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Conferência</th>
                  <th className="pb-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Análise</th>
                  <th className="pb-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Transmissão</th>
                  <th className="pb-4 text-[10px] font-bold text-emerald-500 uppercase tracking-widest text-center">Total</th>
                </tr>
              </thead>
              <tbody>
                {productivityStats.map((col, i) => (
                  <tr key={i} className="border-b border-white/5 group hover:bg-white/5 transition-all">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-[10px] font-black text-slate-400 border border-white/5">
                          {col.name.charAt(0)}
                        </div>
                        <span className="text-sm font-bold text-white">{col.name}</span>
                      </div>
                    </td>
                    <td className="py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${col.preparation > 0 ? 'bg-blue-500/10 text-blue-400' : 'text-slate-700'}`}>
                        {col.preparation}
                      </span>
                    </td>
                    <td className="py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${col.typing > 0 ? 'bg-amber-500/10 text-amber-400' : 'text-slate-700'}`}>
                        {col.typing}
                      </span>
                    </td>
                    <td className="py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${col.conference > 0 ? 'bg-indigo-500/10 text-indigo-400' : 'text-slate-700'}`}>
                        {col.conference}
                      </span>
                    </td>
                    <td className="py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${col.analysis > 0 ? 'bg-purple-500/10 text-purple-400' : 'text-slate-700'}`}>
                        {col.analysis}
                      </span>
                    </td>
                    <td className="py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${col.transmission > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'text-slate-700'}`}>
                        {col.transmission}
                      </span>
                    </td>
                    <td className="py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-sm font-black text-white">{col.total}</span>
                        <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-emerald-500" 
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

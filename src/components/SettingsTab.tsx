import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Users, CreditCard, Shield, Plus, Edit2, Trash2 } from 'lucide-react';
import { COLLABORATORS } from '../data/collaborators';

export const SettingsTab: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'colaboradores' | 'tabelas' | 'parametros'>('colaboradores');

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0f172a] text-slate-200 overflow-hidden">
      <header className="px-8 py-6 border-b border-white/5 bg-[#0f172a]/60 backdrop-blur-xl z-10 flex-shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
              <Settings size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white outfit tracking-tight">Configurações</h2>
              <p className="text-sm text-slate-400">Gerenciamento de cadastros, tabelas e parâmetros do sistema</p>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Menu Lateral de Configurações */}
        <aside className="w-64 border-r border-white/5 bg-slate-900/30 p-6 flex flex-col gap-2 overflow-y-auto custom-scrollbar flex-shrink-0">
          <button
            onClick={() => setActiveSection('colaboradores')}
            className={`flex items-center gap-3 p-4 rounded-2xl transition-all font-medium text-sm ${activeSection === 'colaboradores' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
          >
            <Users size={18} />
            Colaboradores
          </button>
          <button
            onClick={() => setActiveSection('tabelas')}
            className={`flex items-center gap-3 p-4 rounded-2xl transition-all font-medium text-sm ${activeSection === 'tabelas' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
          >
            <CreditCard size={18} />
            Tabelas de Cobrança
          </button>
          <button
            onClick={() => setActiveSection('parametros')}
            className={`flex items-center gap-3 p-4 rounded-2xl transition-all font-medium text-sm ${activeSection === 'parametros' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
          >
            <Shield size={18} />
            Parâmetros Gerais
          </button>
        </aside>

        {/* Área de Conteúdo da Configuração */}
        <main className="flex-1 p-8 overflow-y-auto custom-scrollbar relative bg-slate-900/10">
          <div className="max-w-4xl mx-auto">
            {activeSection === 'colaboradores' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Users className="text-indigo-400" size={20} />
                    Gestão de Equipe
                  </h3>
                  <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-500/20">
                    <Plus size={16} /> Novo Colaborador
                  </button>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  {COLLABORATORS.map(colab => (
                    <div key={colab.id} className="glass-morphism p-5 rounded-2xl border border-white/5 flex items-center justify-between group hover:border-indigo-500/30 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-lg border border-indigo-500/30">
                          {colab.name.substring(0, 1)}
                        </div>
                        <div>
                          <h4 className="text-white font-bold text-base">{colab.name}</h4>
                          <p className="text-sm text-slate-400">{colab.role} <span className="text-slate-600 mx-1">•</span> <span className="text-indigo-400/80 text-xs uppercase tracking-wider font-bold">{colab.level}</span></p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <button className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all">
                          <Edit2 size={16} />
                        </button>
                        <button className="p-2 hover:bg-red-500/20 rounded-lg text-slate-400 hover:text-red-400 transition-all">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeSection === 'tabelas' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <CreditCard className="text-indigo-400" size={20} />
                    Tabelas de Cobrança
                  </h3>
                  <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-500/20">
                    <Plus size={16} /> Nova Regra
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Modalidade Completa */}
                  <div className="glass-morphism p-6 rounded-3xl border border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full -mr-10 -mt-10" />
                    <h4 className="text-lg font-bold text-white mb-2">Tabela Completa</h4>
                    <p className="text-sm text-slate-400 mb-6">Declaração com deduções legais, dependentes e livro caixa.</p>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center border-b border-white/5 pb-3">
                        <span className="text-sm text-slate-300">Valor Base</span>
                        <span className="text-emerald-400 font-bold">R$ 350,00</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-white/5 pb-3">
                        <span className="text-sm text-slate-300">Por Dependente Extra</span>
                        <span className="text-slate-400 font-medium">+ R$ 50,00</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-300">Renda Variável (Bolsa)</span>
                        <span className="text-slate-400 font-medium">+ R$ 150,00</span>
                      </div>
                    </div>
                  </div>

                  {/* Modalidade Simplificada */}
                  <div className="glass-morphism p-6 rounded-3xl border border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full -mr-10 -mt-10" />
                    <h4 className="text-lg font-bold text-white mb-2">Tabela Simplificada</h4>
                    <p className="text-sm text-slate-400 mb-6">Modelo simplificado com desconto padrão de 20%.</p>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center border-b border-white/5 pb-3">
                        <span className="text-sm text-slate-300">Valor Base</span>
                        <span className="text-blue-400 font-bold">R$ 150,00</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-300">Sem acréscimos</span>
                        <span className="text-slate-500 text-xs uppercase font-bold">Padrão</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeSection === 'parametros' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                 <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
                    <Shield className="text-indigo-400" size={20} />
                    Parâmetros do Sistema
                 </h3>
                 <div className="glass-morphism p-8 rounded-3xl border border-white/5">
                    <p className="text-slate-400 text-center py-10">Módulo de parâmetros em desenvolvimento.</p>
                 </div>
              </motion.div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

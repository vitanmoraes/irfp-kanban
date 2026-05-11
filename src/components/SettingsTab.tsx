import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Users, CreditCard, Shield, Plus, Edit2, Trash2, X, Save } from 'lucide-react';

interface SettingsProps {
  groups: any[];
  collaborators: any[];
  onAddGroup: (group: any) => void;
  onUpdateGroup: (id: string, updates: any) => void;
  onDeleteGroup: (id: string) => void;
  onAddCollaborator: (colab: any) => void;
  onUpdateCollaborator: (id: string, updates: any) => void;
  onDeleteCollaborator: (id: string) => void;
}

interface BillingTable {
  id: string;
  name: string;
  modality: 'COMPLETA' | 'SIMPLIFICADA';
  baseValue: number;
  complexityValue: number;
  active: boolean;
}

export const SettingsTab: React.FC<SettingsProps> = ({ 
  groups, collaborators, onAddGroup, onUpdateGroup, onDeleteGroup,
  onAddCollaborator, onUpdateCollaborator, onDeleteCollaborator
}) => {
  const [activeSection, setActiveSection] = useState<'colaboradores' | 'grupos' | 'tabelas' | 'parametros'>('colaboradores');
  
  // Estados para Billing Tables (Local + LocalStorage)
  const [billingTables, setBillingTables] = useState<BillingTable[]>(() => {
    const saved = localStorage.getItem('irpf_kanban_billing_tables');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'Tabela Completa', modality: 'COMPLETA', baseValue: 350, complexityValue: 50, active: true },
      { id: '2', name: 'Tabela Simplificada', modality: 'SIMPLIFICADA', baseValue: 150, complexityValue: 0, active: true }
    ];
  });

  useEffect(() => {
    localStorage.setItem('irpf_kanban_billing_tables', JSON.stringify(billingTables));
  }, [billingTables]);

  // Estados para Modais e Edição
  const [isColabModalOpen, setIsColabModalOpen] = useState(false);
  const [editingColab, setEditingColab] = useState<any>(null);

  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<any>(null);

  const [isBillingModalOpen, setIsBillingModalOpen] = useState(false);
  const [editingBilling, setEditingBilling] = useState<any>(null);

  // --- Handlers Colaboradores ---
  const handleSaveColab = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const colabData = {
      name: formData.get('name'),
      role: formData.get('role'),
      level: formData.get('level'),
      groupId: formData.get('groupId'),
      active: formData.get('active') === 'on'
    };

    if (editingColab) {
      onUpdateCollaborator(editingColab.id, colabData);
    } else {
      onAddCollaborator({ ...colabData, id: crypto.randomUUID() });
    }
    setIsColabModalOpen(false);
    setEditingColab(null);
  };

  const handleDeleteColab = (id: string, name: string) => {
    if (confirm(`Tem certeza que deseja excluir o colaborador ${name}?`)) {
      onDeleteCollaborator(id);
    }
  };

  // --- Handlers Grupos ---
  const handleSaveGroup = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const groupData = {
      name: formData.get('name'),
      description: formData.get('description')
    };

    if (editingGroup) {
      onUpdateGroup(editingGroup.id, groupData);
    } else {
      onAddGroup({ ...groupData, id: crypto.randomUUID() });
    }
    setIsGroupModalOpen(false);
    setEditingGroup(null);
  };

  const handleDeleteGroup = (id: string, name: string) => {
    // Validação: verificar se há colaboradores vinculados
    const linkedColabs = collaborators.filter(c => c.groupId === id);
    if (linkedColabs.length > 0) {
      alert(`Não é possível excluir o grupo "${name}" pois existem ${linkedColabs.length} colaboradores vinculados a ele.`);
      return;
    }

    if (confirm(`Tem certeza que deseja excluir o grupo ${name}?`)) {
      onDeleteGroup(id);
    }
  };

  // --- Handlers Billing Tables ---
  const handleSaveBilling = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const billingData: BillingTable = {
      id: editingBilling?.id || crypto.randomUUID(),
      name: formData.get('name') as string,
      modality: formData.get('modality') as 'COMPLETA' | 'SIMPLIFICADA',
      baseValue: Number(formData.get('baseValue')),
      complexityValue: Number(formData.get('complexityValue')),
      active: formData.get('active') === 'on'
    };

    if (editingBilling) {
      setBillingTables(prev => prev.map(t => t.id === editingBilling.id ? billingData : t));
    } else {
      setBillingTables(prev => [...prev, billingData]);
    }
    setIsBillingModalOpen(false);
    setEditingBilling(null);
  };

  const handleDeleteBilling = (id: string, name: string) => {
    if (confirm(`Tem certeza que deseja excluir a regra "${name}"?`)) {
      setBillingTables(prev => prev.filter(t => t.id !== id));
    }
  };

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
          {[
            { id: 'colaboradores', icon: Users, label: 'Colaboradores' },
            { id: 'grupos', icon: Settings, label: 'Grupos de Execução' },
            { id: 'tabelas', icon: CreditCard, label: 'Tabelas de Cobrança' },
            { id: 'parametros', icon: Shield, label: 'Parâmetros Gerais' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id as any)}
              className={`flex items-center gap-3 p-4 rounded-2xl transition-all font-medium text-sm ${
                activeSection === item.id 
                  ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </aside>

        {/* Área de Conteúdo da Configuração */}
        <main className="flex-1 p-8 overflow-y-auto custom-scrollbar relative bg-slate-900/10">
          <div className="max-w-4xl mx-auto">
            {/* --- SEÇÃO COLABORADORES --- */}
            {activeSection === 'colaboradores' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Users className="text-indigo-400" size={20} />
                    Gestão de Equipe
                  </h3>
                  <button 
                    onClick={() => { setEditingColab(null); setIsColabModalOpen(true); }}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-500/20"
                  >
                    <Plus size={16} /> Novo Colaborador
                  </button>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  {collaborators.map(colab => (
                    <div key={colab.id} className="glass-morphism p-5 rounded-2xl border border-white/5 flex items-center justify-between group hover:border-indigo-500/30 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-lg border border-indigo-500/30">
                          {colab.name.substring(0, 1)}
                        </div>
                        <div>
                          <h4 className="text-white font-bold text-base flex items-center gap-2">
                            {colab.name}
                            {!colab.active && <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full uppercase">Inativo</span>}
                          </h4>
                          <p className="text-sm text-slate-400">
                            {colab.role} 
                            <span className="text-slate-600 mx-1">•</span> 
                            <span className="text-indigo-400/80 text-xs uppercase tracking-wider font-bold">{colab.level}</span>
                            {colab.groupId && (
                              <>
                                <span className="text-slate-600 mx-1">•</span>
                                <span className="text-slate-500 text-xs">{groups.find(g => g.id === colab.groupId)?.name || 'Sem Grupo'}</span>
                              </>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <button 
                          onClick={() => { setEditingColab(colab); setIsColabModalOpen(true); }}
                          className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteColab(colab.id, colab.name)}
                          className="p-2 hover:bg-red-500/20 rounded-lg text-slate-400 hover:text-red-400 transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* --- SEÇÃO GRUPOS --- */}
            {activeSection === 'grupos' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Settings className="text-indigo-400" size={20} />
                    Grupos de Execução
                  </h3>
                  <button 
                    onClick={() => { setEditingGroup(null); setIsGroupModalOpen(true); }}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-500/20"
                  >
                    <Plus size={16} /> Novo Grupo
                  </button>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  {groups.map(group => (
                    <div key={group.id} className="glass-morphism p-5 rounded-2xl border border-white/5 flex items-center justify-between group hover:border-indigo-500/30 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                          <Settings size={20} />
                        </div>
                        <div>
                          <h4 className="text-white font-bold text-base">{group.name}</h4>
                          <p className="text-sm text-slate-400">{group.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <button 
                          onClick={() => { setEditingGroup(group); setIsGroupModalOpen(true); }}
                          className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteGroup(group.id, group.name)}
                          className="p-2 hover:bg-red-500/20 rounded-lg text-slate-400 hover:text-red-400 transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* --- SEÇÃO TABELAS --- */}
            {activeSection === 'tabelas' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <CreditCard className="text-indigo-400" size={20} />
                    Tabelas de Cobrança
                  </h3>
                  <button 
                    onClick={() => { setEditingBilling(null); setIsBillingModalOpen(true); }}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-500/20"
                  >
                    <Plus size={16} /> Nova Regra
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {billingTables.map(table => (
                    <div key={table.id} className="glass-morphism p-6 rounded-3xl border border-white/5 relative overflow-hidden group hover:border-indigo-500/30 transition-all">
                      <div className={`absolute top-0 right-0 w-32 h-32 ${table.modality === 'COMPLETA' ? 'bg-emerald-500/10' : 'bg-blue-500/10'} blur-3xl rounded-full -mr-10 -mt-10`} />
                      
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="text-lg font-bold text-white mb-1">{table.name}</h4>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${table.modality === 'COMPLETA' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'}`}>
                            {table.modality}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                          <button 
                            onClick={() => { setEditingBilling(table); setIsBillingModalOpen(true); }}
                            className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button 
                            onClick={() => handleDeleteBilling(table.id, table.name)}
                            className="p-1.5 hover:bg-red-500/20 rounded-lg text-slate-400 hover:text-red-400 transition-all"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-4 relative z-10">
                        <div className="flex justify-between items-center border-b border-white/5 pb-3">
                          <span className="text-sm text-slate-300">Valor Base</span>
                          <span className={`font-bold ${table.modality === 'COMPLETA' ? 'text-emerald-400' : 'text-blue-400'}`}>
                            R$ {table.baseValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-300">Valor p/ Ponto</span>
                          <span className="text-slate-400 font-medium">
                            R$ {table.complexityValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        {!table.active && (
                          <div className="pt-2 border-t border-white/5 mt-2 flex justify-center">
                            <span className="text-[10px] text-red-400/60 uppercase font-bold">Inativa</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* --- SEÇÃO PARÂMETROS --- */}
            {activeSection === 'parametros' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                 <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
                    <Shield className="text-indigo-400" size={20} />
                    Parâmetros do Sistema
                 </h3>
                 <div className="glass-morphism p-8 rounded-3xl border border-white/5">
                    <div className="space-y-6 max-w-md mx-auto">
                      <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                        <div>
                          <p className="text-sm font-bold text-white">Ano-Calendário Padrão</p>
                          <p className="text-xs text-slate-400">Ano base para novos processos</p>
                        </div>
                        <select className="bg-slate-800 border border-white/10 rounded-lg px-3 py-1 text-sm outline-none focus:ring-1 focus:ring-indigo-500">
                          <option>2024</option>
                          <option>2025</option>
                        </select>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                        <div>
                          <p className="text-sm font-bold text-white">Notificações WhatsApp</p>
                          <p className="text-xs text-slate-400">Status automático para clientes</p>
                        </div>
                        <div className="w-10 h-5 bg-emerald-500/20 rounded-full relative p-1 cursor-not-allowed">
                          <div className="w-3 h-3 bg-emerald-500 rounded-full translate-x-5 transition-all" />
                        </div>
                      </div>
                      <p className="text-slate-500 text-xs text-center">Outros parâmetros em desenvolvimento.</p>
                    </div>
                 </div>
              </motion.div>
            )}
          </div>
        </main>
      </div>

      {/* --- MODAIS --- */}
      <AnimatePresence>
        {/* Modal Colaborador */}
        {isColabModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
              onClick={() => setIsColabModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-[#1e293b] rounded-3xl border border-white/10 shadow-2xl overflow-hidden"
            >
              <form onSubmit={handleSaveColab}>
                <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between">
                  <h4 className="text-xl font-bold text-white">{editingColab ? 'Alterar Colaborador' : 'Novo Colaborador'}</h4>
                  <button type="button" onClick={() => setIsColabModalOpen(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
                </div>
                <div className="p-8 space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nome Completo</label>
                    <input name="name" defaultValue={editingColab?.name} required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-indigo-500/50" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cargo / Função</label>
                      <input name="role" defaultValue={editingColab?.role} required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-indigo-500/50" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nível</label>
                      <select name="level" defaultValue={editingColab?.level || 'JUNIOR'} className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-indigo-500/50">
                        <option value="ESTAGIARIO">Estagiário</option>
                        <option value="JUNIOR">Júnior</option>
                        <option value="PLENO">Pleno</option>
                        <option value="SENIOR">Sênior</option>
                        <option value="ESPECIALISTA">Especialista</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Grupo de Execução</label>
                    <select name="groupId" defaultValue={editingColab?.groupId} className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-indigo-500/50">
                      <option value="">Sem Grupo</option>
                      {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                    </select>
                  </div>
                  <div className="flex items-center gap-3 py-2">
                    <input type="checkbox" name="active" defaultChecked={editingColab ? editingColab.active : true} className="w-4 h-4 rounded border-white/10 bg-white/5 text-indigo-600 focus:ring-indigo-500" />
                    <span className="text-sm text-slate-300">Colaborador Ativo</span>
                  </div>
                </div>
                <div className="px-8 py-6 bg-slate-900/50 flex justify-end gap-3">
                  <button type="button" onClick={() => setIsColabModalOpen(false)} className="px-6 py-2 text-slate-400 hover:text-white font-bold text-sm">Cancelar</button>
                  <button type="submit" className="flex items-center gap-2 px-8 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-500/20">
                    <Save size={16} /> Salvar Alterações
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Modal Grupo */}
        {isGroupModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
              onClick={() => setIsGroupModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-[#1e293b] rounded-3xl border border-white/10 shadow-2xl overflow-hidden"
            >
              <form onSubmit={handleSaveGroup}>
                <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between">
                  <h4 className="text-xl font-bold text-white">{editingGroup ? 'Alterar Grupo' : 'Novo Grupo'}</h4>
                  <button type="button" onClick={() => setIsGroupModalOpen(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
                </div>
                <div className="p-8 space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nome do Grupo</label>
                    <input name="name" defaultValue={editingGroup?.name} required placeholder="Ex: Núcleo Financeiro" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-indigo-500/50" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Descrição</label>
                    <textarea name="description" defaultValue={editingGroup?.description} required rows={3} placeholder="Descreva a responsabilidade deste time..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none" />
                  </div>
                </div>
                <div className="px-8 py-6 bg-slate-900/50 flex justify-end gap-3">
                  <button type="button" onClick={() => setIsGroupModalOpen(false)} className="px-6 py-2 text-slate-400 hover:text-white font-bold text-sm">Cancelar</button>
                  <button type="submit" className="flex items-center gap-2 px-8 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-500/20">
                    <Save size={16} /> Salvar Grupo
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Modal Billing */}
        {isBillingModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
              onClick={() => setIsBillingModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-[#1e293b] rounded-3xl border border-white/10 shadow-2xl overflow-hidden"
            >
              <form onSubmit={handleSaveBilling}>
                <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between">
                  <h4 className="text-xl font-bold text-white">{editingBilling ? 'Alterar Regra' : 'Nova Regra de Cobrança'}</h4>
                  <button type="button" onClick={() => setIsBillingModalOpen(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
                </div>
                <div className="p-8 space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nome da Regra</label>
                    <input name="name" defaultValue={editingBilling?.name} required placeholder="Ex: Tabela Platinum" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-indigo-500/50" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Modalidade</label>
                      <select name="modality" defaultValue={editingBilling?.modality || 'COMPLETA'} className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-indigo-500/50">
                        <option value="COMPLETA">Completa</option>
                        <option value="SIMPLIFICADA">Simplificada</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Valor Base (R$)</label>
                      <input type="number" step="0.01" name="baseValue" defaultValue={editingBilling?.baseValue} required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-indigo-500/50" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Valor p/ Ponto de Complexidade (R$)</label>
                    <input type="number" step="0.01" name="complexityValue" defaultValue={editingBilling?.complexityValue} required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-indigo-500/50" />
                  </div>
                  <div className="flex items-center gap-3 py-2">
                    <input type="checkbox" name="active" defaultChecked={editingBilling ? editingBilling.active : true} className="w-4 h-4 rounded border-white/10 bg-white/5 text-indigo-600 focus:ring-indigo-500" />
                    <span className="text-sm text-slate-300">Regra Ativa</span>
                  </div>
                </div>
                <div className="px-8 py-6 bg-slate-900/50 flex justify-end gap-3">
                  <button type="button" onClick={() => setIsBillingModalOpen(false)} className="px-6 py-2 text-slate-400 hover:text-white font-bold text-sm">Cancelar</button>
                  <button type="submit" className="flex items-center gap-2 px-8 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-500/20">
                    <Save size={16} /> Salvar Regra
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

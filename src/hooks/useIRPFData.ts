import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { IRPFAppState, IRPFCard } from '../types';
import { initialData } from '../mockData';

// Mude para false quando quiser usar o Supabase real
const IS_OFFLINE_MODE = false;

export const useIRPFData = () => {
  const [data, setData] = useState<IRPFAppState>(initialData);
  const [groups, setGroups] = useState<any[]>([]);
  const [collaborators, setCollaborators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 1. Carregar dados
  const fetchData = async (silent = false) => {
    if (IS_OFFLINE_MODE) {
      const saved = localStorage.getItem('irpf_kanban_test_data');
      const savedGroups = localStorage.getItem('irpf_kanban_groups');

      if (saved) setData(JSON.parse(saved));
      if (savedGroups) setGroups(JSON.parse(savedGroups));

      // Fallback para colaboradores locais em modo offline
      import('../data/collaborators').then(m => setCollaborators(m.COLLABORATORS));
      import('../data/groups').then(m => setGroups(m.EXECUTION_GROUPS));

      setLoading(false);
      return;
    }

    try {
      if (!silent) setLoading(true);

      // 1. Buscar Grupos e Colaboradores
      const [groupsRes, collaboratorsRes] = await Promise.all([
        supabase.from('execution_groups').select('*').order('name'),
        supabase.from('collaborators').select('*').order('name')
      ]);

      if (groupsRes.data) setGroups(groupsRes.data);
      if (collaboratorsRes.data) {
        // Mapear de volta para camelCase se necessário (groupId)
        const mappedCollaborators = collaboratorsRes.data.map((c: any) => ({
          ...c,
          groupId: c.group_id
        }));
        setCollaborators(mappedCollaborators);
      }

      // 2. Buscar Processos com Joins
      const { data: processes, error: pError } = await supabase
        .from('irpf_processes')
        .select(`
          *,
          sub_tasks (*),
          communications (*),
          audit_trail (*)
        `)
        .order('updated_at', { ascending: false });

      if (pError) throw pError;

      if (processes) {
        const columns = initialData.columns.map(col => ({
          ...col,
          cards: processes
            .filter(p => p.column_id === col.id)
            .map(p => ({
              id: p.id,
              clientName: p.client_name,
              cpf: p.cpf,
              phone: p.phone,
              type: p.type,
              complexityScore: p.complexity_score,
              riskLevel: p.risk_level,
              statusDoc: p.status_doc,
              statusTech: p.status_tech,
              statusClient: p.status_client,
              statusFinancial: p.status_financial,
              daysActive: p.days_active,
              responsible: p.responsible_id || 'Sistema',
              groupId: p.group_id,
              executors: p.executors || {},
              tags: p.tags || [],
              subTasks: (p.sub_tasks || []).map((t: any) => ({
                ...t,
                docStatus: t.doc_status || (t.completed ? 'RECEBIDO' : 'PENDENTE')
              })),
              clientProfile: p.client_profile,
              gatesDigitacao: p.gates_digitacao,
              gatesTransmissao: p.gates_transmissao,
              fiscalAnalysis: p.fiscal_analysis,
              financial: p.financial,
              communications: p.communications || [],
              auditTrail: (p.audit_trail || []).map((a: any) => ({
                id: a.id,
                timestamp: a.timestamp,
                action: a.action,
                details: a.details,
                userId: a.user_id,
                userName: a.user_name
              }))
            } as IRPFCard))
        }));

        setData({ columns });
      }
    } catch (err: any) {
      console.error('Erro ao buscar dados:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Auxiliar para salvar no localStorage
  const saveLocally = (newData: IRPFAppState) => {
    setData(newData);
    localStorage.setItem('irpf_kanban_test_data', JSON.stringify(newData));
  };

  // 2. Atualizar Card
  const updateCard = async (cardId: string, updates: Partial<IRPFCard>) => {
    if (IS_OFFLINE_MODE) {
      setData(prev => ({
        ...prev,
        columns: prev.columns.map(col => ({
          ...col,
          cards: col.cards.map(card =>
            card.id === cardId ? { ...card, ...updates } : card
          )
        }))
      }));

      // Salvar no localStorage após o próximo render (via useEffect ou manual)
      // Para simplificar agora, pegamos o estado atualizado no setData
      return;
    }

    try {
      const dbUpdates: any = {};
      if (updates.clientName) dbUpdates.client_name = updates.clientName;
      if (updates.statusDoc) dbUpdates.status_doc = updates.statusDoc;
      if (updates.statusTech) dbUpdates.status_tech = updates.statusTech;
      if (updates.statusClient) dbUpdates.status_client = updates.statusClient;
      if (updates.statusFinancial) dbUpdates.status_financial = updates.statusFinancial;
      if (updates.riskLevel) dbUpdates.risk_level = updates.riskLevel;
      if (updates.responsible) dbUpdates.responsible_id = updates.responsible;
      if (updates.clientProfile) dbUpdates.client_profile = updates.clientProfile;
      if (updates.gatesDigitacao) dbUpdates.gates_digitacao = updates.gatesDigitacao;
      if (updates.gatesTransmissao) dbUpdates.gates_transmissao = updates.gatesTransmissao;
      if (updates.fiscalAnalysis) dbUpdates.fiscal_analysis = updates.fiscalAnalysis;
      if (updates.financial) dbUpdates.financial = updates.financial;
      if (updates.tags) dbUpdates.tags = updates.tags;
      if (updates.executors) dbUpdates.executors = updates.executors;
      if (updates.groupId) dbUpdates.group_id = updates.groupId;

      const { error } = await supabase.from('irpf_processes').update(dbUpdates).eq('id', cardId);
      if (error) throw error;
      fetchData(true);
    } catch (err: any) {
      console.error('Erro ao atualizar card:', err);
    }
  };

  // 3. Mover Card
  const moveCard = async (cardId: string, targetColumnId: string) => {
    if (IS_OFFLINE_MODE) {
      let movedCard: IRPFCard | undefined;
      const columns = data.columns.map(col => {
        const card = col.cards.find(c => c.id === cardId);
        if (card) movedCard = card;
        return {
          ...col,
          cards: col.cards.filter(c => c.id !== cardId)
        };
      });

      if (movedCard) {
        const finalColumns = columns.map(col => {
          if (col.id === targetColumnId) {
            return { ...col, cards: [...col.cards, movedCard!] };
          }
          return col;
        });
        saveLocally({ columns: finalColumns });
      }
      return;
    }

    try {
      const { error } = await supabase.from('irpf_processes').update({ column_id: targetColumnId }).eq('id', cardId);
      if (error) throw error;
      fetchData(true);
    } catch (err: any) {
      console.error('Erro ao mover card:', err);
    }
  };

  // 4. Adicionar Card
  const addCard = async (newCard: IRPFCard) => {
    if (IS_OFFLINE_MODE) {

      const newData = {
        ...data,
        columns: data.columns.map((col, idx) =>
          idx === 0 ? { ...col, cards: [newCard, ...col.cards] } : col
        )
      };
      saveLocally(newData);
      return;
    }

    try {
      // 1. Inserir o processo principal
      const { error: processError } = await supabase.from('irpf_processes').insert([{
        id: newCard.id,
        client_name: newCard.clientName,
        cpf: newCard.cpf,
        column_id: data.columns[0].id,
        type: newCard.type,
        complexity_score: newCard.complexityScore,
        risk_level: newCard.riskLevel,
        status_doc: newCard.statusDoc,
        status_tech: newCard.statusTech,
        status_client: newCard.statusClient,
        status_financial: newCard.statusFinancial,
        client_profile: newCard.clientProfile,
        fiscal_analysis: newCard.fiscalAnalysis,
        financial: newCard.financial,
        days_active: 0
      }]);

      if (processError) throw processError;

      // 2. Inserir as sub-tarefas (checklist) se existirem
      if (newCard.subTasks && newCard.subTasks.length > 0) {
        const subTasksToInsert = newCard.subTasks.map(task => ({
          process_id: newCard.id,
          title: task.title,
          completed: task.completed,
          category: task.category,
          required: task.required || false,
          instruction: task.instruction || ''
        }));

        const { error: tasksError } = await supabase.from('sub_tasks').insert(subTasksToInsert);
        if (tasksError) throw tasksError;
      }

      // 3. Registrar auditoria inicial
      await addAuditEntry(newCard.id, 'IMPORT_DEC', 'Card e checklist criados via importação');

      fetchData(true);
    } catch (err: any) {
      console.error('Erro ao adicionar card e checklist:', err);
      setError('Falha ao salvar dados no Supabase. Verifique sua conexão.');
    }
  };

  // 5. Deletar Card
  const deleteCard = async (cardId: string) => {
    if (IS_OFFLINE_MODE) {
      const newData = {
        ...data,
        columns: data.columns.map(col => ({
          ...col,
          cards: col.cards.filter(c => c.id !== cardId)
        }))
      };
      saveLocally(newData);
      return;
    }

    try {
      const { error } = await supabase.from('irpf_processes').delete().eq('id', cardId);
      if (error) throw error;
      fetchData(true);
    } catch (err: any) {
      console.error('Erro ao deletar card:', err);
    }
  };

  // 6. Adicionar Comunicação
  const addCommunication = async (cardId: string, entry: any) => {
    if (IS_OFFLINE_MODE) {
      const newData = {
        ...data,
        columns: data.columns.map(col => ({
          ...col,
          cards: col.cards.map(card =>
            card.id === cardId
              ? { ...card, communications: [entry, ...card.communications] }
              : card
          )
        }))
      };
      saveLocally(newData);
      return;
    }

    try {
      const { error } = await supabase.from('communications').insert([{
        process_id: cardId,
        type: entry.type,
        message: entry.message || entry.content,
        user_name: entry.userName || 'Sistema',
        direction: 'ENVIADO'
      }]);
      if (error) throw error;
      fetchData(true);
    } catch (err: any) {
      console.error('Erro ao registrar comunicação:', err);
    }
  };

  useEffect(() => {
    if (IS_OFFLINE_MODE && !loading) {
      localStorage.setItem('irpf_kanban_test_data', JSON.stringify(data));
    }
  }, [data, loading]);

  // 7. Adicionar Auditoria
  const addAuditEntry = async (cardId: string, action: string, details?: string) => {
    if (IS_OFFLINE_MODE) {
      const entry = { 
        id: Date.now().toString(), 
        timestamp: new Date().toISOString(), 
        action, 
        details, 
        userName: 'Sistema',
        userId: 'sistema'
      };
      setData(prev => ({
        ...prev,
        columns: prev.columns.map(col => ({
          ...col,
          cards: col.cards.map(card =>
            card.id === cardId
              ? { ...card, auditTrail: [entry, ...(card.auditTrail || [])] }
              : card
          )
        }))
      }));
      return;
    }

    try {
      const { error } = await supabase.from('audit_trail').insert([{
        process_id: cardId,
        action,
        details,
        user_name: 'Antigravity AI',
        user_id: 'sistema'
      }]);
      if (error) throw error;
      fetchData(true);
    } catch (err: any) {
      console.error('Erro ao registrar auditoria:', err);
    }
  };

  // 8. Gestão de Grupos
  const addGroup = async (group: any) => {
    const newGroups = [...groups, group];
    setGroups(newGroups);
    if (IS_OFFLINE_MODE) {
      localStorage.setItem('irpf_kanban_groups', JSON.stringify(newGroups));
    } else {
      await supabase.from('execution_groups').insert([group]);
    }
  };

  const updateGroup = async (groupId: string, updates: any) => {
    const newGroups = groups.map(g => g.id === groupId ? { ...g, ...updates } : g);
    setGroups(newGroups);
    if (IS_OFFLINE_MODE) {
      localStorage.setItem('irpf_kanban_groups', JSON.stringify(newGroups));
    } else {
      await supabase.from('execution_groups').update(updates).eq('id', groupId);
    }
  };

  const deleteGroup = async (groupId: string) => {
    const newGroups = groups.filter(g => g.id !== groupId);
    setGroups(newGroups);
    if (IS_OFFLINE_MODE) {
      localStorage.setItem('irpf_kanban_groups', JSON.stringify(newGroups));
    } else {
      await supabase.from('execution_groups').delete().eq('id', groupId);
    }
  };

  // 9. Gestão de Colaboradores
  const addCollaborator = async (collaborator: any) => {
    // Mapear campos para o Supabase (snake_case)
    const dbCollaborator = {
      id: collaborator.id,
      name: collaborator.name,
      role: collaborator.role,
      level: collaborator.level,
      group_id: collaborator.groupId,
      active: collaborator.active !== undefined ? collaborator.active : true
    };

    const newCollaborators = [...collaborators, collaborator];
    setCollaborators(newCollaborators);

    if (IS_OFFLINE_MODE) {
      // Opcional: salvar no localStorage se necessário, mas o fetchData já tenta carregar de arquivos
      // Para consistência com grupos, poderíamos usar localStorage também
      localStorage.setItem('irpf_kanban_collaborators', JSON.stringify(newCollaborators));
    } else {
      const { error } = await supabase.from('collaborators').insert([dbCollaborator]);
      if (error) console.error('Erro ao adicionar colaborador:', error);
    }
  };

  const updateCollaborator = async (id: string, updates: any) => {
    const dbUpdates: any = {};
    if (updates.name) dbUpdates.name = updates.name;
    if (updates.role) dbUpdates.role = updates.role;
    if (updates.level) dbUpdates.level = updates.level;
    if (updates.groupId) dbUpdates.group_id = updates.groupId;
    if (updates.active !== undefined) dbUpdates.active = updates.active;

    const newCollaborators = collaborators.map(c => c.id === id ? { ...c, ...updates } : c);
    setCollaborators(newCollaborators);

    if (IS_OFFLINE_MODE) {
      localStorage.setItem('irpf_kanban_collaborators', JSON.stringify(newCollaborators));
    } else {
      const { error } = await supabase.from('collaborators').update(dbUpdates).eq('id', id);
      if (error) console.error('Erro ao atualizar colaborador:', error);
    }
  };

  const deleteCollaborator = async (id: string) => {
    const newCollaborators = collaborators.filter(c => c.id !== id);
    setCollaborators(newCollaborators);

    if (IS_OFFLINE_MODE) {
      localStorage.setItem('irpf_kanban_collaborators', JSON.stringify(newCollaborators));
    } else {
      const { error } = await supabase.from('collaborators').delete().eq('id', id);
      if (error) console.error('Erro ao deletar colaborador:', error);
    }
  };

  // 10. Atualizar SubTarefa
  const updateSubTask = async (taskId: string, updates: boolean | Partial<any>) => {
    console.log('useIRPFData: updateSubTask chamado', { taskId, updates });
    let finalUpdates: any = {};
    let localUpdates: any = {};

    if (typeof updates === 'boolean') {
      finalUpdates = { completed: updates, doc_status: updates ? 'RECEBIDO' : 'PENDENTE' };
      localUpdates = { completed: updates, docStatus: updates ? 'RECEBIDO' : 'PENDENTE' };
    } else {
      if (updates.completed !== undefined) finalUpdates.completed = updates.completed;
      if (updates.docStatus) finalUpdates.doc_status = updates.docStatus;
      localUpdates = updates;
    }

    // Atualização Otimista: Muda na UI instantaneamente
    setData(prev => ({
      ...prev,
      columns: prev.columns.map(col => ({
        ...col,
        cards: col.cards.map(card => ({
          ...card,
          subTasks: card.subTasks.map(task =>
            task.id === taskId ? { ...task, ...localUpdates } : task
          )
        }))
      }))
    }));

    if (IS_OFFLINE_MODE) return;

    try {
      const { error } = await supabase.from('sub_tasks').update(finalUpdates).eq('id', taskId);
      if (error) throw error;
    } catch (err: any) {
      console.error('Erro ao atualizar subtarefa:', err);
      fetchData(true); // Reverte em caso de erro no servidor
    }
  };

  // 11. Adicionar SubTarefa (Documento Manual)
  const addSubTask = async (cardId: string, task: Partial<any>) => {
    const newTask = {
      id: task.id || Date.now().toString(),
      title: task.title || 'Novo Documento',
      category: task.category || 'OUTROS',
      instruction: task.instruction || '',
      required: task.required || false,
      completed: false,
      docStatus: 'PENDENTE'
    };

    // Adição Otimista: Aparece na lista instantaneamente
    setData(prev => ({
      ...prev,
      columns: prev.columns.map(col => ({
        ...col,
        cards: col.cards.map(card =>
          card.id === cardId
            ? { ...card, subTasks: [...card.subTasks, newTask as any] }
            : card
        )
      }))
    }));

    if (IS_OFFLINE_MODE) return;

    try {
      const { error } = await supabase.from('sub_tasks').insert([{
        process_id: cardId,
        title: newTask.title,
        category: newTask.category,
        instruction: newTask.instruction,
        required: newTask.required,
        completed: false,
        doc_status: 'PENDENTE'
      }]);
      if (error) throw error;
    } catch (err: any) {
      console.error('Erro ao adicionar subtarefa:', err);
      fetchData(true); // Reverte/Sincroniza em caso de erro
    }
  };

  return {
    data,
    groups,
    collaborators,
    loading,
    error,
    addCard,
    updateCard,
    moveCard,
    deleteCard,
    updateSubTask,
    addSubTask,
    addCommunication,
    addAuditEntry,
    addGroup,
    updateGroup,
    deleteGroup,
    addCollaborator,
    updateCollaborator,
    deleteCollaborator
  };
};

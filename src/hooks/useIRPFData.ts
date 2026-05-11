import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { IRPFAppState, IRPFCard } from '../types';
import { initialData } from '../mockData';

// Mude para false quando quiser usar o Supabase real
const IS_OFFLINE_MODE = true;

export const useIRPFData = () => {
  const [data, setData] = useState<IRPFAppState>(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 1. Carregar dados
  const fetchData = async () => {
    if (IS_OFFLINE_MODE) {
      const saved = localStorage.getItem('irpf_kanban_test_data');
      if (saved) {
        setData(JSON.parse(saved));
      } else {
        setData(initialData);
      }
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      const { data: processes, error: pError } = await supabase
        .from('irpf_processes')
        .select(`
          *,
          sub_tasks (*),
          communications (*),
          audit_trail (*)
        `)
        .order('created_at', { ascending: false });

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
              tags: p.tags || [],
              subTasks: p.sub_tasks || [],
              clientProfile: p.client_profile,
              gatesDigitacao: p.gates_digitacao,
              gatesTransmissao: p.gates_transmissao,
              fiscalAnalysis: p.fiscal_analysis,
              financial: p.financial,
              communications: p.communications || [],
              auditTrail: p.audit_trail || []
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
      const newData = {
        ...data,
        columns: data.columns.map(col => ({
          ...col,
          cards: col.cards.map(card => 
            card.id === cardId ? { ...card, ...updates } : card
          )
        }))
      };
      saveLocally(newData);
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

      const { error } = await supabase.from('irpf_processes').update(dbUpdates).eq('id', cardId);
      if (error) throw error;
      fetchData(); 
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
      fetchData();
    } catch (err: any) {
      console.error('Erro ao mover card:', err);
    }
  };

  // 4. Adicionar Card
  const addCard = async (newCard: IRPFCard) => {
    if (IS_OFFLINE_MODE) {
      const firstColumn = data.columns[0];
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
      const { error } = await supabase.from('irpf_processes').insert([{
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
        days_active: 0
      }]);
      if (error) throw error;
      fetchData();
    } catch (err: any) {
      console.error('Erro ao adicionar card:', err);
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
      fetchData();
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
        content: entry.content,
        sent_by: entry.sentBy
      }]);
      if (error) throw error;
      fetchData();
    } catch (err: any) {
      console.error('Erro ao registrar comunicação:', err);
    }
  };

  // 7. Adicionar Auditoria
  const addAuditEntry = async (cardId: string, action: string, details?: string) => {
    if (IS_OFFLINE_MODE) {
      const entry = { id: Date.now().toString(), timestamp: new Date().toISOString(), action, details };
      const newData = {
        ...data,
        columns: data.columns.map(col => ({
          ...col,
          cards: col.cards.map(card => 
            card.id === cardId 
              ? { ...card, auditTrail: [entry, ...card.auditTrail] } 
              : card
          )
        }))
      };
      saveLocally(newData);
      return;
    }

    try {
      const { error } = await supabase.from('audit_trail').insert([{
        process_id: cardId,
        action,
        details
      }]);
      if (error) throw error;
      fetchData();
    } catch (err: any) {
      console.error('Erro ao registrar auditoria:', err);
    }
  };

  return {
    data,
    loading,
    error,
    addCard,
    updateCard,
    moveCard,
    deleteCard,
    addCommunication,
    addAuditEntry
  };
};

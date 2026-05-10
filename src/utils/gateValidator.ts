import type { IRPFCard, GateItem } from '../types';

// ============================================================
// Definição dos Gates
// ============================================================

export const GATES_DIGITACAO: Omit<GateItem, 'completed'>[] = [
  { id: 'gd_decl_anterior',  label: 'Declaração do ano anterior anexada',               required: true  },
  { id: 'gd_procuracao',     label: 'Procuração / Senha GOV / Certificado verificado',  required: true  },
  { id: 'gd_checklist_env',  label: 'Checklist personalizado enviado ao cliente',        required: true  },
  { id: 'gd_docs_minimos',   label: 'Documentos mínimos marcados como recebidos',        required: true  },
  { id: 'gd_sem_pendencia',  label: 'Sem pendências críticas abertas',                   required: true  },
  { id: 'gd_dados_cad',      label: 'Dados cadastrais confirmados',                      required: false },
];

export const GATES_TRANSMISSAO: Omit<GateItem, 'completed'>[] = [
  { id: 'gt_conferencia',    label: 'Conferência técnica concluída',                     required: true  },
  { id: 'gt_analise',        label: 'Análise patrimonial revisada',                      required: true  },
  { id: 'gt_fechamento',     label: 'Fechamento com cliente registrado',                 required: true  },
  { id: 'gt_conta_bancaria', label: 'Conta de restituição/débito confirmada',            required: true  },
  { id: 'gt_quotas',         label: 'Forma de pagamento e número de quotas definidos',   required: true  },
  { id: 'gt_aprovacao',      label: 'Aprovação do cliente registrada',                   required: true  },
  { id: 'gt_backup',         label: 'Cópia de segurança criada',                         required: false },
];

// ============================================================
// Inicializador de gates para novos cards
// ============================================================

export function createInitialGates(): { gatesDigitacao: GateItem[]; gatesTransmissao: GateItem[] } {
  return {
    gatesDigitacao: GATES_DIGITACAO.map(g => ({ ...g, completed: false })),
    gatesTransmissao: GATES_TRANSMISSAO.map(g => ({ ...g, completed: false })),
  };
}

// ============================================================
// Validadores
// ============================================================

export interface GateValidationResult {
  passed: boolean;
  blockers: string[];   // itens required não concluídos
  warnings: string[];   // itens optional não concluídos
}

export function validateGateDigitacao(card: IRPFCard): GateValidationResult {
  return validateGates(card.gatesDigitacao);
}

export function validateGateTransmissao(card: IRPFCard): GateValidationResult {
  return validateGates(card.gatesTransmissao);
}

function validateGates(gates: GateItem[]): GateValidationResult {
  const blockers: string[] = [];
  const warnings: string[] = [];

  for (const gate of gates) {
    if (!gate.completed) {
      if (gate.required) {
        blockers.push(gate.label);
      } else {
        warnings.push(gate.label);
      }
    }
  }

  return {
    passed: blockers.length === 0,
    blockers,
    warnings,
  };
}

// ============================================================
// Helpers: % de conclusão dos gates
// ============================================================

export function gateProgress(gates: GateItem[]): { done: number; total: number; pct: number } {
  const total = gates.length;
  const done  = gates.filter(g => g.completed).length;
  return { done, total, pct: total > 0 ? Math.round((done / total) * 100) : 0 };
}

import type { ClientProfile, ComplexityScore, ComplexityClass } from '../types';

// ============================================================
// Tabela de Pontuação de Complexidade
// ============================================================

interface ScoreRule {
  key: keyof ClientProfile;
  label: string;
  points: number;
}

const SCORE_RULES: ScoreRule[] = [
  { key: 'hasDependents',             label: 'Dependentes',              points: 1  },
  { key: 'hasMultiplePayingSources',  label: 'Múlt. fontes pagadoras',   points: 1  },
  { key: 'hasProlabore',              label: 'Pró-labore / Lucros',      points: 4  },
  { key: 'hasLivroCaixa',             label: 'Livro-caixa',              points: 4  },
  { key: 'hasVariableIncome',         label: 'Renda variável (B3)',       points: 5  },
  { key: 'hasRealEstate',             label: 'Imóvel (compra/venda)',     points: 5  },
  { key: 'hasCompanyParticipation',   label: 'Participação societária',   points: 4  },
  { key: 'hasDonations',              label: 'Doações incentivadas',      points: 3  },
  { key: 'hasCapitalGain',            label: 'Ganho de capital',          points: 7  },
  { key: 'hasRuralActivity',          label: 'Atividade rural',           points: 7  },
  { key: 'hasOverseasAssets',         label: 'Ativos no exterior',        points: 6  },
  { key: 'hasJCP',                    label: 'JCP não pago',              points: 3  },
  { key: 'hasFinancing',              label: 'Financiamentos',            points: 2  },
];

// ============================================================
// Limites de Classificação
// ============================================================

const CLASSIFICATION_THRESHOLDS: { max: number; label: ComplexityClass }[] = [
  { max: 5,  label: 'SIMPLES'  },
  { max: 15, label: 'MEDIA'    },
  { max: 30, label: 'COMPLEXA' },
  { max: Infinity, label: 'CRITICA' },
];

// ============================================================
// Função Principal
// ============================================================

export function calculateComplexityScore(profile: ClientProfile): ComplexityScore {
  let total = 0;
  const breakdown: Partial<Record<string, number>> = {};

  for (const rule of SCORE_RULES) {
    if (profile[rule.key]) {
      breakdown[rule.label] = rule.points;
      total += rule.points;
    }
  }

  const match = CLASSIFICATION_THRESHOLDS.find(t => total <= t.max);
  const classification: ComplexityClass = match ? match.label : 'CRITICA';

  return { total, classification, breakdown };
}

// ============================================================
// Labels e Cores para UI
// ============================================================

export const COMPLEXITY_COLORS: Record<ComplexityClass, string> = {
  SIMPLES:  'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  MEDIA:    'text-blue-400    bg-blue-500/10    border-blue-500/20',
  COMPLEXA: 'text-amber-400   bg-amber-500/10   border-amber-500/20',
  CRITICA:  'text-red-400     bg-red-500/10     border-red-500/20',
};

export const COMPLEXITY_LABELS: Record<ComplexityClass, string> = {
  SIMPLES:  'Simples',
  MEDIA:    'Média',
  COMPLEXA: 'Complexa',
  CRITICA:  'Crítica',
};

export const RISK_COLORS: Record<string, string> = {
  BAIXO:  'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  MEDIO:  'text-yellow-400  bg-yellow-500/10  border-yellow-500/20',
  ALTO:   'text-orange-400  bg-orange-500/10  border-orange-500/20',
  CRITICO:'text-red-400     bg-red-500/10     border-red-500/20',
};

export const RISK_LABELS: Record<string, string> = {
  BAIXO:  'Baixo',
  MEDIO:  'Médio',
  ALTO:   'Alto',
  CRITICO:'Crítico',
};

export const DOC_STATUS_COLORS: Record<string, string> = {
  PENDENTE: 'text-red-400    bg-red-500/10',
  PARCIAL:  'text-amber-400  bg-amber-500/10',
  COMPLETO: 'text-blue-400   bg-blue-500/10',
  VALIDADO: 'text-emerald-400 bg-emerald-500/10',
};

export const DOC_STATUS_LABELS: Record<string, string> = {
  PENDENTE: 'Doc Pendente',
  PARCIAL:  'Doc Parcial',
  COMPLETO: 'Doc Completo',
  VALIDADO: 'Doc Validado',
};

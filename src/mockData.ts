import type { IRPFAppState, IRPFCard } from './types';
import { v4 as uuidv4 } from 'uuid';
import { calculateComplexityScore } from './utils/scoreCalculator';
import { createInitialGates } from './utils/gateValidator';

// ============================================================
// Helper — cria card com todos os campos padrão
// ============================================================

function makeCard(overrides: Partial<IRPFCard> & Pick<IRPFCard, 'id' | 'clientName' | 'cpf' | 'responsible'>): IRPFCard {
  const profile = overrides.clientProfile ?? {
    hasDependents: false,
    hasMultiplePayingSources: false,
    hasProlabore: false,
    hasLivroCaixa: false,
    hasVariableIncome: false,
    hasOverseasAssets: false,
    hasRealEstate: false,
    hasDonations: false,
    hasRuralActivity: false,
    hasCompanyParticipation: false,
    hasCapitalGain: false,
    hasJCP: false,
    hasFinancing: false,
  };

  const { gatesDigitacao, gatesTransmissao } = createInitialGates();

  return {
    // Defaults
    phone: '',
    email: '',
    year: 2025,
    type: 'COMPLETA',
    billing: 'COMPLETA',
    daysActive: 0,
    tags: [],
    deadline: '',
    deadlineStatus: 'NO_PRAZO',
    stageResponsibilities: {},
    statusDoc: 'PENDENTE',
    statusTech: 'NAO_INICIADO',
    statusClient: 'AGUARDANDO',
    statusFinancial: 'NAO_GERADO',
    riskLevel: 'BAIXO',
    clientProfile: profile,
    complexityScore: calculateComplexityScore(profile),
    gatesDigitacao,
    gatesTransmissao,
    subTasks: [],
    processExecution: {},
    fiscalAnalysis: {
      planningOpportunities: [],
      autoAlerts: [],
    },
    financial: {
      status: 'NAO_GERADO',
      modality: 'COMPLETA',
    },
    communications: [],
    auditTrail: [],
    extraServices: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    notes: '',
    // Aplicar overrides
    ...overrides,
    clientProfile: profile,
    complexityScore: calculateComplexityScore(profile),
  };
}

// ============================================================
// Dados Iniciais
// ============================================================

export const initialData: IRPFAppState = {
  columns: [
    {
      id: 'preparacao',
      title: '1. Preparação',
      icon: 'ClipboardList',
      description: 'Início e organização',
      cards: [
        makeCard({
          id: uuidv4(),
          clientName: 'João Silva',
          cpf: '123.456.789-00',
          responsible: 'c1',
          type: 'COMPLETA',
          billing: 'COMPLETA',
          daysActive: 2,
          tags: [{ id: '1', label: 'Urgente', color: '#ef4444' }],
          clientProfile: {
            hasDependents: true,
            hasMultiplePayingSources: true,
            hasProlabore: false,
            hasLivroCaixa: false,
            hasVariableIncome: true,
            hasOverseasAssets: false,
            hasRealEstate: false,
            hasDonations: false,
            hasRuralActivity: false,
            hasCompanyParticipation: false,
            hasCapitalGain: false,
            hasJCP: false,
            hasFinancing: false,
          },
          riskLevel: 'MEDIO',
          deadline: '2025-05-31',
          deadlineStatus: 'NO_PRAZO',
        }),
      ],
    },
    {
      id: 'aguardando',
      title: '2. Aguardando Doc',
      icon: 'Clock',
      cards: [
        makeCard({
          id: uuidv4(),
          clientName: 'Maria Oliveira',
          cpf: '987.654.321-11',
          responsible: 'c2',
          type: 'SIMPLIFICADA',
          billing: 'SIMPLIFICADA',
          daysActive: 7,
          tags: [{ id: '2', label: 'Restituição', color: '#10b981' }],
          statusDoc: 'PARCIAL',
          riskLevel: 'BAIXO',
          deadline: '2025-05-20',
          deadlineStatus: 'ATENCAO',
        }),
      ],
    },
    {
      id: 'recepcao',
      title: '3. Recepcionar Doc',
      icon: 'Inbox',
      cards: [
        makeCard({
          id: uuidv4(),
          clientName: 'Carlos Mendes',
          cpf: '456.123.789-33',
          responsible: 'c1',
          type: 'COMPLETA',
          billing: 'COMPLETA',
          daysActive: 12,
          tags: [],
          statusDoc: 'COMPLETO',
          statusTech: 'NAO_INICIADO',
          riskLevel: 'ALTO',
          clientProfile: {
            hasDependents: true,
            hasMultiplePayingSources: true,
            hasProlabore: true,
            hasLivroCaixa: false,
            hasVariableIncome: true,
            hasOverseasAssets: true,
            hasRealEstate: true,
            hasDonations: false,
            hasRuralActivity: false,
            hasCompanyParticipation: true,
            hasCapitalGain: false,
            hasJCP: true,
            hasFinancing: true,
          },
          deadline: '2025-05-15',
          deadlineStatus: 'ATRASADO',
        }),
      ],
    },
    { id: 'digitacao',   title: '4. Digitação',           icon: 'Keyboard',     cards: [] },
    { id: 'conferir',    title: '5. Conferir',             icon: 'Search',       cards: [] },
    { id: 'analise',     title: '6. Análise',              icon: 'Scale',        cards: [] },
    { id: 'planejamento',title: '7. Planejamento',         icon: 'TrendingUp',   cards: [] },
    { id: 'fechamento',  title: '8. Fechamento',           icon: 'MessageCircle',cards: [] },
    { id: 'transmissao', title: '9. Transmitir',           icon: 'Send',         cards: [] },
    { id: 'financeiro',  title: '10. Financeiro',          icon: 'DollarSign',   cards: [] },
    { id: 'extras',      title: '11. Extras',              icon: 'PlusCircle',   cards: [] },
  ],
};

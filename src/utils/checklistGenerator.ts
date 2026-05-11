import type { ClientProfile, SubTask } from '../types';
import { v4 as uuidv4 } from 'uuid';

// ============================================================
// Definição das Regras de Checklist Dinâmico
// ============================================================

interface ChecklistRule {
  condition: (profile: ClientProfile) => boolean;
  category: string;
  items: { title: string; instruction?: string; required?: boolean }[];
}

const CHECKLIST_RULES: ChecklistRule[] = [
  // Sempre necessário (base)
  {
    condition: () => true,
    category: 'Documentação Base',
    items: [
      { title: 'RG / CNH do titular',                 required: true },
      { title: 'CPF do titular',                       required: true },
      { title: 'Comprovante de residência',            required: false },
      { title: 'Dados bancários para restituição',     required: false },
    ],
  },

  // Dependentes
  {
    condition: p => p.hasDependents,
    category: 'Dependentes',
    items: [
      { title: 'CPF de cada dependente',               required: true },
      { title: 'Data de nascimento dos dependentes',   required: true },
      { title: 'Comprovante de escola / mensalidade',  required: false },
      { title: 'Recibos de saúde dos dependentes',     required: false },
      { title: 'Documento de guarda (se aplicável)',   required: false },
      { title: 'Recibos de pensão alimentícia',        required: false },
    ],
  },

  // Fontes pagadoras
  {
    condition: p => p.hasMultiplePayingSources,
    category: 'Fontes Pagadoras',
    items: [
      { title: 'Informe de rendimentos de cada empregador', required: true,
        instruction: 'Solicitar informe completo com CNPJ e valores de INSS/IRRF' },
      { title: 'Informe de rendimentos de aposentadoria / pensão (se houver)', required: false },
    ],
  },

  // Pró-labore / Lucros
  {
    condition: p => p.hasProlabore,
    category: 'Pró-labore / Participação Societária',
    items: [
      { title: 'Informe de pró-labore da(s) empresa(s)',  required: true },
      { title: 'Informe de distribuição de lucros',       required: true },
      { title: 'Verificar quotas nos bens e direitos',
        instruction: 'Conferir se a participação societária está lançada corretamente', required: true },
    ],
  },

  // Livro-caixa
  {
    condition: p => p.hasLivroCaixa,
    category: 'Livro-caixa / Atividade Autônoma',
    items: [
      { title: 'Comprovante de conselho de classe (CRM, CRC, OAB…)', required: true },
      { title: 'Recibos de consultas / notas emitidas',  required: true },
      { title: 'Despesas dedutíveis do consultório',      required: false },
      { title: 'Aluguel do consultório (recibos)',        required: false },
    ],
  },

  // Renda variável
  {
    condition: p => p.hasVariableIncome,
    category: 'Renda Variável (B3)',
    items: [
      { title: 'Relatório de posição B3 (31/12)',         required: true },
      { title: 'Notas de negociação do ano',              required: true },
      { title: 'DARFs de renda variável pagos',           required: false },
      { title: 'Prejuízos acumulados dos anos anteriores',required: false,
        instruction: 'Verificar controle de prejuízo no programa da DIRPF' },
    ],
  },

  // Ativos no exterior
  {
    condition: p => p.hasOverseasAssets,
    category: 'Ativos no Exterior',
    items: [
      { title: 'Informe da corretora no exterior',        required: true },
      { title: 'Posição de cada ativo em 31/12',          required: true },
      { title: 'Taxa de câmbio usada (PTAX 31/12)',       required: true,
        instruction: 'Usar cotação PTAX do Banco Central para o dia 31/12' },
      { title: 'Rendimentos recebidos no exterior',       required: false },
    ],
  },

  // Imóveis
  {
    condition: p => p.hasRealEstate,
    category: 'Imóveis',
    items: [
      { title: 'Escritura(s) de imóvel(is)',              required: true },
      { title: 'Contrato de compra/venda (se houve)',     required: false },
      { title: 'Comprovantes de benfeitorias',            required: false },
      { title: 'Informe do financiamento (se houver)',    required: false },
      { title: 'DARF de ganho de capital (se houve venda)', required: false },
    ],
  },

  // Doações
  {
    condition: p => p.hasDonations,
    category: 'Doações Incentivadas',
    items: [
      { title: 'Recibos de doações (Lei Rouanet, Fundos…)', required: true },
      { title: 'CNPJ do fundo / entidade beneficiada',     required: true },
      { title: 'Verificar limites legais de dedução',
        instruction: 'Dedução máxima: 6% do imposto devido (Fundo Criança/Idoso), etc.', required: false },
    ],
  },

  // Atividade rural
  {
    condition: p => p.hasRuralActivity,
    category: 'Atividade Rural',
    items: [
      { title: 'Livro-caixa da atividade rural',          required: true },
      { title: 'Notas de venda de produção rural',        required: true },
      { title: 'Comprovantes de despesas rurais',         required: false },
      { title: 'ITR do imóvel rural',                     required: false },
    ],
  },

  // Ganho de capital
  {
    condition: p => p.hasCapitalGain,
    category: 'Ganho de Capital',
    items: [
      { title: 'DARF do ganho de capital (GCap)',         required: true },
      { title: 'Contrato de compra e venda do bem',       required: true },
      { title: 'Custo de aquisição documentado',          required: true },
    ],
  },

  // JCP
  {
    condition: p => p.hasJCP,
    category: 'JCP — Juros sobre Capital Próprio',
    items: [
      { title: 'Informe de JCP recebido',                 required: true,
        instruction: 'Verificar se é tributado na fonte ou rendimento isento conforme o caso' },
    ],
  },

  // Financiamentos
  {
    condition: p => p.hasFinancing,
    category: 'Financiamentos',
    items: [
      { title: 'Informe de financiamento imobiliário',    required: false,
        instruction: 'Exigido apenas para imóvel próprio — confirmar com cliente' },
    ],
  },
];

// ============================================================
// Função Principal
// ============================================================

export function generateBaseChecklist(profile: ClientProfile): SubTask[] {
  const tasks: SubTask[] = [];

  for (const rule of CHECKLIST_RULES) {
    if (rule.condition(profile)) {
      for (const item of rule.items) {
        tasks.push({
          id: uuidv4(),
          title: item.title,
          completed: false,
          category: rule.category,
          instruction: item.instruction,
          required: item.required ?? false,
        });
      }
    }
  }

  return tasks;
}

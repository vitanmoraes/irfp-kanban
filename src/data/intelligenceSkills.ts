import { BookOpen, Globe, TrendingUp, HelpCircle } from 'lucide-react';

export interface IntelligenceSkill {
  id: string;
  title: string;
  description: string;
  icon: any;
  category: 'LEGISLACAO' | 'INVESTIMENTOS' | 'EXTERIOR' | 'GERAL';
  color: string;
}

export const INTELLIGENCE_SKILLS: IntelligenceSkill[] = [
  {
    id: 'pr-rfb',
    title: 'Perguntas & Respostas RFB 2026',
    description: 'Base oficial da Receita Federal com mais de 700 questões resolvidas.',
    icon: HelpCircle,
    category: 'LEGISLACAO',
    color: '#3b82f6'
  },
  {
    id: 'invest-exterior',
    title: 'Investimentos no Exterior',
    description: 'Guias da Nomad e especializados para ativos fora do Brasil (Offshore/Avenue).',
    icon: Globe,
    category: 'EXTERIOR',
    color: '#a78bfa'
  },
  {
    id: 'renda-variavel',
    title: 'Renda Variável & Dividendos',
    description: 'Regras de tributação para Ações, FIIs e novos modelos de dividendos.',
    icon: TrendingUp,
    category: 'INVESTIMENTOS',
    color: '#10b981'
  },
  {
    id: 'manual-geral',
    title: 'Manuais de Lançamento',
    description: 'Passo a passo visual para preenchimento das fichas do programa IRPF.',
    icon: BookOpen,
    category: 'GERAL',
    color: '#f59e0b'
  }
];

export const KNOWLEDGE_FILES = [
  { name: 'P&R IRPF 2026 - v1.00 - 2026.04.23.pdf', size: '4.5 MB', type: 'RFB' },
  { name: 'GuiaPratico_InvestimentosExterior_v3.pdf', size: '0.4 MB', type: 'Guia' },
  { name: 'nomad-guia-ir-exterior.pdf', size: '8.9 MB', type: 'Nomad' },
  { name: 'Tributação-de-Dividendos-31-MAR.pdf', size: '5.6 MB', type: 'Fiscal' },
  { name: 'InfoMoney - Guia Imposto de Renda.pdf', size: '5.3 MB', type: 'Imprensa' },
  { name: 'manual_irpf.pdf', size: '8.3 MB', type: 'Manual' }
];

export const QUICK_TIPS = [
  { 
    question: 'Onde lanço Dividendos de FII?', 
    answer: 'Ficha de "Rendimentos Isentos e Não Tributáveis", código 26 (Outros), descrevendo o Fundo e CNPJ.',
    category: 'INVESTIMENTOS'
  },
  { 
    question: 'Limite de isenção para venda de ações?', 
    answer: 'Vendas totais no mês de até R$ 20.000,00 são isentas de IR sobre o lucro (exceto Day-Trade).',
    category: 'INVESTIMENTOS'
  },
  { 
    question: 'Como declarar conta na Avenue?', 
    answer: 'Ficha "Bens e Direitos", Grupo 06, Código 01. Informe o saldo em dólares e converta pelo câmbio do BACEN de 31/12.',
    category: 'EXTERIOR'
  },
  { 
    question: 'Rendimentos acumulados (RRA)?', 
    answer: 'Devem ser lançados na ficha própria de "Rendimentos Recebidos Acumuladamente", escolhendo a opção de ajuste ou exclusiva na fonte.',
    category: 'GERAL'
  }
];

export interface TaxTopic {
  id: string;
  title: string;
  category: 'RENDIMENTOS' | 'BENS' | 'EXTERIOR' | 'VARIAVEL';
  summary: string;
  link: string;
  criticalPoints: string[];
}

export const IRPF_KNOWLEDGE_BASE: TaxTopic[] = [
  {
    id: 'renda-variavel',
    title: 'Renda Variável (Ações e FIIs)',
    category: 'VARIAVEL',
    summary: 'Apuração mensal obrigatória. Isenção de R$ 20k em ações não se aplica a FIIs ou ETFs.',
    link: 'https://www.gov.br/receitafederal/pt-br/assuntos/meu-imposto-de-renda',
    criticalPoints: [
      'Compensação de prejuízos apenas entre mesma espécie',
      'DARF pago até o último dia útil do mês subsequente',
      'Informar custódia pelo custo de aquisição (não valor de mercado)'
    ]
  },
  {
    id: 'ativos-exterior',
    title: 'Ativos no Exterior (Lei 14.754)',
    category: 'EXTERIOR',
    summary: 'Novas regras de tributação para aplicações financeiras, lucros e dividendos de entidades controladas e trusts.',
    link: 'https://www.in.gov.br/web/dou/-/lei-n-14.754-de-12-de-dezembro-de-2023-529606869',
    criticalPoints: [
      'Alíquota fixa de 15%',
      'Opção de atualização de valor para 8% (prazo limitado)',
      'Extinção do diferimento para Offshores'
    ]
  },
  {
    id: 'ganho-capital',
    title: 'Ganho de Capital em Imóveis',
    category: 'BENS',
    summary: 'Apuração via GCAP. Isenção para venda de único imóvel até R$ 440k.',
    link: 'https://www.gov.br/receitafederal/pt-br/assuntos/meu-imposto-de-renda/preenchimento/ganho-de-capital',
    criticalPoints: [
      'Prazo de 180 dias para reinvestimento em outro imóvel residencial',
      'Fator de redução (FR1 e FR2) pelo tempo de posse',
      'Benfeitorias só podem ser somadas com nota fiscal idônea'
    ]
  }
];

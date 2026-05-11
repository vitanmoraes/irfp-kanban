export interface ProcessStep {
  id: string;
  title: string;
  description?: string;
  instructions?: string;
  items: {
    id: string;
    title: string;
    description?: string;
  }[];
}

export const IRPF_PROCESS: Record<string, ProcessStep> = {
  'preparacao': {
    id: 'preparacao',
    title: '1. Preparação do IRPF',
    description: 'Início e organização da base de dados do cliente.',
    items: [
      { id: 'prep_1', title: 'Enviar Checklist do IRPF', description: 'Enviar o checklist personalizado conforme perfil do cliente.' },
      { id: 'prep_2', title: 'Criar Pastas físicas e no servidor', description: 'Garantir que a estrutura de arquivos esteja pronta.' },
      { id: 'prep_3', title: 'Declaração Ano Anterior', description: 'Clientes ativos: deixar na pasta. Novos: solicitar cópia/senha.' },
      { id: 'prep_4', title: 'Procuração / Senha GOV / Certificado', description: 'Verificar validade e acesso ao portal e-CAC.' },
      { id: 'prep_5', title: 'Documentação do escritório', description: 'Informes Corporação, Livro Caixa, Alterações contratuais.' }
    ]
  },
  'aguardando': {
    id: 'aguardando',
    title: '2. Aguardando documentação',
    instructions: 'Cobrar a cada 5 dias após a primeira cobrança.',
    items: [
      { id: 'aguard_1', title: 'Primeira Cobrança Realizada' },
      { id: 'aguard_2', title: 'Acompanhamento (D+5)' }
    ]
  },
  'recepcao': {
    id: 'recepcao',
    title: '3. Recepcionar Doc IRPF',
    description: 'Conferência inicial e validação dos dados recebidos.',
    items: [
      { id: 'recep_1', title: 'Confirmar dados cadastrais', description: 'Endereço, Dependentes, Alimentandos, Redes Sociais.' },
      { id: 'recep_2', title: 'Salvar Documentos Digitais', description: 'Organizar na pasta do servidor conforme padrão.' },
      { id: 'recep_3', title: 'Arquivar Documentos Físicos', description: 'Se houver, manter na pasta física identificada.' },
      { id: 'recep_4', title: 'Conferência Técnica', description: 'Conferir Rendimentos, Bens, Pagamentos e Livro Caixa.' }
    ]
  },
  'digitacao': {
    id: 'digitacao',
    title: '4. Digitação / Pré Preenchida',
    instructions: 'Importar pré-preenchida e salvar fontes pagadoras E-cac.',
    items: [
      { id: 'dig_1', title: 'Importar Declaração Pré-preenchida' },
      { id: 'dig_2', title: 'Lançar Pró-labore / Lucros', description: 'Obrigatório ter quotas nos bens correspondentes.' },
      { id: 'dig_3', title: 'Renda Variável / Ações', description: 'Lançar preço médio. Usar notas de negociação se necessário.' },
      { id: 'dig_4', title: 'Livro Caixa', description: 'Apenas para renda autônoma com conselho de classe.' }
    ]
  },
  'conferir': {
    id: 'conferir',
    title: '5. Conferir',
    description: 'Revisão geral dos lançamentos efetuados.',
    items: [
      { id: 'conf_1', title: 'Revisar Fichas Preenchidas' },
      { id: 'conf_2', title: 'Validar Pendências do Programa' }
    ]
  },
  'analise': {
    id: 'analise',
    title: '6. Análise',
    instructions: 'Focar na evolução patrimonial e variação de impostos.',
    items: [
      { id: 'anal_1', title: 'Fechar o Caixa (Conferir)' },
      { id: 'anal_2', title: 'Analisar Evolução Patrimonial' },
      { id: 'anal_3', title: 'Variação a Pagar/Restituir' }
    ]
  },
  'planejamento': {
    id: 'planejamento',
    title: '7. Planejamento',
    instructions: 'Avaliar PGBL, Livro Caixa, Pejotização, Doação, Holding.',
    items: [
      { id: 'plan_1', title: 'Avaliar Melhorias Comportamentais' },
      { id: 'plan_2', title: 'Proposta de Reestruturação Fiscal' }
    ]
  },
  'fechamento': {
    id: 'fechamento',
    title: '8. Fechamento com Cliente',
    instructions: 'Detalhar motivos de impostos e confirmar dados bancários.',
    items: [
      { id: 'fech_1', title: 'Apresentar Análise e Planejamento' },
      { id: 'fech_2', title: 'Confirmar Conta Restituição/Débito' },
      { id: 'fech_3', title: 'Definir número de quotas' }
    ]
  },
  'transmissao': {
    id: 'transmissao',
    title: '9. Transmitir Declaração IRPF',
    items: [
      { id: 'trans_1', title: 'Transmitir Declaração' },
      { id: 'trans_2', title: 'Salvar PDF e Recibo no Servidor' },
      { id: 'trans_3', title: 'Salvar Cópia de Segurança' }
    ]
  },
  'financeiro': {
    id: 'financeiro',
    title: '10. Financeiro',
    instructions: 'Conferir valor do ano anterior. CORTESIA e RESIDENTE não pagam.',
    items: [
      { id: 'fin_1', title: 'Atualizar Dados no Sistema/Banco' },
      { id: 'fin_2', title: 'Definir Modalidade de Cobrança', description: 'Simplificada, Completa ou Negociação.' },
      { id: 'fin_3', title: 'Gerar Financeiro e Boleto' }
    ]
  },
  'extras': {
    id: 'extras',
    title: '11. Instruções / Serviços Extras',
    description: 'Manter em aberto para possíveis novos contatos e demandas.',
    items: [
      { id: 'ext_1', title: 'Registrar Pendências Futuras' },
      { id: 'ext_2', title: 'Acompanhamento Pós-Entrega' }
    ]
  }
};

// Gates de Qualidade - Requisitos obrigatórios para avançar no processo
export const INITIAL_GATES_DIGITACAO = [
  { id: 'gate_dig_1', label: 'Procuração Ativa no e-CAC', completed: false },
  { id: 'gate_dig_2', label: 'Declaração Anterior Disponível', completed: false },
  { id: 'gate_dig_3', label: 'Perfil Fiscal Identificado', completed: false },
  { id: 'gate_dig_4', label: 'Honorário Negociado/Aprovado', completed: false }
];

export const INITIAL_GATES_TRANSMISSAO = [
  { id: 'gate_trans_1', label: 'Conferência Geral Finalizada', completed: false },
  { id: 'gate_trans_2', label: 'Variação Patrimonial Validada', completed: false },
  { id: 'gate_trans_3', label: 'Aprovação Formal do Cliente', completed: false },
  { id: 'gate_trans_4', label: 'Conta Bancária de Restituição Conferida', completed: false }
];


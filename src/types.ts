// ============================================================
// IRPF Control Center — Tipos Centrais
// ============================================================

// --- Enums de Status Multidimensionais ---

export type DocStatus = 'PENDENTE' | 'PARCIAL' | 'COMPLETO' | 'VALIDADO';
export type TechStatus = 'NAO_INICIADO' | 'EM_DIGITACAO' | 'CONFERIDO' | 'REVISADO';
export type ClientStatus = 'AGUARDANDO' | 'APROVADO' | 'QUESTIONADO';
export type FinancialStatus = 'NAO_GERADO' | 'GERADO' | 'PAGO' | 'CORTESIA' | 'NEGOCIACAO';
export type RiskLevel = 'BAIXO' | 'MEDIO' | 'ALTO' | 'CRITICO';
export type DeadlineStatus = 'NO_PRAZO' | 'ATENCAO' | 'ATRASADO';
export type ComplexityClass = 'SIMPLES' | 'MEDIA' | 'COMPLEXA' | 'CRITICA';
export type BillingModal = 'SIMPLIFICADA' | 'COMPLETA' | 'NEGOCIACAO' | 'CORTESIA' | 'RESIDENTE';

// --- Perfil Fiscal do Cliente (base para checklist dinâmico e score) ---

export interface ClientProfile {
  hasDependents: boolean;
  hasMultiplePayingSources: boolean; // mais de uma fonte pagadora
  hasProlabore: boolean;             // pró-labore / lucros
  hasLivroCaixa: boolean;            // atividade autônoma com livro-caixa
  hasVariableIncome: boolean;        // renda variável (ações, FIIs, ETFs)
  hasOverseasAssets: boolean;        // ativos no exterior
  hasRealEstate: boolean;            // imóveis (compra/venda/benfeitorias)
  hasDonations: boolean;             // doações incentivadas
  hasRuralActivity: boolean;         // atividade rural
  hasCompanyParticipation: boolean;  // participação societária
  hasCapitalGain: boolean;           // ganho de capital
  hasJCP: boolean;                   // juros sobre capital próprio
  hasFinancing: boolean;             // financiamentos em andamento
}

export const DEFAULT_CLIENT_PROFILE: ClientProfile = {
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

// --- Score de Complexidade ---

export interface ComplexityScore {
  total: number;
  classification: ComplexityClass;
  breakdown: Partial<Record<string, number>>; // ex: { renda_variavel: 5, exterior: 6 }
}

// --- Gates de Qualidade ---

export interface GateItem {
  id: string;
  label: string;
  completed: boolean;
  required: boolean;
}

// --- Registro de Auditoria ---

export interface AuditEntry {
  id: string;
  timestamp: string;       // ISO 8601
  userId: string;          // ID do colaborador ou 'sistema'
  userName: string;
  action: string;          // ex: "Etapa alterada: Digitação → Conferência"
  details?: string;
}

// --- Comunicação com Cliente ---

export interface CommunicationEntry {
  id: string;
  timestamp: string;
  type: 'EMAIL' | 'WHATSAPP' | 'LIGACAO' | 'SISTEMA';
  message: string;
  userId: string;
  userName: string;
  direction: 'ENVIADO' | 'RECEBIDO';
}

// --- Análise Fiscal Estruturada ---

export interface FiscalAnalysis {
  // Rendimentos
  previousYearIncome?: number;
  currentYearIncome?: number;
  // Imposto
  previousYearTax?: number;
  currentYearTax?: number;
  taxResult?: number;       // positivo = pagar, negativo = restituir
  // Patrimônio
  previousYearAssets?: number;
  currentYearAssets?: number;
  // Caixa
  cashAvailable?: number;   // para justificar evolução patrimonial
  cashFlowConsistency?: boolean;
  // Análise qualitativa
  planningOpportunities: string[];  // ex: ["PGBL", "Livro-caixa", "Doação"]
  technicalNotes?: string;
  // Alertas gerados automaticamente
  autoAlerts: string[];
  // Aprovação
  approvedBy?: string;
  approvedAt?: string;
}

// --- Financeiro / Honorários ---

export interface FinancialRecord {
  status: FinancialStatus;
  modality: BillingModal;
  previousYearValue?: number;
  suggestedValue?: number;
  suggestedReasons?: string[];     // motivos da sugestão
  approvedValue?: number;
  complexityFactor?: number;       // pontos × taxa
  discount?: number;
  discountReason?: string;
  negotiationResponsible?: string;
  boletoGenerated?: boolean;
  boletoUrl?: string;
  paidAt?: string;
}

// --- Serviços Extras / Pipeline Pós-IRPF ---

export type ExtraServiceStatus = 'IDENTIFICADO' | 'PROPOSTO' | 'APROVADO' | 'RECUSADO';

export interface ExtraService {
  id: string;
  description: string;
  status: ExtraServiceStatus;
  estimatedValue?: number;
  notes?: string;
  createdAt: string;
}

// --- SubTarefa / Item de Checklist ---

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  category: string;
  assignedTo?: string;   // ID do colaborador
  instruction?: string;
  required?: boolean;    // item obrigatório para gate
}

// --- Tags ---

export interface Tag {
  id: string;
  label: string;
  color: string;
}

// --- Colaborador ---

export interface Collaborator {
  id: string;
  name: string;
  role: string;
  level: string;
  groupId?: string;
  active?: boolean;
}

// --- Grupo / Núcleo ---

export interface Group {
  id: string;
  name: string;
  description?: string;
}

// ============================================================
// IRPF Card — Entidade Central
// ============================================================

export interface IRPFCard {
  id: string;

  // Dados Cadastrais
  clientName: string;
  cpf: string;
  phone?: string;
  email?: string;
  year?: number;          // Ano da safra (ex: 2025)

  // Tipo e Modalidade
  type: 'SIMPLIFICADA' | 'COMPLETA';
  billing: BillingModal;

  // Etapa no Kanban
  columnId?: string;      // referência à coluna atual

  // Responsabilidades
  responsible: string;    // ID do colaborador principal
  stageResponsibilities?: Record<string, string>; // columnId => collaboratorId

  // Metadados de Tempo
  daysActive: number;
  deadline?: string;
  deadlineStatus?: DeadlineStatus;
  createdAt?: string;
  updatedAt?: string;

  // Tags Visuais
  tags: Tag[];

  // ---- NOVO: Status Multidimensionais ----
  statusDoc: DocStatus;
  statusTech: TechStatus;
  statusClient: ClientStatus;
  statusFinancial: FinancialStatus;
  riskLevel: RiskLevel;

  // ---- NOVO: Perfil Fiscal ----
  clientProfile: ClientProfile;

  // ---- NOVO: Score de Complexidade ----
  complexityScore: ComplexityScore;

  // ---- NOVO: Gates de Qualidade ----
  gatesDigitacao: GateItem[];
  gatesTransmissao: GateItem[];

  // ---- Checklist / SubTarefas ----
  subTasks: SubTask[];
  processExecution?: Record<string, { completed: boolean }>;

  // ---- NOVO: Análise Fiscal ----
  fiscalAnalysis: FiscalAnalysis;

  // ---- NOVO: Financeiro ----
  financial: FinancialRecord;

  // ---- NOVO: Comunicações ----
  communications: CommunicationEntry[];

  // ---- NOVO: Auditoria ----
  auditTrail: AuditEntry[];

  // ---- NOVO: Serviços Extras ----
  extraServices: ExtraService[];

  // Legado / compatibilidade
  docStatus?: 'PENDENTE' | 'COMPLETO';
  notes?: string;
}

// ============================================================
// Kanban
// ============================================================

export interface KanbanColumn {
  id: string;
  title: string;
  icon: string;
  cards: IRPFCard[];
  description?: string;
}

export interface IRPFAppState {
  columns: KanbanColumn[];
}

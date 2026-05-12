import type { IRPFCard } from '../types';

export interface MessageTemplate {
  id: string;
  title: string;
  body: (card: IRPFCard) => string;
}

export const COMMUNICATION_TEMPLATES: MessageTemplate[] = [
  {
    id: 'welcome',
    title: 'Boas-vindas e Checklist',
    body: (card) => `Olá ${card.clientName}, tudo bem? Aqui é do escritório. Estamos iniciando a temporada de IRPF 2025. Para começarmos sua declaração, preciso que você envie os documentos conforme o checklist abaixo: \n\n[CHECKLIST_PENDENTE]\n\nFico no aguardo!`
  },
  {
    id: 'follow_up',
    title: 'Cobrança de Pendências',
    body: (card) => `Oi ${card.clientName}, passando para dar um alô. Notei que ainda faltam alguns documentos para finalizarmos sua análise: \n\n[PENDENCIAS]\n\nConsegue me enviar ainda hoje?`
  },
  {
    id: 'closing',
    title: 'Finalização e Assinatura',
    body: (card) => `Olá ${card.clientName}, sua declaração foi finalizada! O resultado foi [RESULTADO]. Precisamos da sua aprovação formal para transmitirmos. Pode conferir o resumo que te enviei?`
  }
];

export function calculateDaysInStage(card: IRPFCard): number {
  const lastUpdate = new Date(card.updatedAt || new Date()).getTime();
  const now = new Date().getTime();
  return Math.floor((now - lastUpdate) / (1000 * 60 * 60 * 24));
}

export function getAlertStatus(card: IRPFCard, columnId: string): { level: 'normal' | 'warning' | 'danger', message: string } {
  if (columnId === 'aguardando') {
    const days = calculateDaysInStage(card);
    if (days >= 10) return { level: 'danger', message: `CRÍTICO: ${days} dias sem retorno` };
    if (days >= 5) return { level: 'warning', message: `Cobrança pendente (${days} dias)` };
  }
  return { level: 'normal', message: '' };
}

import type { IRPFCard, FinancialRecord } from '../types';

// Configurações base de honorários
const BASE_FEE = 350; // Valor mínimo para uma declaração simples
const POINT_VALUE = 25; // R$ 25,00 por ponto de complexidade

export function calculateSuggestedFee(card: IRPFCard): { total: number; reasons: string[] } {
  const reasons: string[] = [];
  let total = BASE_FEE;

  reasons.push(`Base inicial (mínima): R$ ${BASE_FEE.toFixed(2)}`);

  // Adiciona valor por pontos de complexidade
  const pointsValue = card.complexityScore.total * POINT_VALUE;
  if (pointsValue > 0) {
    total += pointsValue;
    reasons.push(`Complexidade (${card.complexityScore.total} pontos): R$ ${pointsValue.toFixed(2)}`);
  }

  // Regras extras baseadas no perfil
  if (card.clientProfile.hasOverseasAssets) {
    total += 150;
    reasons.push('Adicional Ativos Exterior (Conformidade): R$ 150.00');
  }

  if (card.clientProfile.hasRuralActivity) {
    total += 300;
    reasons.push('Adicional Atividade Rural (Alta Complexidade): R$ 300.00');
  }

  return { total, reasons };
}

export function updateCardFinancial(card: IRPFCard): Partial<FinancialRecord> {
  const suggestion = calculateSuggestedFee(card);
  return {
    suggestedValue: suggestion.total,
    suggestedReasons: suggestion.reasons,
    complexityFactor: card.complexityScore.total * POINT_VALUE
  };
}

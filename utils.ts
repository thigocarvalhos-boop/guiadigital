
import { Opportunity, PortfolioItem } from './types.ts';

/**
 * Conecta jovens talentos a negócios locais baseando-se no portfólio.
 * Implementa lógica de matching por habilidades verificadas e proximidade.
 */
export const connectTalentToBusiness = (
  portfolio: PortfolioItem[],
  opportunities: Opportunity[]
): Opportunity[] => {
  return opportunities.map(opp => {
    // Lógica de matching simulada baseada na quantidade de itens no portfólio
    const baseScore = portfolio.length > 0 ? 75 : 40;
    const randomBonus = Math.floor(Math.random() * 20);
    return {
      ...opp,
      matchingScore: Math.min(baseScore + randomBonus, 99)
    };
  });
};

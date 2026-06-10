import { PRICING } from '../config/business.js';

// Compute the total for a list of {name, quantity, unitPrice} line items.
// For Special Orders we apply the combo deal: every `comboSize` special items
// (counted across quantities) are charged at comboPrice instead of unit price.
export function computeTotal(items, mealType) {
  if (mealType !== 'Special Order') {
    return items.reduce((sum, it) => sum + it.unitPrice * it.quantity, 0);
  }

  const totalUnits = items.reduce((sum, it) => sum + it.quantity, 0);
  const combos = Math.floor(totalUnits / PRICING.comboSize);
  const remainder = totalUnits % PRICING.comboSize;
  return combos * PRICING.comboPrice + remainder * PRICING.specialItem;
}

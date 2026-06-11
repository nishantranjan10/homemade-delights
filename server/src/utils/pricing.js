import { PRICING } from '../config/business.js';

// Compute the total for a list of {name, quantity, unitPrice, mealType} line
// items. The combo deal applies only to 'Special Order' lines: every
// `comboSize` special units (counted across quantities) are charged at
// comboPrice, the remainder at specialItem each. Lunch/Dinner lines are billed
// flat at their unit price. This works for single-type and mixed carts alike.
export function computeTotal(items) {
  let total = 0;
  let specialUnits = 0;

  for (const it of items) {
    if (it.mealType === 'Special Order') {
      specialUnits += it.quantity;
    } else {
      total += it.unitPrice * it.quantity;
    }
  }

  const combos = Math.floor(specialUnits / PRICING.comboSize);
  const remainder = specialUnits % PRICING.comboSize;
  return total + combos * PRICING.comboPrice + remainder * PRICING.specialItem;
}

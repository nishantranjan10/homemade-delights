import { Link } from 'react-router-dom';

// Flyer-style card for a single meal (Lunch or Dinner).
export default function MealCard({ meal, timing, accent = 'saffron', showOrder = true }) {
  const isLunch = meal.mealType === 'Lunch';
  const ring = accent === 'forest' ? 'ring-forest-200' : 'ring-saffron-200';
  const head =
    accent === 'forest'
      ? 'bg-forest-600 text-cream-50'
      : 'bg-saffron-600 text-cream-50';

  return (
    <div className={`card overflow-hidden ring-2 ${ring}`}>
      <div className={`flyer-stripe flex items-center justify-between px-5 py-3 ${head}`}>
        <h3 className="font-serif text-xl font-bold">
          {isLunch ? '🌞' : '🌙'} {meal.mealType}
        </h3>
        {!meal.available && (
          <span className="badge bg-red-600 text-white">Sold Out</span>
        )}
      </div>

      <div className="p-5">
        {timing && (
          <p className="mb-3 text-sm text-forest-600">
            🕐 {timing.window}
          </p>
        )}
        {meal.items?.length ? (
          <ul className="space-y-1.5">
            {meal.items.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-forest-800">
                <span className="mt-1 text-saffron-500">🫓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-forest-500">Menu coming soon.</p>
        )}

        {timing?.cutoff && (
          <p className="mt-4 rounded-lg bg-cream-100 px-3 py-2 text-xs text-forest-600">
            ⏰ {timing.cutoff}
          </p>
        )}

        {showOrder && meal.available && meal.items?.length > 0 && (
          <Link
            to={`/order?mealType=${meal.mealType}`}
            className="btn-primary mt-4 w-full"
          >
            Order {meal.mealType} 🍛
          </Link>
        )}
      </div>
    </div>
  );
}

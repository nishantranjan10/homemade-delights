import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useConfig } from '../context/ConfigContext.jsx';
import MealCard from '../components/MealCard.jsx';

export default function Menu() {
  const { timings } = useConfig();
  const [weekly, setWeekly] = useState([]);
  const [todayMenu, setTodayMenu] = useState(null);

  useEffect(() => {
    api.get('/menu/weekly').then(setWeekly).catch(() => setWeekly([]));
    api.get('/menu/today').then(setTodayMenu).catch(() => {});
  }, []);

  const todayName = todayMenu?.day;

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="text-center">
        <h1 className="font-serif text-4xl font-bold text-saffron-700">
          🗓️ Weekly Menu
        </h1>
        <p className="mt-2 text-forest-600">
          Fresh thalis Monday to Sunday — Lunch &amp; Dinner. Every meal is $12 and includes salad &amp; pickle.
        </p>
      </div>

      <div className="mt-10 space-y-10">
        {weekly.map((day) => (
          <section key={day.day}>
            <div className="mb-4 flex items-center gap-3">
              <h2 className="font-serif text-2xl font-bold text-forest-800">
                {day.day}
              </h2>
              {day.day === todayName && (
                <span className="badge bg-saffron-600 text-white">Today</span>
              )}
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {day.meals.map((meal) => (
                <MealCard
                  key={meal.mealType}
                  meal={meal}
                  timing={meal.mealType === 'Lunch' ? timings.lunch : timings.dinner}
                  accent={meal.mealType === 'Lunch' ? 'saffron' : 'forest'}
                  showOrder={day.day === todayName}
                />
              ))}
            </div>
          </section>
        ))}
        {weekly.length === 0 && (
          <p className="text-center text-forest-500">Loading menu…</p>
        )}
      </div>
    </div>
  );
}

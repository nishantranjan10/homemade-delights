import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { useConfig } from '../context/ConfigContext.jsx';
import { prettyDate } from '../utils.js';
import MealCard from '../components/MealCard.jsx';
import WhatsAppButton from '../components/WhatsAppButton.jsx';

export default function Home() {
  const { business, pricing, timings } = useConfig();
  const [today, setToday] = useState(null);

  useEffect(() => {
    api.get('/menu/today').then(setToday).catch(() => setToday(null));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="flyer-stripe relative overflow-hidden bg-gradient-to-b from-saffron-100 to-cream-100">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:py-24">
          <div className="text-6xl sm:text-7xl">🍛🌿🫓</div>
          <h1 className="mt-4 font-serif text-4xl font-bold text-saffron-700 sm:text-6xl">
            {business.name}
          </h1>
          <p className="mt-4 text-lg font-medium text-forest-700 sm:text-2xl">
            {business.tagline}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to="/order" className="btn-primary">Order Now 🍛</Link>
            <Link to="/menu" className="btn-outline">View Weekly Menu</Link>
            <WhatsAppButton />
          </div>
          <p className="mt-6 text-sm text-forest-600">
            📍 {business.address}
          </p>
        </div>
      </section>

      {/* Pricing strip */}
      <section className="bg-forest-700 text-cream-50">
        <div className="mx-auto grid max-w-5xl gap-4 px-4 py-6 sm:grid-cols-3">
          <PriceTag emoji="🍽️" title="Regular Meal" price={`$${pricing.regularMeal}`} sub="Lunch or Dinner" />
          <PriceTag emoji="⭐" title="Special Orders" price={`$${pricing.specialItem}`} sub="Pre-order only" />
          <PriceTag emoji="🎉" title="Combo Offer" price={`$${pricing.comboPrice}`} sub={`Any ${pricing.comboSize} specials`} />
        </div>
      </section>

      {/* Today's menu */}
      <section className="mx-auto max-w-5xl px-4 py-12">
        <div className="text-center">
          <span className="badge bg-saffron-100 text-saffron-700">Today's Special</span>
          <h2 className="mt-2 font-serif text-3xl font-bold text-forest-800">
            Today's Menu
          </h2>
          {today && (
            <p className="mt-1 text-forest-600">
              {today.day} · {prettyDate(today.date)}
            </p>
          )}
        </div>

        {today ? (
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <MealCard meal={today.meals.Lunch} timing={timings.lunch} accent="saffron" />
            <MealCard meal={today.meals.Dinner} timing={timings.dinner} accent="forest" />
          </div>
        ) : (
          <p className="mt-8 text-center text-forest-500">Loading today's menu…</p>
        )}
      </section>

      {/* CTA to specials */}
      <section className="mx-auto max-w-5xl px-4 pb-12">
        <div className="card flex flex-col items-center gap-4 p-8 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <h3 className="font-serif text-2xl font-bold text-saffron-700">
              ⭐ Craving something special?
            </h3>
            <p className="mt-1 text-forest-600">
              Pre-order Momos, Pasta, Litti Chokha & more — mix any 2 for ${pricing.comboPrice}!
            </p>
          </div>
          <Link to="/specials" className="btn-primary whitespace-nowrap">
            See Specials
          </Link>
        </div>
      </section>
    </div>
  );
}

function PriceTag({ emoji, title, price, sub }) {
  return (
    <div className="text-center">
      <div className="text-2xl">{emoji}</div>
      <div className="font-serif text-2xl font-bold text-saffron-300">{price}</div>
      <div className="font-medium">{title}</div>
      <div className="text-xs text-cream-200/70">{sub}</div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { useConfig } from '../context/ConfigContext.jsx';
import { money } from '../utils.js';

export default function Specials() {
  const { pricing } = useConfig();
  const [items, setItems] = useState([]);

  useEffect(() => {
    api.get('/specials').then(setItems).catch(() => setItems([]));
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="text-center">
        <h1 className="font-serif text-4xl font-bold text-saffron-700">
          ⭐ Special Orders
        </h1>
        <p className="mt-2 text-forest-600">
          Pre-order only · {money(pricing.specialItem)} each
        </p>
      </div>

      {/* Combo banner */}
      <div className="mt-8 overflow-hidden rounded-2xl bg-gradient-to-r from-saffron-600 to-forest-600 p-6 text-center text-cream-50 shadow-lg">
        <div className="text-3xl">🎉</div>
        <h2 className="mt-1 font-serif text-2xl font-bold">Combo Offer</h2>
        <p className="mt-1 text-cream-100">
          Mix &amp; Match any <strong>{pricing.comboSize}</strong> special items for just{' '}
          <strong className="text-2xl">{money(pricing.comboPrice)}</strong>
        </p>
      </div>

      {/* Items grid */}
      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {items.map((item) => (
          <div key={item._id} className="card flex items-center justify-between gap-4 p-5">
            <div>
              <h3 className="font-serif text-xl font-bold text-forest-800">
                {item.name}
              </h3>
              {item.description && (
                <p className="mt-1 text-sm text-forest-600">{item.description}</p>
              )}
              {item.comboEligible && (
                <span className="badge mt-2 bg-forest-100 text-forest-700">
                  Combo eligible
                </span>
              )}
            </div>
            <div className="text-right">
              <div className="font-serif text-2xl font-bold text-saffron-600">
                {money(item.price)}
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <p className="col-span-full text-center text-forest-500">
            No specials available right now — check back soon!
          </p>
        )}
      </div>

      <div className="mt-10 text-center">
        <Link to="/order?mealType=Special Order" className="btn-primary">
          Pre-order Specials 🍱
        </Link>
        <p className="mt-3 text-sm text-forest-500">
          Specials require advance notice — please order ahead.
        </p>
      </div>
    </div>
  );
}

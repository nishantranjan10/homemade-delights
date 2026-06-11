import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../api.js';
import { useConfig } from '../context/ConfigContext.jsx';
import { sgToday, prettyDate, money, whatsappLink } from '../utils.js';

const MEAL_TYPES = ['Lunch', 'Dinner', 'Special Order'];

// Mirror of the server-side combo pricing so the customer sees the live total.
// Special-Order lines get the combo deal; Lunch/Dinner thalis are billed flat.
function computeTotal(lineItems, pricing) {
  let total = 0;
  let specialUnits = 0;
  for (const it of lineItems) {
    if (it.mealType === 'Special Order') {
      specialUnits += it.quantity;
    } else {
      total += it.unitPrice * it.quantity;
    }
  }
  const combos = Math.floor(specialUnits / pricing.comboSize);
  return (
    total +
    combos * pricing.comboPrice +
    (specialUnits % pricing.comboSize) * pricing.specialItem
  );
}

export default function Order() {
  const { business, pricing, timings } = useConfig();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const initialMeal = MEAL_TYPES.includes(params.get('mealType'))
    ? params.get('mealType')
    : 'Lunch';

  const [preferredDate, setPreferredDate] = useState(sgToday());
  // Quantities are tracked per meal type so one order can mix Lunch, Dinner,
  // and Specials. A thali deep-link (?mealType=) pre-selects that meal.
  const [mealQtys, setMealQtys] = useState({
    Lunch: initialMeal === 'Lunch' ? 1 : 0,
    Dinner: initialMeal === 'Dinner' ? 1 : 0,
  });
  const [specialQty, setSpecialQty] = useState({}); // { specialId: qty }
  const [specials, setSpecials] = useState([]);
  const [menuForDate, setMenuForDate] = useState(null);

  const [form, setForm] = useState({
    customerName: '',
    phone: '',
    address: '',
    fulfilment: 'Pickup',
    paymentMethod: 'PayNow',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/specials').then(setSpecials).catch(() => setSpecials([]));
  }, []);

  // Load the resolved menu whenever the date changes (for thali contents).
  useEffect(() => {
    api
      .get(`/menu/date?date=${preferredDate}`)
      .then(setMenuForDate)
      .catch(() => setMenuForDate(null));
  }, [preferredDate]);

  // Build API line items from every non-zero selection across meal types.
  const lineItems = useMemo(() => {
    const items = [];
    for (const mt of ['Lunch', 'Dinner']) {
      const qty = mealQtys[mt];
      if (qty > 0) {
        const meal = menuForDate?.meals?.[mt];
        const contents = meal?.items?.length ? ` — ${meal.items.join(', ')}` : '';
        items.push({
          name: `${mt} Thali${contents}`,
          quantity: qty,
          unitPrice: pricing.regularMeal,
          mealType: mt,
        });
      }
    }
    for (const s of specials) {
      const qty = specialQty[s._id];
      if (qty > 0) {
        items.push({
          name: s.name,
          quantity: qty,
          unitPrice: s.price ?? pricing.specialItem,
          mealType: 'Special Order',
        });
      }
    }
    return items;
  }, [specialQty, specials, menuForDate, mealQtys, pricing]);

  const total = computeTotal(lineItems, pricing);
  const itemCount = lineItems.reduce((s, it) => s + it.quantity, 0);

  function setField(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function setMealQty(mt, v) {
    setMealQtys((q) => ({ ...q, [mt]: Math.max(0, v) }));
  }

  function bumpSpecial(id, delta) {
    setSpecialQty((q) => {
      const next = Math.max(0, (q[id] || 0) + delta);
      return { ...q, [id]: next };
    });
  }

  function buildWhatsAppMessage() {
    const lines = [
      `Hi ${business.name}! I'd like to place an order:`,
      ``,
      `*Order* for ${prettyDate(preferredDate)}`,
      ...lineItems.map((it) => `• ${it.name} × ${it.quantity}`),
      ``,
      `Fulfilment: ${form.fulfilment}`,
      form.fulfilment === 'Delivery' && form.address ? `Address: ${form.address}` : '',
      `Payment: ${form.paymentMethod}`,
      `Total: ${money(total)}`,
      form.notes ? `Notes: ${form.notes}` : '',
      ``,
      `Name: ${form.customerName}`,
      `Phone: ${form.phone}`,
    ].filter(Boolean);
    return lines.join('\n');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (itemCount === 0) {
      setError('Please select at least one item.');
      return;
    }
    if (form.fulfilment === 'Delivery' && !form.address.trim()) {
      setError('Please provide a delivery address.');
      return;
    }

    setSubmitting(true);
    try {
      const order = await api.post('/orders', {
        ...form,
        preferredDate,
        items: lineItems,
      });
      navigate('/order/confirm', {
        state: { order, whatsappMessage: buildWhatsAppMessage() },
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-center font-serif text-4xl font-bold text-saffron-700">
        🍛 Place Your Order
      </h1>
      <p className="mt-2 text-center text-forest-600">
        Fill in the details below, or send it straight to WhatsApp.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        {/* Item selection — mix lunch, dinner, and specials in one order */}
        <div className="card p-5">
          <label className="label">1. Select your items</label>
          <p className="mb-3 text-xs text-forest-500">
            Add any combination of lunch, dinner, and specials.
          </p>

          <div className="space-y-3">
            {['Lunch', 'Dinner'].map((mt) => {
              const meal = menuForDate?.meals?.[mt];
              const timing = mt === 'Dinner' ? timings.dinner : timings.lunch;
              return (
                <div key={mt} className="rounded-xl bg-cream-100 p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-forest-800">
                      {mt === 'Lunch' ? '🌞 ' : '🌙 '}
                      {mt} Thali — {money(pricing.regularMeal)} each
                    </span>
                    <QtyStepper
                      value={mealQtys[mt]}
                      onChange={(v) => setMealQty(mt, v)}
                      min={0}
                    />
                  </div>
                  {meal?.items?.length ? (
                    <p className="mt-2 text-sm text-forest-600">
                      Includes: {meal.items.join(', ')}
                    </p>
                  ) : (
                    <p className="mt-2 text-sm text-forest-500">
                      Menu for this date will be confirmed by Rupali.
                    </p>
                  )}
                  <p className="mt-2 text-xs text-forest-500">
                    🕐 {timing.window} · {timing.cutoff}
                  </p>
                </div>
              );
            })}

            <div className="rounded-xl bg-cream-100 p-4">
              <div className="font-semibold text-forest-800">⭐ Special Order</div>
              <div className="mt-2 space-y-2">
                {specials.map((s) => (
                  <div
                    key={s._id}
                    className="flex items-center justify-between rounded-lg bg-cream-50 px-3 py-2"
                  >
                    <div>
                      <div className="font-medium text-forest-800">{s.name}</div>
                      <div className="text-xs text-forest-500">{money(s.price)} each</div>
                    </div>
                    <QtyStepper
                      value={specialQty[s._id] || 0}
                      onChange={(v) => bumpSpecial(s._id, v - (specialQty[s._id] || 0))}
                      min={0}
                    />
                  </div>
                ))}
                {specials.length === 0 && (
                  <p className="text-sm text-forest-500">No specials available.</p>
                )}
              </div>
              <p className="mt-2 rounded-lg bg-saffron-50 px-3 py-2 text-xs text-saffron-700">
                🎉 Combo: any {pricing.comboSize} specials = {money(pricing.comboPrice)} (auto-applied)
              </p>
            </div>
          </div>
        </div>

        {/* Fulfilment & date */}
        <div className="card grid gap-4 p-5 sm:grid-cols-2">
          <div>
            <label className="label">2. Pickup or Delivery</label>
            <div className="grid grid-cols-2 gap-2">
              {business.fulfilment.map((f) => (
                <button
                  type="button"
                  key={f}
                  onClick={() => setField('fulfilment', f)}
                  className={`rounded-xl border-2 px-2 py-2.5 text-sm font-semibold ${
                    form.fulfilment === f
                      ? 'border-forest-600 bg-forest-600 text-white'
                      : 'border-forest-200 bg-cream-50 text-forest-700 hover:bg-forest-50'
                  }`}
                >
                  {f === 'Delivery' ? '🛵 ' : '🏠 '}
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label" htmlFor="date">Preferred date</label>
            <input
              id="date"
              type="date"
              className="input"
              value={preferredDate}
              min={sgToday()}
              onChange={(e) => setPreferredDate(e.target.value)}
            />
          </div>
        </div>

        {/* Contact details */}
        <div className="card grid gap-4 p-5 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="name">Name</label>
            <input
              id="name"
              className="input"
              value={form.customerName}
              onChange={(e) => setField('customerName', e.target.value)}
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="phone">Phone</label>
            <input
              id="phone"
              type="tel"
              className="input"
              placeholder="+65 ..."
              value={form.phone}
              onChange={(e) => setField('phone', e.target.value)}
              required
            />
          </div>
          {form.fulfilment === 'Delivery' && (
            <div className="sm:col-span-2">
              <label className="label" htmlFor="address">Delivery address</label>
              <input
                id="address"
                className="input"
                value={form.address}
                onChange={(e) => setField('address', e.target.value)}
                placeholder="Block, unit, postal code"
              />
            </div>
          )}
          <div className="sm:col-span-2">
            <label className="label" htmlFor="notes">Notes (optional)</label>
            <textarea
              id="notes"
              className="input"
              rows={2}
              value={form.notes}
              onChange={(e) => setField('notes', e.target.value)}
              placeholder="Allergies, less spicy, etc."
            />
          </div>
        </div>

        {/* Payment */}
        <div className="card p-5">
          <label className="label">3. Payment method</label>
          <div className="grid grid-cols-3 gap-2">
            {business.paymentMethods.map((p) => (
              <button
                type="button"
                key={p}
                onClick={() => setField('paymentMethod', p)}
                className={`rounded-xl border-2 px-2 py-2.5 text-sm font-semibold ${
                  form.paymentMethod === p
                    ? 'border-saffron-600 bg-saffron-600 text-white'
                    : 'border-saffron-200 bg-cream-50 text-forest-700 hover:bg-saffron-50'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Summary + actions */}
        <div className="card sticky bottom-4 p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-forest-700">
              {itemCount} item{itemCount === 1 ? '' : 's'} · {form.fulfilment}
            </span>
            <span className="font-serif text-2xl font-bold text-saffron-700">
              {money(total)}
            </span>
          </div>
          {form.fulfilment === 'Delivery' && (
            <p className="mt-1 text-xs text-forest-500">
              + delivery charge (confirmed on WhatsApp)
            </p>
          )}
          {error && (
            <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <button type="submit" className="btn-primary flex-1" disabled={submitting}>
              {submitting ? 'Placing order…' : 'Place Order ✅'}
            </button>
            <a
              href={whatsappLink(business.whatsapp, buildWhatsAppMessage())}
              target="_blank"
              rel="noreferrer"
              className="btn-whatsapp flex-1"
            >
              💬 Order via WhatsApp
            </a>
          </div>
        </div>
      </form>
    </div>
  );
}

function QtyStepper({ value, onChange, min = 0 }) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        className="h-8 w-8 rounded-full bg-saffron-100 font-bold text-saffron-700 hover:bg-saffron-200"
      >
        −
      </button>
      <span className="w-6 text-center font-semibold text-forest-800">{value}</span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        className="h-8 w-8 rounded-full bg-saffron-100 font-bold text-saffron-700 hover:bg-saffron-200"
      >
        +
      </button>
    </div>
  );
}

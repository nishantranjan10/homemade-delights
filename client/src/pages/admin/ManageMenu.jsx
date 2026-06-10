import { useEffect, useState } from 'react';
import { api } from '../../api.js';
import { sgToday, money } from '../../utils.js';

const TABS = ['Weekly Menu', 'Daily Override', 'Specials'];

export default function ManageMenu() {
  const [tab, setTab] = useState('Weekly Menu');

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold text-forest-800">🍛 Manage Menu</h1>

      <div className="mt-6 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              tab === t ? 'bg-saffron-600 text-white' : 'bg-white text-forest-700 ring-1 ring-saffron-100 hover:bg-saffron-50'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === 'Weekly Menu' && <WeeklyMenuEditor />}
        {tab === 'Daily Override' && <DailyOverrideEditor />}
        {tab === 'Specials' && <SpecialsEditor />}
      </div>
    </div>
  );
}

/* ---------------- Weekly menu ---------------- */
function WeeklyMenuEditor() {
  const [weekly, setWeekly] = useState([]);
  const [saving, setSaving] = useState('');

  function load() {
    api.get('/menu/weekly').then(setWeekly).catch(() => setWeekly([]));
  }
  useEffect(load, []);

  async function save(day, meal) {
    const key = `${day}-${meal.mealType}`;
    setSaving(key);
    try {
      await api.put(
        '/menu/weekly',
        {
          day,
          mealType: meal.mealType,
          items: meal.items.filter((i) => i.trim()),
          available: meal.available,
        },
        true
      );
    } finally {
      setSaving('');
    }
  }

  function updateMeal(dayIdx, mealIdx, patch) {
    setWeekly((w) => {
      const copy = structuredClone(w);
      Object.assign(copy[dayIdx].meals[mealIdx], patch);
      return copy;
    });
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-forest-600">
        Edit the recurring weekly menu. One item per line.
      </p>
      {weekly.map((day, di) => (
        <div key={day.day} className="card p-5">
          <h3 className="font-serif text-xl font-bold text-saffron-700">{day.day}</h3>
          <div className="mt-3 grid gap-4 md:grid-cols-2">
            {day.meals.map((meal, mi) => {
              const key = `${day.day}-${meal.mealType}`;
              return (
                <div key={meal.mealType} className="rounded-xl bg-cream-100 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-semibold text-forest-800">
                      {meal.mealType === 'Lunch' ? '🌞' : '🌙'} {meal.mealType}
                    </span>
                    <label className="flex items-center gap-2 text-xs text-forest-600">
                      <input
                        type="checkbox"
                        checked={meal.available}
                        onChange={(e) => updateMeal(di, mi, { available: e.target.checked })}
                      />
                      Available
                    </label>
                  </div>
                  <textarea
                    className="input"
                    rows={6}
                    value={meal.items.join('\n')}
                    onChange={(e) => updateMeal(di, mi, { items: e.target.value.split('\n') })}
                  />
                  <button
                    onClick={() => save(day.day, meal)}
                    className="btn-primary mt-3 w-full py-2 text-sm"
                    disabled={saving === key}
                  >
                    {saving === key ? 'Saving…' : 'Save'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------------- Daily override ---------------- */
function DailyOverrideEditor() {
  const [date, setDate] = useState(sgToday());
  const [menu, setMenu] = useState(null);
  const [drafts, setDrafts] = useState({ Lunch: '', Dinner: '' });
  const [msg, setMsg] = useState('');

  function load(d) {
    api.get(`/menu/date?date=${d}`).then((m) => {
      setMenu(m);
      setDrafts({
        Lunch: (m.meals.Lunch.items || []).join('\n'),
        Dinner: (m.meals.Dinner.items || []).join('\n'),
      });
    });
  }
  useEffect(() => load(date), [date]);

  async function postOverride(mealType) {
    setMsg('');
    await api.put(
      '/menu/daily',
      {
        date,
        mealType,
        items: drafts[mealType].split('\n').filter((i) => i.trim()),
        available: true,
      },
      true
    );
    setMsg(`${mealType} menu posted for ${date}`);
    load(date);
  }

  async function removeOverride(mealType) {
    await api.del('/menu/daily', { date, mealType }, true);
    setMsg(`${mealType} override removed — back to weekly default`);
    load(date);
  }

  return (
    <div className="space-y-4">
      <div className="card p-5">
        <label className="label">Select date to override</label>
        <input
          type="date"
          className="input max-w-xs"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <p className="mt-2 text-sm text-forest-600">
          Posting here overrides the weekly default for this specific date only.
        </p>
      </div>

      {msg && (
        <p className="rounded-lg bg-forest-50 px-3 py-2 text-sm text-forest-700">{msg}</p>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {['Lunch', 'Dinner'].map((mealType) => {
          const meal = menu?.meals?.[mealType];
          return (
            <div key={mealType} className="card p-5">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-serif text-lg font-bold text-saffron-700">
                  {mealType === 'Lunch' ? '🌞' : '🌙'} {mealType}
                </h3>
                {meal?.overridden ? (
                  <span className="badge bg-saffron-100 text-saffron-700">Overridden</span>
                ) : (
                  <span className="badge bg-cream-200 text-forest-600">Weekly default</span>
                )}
              </div>
              <textarea
                className="input"
                rows={6}
                value={drafts[mealType]}
                onChange={(e) =>
                  setDrafts((d) => ({ ...d, [mealType]: e.target.value }))
                }
              />
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => postOverride(mealType)}
                  className="btn-primary flex-1 py-2 text-sm"
                >
                  Post for this date
                </button>
                {meal?.overridden && (
                  <button
                    onClick={() => removeOverride(mealType)}
                    className="btn-outline py-2 text-sm"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- Specials ---------------- */
function SpecialsEditor() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ name: '', description: '', price: 15 });

  function load() {
    api.get('/specials?all=true').then(setItems).catch(() => setItems([]));
  }
  useEffect(load, []);

  async function add(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    await api.post('/specials', { ...form, price: Number(form.price) }, true);
    setForm({ name: '', description: '', price: 15 });
    load();
  }

  async function toggle(item) {
    await api.put(`/specials/${item._id}`, { available: !item.available }, true);
    load();
  }

  async function remove(item) {
    if (!confirm(`Delete "${item.name}"?`)) return;
    await api.del(`/specials/${item._id}`, undefined, true);
    load();
  }

  return (
    <div className="space-y-6">
      {/* Add form */}
      <form onSubmit={add} className="card grid gap-3 p-5 sm:grid-cols-4">
        <div className="sm:col-span-2">
          <label className="label">Name</label>
          <input
            className="input"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="e.g. Veg Momos (8 pcs)"
          />
        </div>
        <div>
          <label className="label">Price ($)</label>
          <input
            type="number"
            className="input"
            value={form.price}
            onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
          />
        </div>
        <div className="flex items-end">
          <button className="btn-primary w-full py-2.5">+ Add Special</button>
        </div>
        <div className="sm:col-span-4">
          <label className="label">Description</label>
          <input
            className="input"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Short description"
          />
        </div>
      </form>

      {/* List */}
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item._id} className="card flex items-center justify-between gap-4 p-4">
            <div>
              <div className="font-semibold text-forest-800">
                {item.name}{' '}
                <span className="text-sm font-normal text-saffron-600">
                  {money(item.price)}
                </span>
              </div>
              {item.description && (
                <div className="text-sm text-forest-500">{item.description}</div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => toggle(item)}
                className={`badge ${
                  item.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-700'
                }`}
              >
                {item.available ? 'Available' : 'Sold Out'}
              </button>
              <button
                onClick={() => remove(item)}
                className="rounded-lg px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-center text-forest-500">No special items yet.</p>
        )}
      </div>
    </div>
  );
}

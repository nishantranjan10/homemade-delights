import { useEffect, useState, useCallback } from 'react';
import { api } from '../../api.js';
import { prettyDate, money } from '../../utils.js';
import { StatusBadge } from './Dashboard.jsx';

const STATUSES = ['Pending', 'Confirmed', 'Delivered', 'Cancelled'];
const NEXT_STATUS = { Pending: 'Confirmed', Confirmed: 'Delivered' };

export default function ManageOrders() {
  const [orders, setOrders] = useState([]);
  const [filters, setFilters] = useState({ date: '', mealType: '', status: '' });
  const [expanded, setExpanded] = useState(null);

  const load = useCallback(() => {
    const qs = new URLSearchParams(
      Object.entries(filters).filter(([, v]) => v)
    ).toString();
    api.get(`/orders${qs ? `?${qs}` : ''}`, true).then(setOrders).catch(() => setOrders([]));
  }, [filters]);

  useEffect(load, [load]);

  async function setStatus(order, status) {
    await api.patch(`/orders/${order._id}/status`, { status }, true);
    load();
  }

  function setFilter(k, v) {
    setFilters((f) => ({ ...f, [k]: v }));
  }

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold text-forest-800">📋 Orders</h1>

      {/* Filters */}
      <div className="mt-6 grid gap-3 sm:grid-cols-4">
        <div>
          <label className="label">Date</label>
          <input
            type="date"
            className="input"
            value={filters.date}
            onChange={(e) => setFilter('date', e.target.value)}
          />
        </div>
        <div>
          <label className="label">Meal type</label>
          <select
            className="input"
            value={filters.mealType}
            onChange={(e) => setFilter('mealType', e.target.value)}
          >
            <option value="">All</option>
            <option>Lunch</option>
            <option>Dinner</option>
            <option>Special Order</option>
          </select>
        </div>
        <div>
          <label className="label">Status</label>
          <select
            className="input"
            value={filters.status}
            onChange={(e) => setFilter('status', e.target.value)}
          >
            <option value="">All</option>
            {STATUSES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <button
            onClick={() => setFilters({ date: '', mealType: '', status: '' })}
            className="btn-outline w-full py-2.5"
          >
            Clear filters
          </button>
        </div>
      </div>

      <p className="mt-4 text-sm text-forest-600">{orders.length} order(s)</p>

      {/* Orders list */}
      <div className="mt-3 space-y-3">
        {orders.map((o) => (
          <div key={o._id} className="card overflow-hidden">
            <button
              onClick={() => setExpanded(expanded === o._id ? null : o._id)}
              className="flex w-full items-center justify-between gap-4 p-4 text-left"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-forest-800">{o.customerName}</span>
                  <StatusBadge status={o.status} />
                </div>
                <div className="mt-0.5 text-sm text-forest-500">
                  {o.mealType} · {prettyDate(o.preferredDate)} · {o.fulfilment}
                </div>
              </div>
              <div className="text-right">
                <div className="font-serif text-lg font-bold text-saffron-700">
                  {money(o.total)}
                </div>
                <div className="text-xs text-forest-400">
                  {expanded === o._id ? '▲ hide' : '▼ details'}
                </div>
              </div>
            </button>

            {expanded === o._id && (
              <div className="border-t border-cream-200 bg-cream-50 p-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <h4 className="mb-1 text-sm font-semibold text-forest-700">Items</h4>
                    <ul className="space-y-1 text-sm text-forest-600">
                      {o.items.map((it, i) => (
                        <li key={i} className="flex justify-between gap-4">
                          <span>{it.name} × {it.quantity}</span>
                          <span>{money(it.unitPrice * it.quantity)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="text-sm text-forest-600">
                    <h4 className="mb-1 font-semibold text-forest-700">Contact</h4>
                    <p>📞 {o.phone}</p>
                    {o.address && <p>📍 {o.address}</p>}
                    <p>💳 {o.paymentMethod}</p>
                    {o.notes && <p className="mt-1 italic">“{o.notes}”</p>}
                  </div>
                </div>

                {/* Status actions */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {NEXT_STATUS[o.status] && (
                    <button
                      onClick={() => setStatus(o, NEXT_STATUS[o.status])}
                      className="btn-primary py-2 text-sm"
                    >
                      Mark {NEXT_STATUS[o.status]} →
                    </button>
                  )}
                  <select
                    value={o.status}
                    onChange={(e) => setStatus(o, e.target.value)}
                    className="input max-w-[12rem] py-2 text-sm"
                  >
                    {STATUSES.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        ))}
        {orders.length === 0 && (
          <p className="py-8 text-center text-forest-500">No orders match these filters.</p>
        )}
      </div>
    </div>
  );
}

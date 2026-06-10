import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api.js';
import { prettyDate, money } from '../../utils.js';

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [todaysOrders, setTodaysOrders] = useState([]);

  useEffect(() => {
    api.get('/orders/summary', true).then(setSummary).catch(() => {});
    api
      .get('/orders/summary', true)
      .then((s) => api.get(`/orders?date=${s.date}`, true))
      .then(setTodaysOrders)
      .catch(() => {});
  }, []);

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold text-forest-800">📊 Dashboard</h1>
      {summary && (
        <p className="mt-1 text-forest-600">{prettyDate(summary.date)}</p>
      )}

      {/* Stat cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Today's Orders" value={summary?.todaysOrders ?? '—'} emoji="🛎️" />
        <Stat label="Revenue Today" value={summary ? money(summary.revenueToday) : '—'} emoji="💰" />
        <Stat label="Pending" value={summary?.statusCounts?.Pending ?? 0} emoji="⏳" accent="saffron" />
        <Stat label="Total Revenue" value={summary ? money(summary.totalRevenue) : '—'} emoji="📈" />
      </div>

      {/* Status breakdown */}
      {summary?.statusCounts && (
        <div className="mt-6 flex flex-wrap gap-3">
          {['Pending', 'Confirmed', 'Delivered', 'Cancelled'].map((s) => (
            <span key={s} className="badge bg-white text-forest-700 ring-1 ring-saffron-100">
              {s}: <strong>{summary.statusCounts[s] || 0}</strong>
            </span>
          ))}
        </div>
      )}

      {/* Today's orders */}
      <div className="mt-8 flex items-center justify-between">
        <h2 className="font-serif text-2xl font-bold text-forest-800">Today's Orders</h2>
        <Link to="/admin/orders" className="text-sm font-medium text-saffron-700 hover:underline">
          View all →
        </Link>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl bg-white shadow ring-1 ring-saffron-100">
        {todaysOrders.length === 0 ? (
          <p className="p-6 text-center text-forest-500">No orders for today yet.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-cream-100 text-forest-600">
              <tr>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Meal</th>
                <th className="px-4 py-3">Items</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {todaysOrders.map((o) => (
                <tr key={o._id} className="border-t border-cream-200">
                  <td className="px-4 py-3 font-medium text-forest-800">{o.customerName}</td>
                  <td className="px-4 py-3">{o.mealType}</td>
                  <td className="px-4 py-3 text-forest-600">
                    {o.items.reduce((s, it) => s + it.quantity, 0)}
                  </td>
                  <td className="px-4 py-3">{money(o.total)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={o.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, emoji, accent }) {
  return (
    <div className={`card p-5 ${accent === 'saffron' ? 'ring-2 ring-saffron-300' : ''}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm text-forest-500">{label}</span>
        <span className="text-xl">{emoji}</span>
      </div>
      <div className="mt-2 font-serif text-3xl font-bold text-saffron-700">{value}</div>
    </div>
  );
}

export function StatusBadge({ status }) {
  const map = {
    Pending: 'bg-yellow-100 text-yellow-800',
    Confirmed: 'bg-blue-100 text-blue-800',
    Delivered: 'bg-green-100 text-green-800',
    Cancelled: 'bg-red-100 text-red-700',
  };
  return <span className={`badge ${map[status] || 'bg-gray-100'}`}>{status}</span>;
}

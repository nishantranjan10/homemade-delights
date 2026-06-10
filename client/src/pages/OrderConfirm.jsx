import { Link, useLocation } from 'react-router-dom';
import { useConfig } from '../context/ConfigContext.jsx';
import { prettyDate, money, whatsappLink } from '../utils.js';

export default function OrderConfirm() {
  const { business } = useConfig();
  const { state } = useLocation();
  const order = state?.order;
  const whatsappMessage = state?.whatsappMessage;

  if (!order) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <div className="text-5xl">🤔</div>
        <h1 className="mt-4 font-serif text-2xl font-bold text-saffron-700">
          No order to show
        </h1>
        <p className="mt-2 text-forest-600">
          Looks like you reached this page directly.
        </p>
        <Link to="/order" className="btn-primary mt-6">Place an Order</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="card overflow-hidden">
        <div className="flyer-stripe bg-forest-600 px-6 py-8 text-center text-cream-50">
          <div className="text-5xl">✅</div>
          <h1 className="mt-2 font-serif text-3xl font-bold">Order Received!</h1>
          <p className="mt-1 text-cream-100">
            Thank you, {order.customerName}! Please confirm via WhatsApp to finalize.
          </p>
        </div>

        <div className="space-y-4 p-6">
          <Row label="Order ID" value={`#${order._id.slice(-6).toUpperCase()}`} />
          <Row label="Meal type" value={order.mealType} />
          <Row label="Date" value={prettyDate(order.preferredDate)} />
          <Row label="Fulfilment" value={order.fulfilment} />
          {order.fulfilment === 'Delivery' && order.address && (
            <Row label="Address" value={order.address} />
          )}
          <Row label="Payment" value={order.paymentMethod} />
          <Row
            label="Status"
            value={<span className="badge bg-saffron-100 text-saffron-700">{order.status}</span>}
          />

          <div className="rounded-xl bg-cream-100 p-4">
            <h3 className="mb-2 font-semibold text-forest-800">Items</h3>
            <ul className="space-y-1 text-sm text-forest-700">
              {order.items.map((it, i) => (
                <li key={i} className="flex justify-between gap-4">
                  <span>{it.name} × {it.quantity}</span>
                  <span>{money(it.unitPrice * it.quantity)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex justify-between border-t border-saffron-200 pt-3 font-serif text-xl font-bold text-saffron-700">
              <span>Total</span>
              <span>{money(order.total)}</span>
            </div>
          </div>

          <div className="rounded-xl bg-saffron-50 p-4 text-sm text-forest-700">
            <p className="font-semibold text-saffron-700">⚠️ Action needed</p>
            <p className="mt-1">
              Your order isn't confirmed until you message Rupali on WhatsApp.
              Tap below to send your order details instantly.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <a
              href={whatsappLink(
                business.whatsapp,
                whatsappMessage || `Hi! I just placed order #${order._id.slice(-6).toUpperCase()}.`
              )}
              target="_blank"
              rel="noreferrer"
              className="btn-whatsapp flex-1"
            >
              💬 Confirm on WhatsApp
            </a>
            <Link to="/" className="btn-outline flex-1">Back to Home</Link>
          </div>

          <p className="text-center text-xs text-forest-500">
            Payment: {business.paymentMethods.join(' / ')} · {business.address}
          </p>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-cream-200 pb-2">
      <span className="text-sm text-forest-500">{label}</span>
      <span className="font-medium text-forest-800">{value}</span>
    </div>
  );
}

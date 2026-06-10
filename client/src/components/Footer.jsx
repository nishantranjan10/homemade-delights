import { Link } from 'react-router-dom';
import { useConfig } from '../context/ConfigContext.jsx';
import { whatsappLink } from '../utils.js';

export default function Footer() {
  const { business } = useConfig();

  return (
    <footer className="mt-16 bg-forest-800 text-cream-100">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3">
        <div>
          <h3 className="font-serif text-xl font-bold text-saffron-300">
            🍛 {business.name}
          </h3>
          <p className="mt-2 text-sm text-cream-200/80">{business.tagline}</p>
        </div>

        <div className="text-sm">
          <h4 className="mb-2 font-semibold text-saffron-200">Reach Us</h4>
          <p className="text-cream-200/80">📍 {business.address}</p>
          <a
            className="mt-2 inline-block text-cream-100 underline hover:text-saffron-200"
            href={whatsappLink(business.whatsapp, 'Hi Rupali, I would like to order!')}
            target="_blank"
            rel="noreferrer"
          >
            💬 WhatsApp: {business.whatsappDisplay}
          </a>
          <p className="mt-2 text-cream-200/80">
            Payment: {business.paymentMethods.join(' / ')}
          </p>
        </div>

        <div className="text-sm">
          <h4 className="mb-2 font-semibold text-saffron-200">Quick Links</h4>
          <ul className="space-y-1">
            <li><Link className="hover:text-saffron-200" to="/menu">Weekly Menu</Link></li>
            <li><Link className="hover:text-saffron-200" to="/specials">Special Orders</Link></li>
            <li><Link className="hover:text-saffron-200" to="/order">Place an Order</Link></li>
            <li><Link className="hover:text-saffron-200" to="/admin">Admin Login</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-forest-700 py-4 text-center text-xs text-cream-200/60">
        © {new Date().getFullYear()} {business.name} · Made with ❤️ in Singapore
      </div>
    </footer>
  );
}

import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/menu', label: 'Weekly Menu' },
  { to: '/specials', label: 'Specials' },
  { to: '/order', label: 'Order Now' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const linkClass = ({ isActive }) =>
    `px-3 py-2 rounded-full text-sm font-medium transition-colors ${
      isActive
        ? 'bg-saffron-600 text-white'
        : 'text-forest-800 hover:bg-saffron-100'
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-saffron-100 bg-cream-50/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl">🍛</span>
          <span className="font-serif text-lg font-bold leading-tight text-saffron-700 sm:text-xl">
            Rupali's <span className="text-forest-700">Homemade Delights</span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={linkClass}>
              {l.label}
            </NavLink>
          ))}
        </div>

        <button
          className="rounded-lg p-2 text-saffron-700 md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          <span className="text-2xl">{open ? '✕' : '☰'}</span>
        </button>
      </nav>

      {open && (
        <div className="flex flex-col gap-1 border-t border-saffron-100 px-4 pb-4 md:hidden">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={linkClass}
              onClick={() => setOpen(false)}
            >
              {l.label}
            </NavLink>
          ))}
        </div>
      )}
    </header>
  );
}

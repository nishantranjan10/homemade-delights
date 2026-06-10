import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

const navItems = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/admin/menu', label: 'Menu', icon: '🍛' },
  { to: '/admin/orders', label: 'Orders', icon: '📋' },
  { to: '/admin/settings', label: 'Settings', icon: '⚙️' },
];

export default function AdminLayout() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/admin', { replace: true });
  }

  const linkClass = ({ isActive }) =>
    `flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
      isActive ? 'bg-saffron-600 text-white' : 'text-forest-700 hover:bg-saffron-100'
    }`;

  return (
    <div className="min-h-screen bg-cream-100">
      <header className="border-b border-saffron-100 bg-cream-50">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🍛</span>
            <div>
              <div className="font-serif font-bold text-saffron-700">Admin Panel</div>
              <div className="text-xs text-forest-500">
                Signed in as {admin?.username}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between gap-2 sm:justify-end">
            <nav className="flex gap-1">
              {navItems.map((item) => (
                <NavLink key={item.to} to={item.to} className={linkClass}>
                  <span>{item.icon}</span>
                  <span className="hidden sm:inline">{item.label}</span>
                </NavLink>
              ))}
            </nav>
            <button
              onClick={handleLogout}
              className="rounded-lg border border-saffron-300 px-3 py-2 text-sm font-medium text-saffron-700 hover:bg-saffron-50"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}

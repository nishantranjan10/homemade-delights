import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// Guards admin routes; redirects to login if not authenticated.
export default function ProtectedRoute({ children }) {
  const { admin, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-forest-600">
        Loading…
      </div>
    );
  }
  if (!admin) return <Navigate to="/admin" replace />;
  return children;
}

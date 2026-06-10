import { createContext, useContext, useEffect, useState } from 'react';
import { api, tokenStore } from '../api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, validate any stored token.
  useEffect(() => {
    if (!tokenStore.get()) {
      setLoading(false);
      return;
    }
    api
      .get('/auth/me', true)
      .then((data) => setAdmin(data.admin))
      .catch(() => tokenStore.clear())
      .finally(() => setLoading(false));
  }, []);

  async function login(username, password) {
    const data = await api.post('/auth/login', { username, password });
    tokenStore.set(data.token);
    setAdmin(data.admin);
  }

  function logout() {
    tokenStore.clear();
    setAdmin(null);
  }

  // Called after a credential change: store the fresh token + updated profile.
  function applyAccountUpdate({ token, admin: updated }) {
    if (token) tokenStore.set(token);
    if (updated) setAdmin(updated);
  }

  return (
    <AuthContext.Provider value={{ admin, loading, login, logout, applyAccountUpdate }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

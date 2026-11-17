import { createContext, useContext, useEffect, useState } from 'react';
import { api, setCsrf } from '../shared/lib/api.js';
import { useResource } from '../shared/hooks/useResource.js';
const Context = createContext(null);
export function Providers({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const catalogue = useResource('/public/catalogue');
  function updateUser(value) {
    setUser(value);
    setCsrf(value?.csrf);
  }
  async function refreshUser() {
    const value = await api('/auth/me');
    updateUser(value);
    return value;
  }
  useEffect(() => {
    refreshUser()
      .catch(() => updateUser(null))
      .finally(() => setAuthLoading(false));
  }, []);
  return (
    <Context.Provider value={{ user, updateUser, refreshUser, authLoading, catalogue }}>
      {children}
    </Context.Provider>
  );
}
export const useApp = () => useContext(Context);
export const roleHome = (user) =>
  user?.role === 'admin'
    ? '/admin'
    : user?.role === 'instructor'
      ? '/instructor'
      : user?.role === 'student'
        ? '/student'
        : '/enrolment/status';

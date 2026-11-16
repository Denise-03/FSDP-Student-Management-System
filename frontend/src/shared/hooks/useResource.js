import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api.js';
export function useResource(path, refreshMs = 0) {
  const [state, setState] = useState({ data: null, error: '', loading: true });
  const [revision, setRevision] = useState(0);
  const reload = useCallback(() => setRevision((value) => value + 1), []);
  useEffect(() => {
    let current = true;
    setState((previous) => ({ ...previous, loading: true, error: '' }));
    api(path)
      .then((data) => {
        if (current) setState({ data, error: '', loading: false });
      })
      .catch((error) => {
        if (current) setState({ data: null, error: error.message, loading: false });
      });
    return () => {
      current = false;
    };
  }, [path, revision]);
  useEffect(() => {
    if (!refreshMs) return;
    const timer = setInterval(reload, refreshMs);
    return () => clearInterval(timer);
  }, [reload, refreshMs]);
  return { ...state, reload };
}

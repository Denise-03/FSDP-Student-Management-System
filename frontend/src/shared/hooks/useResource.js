import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api.js';
<<<<<<< HEAD
export function useResource(path) {
=======
export function useResource(path, refreshMs = 0) {
>>>>>>> c5b28f4fc52d4b9e5a47b1708d0253400fbe7e94
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
<<<<<<< HEAD
=======
  useEffect(() => {
    if (!refreshMs) return;
    const timer = setInterval(reload, refreshMs);
    return () => clearInterval(timer);
  }, [reload, refreshMs]);
>>>>>>> c5b28f4fc52d4b9e5a47b1708d0253400fbe7e94
  return { ...state, reload };
}

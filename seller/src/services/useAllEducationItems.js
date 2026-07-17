import { useEffect, useState } from 'react';
import { fetchAllEducationItems } from './api';

export function useAllEducationItems() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    async function loadItems() {
      setLoading(true);
      setItems([]);
      setError('');

      try {
        const data = await fetchAllEducationItems({ signal: controller.signal });
        setItems(data.items ?? []);
      } catch (loadError) {
        if (loadError.name === 'AbortError') {
          return;
        }

        setItems([]);
        setError(loadError.message || 'Something went wrong while loading all education centers.');
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadItems();

    return () => {
      controller.abort();
    };
  }, []);

  return { items, loading, error };
}

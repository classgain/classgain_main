import { useEffect, useState } from 'react';
import { fetchEducationItems } from './api';

export function useEducationItems(category) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    async function loadItems() {
      if (!category) {
        setItems([]);
        setError('');
        setLoading(false);
        return;
      }

      setLoading(true);
      setItems([]);
      setError('');

      try {
        const data = await fetchEducationItems(category, { signal: controller.signal });
        setItems(data.items ?? []);
      } catch (loadError) {
        if (loadError.name === 'AbortError') {
          return;
        }

        setItems([]);
        setError(loadError.message || 'Something went wrong while loading data.');
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
  }, [category]);

  return { items, loading, error };
}

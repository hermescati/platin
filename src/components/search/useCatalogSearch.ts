import { useEffect, useState } from 'react';

import { catalogMinQuery, searchCatalog, type CatalogGame } from '@/lib/catalog';

const debounceMs = 300;

interface CatalogSearchState {
  query: string;
  results: CatalogGame[];
  loading: boolean;
  error: string | null;
}

const idle: CatalogSearchState = { query: '', results: [], loading: false, error: null };

export const useCatalogSearch = (rawQuery: string) => {
  const query = rawQuery.trim();
  const [state, setState] = useState<CatalogSearchState>(idle);

  useEffect(() => {
    if (query.length < catalogMinQuery) {
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(() => {
      setState((current) => ({ ...current, query, loading: true, error: null }));
      searchCatalog(query, controller.signal)
        .then((results) => setState({ query, results, loading: false, error: null }))
        .catch((error: unknown) => {
          if (controller.signal.aborted) {
            return;
          }
          setState({
            query,
            results: [],
            loading: false,
            error: error instanceof Error ? error.message : 'Search failed',
          });
        });
    }, debounceMs);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  if (query.length < catalogMinQuery) {
    return idle;
  }
  return state.query === query ? state : { ...state, loading: true };
};

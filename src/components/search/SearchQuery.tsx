import { createContext, useContext, useState, type ReactNode } from 'react';

interface SearchQueryValue {
  query: string;
  setQuery: (query: string) => void;
}

const SearchQueryContext = createContext<SearchQueryValue>({ query: '', setQuery: () => {} });

interface Props {
  children: ReactNode;
}

export const SearchQueryProvider = ({ children }: Props) => {
  const [query, setQuery] = useState('');

  return <SearchQueryContext value={{ query, setQuery }}>{children}</SearchQueryContext>;
};

export const useSearchQuery = () => useContext(SearchQueryContext);

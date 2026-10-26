import { SQLiteProvider, useSQLiteContext } from 'expo-sqlite';
import { useEffect, type ReactNode } from 'react';

import { useCatalogRefresh } from '@/db/catalog';
import { purgeRemovedGames } from '@/db/library';
import { migrate } from '@/db/migrate';

interface Props {
  children: ReactNode;
}

const Upkeep = () => {
  const db = useSQLiteContext();
  useCatalogRefresh();

  useEffect(() => {
    purgeRemovedGames(db);
  }, [db]);

  return null;
};

export const DatabaseProvider = ({ children }: Props) => (
  <SQLiteProvider databaseName="platin.db" options={{ enableChangeListener: true }} onInit={migrate}>
    <Upkeep />
    {children}
  </SQLiteProvider>
);

import { SQLiteProvider } from 'expo-sqlite';
import type { ReactNode } from 'react';

import { migrate } from '@/db/migrate';

interface Props {
  children: ReactNode;
}

export const DatabaseProvider = ({ children }: Props) => (
  <SQLiteProvider databaseName="platin.db" options={{ enableChangeListener: true }} onInit={migrate}>
    {children}
  </SQLiteProvider>
);

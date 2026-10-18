import { addDatabaseChangeListener, useSQLiteContext, type SQLiteDatabase } from 'expo-sqlite';
import { useEffect, useState } from 'react';

export const useLiveQuery = <T>(query: (db: SQLiteDatabase) => Promise<T>, tables: readonly string[]): T | undefined => {
  const db = useSQLiteContext();
  const [data, setData] = useState<T>();

  useEffect(() => {
    let active = true;
    let pending = false;

    const run = () => {
      if (pending) {
        return;
      }
      pending = true;
      queueMicrotask(() => {
        pending = false;
        query(db).then((result) => {
          if (active) {
            setData(result);
          }
        });
      });
    };

    run();
    const subscription = addDatabaseChangeListener((event) => {
      if (tables.includes(event.tableName)) {
        run();
      }
    });

    return () => {
      active = false;
      subscription.remove();
    };
  }, [db, query, tables]);

  return data;
};

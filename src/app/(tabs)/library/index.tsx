import { Stack } from 'expo-router';

import { LibraryView } from '@/views/library/LibraryView';

const LibraryScreen = () => (
  <>
    <Stack.Screen options={{ title: 'Library' }} />
    <LibraryView />
  </>
);

export default LibraryScreen;

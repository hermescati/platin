import { Stack } from 'expo-router';

import { HomeView } from '@/views/home/HomeView';

const HomeScreen = () => (
  <>
    <Stack.Screen options={{ title: 'Home' }} />
    <HomeView />
  </>
);

export default HomeScreen;

import { Stack } from 'expo-router';

import { ActivityView } from '@/views/activity/ActivityView';

const ActivityScreen = () => (
  <>
    <Stack.Screen options={{ title: 'Activity' }} />
    <ActivityView />
  </>
);

export default ActivityScreen;

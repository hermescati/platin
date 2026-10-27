import { Stack } from 'expo-router';

import { ProfileView } from '@/views/profile/ProfileView';

const ProfileScreen = () => (
  <>
    <Stack.Screen options={{ title: 'Profile' }} />
    <ProfileView />
  </>
);

export default ProfileScreen;

import { TabList, TabSlot, TabTrigger, Tabs } from 'expo-router/ui';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { GlassBackdrop } from '@/components/glass/GlassBackdrop';
import { GlassProvider } from '@/components/glass/GlassProvider';
import { FloatingTabBar } from '@/components/tab-bar/FloatingTabBar';
import { allTabs } from '@/components/tab-bar/tabs';

const TabsLayout = () => (
  <GestureHandlerRootView style={styles.fill}>
    <GlassProvider>
      <Tabs style={styles.fill}>
        <GlassBackdrop>
          <TabSlot />
        </GlassBackdrop>
        <FloatingTabBar />
        <TabList style={styles.hidden}>
          {allTabs.map((tab) => (
            <TabTrigger key={tab.name} name={tab.name} href={tab.href} />
          ))}
        </TabList>
      </Tabs>
    </GlassProvider>
  </GestureHandlerRootView>
);

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  hidden: {
    display: 'none',
  },
});

export default TabsLayout;

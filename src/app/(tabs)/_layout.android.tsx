import { TabList, TabSlot, TabTrigger, Tabs } from 'expo-router/ui';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { GlassBackdrop } from '@/components/glass/GlassBackdrop';
import { KeyboardRoot } from '@/components/keyboard/KeyboardRoot';
import { SearchQueryProvider } from '@/components/search/SearchQuery';
import { FloatingTabBar } from '@/components/tab-bar/FloatingTabBar';
import { TabBarCollapseProvider } from '@/components/tab-bar/TabBarCollapse';
import { allTabs } from '@/components/tab-bar/tabs';

const TabsLayout = () => (
  <GestureHandlerRootView style={styles.fill}>
    <KeyboardRoot>
      <SearchQueryProvider>
        <TabBarCollapseProvider>
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
        </TabBarCollapseProvider>
      </SearchQueryProvider>
    </KeyboardRoot>
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

// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router'
import { Home as HomeIcon, Settings as SettingsIcon } from 'lucide-react-native'
import { useTheme } from '@/src/context/ThemeContext'
import { ThemeToggle } from '@/src/components/ThemeToggle'
import { View, StyleSheet } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function TabLayout() {
  const { isDark } = useTheme()

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: isDark ? '#1F2937' : '#FFF' },
        headerTintColor: isDark ? '#FFF' : '#000',
        tabBarStyle: { backgroundColor: isDark ? '#1F2937' : '#FFF' },
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: isDark ? '#9CA3AF' : '#6B7280',
        headerRight: () => <View style={styles.headerRight}><ThemeToggle/></View>,
      }}
    >
      {/* ONLY these two children — no other Views or logic here */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <HomeIcon size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Sign In',
          tabBarIcon: ({ color, size }) => <SettingsIcon size={size} color={color} />,
        }}
      />
    </Tabs>
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  headerRight: { marginRight: 16 },
})
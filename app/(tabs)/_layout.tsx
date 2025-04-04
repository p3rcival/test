import { Tabs } from 'expo-router';
import { Home, Settings } from 'lucide-react-native';
import { useTheme } from '@/src/context/ThemeContext';
import { ThemeToggle } from '@/src/components/ThemeToggle';
import { View, StyleSheet } from 'react-native';

export default function TabLayout() {
  const { isDark } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
        },
        headerTintColor: isDark ? '#FFFFFF' : '#000000',
        tabBarStyle: {
          backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
        },
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: isDark ? '#9CA3AF' : '#6B7280',
        headerRight: () => (
          <View style={styles.headerRight}>
            <ThemeToggle />
          </View>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => <Settings size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  headerRight: {
    marginRight: 16,
  },
});
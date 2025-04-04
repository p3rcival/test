import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Sun, Moon } from 'lucide-react-native';
import { useTheme } from '@/src/context/ThemeContext';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <TouchableOpacity
      onPress={toggleTheme}
      style={[
        styles.button,
        theme === 'dark' ? styles.buttonDark : styles.buttonLight,
      ]}
    >
      {theme === 'light' ? (
        <Moon size={20} color="#4B5563" />
      ) : (
        <Sun size={20} color="#D1D5DB" />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 8,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonLight: {
    backgroundColor: '#F3F4F6',
  },
  buttonDark: {
    backgroundColor: '#374151',
  },
});
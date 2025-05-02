import React, { useEffect } from 'react';
import { AppState, LogBox } from 'react-native';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { ThemeProvider } from './context/ThemeContext';
import './index.css';
import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Optionally ignore harmless warnings:
LogBox.ignoreLogs(['Warning: ...']);

export default function Root() {
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      console.log('Global app state changed to:', nextAppState);
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => subscription.remove();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
    <ThemeProvider>
      <App />
      <Toaster position="top-right" />
    </ThemeProvider>
    </GestureHandlerRootView>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
      <Toaster position="top-right" />
    </ThemeProvider>
  </StrictMode>
);
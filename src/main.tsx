import React, { useEffect } from 'react';
import { AppState, LogBox } from 'react-native';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { ThemeProvider } from './context/ThemeContext';
import './index.css';

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
    <ThemeProvider>
      <App />
      <Toaster position="top-right" />
    </ThemeProvider>
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
// src/context/StepCounterContext.tsx
import React, { createContext, useState, useEffect, useRef, ReactNode } from 'react';
import AndroidPedometer from 'expo-android-pedometer';      // static import
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SPEED_THRESHOLD = 5; // m/s

interface StepCounterContextValue {
  enabled: boolean;
  setEnabled: (v: boolean) => void;
  steps: number;
}

export const StepCounterContext = createContext<StepCounterContextValue>({
  enabled: false,
  setEnabled: () => {},
  steps: 0,
});

export function StepCounterProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(false);
  const [steps, setSteps] = useState(0);
  const speedRef = useRef(0);

  // 1) Hydrate toggle
  useEffect(() => {
    AsyncStorage.getItem('stepCounterEnabled').then(v => {
      if (v === 'true') setEnabled(true);
    });
  }, []);

  // 2) Init pedometer once
  useEffect(() => {
    AndroidPedometer.initialize()
      .then(ok => console.log('Pedometer initialized:', ok))
      .catch(e => console.warn('Init failed:', e));
  }, []);

  // 3) Start/stop sensors when enabled changes
  useEffect(() => {
    AsyncStorage.setItem('stepCounterEnabled', String(enabled));

    // cast these to any so TS knows .remove() exists
    let locSub: any = null;
    let stepSub: any = null;

    async function startSensors() {
      // a) watch speed
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        locSub = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.Highest, distanceInterval: 1 },
          loc => {
            speedRef.current = loc.coords.speed ?? 0;
          }
        );
      }

      // b) request activity permission
      const perm = await AndroidPedometer.requestPermissions();
      console.log('Pedometer permission granted?', perm.granted);
      if (!perm.granted) return;

      // c) subscribe to steps
      stepSub = AndroidPedometer.subscribeToChanges((event: any) => {
        if (speedRef.current < SPEED_THRESHOLD) {
          setSteps(event.steps);
        }
      });
    }

    if (enabled) {
      setSteps(0);
      startSensors();
    } else {
      setSteps(0);
      locSub?.remove();
      stepSub?.remove();
    }

    return () => {
      locSub?.remove();
      stepSub?.remove();
    };
  }, [enabled]);

  return (
    <StepCounterContext.Provider value={{ enabled, setEnabled, steps }}>
      {children}
    </StepCounterContext.Provider>
  );
}

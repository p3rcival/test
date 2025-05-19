// src/context/StepCounterContext.tsx
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { Pedometer } from 'expo-sensors';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SPEED_THRESHOLD = 5; // meters/sec (~18km/h)

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
  const [speed, setSpeed] = useState(0);

  useEffect(() => {
    // load persisted setting
    AsyncStorage.getItem('stepCounterEnabled').then(v => {
      if (v === 'true') setEnabled(true);
    });
  }, []);

  useEffect(() => {
    AsyncStorage.setItem('stepCounterEnabled', enabled.toString());
    let pedSub: any = null;
    let locSub: any = null;

    async function startTracking() {
      // ask permissions
      await Location.requestForegroundPermissionsAsync();
      // watch speed
      locSub = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Highest, distanceInterval: 1 },
        loc => {
          setSpeed(loc.coords.speed ?? 0);
        }
      );
      // watch steps
      const isAvailable = await Pedometer.isAvailableAsync();
      if (isAvailable) {
        pedSub = Pedometer.watchStepCount(result => {
          // only count if below threshold
          if (speed < SPEED_THRESHOLD) {
            setSteps(prev => prev + result.steps);
          }
        });
      }
    }

    if (enabled) {
      setSteps(0);
      startTracking();
    } else {
      // clean up
      pedSub && pedSub.remove();
      locSub && locSub.remove();
    }

    return () => {
      pedSub && pedSub.remove();
      locSub && locSub.remove();
    };
  }, [enabled, speed]);

  return (
    <StepCounterContext.Provider value={{ enabled, setEnabled, steps }}>
      {children}
    </StepCounterContext.Provider>
  );
}

// src/context/AlarmSoundContext.tsx
import React, { createContext, useContext, useState } from 'react';

const defaultAlarm = require('@/assets/sounds/alarm.wav');

export const AlarmSoundContext = createContext({
  alarmSound: defaultAlarm,
  setAlarmSound: (sound: any) => {},
});

export const AlarmSoundProvider = ({ children }: { children: React.ReactNode }) => {
  const [alarmSound, setAlarmSound] = useState(defaultAlarm);
  return (
    <AlarmSoundContext.Provider value={{ alarmSound, setAlarmSound }}>
      {children}
    </AlarmSoundContext.Provider>
  );
};

export const useAlarmSound = () => useContext(AlarmSoundContext);
export const useSetAlarmSound = () => {
  const { setAlarmSound } = useContext(AlarmSoundContext);
  return setAlarmSound;
};

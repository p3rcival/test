import { NativeModules } from 'react-native';

const { StepModule } = NativeModules;

export async function fetchTodayStepCount(): Promise<number> {
  try {
    const steps = await StepModule.getTodaySteps();
    return steps;
  } catch (err) {
    console.error("Failed to get steps:", err);
    return 0;
  }
}
declare module 'expo-android-pedometer' {
  export function initialize(): Promise<boolean>;
  export function requestPermissions(): Promise<{ granted: boolean }>;
  export function subscribeToChanges(
    callback: (event: { steps: number; timestamp: number }) => void
  ): { remove(): void };
}
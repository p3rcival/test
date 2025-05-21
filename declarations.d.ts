// declarations.d.ts
declare module 'expo-android-pedometer' {
  /** Returns true if the device has a step sensor */
  export function initialize(): Promise<boolean>;

  /** Ask for the Android Activity Recognition permission */
  export function requestPermissions(): Promise<{
    granted: boolean;
    expires: 'never' | string;
    canAskAgain: boolean;
    status: 'granted' | 'denied';
  }>;

  /**
   * Subscribe to native step updates.
   * The returned object’s `.remove()` will unsubscribe.
   */
  export function subscribeToChanges(
    listener: (event: { steps: number; timestamp: number }) => void
  ): { remove(): void };
}

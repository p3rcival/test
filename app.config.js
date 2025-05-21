import 'dotenv/config';

export default ({ config }) => ({
  ...config,
  name: process.env.APP_NAME || "Workout Scheduler",
  slug: "workout-scheduler",
  owner: "jmbla259",
  version: process.env.APP_VERSION || "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "automatic",
  splash: {
    image: "./assets/splash.png",
    resizeMode: "cover",
    backgroundColor: "#ffffff"
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    supportsTablet: true,
    bundleIdentifier: process.env.IOS_BUNDLE_ID || "com.p3rcival.workoutscheduler"
  },
  android: {
    package: process.env.ANDROID_PACKAGE || "com.p3rcival.workoutscheduler",
    versionCode: 1,
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#ffffff"
    },
    allowBackup: false,
    permissions: [
      "CAMERA",
      "READ_EXTERNAL_STORAGE",
      "WRITE_EXTERNAL_STORAGE",
      "INTERNET",
      "ACTIVITY_RECOGNITION",
      "ACCESS_FINE_LOCATION"    // if you still need location for speed-gating
    ],
    softwareKeyboardLayoutMode: "resize",
    allowBackup: true,
    blockedPermissions: [
      "ACCESS_BACKGROUND_LOCATION",
      "ACCESS_FINE_LOCATION",
      "ACCESS_COARSE_LOCATION",
      "RECORD_AUDIO",
      "SYSTEM_ALERT_WINDOW",
      "VIBRATE"
    ]
  },
  web: {
    favicon: "./assets/favicon.png",
    bundler: "metro"
  },
  plugins: [
    "expo-android-pedometer",
    //"expo-activity-sensor",
    "expo-location",
    //"expo-keep-awake",
    "expo-router",
    [
      "expo-camera",
      {
        cameraPermission:
          "Allow Workout Scheduler to access your camera to record exercise form videos."
      }
    ],
    [
      "expo-media-library",
      {
        photosPermission:
          "Allow Workout Scheduler to access your photos to save exercise videos.",
        savePhotosPermission:
          "Allow Workout Scheduler to save exercise videos.",
        isAccessMediaLocationEnabled: true
      }
    ]
  ],
  scheme: "workout-scheduler",
  experiments: {
    tsconfigPaths: true,
    typedRoutes: true
  },
  extra: {
    supabaseUrl: "https://uplzwvwxfeuyioozfoof.supabase.co", //process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwbHp3dnd4ZmV1eWlvb3pmb29mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0NDI1NTQsImV4cCI6MjA1OTAxODU1NH0.x47YR8kuh7KPOg5ZM2RHsEChJF_yVUUj_CcteVm4LGo", //process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    eas: {
      projectId: "90579566-a075-45f9-a7a6-b8d6d183251c"
    }
  },
  assetBundlePatterns: ["**/*"],
});

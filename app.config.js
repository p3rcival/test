export default {
  expo: {
    name: "Workout Scheduler",
    slug: "workout-scheduler",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.workoutscheduler.app"
    },
    android: {
      package: "com.workoutscheduler.app",
      versionCode: 1,
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#3B82F6"
      },
      permissions: [
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE",
        "INTERNET"
      ],
      softwareKeyboardLayoutMode: "pan",
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
      "expo-router",
      [
        "expo-camera",
        {
          "cameraPermission": "Allow Workout Scheduler to access your camera to record exercise form videos."
        }
      ],
      [
        "expo-media-library",
        {
          "photosPermission": "Allow Workout Scheduler to access your photos to save exercise videos.",
          "savePhotosPermission": "Allow Workout Scheduler to save exercise videos.",
          "isAccessMediaLocationEnabled": true
        }
      ]
    ],
    scheme: "workout-scheduler",
    extra: {
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      eas: {
        projectId: "your-project-id"
      }
    }
  }
};
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { useTheme } from '@/src/context/ThemeContext';
import VideoPlayer from '../../components/VideoPlayer';

export default function VideoScreen() {
  // Retrieve videoId from route parameters.
  const params = useLocalSearchParams<{ videoId: string }>();
  const { videoId } = params;

  // Use our theme context.
  const { isDark } = useTheme();

  // Construct the full YouTube URL.
  const constructedUrl = videoId ? `https://www.youtube.com/watch?v=${videoId}` : '';

  // Ensure we have a videoId.
  if (!videoId) {
    return null;
  }

  // Get the router for navigating back.
  const router = useRouter();

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Video',
          headerStyle: {
            backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
          },
          headerTintColor: isDark ? '#FFFFFF' : '#000000',
        }}
      />
      <View style={styles.container}>
        <VideoPlayer
          url={constructedUrl}
          onReturn={() => router.back()}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000', // Dark background for video playback.
  },
});

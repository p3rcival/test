import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { useTheme } from '@/src/context/ThemeContext';
import VideoPlayer from '../../components/VideoPlayer';

export default function VideoScreen() {
  // Retrieve the route parameter "videoId"
  const params = useLocalSearchParams<{ videoId: string }>();
  const { videoId } = params;
  const { isDark } = useTheme();
  const router = useRouter();

  // Construct the full YouTube URL from videoId.
  const constructedUrl = videoId ? `https://www.youtube.com/watch?v=${videoId}` : '';

  // If no videoId is available, render nothing.
  if (!videoId) return null;

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
    backgroundColor: '#000', // dark background for video playback
  },
});

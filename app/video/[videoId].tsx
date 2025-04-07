// app/video/[videoId].tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { VideoPlayer } from '../../components/VideoPlayer'; // Ensure this path is correct
import { useLocalSearchParams } from 'expo-router';

export default function VideoScreen() {
  // Using expo-router's hook to extract route parameters
  const { videoId } = useLocalSearchParams<{ videoId: string }>();

  // Construct the standard YouTube URL from the videoId
  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

  return (
    <View style={styles.container}>
      <VideoPlayer videoUrl={videoUrl} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

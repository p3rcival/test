// app/video/[videoId].tsx
import React from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import VideoPlayer from '@/components/VideoPlayer';

export default function VideoScreen() {
  const { videoId } = useLocalSearchParams();
  const { width, height } = useWindowDimensions();

  return (
    <View style={styles.container}>
      {typeof videoId === 'string' ? (
        <VideoPlayer videoId={videoId} />
      ) : (
        <Text>Invalid video ID</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoPlayer: {
    flex: 1,
  },
});

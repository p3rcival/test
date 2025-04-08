// app/video/[videoId].tsx

import React from 'react';
import { View, StyleSheet } from 'react-native';
import VideoPlayer from '../../components/VideoPlayer';
import { useLocalSearchParams } from 'expo-router';

export default function VideoScreen() {
  // Extract the videoId from search params or route params
  const { videoId } = useLocalSearchParams<{ videoId: string }>();

  // Build a full YouTube watch URL from the videoId
  // If your parameter is already a full URL, adjust accordingly.
  const url = videoId ? `https://www.youtube.com/watch?v=${videoId}` : '';

  return (
    <View style={styles.container}>
      <VideoPlayer url={url} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

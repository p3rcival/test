// components/VideoPlayer.tsx
import React from 'react';
import { StyleSheet, Platform } from 'react-native';
import { WebView } from 'react-native-webview';

interface VideoPlayerProps {
  videoId: string;
}

function VideoPlayer({ videoId }: VideoPlayerProps) {
  const youtubeUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0&showinfo=0`;

  return (
    <WebView
      style={styles.videoPlayer}
      javaScriptEnabled={true}
      domStorageEnabled={true}
      source={{ uri: youtubeUrl }}
      allowsFullscreenVideo={true}
      mediaPlaybackRequiresUserAction={false}
    />
  );
}

const styles = StyleSheet.create({
  videoPlayer: {
    flex: 1,
  },
});

export default VideoPlayer;

// src/components/VideoPlayer.tsx
import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';

/**
 * Converts a YouTube URL (short or standard) to an embed URL.
 */
export function convertShortUrlToEmbed(url: string): string {
  // Check for the short URL format (e.g., https://youtu.be/xyz)
  const shortUrlRegex = /^https?:\/\/youtu\.be\/([^?]+)/;
  const shortMatch = url.match(shortUrlRegex);
  if (shortMatch && shortMatch[1]) {
    const videoId = shortMatch[1];
    return `https://www.youtube.com/embed/${videoId}`;
  }

  // Check for the standard URL format (e.g., https://www.youtube.com/watch?v=xyz)
  const standardUrlRegex = /^https?:\/\/www\.youtube\.com\/watch\?v=([^&]+)/;
  const standardMatch = url.match(standardUrlRegex);
  if (standardMatch && standardMatch[1]) {
    const videoId = standardMatch[1];
    return `https://www.youtube.com/embed/${videoId}`;
  }

  // If no pattern is matched, return the URL as is.
  return url;
}

export const VideoPlayer: React.FC<{ videoUrl: string }> = ({ videoUrl }) => {
  const embedUrl = convertShortUrlToEmbed(videoUrl);

  return (
    <View style={styles.container}>
      <WebView
        style={styles.webview}
        source={{ uri: embedUrl }}
        javaScriptEnabled
        domStorageEnabled
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: Dimensions.get('window').width,
    height: 220, // Adjust height as needed
  },
  webview: {
    flex: 1,
  },
});

import React, { useState } from 'react';
import { View, Dimensions, StyleSheet, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { WebView, WebViewNavigation } from 'react-native-webview';
import extractYoutubeVideoId from '../utils/extractYoutubeVideoId';
import * as Linking from 'expo-linking';

interface VideoPlayerProps {
  url: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ url }) => {
  const [loading, setLoading] = useState(true);
  const videoId = extractYoutubeVideoId(url);

  if (!videoId) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Invalid YouTube URL</Text>
      </View>
    );
  }

  // Construct the embed URL with playsinline enabled
  const embedUrl = `https://www.youtube.com/embed/${videoId}?playsinline=1`;
  console.log('[VideoPlayer] Using embed URL:', embedUrl);

  // Calculate dimensions based on screen width
  const screenWidth = Dimensions.get('window').width;
  const videoHeight = screenWidth * (9 / 16);

  /**
   * Intercepts navigation requests:
   * Allow any URL that starts with the embed base URL (to account for extra query parameters).
   * Otherwise, open it externally.
   */
  const handleShouldStartLoadWithRequest = (request: WebViewNavigation): boolean => {
    if (request.url.startsWith("https://www.youtube.com/embed/")) {
      return true;
    }
    console.log('[VideoPlayer] Intercepting navigation to:', request.url);
    Linking.openURL(request.url);
    return false;
  };

  return (
    <View style={styles.container}>
      {loading && (
        <ActivityIndicator style={styles.loadingIndicator} color="#fff" size="large" />
      )}
      <WebView
        style={{ width: screenWidth, height: videoHeight }}
        source={{ uri: embedUrl }}
        javaScriptEnabled
        domStorageEnabled
        userAgent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36"
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onError={(syntheticEvent) => {
          console.error('[VideoPlayer] WebView error:', syntheticEvent.nativeEvent);
        }}
        onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
      />
      {!loading && (
        <TouchableOpacity onPress={() => Linking.openURL(embedUrl)}>
          <View style={styles.fallbackContainer}>
            <Text style={styles.fallbackText}>
              If the video is not displaying, tap here to open it in YouTube.
            </Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
    paddingVertical: 20,
  },
  loadingIndicator: {
    position: 'absolute',
    top: '45%',
    zIndex: 1,
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
  },
  fallbackContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  fallbackText: {
    color: '#fff',
    marginBottom: 8,
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
});

export default VideoPlayer;

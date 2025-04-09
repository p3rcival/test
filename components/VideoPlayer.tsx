// components/VideoPlayer.tsx
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Linking, Platform, View, Text, TouchableOpacity, StyleSheet, useWindowDimensions, Modal, AppState } from 'react-native';
import WebView from 'react-native-webview';
import { getEmbedUrl } from '../utils/getEmbedUrl';

const VideoPlayer = ({ url, onReturn }: { url: string, onReturn?: () => void }) => {
  const embedUrl = getEmbedUrl(url);
  const { width } = useWindowDimensions();
  const height = (width * 9) / 16;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active' && onReturn) {
        onReturn();
      }
    });
    return () => subscription.remove();
  }, [onReturn]);

  if (!embedUrl) {
    return <Text style={styles.errorText}>Invalid or unsupported video URL</Text>;
  }

  return (
    <View style={{ width, height }}>
      {loading && (
        <ActivityIndicator size="large" style={StyleSheet.absoluteFill} />
      )}
      <WebView
        source={{ uri: embedUrl }}
        style={{ flex: 1 }}
        allowsFullscreenVideo
        allowsInlineMediaPlayback
        javaScriptEnabled
        domStorageEnabled
        mediaPlaybackRequiresUserAction={false}
        onLoadEnd={() => setLoading(false)}
        onShouldStartLoadWithRequest={(req) => {
          const allowed = embedUrl.includes(req.url) || req.url.startsWith('https://www.youtube.com') || req.url.startsWith('https://player.vimeo.com');
          if (!allowed) Linking.openURL(req.url);
          return allowed;
        }}
        onError={(e) => {
          const { nativeEvent } = e;
          console.error('WebView error:', nativeEvent);
        }}
      />
      <TouchableOpacity onPress={() => Linking.openURL(url)}>
        <Text style={styles.fallbackText}>Open in browser</Text>
      </TouchableOpacity>
    </View>
  );
};

export default VideoPlayer;

const styles = StyleSheet.create({
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginVertical: 10,
  },
  fallbackText: {
    marginTop: 5,
    textAlign: 'center',
    color: '#3B82F6',
    textDecorationLine: 'underline'
  }
});


// Usage of VideoPlayer in modal:
// <Modal visible={!!videoModalUrl} transparent={false} animationType="slide" onRequestClose={() => setVideoModalUrl(null)}>
//   <VideoPlayer url={videoModalUrl!} onReturn={() => setVideoModalUrl(null)} />
//   <TouchableOpacity onPress={() => setVideoModalUrl(null)} style={{ padding: 10, alignSelf: 'center' }}>
//     <Text style={{ color: 'blue' }}>Close</Text>
//   </TouchableOpacity>
// </Modal>

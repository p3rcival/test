import React from 'react';
import { View, Dimensions, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import convertYoutubeUrl from '../utils/convertYoutubeUrl';

const VideoPlayer = ({ videoUrl }: { videoUrl: string }) => {
  // Convert to embed URL if necessary
  const embedUrl = convertYoutubeUrl(videoUrl);
  // Calculate height based on device width for a 16:9 ratio
  const videoWidth = Dimensions.get('window').width;
  const videoHeight = videoWidth * (9 / 16);

  // HTML for embedding the YouTube player
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body, html { margin: 0; padding: 0; overflow: hidden; }
        </style>
      </head>
      <body>
        <iframe 
          width="100%" 
          height="100%" 
          src="${embedUrl}" 
          frameborder="0" 
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" 
          allowfullscreen>
        </iframe>
      </body>
    </html>
  `;

  return (
    <View style={[styles.container, { height: videoHeight }]}>
      <WebView 
        source={{ html }} 
        style={styles.webview}
        javaScriptEnabled
        domStorageEnabled
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#000',
  },
  webview: {
    flex: 1,
  },
});

// Make sure you import or define convertShortUrlToEmbed in this file if it's not already in scope
export default VideoPlayer;

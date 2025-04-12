import React, { useEffect, useState, useCallback } from 'react';
import { 
  ActivityIndicator, 
  Linking, 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  useWindowDimensions, 
  AppState 
} from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import WebView from 'react-native-webview';
import extractYoutubeVideoId from '../utils/extractYoutubeVideoId'; // Default export.
import { getEmbedUrl } from '../utils/getEmbedUrl';
import { useRouter } from 'expo-router';

interface VideoPlayerProps {
  url: string;
  onReturn?: () => void;
  onFullScreenChange?: (status: boolean) => void;
}

const VideoPlayer = ({ url, onReturn, onFullScreenChange }: VideoPlayerProps) => {
  const { width } = useWindowDimensions();
  const height = (width * 9) / 16;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);
  // New state to track if a fallback link was used.
  const [fallbackUsed, setFallbackUsed] = useState(false);

  const videoId = extractYoutubeVideoId(url);
  const isYouTube = !!videoId;
  const embedUrl = getEmbedUrl(url);

  console.log('VideoPlayer mounted. URL:', url);

  // AppState listener to log app focus changes.
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      console.log('AppState changed to:', state);
      // If coming back to active state and a fallback link was triggered,
      // we want to navigate to the home page.
      if (state === 'active' && fallbackUsed) {
        console.log('Fallback link was used. Navigating to home page.');
        router.replace('/'); // Navigate to the home page.
      }
    });
    return () => {
      console.log('VideoPlayer unmounted.');
      subscription.remove();
    };
  }, [fallbackUsed, router]);

  // Callback for YouTube player state changes.
  const onYoutubeStateChange = useCallback(
    (state: string) => {
      console.log('YouTube state changed:', state);
      if (state === 'ended') {
        setPlaying(false);
        console.log('Video ended. Calling onReturn callback.');
        if (onReturn) {
          onReturn();
        }
      }
    },
    [onReturn]
  );

  if (isYouTube) {
    return (
      <View style={{ width, height }}>
        {loading && (
          <ActivityIndicator size="large" style={StyleSheet.absoluteFill} />
        )}
        <YoutubePlayer
          height={height}
          play={playing}
          videoId={videoId}
          onChangeState={onYoutubeStateChange}
          onReady={() => {
            console.log('YouTube player is ready.');
            setLoading(false);
          }}
          webViewStyle={{ opacity: loading ? 0 : 1 }}
          onFullScreenChange={(fullScreenStatus: boolean) => {
            setIsFullScreen(fullScreenStatus);
            console.log('Full-screen status changed:', fullScreenStatus);
            if (onFullScreenChange) {
              onFullScreenChange(fullScreenStatus);
            }
          }}
          initialPlayerParams={{
            modestbranding: true,
            controls: true,
            rel: false,
            fs: true,
            playsinline: true,
          } as any}
        />
        <View style={styles.fallbackContainer}>
          <TouchableOpacity
            style={styles.fallbackButton}
            onPress={() => {
              console.log('Fallback link selected: Open in YouTube App');
              setFallbackUsed(true);
              Linking.openURL(`vnd.youtube://watch?v=${videoId}`);
            }}
          >
            <Text style={styles.fallbackText}>
              Open in YouTube App
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.fallbackButton}
            onPress={() => {
              console.log('Fallback link selected: Open in Browser');
              setFallbackUsed(true);
              Linking.openURL(url);
            }}
          >
            <Text style={styles.fallbackText}>
              Open in Browser
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
  
  if (!embedUrl) {
    console.log('No valid embed URL for:', url);
    return (
      <Text style={styles.errorText}>
        Invalid or unsupported video URL
      </Text>
    );
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
        onLoadEnd={() => {
          console.log('WebView finished loading.');
          setLoading(false);
        }}
        onShouldStartLoadWithRequest={(req) => {
          const allowed =
            embedUrl.includes(req.url) ||
            req.url.startsWith('https://www.youtube.com') ||
            req.url.startsWith('https://player.vimeo.com');
          if (!allowed) {
            console.log('Fallback triggered from WebView with request URL:', req.url);
            setFallbackUsed(true);
            Linking.openURL(req.url);
            // Delay navigation to avoid overlap.
            setTimeout(() => {
              router.replace('/');
            }, 500);
          }
          return allowed;
        }}
        onError={(e) => {
          const { nativeEvent } = e;
          console.error('WebView error:', nativeEvent);
        }}
      />
      <View style={styles.fallbackContainer}>
        <TouchableOpacity
          style={styles.fallbackButton}
          onPress={() => {
            console.log('Fallback link selected: Open in Browser (WebView fallback)');
            setFallbackUsed(true);
            Linking.openURL(url);
            setTimeout(() => {
              router.replace('/');
            }, 500);
          }}
        >
          <Text style={styles.fallbackText}>
            Open in Browser
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginVertical: 10,
  },
  fallbackContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 5,
  },
  fallbackButton: {
    padding: 8,
  },
  fallbackText: {
    color: '#3B82F6',
    textDecorationLine: 'underline',
  },
});

export default VideoPlayer;

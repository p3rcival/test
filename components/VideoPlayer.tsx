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
  const [fallbackUsed, setFallbackUsed] = useState(false);

  const videoId = extractYoutubeVideoId(url);
  const isYouTube = !!videoId;
  const embedUrl = getEmbedUrl(url);

  console.log('VideoPlayer mounted. URL:', url);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      console.log('AppState changed to:', state);
    });
    return () => {
      console.log('VideoPlayer unmounted.');
      subscription.remove();
    };
  }, []);

  const onYoutubeStateChange = useCallback(
    (state: string) => {
      console.log('YouTube state changed:', state);
      if (state === 'ended') {
        setPlaying(false);
        console.log('Video ended. Staying on the page.');
        // Do not call onReturn() here in order to stay on the VideoScreen.
        // if (onReturn) {
        //   onReturn();
        // }
      }
    },
    [] // Removed onReturn dependency if no longer used here.
  );

  if (isYouTube) {
    return (
      <View style={{ width, height, backgroundColor: 'black' }}>
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
          // Remove the opacity hack; set backgroundColor directly.
          webViewStyle={{ backgroundColor: 'black' }}
          // Force software rendering on Android.
          webViewProps={{ androidLayerType: 'hardware' }}
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
            enablejsapi: 1, // enables JS API for more control
            autoplay: 1,    // may force the video to start; test if it makes a difference
          } as any}
        />
        <View style={styles.fallbackContainer}>
          <TouchableOpacity
            style={styles.fallbackButton}
            onPress={() => {
              console.log('Fallback link selected: Open in YouTube App');
              setFallbackUsed(true);
              if (onReturn) {
                console.log('Calling onReturn from fallback handler (YouTube App).');
                onReturn();
              }
              Linking.openURL(`vnd.youtube://watch?v=${videoId}`);
              setTimeout(() => {
                console.log('Navigating to home page due to fallback (YouTube App).');
                //router.replace('/');
                router.back();
              }, 500);
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
              if (onReturn) {
                console.log('Calling onReturn from fallback handler (Browser).');
                onReturn();
              }
              Linking.openURL(url);
              setTimeout(() => {
                console.log('Navigating to home page due to fallback (Browser).');
                //router.replace('/');
                router.back();
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
            if (onReturn) {
              console.log('Calling onReturn from WebView fallback.');
              onReturn();
            }
            Linking.openURL(req.url);
            setTimeout(() => {
              console.log('Navigating to home page due to fallback (WebView).');
              // router.replace('/');
              router.back();
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
            if (onReturn) {
              console.log('Calling onReturn from fallback handler (WebView fallback).');
              onReturn();
            }
            Linking.openURL(url);
            setTimeout(() => {
              console.log('Navigating to home page due to fallback (WebView fallback).');
              //router.replace('/');
              router.back();
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

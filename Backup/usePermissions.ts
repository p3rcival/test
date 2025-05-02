import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import * as Camera from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';

interface PermissionStatus {
  camera: boolean;
  mediaLibrary: boolean;
  loading: boolean;
  error: string | null;
}

export function usePermissions() {
  const [status, setStatus] = useState<PermissionStatus>({
    camera: false,
    mediaLibrary: false,
    loading: true,
    error: null,
  });

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    try {
      const [cameraPermission, mediaLibraryPermission] = await Promise.all([
        Camera.requestCameraPermissionsAsync(),
        Platform.OS !== 'web' ? MediaLibrary.requestPermissionsAsync() : Promise.resolve({ granted: true }),
      ]);

      setStatus({
        camera: cameraPermission.granted,
        mediaLibrary: mediaLibraryPermission.granted,
        loading: false,
        error: null,
      });
    } catch (error) {
      setStatus(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to check permissions',
      }));
    }
  };

  const requestPermissions = async () => {
    setStatus(prev => ({ ...prev, loading: true, error: null }));
    await checkPermissions();
  };

  return {
    ...status,
    requestPermissions,
  };
}
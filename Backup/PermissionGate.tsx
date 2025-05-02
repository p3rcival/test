import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { usePermissions } from '@/hooks/usePermissions';
import { AlertCircle } from 'lucide-react-native';

interface PermissionGateProps {
  children: React.ReactNode;
}

export function PermissionGate({ children }: PermissionGateProps) {
  const { camera, mediaLibrary, loading, error, requestPermissions } = usePermissions();

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Checking permissions...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <AlertCircle color="#EF4444" size={48} />
        <Text style={[styles.message, styles.error]}>{error}</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermissions}>
          <Text style={styles.buttonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!camera || !mediaLibrary) {
    return (
      <View style={styles.container}>
        <AlertCircle color="#F59E0B" size={48} />
        <Text style={styles.message}>
          We need camera and storage permissions to help you record and save your exercise videos.
        </Text>
        <TouchableOpacity style={styles.button} onPress={requestPermissions}>
          <Text style={styles.buttonText}>Grant Permissions</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return children;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 20,
    color: '#4B5563',
    fontFamily: 'Inter-Regular',
  },
  error: {
    color: '#EF4444',
  },
  button: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter-Bold',
  },
});
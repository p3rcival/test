import React, { useState, useEffect, useContext, } from 'react';
import { View, Text, Switch, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, FlatList, Pressable, Button } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { Audio } from 'expo-av';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/src/context/ThemeContext';
import { LogOut, Mail, Lock, LogIn } from 'lucide-react-native';
import { User, SignOut } from '@supabase/supabase-js';
import { Auth } from '@/src/components/Auth';

const ALARM_SOUNDS = [
  { name: 'Default', file: require('@/assets/sounds/classic_beep.wav') },
  { name: 'Chime', file: require('@/assets/sounds/gentle_melody.wav') },
  { name: 'Bell', file: require('@/assets/sounds/high_energy_pulse.wav') },
  { name: 'Nature', file: require('@/assets/sounds/nature_morning.wav') },
  { name: 'SciFi', file: require('@/assets/sounds/sci_fi_alert.wav') },
];

export default function Settings() {
  const { isDark } = useTheme();
  const [alarmSound, setAlarmSound] = useState(ALARM_SOUNDS[0]);
  const [alarmSounds, setAlarmSounds] = useState(ALARM_SOUNDS);
  const [user, setUser ] = useState<User | null>(null);  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAlarm, setSelectedAlarm] = useState(ALARM_SOUNDS[0]);

  useEffect(() => {
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user || null);
      });
      return () => subscription.unsubscribe();
    }, []);

    const playPreview = async (soundFile: any) => {
      const { sound } = await Audio.Sound.createAsync(soundFile);
      await sound.playAsync();
    };

  const handleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    try {
      setLoading(true);
      setError(null);
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw error;
      setError('Check your email for the confirmation link');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      {user ? (
        <View style={[styles.userContainer, isDark && styles.userContainerDark]}>
          <Text style={[styles.emailText, isDark && styles.emailTextDark]}>
            Signed in as: {user.email}
          </Text>
          <TouchableOpacity
            onPress={handleSignOut}
            style={[styles.signOutButton, isDark && styles.signOutButtonDark]}
          >
            <LogOut size={18} color={isDark ? '#F3F4F6' : '#1F2937'} />
            <Text style={[styles.signOutText, isDark && styles.signOutTextDark]}>
              Sign Out
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={[styles.authContainer, isDark && styles.authContainerDark]}>
          <Text style={[styles.authTitle, isDark && styles.authTitleDark]}>
            Sign in to your account
          </Text>
          
          {error && (
            <Text style={styles.errorText}>{error}</Text>
          )}

          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <Mail size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
              <TextInput
                style={[styles.input, isDark && styles.inputDark]}
                placeholder="Email"
                placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputWrapper}>
              <Lock size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
              <TextInput
                style={[styles.input, isDark && styles.inputDark]}
                placeholder="Password"
                placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.signInButton]}
              onPress={handleSignIn}
              disabled={loading}
            >
              <LogIn size={18} color="#FFFFFF" />
              <Text style={styles.buttonText}>
                {loading ? 'Loading...' : 'Sign In'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.signUpButton]}
              onPress={handleSignUp}
              disabled={loading}
            >
              <Text style={[styles.buttonText, styles.signUpButtonText]}>
                {loading ? 'Loading...' : 'Sign Up'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ALARM SOUND CARD */}
      <TouchableOpacity
        style={[styles.card, isDark && styles.cardDark]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={[styles.label, isDark && styles.labelDark]}>
          Select Alarm Sound
        </Text>
        <Text style={[styles.value, isDark && styles.valueDark]}>
          {selectedAlarm?.name ?? 'Default'}
        </Text>
      </TouchableOpacity>

      {/* ALARM PICKER MODAL */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <Pressable
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.5)',
          }}
          onPress={() => setModalVisible(false)}
        >
          <View
            style={{
              backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
              borderRadius: 12,
              width: '90%',
              maxHeight: '60%',
              padding: 16,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: 'bold',
                marginBottom: 12,
                color: isDark ? '#F3F4F6' : '#1F2937',
              }}
            >
              Choose Alarm Sound
            </Text>
            {ALARM_SOUNDS.map((sound) => (
              <TouchableOpacity
                key={sound.name}
                onPress={() => {
                  setSelectedAlarm(sound)
                  playPreview(sound.file)
                  setModalVisible(false)
                }}
                style={{
                  paddingVertical: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: isDark ? '#374151' : '#E5E7EB',
                }}
              >
                <Text
                  style={{
                    color: isDark ? '#F3F4F6' : '#1F2937',
                    fontSize: 16,
                  }}
                >
                  {sound.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );

}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    //justifyContent: 'center',
    backgroundColor: '#f3f4f6',
    },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  settingRowLight: {
    backgroundColor: '#F3F4F6',
  },
  settingRowDark: {
    backgroundColor: '#374151',
  },
  settingText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1F2937',
  },
  settingTextDark: {
    color: '#F9FAFB',
  },
  selectedOption: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  selectedOptionDark: {
    color: '#D1D5DB',
  },
    screen: {
    flex: 1,
    backgroundColor: '#F3F4F6',  // light gray
    padding: 16,
  },
  screenDark: {
    backgroundColor: '#1F2937',  // your dark bg
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    // iOS shadow
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    // Android elevation
    elevation: 2,
  },
  cardDark: {
    backgroundColor: '#2D313A',  // match your other dark cards
  },
  label: {
    fontSize: 16,
    color: '#111827',
  },
  labelDark: {
    color: '#E5E7EB',
  },
    value: {
    fontSize: 16,
    color: '#6B7280',
  },
  valueDark: {
    color: '#9CA3AF',
  },
  containerDark: {
    backgroundColor: '#111827',
  },
  userContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  userContainerDark: {
    backgroundColor: '#1F2937',
  },
  emailText: {
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 16,
    fontFamily: 'Inter-Regular',
  },
  emailTextDark: {
    color: '#F3F4F6',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    justifyContent: 'center',
  },
  signOutButtonDark: {
    backgroundColor: '#374151',
  },
  signOutText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#1F2937',
    fontFamily: 'Inter-Bold',
  },
  signOutTextDark: {
    color: '#F3F4F6',
  },
  authContainer: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 12,
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  authContainerDark: {
    backgroundColor: '#1F2937',
  },
  authTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
    color: '#1F2937',
    fontFamily: 'Inter-Bold',
  },
  authTitleDark: {
    color: '#F3F4F6',
  },
  errorText: {
    color: '#EF4444',
    marginBottom: 16,
    textAlign: 'center',
    fontFamily: 'Inter-Regular',
  },
  inputContainer: {
    gap: 16,
    marginBottom: 24,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    height: 44,
    marginLeft: 8,
    color: '#1F2937',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  inputDark: {
    backgroundColor: '#374151',
    borderColor: '#4B5563',
    color: '#F3F4F6',
  },
  buttonContainer: {
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  signInButton: {
    backgroundColor: '#3B82F6',
  },
  signUpButton: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  signUpButtonText: {
    color: '#4B5563',
  },
});
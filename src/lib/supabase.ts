import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import 'react-native-url-polyfill/auto';

// Get Supabase URL and Anon Key based on platform
const supabaseUrl = Platform.select({
  web: process.env.EXPO_PUBLIC_SUPABASE_URL,
  default: Constants.expoConfig?.extra?.supabaseUrl,
}) || process.env.EXPO_PUBLIC_SUPABASE_URL; // Fallback to process.env

const supabaseAnonKey = Platform.select({
  web: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  default: Constants.expoConfig?.extra?.supabaseAnonKey,
}) || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY; // Fallback to process.env

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
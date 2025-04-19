// app/(tabs)/index.tsx
import React, { useState, useEffect, useCallback } from 'react'
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
} from 'react-native'
import { startOfDay, differenceInCalendarDays, format } from 'date-fns'
import Toast from 'react-native-toast-message'
import { useFocusEffect } from '@react-navigation/native'
import { useTheme } from '@/src/context/ThemeContext'
import { supabase } from '@/src/lib/supabase'
import { Dumbbell } from 'lucide-react-native'

import { Calendar } from '@/src/components/Calendar'
import { DaySchedule } from '@/src/components/DaySchedule'
import { ExerciseForm } from '@/src/components/ExerciseForm'

// ─── STYLES ──────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  containerDark: { backgroundColor: '#111827' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerDark: {
    backgroundColor: '#1F2937',
    borderBottomColor: '#374151',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 12,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
  },
  titleDark: { color: '#FFFFFF' },

  section: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginVertical: 8,
    marginHorizontal: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  sectionDark: { backgroundColor: '#1F2937', shadowColor: '#000' },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
  },
  sectionTitleDark: { color: '#FFFFFF' },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'Inter-Regular',
  },
  loadingTextDark: { color: '#9CA3AF' },
})
// ────────────────────────────────────────────────────────────────────────────────

export default function Home() {
  const { isDark } = useTheme()
  const [selectedDate, setSelectedDate] = useState(() => startOfDay(new Date()))
  const [workoutSchedule, setWorkoutSchedule] = useState<Record<string, any>>({})
  const [isLoading, setIsLoading] = useState(true)

  // Helper: past vs future
  const isPastDate = (date: Date) =>
    differenceInCalendarDays(date, new Date()) < 0

  // Load from Supabase
  async function loadWorkoutSchedules() {
    setIsLoading(true)
    const { data, error } = await supabase.from('workout_schedules').select('*')
    if (error) {
      Toast.show({ type: 'error', text1: 'Failed to load workouts' })
      setIsLoading(false)
      return
    }
    const map: Record<string, any> = {}
    data.forEach(item => (map[item.date] = item))
    setWorkoutSchedule(map)
    setIsLoading(false)
  }

  // Fetch on focus or login
  useFocusEffect(
    useCallback(() => {
      loadWorkoutSchedules()
    }, [])
  )

  // Reload when auth status changes
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      if (session?.user) loadWorkoutSchedules()
      else setWorkoutSchedule({})
    })
    return () => subscription.unsubscribe()
  }, [])

  // Stubbed handlers—you already have these wired up
  const handleAddExercise = async (e: any) => {}
  const handleRemoveExercise = async (id: string) => {}
  const handleUpdateExercise = async (e: any) => {}

  const dateKey = format(selectedDate, 'yyyy-MM-dd')
  const daySchedule = workoutSchedule[dateKey] || { date: dateKey, exercises: [] }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={[styles.container, isDark && styles.containerDark]}>
        {/* ─── HEADER ────────────────────────────────────────────── */}
        <View style={[styles.header, isDark && styles.headerDark]}>
          <Dumbbell size={24} color="#3B82F6" />
          <Text style={[styles.title, isDark && styles.titleDark]}>
            Workout Scheduler
          </Text>
        </View>

        {/* ─── ENTIRE SCREEN IS A KEYBOARD-AVOIDING SCROLLVIEW ───── */}
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'android' ? 'height' : 'padding'}
          keyboardVerticalOffset={16}
        >
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{
              paddingTop: 16,
              paddingHorizontal: 0,
              paddingBottom: 120,   // <- enough bottom padding so the form can't hide behind tabs
            }}
            showsVerticalScrollIndicator={false}
          >
            {/* DaySchedule */}
            <View style={[styles.section, isDark && styles.sectionDark]}>
              <DaySchedule
                date={selectedDate}
                exercises={daySchedule.exercises}
                onRemoveExercise={handleRemoveExercise}
                onUpdateExercise={handleUpdateExercise}
              />
            </View>

            {/* Calendar */}
            <View style={[styles.section, isDark && styles.sectionDark]}>
              <Calendar
                selectedDate={selectedDate}
                workoutSchedule={workoutSchedule}
                onSelectDate={setSelectedDate}
              />
            </View>

            {/* Add Exercise Form */}
            <View style={[styles.section, isDark && styles.sectionDark]}>
              <Text
                style={[
                  styles.sectionTitle,
                  isDark && styles.sectionTitleDark,
                ]}
              >
                Add Exercise
              </Text>

              {!isPastDate(selectedDate) && (
                <ExerciseForm onAddExercise={handleAddExercise} />
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Toast container */}
        <Toast />
      </View>
    </SafeAreaView>
  )
}

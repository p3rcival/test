// app/(tabs)/index.tsx
import React, { useState, useEffect, useCallback, useContext } from 'react'
import {
  TouchableWithoutFeedback,
  Keyboard,
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
import { User } from '@supabase/supabase-js'
import { Exercise } from '@/src/types'
import { Calendar } from '@/src/components/Calendar'
import { DaySchedule } from '@/src/components/DaySchedule'
import { ExerciseForm } from '@/src/components/ExerciseForm'

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
  headerDark: { backgroundColor: '#1F2937', borderBottomColor: '#374151' },
  title: { fontSize: 20, fontWeight: 'bold', marginLeft: 12, color: '#1F2937' },
  titleDark: { color: '#FFFFFF' },
  section: {
    marginVertical: 8,
    marginHorizontal: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  sectionDark: { backgroundColor: '#1F2937' },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#1F2937',
  },
  sectionTitleDark: { color: '#FFFFFF' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  loadingText: { fontSize: 16, color: '#666' },
  loadingTextDark: { color: '#9CA3AF' },
})

export default function Home() {
  const { isDark } = useTheme()

  // state
  const [selectedDate, setSelectedDate] = useState(() => startOfDay(new Date()))
  const [workoutSchedule, setWorkoutSchedule] = useState<
    Record<string, { date: string; exercises: Exercise[] }>
  >({})
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)

  const isPastDate = (date: Date) => differenceInCalendarDays(date, new Date()) < 0;

  // fetch schedules
  async function loadWorkoutSchedules() {
    setIsLoading(true)
    const { data, error } = await supabase.from('workout_schedules').select('*')
    if (error) {
      console.error(error)
      Toast.show({ type: 'error', text1: 'Failed to load workouts' })
      setIsLoading(false)
      return
    }
    const map: typeof workoutSchedule = {}
    data.forEach(item => {
      map[item.date] = { date: item.date, exercises: item.exercises }
    })
    setWorkoutSchedule(map)
    setIsLoading(false)
  }

  // on focus / login
  useFocusEffect(
    useCallback(() => {
      async function refresh() {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()
        if (error) console.error(error)
        if (session?.user) {
          setUser(session.user)
          loadWorkoutSchedules()
        } else {
          setUser(null)
          setWorkoutSchedule({})
          setIsLoading(false)
        }
      }
      refresh()
    }, [])
  )

  // on auth change
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
      if (session?.user) loadWorkoutSchedules()
      else setWorkoutSchedule({})
    })
    return () => subscription.unsubscribe()
  }, [])

  // derive today’s schedule
  const dateKey = format(selectedDate, 'yyyy-MM-dd')
  const daySchedule = workoutSchedule[dateKey] ?? { date: dateKey, exercises: [] }

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleAddExercise = async (exercise: Exercise) => {
    if (!user) {
      Toast.show({ type: 'error', text1: 'Please sign in to save workouts' })
      return
    }
    const updatedExercises = [...daySchedule.exercises, exercise]
    setWorkoutSchedule(prev => ({
      ...prev,
      [dateKey]: { date: dateKey, exercises: updatedExercises },
    }))
    const { error } = await supabase
      .from('workout_schedules')
      .upsert(
        { user_id: user.id, date: dateKey, exercises: updatedExercises },
        { onConflict: 'user_id,date' }
      )
    if (error) {
      console.error(error)
      Toast.show({ type: 'error', text1: 'Failed to save workout' })
    }
  }

  const handleRemoveExercise = async (exerciseId: string) => {
    if (!user) {
      Toast.show({ type: 'error', text1: 'Please sign in to modify workouts' })
      return
    }

    // remove locally
    const remaining = (daySchedule.exercises as Exercise[]).filter(
      (e: Exercise) => e.id !== exerciseId
    )

    if (remaining.length === 0) {
      // delete the whole dateKey
      setWorkoutSchedule((prev: typeof workoutSchedule) => {
        const copy = { ...prev }
        delete copy[dateKey]
        return copy
      })
      const { error } = await supabase
        .from('workout_schedules')
        .delete()
        .match({ user_id: user.id, date: dateKey })
      if (error) {
        console.error(error)
        Toast.show({ type: 'error', text1: 'Failed to delete workout' })
      }
    } else {
      // update that one day
      setWorkoutSchedule((prev: typeof workoutSchedule) => ({
        ...prev,
        [dateKey]: { date: dateKey, exercises: remaining },
      }))
      const { error } = await supabase
        .from('workout_schedules')
        .upsert(
          { user_id: user.id, date: dateKey, exercises: remaining },
          { onConflict: 'user_id,date' }
        )
      if (error) {
        console.error(error)
        Toast.show({ type: 'error', text1: 'Failed to update workout' })
      }
    }
  }

  const handleUpdateExercise = async (updated: Exercise) => {
    if (!user) {
      Toast.show({ type: 'error', text1: 'Please sign in to modify workouts' })
      return
    }
    const updatedExercises = (daySchedule.exercises as Exercise[]).map(e =>
      e.id === updated.id ? updated : e
    )
    setWorkoutSchedule(prev => ({
      ...prev,
      [dateKey]: { date: dateKey, exercises: updatedExercises },
    }))
    const { error } = await supabase
      .from('workout_schedules')
      .upsert(
        { user_id: user.id, date: dateKey, exercises: updatedExercises },
        { onConflict: 'user_id,date' }
      )
    if (error) {
      console.error(error)
      Toast.show({ type: 'error', text1: 'Failed to update workout' })
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={[styles.container, isDark && styles.containerDark]}>
        {/* HEADER */}
        <View style={[styles.header, isDark && styles.headerDark]}>
          <Dumbbell size={24} color="#3B82F6" />
          <Text style={[styles.title, isDark && styles.titleDark]}>
            Workout Scheduler
          </Text>
        </View>



        {/* CONTENT */}
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'android' ? 'height' : 'padding'}
          keyboardVerticalOffset={16}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <ScrollView
              contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
              keyboardShouldPersistTaps="handled"
            >
              {/* DAY SCHEDULE */}
              <View style={[styles.section, isDark && styles.sectionDark]}>
                <DaySchedule
                  date={selectedDate}
                  exercises={daySchedule.exercises}
                  onRemoveExercise={handleRemoveExercise}
                  onUpdateExercise={handleUpdateExercise}
                />
              </View>

              {/* CALENDAR */}
              <View style={[styles.section, isDark && styles.sectionDark]}>
                <Calendar
                  selectedDate={selectedDate}
                  workoutSchedule={workoutSchedule}
                  onSelectDate={setSelectedDate}
                />
              </View>

              {/* ADD FORM */}
              {!isPastDate(selectedDate) && (
                <View style={[styles.section, isDark && styles.sectionDark]}>
                  <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
                    Add Exercise
                  </Text>
                  <ExerciseForm user={user} onAddExercise={handleAddExercise} />
                </View>
              )}
            </ScrollView>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>

        {/* TOAST */}
        <Toast />
      </View>
    </SafeAreaView>
  )
}

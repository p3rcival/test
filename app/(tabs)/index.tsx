import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { format, startOfDay, isBefore, differenceInCalendarDays } from 'date-fns';
import { Dumbbell } from 'lucide-react-native';
import { Calendar } from '@/src/components/Calendar';
import { ExerciseForm } from '@/src/components/ExerciseForm';
import { DaySchedule } from '@/src/components/DaySchedule';
import { Exercise, WorkoutSchedule } from '@/src/types';
import { supabase } from '@/src/lib/supabase';
import Toast from 'react-native-toast-message';
import { useTheme } from '@/src/context/ThemeContext';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { User } from '@supabase/supabase-js';


export default function Home() {
  const { isDark } = useTheme();
  const [selectedDate, setSelectedDate] = useState(() => startOfDay(new Date()))
  const [workoutSchedule, setWorkoutSchedule] = useState<WorkoutSchedule>({});
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const refreshSession = async () => {
        const { data: { session }, error } = await supabase.auth.getSession();
  
        if (session?.user) {
          setUser(session.user);
          loadWorkoutSchedules(); // re-fetch workouts after login or focus
        } else {
          setUser(null);
          setWorkoutSchedule({});
          setIsLoading(false);
        }
  
        if (error) {
          console.error('Error fetching session on focus:', error);
        }
      };
  
      refreshSession();
    }, [])
  );
  

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      if (session?.user) {
        loadWorkoutSchedules();
      } else {
        setIsLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        loadWorkoutSchedules();
      } else {
        setWorkoutSchedule({});
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadWorkoutSchedules = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('workout_schedules')
      .select('*');

    if (error) {
      console.error('Error loading workout schedules:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to load workout schedules',
      });
      setIsLoading(false);
      return;
    }

    const schedules: WorkoutSchedule = {};
    data.forEach((schedule) => {
      schedules[schedule.date] = {
        date: schedule.date,
        exercises: schedule.exercises,
      };
    });

    setWorkoutSchedule(schedules);
    setIsLoading(false);
  };

  const dateKey = format(selectedDate, 'yyyy-MM-dd');
  const daySchedule = workoutSchedule[dateKey] || { date: dateKey, exercises: [] };

  const handleAddExercise = async (exercise: Exercise) => {
    if (!user) {
      Toast.show({
        type: 'error',
        text1: 'Please sign in to save workouts',
      });
      return;
    }
  
    const updatedExercises = [...(workoutSchedule[dateKey]?.exercises || []), exercise];
  
    // Safely update state using functional set
    setWorkoutSchedule(prev => ({
      ...prev,
      [dateKey]: {
        date: dateKey,
        exercises: updatedExercises,
      },
    }));
  
    // Use the same updatedExercises to persist to Supabase
    const { error } = await supabase
      .from('workout_schedules')
      .upsert({
        user_id: user.id,
        date: dateKey,
        exercises: updatedExercises,
      }, {
        onConflict: 'user_id,date'
      });
  
    if (error) {
      Toast.show({
        type: 'error',
        text1: 'Failed to save workout',
      });
      console.error('Error saving workout:', error);
    }
  };

    // NEW (safe & clear):
    const isPastDate = (date: Date) =>
      differenceInCalendarDays(date, new Date()) < 0;

    console.log(
      'select:',
      selectedDate,
      'today:',
      startOfDay(new Date()),
      'isPast?',
      isPastDate(selectedDate)
    );
    

  const handleRemoveExercise = async (exerciseId: string) => {
    if (!user) {
      Toast.show({
        type: 'error',
        text1: 'Please sign in to modify workouts',
      });
      return;
    }

    const updatedExercises = daySchedule.exercises.filter((e) => e.id !== exerciseId);
    const updatedSchedule = {
      ...workoutSchedule,
      [dateKey]: {
        date: dateKey,
        exercises: updatedExercises,
      },
    };

    setWorkoutSchedule(updatedSchedule);

    if (updatedExercises.length === 0) {
      const { error } = await supabase
        .from('workout_schedules')
        .delete()
        .match({ user_id: user.id, date: dateKey });

      if (error) {
        Toast.show({
          type: 'error',
          text1: 'Failed to delete workout',
        });
        console.error('Error deleting workout:', error);
      }
    } else {
      const { error } = await supabase
        .from('workout_schedules')
        .upsert({
          user_id: user.id,
          date: dateKey,
          exercises: updatedExercises,
        }, {
          onConflict: 'user_id,date'
        });

      if (error) {
        Toast.show({
          type: 'error',
          text1: 'Failed to update workout',
        });
        console.error('Error updating workout:', error);
      }
    }
  };

  const handleUpdateExercise = async (updatedExercise: Exercise) => {
    if (!user) {
      Toast.show({
        type: 'error',
        text1: 'Please sign in to modify workouts',
      });
      return;
    }

    const updatedExercises = daySchedule.exercises.map((e) =>
      e.id === updatedExercise.id ? updatedExercise : e
    );

    const updatedSchedule = {
      ...workoutSchedule,
      [dateKey]: {
        date: dateKey,
        exercises: updatedExercises,
      },
    };

    setWorkoutSchedule(updatedSchedule);

    const { error } = await supabase
      .from('workout_schedules')
      .upsert({
        user_id: user.id,
        date: dateKey,
        exercises: updatedExercises,
      }, {
        onConflict: 'user_id,date'
      });

    if (error) {
      Toast.show({
        type: 'error',
        text1: 'Failed to update workout',
      });
      console.error('Error updating workout:', error);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={[styles.container, isDark && styles.containerDark]}>
        <View style={[styles.header, isDark && styles.headerDark]}>
          <Dumbbell size={24} color="#3B82F6" />
          <Text style={[styles.title, isDark && styles.titleDark]}>
            Workout Scheduler
          </Text>
        </View>
        
        <ScrollView
          style={styles.content}
          contentContainerStyle={{ paddingBottom: 80 }} // Added bottom padding for visibility
        >
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={[styles.loadingText, isDark && styles.loadingTextDark]}>
                Loading your workouts...
              </Text>
            </View>
          ) : (
            <>
              <View style={[styles.section, isDark && styles.sectionDark]}>
                <DaySchedule
                  date={selectedDate}
                  exercises={daySchedule.exercises}
                  onRemoveExercise={handleRemoveExercise}
                  onUpdateExercise={handleUpdateExercise}
                />
              </View>
  
              <View style={[styles.section, isDark && styles.sectionDark]}>
                <Calendar
                  selectedDate={selectedDate}
                  workoutSchedule={workoutSchedule}
                  onSelectDate={setSelectedDate}
                />
              </View>
  
              {/* Always render the section wrapper + title */}
              <View style={[styles.section, isDark && styles.sectionDark]}>
                <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
                  Add Exercise
                </Text>
                {/* Only show the form on today or future dates */}
                {!isPastDate(selectedDate) && (
                  <ExerciseForm onAddExercise={handleAddExercise} />
                )}
              </View>

            </>
          )}
        </ScrollView>
        <Toast />
      </View>
    </SafeAreaView>
  );  
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  containerDark: {
    backgroundColor: '#111827',
  },
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
  titleDark: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 8,
    margin: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  sectionDark: {
    backgroundColor: '#1F2937',
    shadowColor: '#000000',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
  },
  sectionTitleDark: {
    color: '#FFFFFF',
  },
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
  loadingTextDark: {
    color: '#9CA3AF',
  },
});
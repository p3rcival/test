import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar } from './components/Calendar';
import { ExerciseForm } from './components/ExerciseForm';
import { DaySchedule } from './components/DaySchedule';
import { Exercise, WorkoutSchedule } from './types';
import { Dumbbell } from 'lucide-react-native';
import { ThemeToggle } from './components/ThemeToggle';
import { supabase } from './lib/supabase';
import { Auth } from './components/Auth';
//import toast from 'react-hot-toast';
import { User } from '@supabase/supabase-js'; // or wherever your User type is defined
import { useTheme } from '@/src/context/ThemeContext';

function App() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [workoutSchedule, setWorkoutSchedule] = useState<WorkoutSchedule>({});
  const [user, setUser] = useState<User | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { isDark } = useTheme();

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
        setShowAuth(false);
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
      //toast.error('Failed to load workout schedules');
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
      //toast.error('Please sign in to save workouts');
      setShowAuth(true);
      return;
    }

    // Log the incoming exercise
    console.log("New exercise to add:", exercise);

    const updatedSchedule = {
      ...workoutSchedule,
      [dateKey]: {
        date: dateKey,
        exercises: [...(workoutSchedule[dateKey]?.exercises || []), exercise],
      },
    };

    console.log("Updated schedule:", updatedSchedule);
    setWorkoutSchedule(updatedSchedule);

    const { error, data } = await supabase
      .from('workout_schedules')
      .upsert({
        user_id: user.id,
        date: dateKey,
        exercises: updatedSchedule[dateKey].exercises,
      }, {
        onConflict: 'user_id,date'
      });

    console.log("Supabase upsert response:", data);
    if (error) {
      //toast.error('Failed to save workout');
      console.error('Error saving workout:', error);
    }
  };

  const handleRemoveExercise = async (exerciseId: string) => {
    if (!user) {
      //toast.error('Please sign in to modify workouts');
      setShowAuth(true);
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
      // Delete the schedule if there are no exercises
      const { error } = await supabase
        .from('workout_schedules')
        .delete()
        .match({ user_id: user.id, date: dateKey });

      if (error) {
        //toast.error('Failed to delete workout');
        console.error('Error deleting workout:', error);
      }
    } else {
      // Update the schedule with the remaining exercises
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
        //toast.error('Failed to update workout');
        console.error('Error updating workout:', error);
      }
    }
  };

  const handleUpdateExercise = async (updatedExercise: Exercise) => {
    if (!user) {
      //toast.error('Please sign in to modify workouts');
      setShowAuth(true);
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
      //toast.error('Failed to update workout');
      console.error('Error updating workout:', error);
    }
  };

  if (showAuth) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-3xl mx-auto py-6 px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
            <Dumbbell 
              size={32} 
              color={isDark ? '#93C5FD' : '#2563EB'} 
              style={{ marginRight: 12 }}
            />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Workout Scheduler</h1>
            </div>
            <div className="flex items-center space-x-4">
              {!user && (
                <button
                  onClick={() => setShowAuth(true)}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                >
                  Sign in
                </button>
              )}
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto py-6 px-4 space-y-6">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading your workouts...</p>
          </div>
        ) : (
          <>
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <DaySchedule
                date={selectedDate}
                exercises={daySchedule.exercises}
                onRemoveExercise={handleRemoveExercise}
                onUpdateExercise={handleUpdateExercise}
              />
            </div>

            <div>
              <Calendar
                selectedDate={selectedDate}
                workoutSchedule={workoutSchedule}
                onSelectDate={setSelectedDate}
              />
            </div>

            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Add Exercise</h2>
              <ExerciseForm onAddExercise={handleAddExercise} />
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default App;
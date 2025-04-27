import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { format } from 'date-fns';
import { Exercise } from '../types';
import { Trash2, Video, FileText } from 'lucide-react-native';
import { ExerciseDetails } from './ExerciseDetails';
import { useTheme } from '@/src/context/ThemeContext';
import { useIsFocused } from '@react-navigation/native';

interface DayScheduleProps {
  date: Date;
  exercises: Exercise[];
  onRemoveExercise: (id: string) => void;
  onUpdateExercise: (exercise: Exercise) => void;
}

function DaySchedule({ date, exercises, onRemoveExercise, onUpdateExercise }: DayScheduleProps) {
  const { isDark } = useTheme();
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const isFocused = useIsFocused();

  return (
    <View style={styles.container}>
      <Text style={[styles.title, isDark && styles.titleDark]}>
        Workout for {format(date, 'EEEE, MMMM d, yyyy')}
      </Text>
      
      {exercises.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, isDark && styles.emptyTextDark]}>
            No exercises scheduled for this day
          </Text>
        </View>
      ) : (
        <View style={styles.exerciseList}>
          {exercises.map((exercise) => (
            <TouchableOpacity
              key={exercise.id}
              style={[styles.exerciseItem, isDark && styles.exerciseItemDark]}
              onPress={() => setSelectedExercise(exercise)}
            >
              <View style={styles.exerciseContent}>
                <Text style={[styles.exerciseName, isDark && styles.exerciseNameDark]}>
                  {exercise.name}
                </Text>
                <Text style={[styles.exerciseDetails, isDark && styles.exerciseDetailsDark]}>
                  {exercise.sets} sets × {exercise.reps} reps
                  {exercise.weight && ` @ ${exercise.weight}lbs`}
                </Text>
                <View style={styles.indicators}>
                  {exercise.videoUrls && exercise.videoUrls.length > 0 && (
                    <View style={styles.indicator}>
                      <Video size={12} color={isDark ? '#60A5FA' : '#3B82F6'} />
                      <Text style={[styles.indicatorText, isDark && styles.indicatorTextDark]}>
                        {exercise.videoUrls.length} {exercise.videoUrls.length === 1 ? 'Video' : 'Videos'}
                      </Text>
                    </View>
                  )}
                  {exercise.notes && (
                    <View style={styles.indicator}>
                      <FileText size={12} color={isDark ? '#34D399' : '#22C55E'} />
                      <Text style={[styles.notesIndicator, isDark && styles.notesIndicatorDark]}>
                        Notes
                      </Text>
                    </View>
                  )}
                </View>
              </View>
              <TouchableOpacity
                onPress={() => onRemoveExercise(exercise.id)}
                style={styles.deleteButton}
              >
                <Trash2 size={18} color="#EF4444" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {selectedExercise && isFocused && (
        <ExerciseDetails
          exercise={selectedExercise}
          visible={true}
          onClose={() => setSelectedExercise(null)}
          onUpdate={(updated) => {
            onUpdateExercise(updated);
            setSelectedExercise(null);
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 16,
    color: '#1F2937',
    fontFamily: 'Inter-Bold',
  },
  titleDark: {
    color: '#F3F4F6',
  },
  emptyContainer: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#6B7280',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  emptyTextDark: {
    color: '#9CA3AF',
  },
  exerciseList: {
    gap: 8,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 16,
  },
  exerciseItemDark: {
    backgroundColor: '#374151',
  },
  exerciseContent: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 4,
    fontFamily: 'Inter-Bold',
  },
  exerciseNameDark: {
    color: '#F3F4F6',
  },
  exerciseDetails: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
    fontFamily: 'Inter-Regular',
  },
  exerciseDetailsDark: {
    color: '#9CA3AF',
  },
  indicators: {
    flexDirection: 'row',
    gap: 12,
  },
  indicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  indicatorText: {
    fontSize: 12,
    color: '#3B82F6',
    fontFamily: 'Inter-Regular',
  },
  indicatorTextDark: {
    color: '#60A5FA',
  },
  notesIndicator: {
    fontSize: 12,
    color: '#22C55E',
    fontFamily: 'Inter-Regular',
  },
  notesIndicatorDark: {
    color: '#34D399',
  },
  deleteButton: {
    padding: 8,
  },
});

export { DaySchedule };
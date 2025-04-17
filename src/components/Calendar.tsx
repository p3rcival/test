import React from 'react';
import {
  format,
  startOfDay, 
  isBefore,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isToday,
  addMonths,
  subMonths,
  isSameMonth,
  startOfWeek,
  endOfWeek,
  eachWeekOfInterval,
  addDays,
} from 'date-fns';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { WorkoutSchedule } from '../types';
import { Dumbbell, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useTheme } from '@/src/context/ThemeContext';

interface CalendarProps {
  selectedDate: Date;
  workoutSchedule: WorkoutSchedule;
  onSelectDate: (date: Date) => void;
}

export function Calendar({ selectedDate, workoutSchedule, onSelectDate }: CalendarProps) {
  const { isDark } = useTheme();
  const [currentMonth, setCurrentMonth] = React.useState(startOfMonth(selectedDate));
  
  // Get the start and end of the month
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  
  // Get the start and end of the calendar (including days from previous/next months)
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  // Get all weeks that should be displayed
  const weeks = eachWeekOfInterval(
    { start: calendarStart, end: calendarEnd },
    { weekStartsOn: 0 } // 0 = Sunday
  );

  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handleToday = () => {
    const today = startOfDay(new Date());
    setCurrentMonth(startOfMonth(today));
    onSelectDate(today);
  };

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handlePreviousMonth}
          style={[styles.iconButton, isDark && styles.iconButtonDark]}
        >
          <ChevronLeft size={20} color={isDark ? '#D1D5DB' : '#6B7280'} />
        </TouchableOpacity>
        <View style={styles.monthContainer}>
          <Text style={[styles.monthText, isDark && styles.monthTextDark]}>
            {format(currentMonth, 'MMMM yyyy')}
          </Text>
          <TouchableOpacity
            onPress={handleToday}
            style={[styles.todayButton, isDark && styles.todayButtonDark]}
          >
            <Text style={[styles.todayButtonText, isDark && styles.todayButtonTextDark]}>
              Today
            </Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          onPress={handleNextMonth}
          style={[styles.iconButton, isDark && styles.iconButtonDark]}
        >
          <ChevronRight size={20} color={isDark ? '#D1D5DB' : '#6B7280'} />
        </TouchableOpacity>
      </View>
      <View style={styles.daysGrid}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <View key={day} style={styles.dayHeader}>
            <Text style={[styles.dayHeaderText, isDark && styles.dayHeaderTextDark]}>
              {day}
            </Text>
          </View>
        ))}
        {weeks.map((week) => (
          <React.Fragment key={week.toString()}>
            {eachDayOfInterval({
              start: week,
              end: addDays(week, 6),
            }).map((day) => {
              const dateKey = format(day, 'yyyy-MM-dd');
              const hasWorkout = dateKey in workoutSchedule;
              const isSelected = format(selectedDate, 'yyyy-MM-dd') === dateKey;
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isCurrentDay = isToday(day);
              
              return (
                <TouchableOpacity
                  key={day.toString()}
                  //onPress={() => onSelectDate(day)}
                  onPress={() => onSelectDate(startOfDay(day))}
                  style={[
                    styles.dayCell,
                    isCurrentDay && [styles.today, isDark && styles.todayDark],
                    isSelected && [styles.selected, isDark && styles.selectedDark],
                    !isCurrentMonth && styles.otherMonth,
                  ]}
                >
                  <Text style={[
                    styles.dayText,
                    isDark && styles.dayTextDark,
                    isCurrentDay && [styles.todayText, isDark && styles.todayTextDark],
                    isSelected && styles.selectedText,
                    !isCurrentMonth && [styles.otherMonthText, isDark && styles.otherMonthTextDark],
                  ]}>
                    {format(day, 'd')}
                  </Text>
                  {hasWorkout && (
                    <View style={styles.workoutIndicator}>
                      <Dumbbell size={14} color={isDark ? '#34D399' : '#22C55E'} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </React.Fragment>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
  },
  containerDark: {
    backgroundColor: '#1F2937',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  iconButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  iconButtonDark: {
    backgroundColor: '#374151',
  },
  monthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  monthText: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
  },
  monthTextDark: {
    color: '#F3F4F6',
  },
  todayButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
  },
  todayButtonDark: {
    backgroundColor: '#374151',
  },
  todayButtonText: {
    fontSize: 14,
    color: '#4B5563',
    fontFamily: 'Inter-Regular',
  },
  todayButtonTextDark: {
    color: '#D1D5DB',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayHeader: {
    width: '14.28%',
    paddingVertical: 8,
    alignItems: 'center',
  },
  dayHeaderText: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
  },
  dayHeaderTextDark: {
    color: '#9CA3AF',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  dayText: {
    fontSize: 14,
    color: '#1F2937',
    fontFamily: 'Inter-Regular',
  },
  dayTextDark: {
    color: '#F3F4F6',
  },
  today: {
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
  },
  todayDark: {
    backgroundColor: '#1E40AF',
  },
  todayText: {
    color: '#2563EB',
    fontWeight: '600',
  },
  todayTextDark: {
    color: '#FFFFFF',
  },
  selected: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
  },
  selectedDark: {
    backgroundColor: '#2563EB',
  },
  selectedText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  otherMonth: {
    opacity: 0.3,
  },
  otherMonthText: {
    color: '#9CA3AF',
  },
  otherMonthTextDark: {
    color: '#6B7280',
  },
  workoutIndicator: {
    position: 'absolute',
    bottom: 4,
    right: 4,
  },
});
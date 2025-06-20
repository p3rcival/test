import React, { useState, useEffect, useRef } from 'react'
import {
  Modal,
  Pressable,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native'
import { X, Video, FileText, Plus, Trash2, Play } from 'lucide-react-native'
import { useTheme } from '@/src/context/ThemeContext'
import { useRouter } from 'expo-router'
import extractYoutubeVideoId from '../../utils/extractYoutubeVideoId'
import { Exercise } from '../types'
import { Audio } from 'expo-av'
import alarmSound from '@/assets/sounds/alarm.wav'
import { useAlarmSound } from '@/src/context/AlarmSoundContext';
import { useSetAlarmSound } from '@/src/context/AlarmSoundContext'
import { useFocusEffect } from '@react-navigation/native' 

interface ExerciseDetailsProps {
  exercise: Exercise
  visible: boolean
  onClose: () => void
  onUpdate: (updated: Exercise) => void
}

import { fetchTodayStepCount } from '@/src/native/healthConnect';

const steps = await fetchTodayStepCount();

interface CountdownTimerProps {
  seconds: number
  running: boolean
  onFinish?: () => void
  darkMode: boolean
}

export function CountdownTimer({ seconds, running, onFinish, darkMode }: CountdownTimerProps) {
  const soundRef = useRef<Audio.Sound | null>(null)
  const [remaining, setRemaining] = useState<number>(seconds)
  const { alarmSound } = useAlarmSound();
  
  useEffect(() => {
    const loadSound = async () => {
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
      const { sound } = await Audio.Sound.createAsync(alarmSound);  // dynamic sound from context
      soundRef.current = sound;
      await sound.setVolumeAsync(1.0);
    };

    loadSound();

    return () => {
      soundRef.current?.unloadAsync();
    };
  }, []);

  useEffect(() => {
    if (!running) return
    if (remaining <= 0) {
      soundRef.current?.replayAsync()
      onFinish?.()
      return
    }
    const id = setTimeout(() => setRemaining(r => r - 1), 1000)
    return () => clearTimeout(id)
  }, [running, remaining])

  // useEffect(() => {
  //   if (remaining === 0 && seconds > 0) {
  //     const to = setTimeout(() => { setRemaining(seconds) }, 1000)
  //     return () => clearTimeout(to)
  //   }
  // }, [remaining, seconds])

  const minutes = Math.floor(remaining / 60)
  const secs = remaining % 60

  return (
    <Text
      style={[
        styles.timerValueSmall,
        darkMode ? styles.timerTextDark : styles.timerText,
      ]}
    >
      {minutes}:{secs.toString().padStart(2, '0')}
    </Text>
  )
}

export function ExerciseDetails({ exercise, visible, onClose, onUpdate }: ExerciseDetailsProps) {
  const { isDark } = useTheme()
  const router = useRouter()

  const isTimeMode = exercise.duration != null

  const [sets, setSets] = useState<number>(exercise.sets)
  const [reps, setReps] = useState<number>(exercise.reps)
  const [weight, setWeight] = useState<number | undefined>(exercise.weight)
  const [initialDuration] = useState<number>(exercise.duration ?? 0)
  const [running, setRunning] = useState<boolean>(false)
  const [videoUrls, setVideoUrls] = useState<string[]>(exercise.videoUrls ?? [])
  const [newVideoUrl, setNewVideoUrl] = useState<string>('')
  const [notes, setNotes] = useState<string>(exercise.notes ?? '')

  // Load/reset remaining when initialDuration changes
  useEffect(() => {
    setRunning(false)
  }, [initialDuration])

  const handleAddVideo = () => {
    if (newVideoUrl && !videoUrls.includes(newVideoUrl)) {
      setVideoUrls(v => [...v, newVideoUrl])
      setNewVideoUrl('')
    }
  }
  const handleRemoveVideo = (url: string) => setVideoUrls(v => v.filter(u => u !== url))

  const handlePlay = (url: string) => {
    const vid = extractYoutubeVideoId(url)
    if (vid) router.push(`/video/${vid}`)
    else console.error('Invalid video URL:', url)
  }

  const handleSubmit = () =>
    onUpdate({
      ...exercise,
      sets,
      reps: isTimeMode ? exercise.reps : reps,
      weight: isTimeMode ? undefined : weight,
      duration: isTimeMode ? initialDuration : undefined,
      videoUrls,
      notes,
    })

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={[styles.modalContent, isDark && styles.modalContentDark]} onPress={() => {}}>
          <View style={[styles.header, isDark && styles.headerDark]}>
            <Text style={[styles.title, isDark && styles.titleDark]}>{exercise.name}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={isDark ? '#D1D5DB' : '#6B7280'} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            <View style={[styles.section, isDark && styles.sectionDark]}>
              {isTimeMode ? (
                <View style={styles.row}>
                  <View style={[styles.flex1, styles.setsNarrow]}>
                    <Text style={[styles.sectionLabel, isDark && styles.setSectionLabelDark]}>Sets</Text>
                    <TextInput
                      style={[styles.input, styles.setsValue, isDark && styles.inputDark]}
                      value={String(sets)}
                      onChangeText={(t: string) => setSets(parseInt(t) || 0)}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={[styles.flex1, styles.timerFlex]}>
                    <Text style={[styles.sectionLabel, isDark && styles.sectionLabelDark]}>Seconds</Text>
                    <View style={styles.timerSection}>
                      <CountdownTimer
                        seconds={initialDuration}
                        running={running}
                        darkMode={isDark}
                        onFinish={() => setRunning(false)}
                      />
                      <TouchableOpacity
                        onPress={() => setRunning(r => !r)}
                        style={[styles.timerButton, isDark && styles.timerButtonDark]}
                      >
                        <Text style={[styles.timerButtonText, isDark && styles.timerButtonTextDark]}> {running ? 'Pause' : 'Start'} </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ) : (
                <>
                  <View style={styles.row}>
                    <View style={styles.flex1}>
                      <Text style={[styles.sectionLabel, isDark && styles.sectionLabelDark]}>Sets</Text>
                    </View>
                    <View style={styles.flex1}>
                      <Text style={[styles.sectionLabel, isDark && styles.sectionLabelDark]}>Reps</Text>
                    </View>
                    <View style={styles.flex1}>
                      <Text style={[styles.sectionLabel, isDark && styles.sectionLabelDark]}>Weight (lb)</Text>
                    </View>
                  </View>
                  <View style={styles.row}>
                    <TextInput
                      style={[styles.input, isDark && styles.inputDark, styles.flex1]}
                      value={String(sets)}
                      onChangeText={(t: string) => setSets(parseInt(t) || 0)}
                      keyboardType="numeric"
                    />
                    <TextInput
                      style={[styles.input, isDark && styles.inputDark, styles.flex1]}
                      value={String(reps)}
                      onChangeText={(t: string) => setReps(parseInt(t) || 0)}
                      keyboardType="numeric"
                    />
                    <TextInput
                      style={[styles.input, isDark && styles.inputDark, styles.flex1]}
                      value={weight?.toString() || ''}
                      onChangeText={(t: string) => setWeight(t ? parseFloat(t) : undefined)}
                      keyboardType="numeric"
                      placeholder="Optional"
                      placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                    />
                  </View>
                </>
              )}
            </View>

            {/* Videos Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Video size={16} color={isDark ? '#D1D5DB' : '#4B5563'} />
                <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>Exercise Videos</Text>
              </View>
              {videoUrls.map((url, i) => (
                <View key={i} style={[styles.videoUrlContainer, isDark && styles.videoUrlContainerDark]}>
                  <Text style={[styles.videoUrl, isDark && styles.videoUrlDark]} numberOfLines={1}>{url}</Text>
                  <View style={styles.videoActions}>
                    <TouchableOpacity onPress={() => handlePlay(url)} style={styles.playButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                      <Play size={18} color={isDark ? '#60A5FA' : '#3B82F6'} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleRemoveVideo(url)} style={styles.removeButton}>
                      <Trash2 size={18} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
              <View style={styles.addVideoContainer}>
                <TextInput
                  style={[styles.input, styles.flex1, isDark && styles.inputDark]}
                  value={newVideoUrl}
                  onChangeText={setNewVideoUrl}
                  placeholder="https://youtube.com/watch?v=…"
                  placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                />
                <TouchableOpacity onPress={handleAddVideo} style={styles.addButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Plus size={18} color="#FFF" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Notes Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <FileText size={16} color={isDark ? '#D1D5DB' : '#4B5563'} />
                <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>Technique Notes</Text>
              </View>
              <TextInput
                style={[styles.input, styles.textArea, isDark && styles.inputDark]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Add your technique notes..."
                placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            {/* Footer Buttons */}
            <View style={[styles.footer, isDark && styles.footerDark]}>
              <TouchableOpacity onPress={onClose} style={[styles.button, styles.cancelButton, isDark && styles.cancelButtonDark]}>
                <Text style={[styles.cancelButtonText, isDark && styles.cancelButtonTextDark]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSubmit} style={[styles.button, styles.saveButton]}>
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#FFF', borderRadius: 12, width: '90%', maxHeight: '90%', paddingBottom: 8 },
  modalContentDark: { backgroundColor: '#1F2937' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  headerDark: { borderBottomColor: '#374151' },
  title: { fontSize: 20, color: '#1F2937', fontFamily: 'Inter-Bold' },
  titleDark: { color: '#F3F4F6' },
  closeButton: { padding: 8 },
  content: { padding: 16 },
  section: { marginBottom: 24 },
  sectionDark: {},
  sectionLabel: { fontSize: 14, fontFamily: 'Inter-Bold', marginBottom: 4, color: '#4B5563' },
  sectionLabelDark: { color: '#D1D5DB' },
  setSectionLabelDark: { marginLeft: 50, color: '#D1D5DB' },
  row: { flexDirection: 'row', gap: 8 },
  flex1: { flex: 1 },
  input: { backgroundColor: '#FFF', borderWidth: 1, alignItems: 'center', borderColor: '#D1D5DB', borderRadius: 8, padding: 8, fontSize: 14, color: '#1F2937' },
  inputDark: { backgroundColor: '#1F2937', borderColor: '#374151', color: '#F3F4F6' },
  textArea: { height: 100, textAlignVertical: 'top' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 16, marginLeft: 8, fontFamily: 'Inter-Bold', color: '#4B5563' },
  sectionTitleDark: { color: '#D1D5DB' },
  videoUrlContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 8, padding: 12, marginBottom: 8 },
  videoUrlContainerDark: { backgroundColor: '#374151' },
  videoUrl: { flex: 1, fontSize: 14, marginRight: 8, fontFamily: 'Inter-Regular', color: '#4B5563' },
  videoUrlDark: { color: '#D1D5DB' },
  videoActions: { flexDirection: 'row', gap: 8 },
  playButton: { padding: 4 },
  removeButton: { padding: 4 },
  addVideoContainer: { flexDirection: 'row', gap: 8 },
  addButton: { backgroundColor: '#3B82F6', borderRadius: 8, padding: 12, justifyContent: 'center', alignItems: 'center' },
  setsValue: { fontSize: 28, textAlign: 'center' },
  timerValueSmall: { fontSize: 20, textAlign: 'center' },
  timerContainer: { flexDirection: 'row', alignItems: 'center', marginLeft: 24 },
  timerText: { fontSize: 16, fontFamily: 'Inter-Bold', marginRight: 8, color: '#1F2937' },
  timerTextDark: { color: '#F3F4F6' },
  timerButton: { paddingVertical: 4, paddingHorizontal: 12, backgroundColor: '#3B82F6', borderRadius: 4 },
  timerButtonDark: { backgroundColor: '#2563EB' },
  timerButtonText: { color: '#FFF', fontFamily: 'Inter-Regular' },
  timerButtonTextDark: { color: '#FFF' },
  footer: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, padding: 16, borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  footerDark: { borderTopColor: '#374151' },
  button: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, minWidth: 100, alignItems: 'center' },
  cancelButton: { backgroundColor: '#F3F4F6' },
  cancelButtonDark: { backgroundColor: '#374151' },
  cancelButtonText: { color: '#4B5563', fontFamily: 'Inter-Regular' },
  cancelButtonTextDark: { color: '#D1D5DB' },
  saveButton: { backgroundColor: '#3B82F6' },
  saveButtonText: { color: '#FFF', fontFamily: 'Inter-Bold' },
  setsNarrow: { flex: 0.4 },
  timerFlex: { flex: 0.6 },
  timerSection: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 8 },
})

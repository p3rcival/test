// src/components/ExerciseDetails.tsx
import React, { useState } from 'react'
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

interface ExerciseDetailsProps {
  exercise: Exercise
  visible: boolean
  onClose: () => void
  onUpdate: (updated: Exercise) => void
}

export function ExerciseDetails({
  exercise,
  visible,
  onClose,
  onUpdate,
}: ExerciseDetailsProps) {
  const { isDark } = useTheme()
  const router = useRouter()

  // bring sets, reps and weight into state
  const [sets, setSets]         = useState<number>(exercise.sets)
  const [reps, setReps]         = useState<number>(exercise.reps)
  const [weight, setWeight]     = useState<number|undefined>(exercise.weight)
  const [videoUrls, setVideoUrls] = useState<string[]>(exercise.videoUrls ?? [])
  const [newVideoUrl, setNewVideoUrl] = useState('')
  const [notes, setNotes]       = useState<string>(exercise.notes ?? '')

  const [mode, setMode] = useState<'weight'|'duration'>(exercise.duration != null ? 'duration' : 'weight')
  const [duration, setDuration] = useState<number|undefined>(exercise.duration)


  const handleAddVideo = () => {
    if (newVideoUrl && !videoUrls.includes(newVideoUrl)) {
      setVideoUrls(v => [...v, newVideoUrl])
      setNewVideoUrl('')
    }
  }
  const handleRemoveVideo = (url: string) =>
    setVideoUrls(v => v.filter(u => u !== url))

  // when saving, include our edited sets/reps/weight
   const handlePlay = (url: string) => {
    const vid = extractYoutubeVideoId(url)
    if (vid) router.push(`/video/${vid}`)
    else console.error('Invalid video URL:', url)
  }

  const handleSubmit = () =>
    onUpdate({
      ...exercise,
      sets,
      reps,
      weight: mode === 'weight' ? weight : undefined,
      duration: mode === 'duration' ? duration : undefined,
      videoUrls,
      notes,
    })

    return (
      <Modal
        animationType="slide"
        transparent
        visible={visible}
        onRequestClose={onClose}
      >
        <Pressable style={styles.modalOverlay} onPress={onClose}>
          <Pressable
            onPress={() => {}}
            style={[styles.modalContent, isDark && styles.modalContentDark]}
          >
            {/* header */}
            <View style={[styles.header, isDark && styles.headerDark]}>
              <Text style={[styles.title, isDark && styles.titleDark]}>
                {exercise.name}
              </Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <X size={24} color={isDark ? '#D1D5DB' : '#6B7280'} />
              </TouchableOpacity>
            </View>
    
            {/* body */}
            <ScrollView style={styles.content}>
    
              {/* ── Weight vs. Time Toggle ── */}
              <View style={styles.toggleContainer}>
                <TouchableOpacity
                  onPress={() => setMode('weight')}
                  style={[
                    styles.toggleButton,
                    mode === 'weight' && styles.toggleButtonActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.toggleText,
                      mode === 'weight' && styles.toggleTextActive,
                    ]}
                  >
                    Weight
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setMode('duration')}
                  style={[
                    styles.toggleButton,
                    mode === 'duration' && styles.toggleButtonActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.toggleText,
                      mode === 'duration' && styles.toggleTextActive,
                    ]}
                  >
                    Time (sec)
                  </Text>
                </TouchableOpacity>
              </View>
    
              {/* Editable Sets/Reps/‹Weight or Time› */}
              <View style={[styles.section, isDark && styles.sectionDark]}>
                <Text style={[styles.sectionLabel, isDark && styles.sectionLabelDark]}>
                  Sets • Reps • {mode === 'weight' ? 'Weight (lb)' : 'Time (sec)'}
                </Text>
                <View style={styles.row}>
                  <TextInput
                    style={[styles.input, isDark && styles.inputDark, styles.flex1]}
                    value={String(sets)}
                    onChangeText={t => setSets(parseInt(t) || 0)}
                    keyboardType="numeric"
                  />
                  <TextInput
                    style={[styles.input, isDark && styles.inputDark, styles.flex1]}
                    value={String(reps)}
                    onChangeText={t => setReps(parseInt(t) || 0)}
                    keyboardType="numeric"
                  />
                  {mode === 'weight' ? (
                    <TextInput
                      style={[styles.input, isDark && styles.inputDark, styles.flex1]}
                      value={weight?.toString() ?? ''}
                      onChangeText={t => setWeight(t ? parseFloat(t) : undefined)}
                      keyboardType="numeric"
                      placeholder="Optional lb"
                      placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                    />
                  ) : (
                    <TextInput
                      style={[styles.input, isDark && styles.inputDark, styles.flex1]}
                      value={duration?.toString() ?? ''}
                      onChangeText={t => setDuration(parseInt(t) || undefined)}
                      keyboardType="numeric"
                      placeholder="Seconds"
                      placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                    />
                  )}
                </View>
              </View>
    
              {/* videos */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Video size={16} color={isDark ? '#D1D5DB' : '#4B5563'} />
                  <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
                    Exercise Videos
                  </Text>
                </View>
                {videoUrls.map((url, i) => (
                  <View
                    key={i}
                    style={[styles.videoUrlContainer, isDark && styles.videoUrlContainerDark]}
                  >
                    <Text
                      style={[styles.videoUrl, isDark && styles.videoUrlDark]}
                      numberOfLines={1}
                    >
                      {url}
                    </Text>
                    <View style={styles.videoActions}>
                      <TouchableOpacity onPress={() => handlePlay(url)} style={styles.playButton}>
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
                  <TouchableOpacity onPress={handleAddVideo} style={styles.addButton}>
                    <Plus size={18} color="#FFF" />
                  </TouchableOpacity>
                </View>
              </View>
    
              {/* notes */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <FileText size={16} color={isDark ? '#D1D5DB' : '#4B5563'} />
                  <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
                    Technique Notes
                  </Text>
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
            </ScrollView>
    
            {/* footer */}
            <View style={[styles.footer, isDark && styles.footerDark]}>
              <TouchableOpacity
                onPress={onClose}
                style={[styles.button, styles.cancelButton, isDark && styles.cancelButtonDark]}
              >
                <Text style={[styles.cancelButtonText, isDark && styles.cancelButtonTextDark]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSubmit} style={[styles.button, styles.saveButton]}>
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
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
  sectionLabel: { fontSize: 14, fontFamily: 'Inter-Bold', marginBottom: 8, color: '#4B5563' },
  sectionLabelDark: { color: '#D1D5DB' },
  row: { flexDirection: 'row', gap: 8 },
  flex1: { flex: 1 },
  input: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, padding: 8, fontSize: 14, color: '#1F2937' },
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
  footer: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, padding: 16, borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  footerDark: { borderTopColor: '#374151' },
  button: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, minWidth: 100, alignItems: 'center' },
  cancelButton: { backgroundColor: '#F3F4F6' },
  cancelButtonDark: { backgroundColor: '#374151' },
  cancelButtonText: { color: '#4B5563', fontFamily: 'Inter-Regular' },
  cancelButtonTextDark: { color: '#D1D5DB' },
  saveButton: { backgroundColor: '#3B82F6' },
  saveButtonText: { color: '#FFF', fontFamily: 'Inter-Bold' },
  toggleContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  toggleButton: {
    flex: 1,
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  toggleButtonActive: {
    backgroundColor: '#3B82F6',
  },
  toggleText: {
    textAlign: 'center',
    color: '#4B5563',
    fontFamily: 'Inter-Regular',
  },
  toggleTextActive: {
    color: '#FFF',
  },
  
})

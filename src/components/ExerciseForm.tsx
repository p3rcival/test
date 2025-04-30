// src/components/ExerciseForm.tsx
import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Keyboard,
  Alert,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native'
import { Exercise } from '@/src/types'
import {
  Plus,
  Video,
  FileText,
  Trash2,
  Save,
  List,
} from 'lucide-react-native'
import { supabase } from '@/src/lib/supabase'
import Toast from 'react-native-toast-message'
import { useTheme } from '@/src/context/ThemeContext'
import uuid from 'react-native-uuid'
import { User } from '@supabase/supabase-js'
import { useRouter } from 'expo-router'

type FormState = {
  name: string
  sets: number
  reps: number
  duration?: number
  weight?: number
  videoUrls: string[]
  notes: string
}

interface ExerciseFormProps {
  user: User | null
  onAddExercise: (ex: Exercise) => void
}

export function ExerciseForm({ user, onAddExercise }: ExerciseFormProps) {
  const router = useRouter()
  const { isDark } = useTheme()

  const [mode, setMode] = useState<'reps' | 'time'>('reps')
  const [exercise, setExercise] = useState<FormState>({
    name: '',
    sets: 3,
    reps: 10,
    duration: undefined,
    weight: undefined,
    videoUrls: [],
    notes: '',
  })
  const [newVideoUrl, setNewVideoUrl] = useState('')
  const [templates, setTemplates] = useState<Exercise[]>([])
  const [showTemplates, setShowTemplates] = useState(false)
  const [isFromTemplate, setIsFromTemplate] = useState(false)

  useEffect(() => {
    if (user) loadTemplates()
    else setTemplates([])
  }, [user])

  async function loadTemplates() {
    const { data, error } = await supabase
      .from('exercise_templates')
      .select('id, user_id, name, sets, reps, duration, weight, video_urls, notes')
    if (error) {
      console.error('Error loading templates:', error)
      return
    }
    const loaded: Exercise[] = data.map((tpl: any) => ({
      id: tpl.id,
      name: tpl.name,
      sets: tpl.sets,
      reps: tpl.reps,
      duration: tpl.duration,
      weight: tpl.weight,
      videoUrls: Array.isArray(tpl.video_urls) ? tpl.video_urls : [],
      notes: tpl.notes ?? '',
    }))
    setTemplates(loaded)
  }

  if (!user) {
    return (
      <TouchableOpacity onPress={() => router.push('/settings')}>
        <Text style={styles.signInText}>Sign in to save templates</Text>
      </TouchableOpacity>
    )
  }

  const handleAddVideo = () => {
    const currentVideos = exercise.videoUrls
    if (newVideoUrl && !currentVideos.includes(newVideoUrl)) {
      setExercise({
        ...exercise,
        videoUrls: [...currentVideos, newVideoUrl],
      })
      setNewVideoUrl('')
    }
  }

  const handleRemoveVideo = (url: string) =>
    setExercise({
      ...exercise,
      videoUrls: exercise.videoUrls.filter(u => u !== url),
    })

  const handleSubmit = async () => {
    Keyboard.dismiss()
    const newEx: Exercise = { ...exercise, id: uuid.v4() as string }
    onAddExercise(newEx)

    if (!isFromTemplate) {
      const { error } = await supabase.from('exercise_templates').insert([
        {
          user_id: user.id,
          name: exercise.name,
          sets: exercise.sets,
          reps: exercise.reps,
          duration: exercise.duration,
          weight: exercise.weight,
          video_urls: exercise.videoUrls,
          notes: exercise.notes,
        },
      ])
      if (error) {
        Toast.show({ type: 'error', text1: 'Error saving template' })
        console.error(error)
      } else {
        Toast.show({ type: 'success', text1: 'Template saved' })
        loadTemplates()
      }
    }

    setExercise({
      name: '',
      sets: 3,
      reps: 10,
      duration: undefined,
      weight: undefined,
      videoUrls: [],
      notes: '',
    })
    setMode('reps')
    setNewVideoUrl('')
    setIsFromTemplate(false)
  }

  const handleSelectTemplate = (tpl: Exercise) => {
    setExercise({
      name: tpl.name,
      sets: tpl.sets,
      reps: tpl.reps,
      duration: tpl.duration,
      weight: tpl.weight,
      videoUrls: tpl.videoUrls ?? [],
      notes: tpl.notes ?? '',
    })
    setMode(tpl.duration != null ? 'time' : 'reps')
    setIsFromTemplate(true)
    setShowTemplates(false)
  }

  const handleDeleteTemplate = async (tplId: string) => {
    Alert.alert(
      'Delete Template',
      'Really delete this template?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const { error } = await supabase
              .from('exercise_templates')
              .delete()
              .eq('id', tplId)
            if (error) {
              Toast.show({ type: 'error', text1: 'Error deleting template' })
              console.error(error)
            } else {
              Toast.show({ type: 'success', text1: 'Template deleted' })
              loadTemplates()
            }
          },
        },
      ],
      { cancelable: true }
    )
  }

  
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'android' ? 'height' : 'padding'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 16}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <ScrollView
          contentContainerStyle={[styles.formContainer, { paddingBottom: 16 }]}
          keyboardShouldPersistTaps="handled"
        >
          {/* Show/hide templates */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => setShowTemplates(v => !v)}
              style={[styles.templateButton, isDark && styles.templateButtonDark]}
            >
              <List size={16} color={isDark ? '#D1D5DB' : '#4B5563'} />
              <Text style={[styles.templateButtonText, isDark && styles.templateButtonTextDark]}>
                {showTemplates ? 'Hide Templates' : 'Show Templates'}
              </Text>
            </TouchableOpacity>
          </View>
          {showTemplates && templates.length > 0 && (
            <View style={[styles.templatesContainer, isDark && styles.templatesContainerDark]}>
              <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
                Saved Templates
              </Text>
              {templates.map(tpl => (
                <TouchableOpacity
                  key={tpl.id}
                  onPress={() => handleSelectTemplate(tpl)}
                  style={[styles.templateItem, isDark && styles.templateItemDark]}
                >
                  <View>
                    <Text style={[styles.templateName, isDark && styles.templateNameDark]}>
                      {tpl.name}
                    </Text>
                    <Text style={[styles.templateDetails, isDark && styles.templateDetailsDark]}>
                      {tpl.sets} sets × {tpl.reps} reps
                      {tpl.duration != null && ` for ${tpl.duration}s`}
                      {tpl.weight ? ` @ ${tpl.weight}lb` : ''}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => handleDeleteTemplate(tpl.id)} style={styles.deleteButton}>
                    <Trash2 size={18} color="#EF4444" />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Exercise Name */}
          <View style={styles.formGroup}>
            <Text style={[styles.label, isDark && styles.labelDark, styles.leftLabel]}>Exercise Name</Text>
            <TextInput
              style={[styles.input, isDark && styles.inputDark]}
              value={exercise.name}
              onChangeText={text => setExercise({ ...exercise, name: text })}
              placeholder="Enter exercise name"
              placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
            />
          </View>

          {/* Sets / Reps ↔ Time / Weight */}
          <View style={styles.inputRow}>
            <View style={[styles.formGroup, styles.flex1]}>
              <Text style={[styles.label, isDark && styles.labelDark]}>Sets</Text>
              <TextInput
                style={[styles.input, isDark && styles.inputDark]}
                value={String(exercise.sets)}
                onChangeText={t => setExercise({ ...exercise, sets: parseInt(t) || 0 })}
                keyboardType="numeric"
                placeholder="3"
                placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
              />
            </View>

            <View style={[styles.formGroup, styles.flex1]}>
              <View style={styles.toggleContainer}>
                <TouchableOpacity
                  onPress={() => setMode('reps')}
                  style={[styles.toggleButton, mode === 'reps' && styles.toggleActive]}
                >
                  <Text style={[styles.toggleText, mode === 'reps' && styles.toggleTextActive]}>
                    Reps
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setMode('time')}
                  style={[styles.toggleButton, mode === 'time' && styles.toggleActive]}
                >
                  <Text style={[styles.toggleText, mode === 'time' && styles.toggleTextActive]}>
                    Time
                  </Text>
                </TouchableOpacity>
              </View>
              {mode === 'reps' ? (
                <TextInput
                  style={[styles.input, isDark && styles.inputDark]}
                  value={String(exercise.reps)}
                  onChangeText={t => setExercise({ ...exercise, reps: parseInt(t) || 0 })}
                  keyboardType="numeric"
                  placeholder="10"
                  placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                />
              ) : (
                <TextInput
                  style={[styles.input, isDark && styles.inputDark]}
                  value={exercise.duration?.toString() || ''}
                  onChangeText={t => setExercise({ ...exercise, duration: parseInt(t) || 0 })}
                  keyboardType="numeric"
                  placeholder="Seconds"
                  placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                />
              )}
            </View>

            <View style={[styles.formGroup, styles.flex1]}>
              <Text style={[styles.label, isDark && styles.labelDark]}>Weight (lb)</Text>
              <TextInput
                style={[styles.input, isDark && styles.inputDark]}
                value={exercise.weight?.toString() || ''}
                onChangeText={t => setExercise({ ...exercise, weight: parseFloat(t) || undefined })}
                keyboardType="numeric"
                placeholder="Optional"
                placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
              />
            </View>
          </View>

          {/* Videos */}
          <View style={styles.formGroup}>
            <View style={styles.labelContainer}>
              <Video size={16} color={isDark ? '#D1D5DB' : '#4B5563'} />
              <Text style={[styles.label, isDark && styles.labelDark, styles.leftLabel]}>Exercise Videos</Text>
            </View>
            {exercise.videoUrls.map((url, i) => (
              <View
                key={i}
                style={[styles.videoUrlContainer, isDark && styles.videoUrlContainerDark]}
              >
                <Text style={[styles.videoUrl, isDark && styles.videoUrlDark]} numberOfLines={1}>
                  {url}
                </Text>
                <TouchableOpacity onPress={() => handleRemoveVideo(url)} style={styles.removeButton}>
                  <Trash2 size={18} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ))}
            <View style={styles.addVideoContainer}>
              <TextInput
                style={[styles.input, styles.flex1, isDark && styles.inputDark]}
                value={newVideoUrl}
                onChangeText={setNewVideoUrl}
                placeholder="https://youtube.com/watch?v=..."
                placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
              />
              <TouchableOpacity onPress={handleAddVideo} style={styles.addButton}>
                <Plus size={18} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Notes */}
          <View style={styles.formGroup}>
            <View style={styles.labelContainer}>
              <FileText size={16} color={isDark ? '#D1D5DB' : '#4B5563'} />
              <Text style={[styles.label, isDark && styles.labelDark, styles.leftLabel]}>Technique Notes</Text>
            </View>
            <TextInput
              style={[styles.input, styles.textArea, isDark && styles.inputDark]}
              value={exercise.notes}
              onChangeText={t => setExercise({ ...exercise, notes: t })}
              placeholder="Add your technique notes here..."
              placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Save */}
          <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
            <Save size={16} color="#FFF" />
            <Text style={styles.submitButtonText}>Save Exercise</Text>
          </TouchableOpacity>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  formContainer: {},
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  templateButton: { flexDirection: 'row', alignItems: 'center', padding: 8, backgroundColor: '#F3F4F6', borderRadius: 8 },
  templateButtonDark: { backgroundColor: '#374151' },
  templateButtonText: { marginLeft: 8, color: '#4B5563', fontSize: 14, fontFamily: 'Inter-Regular' },
  templateButtonTextDark: { color: '#D1D5DB' },
  templatesContainer: { backgroundColor: '#F3F4F6', borderRadius: 8, padding: 16, marginBottom: 16 },
  templatesContainerDark: { backgroundColor: '#374151' },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12, color: '#1F2937', fontFamily: 'Inter-Bold' },
  sectionTitleDark: { color: '#F3F4F6' },
  templateItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, backgroundColor: '#FFF', borderRadius: 8, marginBottom: 8 },
  templateItemDark: { backgroundColor: '#1F2937' },
  templateName: { fontSize: 16, color: '#1F2937', fontFamily: 'Inter-Bold' },
  templateNameDark: { color: '#F3F4F6' },
  templateDetails: { fontSize: 14, color: '#6B7280', marginTop: 4, fontFamily: 'Inter-Regular' },
  templateDetailsDark: { color: '#9CA3AF' },
  deleteButton: { padding: 8 },
  formGroup: { marginBottom: 16 },
  row: { flexDirection: 'row', gap: 12 },
  flex1: { flex: 1 },
  leftLabel: {
    textAlign: 'left',
    alignSelf: 'flex-start',
    marginLeft: 6,
    marginTop: 6,
  },
  // New styles to align the Sets/Reps/Weight row
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',        // align labels & inputs by their bottom edge
    justifyContent: 'space-between',
    marginBottom: 16,              // match your formGroup spacing
    marginTop: 8,              // add some space above the row
    gap: 5,
  },
  fieldContainer: { flex: 1, alignItems: 'center', },
  labelContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  label: { fontSize: 14, color: '#4B5563', marginBottom: 8, fontFamily: 'Inter-Regular', textAlign: 'center', },
  labelDark: { color: '#D1D5DB' },
  input: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, padding: 12, fontSize: 14, fontFamily: 'Inter-Regular', color: '#1F2937' },
  inputDark: { backgroundColor: '#1F2937', borderColor: '#374151', color: '#F3F4F6' },
  textArea: { height: 100, textAlignVertical: 'top' },
  videoUrlContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 8, padding: 12, marginBottom: 8 },
  videoUrlContainerDark: { backgroundColor: '#374151' },
  videoUrl: { flex: 1, fontSize: 14, fontFamily: 'Inter-Regular', color: '#4B5563', marginRight: 8 },
  videoUrlDark: { color: '#D1D5DB' },
  removeButton: { padding: 4 },
  addVideoContainer: { flexDirection: 'row', gap: 8 },
  addButton: { backgroundColor: '#3B82F6', borderRadius: 8, padding: 12, justifyContent: 'center', alignItems: 'center' },
  submitButton: { backgroundColor: '#3B82F6', borderRadius: 8, padding: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 16 },
  submitButtonText: { color: '#FFF', fontSize: 16, marginLeft: 8, fontFamily: 'Inter-Bold' },
  toggleContainer: { flexDirection: 'row', marginBottom: 8 },
  toggleButton: { flex: 1, paddingVertical: 8, borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 4, alignItems: 'center', backgroundColor: '#F3F4F6' },
  toggleActive: { backgroundColor: '#3B82F6', borderColor: '#3B82F6' },
  toggleText: { fontFamily: 'Inter-Bold', color: '#4B5563' },
  toggleTextActive: { color: '#FFF' },
  signInText: { color: '#3B82F6', fontSize: 14, fontFamily: 'Inter-Regular' },
})

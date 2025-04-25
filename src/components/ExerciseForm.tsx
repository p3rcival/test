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

interface ExerciseFormProps {
  user: User | null
  onAddExercise: (ex: Exercise) => void
}

export function ExerciseForm({ user, onAddExercise }: ExerciseFormProps) {
  const router = useRouter()
  const { isDark } = useTheme()

  // form state
  const [exercise, setExercise] = useState<Omit<Exercise, 'id'>>({
    name: '',
    sets: 3,
    reps: 10,
    weight: undefined,
    videoUrls: [],
    notes: '',
  })
  const [newVideoUrl, setNewVideoUrl] = useState('')
  const [templates, setTemplates] = useState<Exercise[]>([])
  const [showTemplates, setShowTemplates] = useState(false)
  const [isFromTemplate, setIsFromTemplate] = useState(false)

  const [mode, setMode] = useState<'weight'|'duration'>('weight')
  const [duration, setDuration] = useState<number|undefined>(undefined)

  // load saved templates whenever the parent hands us a user
  useEffect(() => {
    if (user) {
      loadTemplates()
    } else {
      setTemplates([])
    }
  }, [user])

  async function loadTemplates() {
    const { data, error } = await supabase
      .from('exercise_templates')
      .select('id, user_id, name, sets, reps, weight, video_urls, notes')

    if (error) {
      console.error('Error loading templates:', error)
      return
    }

    const newEx: Exercise = {
      id: uuid.v4() as string,
      ...exercise,
      weight: mode==='weight' ? exercise.weight : undefined,
      duration: mode==='duration' ? duration : undefined
    }

    const withUrls: Exercise[] = data.map((tpl: any) => ({
      id: tpl.id,
      name: tpl.name,
      sets: tpl.sets,
      reps: tpl.reps,
      weight: tpl.weight,
      notes: tpl.notes ?? '',
      videoUrls: Array.isArray(tpl.video_urls) ? tpl.video_urls : [],
    }))

    setTemplates(withUrls)
  }

  // if not signed in, show the prompt
  if (!user) {
    return (
      <TouchableOpacity onPress={() => router.push('/settings')}>
        <Text style={styles.signInText}>Sign in to save templates</Text>
      </TouchableOpacity>
    )
  }

  // handlers
  const handleAddVideo = () => {
    const currentVideos = exercise.videoUrls ?? []
    if (newVideoUrl && !currentVideos.includes(newVideoUrl)) {
      setExercise({
        ...exercise,
        videoUrls: [...currentVideos, newVideoUrl],
      })
      setNewVideoUrl('')
    }
  }

  const handleRemoveVideo = (urlToRemove: string) => {
    const currentVideos = exercise.videoUrls ?? []
    setExercise({
      ...exercise,
      videoUrls: currentVideos.filter(url => url !== urlToRemove),
    })
  }

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

    // reset form
    setExercise({
      name: '',
      sets: 3,
      reps: 10,
      weight: undefined,
      videoUrls: [],
      notes: '',
    })
    setNewVideoUrl('')
    setIsFromTemplate(false)
  }

  const handleSelectTemplate = (tpl: Exercise) => {
    setExercise({
      name: tpl.name,
      sets: tpl.sets,
      reps: tpl.reps,
      weight: tpl.weight,
      videoUrls: tpl.videoUrls,
      notes: tpl.notes,
    })
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
          {/* Header: show/hide templates */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => setShowTemplates(v => !v)}
              style={[styles.templateButton, isDark && styles.templateButtonDark]}
            >
              <List size={16} color={isDark ? '#D1D5DB' : '#4B5563'} />
              <Text
                style={[
                  styles.templateButtonText,
                  isDark && styles.templateButtonTextDark,
                ]}
              >
                {showTemplates ? 'Hide Templates' : 'Show Templates'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Templates list */}
          {showTemplates && templates.length > 0 && (
            <View
              style={[styles.templatesContainer, isDark && styles.templatesContainerDark]}
            >
              <Text
                style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}
              >
                Saved Templates
              </Text>
              {templates.map(tpl => (
                <TouchableOpacity
                  key={tpl.id}
                  onPress={() => handleSelectTemplate(tpl)}
                  style={[styles.templateItem, isDark && styles.templateItemDark]}
                >
                  <View>
                    <Text
                      style={[styles.templateName, isDark && styles.templateNameDark]}
                    >
                      {tpl.name}
                    </Text>
                    <Text
                      style={[
                        styles.templateDetails,
                        isDark && styles.templateDetailsDark,
                      ]}
                    >
                      {tpl.sets} sets × {tpl.reps} reps
                      {tpl.weight ? ` @ ${tpl.weight}kg` : ''}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleDeleteTemplate(tpl.id)}
                    style={styles.deleteButton}
                  >
                    <Trash2 size={18} color="#EF4444" />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Actual form inputs */}
          <View style={styles.form}>
            {/* Exercise Name */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, isDark && styles.labelDark]}>
                Exercise Name
              </Text>
              <TextInput
                style={[styles.input, isDark && styles.inputDark]}
                value={exercise.name}
                onChangeText={text => setExercise({ ...exercise, name: text })}
                placeholder="Enter exercise name"
                placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
              />
            </View>

            {/* Sets / Reps / Weight */}
            <View style={styles.row}>
              <View style={[styles.formGroup, styles.flex1]}>
                <Text style={[styles.label, isDark && styles.labelDark]}>
                  Sets
                </Text>
                <TextInput
                  style={[styles.input, isDark && styles.inputDark]}
                  value={String(exercise.sets)}
                  onChangeText={text =>
                    setExercise({ ...exercise, sets: parseInt(text) || 0 })
                  }
                  keyboardType="numeric"
                  placeholder="3"
                  placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                />
              </View>
              <View style={[styles.formGroup, styles.flex1]}>
                <Text style={[styles.label, isDark && styles.labelDark]}>
                  Reps
                </Text>
                <TextInput
                  style={[styles.input, isDark && styles.inputDark]}
                  value={String(exercise.reps)}
                  onChangeText={text =>
                    setExercise({ ...exercise, reps: parseInt(text) || 0 })
                  }
                  keyboardType="numeric"
                  placeholder="10"
                  placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                />
              </View>
              <View style={[styles.formGroup, styles.flex1]}>
                <Text style={[styles.label, isDark && styles.labelDark]}>
                  Weight (lb)
                </Text>
                <TextInput
                  style={[styles.input, isDark && styles.inputDark]}
                  value={exercise.weight?.toString() || ''}
                  onChangeText={text =>
                    setExercise({
                      ...exercise,
                      weight: parseFloat(text) || undefined,
                    })
                  }
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
                <Text style={[styles.label, isDark && styles.labelDark]}>
                  Exercise Videos
                </Text>
              </View>

              {(exercise.videoUrls ?? []).map((url, index) => (
                <View
                  key={index}
                  style={[
                    styles.videoUrlContainer,
                    isDark && styles.videoUrlContainerDark,
                  ]}
                >
                  <Text
                    style={[styles.videoUrl, isDark && styles.videoUrlDark]}
                    numberOfLines={1}
                  >
                    {url}
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleRemoveVideo(url)}
                    style={styles.removeButton}
                  >
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
                <Text style={[styles.label, isDark && styles.labelDark]}>
                  Technique Notes
                </Text>
              </View>
              <TextInput
                style={[styles.input, styles.textArea, isDark && styles.inputDark]}
                value={exercise.notes}
                onChangeText={text => setExercise({ ...exercise, notes: text })}
                placeholder="Add your technique notes here..."
                placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            {/* Save button */}
            <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
              <Save size={16} color="#FFF" />
              <Text style={styles.submitButtonText}>Save Exercise</Text>
            </TouchableOpacity>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  formContainer: {},
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  templateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  templateButtonDark: {
    backgroundColor: '#374151',
  },
  templateButtonText: {
    marginLeft: 8,
    color: '#4B5563',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  templateButtonTextDark: {
    color: '#D1D5DB',
  },
  signInText: {
    color: '#3B82F6',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  templatesContainer: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  templatesContainerDark: {
    backgroundColor: '#374151',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#1F2937',
    fontFamily: 'Inter-Bold',
  },
  sectionTitleDark: {
    color: '#F3F4F6',
  },
  templateItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FFF',
    borderRadius: 8,
    marginBottom: 8,
  },
  templateItemDark: {
    backgroundColor: '#1F2937',
  },
  templateName: {
    fontSize: 16,
    color: '#1F2937',
    fontFamily: 'Inter-Bold',
  },
  templateNameDark: {
    color: '#F3F4F6',
  },
  templateDetails: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
    fontFamily: 'Inter-Regular',
  },
  templateDetailsDark: {
    color: '#9CA3AF',
  },
  deleteButton: {
    padding: 8,
  },
  form: {
    gap: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  flex1: {
    flex: 1,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: '#4B5563',
    marginLeft: 8,
    fontFamily: 'Inter-Regular',
  },
  labelDark: {
    color: '#D1D5DB',
  },
  input: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#1F2937',
    fontFamily: 'Inter-Regular',
  },
  inputDark: {
    backgroundColor: '#1F2937',
    borderColor: '#374151',
    color: '#F3F4F6',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  videoUrlContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  videoUrlContainerDark: {
    backgroundColor: '#374151',
  },
  videoUrl: {
    flex: 1,
    fontSize: 14,
    color: '#4B5563',
    marginRight: 8,
    fontFamily: 'Inter-Regular',
  },
  videoUrlDark: {
    color: '#D1D5DB',
  },
  removeButton: {
    padding: 4,
  },
  addVideoContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  addButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    marginLeft: 8,
    fontFamily: 'Inter-Bold',
  },
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

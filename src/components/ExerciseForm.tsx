import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Exercise } from '../types';
import { Plus, Video, FileText, Trash2, Save, List } from 'lucide-react-native';
import { supabase } from '../lib/supabase';
import Toast from 'react-native-toast-message';
import { useTheme } from '@/src/context/ThemeContext';

interface ExerciseFormProps {
  onAddExercise: (exercise: Exercise) => void;
}

export function ExerciseForm({ onAddExercise }: ExerciseFormProps) {
  const { isDark } = useTheme();
  const [exercise, setExercise] = useState<Omit<Exercise, 'id'>>({
    name: '',
    sets: 3,
    reps: 10,
    weight: undefined,
    videoUrls: [],
    notes: '',
  });
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [templates, setTemplates] = useState<Exercise[]>([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [user, setUser] = useState(null);
  const [isFromTemplate, setIsFromTemplate] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        loadTemplates();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      loadTemplates();
    }
  }, [user]);

  async function loadTemplates() {
    const { data, error } = await supabase
      .from('exercise_templates')
      .select('*');
    
    if (error) {
      console.error('Error loading templates:', error);
      return;
    }

    const templatesWithVideoUrls = data?.map(template => ({
      ...template,
      videoUrls: template.video_urls || [],
    })) || [];

    setTemplates(templatesWithVideoUrls);
  }

  const handleAddVideo = () => {
    if (newVideoUrl && !exercise.videoUrls?.includes(newVideoUrl)) {
      setExercise({
        ...exercise,
        videoUrls: [...(exercise.videoUrls || []), newVideoUrl],
      });
      setNewVideoUrl('');
    }
  };

  const handleRemoveVideo = (urlToRemove: string) => {
    setExercise({
      ...exercise,
      videoUrls: exercise.videoUrls?.filter(url => url !== urlToRemove) || [],
    });
  };

  const handleSubmit = async () => {
    const newExercise = {
      ...exercise,
      id: crypto.randomUUID(),
    };
    onAddExercise(newExercise);

    if (!isFromTemplate && user) {
      const { error } = await supabase
        .from('exercise_templates')
        .insert([{
          user_id: user.id,
          name: exercise.name,
          sets: exercise.sets,
          reps: exercise.reps,
          weight: exercise.weight,
          video_urls: exercise.videoUrls || [],
          notes: exercise.notes,
        }]);

      if (error) {
        Toast.show({
          type: 'error',
          text1: 'Error saving template',
        });
        console.error('Error saving template:', error);
      } else {
        Toast.show({
          type: 'success',
          text1: 'Template saved successfully',
        });
        loadTemplates();
      }
    }

    setExercise({
      name: '',
      sets: 3,
      reps: 10,
      weight: undefined,
      videoUrls: [],
      notes: '',
    });
    setNewVideoUrl('');
    setIsFromTemplate(false);
  };

  const handleSelectTemplate = (template: Exercise) => {
    const videoUrls = Array.isArray(template.video_urls) 
      ? template.video_urls 
      : Array.isArray(template.videoUrls) 
        ? template.videoUrls 
        : [];

    setExercise({
      name: template.name,
      sets: template.sets,
      reps: template.reps,
      weight: template.weight,
      videoUrls: videoUrls,
      notes: template.notes || '',
    });
    setIsFromTemplate(true);
    setShowTemplates(false);
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!window.confirm('Are you sure you want to delete this template?')) {
      return;
    }

    const { error } = await supabase
      .from('exercise_templates')
      .delete()
      .eq('id', templateId);

    if (error) {
      Toast.show({
        type: 'error',
        text1: 'Error deleting template',
      });
      console.error('Error deleting template:', error);
    } else {
      Toast.show({
        type: 'success',
        text1: 'Template deleted successfully',
      });
      loadTemplates();
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => setShowTemplates(!showTemplates)}
          style={[styles.templateButton, isDark && styles.templateButtonDark]}
        >
          <List size={16} color={isDark ? '#D1D5DB' : '#4B5563'} />
          <Text style={[styles.templateButtonText, isDark && styles.templateButtonTextDark]}>
            {showTemplates ? 'Hide Templates' : 'Show Templates'}
          </Text>
        </TouchableOpacity>
        {!user && (
          <TouchableOpacity onPress={() => {}}>
            <Text style={styles.signInText}>Sign in to save templates</Text>
          </TouchableOpacity>
        )}
      </View>

      {showTemplates && templates.length > 0 && (
        <View style={[styles.templatesContainer, isDark && styles.templatesContainerDark]}>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
            Saved Templates
          </Text>
          {templates.map((template) => (
            <TouchableOpacity
              key={template.id}
              style={[styles.templateItem, isDark && styles.templateItemDark]}
              onPress={() => handleSelectTemplate(template)}
            >
              <View>
                <Text style={[styles.templateName, isDark && styles.templateNameDark]}>
                  {template.name}
                </Text>
                <Text style={[styles.templateDetails, isDark && styles.templateDetailsDark]}>
                  {template.sets} sets × {template.reps} reps
                  {template.weight && ` @ ${template.weight}kg`}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => handleDeleteTemplate(template.id)}
                style={styles.deleteButton}
              >
                <Trash2 size={18} color="#EF4444" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={styles.form}>
        <View style={styles.formGroup}>
          <Text style={[styles.label, isDark && styles.labelDark]}>Exercise Name</Text>
          <TextInput
            style={[styles.input, isDark && styles.inputDark]}
            value={exercise.name}
            onChangeText={(text) => setExercise({ ...exercise, name: text })}
            placeholder="Enter exercise name"
            placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.formGroup, styles.flex1]}>
            <Text style={[styles.label, isDark && styles.labelDark]}>Sets</Text>
            <TextInput
              style={[styles.input, isDark && styles.inputDark]}
              value={String(exercise.sets)}
              onChangeText={(text) => setExercise({ ...exercise, sets: parseInt(text) || 0 })}
              keyboardType="numeric"
              placeholder="3"
              placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
            />
          </View>
          <View style={[styles.formGroup, styles.flex1]}>
            <Text style={[styles.label, isDark && styles.labelDark]}>Reps</Text>
            <TextInput
              style={[styles.input, isDark && styles.inputDark]}
              value={String(exercise.reps)}
              onChangeText={(text) => setExercise({ ...exercise, reps: parseInt(text) || 0 })}
              keyboardType="numeric"
              placeholder="10"
              placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
            />
          </View>
          <View style={[styles.formGroup, styles.flex1]}>
            <Text style={[styles.label, isDark && styles.labelDark]}>Weight (kg)</Text>
            <TextInput
              style={[styles.input, isDark && styles.inputDark]}
              value={exercise.weight?.toString() || ''}
              onChangeText={(text) => setExercise({ ...exercise, weight: parseFloat(text) || undefined })}
              keyboardType="numeric"
              placeholder="Optional"
              placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
            />
          </View>
        </View>

        <View style={styles.formGroup}>
          <View style={styles.labelContainer}>
            <Video size={16} color={isDark ? '#D1D5DB' : '#4B5563'} />
            <Text style={[styles.label, isDark && styles.labelDark]}>Exercise Videos</Text>
          </View>
          
          {exercise.videoUrls?.map((url, index) => (
            <View key={index} style={[styles.videoUrlContainer, isDark && styles.videoUrlContainerDark]}>
              <Text style={[styles.videoUrl, isDark && styles.videoUrlDark]} numberOfLines={1}>
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
            <TouchableOpacity
              onPress={handleAddVideo}
              style={styles.addButton}
            >
              <Plus size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.formGroup}>
          <View style={styles.labelContainer}>
            <FileText size={16} color={isDark ? '#D1D5DB' : '#4B5563'} />
            <Text style={[styles.label, isDark && styles.labelDark]}>Technique Notes</Text>
          </View>
          <TextInput
            style={[styles.input, styles.textArea, isDark && styles.inputDark]}
            value={exercise.notes}
            onChangeText={(text) => setExercise({ ...exercise, notes: text })}
            placeholder="Add your technique notes here..."
            placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity
          onPress={handleSubmit}
          style={styles.submitButton}
        >
          <Save size={16} color="#FFFFFF" />
          <Text style={styles.submitButtonText}>Save Exercise</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
    backgroundColor: '#FFFFFF',
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
    backgroundColor: '#FFFFFF',
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
    color: '#FFFFFF',
    fontSize: 16,
    marginLeft: 8,
    fontFamily: 'Inter-Bold',
  },
});
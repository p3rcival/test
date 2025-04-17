import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
} from 'react-native';
import { Exercise } from '../types';
import { X, Video, FileText, Plus, Trash2, Play } from 'lucide-react-native';
import { useTheme } from '@/src/context/ThemeContext';
import { useRouter } from 'expo-router';
import extractYoutubeVideoId from '../../utils/extractYoutubeVideoId';

interface ExerciseDetailsProps {
  exercise: Exercise;
  onClose: () => void;
  onUpdate: (updatedExercise: Exercise) => void;
  modalVisible: boolean;
}

function ExerciseDetails({ exercise, onClose, onUpdate, modalVisible }: ExerciseDetailsProps) {
  const { isDark } = useTheme();
  const [videoUrls, setVideoUrls] = useState<string[]>(exercise.videoUrls || []);
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [notes, setNotes] = useState(exercise.notes || '');
  const router = useRouter();

  const handleAddVideo = () => {
    if (newVideoUrl && !videoUrls.includes(newVideoUrl)) {
      setVideoUrls([...videoUrls, newVideoUrl]);
      setNewVideoUrl('');
    }
  };

  const handleRemoveVideo = (urlToRemove: string) => {
    setVideoUrls(videoUrls.filter(url => url !== urlToRemove));
  };

  const handleSubmit = () => {
    onUpdate({
      ...exercise,
      videoUrls,
      notes,
    });
  };

  const handlePlayVideo = (url: string) => {
    const videoId = extractYoutubeVideoId(url);
    if (videoId) {
      console.log('ExerciseDetails: play pressed for video URL:', url);
      // Dismiss the modal (this should update modalVisible in the parent)
      //onClose();
      // Navigate to the dedicated video screen.
      router.push(`/video/${videoId}`);
    } else {
      console.error('ExerciseDetails: Invalid video URL:', url);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible} // Controlled by parent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, isDark && styles.modalContentDark]}>
          <View style={[styles.header, isDark && styles.headerDark]}>
            <Text style={[styles.title, isDark && styles.titleDark]}>
              {exercise.name}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={isDark ? '#9CA3AF' : '#6B7280'} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            <View style={[styles.exerciseInfo, isDark && styles.exerciseInfoDark]}>
              <Text style={[styles.exerciseDetails, isDark && styles.exerciseDetailsDark]}>
                {exercise.sets} sets × {exercise.reps} reps
                {exercise.weight && ` @ ${exercise.weight}kg`}
              </Text>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Video size={16} color={isDark ? '#D1D5DB' : '#4B5563'} />
                <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
                  Exercise Videos
                </Text>
              </View>

              {videoUrls.map((url, index) => (
                <View key={index} style={[styles.videoUrlContainer, isDark && styles.videoUrlContainerDark]}>
                  <Text style={[styles.videoUrl, isDark && styles.videoUrlDark]} numberOfLines={1}>
                    {url}
                  </Text>
                  <View style={styles.videoActions}>
                    <TouchableOpacity
                      onPress={() => handlePlayVideo(url)}
                      style={styles.playButton}
                    >
                      <Play size={18} color={isDark ? '#60A5FA' : '#3B82F6'} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleRemoveVideo(url)}
                      style={styles.removeButton}
                    >
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
                  placeholder="https://youtube.com/watch?v=..."
                  placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                />
                <TouchableOpacity onPress={handleAddVideo} style={styles.addButton}>
                  <Plus size={18} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>

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
                placeholder="Add your technique notes here..."
                placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </ScrollView>

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
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    width: '90%',
    maxWidth: 500,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalContentDark: {
    backgroundColor: '#1F2937',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerDark: {
    borderBottomColor: '#374151',
  },
  title: {
    fontSize: 20,
    color: '#1F2937',
    fontFamily: 'Inter-Bold',
  },
  titleDark: {
    color: '#F3F4F6',
  },
  closeButton: {
    padding: 8,
  },
  content: {
    padding: 16,
  },
  exerciseInfo: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  exerciseInfoDark: {
    backgroundColor: '#374151',
  },
  exerciseDetails: {
    fontSize: 14,
    color: '#4B5563',
    fontFamily: 'Inter-Regular',
  },
  exerciseDetailsDark: {
    color: '#9CA3AF',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    color: '#4B5563',
    marginLeft: 8,
    fontFamily: 'Inter-Bold',
  },
  sectionTitleDark: {
    color: '#D1D5DB',
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
  videoActions: {
    flexDirection: 'row',
    gap: 8,
  },
  playButton: {
    padding: 4,
  },
  removeButton: {
    padding: 4,
  },
  addVideoContainer: {
    flexDirection: 'row',
    gap: 8,
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
  flex1: {
    flex: 1,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  addButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  footerDark: {
    borderTopColor: '#374151',
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  cancelButtonDark: {
    backgroundColor: '#374151',
  },
  cancelButtonText: {
    color: '#4B5563',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  cancelButtonTextDark: {
    color: '#D1D5DB',
  },
  saveButton: {
    backgroundColor: '#3B82F6',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter-Bold',
  },
});

export { ExerciseDetails };

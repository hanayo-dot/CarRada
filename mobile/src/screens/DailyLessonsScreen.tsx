import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, useColorScheme, ActivityIndicator, Alert } from 'react-native';
import { palette } from '../theme';
import { fetchLessons } from '../api/api';
import { Lesson, RootStackParamList } from '../types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Lessons'>;
};

export default function DailyLessonsScreen({ navigation }: Props) {
  const [dailyLesson, setDailyLesson] = useState<Lesson | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const colors = palette(useColorScheme());

  useEffect(() => {
    const loadLessons = async () => {
      setLoading(true);
      try {
        const data = await fetchLessons();
        setDailyLesson(data.dailyLesson);
        setLessons(data.lessons || []);
      } catch (error: any) {
        Alert.alert('Load failed', error.response?.data?.message || 'Unable to load lessons.');
      } finally {
        setLoading(false);
      }
    };
    loadLessons();
  }, []);

  const renderLesson = ({ item }: { item: Lesson }) => (
    <View style={[styles.lessonCard, { backgroundColor: colors.surface }]}> 
      <Text style={[styles.lessonTitle, { color: colors.text }]}>{item.title}</Text>
      <Text style={[styles.lessonDescription, { color: colors.muted }]}>{item.description}</Text>
      {item.content.map((paragraph, index) => (
        <Text key={index} style={[styles.lessonText, { color: colors.text }]}>{paragraph}</Text>
      ))}
    </View>
  );

  const renderHeader = () => (
    <>
      <Text style={[styles.title, { color: colors.text }]}>Daily car lessons</Text>
      <Text style={[styles.subtitle, { color: colors.muted }]}>Learn one practical car owner skill every day.</Text>

      {dailyLesson && (
        <View style={[styles.highlightCard, { backgroundColor: colors.surface, borderColor: colors.primary, borderWidth: 1 }]}> 
          <View style={[styles.badge, { backgroundColor: colors.primary }]}>
            <Text style={styles.badgeText}>TODAY'S SKILL</Text>
          </View>
          <Text style={[styles.highlightTitle, { color: colors.text }]}>{dailyLesson.title}</Text>
          <Text style={[styles.lessonDescription, { color: colors.muted }]}>{dailyLesson.description}</Text>
          {dailyLesson.content.map((paragraph, index) => (
            <Text key={index} style={[styles.lessonText, { color: colors.text }]}>{paragraph}</Text>
          ))}
        </View>
      )}

      <Text style={[styles.sectionTitle, { color: colors.text }]}>All lessons & guides</Text>
    </>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size='large' color={colors.primary} />
      </View>
    );
  }

  return (
    <FlatList
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      data={lessons}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderLesson}
      ListHeaderComponent={renderHeader}
      ListEmptyComponent={<Text style={[styles.emptyText, { color: colors.muted }]}>No lessons available.</Text>}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { justifyContent: 'center', alignItems: 'center' },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 16, marginBottom: 20, lineHeight: 22 },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginBottom: 10 },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '800', letterSpacing: 0.8 },
  highlightCard: { borderRadius: 20, padding: 20, marginBottom: 24 },
  highlightTitle: { fontSize: 20, fontWeight: '800', marginBottom: 8 },
  lessonCard: { borderRadius: 18, padding: 18, marginBottom: 18 },
  lessonTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  lessonDescription: { fontSize: 14, marginBottom: 12, lineHeight: 20 },
  lessonText: { fontSize: 15, lineHeight: 22, marginBottom: 10 },
  sectionTitle: { fontSize: 20, fontWeight: '700', marginBottom: 14 },
  emptyText: { textAlign: 'center', marginTop: 20 }
});

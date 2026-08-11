import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, useColorScheme, ActivityIndicator, Alert, ScrollView } from 'react-native';
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
        setLessons(data.lessons);
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

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <Text style={[styles.title, { color: colors.text }]}>Daily car lessons</Text>
      <Text style={[styles.subtitle, { color: colors.muted }]}>Learn one practical car owner skill every day.</Text>
      {loading ? (
        <ActivityIndicator size='large' color={colors.primary} style={styles.loader} />
      ) : (
        <>
          {dailyLesson && (
            <View style={[styles.highlightCard, { backgroundColor: colors.surface }]}> 
              <Text style={[styles.lessonTitle, { color: colors.primary }]}>{dailyLesson.title}</Text>
              <Text style={[styles.lessonDescription, { color: colors.muted }]}>{dailyLesson.description}</Text>
              {dailyLesson.content.map((paragraph, index) => (
                <Text key={index} style={[styles.lessonText, { color: colors.text }]}>{paragraph}</Text>
              ))}
            </View>
          )}
          <Text style={[styles.sectionTitle, { color: colors.text }]}>More lessons</Text>
          <FlatList
            data={lessons}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderLesson}
            scrollEnabled={false}
            ListEmptyComponent={<Text style={[styles.emptyText, { color: colors.muted }]}>No lessons available.</Text>}
          />
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 16, marginBottom: 20, lineHeight: 22 },
  loader: { marginTop: 20 },
  highlightCard: { borderRadius: 20, padding: 20, marginBottom: 24 },
  lessonCard: { borderRadius: 18, padding: 18, marginBottom: 18 },
  lessonTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  lessonDescription: { fontSize: 14, marginBottom: 12, lineHeight: 20 },
  lessonText: { fontSize: 15, lineHeight: 22, marginBottom: 10 },
  sectionTitle: { fontSize: 20, fontWeight: '700', marginBottom: 14 },
  emptyText: { textAlign: 'center', marginTop: 20 }
});

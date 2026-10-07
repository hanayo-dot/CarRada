import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, useColorScheme, ActivityIndicator, Alert } from 'react-native';
import { palette } from '../theme';
import { fetchLessons } from '../api/api';
import { Lesson, RootStackParamList } from '../types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import MercedesAmbientLight from '../components/MercedesAmbientLight';
import MercedesCard from '../components/MercedesCard';

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
        Alert.alert('Load Failure', error.response?.data?.message || 'Unable to download driver masterclass.');
      } finally {
        setLoading(false);
      }
    };
    loadLessons();
  }, []);

  const renderLesson = ({ item }: { item: Lesson }) => (
    <MercedesCard colors={colors} style={styles.lessonCard}>
      <Text style={[styles.lessonTitle, { color: colors.text }]}>{item.title}</Text>
      <Text style={[styles.lessonDescription, { color: colors.primary }]}>{item.description}</Text>
      {item.content.map((paragraph, index) => (
        <Text key={index} style={[styles.lessonText, { color: colors.textSecondary }]}>{paragraph}</Text>
      ))}
    </MercedesCard>
  );

  const renderHeader = () => (
    <>
      <View style={styles.header}>
        <Text style={[styles.hudLabel, { color: colors.primary }]}>MBUX DRIVER ACADEMY</Text>
        <Text style={[styles.title, { color: colors.text }]}>Driver Masterclass</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Daily professional driving, mechanical preservation, and emergency handling skills.
        </Text>
      </View>

      {dailyLesson && (
        <MercedesCard colors={colors} highlightColor={colors.primary} glow={true} style={styles.highlightCard}>
          <View style={[styles.badge, { backgroundColor: colors.primary }]}>
            <Text style={styles.badgeText}>TODAY'S FEATURED TECHNIQUE</Text>
          </View>
          <Text style={[styles.highlightTitle, { color: colors.text }]}>{dailyLesson.title}</Text>
          <Text style={[styles.highlightDescription, { color: colors.primary }]}>{dailyLesson.description}</Text>
          {dailyLesson.content.map((paragraph, index) => (
            <Text key={index} style={[styles.lessonText, { color: colors.textSecondary }]}>{paragraph}</Text>
          ))}
        </MercedesCard>
      )}

      <Text style={[styles.sectionTitle, { color: colors.text }]}>COMPLETE ARCHIVE</Text>
    </>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        <MercedesAmbientLight color={colors.primary} height={2} />
        <ActivityIndicator size='large' color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <MercedesAmbientLight color={colors.primary} height={2} />

      <FlatList
        contentContainerStyle={styles.content}
        data={lessons}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderLesson}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: colors.muted }]}>No lessons available in telemetry database.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { justifyContent: 'center', alignItems: 'center' },
  content: { padding: 16, paddingBottom: 40 },
  header: { marginBottom: 16 },
  hudLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 1.2, marginBottom: 4 },
  title: { fontSize: 24, fontWeight: '800', letterSpacing: 0.3 },
  subtitle: { fontSize: 13, lineHeight: 18, marginTop: 4 },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 8,
  },
  badgeText: { color: '#040711', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  highlightCard: { padding: 18, marginBottom: 20 },
  highlightTitle: { fontSize: 18, fontWeight: '800', marginBottom: 6 },
  highlightDescription: { fontSize: 13, fontWeight: '700', marginBottom: 12 },
  lessonCard: { padding: 16, marginBottom: 12 },
  lessonTitle: { fontSize: 16, fontWeight: '800', marginBottom: 6 },
  lessonDescription: { fontSize: 12, fontWeight: '700', marginBottom: 10 },
  lessonText: { fontSize: 13, lineHeight: 20, marginBottom: 8 },
  sectionTitle: { fontSize: 11, fontWeight: '800', letterSpacing: 1.2, marginBottom: 12, paddingHorizontal: 4 },
  emptyText: { textAlign: 'center', marginTop: 20, fontSize: 14 }
});

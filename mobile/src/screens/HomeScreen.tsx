import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, useColorScheme, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { palette } from '../theme';
import { fetchLessons, fetchReminders, fetchDiagnosticSessions } from '../api/api';
import { RootStackParamList } from '../types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

export default function HomeScreen({ navigation }: Props) {
  const scheme = useColorScheme();
  const colors = palette(scheme);
  const [reminderCount, setReminderCount] = useState(0);
  const [diagnosticCount, setDiagnosticCount] = useState(0);
  const [lessonTitle, setLessonTitle] = useState('');

  useEffect(() => {
    const loadSummary = async () => {
      try {
        const [reminders, sessions, lessons] = await Promise.all([
          fetchReminders(),
          fetchDiagnosticSessions(),
          fetchLessons()
        ]);

        setReminderCount(reminders.length);
        setDiagnosticCount(sessions.length);
        setLessonTitle(lessons.dailyLesson?.title || 'Daily lesson');
      } catch (error: any) {
        Alert.alert('Summary failed', error.response?.data?.message || 'Could not load dashboard summary.');
      }
    };
    loadSummary();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      <Text style={[styles.title, { color: colors.text }]}>CarRada</Text>
      <Text style={[styles.subtitle, { color: colors.muted }]}>Safety-first help for your car.</Text>
      <View style={[styles.summaryRow, { backgroundColor: colors.surface }]}> 
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryLabel, { color: colors.muted }]}>Upcoming reminders</Text>
          <Text style={[styles.summaryValue, { color: colors.text }]}>{reminderCount}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryLabel, { color: colors.muted }]}>Latest lesson</Text>
          <Text style={[styles.summaryValue, { color: colors.text }]} numberOfLines={2}>{lessonTitle}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryLabel, { color: colors.muted }]}>Diagnostic sessions</Text>
          <Text style={[styles.summaryValue, { color: colors.text }]}>{diagnosticCount}</Text>
        </View>
      </View>
      <View style={styles.grid}>
        <Pressable style={[styles.card, { backgroundColor: colors.surface }]} onPress={() => navigation.navigate('Vehicles')}>
          <Text style={[styles.cardTitle, { color: colors.primary }]}>Vehicle profiles</Text>
          <Text style={[styles.cardText, { color: colors.text }]}>Add and manage your cars.</Text>
        </Pressable>
        <Pressable style={[styles.card, { backgroundColor: colors.surface }]} onPress={() => navigation.navigate('Reminders')}>
          <Text style={[styles.cardTitle, { color: colors.primary }]}>Maintenance reminders</Text>
          <Text style={[styles.cardText, { color: colors.text }]}>Track service, insurance, inspection, and license renewal dates.</Text>
        </Pressable>
        <Pressable style={[styles.card, { backgroundColor: colors.surface }]} onPress={() => navigation.navigate('Lessons')}>
          <Text style={[styles.cardTitle, { color: colors.primary }]}>Daily lessons</Text>
          <Text style={[styles.cardText, { color: colors.text }]}>Learn a new car owner skill every day.</Text>
        </Pressable>
        <Pressable style={[styles.card, { backgroundColor: colors.surface }]} onPress={() => navigation.navigate('RepairCostEstimator')}>
          <Text style={[styles.cardTitle, { color: colors.primary }]}>Repair cost estimator</Text>
          <Text style={[styles.cardText, { color: colors.text }]}>Get a likely price range for a repair or symptom.</Text>
        </Pressable>
        <Pressable style={[styles.card, { backgroundColor: colors.surface }]} onPress={() => navigation.navigate('Chat')}>
          <Text style={[styles.cardTitle, { color: colors.primary }]}>AI Car Assistant</Text>
          <Text style={[styles.cardText, { color: colors.text }]}>Ask about symptoms, lights, and repairs.</Text>
        </Pressable>
        <Pressable style={[styles.card, { backgroundColor: colors.surface }]} onPress={() => navigation.navigate('SymptomDiagnostics')}>
          <Text style={[styles.cardTitle, { color: colors.primary }]}>Symptom diagnostics</Text>
          <Text style={[styles.cardText, { color: colors.text }]}>Describe noises or faults and get targeted guidance.</Text>
        </Pressable>
        <Pressable style={[styles.card, { backgroundColor: colors.surface }]} onPress={() => navigation.navigate('Emergencies')}>
          <Text style={[styles.cardTitle, { color: colors.primary }]}>Emergency Assistant</Text>
          <Text style={[styles.cardText, { color: colors.text }]}>Fast help for a no-start, overheating, or flat tire.</Text>
        </Pressable>
        <Pressable style={[styles.card, { backgroundColor: colors.surface }]} onPress={() => navigation.navigate('MechanicTranslator')}>
          <Text style={[styles.cardTitle, { color: colors.primary }]}>Mechanic translator</Text>
          <Text style={[styles.cardText, { color: colors.text }]}>Decode mechanic notes into plain language.</Text>
        </Pressable>
        <Pressable style={[styles.card, { backgroundColor: colors.surface }]} onPress={() => navigation.navigate('Diagnostics')}>
          <Text style={[styles.cardTitle, { color: colors.primary }]}>Diagnostic sessions</Text>
          <Text style={[styles.cardText, { color: colors.text }]}>Record and summarize a troubleshooting session.</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 34, fontWeight: '800', marginTop: 20 },
  subtitle: { marginTop: 8, fontSize: 16, lineHeight: 24 },
  summaryRow: { borderRadius: 20, padding: 18, marginTop: 20, flexDirection: 'row', justifyContent: 'space-between' },
  summaryItem: { flex: 1 },
  summaryLabel: { fontSize: 12, marginBottom: 4 },
  summaryValue: { fontSize: 20, fontWeight: '700' },
  grid: { marginTop: 20 },
  card: { borderRadius: 20, padding: 20, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 12, elevation: 3, marginBottom: 16 },
  cardTitle: { fontSize: 18, fontWeight: '700' },
  cardText: { marginTop: 8, fontSize: 14, lineHeight: 20 }
});

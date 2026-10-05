import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, useColorScheme, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { palette } from '../theme';
import { fetchReminders, createReminder, updateReminder, deleteReminder } from '../api/api';
import { Reminder, RootStackParamList } from '../types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Reminders'>;
};

const categoryHints = [
  'Oil change & filter',
  'Tire rotation',
  'Brake inspection',
  'State vehicle inspection',
  'Auto insurance renewal',
  'Vehicle registration / tag'
];

export default function MaintenanceRemindersScreen({ navigation }: Props) {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dueMileage, setDueMileage] = useState('');
  const [notificationEnabled, setNotificationEnabled] = useState(true);
  const [notificationDays, setNotificationDays] = useState(7);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const colors = palette(useColorScheme());

  const loadReminders = async () => {
    setLoading(true);
    try {
      const data = await fetchReminders();
      setReminders(data || []);
    } catch (error: any) {
      Alert.alert('Load failed', error.response?.data?.message || 'Could not load reminders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReminders();
  }, []);

  const setQuickDateMonths = (months: number) => {
    const d = new Date();
    d.setMonth(d.getMonth() + months);
    setDueDate(d.toISOString().split('T')[0]);
  };

  const handleAdd = async () => {
    if (!description.trim()) {
      return Alert.alert('Description required', 'Please enter a reminder description or tap a category.');
    }

    if (dueDate && !/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
      return Alert.alert('Invalid Date Format', 'Please enter date as YYYY-MM-DD (e.g. 2026-11-15) or tap one of the quick date helper buttons.');
    }

    setSaving(true);
    try {
      const reminder = await createReminder({
        description: description.trim(),
        due_date: dueDate || null,
        due_mileage: dueMileage ? Number(dueMileage) : null,
        notification_enabled: notificationEnabled,
        notification_days: notificationDays
      });
      setReminders((prev) => [reminder, ...prev]);
      setDescription('');
      setDueDate('');
      setDueMileage('');
      setNotificationEnabled(true);
      setNotificationDays(7);
    } catch (error: any) {
      Alert.alert('Save failed', error.response?.data?.message || 'Could not save reminder.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleComplete = async (reminder: Reminder) => {
    try {
      const updated = await updateReminder(reminder.id, { completed: !reminder.completed });
      setReminders((prev) => prev.map((item) => (item.id === reminder.id ? updated : item)));
    } catch (error: any) {
      Alert.alert('Update failed', error.response?.data?.message || 'Could not update reminder.');
    }
  };

  const handleDelete = async (reminderId: number) => {
    Alert.alert('Delete reminder?', 'This will remove the reminder permanently.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteReminder(reminderId);
            setReminders((prev) => prev.filter((item) => item.id !== reminderId));
          } catch (error: any) {
            Alert.alert('Delete failed', error.response?.data?.message || 'Could not delete reminder.');
          }
        }
      }
    ]);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <Text style={[styles.title, { color: colors.text }]}>Maintenance reminders</Text>
      <Text style={[styles.subtitle, { color: colors.muted }]}>
        Track service, oil changes, insurance, inspection, and registration renewal dates.
      </Text>

      <View style={[styles.formCard, { backgroundColor: colors.surface }]}> 
        <Text style={[styles.label, { color: colors.muted }]}>Quick templates:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
          {categoryHints.map((hint) => (
            <Pressable
              key={hint}
              style={[styles.hintChip, { backgroundColor: colors.background, borderColor: colors.surface, borderWidth: 1 }]}
              onPress={() => setDescription(hint)}
            >
              <Text style={{ color: colors.text, fontSize: 13 }}>{hint}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <TextInput
          style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
          placeholder='Reminder description (e.g. Synthetic Oil Change)'
          placeholderTextColor={colors.muted}
          value={description}
          onChangeText={setDescription}
        />

        <TextInput
          style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
          placeholder='Due date (YYYY-MM-DD)'
          placeholderTextColor={colors.muted}
          value={dueDate}
          onChangeText={setDueDate}
        />

        <Text style={[styles.fieldHint, { color: colors.muted }]}>Quick due dates:</Text>
        <View style={styles.quickDateRow}>
          <Pressable style={[styles.quickDateChip, { backgroundColor: colors.background }]} onPress={() => setQuickDateMonths(1)}>
            <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '700' }}>+1 Month</Text>
          </Pressable>
          <Pressable style={[styles.quickDateChip, { backgroundColor: colors.background }]} onPress={() => setQuickDateMonths(3)}>
            <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '700' }}>+3 Months</Text>
          </Pressable>
          <Pressable style={[styles.quickDateChip, { backgroundColor: colors.background }]} onPress={() => setQuickDateMonths(6)}>
            <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '700' }}>+6 Months</Text>
          </Pressable>
          <Pressable style={[styles.quickDateChip, { backgroundColor: colors.background }]} onPress={() => setQuickDateMonths(12)}>
            <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '700' }}>+1 Year</Text>
          </Pressable>
        </View>

        <TextInput
          style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
          placeholder='Due mileage (e.g. 45000)'
          placeholderTextColor={colors.muted}
          value={dueMileage}
          onChangeText={setDueMileage}
          keyboardType='numeric'
        />

        <View style={styles.scheduleRow}>
          <Pressable
            style={[styles.toggleButton, { backgroundColor: notificationEnabled ? colors.primary : colors.background }]}
            onPress={() => setNotificationEnabled((prev) => !prev)}
          >
            <Text style={{ color: notificationEnabled ? '#fff' : colors.text, fontWeight: '600' }}>
              {notificationEnabled ? '🔔 Alert on' : '🔕 Alert off'}
            </Text>
          </Pressable>
          <View style={styles.dayButtonRow}>
            {[0, 7, 14, 30].map((days) => (
              <Pressable
                key={days}
                onPress={() => setNotificationDays(days)}
                style={[styles.dayButton, { backgroundColor: notificationDays === days ? colors.primary : colors.background }]}
              >
                <Text style={{ color: notificationDays === days ? '#fff' : colors.text, fontSize: 12, fontWeight: '600' }}>
                  {days === 0 ? 'Day of' : `${days}d`}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Pressable style={[styles.saveButton, { backgroundColor: colors.primary }]} onPress={handleAdd} disabled={saving}>
          {saving ? <ActivityIndicator color='#fff' /> : <Text style={styles.saveText}>+ Add reminder</Text>}
        </Pressable>
      </View>

      <Text style={[styles.sectionHeading, { color: colors.text }]}>Your Reminders</Text>

      {loading ? (
        <ActivityIndicator size='large' color={colors.primary} style={{ marginTop: 20 }} />
      ) : reminders.length === 0 ? (
        <Text style={[styles.emptyText, { color: colors.muted }]}>No reminders yet. Add one above to stay on top of car care!</Text>
      ) : (
        reminders.map((item) => (
          <View key={item.id} style={[styles.card, { backgroundColor: item.completed ? '#1C3829' : colors.surface }]}> 
            <View style={styles.cardTop}>
              <Text style={[styles.cardTitle, { color: item.completed ? '#86EFAC' : colors.text }]}>{item.description}</Text>
              <Text style={[styles.statusText, { color: item.completed ? '#86EFAC' : colors.primary }]}>
                {item.completed ? '✓ Completed' : 'Pending'}
              </Text>
            </View>
            <Text style={[styles.cardMeta, { color: colors.muted }]}>Due date: {item.due_date || '—'}</Text>
            {item.due_mileage ? (
              <Text style={[styles.cardMeta, { color: colors.muted }]}>Due mileage: {item.due_mileage.toLocaleString()} miles</Text>
            ) : null}
            <Text style={[styles.cardMeta, { color: colors.muted }]}>
              Notification: {item.notification_enabled === false ? 'Off' : `${item.notification_days ?? 7} days in advance`}
            </Text>
            <View style={styles.cardActions}>
              <Pressable
                style={[styles.actionButton, { backgroundColor: item.completed ? colors.surface : colors.primary }]}
                onPress={() => handleToggleComplete(item)}
              >
                <Text style={[styles.actionText, { color: item.completed ? colors.text : '#fff' }]}>
                  {item.completed ? 'Mark pending' : 'Mark complete'}
                </Text>
              </Pressable>
              <Pressable style={styles.deleteButton} onPress={() => handleDelete(item.id)}>
                <Text style={styles.deleteText}>Delete</Text>
              </Pressable>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 50 },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 6 },
  subtitle: { fontSize: 16, marginBottom: 18, lineHeight: 22 },
  formCard: { borderRadius: 20, padding: 18, marginBottom: 24 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 8 },
  chipRow: { marginBottom: 14 },
  hintChip: { borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, marginRight: 8 },
  input: { borderRadius: 14, padding: 14, fontSize: 15, marginBottom: 12 },
  fieldHint: { fontSize: 12, fontWeight: '600', marginBottom: 6 },
  quickDateRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  quickDateChip: { flex: 1, borderRadius: 10, paddingVertical: 8, alignItems: 'center' },
  scheduleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, marginTop: 4 },
  toggleButton: { borderRadius: 12, paddingVertical: 10, paddingHorizontal: 14 },
  dayButtonRow: { flexDirection: 'row', gap: 6 },
  dayButton: { borderRadius: 10, paddingVertical: 8, paddingHorizontal: 10 },
  saveButton: { borderRadius: 14, padding: 16, alignItems: 'center' },
  saveText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  sectionHeading: { fontSize: 20, fontWeight: '700', marginBottom: 14 },
  emptyText: { textAlign: 'center', marginVertical: 20, fontSize: 15 },
  card: { borderRadius: 18, padding: 18, marginBottom: 14 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  cardTitle: { fontSize: 17, fontWeight: '700', flex: 1, marginRight: 8 },
  statusText: { fontSize: 13, fontWeight: '700' },
  cardMeta: { fontSize: 14, marginTop: 3 },
  cardActions: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 12, marginTop: 14 },
  actionButton: { borderRadius: 10, paddingVertical: 8, paddingHorizontal: 14 },
  actionText: { fontSize: 13, fontWeight: '700' },
  deleteButton: { paddingVertical: 8, paddingHorizontal: 12 },
  deleteText: { color: '#EF4444', fontSize: 13, fontWeight: '600' }
});
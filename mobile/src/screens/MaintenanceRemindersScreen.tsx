import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, useColorScheme, FlatList, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { palette } from '../theme';
import { fetchReminders, createReminder, updateReminder, deleteReminder } from '../api/api';
import { Reminder, RootStackParamList } from '../types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Reminders'>;
};

const categoryHints = [
  'Oil change',
  'Service appointment',
  'Inspection',
  'Insurance renewal',
  'License renewal',
  'Tire rotation'
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
      setReminders(data);
    } catch (error: any) {
      Alert.alert('Load failed', error.response?.data?.message || 'Could not load reminders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReminders();
  }, []);

  const handleAdd = async () => {
    if (!description.trim()) {
      return Alert.alert('Description required', 'Please enter a reminder description.');
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

  const renderReminder = ({ item }: { item: Reminder }) => (
    <View style={[styles.card, { backgroundColor: item.completed ? '#1F7A49' : colors.surface }]}> 
      <View style={styles.cardTop}>
        <Text style={[styles.cardTitle, { color: item.completed ? '#D1FAE5' : colors.text }]}>{item.description}</Text>
        <Text style={[styles.statusText, { color: item.completed ? '#A7F3D0' : colors.primary }]}>{item.completed ? 'Completed' : 'Pending'}</Text>
      </View>
      <Text style={[styles.cardMeta, { color: colors.muted }]}>Due date: {item.due_date || '—'}</Text>
      <Text style={[styles.cardMeta, { color: colors.muted }]}>Due mileage: {item.due_mileage ?? '—'}</Text>
      <Text style={[styles.cardMeta, { color: colors.muted }]}>Notification: {item.notification_enabled === false ? 'Off' : `${item.notification_days ?? 7} days before`}</Text>
      <View style={styles.cardActions}>
        <Pressable style={[styles.actionButton, { backgroundColor: item.completed ? colors.surface : colors.primary }]} onPress={() => handleToggleComplete(item)}>
          <Text style={[styles.actionText, { color: item.completed ? colors.text : '#fff' }]}>
            {item.completed ? 'Mark pending' : 'Mark done'}
          </Text>
        </Pressable>
        <Pressable style={[styles.deleteButton]} onPress={() => handleDelete(item.id)}>
          <Text style={[styles.deleteText]}>Delete</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <Text style={[styles.title, { color: colors.text }]}>Maintenance reminders</Text>
      <Text style={[styles.subtitle, { color: colors.muted }]}>Track service, insurance, inspection, and license renewal dates in one place.</Text>

      <View style={[styles.formCard, { backgroundColor: colors.surface }]}> 
        <TextInput
          style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
          placeholder='Reminder description'
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
        <TextInput
          style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
          placeholder='Due mileage (optional)'
          placeholderTextColor={colors.muted}
          value={dueMileage}
          onChangeText={setDueMileage}
          keyboardType='numeric'
        />
        <View style={styles.scheduleRow}>
          <Pressable style={[styles.toggleButton, { backgroundColor: notificationEnabled ? colors.primary : colors.background }]} onPress={() => setNotificationEnabled((prev) => !prev)}>
            <Text style={{ color: notificationEnabled ? '#fff' : colors.text }}>{notificationEnabled ? 'Notifications on' : 'Notifications off'}</Text>
          </Pressable>
          <View style={styles.dayButtonRow}>
            {[0, 7, 14, 30].map((days) => (
              <Pressable
                key={days}
                onPress={() => setNotificationDays(days)}
                style={[styles.dayButton, { backgroundColor: notificationDays === days ? colors.primary : colors.background }]}
              >
                <Text style={{ color: notificationDays === days ? '#fff' : colors.text }}>{days === 0 ? 'Same day' : `${days}d`}</Text>
              </Pressable>
            ))}
          </View>
        </View>
        <Pressable style={[styles.saveButton, { backgroundColor: colors.primary }]} onPress={handleAdd} disabled={saving}>
          {saving ? <ActivityIndicator color='#fff' /> : <Text style={styles.saveText}>Add reminder</Text>}
        </Pressable>
      </View>

      <View style={styles.hintRow}>
        <Text style={[styles.hintLabel, { color: colors.muted }]}>Quick ideas:</Text>
        {categoryHints.map((hint) => (
          <Text key={hint} style={[styles.hintItem, { color: colors.primary }]}>{hint}</Text>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator size='large' color={colors.primary} style={{ marginTop: 24 }} />
      ) : (
        <FlatList
          data={reminders}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderReminder}
          contentContainerStyle={reminders.length === 0 ? styles.emptyContainer : undefined}
          ListEmptyComponent={<Text style={[styles.emptyText, { color: colors.muted }]}>No reminders yet. Add one above.</Text>}
          scrollEnabled={false}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 16, lineHeight: 22, marginBottom: 20 },
  formCard: { borderRadius: 18, padding: 18, marginBottom: 20 },
  input: { borderRadius: 14, padding: 14, fontSize: 15, marginBottom: 12 },
  saveButton: { borderRadius: 14, padding: 16, alignItems: 'center' },
  saveText: { color: '#fff', fontWeight: '700' },
  scheduleRow: { marginBottom: 14 },
  toggleButton: { borderRadius: 14, paddingVertical: 10, paddingHorizontal: 14, marginBottom: 10, alignSelf: 'flex-start' },
  dayButtonRow: { flexDirection: 'row', flexWrap: 'wrap' },
  dayButton: { borderRadius: 14, paddingVertical: 8, paddingHorizontal: 12, marginRight: 8, marginBottom: 8 },
  hintRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20 },
  hintLabel: { marginRight: 8, fontWeight: '700' },
  hintItem: { marginRight: 10 },
  card: { borderRadius: 18, padding: 18, marginBottom: 14 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  cardTitle: { fontSize: 16, fontWeight: '700', flex: 1 },
  statusText: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  cardMeta: { fontSize: 13, marginBottom: 4 },
  cardActions: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  actionButton: { borderRadius: 14, paddingVertical: 12, paddingHorizontal: 18, marginRight: 10 },
  actionText: { fontWeight: '700' },
  deleteButton: { paddingVertical: 12, paddingHorizontal: 18 },
  deleteText: { color: '#EF4444', fontWeight: '700' },
  emptyContainer: { paddingTop: 40, alignItems: 'center' },
  emptyText: { fontSize: 16, textAlign: 'center' }
});
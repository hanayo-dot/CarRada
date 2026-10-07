import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, useColorScheme, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { palette } from '../theme';
import { fetchReminders, createReminder, updateReminder, deleteReminder } from '../api/api';
import { Reminder, RootStackParamList } from '../types';
import MercedesAmbientLight from '../components/MercedesAmbientLight';
import MercedesCard from '../components/MercedesCard';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Reminders'>;
};

const categoryHints = [
  'Service A: Oil & Filter',
  'Service B: Brake Fluid & Inspection',
  'Tire Rotation & Balance',
  'State Safety Inspection',
  'Auto Insurance Renewal',
  'Vehicle Registration / Tag',
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
      Alert.alert('Telemetry Alert', error.response?.data?.message || 'Could not load service schedule.');
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
      return Alert.alert('Description Required', 'Select a service package or type a description.');
    }

    if (dueDate && !/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
      return Alert.alert('Format Error', 'Please enter date as YYYY-MM-DD or use the quick date buttons.');
    }

    setSaving(true);
    try {
      const reminder = await createReminder({
        description: description.trim(),
        due_date: dueDate || null,
        due_mileage: dueMileage ? Number(dueMileage) : null,
        notification_enabled: notificationEnabled,
        notification_days: notificationDays,
      });
      setReminders((prev) => [reminder, ...prev]);
      setDescription('');
      setDueDate('');
      setDueMileage('');
      setNotificationEnabled(true);
      setNotificationDays(7);
    } catch (error: any) {
      Alert.alert('Save Failed', error.response?.data?.message || 'Could not schedule reminder.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleComplete = async (reminder: Reminder) => {
    try {
      const updated = await updateReminder(reminder.id, { completed: !reminder.completed });
      setReminders((prev) => prev.map((item) => (item.id === reminder.id ? updated : item)));
    } catch (error: any) {
      Alert.alert('Update Failed', error.response?.data?.message || 'Could not update reminder.');
    }
  };

  const handleDelete = async (reminderId: number) => {
    Alert.alert('Remove Reminder?', 'This will permanently remove this maintenance task.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteReminder(reminderId);
            setReminders((prev) => prev.filter((item) => item.id !== reminderId));
          } catch (error: any) {
            Alert.alert('Delete failed', error.response?.data?.message || 'Could not delete reminder.');
          }
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <MercedesAmbientLight color={colors.secondary} height={2} />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.hudLabel, { color: colors.secondary }]}>SERVICE ASSYST PLUS</Text>
          <Text style={[styles.title, { color: colors.text }]}>Service Schedule</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Track scheduled intervals, oil changes, brake inspections, and tag renewals.
          </Text>
        </View>

        {/* Schedule Form Card */}
        <MercedesCard colors={colors} highlightColor={colors.secondary} style={styles.formCard}>
          <Text style={[styles.sectionHeading, { color: colors.secondary }]}>SERVICE TEMPLATES</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.templateScroll}>
            {categoryHints.map((hint) => (
              <Pressable
                key={hint}
                style={[
                  styles.templateChip,
                  {
                    backgroundColor: description === hint ? 'rgba(56, 189, 248, 0.2)' : colors.surfaceElevated,
                    borderColor: description === hint ? colors.secondary : colors.borderMuted,
                  },
                ]}
                onPress={() => setDescription(hint)}
              >
                <Text style={[styles.templateChipText, { color: description === hint ? '#fff' : colors.textSecondary }]}>
                  {hint}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          <TextInput
            style={[styles.input, { backgroundColor: colors.surfaceElevated, color: colors.text, borderColor: colors.borderMuted }]}
            placeholder='Service task (e.g., Synthetic Oil Change)'
            placeholderTextColor={colors.muted}
            value={description}
            onChangeText={setDescription}
          />

          <TextInput
            style={[styles.input, { backgroundColor: colors.surfaceElevated, color: colors.text, borderColor: colors.borderMuted }]}
            placeholder='Target Due Date (YYYY-MM-DD)'
            placeholderTextColor={colors.muted}
            value={dueDate}
            onChangeText={setDueDate}
          />

          <Text style={[styles.subLabel, { color: colors.muted }]}>QUICK TIMELINE OFFSET</Text>
          <View style={styles.quickDateRow}>
            {[
              { label: '+1 MO', months: 1 },
              { label: '+3 MO', months: 3 },
              { label: '+6 MO', months: 6 },
              { label: '+1 YR', months: 12 },
            ].map((btn) => (
              <Pressable
                key={btn.label}
                style={[styles.quickChip, { backgroundColor: colors.surfaceElevated, borderColor: colors.borderMuted }]}
                onPress={() => setQuickDateMonths(btn.months)}
              >
                <Text style={[styles.quickChipText, { color: colors.secondary }]}>{btn.label}</Text>
              </Pressable>
            ))}
          </View>

          <TextInput
            style={[styles.input, { backgroundColor: colors.surfaceElevated, color: colors.text, borderColor: colors.borderMuted }]}
            placeholder='Target Due Mileage (e.g. 50000)'
            placeholderTextColor={colors.muted}
            value={dueMileage}
            onChangeText={setDueMileage}
            keyboardType='numeric'
          />

          <View style={styles.alertOptionRow}>
            <Pressable
              style={[
                styles.togglePill,
                {
                  backgroundColor: notificationEnabled ? 'rgba(56, 189, 248, 0.2)' : colors.surfaceElevated,
                  borderColor: notificationEnabled ? colors.secondary : colors.borderMuted,
                },
              ]}
              onPress={() => setNotificationEnabled((prev) => !prev)}
            >
              <Text style={[styles.toggleText, { color: notificationEnabled ? '#fff' : colors.muted }]}>
                {notificationEnabled ? '🔔 NOTIFICATIONS ACTIVE' : '🔕 ALERTS DISABLED'}
              </Text>
            </Pressable>

            <View style={styles.daySelector}>
              {[0, 7, 14, 30].map((days) => (
                <Pressable
                  key={days}
                  onPress={() => setNotificationDays(days)}
                  style={[
                    styles.dayPill,
                    {
                      backgroundColor: notificationDays === days ? colors.secondary : colors.surfaceElevated,
                    },
                  ]}
                >
                  <Text style={[styles.dayPillText, { color: notificationDays === days ? '#040711' : colors.textSecondary }]}>
                    {days === 0 ? 'DAY-OF' : `${days}D`}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <Pressable
            style={[styles.addButton, { backgroundColor: colors.secondary, shadowColor: colors.secondary }]}
            onPress={handleAdd}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color='#040711' />
            ) : (
              <Text style={styles.addButtonText}>SCHEDULE SERVICE ITEM</Text>
            )}
          </Pressable>
        </MercedesCard>

        {/* Existing Reminders List */}
        <Text style={[styles.sectionHeading, { color: colors.text, marginTop: 10 }]}>ACTIVE SCHEDULED TASKS</Text>

        {loading ? (
          <ActivityIndicator size='large' color={colors.secondary} style={{ marginTop: 20 }} />
        ) : reminders.length === 0 ? (
          <MercedesCard colors={colors} style={styles.emptyCard}>
            <Text style={[styles.emptyText, { color: colors.muted }]}>
              All scheduled systems nominal. Add a maintenance item above to configure tracking.
            </Text>
          </MercedesCard>
        ) : (
          reminders.map((item) => (
            <MercedesCard
              key={item.id}
              colors={colors}
              highlightColor={item.completed ? colors.success : colors.secondary}
              style={styles.taskCard}
            >
              <View style={styles.taskHeader}>
                <Text style={[styles.taskTitle, { color: item.completed ? colors.success : colors.text }]}>
                  {item.description}
                </Text>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor: item.completed ? 'rgba(0, 245, 160, 0.15)' : 'rgba(56, 189, 248, 0.15)',
                      borderColor: item.completed ? colors.success : colors.secondary,
                    },
                  ]}
                >
                  <Text style={[styles.statusBadgeText, { color: item.completed ? colors.success : colors.secondary }]}>
                    {item.completed ? '✓ PERFORMED' : 'PENDING'}
                  </Text>
                </View>
              </View>

              <View style={styles.metaRow}>
                <Text style={[styles.metaLabel, { color: colors.muted }]}>TARGET DATE: </Text>
                <Text style={[styles.metaVal, { color: colors.textSecondary }]}>{item.due_date || 'UNSPECIFIED'}</Text>
              </View>

              {item.due_mileage ? (
                <View style={styles.metaRow}>
                  <Text style={[styles.metaLabel, { color: colors.muted }]}>TARGET MILEAGE: </Text>
                  <Text style={[styles.metaVal, { color: colors.textSecondary }]}>
                    {item.due_mileage.toLocaleString()} MILES
                  </Text>
                </View>
              ) : null}

              <View style={styles.taskActions}>
                <Pressable
                  style={[
                    styles.taskActionButton,
                    {
                      backgroundColor: item.completed ? colors.surfaceElevated : colors.secondary,
                    },
                  ]}
                  onPress={() => handleToggleComplete(item)}
                >
                  <Text style={[styles.taskActionText, { color: item.completed ? colors.text : '#040711' }]}>
                    {item.completed ? 'MARK PENDING' : 'MARK COMPLETE'}
                  </Text>
                </Pressable>

                <Pressable onPress={() => handleDelete(item.id)} style={styles.deleteLink}>
                  <Text style={[styles.deleteLinkText, { color: colors.danger }]}>REMOVE</Text>
                </Pressable>
              </View>
            </MercedesCard>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 16,
  },
  hudLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  formCard: {
    padding: 16,
    marginBottom: 16,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 10,
  },
  templateScroll: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  templateChip: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  templateChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  input: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    marginBottom: 10,
  },
  subLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 6,
    marginTop: 4,
  },
  quickDateRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  quickChip: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
  },
  quickChipText: {
    fontSize: 11,
    fontWeight: '800',
  },
  alertOptionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  togglePill: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  toggleText: {
    fontSize: 10,
    fontWeight: '800',
  },
  daySelector: {
    flexDirection: 'row',
    gap: 4,
  },
  dayPill: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  dayPillText: {
    fontSize: 10,
    fontWeight: '800',
  },
  addButton: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  addButtonText: {
    color: '#040711',
    fontWeight: '900',
    fontSize: 13,
    letterSpacing: 1,
  },
  emptyCard: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
  },
  taskCard: {
    marginBottom: 10,
    padding: 16,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: '800',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  metaRow: {
    flexDirection: 'row',
    marginTop: 3,
  },
  metaLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  metaVal: {
    fontSize: 11,
    fontWeight: '600',
  },
  taskActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  taskActionButton: {
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  taskActionText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  deleteLink: {
    padding: 6,
  },
  deleteLinkText: {
    fontSize: 11,
    fontWeight: '800',
  },
});
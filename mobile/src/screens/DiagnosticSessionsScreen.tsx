import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, TextInput, FlatList, useColorScheme, ActivityIndicator, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { palette } from '../theme';
import { createDiagnosticSession, fetchDiagnosticSessions, fetchVehicles } from '../api/api';
import { DiagnosticSession, RootStackParamList, Vehicle } from '../types';
import MercedesAmbientLight from '../components/MercedesAmbientLight';
import MercedesCard from '../components/MercedesCard';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Diagnostics'>;
};

export default function DiagnosticSessionsScreen({ navigation }: Props) {
  const [sessions, setSessions] = useState<DiagnosticSession[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [name, setName] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const colors = palette(useColorScheme());

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [sessionsData, vehiclesData] = await Promise.all([fetchDiagnosticSessions(), fetchVehicles()]);
        setSessions(sessionsData || []);
        setVehicles(vehiclesData || []);
      } catch (error: any) {
        Alert.alert('Load Failure', error.message || 'Could not load diagnostic logbook.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleCreate = async () => {
    if (!name.trim()) {
      return Alert.alert('Session Name Needed', 'Enter a descriptive diagnostic session name.');
    }
    setCreating(true);
    try {
      const session = await createDiagnosticSession(name.trim(), selectedVehicle);
      setSessions((prev: DiagnosticSession[]) => [session as DiagnosticSession, ...prev]);
      setName('');
      setSelectedVehicle(undefined);
    } catch (error: any) {
      Alert.alert('Creation Failed', error.response?.data?.message || 'Could not record session.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <MercedesAmbientLight color={colors.primary} height={2} />

      <View style={styles.header}>
        <Text style={[styles.hudLabel, { color: colors.primary }]}>MBUX TELEMETRY BLACK BOX</Text>
        <Text style={[styles.title, { color: colors.text }]}>Diagnostic Sessions</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Troubleshoot symptoms and create certified mechanic summary reports.
        </Text>
      </View>

      <FlatList
        data={sessions}
        keyExtractor={(item: DiagnosticSession) => item.id.toString()}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <>
            {/* Create Session Card */}
            <MercedesCard colors={colors} highlightColor={colors.primary} style={styles.createCard}>
              <Text style={[styles.sectionHeading, { color: colors.primary }]}>INITIALIZE NEW DIAGNOSTIC SESSION</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surfaceElevated, color: colors.text, borderColor: colors.borderMuted }]}
                placeholder='Session title (e.g., Brake squeak after highway driving)'
                placeholderTextColor={colors.muted}
                value={name}
                onChangeText={setName}
              />

              {vehicles.length > 0 && (
                <View style={styles.vehicleRow}>
                  {vehicles.map((v) => {
                    const isSelected = selectedVehicle === v.id;
                    return (
                      <Pressable
                        key={v.id}
                        onPress={() => setSelectedVehicle(isSelected ? undefined : v.id)}
                        style={[
                          styles.vehicleChip,
                          {
                            backgroundColor: isSelected ? 'rgba(0, 242, 254, 0.2)' : colors.surfaceElevated,
                            borderColor: isSelected ? colors.primary : colors.borderMuted,
                          },
                        ]}
                      >
                        <Text style={[styles.vehicleText, { color: isSelected ? '#fff' : colors.textSecondary }]}>
                          🚘 {v.year} {v.make} {v.model}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              )}

              <Pressable
                style={[styles.createButton, { backgroundColor: colors.primary, shadowColor: colors.primary }]}
                onPress={handleCreate}
                disabled={creating}
              >
                {creating ? (
                  <ActivityIndicator color='#040711' />
                ) : (
                  <Text style={styles.createButtonText}>START DIAGNOSIS LOG</Text>
                )}
              </Pressable>
            </MercedesCard>

            <Text style={[styles.sectionHeading, { color: colors.text, marginTop: 12, marginBottom: 8 }]}>
              LOGGED SESSIONS ({sessions.length})
            </Text>
          </>
        }
        renderItem={({ item }: { item: DiagnosticSession }) => (
          <MercedesCard
            colors={colors}
            onPress={() => navigation.navigate('DiagnosticSession', { sessionId: item.id, sessionName: item.session_name })}
            highlightColor={colors.primary}
            style={styles.sessionCard}
          >
            <View style={styles.sessionTop}>
              <Text style={[styles.sessionName, { color: colors.text }]}>{item.session_name}</Text>
              <View style={[styles.statusTag, { borderColor: colors.primary }]}>
                <Text style={[styles.statusTagText, { color: colors.primary }]}>{item.status.toUpperCase()}</Text>
              </View>
            </View>
            <Text style={[styles.sessionDate, { color: colors.muted }]}>
              LAST UPDATED: {new Date(item.updated_at).toLocaleDateString()}
            </Text>
          </MercedesCard>
        )}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size='large' color={colors.primary} style={{ marginTop: 20 }} />
          ) : (
            <MercedesCard colors={colors} style={styles.emptyCard}>
              <Text style={[styles.emptyText, { color: colors.muted }]}>
                No diagnostic sessions logged. Start a session above or consult the MBUX AI Assistant.
              </Text>
            </MercedesCard>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 16, paddingBottom: 4 },
  hudLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 1.2, marginBottom: 4 },
  title: { fontSize: 24, fontWeight: '800', letterSpacing: 0.3 },
  subtitle: { fontSize: 13, lineHeight: 18, marginTop: 4 },
  content: { padding: 16, paddingBottom: 40 },
  createCard: { padding: 16, marginBottom: 16 },
  sectionHeading: { fontSize: 11, fontWeight: '800', letterSpacing: 1, marginBottom: 10 },
  input: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    marginBottom: 10,
  },
  vehicleRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  vehicleChip: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 7 },
  vehicleText: { fontSize: 11, fontWeight: '700' },
  createButton: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  createButtonText: { color: '#040711', fontWeight: '900', fontSize: 13, letterSpacing: 1 },
  sessionCard: { marginBottom: 10, padding: 16 },
  sessionTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  sessionName: { fontSize: 15, fontWeight: '800', flex: 1, marginRight: 8 },
  statusTag: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 },
  statusTagText: { fontSize: 9, fontWeight: '900', letterSpacing: 0.8 },
  sessionDate: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  emptyCard: { padding: 20, alignItems: 'center' },
  emptyText: { textAlign: 'center', fontSize: 13, lineHeight: 19 },
});

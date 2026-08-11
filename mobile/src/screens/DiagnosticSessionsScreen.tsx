import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, TextInput, FlatList, useColorScheme, ActivityIndicator, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { palette } from '../theme';
import { createDiagnosticSession, fetchDiagnosticSessions, fetchVehicles } from '../api/api';
import { DiagnosticSession, RootStackParamList, Vehicle } from '../types';

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
  const recentSessions = sessions.slice(0, 3);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [sessionsData, vehiclesData] = await Promise.all([fetchDiagnosticSessions(), fetchVehicles()]);
        setSessions(sessionsData);
        setVehicles(vehiclesData);
      } catch (error: any) {
        Alert.alert('Load failed', error.message || 'Could not load diagnostic sessions.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleCreate = async () => {
    if (!name.trim()) {
      return Alert.alert('Name required', 'Enter a session name to continue.');
    }
    setCreating(true);
    try {
      const session = await createDiagnosticSession(name.trim(), selectedVehicle);
      setSessions((prev: DiagnosticSession[]) => [session as DiagnosticSession, ...prev]);
      setName('');
      setSelectedVehicle(undefined);
    } catch (error: any) {
      Alert.alert('Create failed', error.response?.data?.message || 'Please try again.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Diagnostic sessions</Text>
      <Text style={[styles.subtitle, { color: colors.muted }]}>Keep a troubleshooting session, then generate a shareable mechanic summary.</Text>
      <View style={[styles.historyCard, { backgroundColor: colors.surface }]}> 
        <Text style={[styles.historyTitle, { color: colors.primary }]}>Follow-up history</Text>
        <Text style={[styles.historyMeta, { color: colors.muted }]}>Recent sessions: {sessions.length}</Text>
        {recentSessions.length > 0 ? (
          recentSessions.map((item: DiagnosticSession) => (
            <Text key={item.id} style={[styles.historyItem, { color: colors.text }]}>
              • {item.session_name} • {new Date(item.updated_at).toLocaleDateString()}
            </Text>
          ))
        ) : (
          <Text style={[styles.historyItem, { color: colors.muted }]}>No follow-up sessions yet.</Text>
        )}
      </View>
      <View style={[styles.card, { backgroundColor: colors.surface }]}> 
        <TextInput
          style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
          placeholder='Session name'
          placeholderTextColor={colors.muted}
          value={name}
          onChangeText={setName}
        />
        <Text style={[styles.label, { color: colors.muted }]}>Optional vehicle</Text>
        {vehicles.map((vehicle: Vehicle) => (
          <Pressable
            key={vehicle.id}
            onPress={() => setSelectedVehicle(vehicle.id)}
            style={[styles.vehicleOption, { backgroundColor: selectedVehicle === vehicle.id ? colors.primary : colors.background }]}
          >
            <Text style={{ color: selectedVehicle === vehicle.id ? '#fff' : colors.text }}>
              {vehicle.year} {vehicle.make} {vehicle.model}
            </Text>
          </Pressable>
        ))}
        <Pressable style={[styles.createButton, { backgroundColor: colors.primary }]} onPress={handleCreate} disabled={creating}>
          <Text style={styles.buttonText}>{creating ? 'Creating…' : 'Create session'}</Text>
        </Pressable>
      </View>
      {loading ? (
        <ActivityIndicator size='large' color={colors.primary} />
      ) : (
        <FlatList
          data={sessions}
          keyExtractor={(item: DiagnosticSession) => item.id.toString()}
          renderItem={({ item }: { item: DiagnosticSession }) => (
            <Pressable
              style={[styles.sessionCard, { backgroundColor: colors.surface }]}
              onPress={() => navigation.navigate('DiagnosticSession', { sessionId: item.id, sessionName: item.session_name })}
            >
              <Text style={[styles.sessionName, { color: colors.text }]}>{item.session_name}</Text>
              <Text style={[styles.sessionMeta, { color: colors.muted }]}>Status: {item.status} • Updated {new Date(item.updated_at).toLocaleDateString()}</Text>
            </Pressable>
          )}
          ListEmptyComponent={<Text style={[styles.emptyText, { color: colors.muted }]}>No diagnostic sessions yet.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 10 },
  subtitle: { fontSize: 16, marginBottom: 20, lineHeight: 22 },
  historyCard: { borderRadius: 18, padding: 18, marginBottom: 20 },
  historyTitle: { fontSize: 16, fontWeight: '700', marginBottom: 6 },
  historyMeta: { fontSize: 13, marginBottom: 10 },
  historyItem: { fontSize: 14, marginBottom: 6 },
  card: { borderRadius: 18, padding: 18, marginBottom: 20 },
  input: { borderRadius: 14, padding: 14, fontSize: 16, marginBottom: 14 },
  label: { fontSize: 14, marginBottom: 10 },
  vehicleOption: { borderRadius: 14, padding: 14, marginBottom: 10 },
  createButton: { borderRadius: 14, padding: 16, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '700' },
  sessionCard: { borderRadius: 18, padding: 18, marginBottom: 14 },
  sessionName: { fontSize: 18, fontWeight: '700' },
  sessionMeta: { marginTop: 8, fontSize: 14 },
  emptyText: { textAlign: 'center', marginTop: 24, fontSize: 16 }
});

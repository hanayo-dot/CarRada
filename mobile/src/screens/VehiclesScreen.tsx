import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, useColorScheme, ActivityIndicator } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { palette } from '../theme';
import { fetchVehicles } from '../api/api';
import { Vehicle, RootStackParamList } from '../types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Vehicles'>;
};

export default function VehiclesScreen({ navigation }: Props) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const scheme = useColorScheme();
  const colors = palette(scheme);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchVehicles();
        setVehicles(data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Your vehicles</Text>
        <Pressable style={[styles.addButton, { backgroundColor: colors.primary }]} onPress={() => navigation.navigate('VehicleEditor')}>
          <Text style={styles.addButtonText}>+ Add</Text>
        </Pressable>
      </View>
      {loading ? (
        <ActivityIndicator size='large' color={colors.primary} />
      ) : (
        <FlatList
          data={vehicles}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <Pressable style={[styles.card, { backgroundColor: colors.surface }]} onPress={() => navigation.navigate('VehicleEditor', { vehicleId: item.id })}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>{item.name}</Text>
              <Text style={[styles.cardSubtitle, { color: colors.muted }]}>{item.year} {item.make} {item.model}</Text>
            </Pressable>
          )}
          ListEmptyComponent={<Text style={[styles.emptyText, { color: colors.muted }]}>No vehicles yet. Add one to get started.</Text>}
          contentContainerStyle={vehicles.length === 0 ? styles.emptyContainer : undefined}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 28, fontWeight: '700' },
  addButton: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 14 },
  addButtonText: { color: '#fff', fontWeight: '700' },
  card: { borderRadius: 18, padding: 18, marginBottom: 16 },
  cardTitle: { fontSize: 18, fontWeight: '700' },
  cardSubtitle: { marginTop: 6, fontSize: 14 },
  emptyContainer: { flex: 1, justifyContent: 'center' },
  emptyText: { textAlign: 'center', marginTop: 20, fontSize: 16 }
});

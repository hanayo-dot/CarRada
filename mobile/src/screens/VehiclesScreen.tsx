import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, useColorScheme, ActivityIndicator } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { palette } from '../theme';
import { fetchVehicles } from '../api/api';
import { Vehicle, RootStackParamList } from '../types';
import MercedesAmbientLight from '../components/MercedesAmbientLight';
import MercedesCard from '../components/MercedesCard';
import MercedesDock, { DockTab } from '../components/MercedesDock';

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

  const handleDockSelect = (tab: DockTab) => {
    if (tab === 'Vehicles') return;
    if (tab === 'Home') navigation.navigate('Home');
    else if (tab === 'Chat') navigation.navigate('Chat');
    else if (tab === 'Diagnostics') navigation.navigate('SymptomDiagnostics');
    else if (tab === 'Emergencies') navigation.navigate('Emergencies');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <MercedesAmbientLight color={colors.primary} height={2} />

      <View style={styles.header}>
        <View>
          <Text style={[styles.hudLabel, { color: colors.primary }]}>VIRTUAL FLEET & TELEMETRY</Text>
          <Text style={[styles.title, { color: colors.text }]}>Garage Profiles</Text>
        </View>
        <Pressable
          style={[styles.addButton, { backgroundColor: colors.primary, shadowColor: colors.primary }]}
          onPress={() => navigation.navigate('VehicleEditor')}
        >
          <Text style={styles.addButtonText}>+ REGISTER CAR</Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.muted }]}>Reading OBD Telemetry...</Text>
        </View>
      ) : (
        <FlatList
          data={vehicles}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <MercedesCard
              colors={colors}
              onPress={() => navigation.navigate('VehicleEditor', { vehicleId: item.id })}
              highlightColor={colors.primary}
              glow={true}
              style={styles.card}
            >
              <View style={styles.cardTop}>
                <View style={[styles.iconBox, { borderColor: colors.primary, backgroundColor: 'rgba(0, 242, 254, 0.1)' }]}>
                  <Text style={styles.carIcon}>🚘</Text>
                </View>
                <View style={styles.cardTitleBox}>
                  <Text style={[styles.cardTitle, { color: colors.text }]}>{item.name}</Text>
                  <Text style={[styles.cardSubtitle, { color: colors.primary }]}>
                    {item.year} {item.make} {item.model}
                  </Text>
                </View>
                <View style={[styles.onlineTag, { borderColor: colors.success }]}>
                  <View style={[styles.greenDot, { backgroundColor: colors.success }]} />
                  <Text style={[styles.onlineText, { color: colors.success }]}>OBD LINKED</Text>
                </View>
              </View>

              <View style={[styles.telemetrySpecs, { borderColor: colors.borderMuted }]}>
                <View style={styles.specItem}>
                  <Text style={[styles.specLabel, { color: colors.muted }]}>VIN / ID</Text>
                  <Text style={[styles.specVal, { color: colors.textSecondary }]}>#{item.id.toString().padStart(4, '0')}</Text>
                </View>
                <View style={styles.specDivider} />
                <View style={styles.specItem}>
                  <Text style={[styles.specLabel, { color: colors.muted }]}>YEAR</Text>
                  <Text style={[styles.specVal, { color: colors.textSecondary }]}>{item.year}</Text>
                </View>
                <View style={styles.specDivider} />
                <View style={styles.specItem}>
                  <Text style={[styles.specLabel, { color: colors.muted }]}>STATUS</Text>
                  <Text style={[styles.specVal, { color: colors.success }]}>READY</Text>
                </View>
              </View>
            </MercedesCard>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🏎️</Text>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No Vehicles Registered</Text>
              <Text style={[styles.emptyText, { color: colors.muted }]}>
                Connect your first vehicle to enable custom diagnostic memory, roadside guides, and service schedules.
              </Text>
            </View>
          }
        />
      )}

      {/* Floating Bottom Dock */}
      <MercedesDock activeTab="Vehicles" onSelectTab={handleDockSelect} colors={colors} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 12,
  },
  hudLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  addButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    shadowOpacity: 0.7,
    shadowRadius: 10,
  },
  addButtonText: {
    color: '#040711',
    fontWeight: '900',
    fontSize: 11,
    letterSpacing: 0.8,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 13,
    marginTop: 10,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    marginBottom: 10,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  carIcon: {
    fontSize: 20,
  },
  cardTitleBox: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  cardSubtitle: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  onlineTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  greenDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  onlineText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  telemetrySpecs: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  specItem: {
    flex: 1,
    alignItems: 'center',
  },
  specLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  specVal: {
    fontSize: 12,
    fontWeight: '700',
  },
  specDivider: {
    width: 1,
    height: 18,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 30,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 19,
  },
});

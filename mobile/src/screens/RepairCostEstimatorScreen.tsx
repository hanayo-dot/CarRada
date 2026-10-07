import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, useColorScheme, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { palette } from '../theme';
import { fetchVehicles, estimateRepairCost } from '../api/api';
import { RootStackParamList, Vehicle } from '../types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import MercedesAmbientLight from '../components/MercedesAmbientLight';
import MercedesCard from '../components/MercedesCard';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'RepairCostEstimator'>;
};

export default function RepairCostEstimatorScreen({ navigation }: Props) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [description, setDescription] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [estimating, setEstimating] = useState(false);
  const [estimate, setEstimate] = useState<string>('');
  const [detail, setDetail] = useState<string>('');
  const [partsRange, setPartsRange] = useState<string>('');
  const [laborRange, setLaborRange] = useState<string>('');
  const colors = palette(useColorScheme());

  useEffect(() => {
    const loadVehicles = async () => {
      try {
        const vehiclesData = await fetchVehicles();
        setVehicles(vehiclesData || []);
      } catch (error: any) {
        Alert.alert('Telemetry Alert', error.response?.data?.message || 'Could not load vehicle profiles.');
      } finally {
        setLoading(false);
      }
    };
    loadVehicles();
  }, []);

  const handleEstimate = async () => {
    if (!description.trim()) {
      return Alert.alert('Description Needed', 'Specify the symptom, repair part, or service task to calculate.');
    }
    setEstimating(true);
    try {
      const result = await estimateRepairCost(description.trim(), selectedVehicle);
      setEstimate(result.estimate || 'Estimate generated');
      setDetail(result.explanation || result.detail || 'Cost projection completed based on regional automotive labor rates.');
      setPartsRange(result.partsRange || '');
      setLaborRange(result.laborRange || '');
    } catch (error: any) {
      Alert.alert('Calculation Failed', error.response?.data?.message || 'Service rate server unreachable.');
    } finally {
      setEstimating(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <MercedesAmbientLight color={colors.success} height={2} />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.hudLabel, { color: colors.success }]}>MBUX SERVICE ESTIMATOR</Text>
          <Text style={[styles.title, { color: colors.text }]}>Repair & Parts Pricing</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Transparent parts and labor cost projections before heading to the dealership or independent shop.
          </Text>
        </View>

        <MercedesCard colors={colors} highlightColor={colors.success} style={styles.card}>
          <Text style={[styles.sectionHeading, { color: colors.success }]}>REPAIR OR SYMPTOM DESCRIPTION</Text>
          <TextInput
            style={[styles.textArea, { backgroundColor: colors.surfaceElevated, color: colors.text, borderColor: colors.borderMuted }]}
            placeholder='e.g., Grinding noise when braking at low speeds, replace front brake pads and rotors...'
            placeholderTextColor={colors.muted}
            value={description}
            onChangeText={setDescription}
            multiline
          />

          {vehicles.length > 0 && (
            <>
              <Text style={[styles.subLabel, { color: colors.muted }]}>ATTACHED VEHICLE PROFILE</Text>
              {loading ? (
                <ActivityIndicator size='small' color={colors.primary} />
              ) : (
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
                            backgroundColor: isSelected ? 'rgba(0, 245, 160, 0.2)' : colors.surfaceElevated,
                            borderColor: isSelected ? colors.success : colors.borderMuted,
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
            </>
          )}

          <Pressable
            style={[styles.estimateButton, { backgroundColor: colors.success, shadowColor: colors.success }]}
            onPress={handleEstimate}
            disabled={estimating}
          >
            {estimating ? (
              <ActivityIndicator color='#040711' />
            ) : (
              <Text style={styles.estimateButtonText}>CALCULATE SERVICE ESTIMATE</Text>
            )}
          </Pressable>
        </MercedesCard>

        {estimate ? (
          <MercedesCard colors={colors} highlightColor={colors.success} glow={true} style={styles.resultCard}>
            <Text style={[styles.resultBadge, { color: colors.success }]}>ESTIMATED REGIONAL PRICE</Text>
            <Text style={[styles.estimatePrice, { color: colors.text }]}>{estimate}</Text>

            {(partsRange || laborRange) && (
              <View style={styles.breakdownRow}>
                {partsRange ? (
                  <View style={[styles.breakdownItem, { backgroundColor: colors.surfaceElevated, borderColor: colors.borderMuted }]}>
                    <Text style={[styles.breakdownLabel, { color: colors.muted }]}>PARTS ESTIMATE</Text>
                    <Text style={[styles.breakdownValue, { color: colors.text }]}>{partsRange}</Text>
                  </View>
                ) : null}
                {laborRange ? (
                  <View style={[styles.breakdownItem, { backgroundColor: colors.surfaceElevated, borderColor: colors.borderMuted }]}>
                    <Text style={[styles.breakdownLabel, { color: colors.muted }]}>LABOR ESTIMATE</Text>
                    <Text style={[styles.breakdownValue, { color: colors.text }]}>{laborRange}</Text>
                  </View>
                ) : null}
              </View>
            )}

            <Text style={[styles.sectionHeading, { color: colors.muted, marginTop: 14 }]}>RATE FACTORS & GUIDANCE</Text>
            <Text style={[styles.detailText, { color: colors.textSecondary }]}>{detail}</Text>
          </MercedesCard>
        ) : null}
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
  card: {
    padding: 16,
    marginBottom: 16,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 8,
  },
  textArea: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    minHeight: 100,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  subLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  vehicleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  vehicleChip: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  vehicleText: {
    fontSize: 11,
    fontWeight: '700',
  },
  estimateButton: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  estimateButtonText: {
    color: '#040711',
    fontWeight: '900',
    fontSize: 13,
    letterSpacing: 1,
  },
  resultCard: {
    padding: 18,
  },
  resultBadge: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  estimatePrice: {
    fontSize: 32,
    fontWeight: '900',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  breakdownRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  breakdownItem: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
  },
  breakdownLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  breakdownValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  detailText: {
    fontSize: 13,
    lineHeight: 19,
  },
});

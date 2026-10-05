import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, useColorScheme, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { palette } from '../theme';
import { fetchVehicles, estimateRepairCost } from '../api/api';
import { RootStackParamList, Vehicle } from '../types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

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
        Alert.alert('Load failed', error.response?.data?.message || 'Could not load vehicles.');
      } finally {
        setLoading(false);
      }
    };
    loadVehicles();
  }, []);

  const handleEstimate = async () => {
    if (!description.trim()) {
      return Alert.alert('Describe the issue', 'Enter a short description of the repair or symptom.');
    }
    setEstimating(true);
    try {
      const result = await estimateRepairCost(description.trim(), selectedVehicle);
      setEstimate(result.estimate || 'Estimate generated');
      setDetail(result.explanation || result.detail || 'No further details returned.');
      setPartsRange(result.partsRange || '');
      setLaborRange(result.laborRange || '');
    } catch (error: any) {
      Alert.alert('Estimate failed', error.response?.data?.message || 'Try again later.');
    } finally {
      setEstimating(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <Text style={[styles.title, { color: colors.text }]}>Repair cost estimator</Text>
      <Text style={[styles.subtitle, { color: colors.muted }]}>
        Describe the issue or symptoms and get a realistic price breakdown before going to a mechanic.
      </Text>

      <View style={[styles.card, { backgroundColor: colors.surface }]}> 
        <TextInput
          style={[styles.textArea, { backgroundColor: colors.background, color: colors.text }]}
          placeholder='Example: grinding noise when braking at low speeds, or oil leak under front bumper'
          placeholderTextColor={colors.muted}
          value={description}
          onChangeText={setDescription}
          multiline
        />

        {vehicles.length > 0 && (
          <>
            <Text style={[styles.label, { color: colors.muted }]}>Select vehicle (optional)</Text>
            {loading ? (
              <ActivityIndicator size='small' color={colors.primary} />
            ) : (
              <View style={styles.vehicleRow}>
                {vehicles.map((vehicle) => {
                  const isSelected = selectedVehicle === vehicle.id;
                  return (
                    <Pressable
                      key={vehicle.id}
                      onPress={() => setSelectedVehicle(isSelected ? undefined : vehicle.id)}
                      style={[
                        styles.vehicleOption,
                        {
                          backgroundColor: isSelected ? colors.primary : colors.background,
                          borderColor: isSelected ? colors.primary : colors.surface,
                          borderWidth: 1
                        }
                      ]}
                    >
                      <Text style={{ color: isSelected ? '#fff' : colors.text, fontWeight: isSelected ? '700' : '400' }}>
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </>
        )}

        <Pressable
          style={[styles.estimateButton, { backgroundColor: colors.primary }]}
          onPress={handleEstimate}
          disabled={estimating}
        >
          {estimating ? (
            <ActivityIndicator color='#fff' />
          ) : (
            <Text style={styles.buttonText}>Get estimate range</Text>
          )}
        </Pressable>
      </View>

      {estimate ? (
        <View style={[styles.resultCard, { backgroundColor: colors.surface }]}> 
          <Text style={[styles.resultBadge, { color: colors.primary }]}>ESTIMATED RANGE</Text>
          <Text style={[styles.estimatePrice, { color: colors.text }]}>{estimate}</Text>

          {(partsRange || laborRange) && (
            <View style={styles.breakdownRow}>
              {partsRange ? (
                <View style={[styles.breakdownItem, { backgroundColor: colors.background }]}>
                  <Text style={[styles.breakdownLabel, { color: colors.muted }]}>Parts Estimate</Text>
                  <Text style={[styles.breakdownValue, { color: colors.text }]}>{partsRange}</Text>
                </View>
              ) : null}
              {laborRange ? (
                <View style={[styles.breakdownItem, { backgroundColor: colors.background }]}>
                  <Text style={[styles.breakdownLabel, { color: colors.muted }]}>Labor Estimate</Text>
                  <Text style={[styles.breakdownValue, { color: colors.text }]}>{laborRange}</Text>
                </View>
              ) : null}
            </View>
          )}

          <Text style={[styles.resultLabel, { color: colors.muted, marginTop: 16 }]}>What influences this price</Text>
          <Text style={[styles.resultText, { color: colors.text }]}>{detail}</Text>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 16, marginBottom: 18, lineHeight: 22 },
  card: { borderRadius: 18, padding: 18, marginBottom: 20 },
  textArea: { borderRadius: 16, padding: 16, minHeight: 120, fontSize: 15, marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 10 },
  vehicleRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  vehicleOption: { borderRadius: 12, paddingVertical: 10, paddingHorizontal: 14 },
  estimateButton: { borderRadius: 14, padding: 16, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  resultCard: { borderRadius: 18, padding: 20, marginBottom: 20 },
  resultBadge: { fontSize: 12, fontWeight: '800', letterSpacing: 1, marginBottom: 4 },
  estimatePrice: { fontSize: 28, fontWeight: '800', marginBottom: 12 },
  breakdownRow: { flexDirection: 'row', gap: 12, marginVertical: 8 },
  breakdownItem: { flex: 1, borderRadius: 12, padding: 12 },
  breakdownLabel: { fontSize: 12, marginBottom: 4 },
  breakdownValue: { fontSize: 15, fontWeight: '700' },
  resultLabel: { fontSize: 13, fontWeight: '700', marginBottom: 6 },
  resultText: { fontSize: 15, lineHeight: 22 }
});

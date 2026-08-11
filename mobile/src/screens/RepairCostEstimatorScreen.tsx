import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, useColorScheme, FlatList, ActivityIndicator, Alert } from 'react-native';
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
  const colors = palette(useColorScheme());

  useEffect(() => {
    const loadVehicles = async () => {
      try {
        const vehiclesData = await fetchVehicles();
        setVehicles(vehiclesData);
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
      setEstimate(result.estimate);
      setDetail(result.explanation || result.detail || 'No details returned.');
    } catch (error: any) {
      Alert.alert('Estimate failed', error.response?.data?.message || 'Try again later.');
    } finally {
      setEstimating(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      <Text style={[styles.title, { color: colors.text }]}>Repair cost estimator</Text>
      <Text style={[styles.subtitle, { color: colors.muted }]}>Enter the issue and get a likely repair cost range.</Text>
      <View style={[styles.card, { backgroundColor: colors.surface }]}> 
        <TextInput
          style={[styles.textArea, { backgroundColor: colors.background, color: colors.text }]}
          placeholder='Example: knocking noise when accelerating, check engine light on'
          placeholderTextColor={colors.muted}
          value={description}
          onChangeText={setDescription}
          multiline
        />
        <Text style={[styles.label, { color: colors.muted }]}>Optional vehicle</Text>
        {loading ? (
          <ActivityIndicator size='small' color={colors.primary} />
        ) : (
          vehicles.map((vehicle) => (
            <Pressable
              key={vehicle.id}
              onPress={() => setSelectedVehicle(vehicle.id)}
              style={[styles.vehicleOption, { backgroundColor: selectedVehicle === vehicle.id ? colors.primary : colors.background }]}
            >
              <Text style={{ color: selectedVehicle === vehicle.id ? '#fff' : colors.text }}>
                {vehicle.year} {vehicle.make} {vehicle.model}
              </Text>
            </Pressable>
          ))
        )}
        <Pressable style={[styles.estimateButton, { backgroundColor: colors.primary }]} onPress={handleEstimate} disabled={estimating}>
          <Text style={styles.buttonText}>{estimating ? 'Estimating…' : 'Get estimate'}</Text>
        </Pressable>
      </View>
      {estimate ? (
        <View style={[styles.resultCard, { backgroundColor: colors.surface }]}> 
          <Text style={[styles.resultLabel, { color: colors.primary }]}>Estimate</Text>
          <Text style={[styles.resultText, { color: colors.text }]}>{estimate}</Text>
          <Text style={[styles.resultLabel, { color: colors.muted, marginTop: 14 }]}>Details</Text>
          <Text style={[styles.resultText, { color: colors.text }]}>{detail}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 16, marginBottom: 18, lineHeight: 22 },
  card: { borderRadius: 18, padding: 18, marginBottom: 20 },
  textArea: { borderRadius: 16, padding: 16, minHeight: 120, fontSize: 15, marginBottom: 16 },
  label: { fontSize: 14, marginBottom: 10 },
  vehicleOption: { borderRadius: 14, padding: 14, marginBottom: 10 },
  estimateButton: { borderRadius: 14, padding: 16, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '700' },
  resultCard: { borderRadius: 18, padding: 18 },
  resultLabel: { fontSize: 14, fontWeight: '700', marginBottom: 8 },
  resultText: { fontSize: 15, lineHeight: 22 }
});

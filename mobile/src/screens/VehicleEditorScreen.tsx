import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, useColorScheme, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { palette } from '../theme';
import { createVehicle, fetchVehicles, updateVehicle, deleteVehicle } from '../api/api';
import { RootStackParamList, Vehicle } from '../types';
import MercedesAmbientLight from '../components/MercedesAmbientLight';
import MercedesCard from '../components/MercedesCard';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'VehicleEditor'>;
  route: RouteProp<RootStackParamList, 'VehicleEditor'>;
};

const essentialFields = ['name', 'make', 'model', 'year'];
const optionalFields = ['trim', 'engine', 'fuel_type', 'transmission', 'mileage', 'vin'];

const fieldLabels: Record<string, string> = {
  name: 'Vehicle Nickname (e.g., "Silver Arrow / E350")',
  make: 'Make (e.g. Mercedes-Benz, BMW, Toyota)',
  model: 'Model (e.g. C300, Civic, RAV4)',
  year: 'Model Year (e.g. 2024)',
  trim: 'Trim / Edition (optional)',
  engine: 'Engine displacement (e.g. 2.0L Turbo)',
  fuel_type: 'Powertrain (Gas, Hybrid, EV)',
  transmission: 'Transmission (e.g. 9G-TRONIC, 8-Speed)',
  mileage: 'Odometer Mileage',
  vin: 'VIN Telemetry Code (17 digits)'
};

export default function VehicleEditorScreen({ navigation, route }: Props) {
  const [vehicle, setVehicle] = useState<Partial<Vehicle>>({ name: '', make: '', model: '', year: new Date().getFullYear() });
  const [loading, setLoading] = useState(false);
  const vehicleId = route.params?.vehicleId;
  const isEditing = !!vehicleId;
  const scheme = useColorScheme();
  const colors = palette(scheme);

  useEffect(() => {
    const load = async () => {
      if (!isEditing || !vehicleId) return;
      setLoading(true);
      try {
        const data = await fetchVehicles();
        const found = data.find((item: Vehicle) => item.id === vehicleId);
        if (found) setVehicle(found);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [vehicleId, isEditing]);

  const handleSave = async () => {
    if (!vehicle.name || !vehicle.make || !vehicle.model || !vehicle.year) {
      return Alert.alert('Telemetry Incomplete', 'Nickname, make, model, and year are required.');
    }
    setLoading(true);
    try {
      if (isEditing && vehicleId) {
        await updateVehicle(vehicleId, vehicle);
      } else {
        await createVehicle(vehicle);
      }
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Save Failed', error.response?.data?.message || 'Please check input data.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!vehicleId) return;
    Alert.alert('De-register Vehicle?', 'This will permanently remove telemetry history for this vehicle.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'De-register',
        style: 'destructive',
        onPress: async () => {
          setLoading(true);
          try {
            await deleteVehicle(vehicleId);
            navigation.goBack();
          } catch (error: any) {
            Alert.alert('Delete failed', error.response?.data?.message || 'Please try again.');
            setLoading(false);
          }
        }
      }
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <MercedesAmbientLight color={colors.primary} height={2} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.hudLabel, { color: colors.primary }]}>MBUX TELEMETRY PROFILER</Text>
          <Text style={[styles.title, { color: colors.text }]}>
            {isEditing ? 'Configure Vehicle' : 'Register New Car'}
          </Text>
        </View>

        {loading && !isEditing ? (
          <ActivityIndicator size='large' color={colors.primary} style={{ marginTop: 40 }} />
        ) : (
          <>
            <MercedesCard colors={colors} style={styles.sectionCard} highlightColor={colors.primary}>
              <Text style={[styles.sectionHeading, { color: colors.primary }]}>ESSENTIAL SPECIFICATIONS</Text>
              {essentialFields.map((field) => (
                <View key={field} style={styles.inputWrap}>
                  <Text style={[styles.inputLabel, { color: colors.muted }]}>{fieldLabels[field]}</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.surfaceElevated, color: colors.text, borderColor: colors.borderMuted }]}
                    placeholder={fieldLabels[field]}
                    placeholderTextColor={colors.muted}
                    value={vehicle[field as keyof Vehicle]?.toString() ?? ''}
                    onChangeText={(value) => setVehicle((prev) => ({ ...prev, [field]: field === 'year' ? Number(value) : value }))}
                    keyboardType={field === 'year' ? 'numeric' : 'default'}
                  />
                </View>
              ))}
            </MercedesCard>

            <MercedesCard colors={colors} style={styles.sectionCard}>
              <Text style={[styles.sectionHeading, { color: colors.secondary }]}>ENGINE & CHASSIS TELEMETRY</Text>
              {optionalFields.map((field) => (
                <View key={field} style={styles.inputWrap}>
                  <Text style={[styles.inputLabel, { color: colors.muted }]}>{fieldLabels[field]}</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.surfaceElevated, color: colors.text, borderColor: colors.borderMuted }]}
                    placeholder={fieldLabels[field]}
                    placeholderTextColor={colors.muted}
                    value={vehicle[field as keyof Vehicle]?.toString() ?? ''}
                    onChangeText={(value) => setVehicle((prev) => ({ ...prev, [field]: field === 'mileage' ? Number(value) : value }))}
                    keyboardType={field === 'mileage' ? 'numeric' : 'default'}
                  />
                </View>
              ))}
            </MercedesCard>

            <Pressable
              style={[styles.saveButton, { backgroundColor: colors.primary, shadowColor: colors.primary }]}
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color='#000' />
              ) : (
                <Text style={styles.saveButtonText}>CONFIRM & SAVE TO GARAGE</Text>
              )}
            </Pressable>

            {isEditing && (
              <Pressable
                style={[styles.deleteButton, { borderColor: colors.danger, backgroundColor: 'rgba(255, 56, 92, 0.1)' }]}
                onPress={handleDelete}
                disabled={loading}
              >
                <Text style={[styles.deleteButtonText, { color: colors.danger }]}>DE-REGISTER VEHICLE</Text>
              </Pressable>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
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
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  sectionCard: {
    marginBottom: 16,
    padding: 16,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 12,
  },
  inputWrap: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  input: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  saveButton: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  saveButtonText: {
    color: '#040711',
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 1,
  },
  deleteButton: {
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1,
  },
  deleteButtonText: {
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 0.8,
  },
});

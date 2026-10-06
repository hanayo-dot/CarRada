import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, useColorScheme, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { palette } from '../theme';
import { createVehicle, fetchVehicles, updateVehicle, deleteVehicle } from '../api/api';
import { RootStackParamList, Vehicle } from '../types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'VehicleEditor'>;
  route: RouteProp<RootStackParamList, 'VehicleEditor'>;
};

const essentialFields = ['name', 'make', 'model', 'year'];
const optionalFields = ['trim', 'engine', 'fuel_type', 'transmission', 'mileage', 'vin'];

const fieldLabels: Record<string, string> = {
  name: 'Nickname (e.g., "My Honda")',
  make: 'Make',
  model: 'Model',
  year: 'Year',
  trim: 'Trim (optional)',
  engine: 'Engine (optional)',
  fuel_type: 'Fuel type (optional)',
  transmission: 'Transmission (optional)',
  mileage: 'Mileage (optional)',
  vin: 'VIN (optional)'
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
      return Alert.alert('Missing info', 'Nickname, make, model, and year are required.');
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
      Alert.alert('Save failed', error.response?.data?.message || 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!vehicleId) return;
    Alert.alert('Delete vehicle?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
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
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: colors.text }]}>{isEditing ? 'Edit vehicle' : 'Add vehicle'}</Text>
        {loading && !isEditing ? (
          <ActivityIndicator size='large' color={colors.primary} />
        ) : (
          <>
            <Text style={[styles.sectionLabel, { color: colors.muted }]}>Essential</Text>
            {essentialFields.map((field) => (
              <TextInput
                key={field}
                style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
                placeholder={fieldLabels[field]}
                placeholderTextColor={colors.muted}
                value={vehicle[field as keyof Vehicle]?.toString() ?? ''}
                onChangeText={(value) => setVehicle((prev) => ({ ...prev, [field]: field === 'year' ? Number(value) : value }))}
                keyboardType={field === 'year' ? 'numeric' : 'default'}
              />
            ))}

            <Text style={[styles.sectionLabel, { color: colors.muted, marginTop: 20 }]}>Optional details</Text>
            {optionalFields.map((field) => (
              <TextInput
                key={field}
                style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
                placeholder={fieldLabels[field]}
                placeholderTextColor={colors.muted}
                value={vehicle[field as keyof Vehicle]?.toString() ?? ''}
                onChangeText={(value) => setVehicle((prev) => ({ ...prev, [field]: field === 'mileage' ? Number(value) : value }))}
                keyboardType={field === 'mileage' ? 'numeric' : 'default'}
              />
            ))}

            <Pressable style={[styles.button, { backgroundColor: colors.primary }]} onPress={handleSave} disabled={loading}>
              {loading ? <ActivityIndicator color='#fff' /> : <Text style={styles.buttonText}>Save vehicle</Text>}
            </Pressable>

            {isEditing && (
              <Pressable style={[styles.deleteButton, { borderColor: '#EF4444' }]} onPress={handleDelete} disabled={loading}>
                <Text style={styles.deleteText}>Delete vehicle</Text>
              </Pressable>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 18 },
  sectionLabel: { fontSize: 13, fontWeight: '700', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { borderRadius: 14, padding: 16, fontSize: 16, marginBottom: 12 },
  button: { borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 20 },
  buttonText: { color: '#fff', fontWeight: '700' },
  deleteButton: { borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 12, borderWidth: 1 },
  deleteText: { color: '#EF4444', fontWeight: '700' }
});

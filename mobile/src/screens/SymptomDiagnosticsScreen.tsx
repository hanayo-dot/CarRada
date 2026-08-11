import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, useColorScheme, ScrollView, Alert } from 'react-native';
import { palette } from '../theme';
import { fetchVehicles, sendChat, createDiagnosticSession } from '../api/api';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, Vehicle } from '../types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'SymptomDiagnostics'>;
};

const soundOptions = ['Knocking', 'Squealing', 'Grinding', 'Humming', 'Clicking', 'Rattling', 'No sound'];
const locationOptions = ['Engine', 'Brakes', 'Tires', 'Exhaust', 'Interior', 'Undercarriage', 'Unknown'];
const conditionOptions = ['Startup', 'Accelerating', 'Braking', 'Idling', 'Turning', 'Cruising', 'Everywhere'];

export default function SymptomDiagnosticsScreen({ navigation }: Props) {
  const scheme = useColorScheme();
  const colors = palette(scheme);
  const [description, setDescription] = useState('');
  const [sound, setSound] = useState<string>('No sound');
  const [location, setLocation] = useState<string>('Unknown');
  const [condition, setCondition] = useState<string>('Unknown');
  const [urgency, setUrgency] = useState<string>('Cautious');
  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<number | undefined>(undefined);

  useEffect(() => {
    const loadVehicles = async () => {
      try {
        const vehiclesData = await fetchVehicles();
        setVehicles(vehiclesData);
      } catch (error: any) {
        Alert.alert('Load failed', error.response?.data?.message || 'Could not load vehicles.');
      }
    };
    loadVehicles();
  }, []);

  const buildMessage = () => {
    return `Symptom diagnostic request:\n- Description: ${description.trim()}\n- Sound: ${sound}\n- Location: ${location}\n- When it happens: ${condition}\n- Urgency: ${urgency}`;
  };

  const handleSubmit = async () => {
    if (!description.trim()) {
      return Alert.alert('Tell us more', 'Describe what you are feeling, hearing, or seeing.');
    }

    setLoading(true);
    try {
      const sessionName = `Symptom check - ${new Date().toLocaleDateString()}`;
      const session = await createDiagnosticSession(sessionName, selectedVehicle);
      const messageText = buildMessage();
      const result = await sendChat([{ role: 'user', message: messageText }], selectedVehicle, session.id);
      if (result.safety?.alert) {
        Alert.alert('Safety warning', result.safety.message);
      } else {
        Alert.alert('Diagnostic saved', 'Symptoms were saved to a diagnostic session and sent to the assistant.');
        navigation.goBack();
      }
    } catch (error: any) {
      Alert.alert('Submit failed', error.response?.data?.message || 'Try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderOptions = (options: string[], selected: string, setter: (value: string) => void) => (
    <View style={styles.optionRow}>
      {options.map((option) => (
        <Pressable
          key={option}
          onPress={() => setter(option)}
          style={[
            styles.optionButton,
            { backgroundColor: selected === option ? colors.primary : colors.surface }
          ]}
        >
          <Text style={{ color: selected === option ? '#fff' : colors.text, fontSize: 13 }}>{option}</Text>
        </Pressable>
      ))}
    </View>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <Text style={[styles.title, { color: colors.text }]}>Symptom diagnostics</Text>
      <Text style={[styles.subtitle, { color: colors.muted }]}>Tell us what you hear, feel, or see, and get a symptom-informed assistant response.</Text>

      <Text style={[styles.label, { color: colors.muted }]}>What are you experiencing?</Text>
      <TextInput
        style={[styles.textArea, { backgroundColor: colors.surface, color: colors.text }]}
        placeholder='Describe the symptom in plain English'
        placeholderTextColor={colors.muted}
        value={description}
        onChangeText={setDescription}
        multiline
      />

      {vehicles.length > 0 ? (
        <>
          <Text style={[styles.label, { color: colors.muted }]}>Attach to vehicle</Text>
          <View style={styles.optionRow}>
            {vehicles.map((vehicle) => (
              <Pressable
                key={vehicle.id}
                onPress={() => setSelectedVehicle(vehicle.id)}
                style={[
                  styles.optionButton,
                  { backgroundColor: selectedVehicle === vehicle.id ? colors.primary : colors.surface }
                ]}
              >
                <Text style={{ color: selectedVehicle === vehicle.id ? '#fff' : colors.text, fontSize: 13 }}>
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </Text>
              </Pressable>
            ))}
          </View>
        </>
      ) : null}

      <Text style={[styles.label, { color: colors.muted }]}>Sound type</Text>
      {renderOptions(soundOptions, sound, setSound)}
      <Text style={[styles.label, { color: colors.muted, marginTop: 20 }]}>Location</Text>
      {renderOptions(locationOptions, location, setLocation)}
      <Text style={[styles.label, { color: colors.muted, marginTop: 20 }]}>When it happens</Text>
      {renderOptions(conditionOptions, condition, setCondition)}
      <Text style={[styles.label, { color: colors.muted, marginTop: 20 }]}>How urgent does it feel?</Text>
      <View style={styles.optionRow}>
        {['Cautious', 'Concerned', 'Panic'].map((option) => (
          <Pressable
            key={option}
            onPress={() => setUrgency(option)}
            style={[
              styles.optionButton,
              { backgroundColor: urgency === option ? colors.primary : colors.surface }
            ]}
          >
            <Text style={{ color: urgency === option ? '#fff' : colors.text, fontSize: 13 }}>{option}</Text>
          </Pressable>
        ))}
      </View>

      <Pressable style={[styles.submitButton, { backgroundColor: colors.primary }]} onPress={handleSubmit} disabled={loading}>
        {loading ? <Text style={styles.submitText}>Sending…</Text> : <Text style={styles.submitText}>Submit symptom</Text>}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 16, lineHeight: 22, marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '700', marginBottom: 10 },
  textArea: { borderRadius: 18, padding: 16, minHeight: 140, fontSize: 15, marginBottom: 20 },
  optionRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 },
  optionButton: { borderRadius: 14, paddingVertical: 10, paddingHorizontal: 14, marginRight: 10, marginBottom: 10 },
  submitButton: { borderRadius: 18, padding: 18, alignItems: 'center', marginTop: 20 },
  submitText: { color: '#fff', fontWeight: '700' }
});
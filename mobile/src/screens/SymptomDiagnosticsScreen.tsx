import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, useColorScheme, ScrollView, Alert, Animated } from 'react-native';
import { palette } from '../theme';
import { fetchVehicles, sendChat, createDiagnosticSession } from '../api/api';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, Vehicle } from '../types';
import MercedesAmbientLight from '../components/MercedesAmbientLight';
import MercedesCard from '../components/MercedesCard';
import MercedesDock, { DockTab } from '../components/MercedesDock';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'SymptomDiagnostics'>;
};

const soundOptions = ['Knocking', 'Squealing', 'Grinding', 'Humming', 'Clicking', 'Rattling', 'No sound'];
const locationOptions = ['Engine', 'Brakes', 'Tires', 'Exhaust', 'Transmission', 'Undercarriage', 'Electronics'];
const conditionOptions = ['Startup', 'Accelerating', 'Braking', 'Idling', 'Turning', 'High Speed', 'Constant'];
const urgencyLevels = ['Cautious (Normal)', 'Concerned (Warning)', 'Critical (Immediate)'];

export default function SymptomDiagnosticsScreen({ navigation }: Props) {
  const scheme = useColorScheme();
  const colors = palette(scheme);
  const [description, setDescription] = useState('');
  const [sound, setSound] = useState<string>('No sound');
  const [location, setLocation] = useState<string>('Engine');
  const [condition, setCondition] = useState<string>('Startup');
  const [urgency, setUrgency] = useState<string>('Concerned (Warning)');
  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<number | undefined>(undefined);
  const radarAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const radarLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(radarAnim, {
          toValue: 1.1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(radarAnim, {
          toValue: 0.95,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );
    radarLoop.start();

    const loadVehicles = async () => {
      try {
        const vehiclesData = await fetchVehicles();
        setVehicles(vehiclesData || []);
      } catch (error: any) {
        Alert.alert('Telemetry Alert', error.response?.data?.message || 'Could not load vehicle profiles.');
      }
    };
    loadVehicles();

    return () => radarLoop.stop();
  }, [radarAnim]);

  const buildMessage = () => {
    return `Symptom diagnostic request:\n- Description: ${description.trim()}\n- Sound: ${sound}\n- Location: ${location}\n- When it happens: ${condition}\n- Urgency: ${urgency}`;
  };

  const handleSubmit = async () => {
    if (!description.trim()) {
      return Alert.alert('Sensor Data Needed', 'Please describe the symptom, sound, or feeling in plain words.');
    }

    setLoading(true);
    try {
      const sessionName = `Symptom Scan: ${location} - ${new Date().toLocaleDateString()}`;
      const session = await createDiagnosticSession(sessionName, selectedVehicle);
      const messageText = buildMessage();
      const result = await sendChat([{ role: 'user', message: messageText }], selectedVehicle, session.id);
      if (result.safety?.alert) {
        Alert.alert('Critical Safety Warning', result.safety.message, [
          {
            text: 'Examine Diagnostic Report',
            onPress: () => navigation.navigate('DiagnosticSession', { sessionId: session.id, sessionName }),
          },
        ]);
      } else {
        navigation.navigate('DiagnosticSession', { sessionId: session.id, sessionName });
      }
    } catch (error: any) {
      Alert.alert('Scan Failed', error.response?.data?.message || 'Telemetry connection failed. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  const handleDockSelect = (tab: DockTab) => {
    if (tab === 'Diagnostics') return;
    if (tab === 'Home') navigation.navigate('Home');
    else if (tab === 'Chat') navigation.navigate('Chat');
    else if (tab === 'Vehicles') navigation.navigate('Vehicles');
    else if (tab === 'Emergencies') navigation.navigate('Emergencies');
  };

  const renderChips = (options: string[], current: string, setter: (val: string) => void) => (
    <View style={styles.chipGrid}>
      {options.map((opt) => {
        const isSelected = current === opt;
        return (
          <Pressable
            key={opt}
            onPress={() => setter(opt)}
            style={[
              styles.chip,
              {
                backgroundColor: isSelected ? 'rgba(0, 242, 254, 0.18)' : colors.surfaceElevated,
                borderColor: isSelected ? colors.primary : colors.borderMuted,
              },
            ]}
          >
            <View style={[styles.chipDot, { backgroundColor: isSelected ? colors.primary : colors.muted }]} />
            <Text
              style={[
                styles.chipText,
                {
                  color: isSelected ? '#fff' : colors.textSecondary,
                  fontWeight: isSelected ? '800' : '500',
                },
              ]}
            >
              {opt}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <MercedesAmbientLight color={colors.warning} height={2} />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Radar Banner */}
        <View style={[styles.radarBanner, { backgroundColor: colors.surfaceGlass, borderColor: colors.warning }]}>
          <Animated.View style={[styles.radarDisc, { transform: [{ scale: radarAnim }] }]}>
            <Text style={styles.radarIcon}>🔍</Text>
          </Animated.View>
          <View style={styles.radarMeta}>
            <Text style={[styles.hudLabel, { color: colors.warning }]}>MBUX DIAGNOSTIC RADAR</Text>
            <Text style={[styles.radarTitle, { color: colors.text }]}>Telemetry Symptom Scanner</Text>
            <Text style={[styles.radarSub, { color: colors.textSecondary }]}>
              Isolate mechanical sounds, vibration frequency, and vehicle sub-assemblies.
            </Text>
          </View>
        </View>

        {/* Primary Symptom Description Input */}
        <MercedesCard colors={colors} highlightColor={colors.warning} style={styles.card}>
          <Text style={[styles.sectionHeading, { color: colors.warning }]}>DESCRIBE WHAT YOU EXPERIENCE</Text>
          <TextInput
            style={[styles.textArea, { backgroundColor: colors.surfaceElevated, color: colors.text, borderColor: colors.borderMuted }]}
            placeholder='e.g., High-pitched squeal when pressing brakes lightly at stop signs, disappears when wet...'
            placeholderTextColor={colors.muted}
            value={description}
            onChangeText={setDescription}
            multiline
          />
        </MercedesCard>

        {/* Vehicle Selection */}
        {vehicles.length > 0 && (
          <MercedesCard colors={colors} style={styles.card}>
            <Text style={[styles.sectionHeading, { color: colors.primary }]}>ASSIGN TO GARAGE VEHICLE</Text>
            <View style={styles.chipGrid}>
              {vehicles.map((v) => {
                const isSelected = selectedVehicle === v.id;
                return (
                  <Pressable
                    key={v.id}
                    onPress={() => setSelectedVehicle(isSelected ? undefined : v.id)}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: isSelected ? 'rgba(0, 242, 254, 0.2)' : colors.surfaceElevated,
                        borderColor: isSelected ? colors.primary : colors.borderMuted,
                      },
                    ]}
                  >
                    <Text style={[styles.chipText, { color: isSelected ? '#fff' : colors.textSecondary }]}>
                      🚘 {v.year} {v.make} {v.model}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </MercedesCard>
        )}

        {/* Subsystem Location */}
        <MercedesCard colors={colors} style={styles.card}>
          <Text style={[styles.sectionHeading, { color: colors.primary }]}>PHYSICAL LOCATION</Text>
          {renderChips(locationOptions, location, setLocation)}
        </MercedesCard>

        {/* Acoustic Sound Type */}
        <MercedesCard colors={colors} style={styles.card}>
          <Text style={[styles.sectionHeading, { color: colors.primary }]}>ACOUSTIC PATTERN</Text>
          {renderChips(soundOptions, sound, setSound)}
        </MercedesCard>

        {/* Trigger Condition */}
        <MercedesCard colors={colors} style={styles.card}>
          <Text style={[styles.sectionHeading, { color: colors.primary }]}>DRIVE CONDITION TRIGGER</Text>
          {renderChips(conditionOptions, condition, setCondition)}
        </MercedesCard>

        {/* Severity */}
        <MercedesCard colors={colors} style={styles.card}>
          <Text style={[styles.sectionHeading, { color: colors.warning }]}>PERCEIVED SEVERITY</Text>
          {renderChips(urgencyLevels, urgency, setUrgency)}
        </MercedesCard>

        {/* Submit Button */}
        <Pressable
          style={[styles.submitButton, { backgroundColor: colors.primary, shadowColor: colors.primary }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitText}>
            {loading ? 'ENGAGING MBUX DIAGNOSTIC NEURAL RADAR...' : 'LAUNCH DIAGNOSTIC SCAN'}
          </Text>
        </Pressable>
      </ScrollView>

      {/* Floating Bottom Dock */}
      <MercedesDock activeTab="Diagnostics" onSelectTab={handleDockSelect} colors={colors} />
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
    paddingBottom: 110,
  },
  radarBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 14,
    gap: 12,
  },
  radarDisc: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(245, 166, 35, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radarIcon: {
    fontSize: 22,
  },
  radarMeta: {
    flex: 1,
  },
  hudLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  radarTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  radarSub: {
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
  card: {
    marginBottom: 12,
    padding: 16,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 10,
  },
  textArea: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    minHeight: 110,
    fontSize: 14,
    lineHeight: 20,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  chipText: {
    fontSize: 12,
  },
  submitButton: {
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 8,
    shadowOpacity: 0.8,
    shadowRadius: 12,
  },
  submitText: {
    color: '#040711',
    fontWeight: '900',
    fontSize: 13,
    letterSpacing: 1,
  },
});
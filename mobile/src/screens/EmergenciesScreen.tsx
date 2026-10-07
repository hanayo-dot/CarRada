import React, { useEffect, useState, useRef } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, useColorScheme, Linking, Alert, Animated } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { palette } from '../theme';
import { fetchEmergencyList } from '../api/api';
import { getLocalEmergencyList } from '../data/emergencyProcedures';
import { EmergencyItem, RootStackParamList } from '../types';
import MercedesAmbientLight from '../components/MercedesAmbientLight';
import MercedesCard from '../components/MercedesCard';
import MercedesDock, { DockTab } from '../components/MercedesDock';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Emergencies'>;
};

export default function EmergenciesScreen({ navigation }: Props) {
  const [items, setItems] = useState<EmergencyItem[]>(getLocalEmergencyList());
  const scheme = useColorScheme();
  const colors = palette(scheme);
  const beaconAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Pulse animation for Mercedes SOS beacon
    const beaconLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(beaconAnim, {
          toValue: 1.15,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(beaconAnim, {
          toValue: 0.95,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    );
    beaconLoop.start();

    const loadRemote = async () => {
      try {
        const remoteData = await fetchEmergencyList();
        if (Array.isArray(remoteData) && remoteData.length > 0) {
          setItems(remoteData);
        }
      } catch {
        // Silently preserve offline bundled data
      }
    };
    loadRemote();

    return () => beaconLoop.stop();
  }, [beaconAnim]);

  const handleEmergencyCall = (phoneNumber: string, label: string) => {
    Alert.alert(`Dispatch ${label}?`, `Confirm dialing emergency roadside connection: ${phoneNumber}`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Dial Immediately', style: 'destructive', onPress: () => Linking.openURL(`tel:${phoneNumber}`) }
    ]);
  };

  const handleDockSelect = (tab: DockTab) => {
    if (tab === 'Emergencies') return;
    if (tab === 'Home') navigation.navigate('Home');
    else if (tab === 'Chat') navigation.navigate('Chat');
    else if (tab === 'Diagnostics') navigation.navigate('SymptomDiagnostics');
    else if (tab === 'Vehicles') navigation.navigate('Vehicles');
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* Top Cockpit Emergency HUD Banner */}
      <View style={[styles.beaconBanner, { backgroundColor: 'rgba(255, 56, 92, 0.12)', borderColor: colors.danger }]}>
        <Animated.View style={[styles.beaconCircle, { transform: [{ scale: beaconAnim }] }]}>
          <Text style={styles.beaconIcon}>🚨</Text>
        </Animated.View>
        <View style={styles.beaconTextWrap}>
          <Text style={[styles.beaconTitle, { color: colors.danger }]}>MERCEDES SOS ROADSIDE COCKPIT</Text>
          <Text style={[styles.beaconSub, { color: colors.textSecondary }]}>
            High-priority dispatch triggers & 100% offline emergency procedures active.
          </Text>
        </View>
      </View>

      {/* 1-Tap Roadside & Emergency Dispatch Buttons */}
      <View style={styles.dispatchRow}>
        <Pressable
          style={[styles.dispatchButton, { backgroundColor: '#EF4444', shadowColor: '#EF4444' }]}
          onPress={() => handleEmergencyCall('911', 'Emergency Services')}
        >
          <Text style={styles.dispatchEmoji}>🆘</Text>
          <Text style={styles.dispatchTitle}>CALL 911</Text>
          <Text style={styles.dispatchSubtitle}>Police • Fire • Medical</Text>
        </Pressable>

        <Pressable
          style={[styles.dispatchButton, { backgroundColor: '#2563EB', shadowColor: '#2563EB' }]}
          onPress={() => handleEmergencyCall('18002224357', 'AAA Roadside Assistance')}
        >
          <Text style={styles.dispatchEmoji}>🛞</Text>
          <Text style={styles.dispatchTitle}>AAA DISPATCH</Text>
          <Text style={styles.dispatchSubtitle}>Towing • Battery • Lockout</Text>
        </Pressable>
      </View>

      <Text style={[styles.sectionHeading, { color: colors.text }]}>ONBOARD OFFLINE PROCEDURES</Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <MercedesAmbientLight color={colors.danger} height={3} />

      <FlatList
        data={items}
        keyExtractor={(item) => item.slug}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <MercedesCard
            colors={colors}
            onPress={() => navigation.navigate('EmergencyFlow', { slug: item.slug, title: item.title })}
            highlightColor={colors.danger}
            glow={false}
            style={styles.procedureCard}
          >
            <View style={styles.procRow}>
              <View style={[styles.procIconBox, { borderColor: colors.danger, backgroundColor: 'rgba(255, 56, 92, 0.1)' }]}>
                <Text style={styles.procIcon}>⚡</Text>
              </View>
              <View style={styles.procTextWrap}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>{item.title}</Text>
                <Text style={[styles.cardText, { color: colors.textSecondary }]}>{item.summary}</Text>
              </View>
              <Text style={[styles.arrow, { color: colors.danger }]}>→</Text>
            </View>
          </MercedesCard>
        )}
      />

      {/* Floating Bottom Dock */}
      <MercedesDock activeTab="Emergencies" onSelectTab={handleDockSelect} colors={colors} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  headerContainer: {
    marginBottom: 16,
  },
  beaconBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 16,
    gap: 12,
  },
  beaconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 56, 92, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  beaconIcon: {
    fontSize: 22,
  },
  beaconTextWrap: {
    flex: 1,
  },
  beaconTitle: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },
  beaconSub: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
  },
  dispatchRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  dispatchButton: {
    flex: 1,
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
    shadowOpacity: 0.6,
    shadowRadius: 12,
  },
  dispatchEmoji: {
    fontSize: 26,
    marginBottom: 4,
  },
  dispatchTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
  },
  dispatchSubtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 11,
    marginTop: 2,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  procedureCard: {
    marginBottom: 8,
  },
  procRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  procIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  procIcon: {
    fontSize: 16,
  },
  procTextWrap: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  cardText: {
    marginTop: 3,
    fontSize: 12,
    lineHeight: 17,
  },
  arrow: {
    fontSize: 20,
    fontWeight: '800',
    marginLeft: 10,
  },
});

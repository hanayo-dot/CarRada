import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, useColorScheme, Linking, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { palette } from '../theme';
import { fetchEmergencyList } from '../api/api';
import { getLocalEmergencyList } from '../data/emergencyProcedures';
import { EmergencyItem, RootStackParamList } from '../types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Emergencies'>;
};

export default function EmergenciesScreen({ navigation }: Props) {
  const [items, setItems] = useState<EmergencyItem[]>(getLocalEmergencyList());
  const scheme = useColorScheme();
  const colors = palette(scheme);

  useEffect(() => {
    // Optionally fetch remote updates, but local procedures are available immediately
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
  }, []);

  const handleEmergencyCall = (phoneNumber: string, label: string) => {
    Alert.alert(`Call ${label}?`, `Do you want to dial ${phoneNumber}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Call', style: 'destructive', onPress: () => Linking.openURL(`tel:${phoneNumber}`) }
    ]);
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Text style={[styles.title, { color: colors.text }]}>Emergency Assistant</Text>
      <Text style={[styles.subtitle, { color: colors.muted }]}>
        Follow step-by-step guides for roadside issues. All procedures work offline.
      </Text>

      {/* 1-Tap Roadside & Emergency Dispatch */}
      <View style={styles.dispatchRow}>
        <Pressable
          style={[styles.dispatchButton, { backgroundColor: '#EF4444' }]}
          onPress={() => handleEmergencyCall('911', 'Emergency Services')}
        >
          <Text style={styles.dispatchIcon}>🚨</Text>
          <Text style={styles.dispatchTitle}>Call 911</Text>
          <Text style={styles.dispatchSubtitle}>Injuries & Fire</Text>
        </Pressable>

        <Pressable
          style={[styles.dispatchButton, { backgroundColor: '#2563EB' }]}
          onPress={() => handleEmergencyCall('18002224357', 'AAA Roadside Assistance')}
        >
          <Text style={styles.dispatchIcon}>🛞</Text>
          <Text style={styles.dispatchTitle}>Roadside (AAA)</Text>
          <Text style={styles.dispatchSubtitle}>Towing & Battery</Text>
        </Pressable>
      </View>

      <Text style={[styles.sectionHeading, { color: colors.text }]}>Self-Help Procedures</Text>
    </View>
  );

  return (
    <FlatList
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      data={items}
      keyExtractor={(item) => item.slug}
      ListHeaderComponent={renderHeader}
      renderItem={({ item }) => (
        <Pressable
          style={[styles.card, { backgroundColor: colors.surface }]}
          onPress={() => navigation.navigate('EmergencyFlow', { slug: item.slug, title: item.title })}
        >
          <Text style={[styles.cardTitle, { color: colors.text }]}>{item.title}</Text>
          <Text style={[styles.cardText, { color: colors.muted }]}>{item.summary}</Text>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  headerContainer: { marginBottom: 16 },
  title: { fontSize: 28, fontWeight: '800' },
  subtitle: { marginTop: 6, marginBottom: 18, fontSize: 16, lineHeight: 22 },
  dispatchRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  dispatchButton: { flex: 1, borderRadius: 16, padding: 16, alignItems: 'center' },
  dispatchIcon: { fontSize: 26, marginBottom: 4 },
  dispatchTitle: { color: '#fff', fontSize: 16, fontWeight: '800' },
  dispatchSubtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 2 },
  sectionHeading: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  card: { borderRadius: 18, padding: 18, marginBottom: 14 },
  cardTitle: { fontSize: 17, fontWeight: '700' },
  cardText: { marginTop: 6, fontSize: 14, lineHeight: 20 }
});

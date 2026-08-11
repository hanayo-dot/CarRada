import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, useColorScheme, ActivityIndicator } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { palette } from '../theme';
import { fetchEmergencyList } from '../api/api';
import { EmergencyItem, RootStackParamList } from '../types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Emergencies'>;
};

export default function EmergenciesScreen({ navigation }: Props) {
  const [items, setItems] = useState<EmergencyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const scheme = useColorScheme();
  const colors = palette(scheme);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchEmergencyList();
        setItems(data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      <Text style={[styles.title, { color: colors.text }]}>Emergency Assistant</Text>
      <Text style={[styles.subtitle, { color: colors.muted }]}>Tap a flow and follow one step at a time.</Text>
      {loading ? (
        <ActivityIndicator size='large' color={colors.primary} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.slug}
          renderItem={({ item }) => (
            <Pressable style={[styles.card, { backgroundColor: colors.surface }]} onPress={() => navigation.navigate('EmergencyFlow', { slug: item.slug, title: item.title })}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>{item.title}</Text>
              <Text style={[styles.cardText, { color: colors.muted }]}>{item.summary}</Text>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 28, fontWeight: '700' },
  subtitle: { marginTop: 6, marginBottom: 20, fontSize: 16 },
  card: { borderRadius: 20, padding: 18, marginBottom: 14 },
  cardTitle: { fontSize: 18, fontWeight: '700' },
  cardText: { marginTop: 8, fontSize: 14, lineHeight: 20 }
});

import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, FlatList, useColorScheme, ActivityIndicator, Alert } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { palette } from '../theme';
import { fetchDiagnosticSession, generateDiagnosticSummary } from '../api/api';
import { RootStackParamList, DiagnosticSessionDetail, DiagnosticMessage } from '../types';

type Props = {
  route: RouteProp<RootStackParamList, 'DiagnosticSession'>;
};

export default function DiagnosticSessionDetailScreen({ route }: Props) {
  const { sessionId } = route.params;
  const [session, setSession] = useState<DiagnosticSessionDetail | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const colors = palette(useColorScheme());

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchDiagnosticSession(sessionId);
        setSession(data);
      } catch (error: any) {
        Alert.alert('Load failed', error.message || 'Could not load session.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [sessionId]);

  const handleGenerate = async () => {
    setSummaryLoading(true);
    try {
      const result = await generateDiagnosticSummary(sessionId);
      setSummary(result.summary);
    } catch (error: any) {
      Alert.alert('Summary failed', error.response?.data?.message || 'Please try again.');
    } finally {
      setSummaryLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {loading || !session ? (
        <ActivityIndicator size='large' color={colors.primary} />
      ) : (
        <>
          <View style={[styles.header, { backgroundColor: colors.surface }]}> 
            <Text style={[styles.title, { color: colors.text }]}>{session.session_name}</Text>
            <Text style={[styles.meta, { color: colors.muted }]}>Status {session.status} • Updated {new Date(session.updated_at).toLocaleDateString()}</Text>
          </View>
          <View style={[styles.actionBar, { backgroundColor: colors.surface }]}> 
            <Pressable style={[styles.generateButton, { backgroundColor: colors.primary }]} onPress={handleGenerate} disabled={summaryLoading}>
              <Text style={styles.buttonText}>{summaryLoading ? 'Generating…' : 'Generate summary'}</Text>
            </Pressable>
          </View>
          {summary ? (
            <View style={[styles.summaryBox, { backgroundColor: colors.surface }]}> 
              <Text style={[styles.sectionTitle, { color: colors.primary }]}>Mechanic summary</Text>
              <Text style={[styles.summaryText, { color: colors.text }]}>{summary}</Text>
            </View>
          ) : null}
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Conversation</Text>
          <FlatList
            data={session.messages}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={[styles.messageBubble, { backgroundColor: item.role === 'user' ? colors.surface : '#1D2F47' }]}> 
                <Text style={{ color: item.role === 'user' ? colors.text : '#fff' }}>{item.message}</Text>
                <Text style={[styles.messageMeta, { color: colors.muted }]}>{item.role} • {new Date(item.created_at).toLocaleTimeString()}</Text>
              </View>
            )}
            contentContainerStyle={styles.messageList}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { borderRadius: 18, padding: 18, marginBottom: 16 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 6 },
  meta: { fontSize: 14 },
  actionBar: { borderRadius: 18, padding: 18, marginBottom: 16 },
  generateButton: { borderRadius: 14, padding: 16, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '700' },
  summaryBox: { borderRadius: 18, padding: 18, marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 10 },
  summaryText: { fontSize: 15, lineHeight: 22 },
  messageList: { paddingBottom: 20 },
  messageBubble: { borderRadius: 18, padding: 16, marginBottom: 12 },
  messageMeta: { marginTop: 8, fontSize: 12 }
});

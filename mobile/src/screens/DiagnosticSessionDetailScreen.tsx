import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, FlatList, useColorScheme, ActivityIndicator, Alert } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { palette } from '../theme';
import { fetchDiagnosticSession, generateDiagnosticSummary } from '../api/api';
import { RootStackParamList, DiagnosticSessionDetail } from '../types';
import MercedesAmbientLight from '../components/MercedesAmbientLight';
import MercedesCard from '../components/MercedesCard';
import MercedesStarIcon from '../components/MercedesStarIcon';

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
        Alert.alert('Load Failure', error.message || 'Could not load diagnostic session telemetry.');
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
      Alert.alert('Summary Error', error.response?.data?.message || 'Unable to build certified summary.');
    } finally {
      setSummaryLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <MercedesAmbientLight color={colors.primary} height={2} />

      {loading || !session ? (
        <View style={styles.center}>
          <ActivityIndicator size='large' color={colors.primary} />
        </View>
      ) : (
        <FlatList
          contentContainerStyle={styles.content}
          data={session.messages}
          keyExtractor={(_, index) => index.toString()}
          ListHeaderComponent={
            <>
              {/* Session Overview Card */}
              <MercedesCard colors={colors} highlightColor={colors.primary} style={styles.headerCard}>
                <View style={styles.titleRow}>
                  <Text style={[styles.title, { color: colors.text }]}>{session.session_name}</Text>
                  <View style={[styles.statusTag, { borderColor: colors.primary }]}>
                    <Text style={[styles.statusTagText, { color: colors.primary }]}>{session.status.toUpperCase()}</Text>
                  </View>
                </View>
                <Text style={[styles.meta, { color: colors.muted }]}>
                  LAST TELEMETRY UPDATE: {new Date(session.updated_at).toLocaleString()}
                </Text>

                <Pressable
                  style={[styles.generateButton, { backgroundColor: colors.primary, shadowColor: colors.primary }]}
                  onPress={handleGenerate}
                  disabled={summaryLoading}
                >
                  {summaryLoading ? (
                    <ActivityIndicator color='#040711' />
                  ) : (
                    <Text style={styles.generateButtonText}>GENERATE MECHANIC BRIEFING SUMMARY</Text>
                  )}
                </Pressable>
              </MercedesCard>

              {/* Generated Mechanic Summary Card */}
              {summary ? (
                <MercedesCard colors={colors} highlightColor={colors.success} glow={true} style={styles.summaryCard}>
                  <View style={styles.summaryHeader}>
                    <MercedesStarIcon size={16} color={colors.success} glow={false} />
                    <Text style={[styles.summaryTitle, { color: colors.success }]}>CERTIFIED MECHANIC BRIEFING</Text>
                  </View>
                  <Text style={[styles.summaryText, { color: colors.text }]}>{summary}</Text>
                </MercedesCard>
              ) : null}

              <Text style={[styles.sectionHeading, { color: colors.text }]}>TELEMETRY EXCHANGE HISTORY</Text>
            </>
          }
          renderItem={({ item }) => {
            const isUser = item.role === 'user';
            return (
              <View
                style={[
                  styles.messageBubble,
                  isUser
                    ? [styles.userBubble, { backgroundColor: 'rgba(0, 132, 255, 0.2)', borderColor: 'rgba(0, 242, 254, 0.3)' }]
                    : [styles.assistantBubble, { backgroundColor: colors.surfaceGlass, borderColor: colors.borderMuted }],
                ]}
              >
                <Text style={[styles.bubbleRole, { color: isUser ? colors.primary : colors.success }]}>
                  {isUser ? 'DRIVER LOG' : 'MBUX DIAGNOSTIC NEURAL'}
                </Text>
                <Text style={[styles.bubbleText, { color: isUser ? '#fff' : '#E2E8F0' }]}>{item.message}</Text>
                <Text style={[styles.bubbleTime, { color: colors.muted }]}>
                  {new Date(item.created_at).toLocaleTimeString()}
                </Text>
              </View>
            );
          }}
          ListEmptyComponent={
            <Text style={[styles.emptyText, { color: colors.muted }]}>No recorded messages in this session.</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 16, paddingBottom: 40 },
  headerCard: { padding: 16, marginBottom: 14 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  title: { fontSize: 20, fontWeight: '800', flex: 1, marginRight: 8 },
  statusTag: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 7, paddingVertical: 3 },
  statusTagText: { fontSize: 9, fontWeight: '900', letterSpacing: 0.8 },
  meta: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5, marginBottom: 14 },
  generateButton: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  generateButtonText: { color: '#040711', fontWeight: '900', fontSize: 12, letterSpacing: 0.8 },
  summaryCard: { padding: 18, marginBottom: 18 },
  summaryHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  summaryTitle: { fontSize: 11, fontWeight: '900', letterSpacing: 1 },
  summaryText: { fontSize: 14, lineHeight: 21 },
  sectionHeading: { fontSize: 11, fontWeight: '800', letterSpacing: 1.2, marginBottom: 10, paddingHorizontal: 4 },
  messageBubble: { borderRadius: 16, borderWidth: 1, padding: 14, marginBottom: 10 },
  userBubble: { alignSelf: 'flex-end', maxWidth: '85%' },
  assistantBubble: { alignSelf: 'flex-start', maxWidth: '92%' },
  bubbleRole: { fontSize: 9, fontWeight: '900', letterSpacing: 1, marginBottom: 4 },
  bubbleText: { fontSize: 13, lineHeight: 19 },
  bubbleTime: { fontSize: 10, marginTop: 6, textAlign: 'right' },
  emptyText: { textAlign: 'center', marginTop: 20, fontSize: 14 },
});

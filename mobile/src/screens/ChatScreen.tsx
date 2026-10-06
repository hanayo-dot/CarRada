import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TextInput, Pressable, FlatList, StyleSheet, useColorScheme, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { palette } from '../theme';
import { fetchConversationHistory, fetchDiagnosticSessions, sendChat, createDiagnosticSession } from '../api/api';
import { ConversationMessage, DiagnosticSession, RootStackParamList } from '../types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Chat'>;
};

export default function ChatScreen({ navigation }: Props) {
  const scheme = useColorScheme();
  const colors = palette(scheme);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [sessions, setSessions] = useState<DiagnosticSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<DiagnosticSession | null>(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [safetyNote, setSafetyNote] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [history, sessionData] = await Promise.all([fetchConversationHistory(), fetchDiagnosticSessions()]);
        setMessages(history.map((item: any) => ({ role: (item.role === 'assistant' ? 'assistant' : 'user') as 'user' | 'assistant', message: item.message })));
        setSessions(sessionData);
        if (sessionData.length) {
          setSelectedSession(sessionData[0]);
        }
      } catch (error) {
        // ignore load failures for now
      }
    };
    loadData();
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;
    const newMessages: ConversationMessage[] = [...messages, { role: 'user', message: input.trim() }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const result = await sendChat(newMessages, undefined, selectedSession?.id);
      if (result.safety?.alert) {
        setSafetyNote(result.safety.message);
        setMessages((prev) => prev.slice(0, -1)); // remove the user message since we're showing a safety alert
      } else {
        setSafetyNote(null);
        setMessages((prev) => [...prev, { role: 'assistant', message: result.assistant.text }]);
      }
    } catch (error: any) {
      Alert.alert('Chat failed', error.response?.data?.message || 'Try again.');
      setMessages((prev) => prev.slice(0, -1)); // remove the user message on error
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSession = async () => {
    const timestamp = new Date().toLocaleDateString();
    const newSessionName = `Session ${timestamp}`;
    try {
      const session = await createDiagnosticSession(newSessionName, undefined);
      setSessions((prev) => [session, ...prev]);
      setSelectedSession(session);
      setMessages([]);
      setSafetyNote(null);
    } catch (error: any) {
      Alert.alert('Failed to create session', error.response?.data?.message || 'Please try again.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      <Text style={[styles.title, { color: colors.text }]}>AI Car Assistant</Text>
      <Text style={[styles.subtitle, { color: colors.muted }]}>Ask about symptoms, warning lights, or a mechanic note.</Text>
      
      <View style={[styles.sessionSection, { backgroundColor: colors.surface }]}> 
        <Text style={[styles.sessionLabel, { color: colors.muted }]}>Diagnostic session</Text>
        {sessions.length === 0 ? (
          <Pressable style={[styles.createSessionButton, { borderColor: colors.primary }]} onPress={handleCreateSession}>
            <Text style={[styles.createSessionText, { color: colors.primary }]}>+ Start new session</Text>
          </Pressable>
        ) : (
          <>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sessionScroll}>
              {sessions.map((session) => (
                <Pressable
                  key={session.id}
                  onPress={() => {
                    setSelectedSession(session);
                    setMessages([]);
                    setSafetyNote(null);
                  }}
                  style={[
                    styles.sessionChip,
                    { backgroundColor: selectedSession?.id === session.id ? colors.primary : colors.background }
                  ]}
                >
                  <Text style={{ color: selectedSession?.id === session.id ? '#fff' : colors.text, fontSize: 13 }}>{session.session_name}</Text>
                </Pressable>
              ))}
            </ScrollView>
            <Pressable style={[styles.manageButton, { borderColor: colors.primary }]} onPress={() => navigation.navigate('Diagnostics')}>
              <Text style={[styles.manageText, { color: colors.primary }]}>Manage sessions</Text>
            </Pressable>
          </>
        )}
      </View>

      {safetyNote ? (
        <View style={[styles.alertBox, { backgroundColor: '#4F1A16' }]}>
          <Text style={styles.alertTitle}>🚨 Safety Warning</Text>
          <Text style={[styles.alertText, { marginTop: 8 }]}>{safetyNote}</Text>
        </View>
      ) : null}

      {messages.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyText, { color: colors.muted }]}>Start a conversation to get help with your car.</Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item }) => (
            <View
              style={[
                styles.messageBubble,
                item.role === 'user'
                  ? { backgroundColor: colors.primary, alignSelf: 'flex-end', maxWidth: '85%' }
                  : { backgroundColor: '#1D2F47', alignSelf: 'flex-start', maxWidth: '90%' }
              ]}
            >
              <Text style={{ color: item.role === 'user' ? '#fff' : '#E5E7EB', fontSize: 15, lineHeight: 22 }}>
                {item.message}
              </Text>
            </View>
          )}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />
      )}

      <View style={styles.inputRow}>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
          placeholder='Describe your issue...'
          placeholderTextColor={colors.muted}
          value={input}
          onChangeText={setInput}
          multiline
          editable={!loading}
        />
        <Pressable style={[styles.sendButton, { backgroundColor: colors.primary, opacity: loading ? 0.6 : 1 }]} onPress={handleSend} disabled={loading || !input.trim()}>
          {loading ? <ActivityIndicator color='#fff' size='small' /> : <Text style={styles.sendText}>Send</Text>}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 28, fontWeight: '700' },
  subtitle: { marginTop: 6, marginBottom: 14, fontSize: 15 },
  messagesContent: { paddingBottom: 16 },
  messageBubble: { borderRadius: 18, padding: 14, marginBottom: 12, marginHorizontal: 8 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  emptyText: { fontSize: 16, textAlign: 'center', lineHeight: 24 },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10 },
  input: { flex: 1, borderRadius: 18, padding: 14, fontSize: 16, maxHeight: 120 },
  sendButton: { borderRadius: 18, paddingHorizontal: 18, paddingVertical: 16, justifyContent: 'center', alignItems: 'center' },
  sendText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  alertBox: { borderRadius: 16, padding: 16, marginBottom: 16 },
  alertTitle: { color: '#FFD7D7', fontWeight: '700', fontSize: 16 },
  alertText: { color: '#FFD7D7', fontSize: 14, lineHeight: 20 },
  sessionSection: { borderRadius: 18, padding: 16, marginBottom: 16 },
  sessionLabel: { fontSize: 14, marginBottom: 10, fontWeight: '600' },
  sessionScroll: { marginBottom: 12 },
  sessionChip: { borderRadius: 14, paddingVertical: 10, paddingHorizontal: 16, marginRight: 10 },
  createSessionButton: { borderRadius: 14, paddingVertical: 12, paddingHorizontal: 16, borderWidth: 1, alignItems: 'center' },
  createSessionText: { fontWeight: '700', fontSize: 14 },
  manageButton: { borderRadius: 14, paddingVertical: 10, paddingHorizontal: 14, borderWidth: 1, alignItems: 'center' },
  manageText: { fontWeight: '700', fontSize: 13 }
});

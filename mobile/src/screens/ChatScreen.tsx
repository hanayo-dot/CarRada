import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  StyleSheet,
  useColorScheme,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { palette } from '../theme';
import {
  fetchConversationHistory,
  fetchDiagnosticSessions,
  sendChat,
  createDiagnosticSession,
} from '../api/api';
import { ConversationMessage, DiagnosticSession, RootStackParamList } from '../types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import MercedesAmbientLight from '../components/MercedesAmbientLight';
import MercedesVoiceOrb from '../components/MercedesVoiceOrb';
import MercedesStarIcon from '../components/MercedesStarIcon';
import MercedesDock, { DockTab } from '../components/MercedesDock';

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
        const [history, sessionData] = await Promise.all([
          fetchConversationHistory(),
          fetchDiagnosticSessions(),
        ]);
        setMessages(
          history.map((item: any) => ({
            role: (item.role === 'assistant' ? 'assistant' : 'user') as 'user' | 'assistant',
            message: item.message,
          }))
        );
        setSessions(sessionData);
        if (sessionData.length) {
          setSelectedSession(sessionData[0]);
        }
      } catch (error) {
        // preserve offline state
      }
    };
    loadData();
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userText = input.trim();
    const newMessages: ConversationMessage[] = [...messages, { role: 'user', message: userText }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const result = await sendChat(newMessages, undefined, selectedSession?.id);
      if (result.safety?.alert) {
        setSafetyNote(result.safety.message);
        setMessages((prev) => prev.slice(0, -1));
      } else {
        setSafetyNote(null);
        setMessages((prev) => [...prev, { role: 'assistant', message: result.assistant.text }]);
      }
    } catch (error: any) {
      Alert.alert('Diagnostic Failure', error.response?.data?.message || 'Transmission interrupted. Please retry.');
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSession = async () => {
    const timestamp = new Date().toLocaleDateString();
    const newSessionName = `HUD Diagnosis - ${timestamp}`;
    try {
      const session = await createDiagnosticSession(newSessionName, undefined);
      setSessions((prev) => [session, ...prev]);
      setSelectedSession(session);
      setMessages([]);
      setSafetyNote(null);
    } catch (error: any) {
      Alert.alert('Session Error', error.response?.data?.message || 'Unable to initialize diagnostic session.');
    }
  };

  const handleDockSelect = (tab: DockTab) => {
    if (tab === 'Chat') return;
    if (tab === 'Home') navigation.navigate('Home');
    else if (tab === 'Diagnostics') navigation.navigate('SymptomDiagnostics');
    else if (tab === 'Vehicles') navigation.navigate('Vehicles');
    else if (tab === 'Emergencies') navigation.navigate('Emergencies');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <MercedesAmbientLight color={colors.primary} height={2} />

      {/* Header HUD info */}
      <View style={[styles.hudBanner, { backgroundColor: colors.surfaceGlass, borderColor: colors.border }]}>
        <MercedesVoiceOrb size={48} color={colors.primary} isListening={loading} />
        <View style={styles.hudMeta}>
          <View style={styles.voiceTitleRow}>
            <Text style={[styles.voiceTitle, { color: colors.text }]}>"HEY MERCEDES"</Text>
            <View style={[styles.liveTag, { borderColor: colors.primary }]}>
              <View style={[styles.liveDot, { backgroundColor: colors.primary }]} />
              <Text style={[styles.liveText, { color: colors.primary }]}>
                {loading ? 'PROCESSING' : 'LISTENING'}
              </Text>
            </View>
          </View>
          <Text style={[styles.voiceSubtitle, { color: colors.textSecondary }]}>
            Diagnostic Neural Engine Active • Ask anything about vehicle health
          </Text>
        </View>
      </View>

      {/* Diagnostic Session HUD Bar */}
      <View style={[styles.sessionSection, { backgroundColor: colors.surfaceElevated, borderColor: colors.borderMuted }]}>
        <View style={styles.sessionHeaderRow}>
          <Text style={[styles.sessionLabel, { color: colors.muted }]}>ACTIVE TELEMETRY SESSION</Text>
          <Pressable onPress={() => navigation.navigate('Diagnostics')}>
            <Text style={[styles.manageLink, { color: colors.primary }]}>All Sessions ↗</Text>
          </Pressable>
        </View>

        {sessions.length === 0 ? (
          <Pressable
            style={[styles.createSessionButton, { borderColor: colors.primary, backgroundColor: 'rgba(0, 242, 254, 0.08)' }]}
            onPress={handleCreateSession}
          >
            <Text style={[styles.createSessionText, { color: colors.primary }]}>+ INITIALIZE DIAGNOSTIC LOG</Text>
          </Pressable>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sessionScroll}>
            <Pressable
              style={[styles.newSessionChip, { borderColor: colors.primary }]}
              onPress={handleCreateSession}
            >
              <Text style={[styles.newSessionChipText, { color: colors.primary }]}>+ NEW</Text>
            </Pressable>
            {sessions.map((session) => {
              const isSelected = selectedSession?.id === session.id;
              return (
                <Pressable
                  key={session.id}
                  onPress={() => {
                    setSelectedSession(session);
                    setMessages([]);
                    setSafetyNote(null);
                  }}
                  style={[
                    styles.sessionChip,
                    {
                      backgroundColor: isSelected ? 'rgba(0, 242, 254, 0.18)' : 'rgba(255, 255, 255, 0.04)',
                      borderColor: isSelected ? colors.primary : colors.borderMuted,
                    },
                  ]}
                >
                  <View style={[styles.chipIndicator, { backgroundColor: isSelected ? colors.primary : colors.muted }]} />
                  <Text
                    style={{
                      color: isSelected ? '#fff' : colors.textSecondary,
                      fontSize: 12,
                      fontWeight: isSelected ? '800' : '500',
                    }}
                  >
                    {session.session_name}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        )}
      </View>

      {/* Safety Alert HUD Card */}
      {safetyNote ? (
        <View style={[styles.alertBox, { backgroundColor: 'rgba(255, 56, 92, 0.15)', borderColor: colors.danger }]}>
          <View style={styles.alertHeader}>
            <Text style={styles.alertBadge}>⚠️ ROAD HAZARD ALERT</Text>
          </View>
          <Text style={[styles.alertText, { color: '#FFE4E6' }]}>{safetyNote}</Text>
        </View>
      ) : null}

      {/* Conversation Stream */}
      {messages.length === 0 ? (
        <View style={styles.emptyState}>
          <MercedesVoiceOrb size={80} color={colors.primary} isListening={false} />
          <Text style={[styles.emptyPrompt, { color: colors.text }]}>How can I assist your drive?</Text>
          <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
            Try: "What does code P0300 mean?", "Brakes squeak when reversing", or "How to test battery voltage?"
          </Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item }) => {
            const isUser = item.role === 'user';
            return (
              <View
                style={[
                  styles.messageCard,
                  isUser
                    ? [styles.userCard, { backgroundColor: 'rgba(0, 132, 255, 0.22)', borderColor: 'rgba(0, 242, 254, 0.4)' }]
                    : [styles.assistantCard, { backgroundColor: colors.surfaceGlass, borderColor: colors.border }],
                ]}
              >
                {!isUser && (
                  <View style={styles.assistantBadge}>
                    <MercedesStarIcon size={14} color={colors.primary} glow={false} />
                    <Text style={[styles.assistantBadgeText, { color: colors.primary }]}>MBUX TELEMETRY</Text>
                  </View>
                )}
                <Text
                  style={[
                    styles.messageText,
                    { color: isUser ? '#FFFFFF' : '#E2E8F0' },
                  ]}
                >
                  {item.message}
                </Text>
              </View>
            );
          }}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />
      )}

      {/* Automotive Cockpit Input Bar */}
      <View style={[styles.inputContainer, { backgroundColor: 'rgba(7, 14, 30, 0.95)', borderColor: colors.border }]}>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surfaceElevated, color: colors.text, borderColor: colors.borderMuted }]}
          placeholder='Ask MBUX assistant or describe vehicle symptom...'
          placeholderTextColor={colors.muted}
          value={input}
          onChangeText={setInput}
          multiline
          editable={!loading}
        />
        <Pressable
          style={[
            styles.sendButton,
            {
              backgroundColor: colors.primary,
              shadowColor: colors.primary,
              opacity: loading || !input.trim() ? 0.4 : 1,
            },
          ]}
          onPress={handleSend}
          disabled={loading || !input.trim()}
        >
          {loading ? (
            <ActivityIndicator color='#000' size='small' />
          ) : (
            <Text style={styles.sendIcon}>▲</Text>
          )}
        </Pressable>
      </View>

      {/* Floating Bottom Dock */}
      <MercedesDock activeTab="Chat" onSelectTab={handleDockSelect} colors={colors} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  hudBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  hudMeta: {
    flex: 1,
    marginLeft: 8,
  },
  voiceTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  voiceTitle: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  liveTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  liveText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  voiceSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  sessionSection: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  sessionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  sessionLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },
  manageLink: {
    fontSize: 11,
    fontWeight: '700',
  },
  sessionScroll: {
    flexDirection: 'row',
  },
  newSessionChip: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 8,
    justifyContent: 'center',
  },
  newSessionChipText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  sessionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  chipIndicator: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  createSessionButton: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 8,
    alignItems: 'center',
  },
  createSessionText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  alertBox: {
    margin: 14,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  alertHeader: {
    marginBottom: 4,
  },
  alertBadge: {
    color: '#FF385C',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },
  alertText: {
    fontSize: 13,
    lineHeight: 18,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  emptyPrompt: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginTop: 14,
    textAlign: 'center',
  },
  emptySub: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
    marginTop: 6,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 160,
  },
  messageCard: {
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
  },
  userCard: {
    alignSelf: 'flex-end',
    maxWidth: '85%',
  },
  assistantCard: {
    alignSelf: 'flex-start',
    maxWidth: '92%',
  },
  assistantBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  assistantBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 21,
  },
  inputContainer: {
    position: 'absolute',
    bottom: 60, // Sits above dock
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderTopWidth: 1,
    gap: 10,
  },
  input: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    maxHeight: 90,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  sendIcon: {
    fontSize: 16,
    color: '#040711',
    fontWeight: '900',
  },
});

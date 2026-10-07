import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, useColorScheme, Alert, Pressable } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { palette, AmbientMode } from '../theme';
import { fetchLessons, fetchReminders, fetchDiagnosticSessions } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { RootStackParamList } from '../types';
import MercedesCockpitHeader from '../components/MercedesCockpitHeader';
import MercedesGaugeCluster from '../components/MercedesGaugeCluster';
import MercedesCard from '../components/MercedesCard';
import MercedesDock, { DockTab } from '../components/MercedesDock';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

export default function HomeScreen({ navigation }: Props) {
  const scheme = useColorScheme();
  const colors = palette(scheme);
  const { user } = useAuth();
  const [driveMode, setDriveMode] = useState<AmbientMode>('comfort');
  const [reminderCount, setReminderCount] = useState(0);
  const [diagnosticCount, setDiagnosticCount] = useState(0);
  const [lessonTitle, setLessonTitle] = useState('Safety & Maintenance');

  useEffect(() => {
    const loadSummary = async () => {
      try {
        const [reminders, sessions, lessons] = await Promise.all([
          fetchReminders(),
          fetchDiagnosticSessions(),
          fetchLessons(),
        ]);

        setReminderCount(reminders?.length || 0);
        setDiagnosticCount(sessions?.length || 0);
        setLessonTitle(lessons?.dailyLesson?.title || 'Daily driving tips');
      } catch (error: any) {
        Alert.alert('Telemetry Alert', error.response?.data?.message || 'Could not load vehicle summary.');
      }
    };
    loadSummary();
  }, []);

  const handleDockSelect = (tab: DockTab) => {
    if (tab === 'Home') return;
    if (tab === 'Chat') navigation.navigate('Chat');
    else if (tab === 'Diagnostics') navigation.navigate('SymptomDiagnostics');
    else if (tab === 'Vehicles') navigation.navigate('Vehicles');
    else if (tab === 'Emergencies') navigation.navigate('Emergencies');
  };

  const ambientColor = colors.ambient[driveMode];

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* Mercedes Top Cockpit Ribbon */}
      <MercedesCockpitHeader
        colors={colors}
        driveMode={driveMode}
        title="MBUX HYPERSCREEN"
        subtitle={user?.name ? `DRIVER: ${user.name.toUpperCase()}` : 'DRIVER ASSIST READY'}
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Dynamic Animated Instrument Cluster Gauge */}
        <MercedesGaugeCluster
          colors={colors}
          driveMode={driveMode}
          onDriveModeChange={(mode) => setDriveMode(mode)}
          speed={68}
          systemHealth={100}
        />

        {/* Mercedes Zero Layer: Cockpit Telemetry Widgets */}
        <View style={styles.widgetRow}>
          <MercedesCard colors={colors} style={styles.widgetCard} highlightColor={ambientColor} glow={true}>
            <Text style={[styles.widgetBadge, { color: ambientColor }]}>SERVICE A / B</Text>
            <Text style={[styles.widgetVal, { color: colors.text }]}>{reminderCount}</Text>
            <Text style={[styles.widgetDesc, { color: colors.textSecondary }]}>Pending Reminders</Text>
          </MercedesCard>

          <MercedesCard colors={colors} style={styles.widgetCard} highlightColor={colors.success}>
            <Text style={[styles.widgetBadge, { color: colors.success }]}>DIAGNOSTIC RADAR</Text>
            <Text style={[styles.widgetVal, { color: colors.text }]}>{diagnosticCount}</Text>
            <Text style={[styles.widgetDesc, { color: colors.textSecondary }]}>Active Sessions</Text>
          </MercedesCard>
        </View>

        {/* Masterclass Feature Banner */}
        <MercedesCard
          colors={colors}
          onPress={() => navigation.navigate('Lessons')}
          highlightColor={ambientColor}
          glow={false}
          style={styles.featureBanner}
        >
          <View style={styles.bannerRow}>
            <View style={{ flex: 1 }}>
              <View style={[styles.bannerTag, { backgroundColor: 'rgba(0, 242, 254, 0.12)', borderColor: ambientColor }]}>
                <Text style={[styles.bannerTagText, { color: ambientColor }]}>MBUX MASTERCLASS</Text>
              </View>
              <Text style={[styles.bannerTitle, { color: colors.text }]} numberOfLines={1}>
                {lessonTitle}
              </Text>
              <Text style={[styles.bannerSub, { color: colors.muted }]}>
                Tap to explore intelligent vehicle management skills
              </Text>
            </View>
            <Text style={styles.bannerArrow}>→</Text>
          </View>
        </MercedesCard>

        {/* Main Automotive Grid */}
        <Text style={[styles.sectionHeading, { color: colors.text }]}>MBUX INTELLIGENCE SYSTEMS</Text>

        <View style={styles.grid}>
          {/* AI Car Assistant */}
          <MercedesCard
            colors={colors}
            onPress={() => navigation.navigate('Chat')}
            highlightColor={ambientColor}
            glow={true}
          >
            <View style={styles.cardHeaderRow}>
              <View style={[styles.iconBox, { backgroundColor: 'rgba(0, 242, 254, 0.15)', borderColor: ambientColor }]}>
                <Text style={styles.cardIcon}>🤖</Text>
              </View>
              <View style={[styles.statusPill, { borderColor: ambientColor }]}>
                <View style={[styles.dot, { backgroundColor: ambientColor }]} />
                <Text style={[styles.statusPillText, { color: ambientColor }]}>LIVE AI HUD</Text>
              </View>
            </View>
            <Text style={[styles.cardTitle, { color: colors.text }]}>MBUX Intelligent Assistant</Text>
            <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>
              Natural language diagnostics, live warning light evaluation, and telemetry memory.
            </Text>
          </MercedesCard>

          {/* Virtual Garage */}
          <MercedesCard
            colors={colors}
            onPress={() => navigation.navigate('Vehicles')}
            highlightColor={colors.primary}
          >
            <View style={styles.cardHeaderRow}>
              <View style={[styles.iconBox, { backgroundColor: 'rgba(56, 189, 248, 0.15)', borderColor: colors.primary }]}>
                <Text style={styles.cardIcon}>🚘</Text>
              </View>
              <Text style={[styles.systemCode, { color: colors.muted }]}>SYS // 01</Text>
            </View>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Virtual Garage & Profiles</Text>
            <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>
              Manage fleet vehicles, VIN specifications, mileage tracking, and year-make profiles.
            </Text>
          </MercedesCard>

          {/* Symptom Diagnostics */}
          <MercedesCard
            colors={colors}
            onPress={() => navigation.navigate('SymptomDiagnostics')}
            highlightColor={colors.warning}
          >
            <View style={styles.cardHeaderRow}>
              <View style={[styles.iconBox, { backgroundColor: 'rgba(245, 166, 35, 0.15)', borderColor: colors.warning }]}>
                <Text style={styles.cardIcon}>🔍</Text>
              </View>
              <Text style={[styles.systemCode, { color: colors.muted }]}>SYS // 02</Text>
            </View>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Symptom Diagnostics Radar</Text>
            <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>
              Pinpoint suspicious sounds, vibrations, and fault conditions across powertrain subsystems.
            </Text>
          </MercedesCard>

          {/* Emergency SOS Assistant */}
          <MercedesCard
            colors={colors}
            onPress={() => navigation.navigate('Emergencies')}
            highlightColor={colors.danger}
            glow={true}
          >
            <View style={styles.cardHeaderRow}>
              <View style={[styles.iconBox, { backgroundColor: 'rgba(255, 56, 92, 0.2)', borderColor: colors.danger }]}>
                <Text style={styles.cardIcon}>🚨</Text>
              </View>
              <View style={[styles.statusPill, { borderColor: colors.danger }]}>
                <View style={[styles.dot, { backgroundColor: colors.danger }]} />
                <Text style={[styles.statusPillText, { color: colors.danger }]}>OFFLINE SOS</Text>
              </View>
            </View>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Roadside Safety & SOS</Text>
            <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>
              Instant 1-tap 911 / AAA dispatch and 10 onboard emergency guides for flat tire, overheat, and battery.
            </Text>
          </MercedesCard>

          {/* Mechanic Translator */}
          <MercedesCard
            colors={colors}
            onPress={() => navigation.navigate('MechanicTranslator')}
            highlightColor={colors.primary}
          >
            <View style={styles.cardHeaderRow}>
              <View style={[styles.iconBox, { backgroundColor: 'rgba(0, 242, 254, 0.15)', borderColor: colors.primary }]}>
                <Text style={styles.cardIcon}>📷</Text>
              </View>
              <Text style={[styles.systemCode, { color: colors.muted }]}>SYS // 03</Text>
            </View>
            <Text style={[styles.cardTitle, { color: colors.text }]}>HUD Warning Light & Notes</Text>
            <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>
              Camera scanner for dash cluster lights and instant mechanic jargon translation.
            </Text>
          </MercedesCard>

          {/* Maintenance Reminders */}
          <MercedesCard
            colors={colors}
            onPress={() => navigation.navigate('Reminders')}
            highlightColor={colors.secondary}
          >
            <View style={styles.cardHeaderRow}>
              <View style={[styles.iconBox, { backgroundColor: 'rgba(56, 189, 248, 0.15)', borderColor: colors.secondary }]}>
                <Text style={styles.cardIcon}>📅</Text>
              </View>
              <Text style={[styles.systemCode, { color: colors.muted }]}>SYS // 04</Text>
            </View>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Service Schedule Tracker</Text>
            <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>
              Keep service, oil change, brake inspection, registration, and inspection deadlines on track.
            </Text>
          </MercedesCard>

          {/* Repair Cost Estimator */}
          <MercedesCard
            colors={colors}
            onPress={() => navigation.navigate('RepairCostEstimator')}
            highlightColor={colors.success}
          >
            <View style={styles.cardHeaderRow}>
              <View style={[styles.iconBox, { backgroundColor: 'rgba(0, 245, 160, 0.15)', borderColor: colors.success }]}>
                <Text style={styles.cardIcon}>💰</Text>
              </View>
              <Text style={[styles.systemCode, { color: colors.muted }]}>SYS // 05</Text>
            </View>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Service Cost Estimator</Text>
            <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>
              Get accurate parts and labor cost projections before heading to the service bay.
            </Text>
          </MercedesCard>

          {/* Diagnostic Sessions Log */}
          <MercedesCard
            colors={colors}
            onPress={() => navigation.navigate('Diagnostics')}
            highlightColor={colors.primary}
          >
            <View style={styles.cardHeaderRow}>
              <View style={[styles.iconBox, { backgroundColor: 'rgba(0, 242, 254, 0.15)', borderColor: colors.primary }]}>
                <Text style={styles.cardIcon}>📋</Text>
              </View>
              <Text style={[styles.systemCode, { color: colors.muted }]}>SYS // 06</Text>
            </View>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Diagnostic Black Box</Text>
            <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>
              Review full vehicle diagnosis records and produce mechanic-ready shareable summaries.
            </Text>
          </MercedesCard>
        </View>
      </ScrollView>

      {/* Mercedes Floating Dock */}
      <MercedesDock
        activeTab="Home"
        onSelectTab={handleDockSelect}
        colors={colors}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100, // Space for dock
  },
  widgetRow: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 4,
  },
  widgetCard: {
    flex: 1,
    padding: 14,
  },
  widgetBadge: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 6,
  },
  widgetVal: {
    fontSize: 28,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  widgetDesc: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  featureBanner: {
    marginVertical: 8,
    padding: 16,
  },
  bannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bannerTag: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 6,
  },
  bannerTagText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  bannerSub: {
    fontSize: 12,
    marginTop: 2,
  },
  bannerArrow: {
    fontSize: 22,
    color: '#00F2FE',
    fontWeight: '800',
    marginLeft: 12,
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginTop: 20,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  grid: {
    gap: 4,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardIcon: {
    fontSize: 18,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusPillText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  systemCode: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  cardDesc: {
    fontSize: 13,
    lineHeight: 19,
  },
});

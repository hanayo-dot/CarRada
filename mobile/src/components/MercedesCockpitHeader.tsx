import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MercedesStarIcon from './MercedesStarIcon';
import MercedesAmbientLight from './MercedesAmbientLight';
import { AmbientMode, MercedesTheme } from '../theme';

interface Props {
  colors: MercedesTheme;
  driveMode?: AmbientMode;
  title?: string;
  subtitle?: string;
  onDriveModeChange?: (mode: AmbientMode) => void;
}

export default function MercedesCockpitHeader({
  colors,
  driveMode = 'comfort',
  title = 'MBUX COCKPIT',
  subtitle,
}: Props) {
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const ambientColor = colors.ambient[driveMode] || colors.primary;

  return (
    <View style={styles.container}>
      <MercedesAmbientLight color={ambientColor} height={2.5} />
      
      <View style={[styles.headerBody, { backgroundColor: colors.surfaceGlass, borderColor: colors.borderMuted }]}>
        {/* Left: Star + Brand Title */}
        <View style={styles.leftCol}>
          <MercedesStarIcon size={24} color={ambientColor} glow={true} />
          <View style={styles.titleBox}>
            <Text style={[styles.brandText, { color: colors.text }]}>{title}</Text>
            {subtitle ? (
              <Text style={[styles.subText, { color: colors.textSecondary }]}>{subtitle}</Text>
            ) : (
              <View style={styles.modePill}>
                <View style={[styles.modeDot, { backgroundColor: ambientColor }]} />
                <Text style={[styles.modeText, { color: ambientColor }]}>
                  {driveMode.toUpperCase()} MODE
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Center: Live Digital Cockpit Clock */}
        <View style={styles.centerCol}>
          <Text style={[styles.clockText, { color: colors.text }]}>{timeStr}</Text>
          <Text style={[styles.telemetryMini, { color: colors.muted }]}>21.5°C • ONLINE</Text>
        </View>

        {/* Right: Telemetry Signals */}
        <View style={styles.rightCol}>
          <View style={styles.telemetryTag}>
            <Text style={[styles.batteryIcon, { color: colors.success }]}>⚡</Text>
            <Text style={[styles.batteryText, { color: colors.text }]}>98%</Text>
          </View>
          <View style={styles.signalGroup}>
            <Text style={[styles.signalLabel, { color: ambientColor }]}>5G</Text>
            <View style={styles.signalBars}>
              <View style={[styles.bar, { height: 4, backgroundColor: ambientColor }]} />
              <View style={[styles.bar, { height: 7, backgroundColor: ambientColor }]} />
              <View style={[styles.bar, { height: 10, backgroundColor: ambientColor }]} />
              <View style={[styles.bar, { height: 13, backgroundColor: ambientColor }]} />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    zIndex: 10,
  },
  headerBody: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  leftCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  titleBox: {
    justifyContent: 'center',
  },
  brandText: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  subText: {
    fontSize: 11,
    marginTop: 1,
  },
  modePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 1,
  },
  modeDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  modeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  centerCol: {
    alignItems: 'center',
  },
  clockText: {
    fontSize: 15,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
    letterSpacing: 1,
  },
  telemetryMini: {
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginTop: 1,
  },
  rightCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  telemetryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  batteryIcon: {
    fontSize: 10,
  },
  batteryText: {
    fontSize: 11,
    fontWeight: '700',
  },
  signalGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  signalLabel: {
    fontSize: 10,
    fontWeight: '800',
  },
  signalBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 1.5,
    height: 14,
  },
  bar: {
    width: 2.5,
    borderRadius: 1,
  },
});

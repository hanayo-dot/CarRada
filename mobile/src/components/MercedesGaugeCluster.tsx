import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Easing } from 'react-native';
import { AmbientMode, MercedesTheme } from '../theme';

interface Props {
  colors: MercedesTheme;
  driveMode: AmbientMode;
  onDriveModeChange: (mode: AmbientMode) => void;
  speed?: number;
  systemHealth?: number; // 0 to 100
}

export default function MercedesGaugeCluster({
  colors,
  driveMode,
  onDriveModeChange,
  speed = 68,
  systemHealth = 100,
}: Props) {
  const [displaySpeed, setDisplaySpeed] = useState(0);
  const sweepAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0.85)).current;
  const rotateNeedle = useRef(new Animated.Value(0)).current;

  const ambientColor = colors.ambient[driveMode] || colors.primary;

  useEffect(() => {
    // 1. Ignition sweep animation on mount
    sweepAnim.setValue(0);
    rotateNeedle.setValue(-120);

    Animated.parallel([
      Animated.timing(sweepAnim, {
        toValue: 1,
        duration: 1600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.timing(rotateNeedle, {
        toValue: 0,
        duration: 1600,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
    ]).start();

    // Animate digital counter
    let current = 0;
    const interval = setInterval(() => {
      current += 2;
      if (current >= speed) {
        setDisplaySpeed(speed);
        clearInterval(interval);
      } else {
        setDisplaySpeed(current);
      }
    }, 25);

    // 2. Continuous pulse of the inner ring aura
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.95,
          duration: 1800,
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoop.start();

    return () => {
      clearInterval(interval);
      pulseLoop.stop();
    };
  }, [speed]);

  const needleRotation = rotateNeedle.interpolate({
    inputRange: [-120, 0],
    outputRange: ['-120deg', '25deg'],
  });

  return (
    <View style={[styles.clusterContainer, { backgroundColor: colors.surfaceGlass, borderColor: colors.border }]}>
      {/* Drive Mode Selector Chips */}
      <View style={styles.driveModeRow}>
        {(['comfort', 'sport', 'eco', 'maybach'] as AmbientMode[]).map((mode) => {
          const isActive = driveMode === mode;
          const modeColor = colors.ambient[mode];
          return (
            <Pressable
              key={mode}
              onPress={() => onDriveModeChange(mode)}
              style={[
                styles.modeButton,
                {
                  backgroundColor: isActive ? 'rgba(255,255,255,0.08)' : 'transparent',
                  borderColor: isActive ? modeColor : 'transparent',
                  borderWidth: 1,
                },
              ]}
            >
              <View
                style={[
                  styles.modeIndicatorDot,
                  { backgroundColor: isActive ? modeColor : colors.muted },
                ]}
              />
              <Text
                style={[
                  styles.modeButtonText,
                  {
                    color: isActive ? '#fff' : colors.muted,
                    fontWeight: isActive ? '800' : '600',
                  },
                ]}
              >
                {mode.toUpperCase()}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Main Gauge Visualizer */}
      <View style={styles.gaugeVisualWrapper}>
        {/* Outer illuminated metallic bezel */}
        <View
          style={[
            styles.gaugeOuterRing,
            {
              borderColor: 'rgba(255,255,255,0.12)',
              shadowColor: ambientColor,
              shadowOpacity: 0.7,
              shadowRadius: 20,
            },
          ]}
        >
          {/* Neon Arc track */}
          <View
            style={[
              styles.gaugeTrackRing,
              { borderColor: colors.gaugeTrack },
            ]}
          />
          <Animated.View
            style={[
              styles.gaugeActiveRing,
              {
                borderColor: ambientColor,
                opacity: sweepAnim,
                shadowColor: ambientColor,
                shadowOpacity: 0.9,
                shadowRadius: 12,
              },
            ]}
          />

          {/* Animated Center Hub */}
          <Animated.View
            style={[
              styles.gaugeCenterDisc,
              {
                backgroundColor: colors.backgroundSecondary,
                transform: [{ scale: pulseAnim }],
                borderColor: ambientColor,
              },
            ]}
          >
            <Text style={[styles.speedValue, { color: colors.text }]}>{displaySpeed}</Text>
            <Text style={[styles.speedUnit, { color: ambientColor }]}>MPH</Text>
            <View style={[styles.systemStatusTag, { backgroundColor: 'rgba(0,0,0,0.4)' }]}>
              <View style={[styles.greenPulse, { backgroundColor: colors.success }]} />
              <Text style={[styles.statusText, { color: colors.textSecondary }]}>
                {systemHealth}% NOMINAL
              </Text>
            </View>
          </Animated.View>

          {/* Animated Speedometer Needle */}
          <Animated.View
            style={[
              styles.needleContainer,
              { transform: [{ rotate: needleRotation }] },
            ]}
          >
            <View style={[styles.needleLine, { backgroundColor: ambientColor }]} />
            <View style={[styles.needleTipGlow, { backgroundColor: '#fff' }]} />
          </Animated.View>
        </View>
      </View>

      {/* Real-Time Telemetry Bar (Tire Pressure, Range, Powertrain) */}
      <View style={[styles.telemetryHUD, { borderColor: colors.borderMuted }]}>
        <View style={styles.telemetryItem}>
          <Text style={[styles.telemetryLabel, { color: colors.muted }]}>RANGE</Text>
          <Text style={[styles.telemetryVal, { color: colors.text }]}>460 <Text style={{ fontSize: 11, color: colors.muted }}>KM</Text></Text>
        </View>

        <View style={styles.telemetryDivider} />

        <View style={styles.telemetryItem}>
          <Text style={[styles.telemetryLabel, { color: colors.muted }]}>TIRE SENSORS</Text>
          <Text style={[styles.telemetryVal, { color: colors.success }]}>35 PSI <Text style={{ fontSize: 11, color: colors.textSecondary }}>ALL OK</Text></Text>
        </View>

        <View style={styles.telemetryDivider} />

        <View style={styles.telemetryItem}>
          <Text style={[styles.telemetryLabel, { color: colors.muted }]}>DRIVE UNIT</Text>
          <Text style={[styles.telemetryVal, { color: ambientColor }]}>READY</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  clusterContainer: {
    borderRadius: 24,
    padding: 16,
    marginVertical: 12,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  driveModeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 14,
    padding: 4,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    borderRadius: 10,
    gap: 5,
  },
  modeIndicatorDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  modeButtonText: {
    fontSize: 10,
    letterSpacing: 0.8,
  },
  gaugeVisualWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  gaugeOuterRing: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  gaugeTrackRing: {
    position: 'absolute',
    width: 186,
    height: 186,
    borderRadius: 93,
    borderWidth: 6,
    borderStyle: 'dashed',
  },
  gaugeActiveRing: {
    position: 'absolute',
    width: 186,
    height: 186,
    borderRadius: 93,
    borderWidth: 4,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    transform: [{ rotate: '45deg' }],
  },
  gaugeCenterDisc: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 4,
    shadowColor: '#000',
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  speedValue: {
    fontSize: 44,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
    letterSpacing: -1,
  },
  speedUnit: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
    marginTop: -4,
  },
  systemStatusTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginTop: 6,
  },
  greenPulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  needleContainer: {
    position: 'absolute',
    width: 190,
    height: 190,
    alignItems: 'center',
    justifyContent: 'flex-start',
    zIndex: 3,
  },
  needleLine: {
    width: 3,
    height: 38,
    borderRadius: 1.5,
    marginTop: 8,
  },
  needleTipGlow: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    position: 'absolute',
    top: 6,
  },
  telemetryHUD: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  telemetryItem: {
    flex: 1,
    alignItems: 'center',
  },
  telemetryLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 4,
  },
  telemetryVal: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  telemetryDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
});

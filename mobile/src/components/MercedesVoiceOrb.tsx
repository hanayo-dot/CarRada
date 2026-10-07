import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import MercedesStarIcon from './MercedesStarIcon';

interface Props {
  size?: number;
  color?: string;
  isListening?: boolean;
}

export default function MercedesVoiceOrb({
  size = 90,
  color = '#00F2FE',
  isListening = false,
}: Props) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const waveAnim1 = useRef(new Animated.Value(0.8)).current;
  const waveAnim2 = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: isListening ? 1.25 : 1.08,
          duration: isListening ? 600 : 1800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.95,
          duration: isListening ? 600 : 1800,
          useNativeDriver: true,
        }),
      ])
    );

    const waveLoop1 = Animated.loop(
      Animated.sequence([
        Animated.timing(waveAnim1, {
          toValue: 1.4,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(waveAnim1, {
          toValue: 0.8,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );

    const waveLoop2 = Animated.loop(
      Animated.sequence([
        Animated.timing(waveAnim2, {
          toValue: 1.6,
          duration: 2400,
          useNativeDriver: true,
        }),
        Animated.timing(waveAnim2, {
          toValue: 0.6,
          duration: 2400,
          useNativeDriver: true,
        }),
      ])
    );

    pulseLoop.start();
    waveLoop1.start();
    waveLoop2.start();

    return () => {
      pulseLoop.stop();
      waveLoop1.stop();
      waveLoop2.stop();
    };
  }, [isListening]);

  return (
    <View style={[styles.container, { width: size * 1.8, height: size * 1.8 }]}>
      {/* Outer Acoustic Pulse Ring 2 */}
      <Animated.View
        style={[
          styles.waveRing,
          {
            width: size * 1.6,
            height: size * 1.6,
            borderRadius: (size * 1.6) / 2,
            borderColor: color,
            opacity: 0.2,
            transform: [{ scale: waveAnim2 }],
          },
        ]}
      />

      {/* Outer Acoustic Pulse Ring 1 */}
      <Animated.View
        style={[
          styles.waveRing,
          {
            width: size * 1.3,
            height: size * 1.3,
            borderRadius: (size * 1.3) / 2,
            borderColor: color,
            opacity: 0.4,
            transform: [{ scale: waveAnim1 }],
          },
        ]}
      />

      {/* Inner Glowing Orb */}
      <Animated.View
        style={[
          styles.coreOrb,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: 'rgba(5, 12, 28, 0.95)',
            borderColor: color,
            shadowColor: color,
            shadowOpacity: 0.9,
            shadowRadius: 20,
            transform: [{ scale: pulseAnim }],
          },
        ]}
      >
        <MercedesStarIcon size={size * 0.45} color={color} glow={true} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginVertical: 12,
  },
  waveRing: {
    position: 'absolute',
    borderWidth: 1.5,
  },
  coreOrb: {
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
});

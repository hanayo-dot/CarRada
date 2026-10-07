import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

interface Props {
  color?: string;
  height?: number;
  glowIntensity?: number;
}

export default function MercedesAmbientLight({
  color = '#00F2FE',
  height = 3,
  glowIntensity = 1,
}: Props) {
  const pulseAnim = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2200,
          useNativeDriver: false,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.55,
          duration: 2200,
          useNativeDriver: false,
        }),
      ])
    );
    pulse.start();

    return () => pulse.stop();
  }, [pulseAnim]);

  return (
    <View style={styles.wrapper}>
      {/* Soft diffused ambient aura */}
      <Animated.View
        style={[
          styles.glowAura,
          {
            backgroundColor: color,
            opacity: Animated.multiply(pulseAnim, 0.45 * glowIntensity),
            height: height * 5,
            shadowColor: color,
            shadowOpacity: 0.9,
            shadowRadius: 16,
          },
        ]}
      />
      {/* Intense fiber-optic laser strip */}
      <Animated.View
        style={[
          styles.strip,
          {
            backgroundColor: color,
            height,
            opacity: pulseAnim,
            shadowColor: color,
            shadowOpacity: 1,
            shadowRadius: 8,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    position: 'relative',
    overflow: 'visible',
    zIndex: 10,
  },
  glowAura: {
    width: '100%',
    position: 'absolute',
    top: 0,
    borderRadius: 8,
  },
  strip: {
    width: '100%',
    borderRadius: 2,
  },
});

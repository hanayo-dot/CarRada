import React from 'react';
import { View, StyleSheet } from 'react-native';

interface Props {
  size?: number;
  color?: string;
  glow?: boolean;
}

export default function MercedesStarIcon({ size = 28, color = '#00F2FE', glow = true }: Props) {
  const outerBorder = Math.max(1.5, size * 0.06);
  const spokeThickness = Math.max(1.5, size * 0.05);
  const spokeLength = size * 0.44;

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderColor: color,
          borderWidth: outerBorder,
          shadowColor: glow ? color : 'transparent',
          shadowOpacity: glow ? 0.8 : 0,
          shadowRadius: glow ? size * 0.3 : 0,
        },
      ]}
    >
      {/* Center hub */}
      <View
        style={[
          styles.hub,
          {
            width: size * 0.16,
            height: size * 0.16,
            borderRadius: (size * 0.16) / 2,
            backgroundColor: color,
          },
        ]}
      />

      {/* Top vertical ray (pointing straight up) */}
      <View
        style={[
          styles.spoke,
          {
            width: spokeThickness,
            height: spokeLength,
            backgroundColor: color,
            top: outerBorder,
            left: (size - spokeThickness) / 2 - outerBorder,
          },
        ]}
      />

      {/* Bottom left ray (120 degrees counterclockwise from top) */}
      <View
        style={[
          styles.spoke,
          {
            width: spokeThickness,
            height: spokeLength,
            backgroundColor: color,
            top: (size - spokeThickness) / 2 - outerBorder,
            left: (size - spokeThickness) / 2 - outerBorder,
            transform: [{ rotate: '120deg' }, { translateY: spokeLength / 2 }],
          },
        ]}
      />

      {/* Bottom right ray (120 degrees clockwise from top) */}
      <View
        style={[
          styles.spoke,
          {
            width: spokeThickness,
            height: spokeLength,
            backgroundColor: color,
            top: (size - spokeThickness) / 2 - outerBorder,
            left: (size - spokeThickness) / 2 - outerBorder,
            transform: [{ rotate: '240deg' }, { translateY: spokeLength / 2 }],
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  hub: {
    zIndex: 3,
  },
  spoke: {
    position: 'absolute',
    borderRadius: 1,
    zIndex: 2,
  },
});

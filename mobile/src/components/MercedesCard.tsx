import React, { useRef } from 'react';
import { Pressable, StyleSheet, Animated, ViewStyle, StyleProp, View } from 'react-native';
import { MercedesTheme } from '../theme';

interface Props {
  colors: MercedesTheme;
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  highlightColor?: string;
  glow?: boolean;
  disabled?: boolean;
}

export default function MercedesCard({
  colors,
  children,
  onPress,
  style,
  highlightColor,
  glow = false,
  disabled = false,
}: Props) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const accent = highlightColor || colors.primary;

  const handlePressIn = () => {
    if (disabled || !onPress) return;
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      friction: 8,
      tension: 100,
    }).start();
  };

  const handlePressOut = () => {
    if (disabled || !onPress) return;
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 6,
      tension: 80,
    }).start();
  };

  const CardWrapper = onPress ? Pressable : View;

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, styles.outer]}>
      <CardWrapper
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={[
          styles.card,
          {
            backgroundColor: colors.surfaceGlass,
            borderColor: glow ? accent : colors.border,
            shadowColor: glow ? accent : '#000',
            shadowOpacity: glow ? 0.45 : 0.25,
            shadowRadius: glow ? 14 : 8,
          },
          style,
        ]}
      >
        {/* Subtle top edge neon reflection */}
        <View style={[styles.topBezel, { backgroundColor: glow ? accent : 'rgba(255,255,255,0.06)' }]} />
        {children}
      </CardWrapper>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  outer: {
    marginVertical: 6,
  },
  card: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  topBezel: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    height: 1.5,
    borderRadius: 1,
  },
});

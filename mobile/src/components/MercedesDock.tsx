import React, { useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { MercedesTheme } from '../theme';

export type DockTab = 'Home' | 'Chat' | 'Diagnostics' | 'Vehicles' | 'Emergencies';

interface Props {
  activeTab: DockTab;
  onSelectTab: (tab: DockTab) => void;
  colors: MercedesTheme;
}

export default function MercedesDock({ activeTab, onSelectTab, colors }: Props) {
  const tabs: { key: DockTab; label: string; icon: string }[] = [
    { key: 'Home', label: 'Cockpit', icon: '⚡' },
    { key: 'Chat', label: 'MBUX AI', icon: '🤖' },
    { key: 'Diagnostics', label: 'Scanner', icon: '🔍' },
    { key: 'Vehicles', label: 'Garage', icon: '🚘' },
    { key: 'Emergencies', label: 'SOS', icon: '🚨' },
  ];

  return (
    <View style={[styles.dockContainer, { backgroundColor: 'rgba(5, 10, 22, 0.92)', borderColor: colors.border }]}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        const isSOS = tab.key === 'Emergencies';
        const activeColor = isSOS ? colors.danger : colors.primary;

        return (
          <Pressable
            key={tab.key}
            onPress={() => onSelectTab(tab.key)}
            style={styles.tabButton}
          >
            <View
              style={[
                styles.iconBubble,
                isActive && {
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  borderColor: activeColor,
                  borderWidth: 1,
                  shadowColor: activeColor,
                  shadowOpacity: 0.8,
                  shadowRadius: 10,
                },
              ]}
            >
              <Text style={styles.tabIcon}>{tab.icon}</Text>
            </View>

            <Text
              style={[
                styles.tabLabel,
                {
                  color: isActive ? '#fff' : colors.muted,
                  fontWeight: isActive ? '800' : '600',
                },
              ]}
            >
              {tab.label}
            </Text>

            {isActive && (
              <View
                style={[
                  styles.activeGlowBar,
                  { backgroundColor: activeColor, shadowColor: activeColor },
                ]}
              />
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  dockContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  tabButton: {
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    position: 'relative',
    minWidth: 58,
  },
  iconBubble: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 3,
  },
  tabIcon: {
    fontSize: 18,
  },
  tabLabel: {
    fontSize: 10,
    letterSpacing: 0.5,
  },
  activeGlowBar: {
    width: 18,
    height: 2.5,
    borderRadius: 1.5,
    marginTop: 3,
    shadowOpacity: 1,
    shadowRadius: 6,
  },
});

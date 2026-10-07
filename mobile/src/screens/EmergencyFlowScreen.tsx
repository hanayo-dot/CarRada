import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, useColorScheme, ActivityIndicator, Pressable, Animated, Easing } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { palette } from '../theme';
import { fetchEmergencyProcedure } from '../api/api';
import { RootStackParamList } from '../types';
import { getLocalEmergencyProcedure } from '../data/emergencyProcedures';
import MercedesAmbientLight from '../components/MercedesAmbientLight';
import MercedesCard from '../components/MercedesCard';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'EmergencyFlow'>;
  route: RouteProp<RootStackParamList, 'EmergencyFlow'>;
};

export default function EmergencyFlowScreen({ navigation, route }: Props) {
  const { slug } = route.params;
  const localData = getLocalEmergencyProcedure(slug);
  const [procedure, setProcedure] = useState<any>(localData || null);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(!localData);
  const [isComplete, setIsComplete] = useState(false);
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const scheme = useColorScheme();
  const colors = palette(scheme);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchEmergencyProcedure(slug);
        if (data?.steps) {
          setProcedure(data);
        }
      } catch {
        // preserve offline bundled data
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug]);

  if (loading || !procedure) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const step = procedure.steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === procedure.steps.length - 1;
  const progress = ((currentStep + 1) / procedure.steps.length) * 100;

  const handleNext = () => {
    if (isLastStep) {
      setIsComplete(true);
    } else {
      setCurrentStep(currentStep + 1);
      animateButtonPress();
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      setCurrentStep(currentStep - 1);
      animateButtonPress();
    }
  };

  const animateButtonPress = () => {
    scaleAnim.setValue(0.95);
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };

  // Completion Screen
  if (isComplete) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <MercedesAmbientLight color={colors.success} height={3} />
        <View style={styles.completeContent}>
          <View style={[styles.completeIcon, { backgroundColor: colors.success, shadowColor: colors.success }]}>
            <Text style={styles.completeCheckmark}>✓</Text>
          </View>
          <Text style={[styles.completeBadge, { color: colors.success }]}>PROCEDURE COMPLETE</Text>
          <Text style={[styles.completeTitle, { color: colors.text }]}>{procedure.title}</Text>
          <Text style={[styles.completeSubtitle, { color: colors.textSecondary }]}>
            All emergency safety checkpoints executed according to factory protocol.
          </Text>

          <MercedesCard colors={colors} style={styles.nextStepsCard} highlightColor={colors.primary}>
            <Text style={[styles.nextStepsTitle, { color: colors.primary }]}>RECOMMENDED FOLLOW-UP</Text>
            <Text style={[styles.nextStepsText, { color: colors.text }]}>
              • If the vehicle is stable, proceed with caution{'\n'}
              • If warning lights persist, consult the MBUX AI Assistant{'\n'}
              • Have a certified technician perform a post-incident inspection
            </Text>
          </MercedesCard>

          <Pressable
            style={[styles.completeButton, { backgroundColor: colors.primary, shadowColor: colors.primary }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.completeButtonText}>RETURN TO SOS COCKPIT</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // Active Step Screen
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <MercedesAmbientLight color={colors.primary} height={2} />

      <View style={styles.body}>
        {/* Step HUD Header */}
        <View style={styles.stepHeader}>
          <Text style={[styles.hudTag, { color: colors.primary }]}>MERCEDES ASSIST HUD</Text>
          <Text style={[styles.title, { color: colors.text }]}>{procedure.title}</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{procedure.summary}</Text>

          {/* Progress Bar */}
          <View style={[styles.progressBar, { backgroundColor: colors.surfaceElevated, borderColor: colors.borderMuted }]}>
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor: colors.primary,
                  width: `${progress}%`,
                  shadowColor: colors.primary,
                },
              ]}
            />
          </View>
          <View style={styles.progressRow}>
            <Text style={[styles.progressText, { color: colors.muted }]}>
              CHECKPOINT {currentStep + 1} OF {procedure.steps.length}
            </Text>
            <Text style={[styles.progressPct, { color: colors.primary }]}>{Math.round(progress)}%</Text>
          </View>
        </View>

        {/* Safety First Tip */}
        <MercedesCard colors={colors} highlightColor={colors.warning} style={styles.tipBox}>
          <Text style={[styles.tipTitle, { color: colors.warning }]}>⚠️ CRITICAL SAFETY NOTICE</Text>
          <Text style={[styles.tipText, { color: colors.text }]}>{procedure.safety_tips}</Text>
        </MercedesCard>

        {/* Step Content */}
        <MercedesCard colors={colors} highlightColor={colors.primary} glow={true} style={styles.stepCard}>
          <View style={[styles.stepBadge, { backgroundColor: colors.primary }]}>
            <Text style={styles.stepBadgeText}>{currentStep + 1}</Text>
          </View>
          <Text style={[styles.stepTitle, { color: colors.text }]}>{step.title}</Text>
          <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>{step.description}</Text>
        </MercedesCard>
      </View>

      {/* Automotive Cockpit Action Buttons */}
      <View style={[styles.buttonRow, { backgroundColor: 'rgba(7, 14, 30, 0.95)', borderColor: colors.borderMuted }]}>
        <Pressable
          style={[
            styles.navButton,
            {
              backgroundColor: isFirstStep ? 'rgba(255,255,255,0.04)' : colors.surfaceElevated,
              borderColor: colors.borderMuted,
              borderWidth: 1,
              opacity: isFirstStep ? 0.4 : 1,
            },
          ]}
          onPress={handlePrev}
          disabled={isFirstStep}
        >
          <Text style={[styles.navButtonText, { color: isFirstStep ? colors.muted : colors.text }]}>← PREV</Text>
        </Pressable>

        <Animated.View style={{ transform: [{ scale: scaleAnim }], flex: 1, marginLeft: 12 }}>
          <Pressable
            style={[
              styles.navButton,
              {
                backgroundColor: isLastStep ? colors.success : colors.primary,
                shadowColor: isLastStep ? colors.success : colors.primary,
              },
            ]}
            onPress={handleNext}
          >
            <Text style={[styles.navButtonText, { color: '#040711', fontWeight: '900' }]}>
              {isLastStep ? '✓ COMPLETE' : 'NEXT STEP →'}
            </Text>
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  body: {
    flex: 1,
    padding: 16,
  },
  stepHeader: {
    marginBottom: 12,
  },
  hudTag: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  subtitle: {
    marginTop: 4,
    marginBottom: 12,
    fontSize: 13,
    lineHeight: 18,
  },
  progressBar: {
    borderRadius: 8,
    height: 6,
    overflow: 'hidden',
    borderWidth: 1,
  },
  progressFill: {
    height: '100%',
    borderRadius: 8,
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  progressText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  progressPct: {
    fontSize: 11,
    fontWeight: '800',
  },
  tipBox: {
    padding: 14,
    marginBottom: 12,
  },
  tipTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  tipText: {
    fontSize: 12,
    lineHeight: 18,
  },
  stepCard: {
    padding: 18,
    position: 'relative',
  },
  stepBadge: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepBadgeText: {
    color: '#040711',
    fontWeight: '900',
    fontSize: 14,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
    paddingRight: 36,
  },
  stepDescription: {
    fontSize: 14,
    lineHeight: 22,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
  },
  navButton: {
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOpacity: 0.6,
    shadowRadius: 10,
  },
  navButtonText: {
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 0.8,
  },
  completeContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  completeIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowOpacity: 0.8,
    shadowRadius: 16,
  },
  completeCheckmark: {
    fontSize: 40,
    fontWeight: '900',
    color: '#040711',
  },
  completeBadge: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  completeTitle: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  completeSubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
  },
  nextStepsCard: {
    width: '100%',
    padding: 16,
    marginBottom: 24,
  },
  nextStepsTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 8,
  },
  nextStepsText: {
    fontSize: 13,
    lineHeight: 20,
  },
  completeButton: {
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 28,
    width: '100%',
    alignItems: 'center',
    shadowOpacity: 0.7,
    shadowRadius: 10,
  },
  completeButtonText: {
    color: '#040711',
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 1,
  },
});

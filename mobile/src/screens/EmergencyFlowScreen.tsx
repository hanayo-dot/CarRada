import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, useColorScheme, ActivityIndicator, Pressable, Animated, Easing } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { palette } from '../theme';
import { fetchEmergencyProcedure } from '../api/api';
import { RootStackParamList } from '../types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'EmergencyFlow'>;
  route: RouteProp<RootStackParamList, 'EmergencyFlow'>;
};

export default function EmergencyFlowScreen({ navigation, route }: Props) {
  const { slug } = route.params;
  const [procedure, setProcedure] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isComplete, setIsComplete] = useState(false);
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const scheme = useColorScheme();
  const colors = palette(scheme);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await fetchEmergencyProcedure(slug);
      setProcedure(data);
      setLoading(false);
    };
    load();
  }, [slug]);

  if (loading || !procedure) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}> 
        <ActivityIndicator size='large' color={colors.primary} />
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
      useNativeDriver: true
    }).start();
  };

  // Completion screen
  if (isComplete) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}> 
        <View style={styles.completeContent}>
          <View style={[styles.completeIcon, { backgroundColor: '#22C55E' }]}>
            <Text style={styles.completeCheckmark}>✓</Text>
          </View>
          <Text style={[styles.completeTitle, { color: colors.text }]}>You've completed all steps</Text>
          <Text style={[styles.completeSubtitle, { color: colors.muted }]}>
            {procedure.title}
          </Text>
          
          <View style={[styles.nextStepsBox, { backgroundColor: colors.surface }]}>
            <Text style={[styles.nextStepsTitle, { color: colors.primary }]}>Next steps</Text>
            <Text style={[styles.nextStepsText, { color: colors.text }]}>
              • If the issue is resolved, you're good to go{'\n'}
              • If you're still having problems, see a mechanic{'\n'}
              • Use the AI Car Assistant to get more guidance
            </Text>
          </View>

          <Pressable
            style={[styles.completeButton, { backgroundColor: colors.primary }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.completeButtonText}>Back to Emergencies</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // Regular step screen
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      <View>
        <Text style={[styles.title, { color: colors.text }]}>{procedure.title}</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>{procedure.summary}</Text>

        <View style={[styles.progressBar, { backgroundColor: colors.surface }]}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                backgroundColor: colors.primary,
                width: `${progress}%`
              }
            ]}
          />
        </View>
        <Text style={[styles.progressText, { color: colors.muted }]}>
          Step {currentStep + 1} of {procedure.steps.length}
        </Text>
      </View>

      <View style={[styles.tipBox, { backgroundColor: colors.surface }]}> 
        <Text style={[styles.tipTitle, { color: colors.primary }]}>⚠️ Safety first</Text>
        <Text style={[styles.tipText, { color: colors.text }]}>{procedure.safety_tips}</Text>
      </View>

      <View style={[styles.stepCard, { backgroundColor: colors.surface }]}> 
        <View style={[styles.stepBadge, { backgroundColor: colors.primary }]}>
          <Text style={styles.stepBadgeText}>{currentStep + 1}</Text>
        </View>
        <Text style={[styles.stepTitle, { color: colors.text }]}>{step.title}</Text>
        <Text style={[styles.stepDescription, { color: colors.muted }]}>{step.description}</Text>
      </View>

      <View style={styles.buttonRow}>
        <Pressable
          style={[
            styles.navButton,
            {
              backgroundColor: isFirstStep ? colors.surface : colors.primary,
              opacity: isFirstStep ? 0.5 : 1
            }
          ]}
          onPress={handlePrev}
          disabled={isFirstStep}
        >
          <Text style={[styles.navButtonText, { color: isFirstStep ? colors.muted : '#fff' }]}>← Previous</Text>
        </Pressable>

        <Animated.View style={{ transform: [{ scale: scaleAnim }], flex: 1, marginHorizontal: 10 }}>
          <Pressable
            style={[
              styles.navButton,
              {
                backgroundColor: isLastStep ? '#22C55E' : colors.primary
              }
            ]}
            onPress={handleNext}
          >
            <Text style={styles.navButtonText}>
              {isLastStep ? '✓ Complete' : 'Next →'}
            </Text>
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'space-between' },
  title: { fontSize: 28, fontWeight: '700' },
  subtitle: { marginTop: 8, marginBottom: 20, fontSize: 16, lineHeight: 22 },
  progressBar: { borderRadius: 12, height: 8, overflow: 'hidden', marginBottom: 8 },
  progressFill: { height: '100%', borderRadius: 12 },
  progressText: { fontSize: 13, fontWeight: '600', marginBottom: 20 },
  tipBox: { borderRadius: 18, padding: 16, marginBottom: 20 },
  tipTitle: { fontSize: 15, fontWeight: '700', marginBottom: 8 },
  tipText: { fontSize: 14, lineHeight: 20 },
  stepCard: { borderRadius: 18, padding: 20, marginBottom: 24, position: 'relative' },
  stepBadge: { position: 'absolute', top: -12, right: 20, width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  stepBadgeText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  stepTitle: { fontSize: 20, fontWeight: '700', marginBottom: 12, marginTop: 8 },
  stepDescription: { fontSize: 16, lineHeight: 24 },
  buttonRow: { flexDirection: 'row', alignItems: 'center' },
  navButton: { borderRadius: 14, paddingVertical: 16, paddingHorizontal: 20, justifyContent: 'center', alignItems: 'center' },
  navButtonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  completeContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  completeIcon: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  completeCheckmark: { fontSize: 48, fontWeight: '800', color: '#fff' },
  completeTitle: { fontSize: 26, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  completeSubtitle: { fontSize: 16, marginBottom: 28, textAlign: 'center' },
  nextStepsBox: { borderRadius: 18, padding: 18, marginBottom: 28, width: '100%' },
  nextStepsTitle: { fontSize: 15, fontWeight: '700', marginBottom: 12 },
  nextStepsText: { fontSize: 14, lineHeight: 22 },
  completeButton: { borderRadius: 14, paddingVertical: 16, paddingHorizontal: 28, width: '100%', alignItems: 'center' },
  completeButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 }
});

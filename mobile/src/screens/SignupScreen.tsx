import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, useColorScheme, Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { palette } from '../theme';
import { signup } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { RootStackParamList } from '../types';
import MercedesAmbientLight from '../components/MercedesAmbientLight';
import MercedesStarIcon from '../components/MercedesStarIcon';
import MercedesCard from '../components/MercedesCard';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Signup'>;
};

export default function SignupScreen({ navigation }: Props) {
  const scheme = useColorScheme();
  const colors = palette(scheme);
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      Alert.alert('Required Fields', 'Driver email and password are required.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Security Notice', 'Driver access key must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const result = await signup(trimmedEmail, password, name.trim() || undefined);
      await signIn(result.token);
    } catch (error: any) {
      Alert.alert('Registration Failed', error.response?.data?.message || 'Could not register driver profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <MercedesAmbientLight color={colors.primary} height={3} />

      <View style={styles.inner}>
        <View style={styles.brandCenter}>
          <MercedesStarIcon size={56} color={colors.primary} glow={true} />
          <Text style={[styles.mBrand, { color: colors.primary }]}>MERCEDES-BENZ MBUX</Text>
          <Text style={[styles.title, { color: colors.text }]}>New Driver Key</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Initialize personalized digital garage and diagnostic telemetry
          </Text>
        </View>

        <MercedesCard colors={colors} highlightColor={colors.primary} glow={true} style={styles.formCard}>
          <View style={styles.inputWrap}>
            <Text style={[styles.inputLabel, { color: colors.muted }]}>DRIVER NAME</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surfaceElevated, color: colors.text, borderColor: colors.borderMuted }]}
              placeholder="Driver Full Name"
              placeholderTextColor={colors.muted}
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.inputWrap}>
            <Text style={[styles.inputLabel, { color: colors.muted }]}>DRIVER EMAIL</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surfaceElevated, color: colors.text, borderColor: colors.borderMuted }]}
              placeholder="driver@carrada.ai"
              placeholderTextColor={colors.muted}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputWrap}>
            <Text style={[styles.inputLabel, { color: colors.muted }]}>ACCESS KEY (MIN 6 CHARACTERS)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surfaceElevated, color: colors.text, borderColor: colors.borderMuted }]}
              placeholder="••••••••••••"
              placeholderTextColor={colors.muted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <Pressable
            style={[styles.button, { backgroundColor: colors.primary, shadowColor: colors.primary }]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#040711" />
            ) : (
              <Text style={styles.buttonText}>REGISTER & INITIALIZE COCKPIT</Text>
            )}
          </Pressable>
        </MercedesCard>

        <Pressable onPress={() => navigation.goBack()} style={styles.linkWrap}>
          <Text style={[styles.link, { color: colors.textSecondary }]}>
            Already registered? <Text style={{ color: colors.primary, fontWeight: '800' }}>Driver Sign In →</Text>
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1, padding: 20, justifyContent: 'center' },
  brandCenter: { alignItems: 'center', marginBottom: 20 },
  mBrand: { fontSize: 10, fontWeight: '900', letterSpacing: 2, marginTop: 12, marginBottom: 2 },
  title: { fontSize: 26, fontWeight: '900', letterSpacing: 0.5 },
  subtitle: { fontSize: 13, marginTop: 4, textAlign: 'center' },
  formCard: { padding: 18, marginBottom: 12 },
  inputWrap: { marginBottom: 12 },
  inputLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 1, marginBottom: 6 },
  input: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
  },
  button: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 6,
    shadowOpacity: 0.8,
    shadowRadius: 12,
  },
  buttonText: { color: '#040711', fontWeight: '900', fontSize: 13, letterSpacing: 1 },
  linkWrap: { padding: 10, alignItems: 'center' },
  link: { fontSize: 13 },
});

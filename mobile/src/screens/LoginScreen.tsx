import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, useColorScheme, Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { palette } from '../theme';
import { login } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { RootStackParamList } from '../types';
import MercedesAmbientLight from '../components/MercedesAmbientLight';
import MercedesStarIcon from '../components/MercedesStarIcon';
import MercedesCard from '../components/MercedesCard';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Login'>;
};

export default function LoginScreen({ navigation }: Props) {
  const scheme = useColorScheme();
  const colors = palette(scheme);
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      Alert.alert('Authentication Incomplete', 'Please enter your driver email and password.');
      return;
    }

    setLoading(true);
    try {
      const result = await login(trimmedEmail, password);
      await signIn(result.token);
    } catch (error: any) {
      Alert.alert('Driver Authentication Failed', error.response?.data?.message || 'Invalid driver credentials.');
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
        {/* Mercedes Cockpit Brand Header */}
        <View style={styles.brandCenter}>
          <MercedesStarIcon size={64} color={colors.primary} glow={true} />
          <Text style={[styles.mBrand, { color: colors.primary }]}>MERCEDES-BENZ MBUX</Text>
          <Text style={[styles.title, { color: colors.text }]}>CarRada Cockpit</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Keyless driver authentication & vehicle telemetry profile
          </Text>
        </View>

        <MercedesCard colors={colors} highlightColor={colors.primary} glow={true} style={styles.formCard}>
          <View style={styles.inputWrap}>
            <Text style={[styles.inputLabel, { color: colors.muted }]}>DRIVER IDENTITY / EMAIL</Text>
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
            <Text style={[styles.inputLabel, { color: colors.muted }]}>ACCESS KEY / PASSWORD</Text>
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
              <Text style={styles.buttonText}>START ENGINE & AUTHENTICATE</Text>
            )}
          </Pressable>
        </MercedesCard>

        <Pressable onPress={() => navigation.navigate('Signup')} style={styles.linkWrap}>
          <Text style={[styles.link, { color: colors.textSecondary }]}>
            New driver? <Text style={{ color: colors.primary, fontWeight: '800' }}>Register Driver Key →</Text>
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1, padding: 20, justifyContent: 'center' },
  brandCenter: { alignItems: 'center', marginBottom: 24 },
  mBrand: { fontSize: 10, fontWeight: '900', letterSpacing: 2, marginTop: 14, marginBottom: 2 },
  title: { fontSize: 28, fontWeight: '900', letterSpacing: 0.5 },
  subtitle: { fontSize: 13, marginTop: 4, textAlign: 'center' },
  formCard: { padding: 18, marginBottom: 12 },
  inputWrap: { marginBottom: 14 },
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

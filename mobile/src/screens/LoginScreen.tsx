import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, useColorScheme, Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { palette } from '../theme';
import { login } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { RootStackParamList } from '../types';

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
      Alert.alert('Required Fields', 'Please enter your email and password.');
      return;
    }

    setLoading(true);
    try {
      const result = await login(trimmedEmail, password);
      await signIn(result.token);
    } catch (error: any) {
      Alert.alert('Login failed', error.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.inner}>
        <Text style={[styles.title, { color: colors.text }]}>Sign in</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>Use your CarRada account to continue.</Text>

        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
          placeholder="Email"
          placeholderTextColor={colors.muted}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
          placeholder="Password"
          placeholderTextColor={colors.muted}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <Pressable
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Sign in</Text>
          )}
        </Pressable>

        <Pressable onPress={() => navigation.navigate('Signup')} style={{ padding: 8 }}>
          <Text style={[styles.link, { color: colors.primary }]}>Create an account</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1, padding: 24, justifyContent: 'center' },
  title: { fontSize: 34, fontWeight: '800', marginBottom: 8 },
  subtitle: { fontSize: 16, marginBottom: 28, lineHeight: 24 },
  input: { borderRadius: 14, padding: 16, fontSize: 16, marginBottom: 16 },
  button: { borderRadius: 14, padding: 16, alignItems: 'center', marginBottom: 12 },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  link: { marginTop: 12, textAlign: 'center', fontSize: 15 }
});

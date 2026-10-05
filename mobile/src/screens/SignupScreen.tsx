import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, useColorScheme, Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { palette } from '../theme';
import { signup } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { RootStackParamList } from '../types';

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
      Alert.alert('Required Fields', 'Email and password are required.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      const result = await signup(trimmedEmail, password, name.trim() || undefined);
      await signIn(result.token);
    } catch (error: any) {
      Alert.alert('Signup failed', error.response?.data?.message || 'Could not create account.');
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
        <Text style={[styles.title, { color: colors.text }]}>Create account</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>Register for CarRada and manage your vehicles.</Text>

        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
          placeholder="Full name"
          placeholderTextColor={colors.muted}
          value={name}
          onChangeText={setName}
        />
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
          placeholder="Password (min 6 chars)"
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
            <Text style={styles.buttonText}>Create account</Text>
          )}
        </Pressable>

        <Pressable onPress={() => navigation.goBack()} style={{ padding: 8 }}>
          <Text style={[styles.link, { color: colors.primary }]}>Already have an account? Sign in</Text>
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

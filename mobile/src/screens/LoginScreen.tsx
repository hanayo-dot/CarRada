import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, useColorScheme, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { palette } from '../theme';
import { login } from '../api/api';
import { RootStackParamList } from '../types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Login'>;
  route: any;
  setToken: (token: string | null) => void;
};

export default function LoginScreen({ navigation, setToken }: Props) {
  const scheme = useColorScheme();
  const colors = palette(scheme);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const result = await login(email, password);
      setToken(result.token);
    } catch (error: any) {
      Alert.alert('Login failed', error.response?.data?.message || 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      <Text style={[styles.title, { color: colors.text }]}>Sign in</Text>
      <Text style={[styles.subtitle, { color: colors.muted }]}>Use your CarRada account to continue.</Text>
      <TextInput style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]} placeholder='Email' placeholderTextColor={colors.muted} value={email} onChangeText={setEmail} autoCapitalize='none' keyboardType='email-address' />
      <TextInput style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]} placeholder='Password' placeholderTextColor={colors.muted} value={password} onChangeText={setPassword} secureTextEntry />
      <Pressable style={[styles.button, { backgroundColor: colors.primary }]} onPress={handleSubmit} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Signing in…' : 'Sign in'}</Text>
      </Pressable>
      <Pressable onPress={() => navigation.navigate('Signup')}>
        <Text style={[styles.link, { color: colors.primary }]}>Create an account</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 34, fontWeight: '800', marginBottom: 8 },
  subtitle: { fontSize: 16, marginBottom: 28, lineHeight: 24 },
  input: { borderRadius: 14, padding: 16, fontSize: 16, marginBottom: 16 },
  button: { borderRadius: 14, padding: 16, alignItems: 'center', marginBottom: 12 },
  buttonText: { color: '#fff', fontWeight: '700' },
  link: { marginTop: 12, textAlign: 'center', fontSize: 15 }
});

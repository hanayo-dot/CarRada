import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, useColorScheme, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { palette } from '../theme';
import { signup } from '../api/api';
import { RootStackParamList } from '../types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Signup'>;
  setToken: (token: string | null) => void;
};

export default function SignupScreen({ navigation, setToken }: Props) {
  const scheme = useColorScheme();
  const colors = palette(scheme);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const result = await signup(email, password, name);
      setToken(result.token);
    } catch (error: any) {
      Alert.alert('Signup failed', error.response?.data?.message || 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      <Text style={[styles.title, { color: colors.text }]}>Create account</Text>
      <Text style={[styles.subtitle, { color: colors.muted }]}>Register for CarRada and save your vehicles.</Text>
      <TextInput style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]} placeholder='Full name' placeholderTextColor={colors.muted} value={name} onChangeText={setName} />
      <TextInput style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]} placeholder='Email' placeholderTextColor={colors.muted} value={email} onChangeText={setEmail} autoCapitalize='none' keyboardType='email-address' />
      <TextInput style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]} placeholder='Password' placeholderTextColor={colors.muted} value={password} onChangeText={setPassword} secureTextEntry />
      <Pressable style={[styles.button, { backgroundColor: colors.primary }]} onPress={handleSubmit} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Creating…' : 'Create account'}</Text>
      </Pressable>
      <Pressable onPress={() => navigation.goBack()}>
        <Text style={[styles.link, { color: colors.primary }]}>Already have an account? Sign in</Text>
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

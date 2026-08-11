import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, useColorScheme, ActivityIndicator, Alert, ScrollView, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { palette } from '../theme';
import { translateMechanicText, analyzeWarningLightImage } from '../api/api';

export default function MechanicTranslatorScreen() {
  const scheme = useColorScheme();
  const colors = palette(scheme);
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [result, setResult] = useState<{ explanation: string; urgency: string; questions: string[] } | null>(null);
  const [warningLightResult, setWarningLightResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'text' | 'image'>('text');

  const handleTranslate = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const response = await translateMechanicText(input.trim());
      setResult(response);
      setWarningLightResult(null);
    } catch (error: any) {
      Alert.alert('Translation failed', error.response?.data?.message || 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8
      });

      if (!result.canceled) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Image picker failed', 'Could not open image library');
    }
  };

  const takePhoto = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission needed', 'Camera access is required to take photos');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8
      });

      if (!result.canceled) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Camera failed', 'Could not open camera');
    }
  };

  const handleAnalyzeImage = async () => {
    if (!selectedImage) return;

    setLoading(true);
    try {
      // Convert image to base64
      const response = await fetch(selectedImage);
      const blob = await response.blob();
      const reader = new FileReader();
      
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const mimeType = blob.type || 'image/jpeg';

        try {
          const analysis = await analyzeWarningLightImage(base64, mimeType);
          setWarningLightResult(analysis);
          setResult(null);
          setLoading(false);
        } catch (error: any) {
          Alert.alert('Analysis failed', error.response?.data?.message || 'Please try again.');
          setLoading(false);
        }
      };

      reader.readAsDataURL(blob);
    } catch (error: any) {
      Alert.alert('Error', 'Could not process image');
      setLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <Text style={[styles.title, { color: colors.text }]}>Mechanic Translator</Text>
      <Text style={[styles.subtitle, { color: colors.muted }]}>Get plain-language explanations for mechanic notes or identify dashboard warning lights.</Text>

      <View style={[styles.modeSelector, { backgroundColor: colors.surface }]}>
        <Pressable
          style={[styles.modeButton, { backgroundColor: mode === 'text' ? colors.primary : 'transparent' }]}
          onPress={() => { setMode('text'); setSelectedImage(null); }}
        >
          <Text style={[styles.modeButtonText, { color: mode === 'text' ? '#fff' : colors.text }]}>📝 Text note</Text>
        </Pressable>
        <Pressable
          style={[styles.modeButton, { backgroundColor: mode === 'image' ? colors.primary : 'transparent' }]}
          onPress={() => { setMode('image'); setInput(''); }}
        >
          <Text style={[styles.modeButtonText, { color: mode === 'image' ? '#fff' : colors.text }]}>📷 Photo</Text>
        </Pressable>
      </View>

      {mode === 'text' ? (
        <>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
            placeholder='Paste mechanic note or describe the issue'
            placeholderTextColor={colors.muted}
            value={input}
            onChangeText={setInput}
            multiline
          />
          <Pressable style={[styles.button, { backgroundColor: colors.primary }]} onPress={handleTranslate} disabled={loading || !input.trim()}>
            {loading ? <ActivityIndicator color='#fff' /> : <Text style={styles.buttonText}>Translate note</Text>}
          </Pressable>
          {result ? (
            <View style={[styles.resultBox, { backgroundColor: colors.surface }]}>
              <Text style={[styles.resultHeading, { color: colors.primary }]}>Explanation</Text>
              <Text style={[styles.resultText, { color: colors.text }]}>{result.explanation}</Text>
              <Text style={[styles.resultHeading, { color: colors.primary, marginTop: 16 }]}>Urgency</Text>
              <Text style={[styles.resultText, { color: colors.text }]}>{result.urgency}</Text>
              <Text style={[styles.resultHeading, { color: colors.primary, marginTop: 16 }]}>Questions to ask</Text>
              {result.questions.map((question, index) => (
                <Text key={index} style={[styles.resultText, { color: colors.text }]}>• {question}</Text>
              ))}
            </View>
          ) : null}
        </>
      ) : (
        <>
          <View style={[styles.imageSection, { backgroundColor: colors.surface }]}>
            {selectedImage ? (
              <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Text style={[styles.imagePlaceholderText, { color: colors.muted }]}>No photo selected</Text>
              </View>
            )}
          </View>

          <View style={styles.buttonGroup}>
            <Pressable style={[styles.button, { backgroundColor: colors.primary, flex: 1 }]} onPress={takePhoto}>
              <Text style={styles.buttonText}>📷 Take photo</Text>
            </Pressable>
            <Pressable style={[styles.button, { backgroundColor: colors.primary, flex: 1, marginLeft: 10 }]} onPress={pickImage}>
              <Text style={styles.buttonText}>🖼️ Pick from library</Text>
            </Pressable>
          </View>

          {selectedImage && (
            <Pressable style={[styles.button, { backgroundColor: '#22C55E' }]} onPress={handleAnalyzeImage} disabled={loading}>
              {loading ? <ActivityIndicator color='#fff' /> : <Text style={styles.buttonText}>Analyze warning lights</Text>}
            </Pressable>
          )}

          {warningLightResult ? (
            <View style={[styles.resultBox, { backgroundColor: colors.surface }]}>
              <Text style={[styles.resultHeading, { color: colors.primary }]}>Identified lights</Text>
              {warningLightResult.identified.length > 0 ? (
                warningLightResult.identified.map((light: string, index: number) => (
                  <Text key={index} style={[styles.resultText, { color: colors.text }]}>• {light}</Text>
                ))
              ) : (
                <Text style={[styles.resultText, { color: colors.text }]}>No clear warning lights detected</Text>
              )}

              <Text style={[styles.resultHeading, { color: colors.primary, marginTop: 16 }]}>What it means</Text>
              <Text style={[styles.resultText, { color: colors.text }]}>{warningLightResult.meaning}</Text>

              <Text style={[styles.resultHeading, { color: colors.primary, marginTop: 16 }]}>Urgency</Text>
              <Text style={[styles.resultText, { color: colors.text }]}>{warningLightResult.urgency}</Text>

              <Text style={[styles.resultHeading, { color: colors.primary, marginTop: 16 }]}>What to do</Text>
              <Text style={[styles.resultText, { color: colors.text }]}>{warningLightResult.recommendation}</Text>

              {warningLightResult.uncertainty && (
                <>
                  <Text style={[styles.resultHeading, { color: '#F59E0B', marginTop: 16 }]}>Note</Text>
                  <Text style={[styles.resultText, { color: colors.text }]}>{warningLightResult.uncertainty}</Text>
                </>
              )}

              <Text style={[styles.confidenceText, { color: colors.muted, marginTop: 12 }]}>Confidence: {warningLightResult.confidence}</Text>
            </View>
          ) : null}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: '700' },
  subtitle: { marginTop: 6, marginBottom: 20, fontSize: 16, lineHeight: 22 },
  modeSelector: { flexDirection: 'row', borderRadius: 14, padding: 4, marginBottom: 20 },
  modeButton: { flex: 1, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  modeButtonText: { fontWeight: '700', fontSize: 14 },
  input: { borderRadius: 18, padding: 16, fontSize: 16, minHeight: 140, marginBottom: 16 },
  button: { borderRadius: 18, padding: 16, alignItems: 'center', marginBottom: 16 },
  buttonText: { color: '#fff', fontWeight: '700' },
  buttonGroup: { flexDirection: 'row', marginBottom: 16 },
  imageSection: { borderRadius: 18, overflow: 'hidden', marginBottom: 16, height: 250 },
  selectedImage: { width: '100%', height: '100%' },
  imagePlaceholder: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  imagePlaceholderText: { fontSize: 14 },
  resultBox: { borderRadius: 18, padding: 18, marginTop: 8 },
  resultHeading: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  resultText: { fontSize: 15, lineHeight: 22, marginBottom: 8 },
  confidenceText: { fontSize: 13, fontStyle: 'italic' }
});

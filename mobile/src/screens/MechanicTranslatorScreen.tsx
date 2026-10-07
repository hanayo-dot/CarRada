import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, useColorScheme, ActivityIndicator, Alert, ScrollView, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { palette } from '../theme';
import { translateMechanicText, analyzeWarningLightImage } from '../api/api';
import MercedesAmbientLight from '../components/MercedesAmbientLight';
import MercedesCard from '../components/MercedesCard';

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
      Alert.alert('Translation Failure', error.response?.data?.message || 'Unable to decode mechanic notes.');
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!res.canceled) {
        setSelectedImage(res.assets[0].uri);
      }
    } catch {
      Alert.alert('Optical Sensor Error', 'Could not open image library');
    }
  };

  const takePhoto = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Camera Access', 'Optical permissions needed to scan cluster warning lights.');
        return;
      }

      const res = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!res.canceled) {
        setSelectedImage(res.assets[0].uri);
      }
    } catch {
      Alert.alert('Camera Error', 'Could not activate optical camera.');
    }
  };

  const handleAnalyzeImage = async () => {
    if (!selectedImage) return;

    setLoading(true);
    try {
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
          Alert.alert('Optical Analysis Failed', error.response?.data?.message || 'Failed to detect cluster lights.');
          setLoading(false);
        }
      };

      reader.readAsDataURL(blob);
    } catch {
      Alert.alert('Processing Error', 'Could not parse sensor image');
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <MercedesAmbientLight color={colors.primary} height={2} />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.hudLabel, { color: colors.primary }]}>MBUX OPTICAL & LINGUISTIC DECODER</Text>
          <Text style={[styles.title, { color: colors.text }]}>Mechanic & Light Translator</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Demystify dealer estimates and decode illuminated dashboard instrument warning symbols.
          </Text>
        </View>

        {/* Mode Selector HUD Pill */}
        <View style={[styles.modeSelector, { backgroundColor: colors.surfaceElevated, borderColor: colors.borderMuted }]}>
          <Pressable
            style={[
              styles.modeButton,
              mode === 'text' && { backgroundColor: colors.primary, shadowColor: colors.primary, shadowOpacity: 0.8 },
            ]}
            onPress={() => { setMode('text'); setSelectedImage(null); }}
          >
            <Text style={[styles.modeButtonText, { color: mode === 'text' ? '#040711' : colors.textSecondary }]}>
              📝 MECHANIC NOTE
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.modeButton,
              mode === 'image' && { backgroundColor: colors.primary, shadowColor: colors.primary, shadowOpacity: 0.8 },
            ]}
            onPress={() => { setMode('image'); setInput(''); }}
          >
            <Text style={[styles.modeButtonText, { color: mode === 'image' ? '#040711' : colors.textSecondary }]}>
              📷 CLUSTER OPTICAL SCAN
            </Text>
          </Pressable>
        </View>

        {mode === 'text' ? (
          <>
            <MercedesCard colors={colors} highlightColor={colors.primary} style={styles.card}>
              <Text style={[styles.sectionHeading, { color: colors.primary }]}>PASTE ESTIMATE OR MECHANIC NOTE</Text>
              <TextInput
                style={[styles.textArea, { backgroundColor: colors.surfaceElevated, color: colors.text, borderColor: colors.borderMuted }]}
                placeholder='e.g., "Found lower control arm bushings torn, play in outer tie rod end, recommend alignment..."'
                placeholderTextColor={colors.muted}
                value={input}
                onChangeText={setInput}
                multiline
              />
            </MercedesCard>

            <Pressable
              style={[styles.actionButton, { backgroundColor: colors.primary, shadowColor: colors.primary }]}
              onPress={handleTranslate}
              disabled={loading || !input.trim()}
            >
              {loading ? (
                <ActivityIndicator color='#040711' />
              ) : (
                <Text style={styles.actionButtonText}>TRANSLATE INTO PLAIN ENGLISH</Text>
              )}
            </Pressable>

            {result && (
              <MercedesCard colors={colors} highlightColor={colors.success} glow={true} style={styles.resultCard}>
                <View style={styles.resultHeader}>
                  <Text style={[styles.resultTag, { color: colors.success }]}>✓ DECODED ANALYSIS</Text>
                  <View style={[styles.urgencyTag, { borderColor: colors.warning }]}>
                    <Text style={[styles.urgencyText, { color: colors.warning }]}>PRIORITY: {result.urgency.toUpperCase()}</Text>
                  </View>
                </View>

                <Text style={[styles.resultSubhead, { color: colors.muted }]}>WHAT IT ACTUALLY MEANS</Text>
                <Text style={[styles.resultBody, { color: colors.text }]}>{result.explanation}</Text>

                <Text style={[styles.resultSubhead, { color: colors.muted, marginTop: 14 }]}>QUESTIONS TO ASK YOUR MECHANIC</Text>
                {result.questions.map((q, idx) => (
                  <View key={idx} style={styles.questionItem}>
                    <Text style={[styles.bullet, { color: colors.primary }]}>▸</Text>
                    <Text style={[styles.questionText, { color: colors.textSecondary }]}>{q}</Text>
                  </View>
                ))}
              </MercedesCard>
            )}
          </>
        ) : (
          <>
            {/* Camera Viewfinder with HUD Reticle */}
            <View style={[styles.viewfinderContainer, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
              {selectedImage ? (
                <Image source={{ uri: selectedImage }} style={styles.viewfinderImage} />
              ) : (
                <View style={styles.viewfinderPlaceholder}>
                  {/* Futuristic HUD corner reticles */}
                  <View style={[styles.cornerReticle, styles.cornerTL, { borderColor: colors.primary }]} />
                  <View style={[styles.cornerReticle, styles.cornerTR, { borderColor: colors.primary }]} />
                  <View style={[styles.cornerReticle, styles.cornerBL, { borderColor: colors.primary }]} />
                  <View style={[styles.cornerReticle, styles.cornerBR, { borderColor: colors.primary }]} />

                  <Text style={styles.viewfinderIcon}>🎯</Text>
                  <Text style={[styles.viewfinderTitle, { color: colors.text }]}>ALIGN WARNING LIGHT IN RETICLE</Text>
                  <Text style={[styles.viewfinderSub, { color: colors.muted }]}>
                    Take a clear snapshot of your instrument cluster lights
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.photoActions}>
              <Pressable
                style={[styles.photoButton, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}
                onPress={takePhoto}
              >
                <Text style={styles.photoButtonText}>📸 SNAP CLUSTER</Text>
              </Pressable>
              <Pressable
                style={[styles.photoButton, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}
                onPress={pickImage}
              >
                <Text style={styles.photoButtonText}>🖼️ ALBUM PHOTO</Text>
              </Pressable>
            </View>

            {selectedImage && (
              <Pressable
                style={[styles.actionButton, { backgroundColor: colors.success, shadowColor: colors.success }]}
                onPress={handleAnalyzeImage}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color='#040711' />
                ) : (
                  <Text style={styles.actionButtonText}>RUN MBUX OPTICAL RECOGNITION</Text>
                )}
              </Pressable>
            )}

            {warningLightResult && (
              <MercedesCard colors={colors} highlightColor={colors.warning} glow={true} style={styles.resultCard}>
                <View style={styles.resultHeader}>
                  <Text style={[styles.resultTag, { color: colors.warning }]}>IDENTIFIED CLUSTER SYMBOLS</Text>
                  <Text style={[styles.urgencyText, { color: colors.primary }]}>{warningLightResult.confidence}</Text>
                </View>

                {warningLightResult.identified.map((light: string, idx: number) => (
                  <Text key={idx} style={[styles.symbolPill, { color: colors.warning }]}>
                    ⚠️ {light}
                  </Text>
                ))}

                <Text style={[styles.resultSubhead, { color: colors.muted, marginTop: 12 }]}>SYSTEM IMPACT</Text>
                <Text style={[styles.resultBody, { color: colors.text }]}>{warningLightResult.meaning}</Text>

                <Text style={[styles.resultSubhead, { color: colors.muted, marginTop: 12 }]}>ACTION REQUIRED</Text>
                <Text style={[styles.resultBody, { color: colors.text }]}>{warningLightResult.recommendation}</Text>
              </MercedesCard>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 16,
  },
  hudLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  modeSelector: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 1,
    padding: 4,
    marginBottom: 16,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  modeButtonText: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  card: {
    marginBottom: 14,
    padding: 16,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 10,
  },
  textArea: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    minHeight: 110,
    fontSize: 14,
    lineHeight: 20,
  },
  actionButton: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  actionButtonText: {
    color: '#040711',
    fontWeight: '900',
    fontSize: 13,
    letterSpacing: 1,
  },
  resultCard: {
    padding: 18,
    marginTop: 4,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  resultTag: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },
  urgencyTag: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  urgencyText: {
    fontSize: 10,
    fontWeight: '800',
  },
  resultSubhead: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  resultBody: {
    fontSize: 14,
    lineHeight: 21,
  },
  questionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 6,
    gap: 8,
  },
  bullet: {
    fontSize: 14,
    fontWeight: '800',
  },
  questionText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  viewfinderContainer: {
    height: 240,
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 14,
  },
  viewfinderImage: {
    width: '100%',
    height: '100%',
  },
  viewfinderPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    position: 'relative',
  },
  cornerReticle: {
    position: 'absolute',
    width: 24,
    height: 24,
  },
  cornerTL: { top: 16, left: 16, borderTopWidth: 2, borderLeftWidth: 2 },
  cornerTR: { top: 16, right: 16, borderTopWidth: 2, borderRightWidth: 2 },
  cornerBL: { bottom: 16, left: 16, borderBottomWidth: 2, borderLeftWidth: 2 },
  cornerBR: { bottom: 16, right: 16, borderBottomWidth: 2, borderRightWidth: 2 },
  viewfinderIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  viewfinderTitle: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },
  viewfinderSub: {
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
  },
  photoActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  photoButton: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  photoButtonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 0.8,
  },
  symbolPill: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
  },
});

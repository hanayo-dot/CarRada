import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'carrada_auth_token';

// Automatically adapt to Android emulator (10.0.2.2) vs iOS/web (localhost) vs EXPO_PUBLIC_API_URL
const defaultBaseUrl = Platform.OS === 'android' ? 'http://10.0.2.2:4000' : 'http://localhost:4000';
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || defaultBaseUrl;

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export async function getStoredToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch (error) {
    console.warn('[SecureStore] Failed to read auth token:', error);
    return null;
  }
}

export async function storeToken(token: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  } catch (error) {
    console.warn('[SecureStore] Failed to store auth token:', error);
  }
}

export async function removeStoredToken(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch (error) {
    console.warn('[SecureStore] Failed to remove auth token:', error);
  }
}

export function setAuthToken(token: string | null) {
  if (token) {
    client.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete client.defaults.headers.common.Authorization;
  }
}

export async function signup(email: string, password: string, name?: string) {
  const response = await client.post('/auth/signup', { email, password, name });
  return response.data;
}

export async function login(email: string, password: string) {
  const response = await client.post('/auth/login', { email, password });
  return response.data;
}

export async function fetchCurrentUser() {
  const response = await client.get('/auth/me');
  return response.data.user;
}

export async function fetchVehicles() {
  const response = await client.get('/vehicles');
  return response.data;
}

export async function createVehicle(data: any) {
  const response = await client.post('/vehicles', data);
  return response.data;
}

export async function updateVehicle(id: number, data: any) {
  const response = await client.put(`/vehicles/${id}`, data);
  return response.data;
}

export async function deleteVehicle(id: number) {
  await client.delete(`/vehicles/${id}`);
}

export async function sendChat(messages: any[], vehicleId?: number, sessionId?: number) {
  const response = await client.post('/assistant/chat', { messages, vehicleId, sessionId });
  return response.data;
}

export async function fetchConversationHistory() {
  const response = await client.get('/conversations/history');
  return response.data;
}

export async function createDiagnosticSession(sessionName: string, vehicleId?: number) {
  const response = await client.post('/diagnostics', { sessionName, vehicleId });
  return response.data;
}

export async function fetchDiagnosticSessions() {
  const response = await client.get('/diagnostics');
  return response.data;
}

export async function fetchDiagnosticSession(sessionId: number) {
  const response = await client.get(`/diagnostics/${sessionId}`);
  return response.data;
}

export async function generateDiagnosticSummary(sessionId: number) {
  const response = await client.post(`/diagnostics/${sessionId}/summary`);
  return response.data;
}

export async function translateMechanicText(text: string) {
  const response = await client.post('/assistant/translate', { text });
  return response.data.summary;
}

export async function fetchReminders() {
  const response = await client.get('/reminders');
  return response.data;
}

export async function createReminder(data: any) {
  const response = await client.post('/reminders', data);
  return response.data;
}

export async function updateReminder(id: number, data: any) {
  const response = await client.put(`/reminders/${id}`, data);
  return response.data;
}

export async function deleteReminder(id: number) {
  await client.delete(`/reminders/${id}`);
}

export async function analyzeWarningLightImage(imageBase64: string, mimeType: string) {
  const response = await client.post('/assistant/analyze-warning-light', { imageBase64, mimeType });
  return response.data.analysis;
}

export async function analyzeAudio(audioBase64: string, mimeType: string) {
  const response = await client.post('/assistant/analyze-audio', { audioBase64, mimeType });
  return response.data.analysis;
}

export async function fetchEmergencyList() {
  const response = await client.get('/emergencies');
  return response.data;
}

export async function fetchEmergencyProcedure(slug: string) {
  const response = await client.get(`/emergencies/${slug}`);
  return response.data;
}

export async function fetchLessons() {
  const response = await client.get('/lessons');
  return response.data;
}

export async function estimateRepairCost(description: string, vehicleId?: number) {
  const response = await client.post('/assistant/cost-estimate', { description, vehicleId });
  return response.data;
}

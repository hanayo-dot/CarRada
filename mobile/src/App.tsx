import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View, Pressable, Text } from 'react-native';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import HomeScreen from './screens/HomeScreen';
import VehiclesScreen from './screens/VehiclesScreen';
import VehicleEditorScreen from './screens/VehicleEditorScreen';
import ChatScreen from './screens/ChatScreen';
import EmergenciesScreen from './screens/EmergenciesScreen';
import EmergencyFlowScreen from './screens/EmergencyFlowScreen';
import MaintenanceRemindersScreen from './screens/MaintenanceRemindersScreen';
import MechanicTranslatorScreen from './screens/MechanicTranslatorScreen';
import SymptomDiagnosticsScreen from './screens/SymptomDiagnosticsScreen';
import DailyLessonsScreen from './screens/DailyLessonsScreen';
import RepairCostEstimatorScreen from './screens/RepairCostEstimatorScreen';
import DiagnosticSessionsScreen from './screens/DiagnosticSessionsScreen';
import DiagnosticSessionDetailScreen from './screens/DiagnosticSessionDetailScreen';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

function NavigationRoot() {
  const { token, loading, signOut } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0B1320' }}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: true }}>
      {token ? (
        <>
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{
              title: 'CarRada',
              headerRight: () => (
                <Pressable onPress={signOut} style={{ padding: 8 }}>
                  <Text style={{ color: '#EF4444', fontWeight: '600', fontSize: 14 }}>Sign Out</Text>
                </Pressable>
              ),
            }}
          />
          <Stack.Screen name="Vehicles" component={VehiclesScreen} options={{ title: 'Vehicles' }} />
          <Stack.Screen name="VehicleEditor" component={VehicleEditorScreen} options={{ title: 'Vehicle' }} />
          <Stack.Screen name="Chat" component={ChatScreen} options={{ title: 'AI Car Assistant' }} />
          <Stack.Screen name="MechanicTranslator" component={MechanicTranslatorScreen} options={{ title: 'Mechanic Translator' }} />
          <Stack.Screen name="Diagnostics" component={DiagnosticSessionsScreen} options={{ title: 'Diagnostics' }} />
          <Stack.Screen
            name="DiagnosticSession"
            component={DiagnosticSessionDetailScreen}
            options={({ route }) => ({ title: route.params.sessionName })}
          />
          <Stack.Screen name="Emergencies" component={EmergenciesScreen} options={{ title: 'Emergency Assistant' }} />
          <Stack.Screen
            name="EmergencyFlow"
            component={EmergencyFlowScreen}
            options={({ route }) => ({ title: route.params.title })}
          />
          <Stack.Screen name="Reminders" component={MaintenanceRemindersScreen} options={{ title: 'Reminders' }} />
          <Stack.Screen name="SymptomDiagnostics" component={SymptomDiagnosticsScreen} options={{ title: 'Symptom Diagnostics' }} />
          <Stack.Screen name="Lessons" component={DailyLessonsScreen} options={{ title: 'Daily Lessons' }} />
          <Stack.Screen name="RepairCostEstimator" component={RepairCostEstimatorScreen} options={{ title: 'Repair Cost Estimator' }} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Sign In', headerShown: false }} />
          <Stack.Screen name="Signup" component={SignupScreen} options={{ title: 'Sign Up', headerShown: false }} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <NavigationRoot />
      </NavigationContainer>
    </AuthProvider>
  );
}

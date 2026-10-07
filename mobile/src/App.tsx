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
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: '#050A16' },
        headerTintColor: '#00F2FE',
        headerTitleStyle: {
          fontWeight: '800',
          fontSize: 18,
          color: '#FFFFFF',
        },
        headerShadowVisible: false,
      }}
    >
      {token ? (
        <>
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{
              title: 'MBUX COCKPIT',
              headerRight: () => (
                <Pressable
                  onPress={signOut}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 10,
                    backgroundColor: 'rgba(239, 68, 68, 0.15)',
                    borderColor: 'rgba(239, 68, 68, 0.4)',
                    borderWidth: 1,
                  }}
                >
                  <Text style={{ color: '#FF4D4D', fontWeight: '800', fontSize: 12, letterSpacing: 0.5 }}>
                    SIGN OUT
                  </Text>
                </Pressable>
              ),
            }}
          />
          <Stack.Screen name="Vehicles" component={VehiclesScreen} options={{ title: 'VIRTUAL GARAGE' }} />
          <Stack.Screen name="VehicleEditor" component={VehicleEditorScreen} options={{ title: 'VEHICLE TELEMETRY' }} />
          <Stack.Screen name="Chat" component={ChatScreen} options={{ title: 'MBUX AI ASSISTANT' }} />
          <Stack.Screen name="MechanicTranslator" component={MechanicTranslatorScreen} options={{ title: 'HUD TRANSLATOR' }} />
          <Stack.Screen name="Diagnostics" component={DiagnosticSessionsScreen} options={{ title: 'DIAGNOSTIC RADAR' }} />
          <Stack.Screen
            name="DiagnosticSession"
            component={DiagnosticSessionDetailScreen}
            options={({ route }) => ({ title: route.params.sessionName.toUpperCase() })}
          />
          <Stack.Screen name="Emergencies" component={EmergenciesScreen} options={{ title: 'MERCEDES SOS COCKPIT' }} />
          <Stack.Screen
            name="EmergencyFlow"
            component={EmergencyFlowScreen}
            options={({ route }) => ({ title: route.params.title.toUpperCase() })}
          />
          <Stack.Screen name="Reminders" component={MaintenanceRemindersScreen} options={{ title: 'SERVICE SCHEDULE' }} />
          <Stack.Screen name="SymptomDiagnostics" component={SymptomDiagnosticsScreen} options={{ title: 'SYMPTOM SCANNER' }} />
          <Stack.Screen name="Lessons" component={DailyLessonsScreen} options={{ title: 'DRIVER MASTERCLASS' }} />
          <Stack.Screen name="RepairCostEstimator" component={RepairCostEstimatorScreen} options={{ title: 'SERVICE ESTIMATOR' }} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'SIGN IN', headerShown: false }} />
          <Stack.Screen name="Signup" component={SignupScreen} options={{ title: 'SIGN UP', headerShown: false }} />
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

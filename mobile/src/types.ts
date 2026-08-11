export type Vehicle = {
  id: number;
  user_id: number;
  name: string;
  make: string;
  model: string;
  year: number;
  trim?: string;
  engine?: string;
  fuel_type?: string;
  transmission?: string;
  mileage?: number;
  vin?: string;
};

export type User = {
  id: number;
  email: string;
  name?: string;
};

export type ConversationMessage = {
  role: 'user' | 'assistant';
  message: string;
};

export type EmergencyItem = {
  slug: string;
  title: string;
  summary: string;
  safety_tips: string;
};

export type EmergencyProcedure = EmergencyItem & {
  steps: { title: string; description: string }[];
};

export type MechanicTranslationResult = {
  explanation: string;
  urgency: string;
  questions: string[];
};

export type DiagnosticMessage = {
  role: 'user' | 'assistant';
  message: string;
  created_at: string;
};

export type DiagnosticSession = {
  id: number;
  session_name: string;
  status: string;
  created_at: string;
  updated_at: string;
  make?: string;
  model?: string;
  year?: number;
};

export type DiagnosticSessionDetail = DiagnosticSession & {
  messages: DiagnosticMessage[];
};

export type Reminder = {
  id: number;
  description: string;
  due_date: string | null;
  due_mileage: number | null;
  completed: boolean;
  notification_enabled?: boolean;
  notification_days?: number | null;
  notification_at?: string | null;
  created_at: string;
  updated_at: string;
};

export type Lesson = {
  id: number;
  title: string;
  description: string;
  content: string[];
  tags: string[];
};

export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  Home: undefined;
  Vehicles: undefined;
  VehicleEditor: { vehicleId?: number } | undefined;
  Chat: undefined;
  MechanicTranslator: undefined;
  Diagnostics: undefined;
  DiagnosticSession: { sessionId: number; sessionName: string };
  Emergencies: undefined;
  EmergencyFlow: { slug: string; title: string };
  Reminders: undefined;
  SymptomDiagnostics: undefined;
  Lessons: undefined;
  RepairCostEstimator: undefined;
};

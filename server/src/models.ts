export interface User {
  id: number;
  email: string;
  name?: string;
  created_at: string;
  updated_at: string;
}

export interface Vehicle {
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
  created_at: string;
  updated_at: string;
}

export interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  message: string;
  created_at?: string;
}

export interface EmergencyProcedure {
  slug: string;
  title: string;
  summary: string;
  safety_tips: string;
  steps: { title: string; description: string }[];
}

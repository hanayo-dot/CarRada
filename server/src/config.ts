import dotenv from 'dotenv';

dotenv.config();

export const PORT = process.env.PORT || '4000';
export const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://carbuddy:carbuddy@localhost:5432/carbuddy';
export const JWT_SECRET = process.env.JWT_SECRET || 'unsafe-default-jwt-secret';
export const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY || '';

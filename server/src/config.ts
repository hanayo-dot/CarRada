import dotenv from 'dotenv';

dotenv.config();

export const NODE_ENV = process.env.NODE_ENV || 'development';
export const PORT = process.env.PORT || '4000';
export const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://carbuddy:carbuddy@localhost:5432/carbuddy';

const rawJwtSecret = process.env.JWT_SECRET;
if (!rawJwtSecret) {
  if (NODE_ENV === 'production') {
    throw new Error('FATAL: JWT_SECRET environment variable must be set in production.');
  } else {
    console.warn('[SECURITY WARNING] JWT_SECRET is not set. Using temporary development secret. Do NOT use in production!');
  }
}
export const JWT_SECRET = rawJwtSecret || 'dev-only-secret-change-me-in-production';

export const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY || '';
export const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
export const CLAUDE_API_KEY = ANTHROPIC_API_KEY; // Backward compatibility alias

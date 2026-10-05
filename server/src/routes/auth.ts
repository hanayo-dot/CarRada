import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query } from '../db';
import { JWT_SECRET } from '../config';

const router = express.Router();

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

router.post('/signup', async (req, res, next) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({ message: 'Please provide a valid email address.' });
    }

    if (String(password).length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    try {
      const result = await query(
        'INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id, email, name, created_at, updated_at',
        [normalizedEmail, passwordHash, name ? String(name).trim() : null]
      );

      const user = result.rows[0];
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

      return res.status(201).json({ user, token });
    } catch (dbError: any) {
      if (dbError.code === '23505') {
        return res.status(409).json({ message: 'An account with this email already exists.' });
      }
      throw dbError;
    }
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const result = await query('SELECT id, email, name, password_hash FROM users WHERE email = $1', [normalizedEmail]);
    const user = result.rows[0];
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    delete user.password_hash;
    return res.json({ user, token });
  } catch (error) {
    next(error);
  }
});

router.get('/me', authenticate, async (req, res, next) => {
  try {
    const userId = (req as any).userId;
    const result = await query('SELECT id, email, name, created_at, updated_at FROM users WHERE id = $1', [userId]);
    if (!result.rows.length) {
      return res.status(404).json({ message: 'User not found.' });
    }
    return res.json({ user: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

export function authenticate(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing authorization token.' });
  }

  const token = authHeader.replace('Bearer ', '');
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: number };
    (req as any).userId = payload.userId;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired authorization token.' });
  }
}

export default router;

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Request, Response, NextFunction } from 'express';
import { query } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export function generateToken(userId: string, email: string) {
  return jwt.sign({ id: userId, email }, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as { id: string; email: string };
  } catch (error) {
    return null;
  }
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  req.user = decoded;
  next();
}

export async function registerUser(email: string, password: string, name: string) {
  const hashedPassword = await hashPassword(password);
  const result = await query(
    `INSERT INTO auth_users (email, password, name) VALUES ($1, $2, $3) RETURNING id`,
    [email, hashedPassword, name]
  );
  
  const userId = result.rows[0].id;
  
  // Also insert into profiles table
  await query(
    `INSERT INTO profiles (id, name) VALUES ($1, $2)`,
    [userId, name]
  );
  
  return userId;
}

export async function loginUser(email: string, password: string) {
  const result = await query(
    `SELECT id, email, password FROM auth_users WHERE email = $1`,
    [email]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const user = result.rows[0];
  const passwordMatch = await comparePassword(password, user.password);

  if (!passwordMatch) {
    return null;
  }

  return user;
}

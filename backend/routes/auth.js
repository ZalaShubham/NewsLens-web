import { Router } from 'express';
import { randomBytes, scrypt, timingSafeEqual, createHash } from 'crypto';
import { promisify } from 'util';
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { AuthSession } from '../models/AuthSession.js';

const router = Router();
const scryptAsync = promisify(scrypt);
const SESSION_DAYS = 30;

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email };
}

function hashToken(token) {
  return createHash('sha256').update(token).digest('hex');
}

async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const key = await scryptAsync(password, salt, 64);
  return `${salt}:${key.toString('hex')}`;
}

async function verifyPassword(password, storedHash) {
  const [salt, keyHex] = storedHash.split(':');
  if (!salt || !keyHex) return false;
  const expected = Buffer.from(keyHex, 'hex');
  const actual = await scryptAsync(password, salt, expected.length);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

function authError(res, status, message) {
  return res.status(status).json({ error: message });
}

async function issueSession(user, res, status = 200) {
  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await AuthSession.create({ user: user._id, tokenHash: hashToken(token), expiresAt });
  return res.status(status).json({ token, user: publicUser(user) });
}

async function requireAuth(req, res, next) {
  if (mongoose.connection.readyState !== 1) {
    return authError(res, 503, 'Account service is unavailable until the database is connected.');
  }

  const authorization = req.get('authorization') || '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
  if (!token) return authError(res, 401, 'Sign in to continue.');

  try {
    const session = await AuthSession.findOne({
      tokenHash: hashToken(token),
      expiresAt: { $gt: new Date() },
    }).populate('user');
    if (!session?.user) return authError(res, 401, 'Your session has expired. Please sign in again.');
    req.authSession = session;
    req.authUser = session.user;
    return next();
  } catch (error) {
    return next(error);
  }
}

router.post('/signup', async (req, res, next) => {
  const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = typeof req.body.password === 'string' ? req.body.password : '';

  if (name.length < 1 || name.length > 80) {
    return authError(res, 400, 'Name must be between 1 and 80 characters.');
  }
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return authError(res, 400, 'Enter a valid email address.');
  }
  if (password.length < 8 || password.length > 128) {
    return authError(res, 400, 'Password must be between 8 and 128 characters.');
  }
  if (mongoose.connection.readyState !== 1) {
    return authError(res, 503, 'Account service is unavailable until the database is connected.');
  }

  try {
    const existing = await User.findOne({ email }).select('_id');
    if (existing) return authError(res, 409, 'An account with this email already exists.');

    const user = await User.create({ name, email, passwordHash: await hashPassword(password) });
    return await issueSession(user, res, 201);
  } catch (error) {
    if (error.code === 11000) return authError(res, 409, 'An account with this email already exists.');
    return next(error);
  }
});

router.post('/login', async (req, res, next) => {
  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = typeof req.body.password === 'string' ? req.body.password : '';
  if (!email || !password) return authError(res, 400, 'Enter your email and password.');
  if (mongoose.connection.readyState !== 1) {
    return authError(res, 503, 'Account service is unavailable until the database is connected.');
  }

  try {
    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return authError(res, 401, 'Email or password is incorrect.');
    }
    return await issueSession(user, res);
  } catch (error) {
    return next(error);
  }
});

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: publicUser(req.authUser) });
});

router.post('/logout', requireAuth, async (req, res, next) => {
  try {
    await req.authSession.deleteOne();
    return res.json({ message: 'Signed out.' });
  } catch (error) {
    return next(error);
  }
});

export default router;

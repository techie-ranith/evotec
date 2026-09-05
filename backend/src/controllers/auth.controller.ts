import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import { User } from '../models/User';
import { issueTokenPair, verifyRefreshToken } from '../utils/tokens';

function publicUser(user: { _id: { toString(): string }; email: string; role: string }) {
  return {
    id: user._id.toString(),
    email: user.email,
    role: user.role,
  };
}

export async function registerCustomer(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body as {
      email: string;
      password: string;
    };

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      res.status(409).json({ message: 'Email is already registered' });
      return;
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      email: email.toLowerCase(),
      password: hashed,
      role: 'CUSTOMER',
    });

    const tokens = issueTokenPair(user);
    res.status(201).json({
      message: 'Customer registered successfully',
      user: publicUser(user),
      ...tokens,
    });
  } catch (error) {
    console.error('registerCustomer error:', error);
    res.status(500).json({ message: 'Failed to register customer' });
  }
}

async function loginWithRole(
  req: Request,
  res: Response,
  expectedRole: 'CUSTOMER' | 'ADMIN'
): Promise<void> {
  try {
    const { email, password } = req.body as { email: string; password: string };
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user || user.role !== expectedRole) {
      res.status(401).json({
        message:
          expectedRole === 'CUSTOMER'
            ? 'Invalid credentials or not a customer account'
            : 'Invalid credentials or not an admin account',
      });
      return;
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    const tokens = issueTokenPair(user);
    res.json({
      message: 'Login successful',
      user: publicUser(user),
      ...tokens,
    });
  } catch (error) {
    console.error('login error:', error);
    res.status(500).json({ message: 'Failed to login' });
  }
}

export async function loginCustomer(req: Request, res: Response): Promise<void> {
  await loginWithRole(req, res, 'CUSTOMER');
}

export async function loginAdmin(req: Request, res: Response): Promise<void> {
  await loginWithRole(req, res, 'ADMIN');
}

export async function createAdmin(req: Request, res: Response): Promise<void> {
  try {
    const { email } = req.body as { email: string };
    const normalized = email.toLowerCase();

    const existing = await User.findOne({ email: normalized });
    if (existing) {
      res.status(409).json({ message: 'Admin email must be unique' });
      return;
    }

    const generatedPassword = crypto.randomBytes(9).toString('base64url').slice(0, 12);
    const hashed = await bcrypt.hash(generatedPassword, 10);

    const user = await User.create({
      email: normalized,
      password: hashed,
      role: 'ADMIN',
    });

    res.status(201).json({
      message: 'Admin created successfully',
      user: publicUser(user),
      generatedPassword,
    });
  } catch (error) {
    console.error('createAdmin error:', error);
    res.status(500).json({ message: 'Failed to create admin' });
  }
}

export async function refreshTokens(req: Request, res: Response): Promise<void> {
  try {
    const { refreshToken } = req.body as { refreshToken: string };
    const payload = verifyRefreshToken(refreshToken);
    const user = await User.findById(payload.sub);

    if (!user) {
      res.status(401).json({ message: 'Invalid refresh token' });
      return;
    }

    const tokens = issueTokenPair(user);
    res.json({
      message: 'Tokens refreshed',
      user: publicUser(user),
      ...tokens,
    });
  } catch {
    res.status(401).json({ message: 'Invalid or expired refresh token' });
  }
}

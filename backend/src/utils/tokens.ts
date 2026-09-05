import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';
import { UserRole } from '../models/User';

export interface AccessTokenPayload {
  sub: string;
  email: string;
  role: UserRole;
}

export interface RefreshTokenPayload {
  sub: string;
  email: string;
  role: UserRole;
  type: 'refresh';
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not set`);
  }
  return value;
}

export function signAccessToken(user: {
  _id: Types.ObjectId;
  email: string;
  role: UserRole;
}): string {
  const payload: AccessTokenPayload = {
    sub: user._id.toString(),
    email: user.email,
    role: user.role,
  };

  return jwt.sign(payload, requireEnv('JWT_ACCESS_SECRET'), {
    expiresIn: (process.env.JWT_ACCESS_EXPIRES || '15m') as jwt.SignOptions['expiresIn'],
  });
}

export function signRefreshToken(user: {
  _id: Types.ObjectId;
  email: string;
  role: UserRole;
}): string {
  const payload: RefreshTokenPayload = {
    sub: user._id.toString(),
    email: user.email,
    role: user.role,
    type: 'refresh',
  };

  return jwt.sign(payload, requireEnv('JWT_REFRESH_SECRET'), {
    expiresIn: (process.env.JWT_REFRESH_EXPIRES || '7d') as jwt.SignOptions['expiresIn'],
  });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, requireEnv('JWT_ACCESS_SECRET')) as AccessTokenPayload;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  const payload = jwt.verify(
    token,
    requireEnv('JWT_REFRESH_SECRET')
  ) as RefreshTokenPayload;

  if (payload.type !== 'refresh') {
    throw new Error('Invalid refresh token');
  }

  return payload;
}

export function issueTokenPair(user: {
  _id: Types.ObjectId;
  email: string;
  role: UserRole;
}) {
  return {
    accessToken: signAccessToken(user),
    refreshToken: signRefreshToken(user),
  };
}

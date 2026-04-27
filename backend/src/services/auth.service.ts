import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { userRepository } from '../repositories/user.repo';
import { authRepository } from '../repositories/auth.repo';
import { redis } from './redis.service';
import { AppError } from '../types/errors';

export class AuthService {
  async register(data: any) {
    const existingUser = await userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new AppError('Email already in use', 409);
    }
    const hash = await bcrypt.hash(data.password, 12);
    const user = await userRepository.create({
      email: data.email,
      password: hash,
      first_name: data.firstName,
      last_name: data.lastName
    });
    return user;
  }

  async login({ email, password }: any) {
    const user = await userRepository.findByEmail(email);
    if (!user) throw new AppError('Invalid credentials', 401);
    
    const isValid = await bcrypt.compare(password, user.password!);
    if (!isValid) throw new AppError('Invalid credentials', 401);
    if (!user.is_active) throw new AppError('Account is inactive', 403);
    
    const accessToken = jwt.sign(
      { sub: user.id, email: user.email, role: user.role },
      process.env.JWT_ACCESS_SECRET!,
      { expiresIn: (process.env.JWT_ACCESS_EXPIRES_IN || '15m') as any }
    );

    const refreshToken = jwt.sign(
      { sub: user.id },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as any }
    );

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    
    await authRepository.revokeTokenDb(user.id);
    await authRepository.storeRefreshToken(user.id, refreshToken, expiresAt);
    await redis.set(`refresh:${user.id}`, refreshToken, 'EX', 604800);

    const { password: _, ...userWithoutPassword } = user;
    return { accessToken, refreshToken, user: userWithoutPassword };
  }

  async refresh({ refreshToken }: { refreshToken: string }) {
    try {
      const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as { sub: string };
      const storedToken = await redis.get(`refresh:${payload.sub}`);
      
      if (!storedToken || storedToken !== refreshToken) {
        throw new AppError('Invalid or expired token', 401);
      }

      await redis.del(`refresh:${payload.sub}`);
      
      const user = await userRepository.findById(payload.sub);
      if (!user || !user.is_active) throw new AppError('Invalid user', 401);

      const accessToken = jwt.sign(
        { sub: user.id, email: user.email, role: user.role },
        process.env.JWT_ACCESS_SECRET!,
        { expiresIn: (process.env.JWT_ACCESS_EXPIRES_IN || '15m') as any }
      );

      const newRefreshToken = jwt.sign(
        { sub: user.id },
        process.env.JWT_REFRESH_SECRET!,
        { expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as any }
      );

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);
      
      await authRepository.revokeTokenDb(user.id);
      await authRepository.storeRefreshToken(user.id, newRefreshToken, expiresAt);
      await redis.set(`refresh:${user.id}`, newRefreshToken, 'EX', 604800);

      return { accessToken, refreshToken: newRefreshToken };
    } catch {
      throw new AppError('Invalid or expired refresh token', 401);
    }
  }

  async logout(userId: string) {
    await redis.del(`refresh:${userId}`);
    await authRepository.revokeTokenDb(userId);
  }
}

export const authService = new AuthService();

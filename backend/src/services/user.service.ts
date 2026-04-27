import { userRepository } from '../repositories/user.repo';
import { AppError } from '../types/errors';
import bcrypt from 'bcryptjs';

export class UserService {
  async list(page: number, limit: number) {
    return await userRepository.findAll(page, limit);
  }

  async create(data: any) {
    const existingUser = await userRepository.findByEmail(data.email);
    if (existingUser) throw new AppError('Email already in use', 409);
    const hash = await bcrypt.hash(data.password, 10);
    return await userRepository.create({
      email: data.email,
      password: hash,
      first_name: data.firstName,
      last_name: data.lastName,
      role: data.role
    });
  }

  async update(id: string, data: { role?: string; isActive?: boolean }) {
    const user = await userRepository.findById(id);
    if (!user) throw new AppError('User not found', 404);
    return await userRepository.update(id, {
      role: data.role as any,
      is_active: data.isActive
    });
  }

  async getMe(id: string) {
    const user = await userRepository.findById(id);
    if (!user) throw new AppError('User not found', 404);
    const { password, ...details } = user;
    return details;
  }

  async updateMe(id: string, data: any) {
    const user = await userRepository.findById(id);
    if (!user) throw new AppError('User not found', 404);
    
    if (data.newPassword) {
      if (!data.currentPassword) throw new AppError('Current password required', 400);
      const isValid = await bcrypt.compare(data.currentPassword, user.password!);
      if (!isValid) throw new AppError('Invalid current password', 401);
      data.password = await bcrypt.hash(data.newPassword, 10);
    }
    
    const { password: _, ...updated } = await userRepository.update(id, {
      first_name: data.firstName,
      last_name: data.lastName,
      password: data.password,
      avatar: data.avatar
    });
    return updated;
  }
}

export const userService = new UserService();

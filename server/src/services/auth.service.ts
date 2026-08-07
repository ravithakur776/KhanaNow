import { userRepository } from '../repositories/user.repository.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { ApiError } from '../utils/apiError.js';
import { IUserDocument } from '../models/user.model.js';

export interface RegisterDTO {
  name: string;
  email: string;
  phone: string;
  password: string;
  role?: 'customer' | 'restaurant_owner' | 'delivery_partner' | 'admin';
}

export interface LoginDTO {
  email: string;
  password: string;
}

export class AuthService {
  async register(dto: RegisterDTO) {
    const existingEmail = await userRepository.findByEmail(dto.email);
    if (existingEmail) {
      throw new ApiError(400, 'User with this email already exists', 'EMAIL_TAKEN');
    }

    const existingPhone = await userRepository.findByPhone(dto.phone);
    if (existingPhone) {
      throw new ApiError(400, 'User with this phone number already exists', 'PHONE_TAKEN');
    }

    const passwordHash = await hashPassword(dto.password);
    const user = await userRepository.create({
      name: dto.name,
      email: dto.email,
      phone: dto.phone,
      passwordHash,
      role: dto.role || 'customer',
      isVerified: true, // Auto-verify for dev MVP
    });

    const accessToken = generateAccessToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    const refreshTokenHash = await hashPassword(refreshToken);
    await userRepository.updateRefreshTokenHash(user._id.toString(), refreshTokenHash);

    return {
      user: this.sanitizeUser(user),
      accessToken,
      refreshToken,
    };
  }

  async login(dto: LoginDTO) {
    const user = await userRepository.findByEmail(dto.email);
    if (!user) {
      throw new ApiError(401, 'Invalid email or password credentials', 'INVALID_CREDENTIALS');
    }

    const isMatch = await comparePassword(dto.password, user.passwordHash);
    if (!isMatch) {
      throw new ApiError(401, 'Invalid email or password credentials', 'INVALID_CREDENTIALS');
    }

    const accessToken = generateAccessToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    const refreshTokenHash = await hashPassword(refreshToken);
    await userRepository.updateRefreshTokenHash(user._id.toString(), refreshTokenHash);

    return {
      user: this.sanitizeUser(user),
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(refreshToken: string) {
    if (!refreshToken) {
      throw new ApiError(401, 'Refresh token missing', 'TOKEN_MISSING');
    }

    try {
      const payload = verifyRefreshToken(refreshToken);
      const user = await userRepository.findById(payload.userId);

      if (!user || !user.refreshTokenHash) {
        throw new ApiError(401, 'Invalid session or revoked token', 'INVALID_REFRESH_TOKEN');
      }

      const isTokenValid = await comparePassword(refreshToken, user.refreshTokenHash);
      if (!isTokenValid) {
        throw new ApiError(401, 'Refresh token re-use or invalid session', 'INVALID_REFRESH_TOKEN');
      }

      const newAccessToken = generateAccessToken({
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      });

      const newRefreshToken = generateRefreshToken({
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      });

      const newRefreshTokenHash = await hashPassword(newRefreshToken);
      await userRepository.updateRefreshTokenHash(user._id.toString(), newRefreshTokenHash);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        user: this.sanitizeUser(user),
      };
    } catch (error: any) {
      throw new ApiError(401, 'Invalid or expired refresh token', 'EXPIRED_REFRESH_TOKEN');
    }
  }

  async logout(userId: string) {
    await userRepository.updateRefreshTokenHash(userId, null);
  }

  private sanitizeUser(user: IUserDocument) {
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatarUrl: user.avatarUrl,
      addresses: user.addresses,
    };
  }
}

export const authService = new AuthService();

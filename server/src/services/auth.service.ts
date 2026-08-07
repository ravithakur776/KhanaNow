import { userRepository } from '../repositories/user.repository.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { ApiError } from '../utils/apiError.js';
import { IUserDocument } from '../models/user.model.js';

export interface RegisterDTO {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  role?: 'customer' | 'restaurant_owner' | 'delivery_partner' | 'admin';
  acceptTerms: boolean;
  newsletterOptIn?: boolean;
}

export interface LoginDTO {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export class AuthService {
  async register(dto: RegisterDTO) {
    const existingEmail = await userRepository.findByEmail(dto.email);
    if (existingEmail) {
      throw new ApiError(400, 'User with this email address already exists', 'EMAIL_TAKEN');
    }

    const existingPhone = await userRepository.findByPhone(dto.phone);
    if (existingPhone) {
      throw new ApiError(400, 'User with this phone number already exists', 'PHONE_TAKEN');
    }

    const passwordHash = await hashPassword(dto.password);
    const mockOTP = '123456'; // Default OTP for dev testing
    const otpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    const user = await userRepository.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      phone: dto.phone,
      passwordHash,
      role: dto.role || 'customer',
      isVerified: false,
      verificationOTP: mockOTP,
      verificationOTPExpires: otpExpires,
      newsletterOptIn: dto.newsletterOptIn || false,
    });

    return {
      user: this.sanitizeUser(user),
      message: 'Registration successful. Verification OTP sent to email.',
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

    if (!user.isVerified) {
      throw new ApiError(403, 'Email address not verified. Please verify your email first.', 'EMAIL_NOT_VERIFIED');
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

  async verifyEmail(email: string, otp: string) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new ApiError(404, 'User account not found', 'USER_NOT_FOUND');
    }

    if (user.isVerified) {
      return { message: 'Email already verified. You can log in.' };
    }

    if (!user.verificationOTP || user.verificationOTP !== otp) {
      throw new ApiError(400, 'Invalid OTP code provided', 'INVALID_OTP');
    }

    if (user.verificationOTPExpires && new Date() > user.verificationOTPExpires) {
      throw new ApiError(400, 'OTP code has expired. Please request a new one.', 'EXPIRED_OTP');
    }

    await userRepository.verifyUserEmail(user._id.toString());
    return { message: 'Email address verified successfully! You can now log in.' };
  }

  async resendVerification(email: string) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new ApiError(404, 'User account not found', 'USER_NOT_FOUND');
    }

    if (user.isVerified) {
      return { message: 'User is already verified.' };
    }

    const newOTP = '123456';
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await userRepository.setVerificationOTP(user._id.toString(), newOTP, expiresAt);

    return { message: 'Verification OTP has been resent to your email.' };
  }

  async forgotPassword(email: string) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      // Security best practice: don't reveal user existence
      return { message: 'If an account exists with this email, an OTP code has been sent.' };
    }

    const resetOTP = '654321'; // Default reset OTP for dev testing
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await userRepository.setResetPasswordOTP(user._id.toString(), resetOTP, expiresAt);

    return { message: 'Password reset OTP code sent to your email.' };
  }

  async resetPassword(email: string, otp: string, newPassword: string) {
    const user = await userRepository.findByEmail(email);
    if (!user || !user.resetPasswordToken || user.resetPasswordToken !== otp) {
      throw new ApiError(400, 'Invalid OTP code or password reset token', 'INVALID_TOKEN');
    }

    if (user.resetPasswordExpires && new Date() > user.resetPasswordExpires) {
      throw new ApiError(400, 'Password reset token has expired', 'EXPIRED_TOKEN');
    }

    const newPasswordHash = await hashPassword(newPassword);
    await userRepository.updatePassword(user._id.toString(), newPasswordHash);

    return { message: 'Password reset successful. You can now log in with your new password.' };
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
      firstName: user.firstName,
      lastName: user.lastName,
      name: `${user.firstName} ${user.lastName}`.trim(),
      email: user.email,
      phone: user.phone,
      role: user.role,
      isVerified: user.isVerified,
      avatarUrl: user.avatarUrl,
      addresses: user.addresses,
    };
  }
}

export const authService = new AuthService();

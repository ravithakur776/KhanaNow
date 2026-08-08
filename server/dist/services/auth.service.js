"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = exports.AuthService = void 0;
const user_repository_js_1 = require("../repositories/user.repository.js");
const password_js_1 = require("../utils/password.js");
const jwt_js_1 = require("../utils/jwt.js");
const apiError_js_1 = require("../utils/apiError.js");
class AuthService {
    async register(dto) {
        const existingEmail = await user_repository_js_1.userRepository.findByEmail(dto.email);
        if (existingEmail) {
            throw new apiError_js_1.ApiError(400, 'User with this email address already exists', 'EMAIL_TAKEN');
        }
        const existingPhone = await user_repository_js_1.userRepository.findByPhone(dto.phone);
        if (existingPhone) {
            throw new apiError_js_1.ApiError(400, 'User with this phone number already exists', 'PHONE_TAKEN');
        }
        const passwordHash = await (0, password_js_1.hashPassword)(dto.password);
        const mockOTP = '123456'; // Default OTP for dev testing
        const otpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
        const user = await user_repository_js_1.userRepository.create({
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
    async login(dto) {
        const user = await user_repository_js_1.userRepository.findByEmail(dto.email);
        if (!user) {
            throw new apiError_js_1.ApiError(401, 'Invalid email or password credentials', 'INVALID_CREDENTIALS');
        }
        const isMatch = await (0, password_js_1.comparePassword)(dto.password, user.passwordHash);
        if (!isMatch) {
            throw new apiError_js_1.ApiError(401, 'Invalid email or password credentials', 'INVALID_CREDENTIALS');
        }
        if (!user.isVerified) {
            throw new apiError_js_1.ApiError(403, 'Email address not verified. Please verify your email first.', 'EMAIL_NOT_VERIFIED');
        }
        const accessToken = (0, jwt_js_1.generateAccessToken)({
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
        });
        const refreshToken = (0, jwt_js_1.generateRefreshToken)({
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
        });
        const refreshTokenHash = await (0, password_js_1.hashPassword)(refreshToken);
        await user_repository_js_1.userRepository.updateRefreshTokenHash(user._id.toString(), refreshTokenHash);
        return {
            user: this.sanitizeUser(user),
            accessToken,
            refreshToken,
        };
    }
    async verifyEmail(email, otp) {
        const user = await user_repository_js_1.userRepository.findByEmail(email);
        if (!user) {
            throw new apiError_js_1.ApiError(404, 'User account not found', 'USER_NOT_FOUND');
        }
        if (user.isVerified) {
            return { message: 'Email already verified. You can log in.' };
        }
        if (!user.verificationOTP || user.verificationOTP !== otp) {
            throw new apiError_js_1.ApiError(400, 'Invalid OTP code provided', 'INVALID_OTP');
        }
        if (user.verificationOTPExpires && new Date() > user.verificationOTPExpires) {
            throw new apiError_js_1.ApiError(400, 'OTP code has expired. Please request a new one.', 'EXPIRED_OTP');
        }
        await user_repository_js_1.userRepository.verifyUserEmail(user._id.toString());
        return { message: 'Email address verified successfully! You can now log in.' };
    }
    async resendVerification(email) {
        const user = await user_repository_js_1.userRepository.findByEmail(email);
        if (!user) {
            throw new apiError_js_1.ApiError(404, 'User account not found', 'USER_NOT_FOUND');
        }
        if (user.isVerified) {
            return { message: 'User is already verified.' };
        }
        const newOTP = '123456';
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
        await user_repository_js_1.userRepository.setVerificationOTP(user._id.toString(), newOTP, expiresAt);
        return { message: 'Verification OTP has been resent to your email.' };
    }
    async forgotPassword(email) {
        const user = await user_repository_js_1.userRepository.findByEmail(email);
        if (!user) {
            // Security best practice: don't reveal user existence
            return { message: 'If an account exists with this email, an OTP code has been sent.' };
        }
        const resetOTP = '654321'; // Default reset OTP for dev testing
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
        await user_repository_js_1.userRepository.setResetPasswordOTP(user._id.toString(), resetOTP, expiresAt);
        return { message: 'Password reset OTP code sent to your email.' };
    }
    async resetPassword(email, otp, newPassword) {
        const user = await user_repository_js_1.userRepository.findByEmail(email);
        if (!user || !user.resetPasswordToken || user.resetPasswordToken !== otp) {
            throw new apiError_js_1.ApiError(400, 'Invalid OTP code or password reset token', 'INVALID_TOKEN');
        }
        if (user.resetPasswordExpires && new Date() > user.resetPasswordExpires) {
            throw new apiError_js_1.ApiError(400, 'Password reset token has expired', 'EXPIRED_TOKEN');
        }
        const newPasswordHash = await (0, password_js_1.hashPassword)(newPassword);
        await user_repository_js_1.userRepository.updatePassword(user._id.toString(), newPasswordHash);
        return { message: 'Password reset successful. You can now log in with your new password.' };
    }
    async refreshToken(refreshToken) {
        if (!refreshToken) {
            throw new apiError_js_1.ApiError(401, 'Refresh token missing', 'TOKEN_MISSING');
        }
        try {
            const payload = (0, jwt_js_1.verifyRefreshToken)(refreshToken);
            const user = await user_repository_js_1.userRepository.findById(payload.userId);
            if (!user || !user.refreshTokenHash) {
                throw new apiError_js_1.ApiError(401, 'Invalid session or revoked token', 'INVALID_REFRESH_TOKEN');
            }
            const isTokenValid = await (0, password_js_1.comparePassword)(refreshToken, user.refreshTokenHash);
            if (!isTokenValid) {
                throw new apiError_js_1.ApiError(401, 'Refresh token re-use or invalid session', 'INVALID_REFRESH_TOKEN');
            }
            const newAccessToken = (0, jwt_js_1.generateAccessToken)({
                userId: user._id.toString(),
                email: user.email,
                role: user.role,
            });
            const newRefreshToken = (0, jwt_js_1.generateRefreshToken)({
                userId: user._id.toString(),
                email: user.email,
                role: user.role,
            });
            const newRefreshTokenHash = await (0, password_js_1.hashPassword)(newRefreshToken);
            await user_repository_js_1.userRepository.updateRefreshTokenHash(user._id.toString(), newRefreshTokenHash);
            return {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
                user: this.sanitizeUser(user),
            };
        }
        catch (error) {
            throw new apiError_js_1.ApiError(401, 'Invalid or expired refresh token', 'EXPIRED_REFRESH_TOKEN');
        }
    }
    async logout(userId) {
        await user_repository_js_1.userRepository.updateRefreshTokenHash(userId, null);
    }
    sanitizeUser(user) {
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
exports.AuthService = AuthService;
exports.authService = new AuthService();

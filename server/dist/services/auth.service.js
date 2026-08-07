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
            throw new apiError_js_1.ApiError(400, 'User with this email already exists', 'EMAIL_TAKEN');
        }
        const existingPhone = await user_repository_js_1.userRepository.findByPhone(dto.phone);
        if (existingPhone) {
            throw new apiError_js_1.ApiError(400, 'User with this phone number already exists', 'PHONE_TAKEN');
        }
        const passwordHash = await (0, password_js_1.hashPassword)(dto.password);
        const user = await user_repository_js_1.userRepository.create({
            name: dto.name,
            email: dto.email,
            phone: dto.phone,
            passwordHash,
            role: dto.role || 'customer',
            isVerified: true, // Auto-verify for dev MVP
        });
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
    async login(dto) {
        const user = await user_repository_js_1.userRepository.findByEmail(dto.email);
        if (!user) {
            throw new apiError_js_1.ApiError(401, 'Invalid email or password credentials', 'INVALID_CREDENTIALS');
        }
        const isMatch = await (0, password_js_1.comparePassword)(dto.password, user.passwordHash);
        if (!isMatch) {
            throw new apiError_js_1.ApiError(401, 'Invalid email or password credentials', 'INVALID_CREDENTIALS');
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
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            avatarUrl: user.avatarUrl,
            addresses: user.addresses,
        };
    }
}
exports.AuthService = AuthService;
exports.authService = new AuthService();

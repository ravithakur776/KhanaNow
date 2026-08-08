import { authService } from '../services/auth.service.js';
import { sendResponse } from '../utils/apiResponse.js';
import { env } from '../config/env.js';
const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};
export class AuthController {
    async register(req, res, next) {
        try {
            const result = await authService.register(req.body);
            sendResponse(res, 201, result.message, { user: result.user });
        }
        catch (error) {
            next(error);
        }
    }
    async login(req, res, next) {
        try {
            const result = await authService.login(req.body);
            res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS);
            sendResponse(res, 200, 'User logged in successfully', {
                user: result.user,
                accessToken: result.accessToken,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async verifyEmail(req, res, next) {
        try {
            const { email, otp } = req.body;
            const result = await authService.verifyEmail(email, otp);
            sendResponse(res, 200, result.message);
        }
        catch (error) {
            next(error);
        }
    }
    async resendVerification(req, res, next) {
        try {
            const { email } = req.body;
            const result = await authService.resendVerification(email);
            sendResponse(res, 200, result.message);
        }
        catch (error) {
            next(error);
        }
    }
    async forgotPassword(req, res, next) {
        try {
            const { email } = req.body;
            const result = await authService.forgotPassword(email);
            sendResponse(res, 200, result.message);
        }
        catch (error) {
            next(error);
        }
    }
    async resetPassword(req, res, next) {
        try {
            const { email, otp, newPassword } = req.body;
            const result = await authService.resetPassword(email, otp, newPassword);
            sendResponse(res, 200, result.message);
        }
        catch (error) {
            next(error);
        }
    }
    async refreshToken(req, res, next) {
        try {
            const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
            const result = await authService.refreshToken(refreshToken);
            res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS);
            sendResponse(res, 200, 'Token refreshed successfully', {
                user: result.user,
                accessToken: result.accessToken,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async logout(req, res, next) {
        try {
            if (req.user?.userId) {
                await authService.logout(req.user.userId);
            }
            res.clearCookie('refreshToken', COOKIE_OPTIONS);
            sendResponse(res, 200, 'User logged out successfully');
        }
        catch (error) {
            next(error);
        }
    }
    async getMe(req, res, next) {
        try {
            sendResponse(res, 200, 'Current user profile fetched', { user: req.user });
        }
        catch (error) {
            next(error);
        }
    }
}
export const authController = new AuthController();

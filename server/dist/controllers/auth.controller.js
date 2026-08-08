"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = exports.AuthController = void 0;
const auth_service_js_1 = require("../services/auth.service.js");
const apiResponse_js_1 = require("../utils/apiResponse.js");
const env_js_1 = require("../config/env.js");
const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: env_js_1.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};
class AuthController {
    async register(req, res, next) {
        try {
            const result = await auth_service_js_1.authService.register(req.body);
            (0, apiResponse_js_1.sendResponse)(res, 201, result.message, { user: result.user });
        }
        catch (error) {
            next(error);
        }
    }
    async login(req, res, next) {
        try {
            const result = await auth_service_js_1.authService.login(req.body);
            res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS);
            (0, apiResponse_js_1.sendResponse)(res, 200, 'User logged in successfully', {
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
            const result = await auth_service_js_1.authService.verifyEmail(email, otp);
            (0, apiResponse_js_1.sendResponse)(res, 200, result.message);
        }
        catch (error) {
            next(error);
        }
    }
    async resendVerification(req, res, next) {
        try {
            const { email } = req.body;
            const result = await auth_service_js_1.authService.resendVerification(email);
            (0, apiResponse_js_1.sendResponse)(res, 200, result.message);
        }
        catch (error) {
            next(error);
        }
    }
    async forgotPassword(req, res, next) {
        try {
            const { email } = req.body;
            const result = await auth_service_js_1.authService.forgotPassword(email);
            (0, apiResponse_js_1.sendResponse)(res, 200, result.message);
        }
        catch (error) {
            next(error);
        }
    }
    async resetPassword(req, res, next) {
        try {
            const { email, otp, newPassword } = req.body;
            const result = await auth_service_js_1.authService.resetPassword(email, otp, newPassword);
            (0, apiResponse_js_1.sendResponse)(res, 200, result.message);
        }
        catch (error) {
            next(error);
        }
    }
    async refreshToken(req, res, next) {
        try {
            const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
            const result = await auth_service_js_1.authService.refreshToken(refreshToken);
            res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS);
            (0, apiResponse_js_1.sendResponse)(res, 200, 'Token refreshed successfully', {
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
                await auth_service_js_1.authService.logout(req.user.userId);
            }
            res.clearCookie('refreshToken', COOKIE_OPTIONS);
            (0, apiResponse_js_1.sendResponse)(res, 200, 'User logged out successfully');
        }
        catch (error) {
            next(error);
        }
    }
    async getMe(req, res, next) {
        try {
            (0, apiResponse_js_1.sendResponse)(res, 200, 'Current user profile fetched', { user: req.user });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AuthController = AuthController;
exports.authController = new AuthController();

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRepository = exports.UserRepository = void 0;
const user_model_js_1 = require("../models/user.model.js");
class UserRepository {
    async findByEmail(email) {
        return user_model_js_1.User.findOne({ email: email.toLowerCase() });
    }
    async findById(id) {
        return user_model_js_1.User.findById(id);
    }
    async findByPhone(phone) {
        return user_model_js_1.User.findOne({ phone });
    }
    async create(userData) {
        const user = new user_model_js_1.User(userData);
        return user.save();
    }
    async updateRefreshTokenHash(userId, hash) {
        await user_model_js_1.User.findByIdAndUpdate(userId, { refreshTokenHash: hash });
    }
    async setVerificationOTP(userId, otp, expiresAt) {
        await user_model_js_1.User.findByIdAndUpdate(userId, {
            verificationOTP: otp,
            verificationOTPExpires: expiresAt,
        });
    }
    async setResetPasswordOTP(userId, otp, expiresAt) {
        await user_model_js_1.User.findByIdAndUpdate(userId, {
            resetPasswordToken: otp,
            resetPasswordExpires: expiresAt,
        });
    }
    async verifyUserEmail(userId) {
        await user_model_js_1.User.findByIdAndUpdate(userId, {
            isVerified: true,
            verificationOTP: undefined,
            verificationOTPExpires: undefined,
        });
    }
    async updatePassword(userId, newPasswordHash) {
        await user_model_js_1.User.findByIdAndUpdate(userId, {
            passwordHash: newPasswordHash,
            resetPasswordToken: undefined,
            resetPasswordExpires: undefined,
        });
    }
    async addAddress(userId, address) {
        const user = await user_model_js_1.User.findById(userId);
        if (!user)
            return null;
        if (address.isDefault) {
            user.addresses.forEach((addr) => {
                addr.isDefault = false;
            });
        }
        user.addresses.push(address);
        return user.save();
    }
}
exports.UserRepository = UserRepository;
exports.userRepository = new UserRepository();

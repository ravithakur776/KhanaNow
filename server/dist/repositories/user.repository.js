import { User } from '../models/user.model.js';
export class UserRepository {
    async findByEmail(email) {
        return User.findOne({ email: email.toLowerCase() });
    }
    async findById(id) {
        return User.findById(id);
    }
    async findByPhone(phone) {
        return User.findOne({ phone });
    }
    async create(userData) {
        const user = new User(userData);
        return user.save();
    }
    async updateRefreshTokenHash(userId, hash) {
        await User.findByIdAndUpdate(userId, { refreshTokenHash: hash });
    }
    async setVerificationOTP(userId, otp, expiresAt) {
        await User.findByIdAndUpdate(userId, {
            verificationOTP: otp,
            verificationOTPExpires: expiresAt,
        });
    }
    async setResetPasswordOTP(userId, otp, expiresAt) {
        await User.findByIdAndUpdate(userId, {
            resetPasswordToken: otp,
            resetPasswordExpires: expiresAt,
        });
    }
    async verifyUserEmail(userId) {
        await User.findByIdAndUpdate(userId, {
            isVerified: true,
            verificationOTP: undefined,
            verificationOTPExpires: undefined,
        });
    }
    async updatePassword(userId, newPasswordHash) {
        await User.findByIdAndUpdate(userId, {
            passwordHash: newPasswordHash,
            resetPasswordToken: undefined,
            resetPasswordExpires: undefined,
        });
    }
    async addAddress(userId, address) {
        const user = await User.findById(userId);
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
export const userRepository = new UserRepository();

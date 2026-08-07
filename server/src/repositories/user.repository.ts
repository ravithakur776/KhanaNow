import { User, IUserDocument, IAddress } from '../models/user.model.js';

export class UserRepository {
  async findByEmail(email: string): Promise<IUserDocument | null> {
    return User.findOne({ email: email.toLowerCase() });
  }

  async findById(id: string): Promise<IUserDocument | null> {
    return User.findById(id);
  }

  async findByPhone(phone: string): Promise<IUserDocument | null> {
    return User.findOne({ phone });
  }

  async create(userData: Partial<IUserDocument>): Promise<IUserDocument> {
    const user = new User(userData);
    return user.save();
  }

  async updateRefreshTokenHash(userId: string, hash: string | null): Promise<void> {
    await User.findByIdAndUpdate(userId, { refreshTokenHash: hash });
  }

  async setVerificationOTP(userId: string, otp: string, expiresAt: Date): Promise<void> {
    await User.findByIdAndUpdate(userId, {
      verificationOTP: otp,
      verificationOTPExpires: expiresAt,
    });
  }

  async setResetPasswordOTP(userId: string, otp: string, expiresAt: Date): Promise<void> {
    await User.findByIdAndUpdate(userId, {
      resetPasswordToken: otp,
      resetPasswordExpires: expiresAt,
    });
  }

  async verifyUserEmail(userId: string): Promise<void> {
    await User.findByIdAndUpdate(userId, {
      isVerified: true,
      verificationOTP: undefined,
      verificationOTPExpires: undefined,
    });
  }

  async updatePassword(userId: string, newPasswordHash: string): Promise<void> {
    await User.findByIdAndUpdate(userId, {
      passwordHash: newPasswordHash,
      resetPasswordToken: undefined,
      resetPasswordExpires: undefined,
    });
  }

  async addAddress(userId: string, address: IAddress): Promise<IUserDocument | null> {
    const user = await User.findById(userId);
    if (!user) return null;

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

import mongoose, { Schema } from 'mongoose';
const AddressSchema = new Schema({
    label: { type: String, enum: ['Home', 'Work', 'Other'], default: 'Home' },
    streetAddress: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] },
    },
    isDefault: { type: Boolean, default: false },
});
const UserSchema = new Schema({
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, unique: true, trim: true },
    passwordHash: { type: String, required: true },
    role: {
        type: String,
        enum: ['customer', 'restaurant_owner', 'admin', 'delivery_partner'],
        default: 'customer',
    },
    status: {
        type: String,
        enum: ['active', 'suspended', 'blocked'],
        default: 'active',
        index: true,
    },
    avatarUrl: { type: String },
    isVerified: { type: Boolean, default: false },
    verificationOTP: { type: String },
    verificationOTPExpires: { type: Date },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    refreshTokenHash: { type: String },
    newsletterOptIn: { type: Boolean, default: false },
    addresses: [AddressSchema],
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
// Virtual property for full name
UserSchema.virtual('name').get(function () {
    return `${this.firstName} ${this.lastName}`.trim();
});
// GeoIndex for customer location queries & Email index
UserSchema.index({ 'addresses.location': '2dsphere' });
UserSchema.index({ email: 1 });
export const User = mongoose.model('User', UserSchema);

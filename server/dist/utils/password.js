import bcrypt from 'bcryptjs';
const SALT_ROUNDS = 12;
export const hashPassword = async (password) => {
    return bcrypt.hash(password, SALT_ROUNDS);
};
export const comparePassword = async (plain, hashed) => {
    return bcrypt.compare(plain, hashed);
};

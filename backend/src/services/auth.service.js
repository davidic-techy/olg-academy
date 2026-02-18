import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

/**
 * @description Sign a JWT Token for a user
 * @param {string} id - The User ID from MongoDB
 * @returns {string} - The signed JWT string
 */
export const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

/**
 * @description Compare entered password with hashed password in DB
 * @param {string} enteredPassword 
 * @param {string} hashedPassword 
 * @returns {Promise<boolean>}
 */
export const comparePassword = async (enteredPassword, hashedPassword) => {
  return await bcrypt.compare(enteredPassword, hashedPassword);
};

/**
 * @description Hash a password before saving to DB
 * @param {string} password 
 * @returns {Promise<string>}
 */
export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};
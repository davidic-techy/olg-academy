import User from '../models/User.js';
// 👇 Import the tools from your new service
import { generateToken, comparePassword } from '../services/auth.service.js';

// @desc    Register user
// @route   POST /api/auth/register
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const user = await User.create({
      name,
      email,
      password, // Password hashing still happens in User Model middleware
      role,
    });

    res.status(201).json({
      success: true,
      token: generateToken(user._id), // ⚡ Using Service
      user: { id: user._id, name: user.name, role: user.role }
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Check if user exists
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // 2. Check if password matches using Service
    const isMatch = await comparePassword(password, user.password); // ⚡ Using Service
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.json({
      success: true,
      token: generateToken(user._id), // ⚡ Using Service
      user: { id: user._id, name: user.name, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Logout user / clear cookie
// @route   GET /api/auth/logout
// @access  Public
export const logoutUser = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};
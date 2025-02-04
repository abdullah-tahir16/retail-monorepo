import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user/user';
import { AuthRequest } from '../middleware/authMiddleware';

// Generate JWT Token
const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET as string, { expiresIn: '7d' });
};

// @desc   Register a new user
// @route  POST /api/auth/register
// @access Public
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const user = await User.create({ name, email, password });

    res.status(201).json({ token: generateToken(user._id.toString()), user });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

// @desc   Login User
// @route  POST /api/auth/login
// @access Public
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({ token: generateToken(user._id.toString()), user });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

// @desc   Get user profile (authenticated user)
// @route  GET /api/auth/profile
// @access Private
export const getUserProfile = async (req: AuthRequest, res: Response) => {
    try {
      const user = await User.findById(req.user._id).select('-password');
      if (!user) return res.status(404).json({ message: 'User not found' });
  
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: 'Server Error', error });
    }
  };

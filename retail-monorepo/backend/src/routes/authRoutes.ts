import express from 'express';
import { registerUser, loginUser, getUserProfile } from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Public Routes (Anyone can access)
router.post('/register', registerUser); // Register a new user
router.post('/login', loginUser); // Login user

// Private Route (Requires Authentication)
router.get('/profile', protect, getUserProfile); // Get user profile

export default router;

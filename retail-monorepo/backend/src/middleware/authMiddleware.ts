import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user/user';

// Extend Express Request to include user property
export interface AuthRequest extends Request {
  user?: any;
}

// Middleware to protect routes (Requires a valid JWT)
export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  let token = req.headers.authorization;

  if (token && token.startsWith('Bearer')) {
    try {
      const decoded: any = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET as string);
      req.user = await User.findById(decoded.id).select('-password'); // Attach user to request
      next();
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, invalid token' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Middleware for admin access
export const admin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied, admin only' });
  }
};

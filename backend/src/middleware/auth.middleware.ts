import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.config';
import { User } from '../models';
import { ApiError } from './error.middleware';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

/**
 * Middleware to protect routes - verifies JWT token
 */
export const protect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let token;

    // Get token from Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    // Get token from cookie
    else if (req.cookies?.jwt) {
      token = req.cookies.jwt;
    }

    // Check if token exists
    if (!token) {
      return next(new ApiError(401, 'You are not logged in. Please log in to get access.'));
    }

    // Verify token
    const decoded: any = jwt.verify(token, config.jwt.secret);

    // Check if user still exists
    const currentUser = await User.findByPk(decoded.id);
    if (!currentUser) {
      return next(new ApiError(401, 'The user belonging to this token no longer exists.'));
    }

    // Check if user is active
    if (!currentUser.active) {
      return next(new ApiError(401, 'This user account has been deactivated.'));
    }

    // Grant access to protected route
    req.user = currentUser;
    next();
  } catch (error) {
    next(new ApiError(401, 'Invalid token. Please log in again.'));
  }
};

/**
 * Middleware to restrict access based on user roles
 */
export const restrictTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Check if user exists (should be set by protect middleware)
    if (!req.user) {
      return next(new ApiError(401, 'You are not logged in. Please log in to get access.'));
    }

    // Check if user role is allowed
    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, 'You do not have permission to perform this action.'));
    }

    next();
  };
};

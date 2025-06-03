import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import { UserProfile } from '../types/models';

// Extend the Express Request type to include user property
declare global {
  namespace Express {
    interface Request {
      user?: UserProfile;
    }
  }
}

/**
 * Extract and validate the JWT token from the request
 */
export const extractToken = (req: Request): string | null => {
  if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
    return req.headers.authorization.split(' ')[1];
  }
  
  if (req.cookies && req.cookies.access_token) {
    return req.cookies.access_token;
  }
  
  return null;
};

/**
 * Authentication middleware to verify the user's token
 * This middleware sets req.user if authentication is successful
 * It does not block requests if authentication fails
 */
export const optionalAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = extractToken(req);
    
    if (!token) {
      // No token, continue without setting user
      next();
      return;
    }
    
    // Verify the token with Supabase
    const { data, error } = await supabase.auth.getUser(token);
    
    if (error || !data.user) {
      // Invalid token, continue without setting user
      next();
      return;
    }
    
    // Token is valid, set user information on the request
    req.user = {
      id: data.user.id,
      email: data.user.email as string,
      name: data.user.user_metadata?.name,
      avatar: data.user.user_metadata?.avatar,
    };
    
    next();
  } catch (error) {
    console.error('Error in optional authentication middleware:', error);
    // Continue without setting user
    next();
  }
};

/**
 * Authentication middleware to verify the user's token
 * This middleware blocks requests if authentication fails
 */
export const requireAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = extractToken(req);
    
    if (!token) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }
    
    // Verify the token with Supabase
    const { data, error } = await supabase.auth.getUser(token);
    
    if (error || !data.user) {
      res.status(401).json({ success: false, error: 'Invalid or expired token' });
      return;
    }
    
    // Token is valid, set user information on the request
    req.user = {
      id: data.user.id,
      email: data.user.email as string,
      name: data.user.user_metadata?.name,
      avatar: data.user.user_metadata?.avatar,
    };
    
    next();
  } catch (error) {
    console.error('Error in authentication middleware:', error);
    res.status(500).json({ success: false, error: 'Authentication failed' });
  }
}; 
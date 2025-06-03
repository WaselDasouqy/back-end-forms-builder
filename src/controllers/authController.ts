import { Request, Response } from 'express';
import * as authService from '../services/authService';

/**
 * Register a new user
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      res.status(400).json({ success: false, error: 'Email and password are required' });
      return;
    }
    
    const result = await authService.signUp(email, password);
    
    if (result.error) {
      res.status(400).json({ success: false, error: result.error });
      return;
    }
    
    res.status(201).json({ 
      success: true, 
      user: result.user, 
      token: result.token,
      message: 'Registration successful' 
    });
  } catch (error) {
    console.error('Error in register controller:', error);
    res.status(500).json({ success: false, error: (error as Error).message || 'Internal server error' });
  }
};

/**
 * Login a user
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      res.status(400).json({ success: false, error: 'Email and password are required' });
      return;
    }
    
    const result = await authService.signIn(email, password);
    
    if (result.error) {
      res.status(401).json({ success: false, error: result.error });
      return;
    }
    
    res.status(200).json({ 
      success: true, 
      user: result.user, 
      token: result.token,
      message: 'Login successful' 
    });
  } catch (error) {
    console.error('Error in login controller:', error);
    res.status(500).json({ success: false, error: (error as Error).message || 'Internal server error' });
  }
};

/**
 * Logout the current user
 */
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await authService.signOut();
    
    if (result.error) {
      res.status(400).json({ success: false, error: result.error });
      return;
    }
    
    res.status(200).json({ success: true, message: 'Logout successful' });
  } catch (error) {
    console.error('Error in logout controller:', error);
    res.status(500).json({ success: false, error: (error as Error).message || 'Internal server error' });
  }
};

/**
 * Get the current user
 */
export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  try {
    // If middleware already set the user, return it
    if (req.user) {
      res.status(200).json({ success: true, user: req.user });
      return;
    }
    
    // Otherwise, get user from Supabase
    const result = await authService.getCurrentUser();
    
    if (result.error) {
      res.status(401).json({ success: false, error: result.error });
      return;
    }
    
    res.status(200).json({ success: true, user: result.user });
  } catch (error) {
    console.error('Error in getCurrentUser controller:', error);
    res.status(500).json({ success: false, error: (error as Error).message || 'Internal server error' });
  }
};

/**
 * Request a password reset
 */
export const requestPasswordReset = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    
    if (!email) {
      res.status(400).json({ success: false, error: 'Email is required' });
      return;
    }
    
    const result = await authService.resetPassword(email);
    
    if (result.error) {
      res.status(400).json({ success: false, error: result.error });
      return;
    }
    
    res.status(200).json({ success: true, message: 'Password reset email sent' });
  } catch (error) {
    console.error('Error in requestPasswordReset controller:', error);
    res.status(500).json({ success: false, error: (error as Error).message || 'Internal server error' });
  }
};

/**
 * Reset password with token
 */
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { password } = req.body;
    
    if (!password) {
      res.status(400).json({ success: false, error: 'New password is required' });
      return;
    }
    
    const result = await authService.updatePassword(password);
    
    if (result.error) {
      res.status(400).json({ success: false, error: result.error });
      return;
    }
    
    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error in resetPassword controller:', error);
    res.status(500).json({ success: false, error: (error as Error).message || 'Internal server error' });
  }
};

/**
 * Update user profile
 */
export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized: User not authenticated' });
      return;
    }
    
    const updates = req.body;
    const result = await authService.updateProfile(userId, updates);
    
    if (result.error) {
      res.status(400).json({ success: false, error: result.error });
      return;
    }
    
    res.status(200).json({ success: true, user: result.user, message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error in updateProfile controller:', error);
    res.status(500).json({ success: false, error: (error as Error).message || 'Internal server error' });
  }
}; 
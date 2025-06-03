import { Router } from 'express';
import * as authController from '../controllers/authController';
import { requireAuth } from '../middlewares/authMiddleware';

const router = Router();

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/me', authController.getCurrentUser);
router.post('/reset-password/request', authController.requestPasswordReset);
router.post('/reset-password', authController.resetPassword);

// Protected routes
router.put('/profile', requireAuth, authController.updateProfile);

export default router; 
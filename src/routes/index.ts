import { Router } from 'express';
import authRoutes from './authRoutes';
import formRoutes from './formRoutes';
import responseRoutes from './responseRoutes';

const router = Router();

// API routes
router.use('/auth', authRoutes);
router.use('/forms', formRoutes);
router.use('/', responseRoutes);

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'API is running' });
});

export default router; 
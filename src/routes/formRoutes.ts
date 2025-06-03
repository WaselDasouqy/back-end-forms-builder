import { Router } from 'express';
import * as formController from '../controllers/formController';
import { requireAuth, optionalAuth } from '../middlewares/authMiddleware';

const router = Router();

// Public routes - requires optional auth to check if user is the owner
router.get('/:id', optionalAuth, formController.getFormById);

// Protected routes - requires authentication
router.get('/', requireAuth, formController.getUserForms);
router.post('/', requireAuth, formController.createForm);
router.put('/:id', requireAuth, formController.updateForm);
router.delete('/:id', requireAuth, formController.deleteForm);

export default router; 
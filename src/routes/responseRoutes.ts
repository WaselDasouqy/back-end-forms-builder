import { Router } from 'express';
import * as responseController from '../controllers/responseController';
import { requireAuth, optionalAuth } from '../middlewares/authMiddleware';

const router = Router();

// Form response routes
router.post('/forms/:formId/responses', optionalAuth, responseController.submitFormResponse);
router.get('/forms/:formId/responses', requireAuth, responseController.getFormResponses);

// Individual response routes
router.get('/responses/:id', optionalAuth, responseController.getResponseById);
router.delete('/responses/:id', requireAuth, responseController.deleteResponse);

export default router; 
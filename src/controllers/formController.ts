import { Request, Response } from 'express';
import * as formService from '../services/formService';
import { Form } from '../types/models';

/**
 * Get all forms for the authenticated user
 */
export const getUserForms = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get user ID from the authenticated request
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized: User not authenticated' });
      return;
    }

    const forms = await formService.getUserForms(userId);
    res.status(200).json({ success: true, data: forms });
  } catch (error) {
    console.error('Error in getUserForms controller:', error);
    res.status(500).json({ success: false, error: (error as Error).message || 'Internal server error' });
  }
};

/**
 * Get a single form by ID
 */
export const getFormById = async (req: Request, res: Response): Promise<void> => {
  try {
    const formId = req.params.id;
    if (!formId) {
      res.status(400).json({ success: false, error: 'Form ID is required' });
      return;
    }

    const form = await formService.getFormById(formId);

    // Check if the form is public or the user is the owner
    const userId = req.user?.id;
    if (!form.isPublic && (!userId || form.userId !== userId)) {
      res.status(403).json({ success: false, error: 'Unauthorized: This form is private' });
      return;
    }

    res.status(200).json({ success: true, data: form });
  } catch (error) {
    console.error('Error in getFormById controller:', error);
    res.status(500).json({ success: false, error: (error as Error).message || 'Internal server error' });
  }
};

/**
 * Create a new form
 */
export const createForm = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get user ID from the authenticated request
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized: User not authenticated' });
      return;
    }

    const formData: Partial<Form> = req.body;
    const newForm = await formService.createForm(formData, userId);

    res.status(201).json({ success: true, data: newForm });
  } catch (error) {
    console.error('Error in createForm controller:', error);
    res.status(500).json({ success: false, error: (error as Error).message || 'Internal server error' });
  }
};

/**
 * Update an existing form
 */
export const updateForm = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get user ID from the authenticated request
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized: User not authenticated' });
      return;
    }

    const formId = req.params.id;
    if (!formId) {
      res.status(400).json({ success: false, error: 'Form ID is required' });
      return;
    }

    const formData: Partial<Form> = req.body;
    const updatedForm = await formService.updateForm(formId, formData, userId);

    res.status(200).json({ success: true, data: updatedForm });
  } catch (error) {
    console.error('Error in updateForm controller:', error);
    
    // Handle different types of errors
    if ((error as Error).message.includes('Unauthorized')) {
      res.status(403).json({ success: false, error: (error as Error).message });
    } else if ((error as Error).message.includes('not found')) {
      res.status(404).json({ success: false, error: (error as Error).message });
    } else {
      res.status(500).json({ success: false, error: (error as Error).message || 'Internal server error' });
    }
  }
};

/**
 * Delete a form
 */
export const deleteForm = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get user ID from the authenticated request
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized: User not authenticated' });
      return;
    }

    const formId = req.params.id;
    if (!formId) {
      res.status(400).json({ success: false, error: 'Form ID is required' });
      return;
    }

    await formService.deleteForm(formId, userId);

    res.status(200).json({ success: true, message: 'Form deleted successfully' });
  } catch (error) {
    console.error('Error in deleteForm controller:', error);
    
    // Handle different types of errors
    if ((error as Error).message.includes('Unauthorized')) {
      res.status(403).json({ success: false, error: (error as Error).message });
    } else if ((error as Error).message.includes('not found')) {
      res.status(404).json({ success: false, error: (error as Error).message });
    } else {
      res.status(500).json({ success: false, error: (error as Error).message || 'Internal server error' });
    }
  }
}; 
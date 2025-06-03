import { Request, Response } from 'express';
import * as responseService from '../services/responseService';

/**
 * Submit a form response
 */
export const submitFormResponse = async (req: Request, res: Response): Promise<void> => {
  try {
    const formId = req.params.formId;
    if (!formId) {
      res.status(400).json({ success: false, error: 'Form ID is required' });
      return;
    }

    const responseData = req.body;
    // Pass user ID if authenticated
    const userId = req.user?.id;

    const result = await responseService.submitFormResponse(formId, responseData, userId);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    console.error('Error in submitFormResponse controller:', error);
    
    // Handle different types of errors
    if ((error as Error).message.includes('Unauthorized')) {
      res.status(403).json({ success: false, error: (error as Error).message });
    } else if ((error as Error).message.includes('not found')) {
      res.status(404).json({ success: false, error: (error as Error).message });
    } else if ((error as Error).message.includes('Missing required field')) {
      res.status(400).json({ success: false, error: (error as Error).message });
    } else {
      res.status(500).json({ success: false, error: (error as Error).message || 'Internal server error' });
    }
  }
};

/**
 * Get all responses for a form
 */
export const getFormResponses = async (req: Request, res: Response): Promise<void> => {
  try {
    const formId = req.params.formId;
    if (!formId) {
      res.status(400).json({ success: false, error: 'Form ID is required' });
      return;
    }

    // Require authentication for this endpoint
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized: User not authenticated' });
      return;
    }

    const responses = await responseService.getFormResponses(formId, userId);
    res.status(200).json({ success: true, data: responses });
  } catch (error) {
    console.error('Error in getFormResponses controller:', error);
    
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
 * Get a single response by ID
 */
export const getResponseById = async (req: Request, res: Response): Promise<void> => {
  try {
    const responseId = req.params.id;
    if (!responseId) {
      res.status(400).json({ success: false, error: 'Response ID is required' });
      return;
    }

    // Optional authentication - will check permissions in the service
    const userId = req.user?.id;

    const response = await responseService.getResponseById(responseId, userId);
    res.status(200).json({ success: true, data: response });
  } catch (error) {
    console.error('Error in getResponseById controller:', error);
    
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
 * Delete a response
 */
export const deleteResponse = async (req: Request, res: Response): Promise<void> => {
  try {
    const responseId = req.params.id;
    if (!responseId) {
      res.status(400).json({ success: false, error: 'Response ID is required' });
      return;
    }

    // Require authentication for this endpoint
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized: User not authenticated' });
      return;
    }

    await responseService.deleteResponse(responseId, userId);
    res.status(200).json({ success: true, message: 'Response deleted successfully' });
  } catch (error) {
    console.error('Error in deleteResponse controller:', error);
    
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
import { supabase } from '../config/supabase';
import { FormResponse, ResponseValue } from '../types/models';
import { getFormById } from './formService';

/**
 * Submit a response to a form
 */
export const submitFormResponse = async (
  formId: string, 
  responseData: Record<string, any>, 
  userId?: string
): Promise<{ responseId: string }> => {
  // Verify the form exists and is public (or the user owns it)
  const { data: formData, error: formError } = await supabase
    .from('forms')
    .select('is_public, user_id')
    .eq('id', formId)
    .single();

  if (formError) {
    console.error('Error fetching form:', formError);
    throw new Error(`Form not found: ${formError.message}`);
  }

  // Check permissions
  if (!formData.is_public && (!userId || formData.user_id !== userId)) {
    throw new Error('Unauthorized: This form is not public and you do not have permission to submit responses');
  }

  // Create response entry
  const { data: responseEntry, error: responseError } = await supabase
    .from('form_responses')
    .insert({
      form_id: formId,
      user_id: userId || null,
      submitted_at: new Date().toISOString()
    })
    .select()
    .single();

  if (responseError) {
    console.error('Error creating form response:', responseError);
    throw new Error(`Failed to create form response: ${responseError.message}`);
  }

  // Get all fields for this form to validate the response
  const { data: fieldsData, error: fieldsError } = await supabase
    .from('form_fields')
    .select('id, required, type')
    .eq('form_id', formId);

  if (fieldsError) {
    console.error('Error fetching form fields:', fieldsError);
    throw new Error(`Failed to fetch form fields: ${fieldsError.message}`);
  }

  // Validate required fields
  const requiredFields = fieldsData.filter(field => field.required).map(field => field.id);
  for (const fieldId of requiredFields) {
    if (!responseData[fieldId] && responseData[fieldId] !== 0 && responseData[fieldId] !== false) {
      // Delete the incomplete response
      await supabase.from('form_responses').delete().eq('id', responseEntry.id);
      throw new Error(`Missing required field: ${fieldId}`);
    }
  }

  // Create response values
  const responseValues = Object.entries(responseData).map(([fieldId, value]) => ({
    response_id: responseEntry.id,
    field_id: fieldId,
    value: typeof value === 'string' ? value : JSON.stringify(value)
  }));

  if (responseValues.length > 0) {
    const { error: valuesError } = await supabase
      .from('response_values')
      .insert(responseValues);

    if (valuesError) {
      // Rollback the response if value insertion fails
      await supabase.from('form_responses').delete().eq('id', responseEntry.id);
      console.error('Error creating response values:', valuesError);
      throw new Error(`Failed to create response values: ${valuesError.message}`);
    }
  }

  return { responseId: responseEntry.id };
};

/**
 * Get a single form response by ID
 */
export const getResponseById = async (
  responseId: string, 
  userId?: string
): Promise<FormResponse> => {
  // Fetch the response
  const { data: responseData, error: responseError } = await supabase
    .from('form_responses')
    .select('*, form_id')
    .eq('id', responseId)
    .single();

  if (responseError) {
    console.error('Error fetching response:', responseError);
    throw new Error(`Response not found: ${responseError.message}`);
  }

  // Check permissions (user is either the form owner or the response submitter)
  if (userId) {
    const { data: formData, error: formError } = await supabase
      .from('forms')
      .select('user_id')
      .eq('id', responseData.form_id)
      .single();

    if (formError) {
      console.error('Error fetching form:', formError);
      throw new Error(`Form not found: ${formError.message}`);
    }

    if (formData.user_id !== userId && responseData.user_id !== userId) {
      throw new Error('Unauthorized: You do not have permission to view this response');
    }
  } else if (responseData.user_id) {
    // Anonymous user trying to access a response with a user ID
    throw new Error('Unauthorized: Please sign in to view this response');
  }

  // Fetch the response values
  const { data: valuesData, error: valuesError } = await supabase
    .from('response_values')
    .select('field_id, value')
    .eq('response_id', responseId);

  if (valuesError) {
    console.error('Error fetching response values:', valuesError);
    throw new Error(`Failed to fetch response values: ${valuesError.message}`);
  }

  // Convert to a values object
  const values: Record<string, any> = {};
  valuesData.forEach((value: { field_id: string; value: string }) => {
    try {
      // Try to parse JSON values
      values[value.field_id] = JSON.parse(value.value);
    } catch (e) {
      // If not JSON, use the string value
      values[value.field_id] = value.value;
    }
  });

  // Return the formatted response
  return {
    id: responseData.id,
    formId: responseData.form_id,
    userId: responseData.user_id,
    submittedAt: new Date(responseData.submitted_at),
    createdAt: new Date(responseData.created_at),
    updatedAt: new Date(responseData.updated_at),
    values
  };
};

/**
 * Get all responses for a form
 */
export const getFormResponses = async (
  formId: string, 
  userId: string
): Promise<FormResponse[]> => {
  // Verify the user owns the form
  const { data: formData, error: formError } = await supabase
    .from('forms')
    .select('user_id')
    .eq('id', formId)
    .single();

  if (formError) {
    console.error('Error fetching form:', formError);
    throw new Error(`Form not found: ${formError.message}`);
  }

  if (formData.user_id !== userId) {
    throw new Error('Unauthorized: You do not have permission to view responses for this form');
  }

  // Fetch all responses for this form
  const { data: responsesData, error: responsesError } = await supabase
    .from('form_responses')
    .select('*')
    .eq('form_id', formId)
    .order('submitted_at', { ascending: false });

  if (responsesError) {
    console.error('Error fetching form responses:', responsesError);
    throw new Error(`Failed to fetch form responses: ${responsesError.message}`);
  }

  // For each response, get its values
  const responsesWithValues = await Promise.all(
    responsesData.map(async (response) => {
      const { data: valuesData, error: valuesError } = await supabase
        .from('response_values')
        .select('field_id, value')
        .eq('response_id', response.id);

      if (valuesError) {
        console.error('Error fetching response values:', valuesError);
        return {
          id: response.id,
          formId: response.form_id,
          userId: response.user_id,
          submittedAt: new Date(response.submitted_at),
          createdAt: new Date(response.created_at),
          updatedAt: new Date(response.updated_at),
          values: {}
        };
      }

      // Convert to a values object
      const values: Record<string, any> = {};
      valuesData.forEach((value: { field_id: string; value: string }) => {
        try {
          // Try to parse JSON values
          values[value.field_id] = JSON.parse(value.value);
        } catch (e) {
          // If not JSON, use the string value
          values[value.field_id] = value.value;
        }
      });

      return {
        id: response.id,
        formId: response.form_id,
        userId: response.user_id,
        submittedAt: new Date(response.submitted_at),
        createdAt: new Date(response.created_at),
        updatedAt: new Date(response.updated_at),
        values
      };
    })
  );

  return responsesWithValues;
};

/**
 * Delete a form response
 */
export const deleteResponse = async (
  responseId: string, 
  userId: string
): Promise<void> => {
  // Fetch the response
  const { data: responseData, error: responseError } = await supabase
    .from('form_responses')
    .select('*, form_id')
    .eq('id', responseId)
    .single();

  if (responseError) {
    console.error('Error fetching response:', responseError);
    throw new Error(`Response not found: ${responseError.message}`);
  }

  // Check permissions (user is either the form owner or the response submitter)
  const { data: formData, error: formError } = await supabase
    .from('forms')
    .select('user_id')
    .eq('id', responseData.form_id)
    .single();

  if (formError) {
    console.error('Error fetching form:', formError);
    throw new Error(`Form not found: ${formError.message}`);
  }

  if (formData.user_id !== userId && responseData.user_id !== userId) {
    throw new Error('Unauthorized: You do not have permission to delete this response');
  }

  // Delete the response (cascades to values due to our SQL constraints)
  const { error: deleteError } = await supabase
    .from('form_responses')
    .delete()
    .eq('id', responseId);

  if (deleteError) {
    console.error('Error deleting response:', deleteError);
    throw new Error(`Failed to delete response: ${deleteError.message}`);
  }
}; 
import { supabase } from '../config/supabase';
import { Form, Field, FieldOption } from '../types/models';

/**
 * Transform a database form record to our frontend model
 */
const transformFormFromDb = async (dbForm: any): Promise<Form> => {
  // Fetch all fields for this form
  const { data: fieldsData, error: fieldsError } = await supabase
    .from('form_fields')
    .select('*')
    .eq('form_id', dbForm.id)
    .order('f_order', { ascending: true });

  if (fieldsError) {
    console.error('Error fetching fields:', fieldsError);
    throw new Error(`Failed to fetch fields: ${fieldsError.message}`);
  }

  // Get response count for this form
  const { count: responseCount, error: countError } = await supabase
    .from('form_responses')
    .select('id', { count: 'exact' })
    .eq('form_id', dbForm.id);

  if (countError) {
    console.error('Error fetching response count:', countError);
    // Don't throw error for count, just set to 0
  }

  // Process all fields and their options
  const fields: Field[] = await Promise.all(
    fieldsData.map(async (fieldData) => {
      const field: Field = {
        id: fieldData.id,
        type: fieldData.type as any,
        label: fieldData.label,
        required: fieldData.required,
        description: fieldData.description || undefined,
        placeholder: fieldData.placeholder || undefined,
        defaultValue: fieldData.default_value || undefined,
        order: fieldData.f_order,
        ...fieldData.properties
      };

      // Fetch options for fields that have them
      if (['multiple-choice', 'checkbox', 'dropdown'].includes(field.type)) {
        const { data: optionsData, error: optionsError } = await supabase
          .from('field_options')
          .select('*')
          .eq('field_id', field.id)
          .order('f_order', { ascending: true });

        if (!optionsError && optionsData) {
          field.options = optionsData.map(option => ({
            id: option.id,
            value: option.value,
            description: option.description || undefined
          }));
        }
      }

      return field;
    })
  );

  // Construct and return the form
  return {
    id: dbForm.id,
    title: dbForm.title,
    description: dbForm.description || '',
    fields,
    createdAt: new Date(dbForm.created_at),
    updatedAt: new Date(dbForm.updated_at),
    isPublic: dbForm.is_public,
    userId: dbForm.user_id,
    responseCount: responseCount || 0,
    settings: dbForm.settings || {
      submitButtonText: 'Submit',
      showProgressBar: false,
      confirmationMessage: 'Thank you for your submission!'
    }
  };
};

/**
 * Get all forms for a user
 */
export const getUserForms = async (userId: string): Promise<Form[]> => {
  const { data, error } = await supabase
    .from('forms')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching forms:', error);
    throw new Error(`Failed to fetch forms: ${error.message}`);
  }

  // Transform all forms
  const forms = await Promise.all(data.map(form => transformFormFromDb(form)));
  return forms;
};

/**
 * Get a single form by ID
 */
export const getFormById = async (formId: string): Promise<Form> => {
  const { data, error } = await supabase
    .from('forms')
    .select('*')
    .eq('id', formId)
    .single();

  if (error) {
    console.error('Error fetching form:', error);
    throw new Error(`Failed to fetch form: ${error.message}`);
  }

  return transformFormFromDb(data);
};

/**
 * Create a new form
 */
export const createForm = async (form: Partial<Form>, userId: string): Promise<Form> => {
  // Insert the form
  const { data: formData, error: formError } = await supabase
    .from('forms')
    .insert({
      title: form.title || 'Untitled Form',
      description: form.description || '',
      user_id: userId,
      is_public: form.isPublic || false,
      settings: form.settings || {
        submitButtonText: 'Submit',
        showProgressBar: false,
        confirmationMessage: 'Thank you for your submission!'
      }
    })
    .select()
    .single();

  if (formError) {
    console.error('Error creating form:', formError);
    throw new Error(`Failed to create form: ${formError.message}`);
  }

  // If there are fields, create them
  if (form.fields && form.fields.length > 0) {
    await createFormFields(formData.id, form.fields);
  }

  // Return the newly created form
  return getFormById(formData.id);
};

/**
 * Create fields for a form
 */
export const createFormFields = async (formId: string, fields: Field[]): Promise<void> => {
  // Process each field
  for (let i = 0; i < fields.length; i++) {
    const field = fields[i];
    
    // Extract basic properties and move the rest to the properties JSON field
    const { id, type, label, required, description, placeholder, defaultValue, options, ...properties } = field;
    
    // Insert the field
    const { data: fieldData, error: fieldError } = await supabase
      .from('form_fields')
      .insert({
        form_id: formId,
        type,
        label,
        required: required || false,
        description: description || null,
        placeholder: placeholder || null,
        default_value: typeof defaultValue === 'string' ? defaultValue : defaultValue ? JSON.stringify(defaultValue) : null,
        f_order: i,
        properties
      })
      .select()
      .single();

    if (fieldError) {
      console.error('Error creating field:', fieldError);
      throw new Error(`Failed to create field: ${fieldError.message}`);
    }

    // If there are options, create them
    if (options && options.length > 0) {
      await createFieldOptions(fieldData.id, options);
    }
  }
};

/**
 * Create options for a field
 */
export const createFieldOptions = async (fieldId: string, options: FieldOption[]): Promise<void> => {
  const optionsToInsert = options.map((option, index) => ({
    field_id: fieldId,
    value: option.value,
    description: option.description || null,
    f_order: index
  }));

  const { error } = await supabase
    .from('field_options')
    .insert(optionsToInsert);

  if (error) {
    console.error('Error creating field options:', error);
    throw new Error(`Failed to create field options: ${error.message}`);
  }
};

/**
 * Update an existing form
 */
export const updateForm = async (formId: string, form: Partial<Form>, userId: string): Promise<Form> => {
  // First verify the user owns this form
  const { data: existingForm, error: fetchError } = await supabase
    .from('forms')
    .select('user_id')
    .eq('id', formId)
    .single();

  if (fetchError) {
    console.error('Error fetching form:', fetchError);
    throw new Error(`Failed to fetch form: ${fetchError.message}`);
  }

  if (existingForm.user_id !== userId) {
    throw new Error('Unauthorized: You do not have permission to update this form');
  }

  // Update the form
  const { error: updateError } = await supabase
    .from('forms')
    .update({
      title: form.title,
      description: form.description,
      is_public: form.isPublic,
      settings: form.settings,
      updated_at: new Date().toISOString()
    })
    .eq('id', formId);

  if (updateError) {
    console.error('Error updating form:', updateError);
    throw new Error(`Failed to update form: ${updateError.message}`);
  }

  // If fields are provided, update them
  if (form.fields) {
    await updateFormFields(formId, form.fields);
  }

  // Return the updated form
  return getFormById(formId);
};

/**
 * Update fields for a form
 */
export const updateFormFields = async (formId: string, fields: Field[]): Promise<void> => {
  // Get existing fields
  const { data: existingFields, error: fetchError } = await supabase
    .from('form_fields')
    .select('id')
    .eq('form_id', formId);

  if (fetchError) {
    console.error('Error fetching existing fields:', fetchError);
    throw new Error(`Failed to fetch existing fields: ${fetchError.message}`);
  }

  // Create a set of existing field IDs
  const existingFieldIds = new Set(existingFields.map(f => f.id));
  // Create a set of field IDs to keep
  const fieldIdsToKeep = new Set(fields.filter(f => f.id).map(f => f.id));

  // Fields to delete: existing fields that are not in the updated list
  const fieldsToDelete = [...existingFieldIds].filter(id => !fieldIdsToKeep.has(id));

  // Delete fields that are no longer needed
  if (fieldsToDelete.length > 0) {
    const { error: deleteError } = await supabase
      .from('form_fields')
      .delete()
      .in('id', fieldsToDelete);

    if (deleteError) {
      console.error('Error deleting fields:', deleteError);
      throw new Error(`Failed to delete fields: ${deleteError.message}`);
    }
  }

  // Update or create each field
  for (let i = 0; i < fields.length; i++) {
    const field = fields[i];
    const { id, type, label, required, description, placeholder, defaultValue, options, ...properties } = field;

    if (id && existingFieldIds.has(id)) {
      // Update existing field
      const { error: updateError } = await supabase
        .from('form_fields')
        .update({
          type,
          label,
          required: required || false,
          description: description || null,
          placeholder: placeholder || null,
          default_value: typeof defaultValue === 'string' ? defaultValue : defaultValue ? JSON.stringify(defaultValue) : null,
          f_order: i,
          properties,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (updateError) {
        console.error('Error updating field:', updateError);
        throw new Error(`Failed to update field: ${updateError.message}`);
      }

      // Update options if provided
      if (options) {
        await updateFieldOptions(id, options);
      }
    } else {
      // Create new field
      const { data: fieldData, error: createError } = await supabase
        .from('form_fields')
        .insert({
          form_id: formId,
          type,
          label,
          required: required || false,
          description: description || null,
          placeholder: placeholder || null,
          default_value: typeof defaultValue === 'string' ? defaultValue : defaultValue ? JSON.stringify(defaultValue) : null,
          f_order: i,
          properties
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating field:', createError);
        throw new Error(`Failed to create field: ${createError.message}`);
      }

      // Create options if provided
      if (options && options.length > 0) {
        await createFieldOptions(fieldData.id, options);
      }
    }
  }
};

/**
 * Update options for a field
 */
export const updateFieldOptions = async (fieldId: string, options: FieldOption[]): Promise<void> => {
  // Get existing options
  const { data: existingOptions, error: fetchError } = await supabase
    .from('field_options')
    .select('id')
    .eq('field_id', fieldId);

  if (fetchError) {
    console.error('Error fetching existing options:', fetchError);
    throw new Error(`Failed to fetch existing options: ${fetchError.message}`);
  }

  // Create a set of existing option IDs
  const existingOptionIds = new Set(existingOptions.map(o => o.id));
  // Create a set of option IDs to keep
  const optionIdsToKeep = new Set(options.filter(o => o.id).map(o => o.id));

  // Options to delete: existing options that are not in the updated list
  const optionsToDelete = [...existingOptionIds].filter(id => !optionIdsToKeep.has(id));

  // Delete options that are no longer needed
  if (optionsToDelete.length > 0) {
    const { error: deleteError } = await supabase
      .from('field_options')
      .delete()
      .in('id', optionsToDelete);

    if (deleteError) {
      console.error('Error deleting options:', deleteError);
      throw new Error(`Failed to delete options: ${deleteError.message}`);
    }
  }

  // Update or create each option
  for (let i = 0; i < options.length; i++) {
    const option = options[i];

    if (option.id && existingOptionIds.has(option.id)) {
      // Update existing option
      const { error: updateError } = await supabase
        .from('field_options')
        .update({
          value: option.value,
          description: option.description || null,
          f_order: i,
          updated_at: new Date().toISOString()
        })
        .eq('id', option.id);

      if (updateError) {
        console.error('Error updating option:', updateError);
        throw new Error(`Failed to update option: ${updateError.message}`);
      }
    } else {
      // Create new option
      const { error: createError } = await supabase
        .from('field_options')
        .insert({
          field_id: fieldId,
          value: option.value,
          description: option.description || null,
          f_order: i
        });

      if (createError) {
        console.error('Error creating option:', createError);
        throw new Error(`Failed to create option: ${createError.message}`);
      }
    }
  }
};

/**
 * Delete a form
 */
export const deleteForm = async (formId: string, userId: string): Promise<void> => {
  // First verify the user owns this form
  const { data: existingForm, error: fetchError } = await supabase
    .from('forms')
    .select('user_id')
    .eq('id', formId)
    .single();

  if (fetchError) {
    console.error('Error fetching form:', fetchError);
    throw new Error(`Failed to fetch form: ${fetchError.message}`);
  }

  if (existingForm.user_id !== userId) {
    throw new Error('Unauthorized: You do not have permission to delete this form');
  }

  // Delete the form (cascades to fields and options due to our SQL constraints)
  const { error: deleteError } = await supabase
    .from('forms')
    .delete()
    .eq('id', formId);

  if (deleteError) {
    console.error('Error deleting form:', deleteError);
    throw new Error(`Failed to delete form: ${deleteError.message}`);
  }
}; 
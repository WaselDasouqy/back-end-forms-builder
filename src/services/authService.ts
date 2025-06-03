import { supabase } from '../config/supabase';
import { UserProfile } from '../types/models';

/**
 * Sign up a new user
 */
export const signUp = async (email: string, password: string): Promise<{ user: UserProfile | null; token: string | null; error: string | null }> => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    console.error('Error signing up:', error);
    return { user: null, token: null, error: error.message };
  }

  if (!data.user) {
    return { user: null, token: null, error: 'An email has been sent to confirm your registration' };
  }

  return {
    user: {
      id: data.user.id,
      email: data.user.email as string,
      email_verified: data.user.email_confirmed_at ? true : false,
    },
    token: data.session?.access_token || null,
    error: null,
  };
};

/**
 * Sign in a user
 */
export const signIn = async (email: string, password: string): Promise<{ user: UserProfile | null; token: string | null; error: string | null }> => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('Error signing in:', error);
    return { user: null, token: null, error: error.message };
  }

  return {
    user: {
      id: data.user.id,
      email: data.user.email as string,
      email_verified: data.user.email_confirmed_at ? true : false,
    },
    token: data.session?.access_token || null,
    error: null,
  };
};

/**
 * Sign out the current user
 */
export const signOut = async (): Promise<{ error: string | null }> => {
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('Error signing out:', error);
    return { error: error.message };
  }

  return { error: null };
};

/**
 * Get the current user
 */
export const getCurrentUser = async (): Promise<{ user: UserProfile | null; error: string | null }> => {
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    console.error('Error getting current user:', error);
    return { user: null, error: error.message };
  }

  if (!data.user) {
    return { user: null, error: 'No user is currently signed in' };
  }

  return {
    user: {
      id: data.user.id,
      email: data.user.email as string,
      email_verified: data.user.email_confirmed_at ? true : false,
    },
    error: null,
  };
};

/**
 * Send password reset email
 */
export const resetPassword = async (email: string): Promise<{ error: string | null }> => {
  const { error } = await supabase.auth.resetPasswordForEmail(email);

  if (error) {
    console.error('Error sending password reset email:', error);
    return { error: error.message };
  }

  return { error: null };
};

/**
 * Update user password
 */
export const updatePassword = async (password: string): Promise<{ error: string | null }> => {
  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    console.error('Error updating password:', error);
    return { error: error.message };
  }

  return { error: null };
};

/**
 * Update user profile
 */
export const updateProfile = async (
  userId: string,
  updates: { name?: string; avatar?: string }
): Promise<{ user: UserProfile | null; error: string | null }> => {
  // Get current user
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    console.error('Error getting current user:', userError);
    return { user: null, error: userError?.message || 'User not found' };
  }

  if (userData.user.id !== userId) {
    return { user: null, error: 'Unauthorized: You can only update your own profile' };
  }

  // Update user metadata
  const { data, error } = await supabase.auth.updateUser({
    data: updates,
  });

  if (error) {
    console.error('Error updating profile:', error);
    return { user: null, error: error.message };
  }

  return {
    user: {
      id: data.user.id,
      email: data.user.email as string,
      name: data.user.user_metadata?.name,
      avatar: data.user.user_metadata?.avatar,
      email_verified: data.user.email_confirmed_at ? true : false,
    },
    error: null,
  };
}; 
'use server';

import { createClient } from '@/lib/supabase/server';
import { LoginFormData, RegisterFormData } from '../types';

/**
 * Authenticates a user with their email and password
 * 
 * This function handles the authentication process by validating credentials
 * against Supabase authentication. It's used in the login form to authenticate
 * users and establish a session.
 * 
 * @param data - Object containing user email and password
 * @returns Object with error message or null on success
 */
export async function login(data: LoginFormData) {
  // Initialize Supabase client for server-side operations
  const supabase = await createClient();

  // Attempt to sign in with provided credentials
  const { error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  });

  // Return error message if authentication fails
  if (error) {
    return { error: error.message };
  }

  // Success: no error
  return { error: null };
}

/**
 * Registers a new user with email, password, and name
 * 
 * This function creates a new user account in Supabase authentication system.
 * It stores the user's name as metadata in the user profile. After successful
 * registration, the user will need to verify their email (depending on Supabase settings).
 * 
 * @param data - Object containing user registration information (name, email, password)
 * @returns Object with error message or null on success
 */
export async function register(data: RegisterFormData) {
  // Initialize Supabase client for server-side operations
  const supabase = await createClient();

  // Attempt to create a new user account
  const { error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        // Store user's name in metadata for profile information
        name: data.name,
      },
    },
  });

  // Return error message if registration fails
  if (error) {
    return { error: error.message };
  }

  // Success: no error
  return { error: null };
}

/**
 * Signs out the currently authenticated user
 * 
 * This function terminates the user's session by signing them out through
 * the Supabase authentication system. It removes all session data and tokens.
 * 
 * @returns Object with error message or null on success
 */
export async function logout() {
  // Initialize Supabase client for server-side operations
  const supabase = await createClient();
  
  // Attempt to sign out the current user
  const { error } = await supabase.auth.signOut();
  
  // Return error message if logout fails
  if (error) {
    return { error: error.message };
  }
  
  // Success: no error
  return { error: null };
}

/**
 * Retrieves the currently authenticated user's information
 * 
 * This function fetches the current user's data from the Supabase session.
 * It's used to check authentication status and get user details for
 * personalized content and access control.
 * 
 * @returns The current user object or null if not authenticated
 */
export async function getCurrentUser() {
  // Initialize Supabase client for server-side operations
  const supabase = await createClient();
  
  // Get the current user from the session
  const { data } = await supabase.auth.getUser();
  
  // Return the user object (will be null if not authenticated)
  return data.user;
}

/**
 * Retrieves the current authentication session
 * 
 * This function gets the active session data from Supabase, which includes
 * authentication tokens and expiration information. It's used to verify
 * authentication status and manage session lifecycle.
 * 
 * @returns The current session object or null if no active session
 */
export async function getSession() {
  // Initialize Supabase client for server-side operations
  const supabase = await createClient();
  
  // Get the current session data
  const { data } = await supabase.auth.getSession();
  
  // Return the session object (will be null if no active session)
  return data.session;
}

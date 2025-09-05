/**
 * CSRF Protection Module
 * 
 * This module provides Cross-Site Request Forgery (CSRF) protection for the application.
 * It generates, validates, and manages CSRF tokens to prevent CSRF attacks.
 */

import { createHash, randomBytes } from 'crypto';
import { cookies } from 'next/headers';

// Constants for CSRF protection
const CSRF_COOKIE_NAME = 'csrf_token';
const CSRF_HEADER_NAME = 'X-CSRF-Token';
const CSRF_FORM_FIELD = 'csrf_token';
const TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Generates a secure random token for CSRF protection
 * @returns A secure random token string
 */
export function generateCSRFToken(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Creates a hash of the token for verification
 * @param token The raw CSRF token
 * @returns Hashed token
 */
export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/**
 * Sets a CSRF token in cookies
 */
export function setCSRFToken(): string {
  const cookieStore = cookies();
  const token = generateCSRFToken();
  const hashedToken = hashToken(token);
  
  // Set the hashed token in a cookie
  cookieStore.set({
    name: CSRF_COOKIE_NAME,
    value: hashedToken,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: TOKEN_EXPIRY / 1000, // Convert to seconds for cookie
  });
  
  return token;
}

/**
 * Validates a CSRF token against the stored token
 * @param token The token to validate
 * @returns Boolean indicating if the token is valid
 */
export function validateCSRFToken(token: string): boolean {
  const cookieStore = cookies();
  const storedToken = cookieStore.get(CSRF_COOKIE_NAME)?.value;
  
  if (!storedToken || !token) {
    return false;
  }
  
  // Hash the provided token and compare with stored token
  const hashedToken = hashToken(token);
  return hashedToken === storedToken;
}

/**
 * Gets the current CSRF token or generates a new one
 * @returns The current CSRF token
 */
export function getCSRFToken(): string {
  return setCSRFToken(); // Always generate a new token for security
}

/**
 * Middleware to protect against CSRF attacks
 * @param request The incoming request
 * @returns Boolean indicating if the request is safe
 */
export function csrfProtection(request: Request): boolean {
  // Skip CSRF check for GET, HEAD, OPTIONS requests
  const safeMethod = /^(GET|HEAD|OPTIONS)$/i.test(request.method);
  if (safeMethod) {
    return true;
  }
  
  // For other methods, validate the CSRF token
  const token = request.headers.get(CSRF_HEADER_NAME);
  return token ? validateCSRFToken(token) : false;
}

/**
 * Constants for use in components and forms
 */
export const CSRF = {
  FIELD_NAME: CSRF_FORM_FIELD,
  HEADER_NAME: CSRF_HEADER_NAME,
};
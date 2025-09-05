/**
 * CSRF Token API Route
 * 
 * This API endpoint generates and provides CSRF tokens for client-side forms.
 * It sets a secure HTTP-only cookie with a hashed version of the token and
 * returns the raw token to be included in form submissions.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCSRFToken } from '@/lib/csrf-protection';

/**
 * GET handler for CSRF token requests
 * 
 * Generates a new CSRF token, sets it in a secure cookie, and returns
 * the raw token to the client for form submissions.
 */
export async function GET(request: NextRequest) {
  // Generate a new CSRF token and set it in cookies
  const token = getCSRFToken();
  
  // Return the raw token to the client
  return NextResponse.json({ csrfToken: token });
}